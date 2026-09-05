/// <reference path="../../types.d.ts" />
// @ts-ignore Deno resolves this remote module when the Edge Function runs.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const roomPrices: Record<string, number> = {
  cottage: 180,
  suite: 250,
  villa: 380
};

const excursionPrices: Record<string, number> = {
  none: 0,
  cocoa: 35,
  mungu: 55,
  batwa: 40,
  sempaya: 45,
  semuliki: 75,
  ultimate: 140
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function pesapalBaseUrl() {
  return Deno.env.get('PESAPAL_ENV') === 'production'
    ? 'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3';
}

async function getPesapalToken() {
  const consumerKey = Deno.env.get('PESAPAL_CONSUMER_KEY');
  const consumerSecret = Deno.env.get('PESAPAL_CONSUMER_SECRET');
  if (!consumerKey || !consumerSecret) throw new Error('Pesapal credentials are not configured');

  const response = await fetch(`${pesapalBaseUrl()}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret })
  });
  if (!response.ok) throw new Error('Pesapal authentication failed');
  const data = await response.json();
  if (!data.token) throw new Error('Pesapal did not return an access token');
  return data.token as string;
}

function calculatePricing(booking: Record<string, unknown>) {
  const checkIn = new Date(`${booking.check_in}T00:00:00Z`);
  const checkOut = new Date(`${booking.check_out}T00:00:00Z`);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000);
  const room = roomPrices[String(booking.suite)];
  const excursion = excursionPrices[String(booking.excursion || 'none')];
  const exchangeRate = Number(Deno.env.get('USD_TO_UGX') || '3700');

  if (!room || excursion === undefined || !Number.isInteger(nights) || nights < 1) {
    throw new Error('Invalid booking pricing data');
  }
  const totalUsd = (room * nights) + (excursion * Number(booking.guests || 1));
  return { nights, totalUsd, amountUgx: Math.round(totalUsd * exchangeRate) };
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const input = await request.json();
    const { booking_id: bookingId, email } = input;
    if (typeof email !== 'string') return json({ error: 'email is required' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    let booking;
    if (typeof bookingId === 'string') {
      const result = await admin
        .from('bookings')
        .select('id, full_name, email, phone, suite, check_in, check_out, guests, excursion')
        .eq('id', bookingId)
        .ilike('email', email.trim())
        .single();
      if (result.error || !result.data) return json({ error: 'Booking not found' }, 404);
      booking = result.data;
    } else {
      const required = ['full_name', 'phone', 'suite', 'check_in', 'check_out'];
      if (required.some((field) => typeof input[field] !== 'string')) {
        return json({ error: 'Complete booking details are required' }, 400);
      }
      const guests = Number(input.guests || 1);
      if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
        return json({ error: 'Invalid guest count' }, 400);
      }
      const inserted = await admin.from('bookings').insert({
        full_name: input.full_name.trim(),
        email: email.trim(),
        phone: input.phone.trim(),
        suite: input.suite,
        check_in: input.check_in,
        check_out: input.check_out,
        guests,
        excursion: input.excursion || 'none',
        nights: 1,
        total_cost: 0
      }).select('id, full_name, email, phone, suite, check_in, check_out, guests, excursion').single();
      if (inserted.error || !inserted.data) throw new Error('Could not create booking');
      booking = inserted.data;
    }

    const requestedOptions = [String(booking.suite)];
    if (booking.excursion && booking.excursion !== 'none') requestedOptions.push(String(booking.excursion));
    const { data: availableOptions, error: availabilityError } = await admin
      .from('availability')
      .select('option_key, is_available')
      .in('option_key', requestedOptions);
    if (availabilityError) throw new Error('Availability settings could not be checked');

    const unavailable = new Set(
      (availableOptions || []).filter(option => !option.is_available).map(option => option.option_key)
    );
    if (unavailable.has(String(booking.suite))) throw new Error('The selected room is currently unavailable');
    if (booking.excursion && unavailable.has(String(booking.excursion))) throw new Error('The selected activity is currently unavailable');

    const { nights, totalUsd, amountUgx } = calculatePricing(booking);
    await admin.from('bookings').update({ nights, total_cost: totalUsd }).eq('id', booking.id);
    const merchantReference = `KYAMBU-${booking.id}-${crypto.randomUUID().slice(0, 8)}`;
    const token = await getPesapalToken();
    const callbackUrl = Deno.env.get('PESAPAL_CALLBACK_URL');
    const notificationId = Deno.env.get('PESAPAL_IPN_ID');
    if (!callbackUrl || !notificationId) throw new Error('Pesapal callback settings are not configured');

    const { error: paymentError } = await admin.from('payments').insert({
      booking_id: booking.id,
      merchant_reference: merchantReference,
      amount_ugx: amountUgx,
      status: 'initiated'
    });
    if (paymentError) throw new Error('Could not create payment record');

    const orderResponse = await fetch(`${pesapalBaseUrl()}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        id: merchantReference,
        currency: 'UGX',
        amount: amountUgx,
        description: `Kyambu Resort booking ${booking.id}`,
        callback_url: callbackUrl,
        notification_id: notificationId,
        billing_address: {
          email_address: booking.email,
          phone_number: booking.phone,
          first_name: String(booking.full_name).split(' ')[0],
          last_name: String(booking.full_name).split(' ').slice(1).join(' ') || 'Guest'
        }
      })
    });

    const order = await orderResponse.json();
    if (!orderResponse.ok || !order.order_tracking_id || !order.redirect_url) {
      throw new Error('Pesapal order creation failed');
    }

    await admin.from('payments').update({
      order_tracking_id: order.order_tracking_id,
      status: 'pending',
      updated_at: new Date().toISOString()
    }).eq('merchant_reference', merchantReference);

    await admin.from('bookings').update({ payment_status: 'pending' }).eq('id', booking.id);
    return json({ redirect_url: order.redirect_url, amount_ugx: amountUgx });
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : 'Payment setup failed' }, 500);
  }
});
