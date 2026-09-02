// @ts-nocheck Supabase Edge Functions are checked by the Deno runtime during deployment.
/// <reference path="../../types.d.ts" />
// @ts-expect-error Deno resolves this remote module when the Edge Function runs.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

function pesapalBaseUrl() {
  return Deno.env.get('PESAPAL_ENV') === 'production'
    ? 'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3';
}

async function getPesapalToken() {
  const response = await fetch(`${pesapalBaseUrl()}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      consumer_key: Deno.env.get('PESAPAL_CONSUMER_KEY'),
      consumer_secret: Deno.env.get('PESAPAL_CONSUMER_SECRET')
    })
  });
  if (!response.ok) throw new Error('Pesapal authentication failed');
  const data = await response.json();
  if (!data.token) throw new Error('Pesapal did not return an access token');
  return data.token as string;
}

function responseBody(orderTrackingId: string, notificationId: string, status = 200) {
  return new Response(JSON.stringify({
    orderNotificationId: notificationId,
    orderTrackingId,
    status
  }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const url = new URL(request.url);
    const body = request.method === 'POST' ? await request.json().catch(() => ({})) : {};
    const orderTrackingId = String(url.searchParams.get('OrderTrackingId') || body.OrderTrackingId || '');
    const notificationId = String(url.searchParams.get('OrderNotificationId') || body.OrderNotificationId || '');
    if (!orderTrackingId || !notificationId) return responseBody(orderTrackingId, notificationId, 400);

    const token = await getPesapalToken();
    const statusResponse = await fetch(
      `${pesapalBaseUrl()}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    );
    if (!statusResponse.ok) throw new Error('Could not verify Pesapal transaction');
    const transaction = await statusResponse.json();
    const statusCode = Number(transaction.status_code);
    const status = statusCode === 1 ? 'completed' : statusCode === 2 ? 'failed' : statusCode === 3 ? 'reversed' : 'pending';

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: payment } = await admin
      .from('payments')
      .select('booking_id')
      .eq('order_tracking_id', orderTrackingId)
      .single();
    if (!payment) return responseBody(orderTrackingId, notificationId);

    await admin.from('payments').update({
      status,
      payment_method: transaction.payment_method || null,
      pesapal_status_code: statusCode,
      updated_at: new Date().toISOString()
    }).eq('order_tracking_id', orderTrackingId);

    const bookingPaymentStatus = status === 'completed' ? 'paid' : status === 'failed' ? 'failed' : status === 'reversed' ? 'refunded' : 'pending';
    await admin.from('bookings').update({ payment_status: bookingPaymentStatus }).eq('id', payment.booking_id);
    return responseBody(orderTrackingId, notificationId);
  } catch (error) {
    console.error(error);
    return responseBody('', '', 500);
  }
});
