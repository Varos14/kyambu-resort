/* ==========================================================================
   Kyambu Resort Interactive Logic — Improved Edition
   ========================================================================== */
import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  setDefaultDates();
  initNavbarScroll();
  initActiveNavLinks();
  initMobileMenu();
  initAmbientAudio();
  initMenuTabs();
  initBookingEngine();
  initRoomModals();
  initExcursionModals();
  initHeroSearch();
  initScrollAnimations();
  initBackToTop();
  initFavourites();
  initCocoaBlender();
  initGearModal();
});

/* -------------------------------------------------------------------------- */
/* Set Default Dates (today + 3 days)                                         */
/* -------------------------------------------------------------------------- */
function setDefaultDates() {
  const today = new Date();
  const checkOut = new Date(today);
  checkOut.setDate(today.getDate() + 3);

  const fmt = d => d.toISOString().split('T')[0];

  ['heroCheckIn', 'modalCheckIn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.min = fmt(today); el.value = fmt(today); }
  });

  ['heroCheckOut', 'modalCheckOut'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const minD = new Date(today);
      minD.setDate(today.getDate() + 1);
      el.min = fmt(minD);
      el.value = fmt(checkOut);
    }
  });
}

/* -------------------------------------------------------------------------- */
/* Toast Notification                                                          */
/* -------------------------------------------------------------------------- */
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toastNotif');
  const msgEl = document.getElementById('toastMsg');
  if (!toast || !msgEl) return;
  msgEl.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/* -------------------------------------------------------------------------- */
/* Navbar Scroll Effect                                                        */
/* -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

/* -------------------------------------------------------------------------- */
/* Active Nav Link via IntersectionObserver                                   */
/* -------------------------------------------------------------------------- */
function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(sec => observer.observe(sec));
}

/* -------------------------------------------------------------------------- */
/* Mobile Menu Toggle — animated hamburger ↔ X                               */
/* -------------------------------------------------------------------------- */
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const isOpen = links.classList.contains('mobile-open');
    links.classList.toggle('mobile-open', !isOpen);
    btn.classList.toggle('open', !isOpen);
    btn.setAttribute('aria-expanded', String(!isOpen));
  });

  // Close when a link is clicked
  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('mobile-open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Scroll Entrance Animations (IntersectionObserver)                          */
/* -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const animEls = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('animated'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  animEls.forEach(el => observer.observe(el));
}

/* -------------------------------------------------------------------------- */
/* Back to Top Button                                                          */
/* -------------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* -------------------------------------------------------------------------- */
/* Ambient Rainforest Web Audio + Volume Slider                               */
/* -------------------------------------------------------------------------- */
let audioCtx = null;
let isAudioPlaying = false;
let noiseNode = null;
let gainNode = null;
let birdGainNode = null;

function initAmbientAudio() {
  const toggleBtn = document.getElementById('audioToggleBtn');
  const label = document.getElementById('audioLabel');
  const volumeSlider = document.getElementById('volumeSlider');

  toggleBtn.addEventListener('click', (e) => {
    // Prevent slider interaction from toggling
    if (e.target === volumeSlider) return;

    if (!isAudioPlaying) {
      startRainforestAudio();
      toggleBtn.classList.add('playing');
      label.textContent = 'Rainforest Ambient On';
      isAudioPlaying = true;
      showToast('🌿 Rainforest soundscape enabled — adjust volume with the slider');
    } else {
      stopRainforestAudio();
      toggleBtn.classList.remove('playing');
      label.textContent = 'Rainforest Ambient Off';
      isAudioPlaying = false;
    }
  });

  if (volumeSlider) {
    volumeSlider.addEventListener('input', () => {
      const vol = parseInt(volumeSlider.value) / 100;
      if (gainNode && audioCtx) {
        gainNode.gain.setTargetAtTime(vol * 0.15, audioCtx.currentTime, 0.1);
      }
      if (birdGainNode && audioCtx) {
        birdGainNode.gain.setTargetAtTime(vol * 0.04, audioCtx.currentTime, 0.1);
      }
    });
  }
}

function startRainforestAudio() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    // ── Pink noise (wind / leaves) ──────────────────────────────
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.015;
      b6 = white * 0.115926;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 2);

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noiseNode.start();

    // ── Bird chirp layer ─────────────────────────────────────────
    birdGainNode = audioCtx.createGain();
    birdGainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    birdGainNode.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 3);
    birdGainNode.connect(audioCtx.destination);

    scheduleBirdChirps();
  } catch (e) {
    console.log('Audio init error:', e);
  }
}

function scheduleBirdChirps() {
  if (!audioCtx || !birdGainNode) return;

  const chirp = () => {
    if (!isAudioPlaying || !audioCtx) return;

    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    const freq = 1800 + Math.random() * 1200;
    const chirpDur = 0.06 + Math.random() * 0.08;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.4, audioCtx.currentTime + chirpDur / 2);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.85, audioCtx.currentTime + chirpDur);

    env.gain.setValueAtTime(0, audioCtx.currentTime);
    env.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.01);
    env.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + chirpDur);

    osc.connect(env);
    env.connect(birdGainNode);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + chirpDur + 0.05);

    const nextChirp = 1500 + Math.random() * 4000;
    setTimeout(chirp, nextChirp);
  };

  setTimeout(chirp, 2000 + Math.random() * 2000);
}

function stopRainforestAudio() {
  if (gainNode && audioCtx) {
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
    if (birdGainNode) birdGainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
    setTimeout(() => {
      if (noiseNode) noiseNode.stop();
      if (audioCtx) audioCtx.close();
      audioCtx = null;
      gainNode = null;
      birdGainNode = null;
      noiseNode = null;
    }, 1100);
  }
}

/* -------------------------------------------------------------------------- */
/* Favourites (localStorage)                                                  */
/* -------------------------------------------------------------------------- */
function initFavourites() {
  const favBtns = document.querySelectorAll('.room-fav-btn');
  let favs = JSON.parse(localStorage.getItem('kyambu_favs') || '[]');

  // Restore state
  favBtns.forEach(btn => {
    if (favs.includes(btn.dataset.room)) {
      btn.classList.add('favourited');
      btn.textContent = '♥';
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const room = btn.dataset.room;
      const isFav = btn.classList.contains('favourited');

      btn.classList.remove('pop');
      void btn.offsetWidth; // reflow to restart animation
      btn.classList.add('pop');

      if (isFav) {
        btn.classList.remove('favourited');
        btn.textContent = '♡';
        favs = favs.filter(r => r !== room);
        showToast(`Removed from favourites`);
      } else {
        btn.classList.add('favourited');
        btn.textContent = '♥';
        favs.push(room);
        showToast(`❤️ Saved to your favourites!`);
      }

      localStorage.setItem('kyambu_favs', JSON.stringify(favs));
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Restaurant Menu Tabs — animated                                            */
/* -------------------------------------------------------------------------- */
function initMenuTabs() {
  const tabs = document.querySelectorAll('.menu-tab');
  const panels = document.querySelectorAll('.menu-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = `menu-${tab.dataset.tab}`;
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Dynamic Booking Engine & Price Calculator                                  */
/* -------------------------------------------------------------------------- */
const ROOM_PRICES = {
  cottage: { name: 'Luxury Canopy Cottage', price: 180, img: '/images/cottage.png' },
  suite:   { name: 'Deluxe Safari Suite',   price: 250, img: '/images/suite.png'   },
  villa:   { name: 'Executive Eco-Villa',   price: 380, img: '/images/hero.png'    }
};

const EXCURSION_PRICES = {
  none:     { name: 'None', price: 0 },
  cocoa:    { name: 'Bundibugyo Cocoa Farm-to-Cup Workshop', price: 35 },
  mungu:    { name: 'Mungu Ni Mukubwa Mountain Hike', price: 55 },
  batwa:    { name: 'Batwa Cultural Immersion', price: 40 },
  sempaya:  { name: 'Sempaya Hot Springs Geothermal Walk', price: 45 },
  semuliki: { name: 'Semuliki Wildlife & Primate Safari', price: 75 },
  ultimate: { name: 'Ultimate Explorer Pass (All Excursions)', price: 140 }
};

function initBookingEngine() {
  const bookingModal = document.getElementById('bookingModal');
  const closeBtn    = document.getElementById('closeBookingModal');
  const openBtns    = [
    document.getElementById('openBookingHeaderBtn'),
    document.getElementById('openBookingCtaBtn'),
    document.getElementById('openTableModalBtn')
  ];

  openBtns.forEach(btn => {
    if (btn) btn.addEventListener('click', () => openBookingModal());
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      bookingModal.classList.remove('active');
      resetBookingForm();
    });
  }

  // Close on overlay click
  bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
      bookingModal.classList.remove('active');
      resetBookingForm();
    }
  });

  // Dynamic price calculation
  const calcInputs = ['modalCheckIn', 'modalCheckOut', 'modalSuite', 'modalGuests', 'modalExcursion'];
  calcInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => {
      syncCheckOutMin();
      animatePriceUpdate();
    });
  });

  // Date guard: push check-out if check-in >= check-out
  const checkInEl = document.getElementById('modalCheckIn');
  if (checkInEl) {
    checkInEl.addEventListener('change', syncCheckOutMin);
  }

  // WhatsApp
  const waBtn = document.getElementById('submitWhatsappBtn');
  if (waBtn) waBtn.addEventListener('click', submitWhatsAppInquiry);

  // Email form submit
  const form = document.getElementById('bookingForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateBookingForm()) return;
      showBookingSuccess();
    });
  }

  // Success close
  const successCloseBtn = document.getElementById('successCloseBtn');
  if (successCloseBtn) {
    successCloseBtn.addEventListener('click', () => {
      bookingModal.classList.remove('active');
      resetBookingForm();
    });
  }
}

function openBookingModal(roomKey = null) {
  const bookingModal = document.getElementById('bookingModal');
  if (roomKey) document.getElementById('modalSuite').value = roomKey;
  resetBookingForm();
  calculatePrice();
  bookingModal.classList.add('active');
}

function syncCheckOutMin() {
  const inVal = document.getElementById('modalCheckIn').value;
  const outEl = document.getElementById('modalCheckOut');
  if (!inVal || !outEl) return;

  const inDate = new Date(inVal);
  const nextDay = new Date(inDate);
  nextDay.setDate(inDate.getDate() + 1);
  const fmt = d => d.toISOString().split('T')[0];
  outEl.min = fmt(nextDay);

  if (outEl.value && new Date(outEl.value) <= inDate) {
    outEl.value = fmt(nextDay);
  }
  calculatePrice();
}

function validateBookingForm() {
  let valid = true;

  const fields = [
    { id: 'modalFullName', errId: 'errName',    msg: 'Please enter your full name.' },
    { id: 'modalEmail',    errId: 'errEmail',   msg: 'Please enter a valid email address.' },
    { id: 'modalPhone',    errId: 'errPhone',   msg: 'Please enter your phone number.' },
    { id: 'modalCheckIn',  errId: 'errCheckIn', msg: 'Please select a check-in date.' },
    { id: 'modalCheckOut', errId: 'errCheckOut',msg: 'Please select a check-out date.' },
  ];

  fields.forEach(({ id, errId, msg }) => {
    const el   = document.getElementById(id);
    const errEl = document.getElementById(errId);
    if (el && errEl) {
      const isEmpty = !el.value.trim();
      el.classList.toggle('invalid', isEmpty);
      errEl.textContent = msg;
      errEl.classList.toggle('show', isEmpty);
      if (isEmpty) valid = false;
    }
  });

  // Check out must be after check-in
  const inVal  = document.getElementById('modalCheckIn').value;
  const outVal = document.getElementById('modalCheckOut').value;
  const outErrEl = document.getElementById('errCheckOut');
  if (inVal && outVal && new Date(outVal) <= new Date(inVal)) {
    document.getElementById('modalCheckOut').classList.add('invalid');
    if (outErrEl) { outErrEl.textContent = 'Check-out must be after check-in.'; outErrEl.classList.add('show'); }
    valid = false;
  }

  return valid;
}

function resetBookingForm() {
  // Hide success, show form
  const success = document.getElementById('bookingSuccess');
  const form = document.getElementById('bookingForm');
  if (success) success.classList.remove('show');
  if (form) form.style.display = '';

  // Clear validation state
  document.querySelectorAll('#bookingForm .invalid').forEach(el => el.classList.remove('invalid'));
  document.querySelectorAll('#bookingForm .field-error.show').forEach(el => el.classList.remove('show'));
}

async function showBookingSuccess() {
  const form = document.getElementById('bookingForm');
  const success = document.getElementById('bookingSuccess');
  const summaryEl = document.getElementById('successSummary');
  if (!success || !form) return;

  const name      = document.getElementById('modalFullName').value;
  const email     = document.getElementById('modalEmail').value;
  const phone     = document.getElementById('modalPhone').value;
  const suiteKey  = document.getElementById('modalSuite').value;
  const checkIn   = document.getElementById('modalCheckIn').value;
  const checkOut  = document.getElementById('modalCheckOut').value;
  const guests    = parseInt(document.getElementById('modalGuests').value);
  const excursion = document.getElementById('modalExcursion').value;
  const { nights, totalCost } = calculatePrice();
  const suiteName = ROOM_PRICES[suiteKey]?.name || '';

  // Persist to Supabase (non-blocking)
  saveBookingToSupabase({
    full_name: name, email, phone,
    suite: suiteKey, check_in: checkIn, check_out: checkOut,
    guests, excursion, nights, total_cost: totalCost
  });

  if (summaryEl) {
    summaryEl.innerHTML = `
      <strong>Guest:</strong> ${name}<br/>
      <strong>Email:</strong> ${email}<br/>
      <strong>Phone:</strong> ${phone}<br/>
      <strong>Suite:</strong> ${suiteName}<br/>
      <strong>Dates:</strong> ${checkIn} → ${checkOut} (${nights} night${nights > 1 ? 's' : ''})<br/>
      <strong>Guests:</strong> ${guests}<br/>
      <strong>Estimated Total:</strong> <span style="color:var(--color-gold);font-weight:700;">$${totalCost} USD</span>
    `;
  }

  form.style.display = 'none';
  success.classList.add('show');
}

let prevTotal = 0;
function animatePriceUpdate() {
  calculatePrice();
  const totalEl = document.getElementById('calcTotalCost');
  const totalRow = totalEl?.closest('.total-row');
  if (!totalRow) return;
  totalRow.classList.remove('updated');
  void totalRow.offsetWidth;
  totalRow.classList.add('updated');
}

function calculatePrice() {
  const checkIn  = new Date(document.getElementById('modalCheckIn').value);
  const checkOut = new Date(document.getElementById('modalCheckOut').value);
  const suiteKey = document.getElementById('modalSuite').value;
  const guests   = parseInt(document.getElementById('modalGuests').value) || 1;
  const expKey   = document.getElementById('modalExcursion').value;

  let nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  if (isNaN(nights) || nights < 1) nights = 1;

  const roomPrice        = ROOM_PRICES[suiteKey]?.price || 180;
  const expPricePerGuest = EXCURSION_PRICES[expKey]?.price || 0;
  const accCost          = roomPrice * nights;
  const expCost          = expPricePerGuest * guests;
  const totalCost        = accCost + expCost;

  document.getElementById('calcNights').textContent   = `${nights} Night${nights > 1 ? 's' : ''}`;
  document.getElementById('calcAccCost').textContent  = `$${accCost} USD`;
  document.getElementById('calcExpCost').textContent  = `$${expCost} USD`;
  document.getElementById('calcTotalCost').textContent = `$${totalCost} USD`;

  return { nights, roomPrice, accCost, expCost, totalCost };
}

function submitWhatsAppInquiry() {
  if (!validateBookingForm()) return;

  const name     = document.getElementById('modalFullName').value;
  const email    = document.getElementById('modalEmail').value;
  const phone    = document.getElementById('modalPhone').value;
  const suiteKey = document.getElementById('modalSuite').value;
  const checkIn  = document.getElementById('modalCheckIn').value;
  const checkOut = document.getElementById('modalCheckOut').value;
  const guests   = parseInt(document.getElementById('modalGuests').value);
  const expKey   = document.getElementById('modalExcursion').value;
  const { nights, totalCost } = calculatePrice();

  // Persist to Supabase (non-blocking)
  saveBookingToSupabase({
    full_name: name, email, phone,
    suite: suiteKey, check_in: checkIn, check_out: checkOut,
    guests, excursion: expKey, nights, total_cost: totalCost
  });

  const suiteName = ROOM_PRICES[suiteKey]?.name;
  const expName   = EXCURSION_PRICES[expKey]?.name;

  const message =
    `Hello Kyambu Resort! 🌿%0A` +
    `I would like to inquire about a booking reservation:%0A%0A` +
    `*Guest Name:* ${encodeURIComponent(name)}%0A` +
    `*Phone/WhatsApp:* ${encodeURIComponent(phone)}%0A` +
    `*Email:* ${encodeURIComponent(email)}%0A` +
    `*Suite:* ${encodeURIComponent(suiteName)}%0A` +
    `*Dates:* ${checkIn} to ${checkOut} (${nights} nights)%0A` +
    `*Guests:* ${guests} guest(s)%0A` +
    `*Add-On Excursion:* ${encodeURIComponent(expName)}%0A` +
    `*Estimated Total:* $${totalCost} USD%0A%0A` +
    `Please confirm availability!`;

  window.open(`https://wa.me/256770000000?text=${message}`, '_blank');
}

/* -------------------------------------------------------------------------- */
/* Supabase — Persist Booking Inquiry                                         */
/* -------------------------------------------------------------------------- */
async function saveBookingToSupabase(data) {
  try {
    const { error } = await supabase.from('bookings').insert([data]);
    if (error) console.warn('[Kyambu] Booking save error:', error.message);
    else console.log('[Kyambu] Booking saved to Supabase ✓');
  } catch (e) {
    console.warn('[Kyambu] Supabase unavailable:', e.message);
  }
}

/* -------------------------------------------------------------------------- */
/* Room Modals Showcase                                                       */
/* -------------------------------------------------------------------------- */
const ROOM_DETAILS = {
  cottage: {
    title: 'Luxury Canopy Cottage',
    price: '$180 / night',
    img: '/images/cottage.png',
    desc: 'Perched high in the lush Semuliki tree canopy, the Luxury Canopy Cottage is an architectural masterpiece of native timber and panoramic glass walls. Enjoy morning birdsong and natural cool mountain breezes.',
    amenities: [
      'King bed with premium organic cotton linens',
      'Private 20 m² canopy observation deck',
      'En-suite open-air rainwater monsoon shower',
      'Artisan local coffee machine & herbal teas',
      'Solar-powered warm water & high-speed Wi-Fi',
      'Complimentary Sempaya welcome cocktail'
    ]
  },
  suite: {
    title: 'Deluxe Safari Suite',
    price: '$250 / night',
    img: '/images/suite.png',
    desc: 'Spacious and elegant, the Deluxe Safari Suite features a handcrafted wooden soaking tub overlooking the Albertine Rift Valley, a comfortable living salon, and private butler service.',
    amenities: [
      'Custom teak king bed & cozy lounge armchairs',
      'Outdoor copper soak tub with volcanic spring salts',
      'Dedicated personal concierge & safari guide liaison',
      'Complimentary organic fruit basket & minibar',
      'Spacious bathroom with double vanity sinks',
      'Panoramic sunset orientation'
    ]
  },
  villa: {
    title: 'Executive Eco-Villa',
    price: '$380 / night',
    img: '/images/hero.png',
    desc: 'The ultimate private sanctuary for families or VIP travelers. Features two separate en-suite master bedrooms, a spacious central living hall, private sun deck, outdoor fire pit, and personal chef availability.',
    amenities: [
      'Two master bedroom suites with king-size beds',
      'Expansive private terrace with evening fire pit',
      'Full dining salon & optional private chef service',
      'Dedicated 4WD resort shuttle for excursions',
      'Private wine cellar selection & bar',
      'Unrestricted 360° rainforest vistas'
    ]
  }
};

function initRoomModals() {
  const roomModal = document.getElementById('roomModal');
  const closeBtn  = document.getElementById('closeRoomModal');
  const bookBtn   = document.getElementById('roomModalBookBtn');

  let currentSelectedRoom = 'cottage';

  function openRoomModal(roomKey) {
    const details = ROOM_DETAILS[roomKey];
    if (!details) return;
    currentSelectedRoom = roomKey;

    document.getElementById('roomModalImg').src         = details.img;
    document.getElementById('roomModalTitle').textContent = details.title;
    document.getElementById('roomModalPrice').textContent = details.price;
    document.getElementById('roomModalDesc').textContent  = details.desc;

    const listEl = document.getElementById('roomModalList');
    listEl.innerHTML = details.amenities.map(a => `<li>🌿 ${a}</li>`).join('');

    roomModal.classList.add('active');
  }

  // "Explore Suite" buttons
  document.querySelectorAll('.view-room-btn').forEach(btn => {
    btn.addEventListener('click', () => openRoomModal(btn.dataset.room));
  });

  // Quick View overlays
  document.querySelectorAll('.room-quick-view').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      openRoomModal(overlay.dataset.room);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => roomModal.classList.remove('active'));
  }

  roomModal.addEventListener('click', (e) => {
    if (e.target === roomModal) roomModal.classList.remove('active');
  });

  if (bookBtn) {
    bookBtn.addEventListener('click', () => {
      roomModal.classList.remove('active');
      openBookingModal(currentSelectedRoom);
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Excursion Detail Modals                                                    */
/* -------------------------------------------------------------------------- */
const EXCURSION_DETAILS = {
  cocoa: {
    title: 'Bundibugyo Cocoa Farm-to-Cup Workshop',
    subtitle: 'ORGANIC FARM & ARTISAN WORKSHOP',
    img: '/images/cocoa.jpg',
    duration: '3 Hours',
    type: 'Culinary & Craft Experience',
    difficulty: 'Easy',
    price: '$35',
    bookingKey: 'cocoa',
    desc: 'Explore Africa\'s cocoa capital! Walk through organic cocoa groves, learn traditional banana leaf fermentation, roast cocoa nibs over open wood fires, and stone-grind your own custom dark chocolate powder or beverage to take home.',
    highlights: [
      'Guided harvest walk through organic Bundibugyo cocoa estates',
      'Banana leaf fermentation and solar sun-drying process demo',
      'Wood-fired cocoa nib roasting & stone mortar grinding',
      'Custom spice blending session with Rwenzori vanilla & wild cardamom',
      'Take home your custom-crafted cocoa powder jar & gift recipe card',
      'Kyambu hot cocoa tasting session included'
    ]
  },
  mungu: {
    title: 'Mungu Ni Mukubwa Mountain Ridge Trek',
    subtitle: 'RWENZORI FOOTHILLS SUMMIT ADVENTURE',
    img: '/images/mungu.jpg',
    duration: '4 – 5 Hours',
    type: 'Mountain Hike & Viewpoint',
    difficulty: 'Moderate to Challenging',
    price: '$55',
    bookingKey: 'mungu',
    desc: 'Ascend to the breathtaking "God is Great" peak at 1,700m altitude. Enjoy legendary 360-degree views over the Albertine Rift Valley, the Semuliki Basin, the DRC border, and the snow-capped peaks of the Rwenzori range.',
    highlights: [
      'Ascend Mungu Ni Mukubwa peak (1,700m altitude)',
      '360° panoramic sunrise vista of Albertine Rift & Rwenzori peaks',
      'Glacial stream crossing and rainforest canopy walk',
      'Spot black-and-white colobus monkeys in bamboo thickets',
      'Mountain guide, trail trekking poles & safety gear included',
      'Summit hot tea & Bundibugyo dried fruit energy pack'
    ]
  },
  batwa: {
    title: 'Batwa Cultural Immersion of Bundibugyo',
    subtitle: 'INDIGENOUS HERITAGE ENCOUNTER',
    img: '/images/batwa.jpg',
    duration: '3 Hours',
    type: 'Cultural Heritage Tour',
    difficulty: 'Easy',
    price: '$40',
    bookingKey: 'batwa',
    desc: 'Connect with the original forest guardians of Semuliki. Experience authentic traditional music, sacred drumming, rainforest botanical herbalism, friction fire crafting, and handcraft workshops led by Batwa elders.',
    highlights: [
      'Traditional Batwa folk song, drum beat & dance performance',
      'Rainforest herbal medicine walk with community elders',
      'Demonstration of ancient friction fire crafting in seconds',
      'Hands-on bamboo basketry and wood carving workshop',
      '100% of excursion fee directly supports local Batwa families',
      'Complimentary handmade souvenir craft for every guest'
    ]
  },
  sempaya: {
    title: 'Sempaya Geothermal Thermal Walk',
    subtitle: 'GUIDED HOT SPRINGS EXCURSION',
    img: '/images/sempaya.png',
    duration: '3 – 4 Hours',
    type: 'Guided Walking Tour',
    difficulty: 'Easy to Moderate',
    price: '$45',
    bookingKey: 'sempaya',
    desc: 'Journey through the ancient lowland rainforest to the famous Sempaya Hot Springs — a UNESCO-listed natural marvel in Semuliki National Park. Marvel at two distinct thermal springs: the roaring "Nyasimbi" male spring and the serene "Nyamugaite" female spring, where water jets 2 meters into the air at over 100°C.',
    highlights: [
      'Visit both male (Nyasimbi) and female (Nyamugaite) hot springs',
      'Watch boiling thermal water erupt 2 metres high',
      'Traditional egg-boiling demonstration in geothermal spring',
      'Expert local naturalist guide throughout the walk',
      'Bird watching en route — 400+ species in the area',
      'Full transport from Kyambu Resort included'
    ]
  },
  semuliki: {
    title: 'Semuliki Wildlife & Primate Safari',
    subtitle: 'PRIMATE & BIRDING EXCURSION',
    img: '/images/hero.png',
    duration: 'Half Day / Full Day',
    type: 'Primate & Birding Safari',
    difficulty: 'Moderate',
    price: '$75',
    bookingKey: 'semuliki',
    desc: 'Trek deep into the Semuliki National Park, one of Africa\'s oldest and most biodiverse rainforests. This lowland equatorial habitat harbours species found nowhere else in East Africa, including Central African birds like the African piculet, nkulengu rail, and yellow-throated nicator.',
    highlights: [
      'Track De Brazza\'s monkeys, chimpanzees & colobus',
      'Spot forest elephants near the Semuliki River',
      'Dedicated UWA-certified primate tracking guide',
      '400+ bird species incl. rare Central African endemics',
      'Full-day option includes riverside picnic lunch',
      'Night safari option available on request'
    ]
  },
  ultimate: {
    title: 'Ultimate Explorer Pass (All Excursions Package)',
    subtitle: 'THE COMPLETE BUNDIBUGYO PASS',
    img: '/images/hero.png',
    duration: 'Multi-Day / Flexible',
    type: 'All-Inclusive Excursion Pass',
    difficulty: 'Varied',
    price: '$140',
    bookingKey: 'ultimate',
    desc: 'Experience the best of Western Uganda! Includes full access to the Cocoa Farm-to-Cup Workshop, Mungu Ni Mukubwa Ridge Trek, Batwa Cultural Immersion, and Sempaya Geothermal Springs Walk at a special discounted package price.',
    highlights: [
      'Includes Cocoa Farm-to-Cup Workshop ($35 value)',
      'Includes Mungu Ni Mukubwa Mountain Hike ($55 value)',
      'Includes Batwa Cultural Immersion ($40 value)',
      'Includes Sempaya Geothermal Hot Springs Walk ($45 value)',
      'Flexible scheduling over your entire stay at Kyambu Resort',
      'Save over $35 compared to booking excursions individually!'
    ]
  }
};

function initExcursionModals() {
  const modal   = document.getElementById('excursionModal');
  const closeBtn = document.getElementById('closeExcursionModal');
  const bookBtn  = document.getElementById('expModalBookBtn');

  let currentExpKey = 'sempaya';

  document.querySelectorAll('.open-exp-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const expKey = btn.dataset.exp;
      currentExpKey = expKey;
      const data = EXCURSION_DETAILS[expKey];
      if (!data) return;

      document.getElementById('expModalImg').src            = data.img;
      document.getElementById('expModalTitle').textContent  = data.title;
      document.getElementById('expModalSub').textContent    = data.subtitle;
      document.getElementById('expModalPrice').textContent  = data.price;
      document.getElementById('expModalDesc').textContent   = data.desc;

      const metaEl = document.getElementById('expModalMeta');
      metaEl.innerHTML = [
        `⏱️ ${data.duration}`,
        `🏷️ ${data.type}`,
        `🥾 ${data.difficulty}`
      ].map(t => `<span class="exp-meta-tag">${t}</span>`).join('');

      const listEl = document.getElementById('expModalList');
      listEl.innerHTML = data.highlights.map(h => `<li>🌿 ${h}</li>`).join('');

      modal.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  if (bookBtn) {
    bookBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      const data = EXCURSION_DETAILS[currentExpKey];
      const bookingModal = document.getElementById('bookingModal');
      const expSelect = document.getElementById('modalExcursion');
      if (expSelect && data) expSelect.value = data.bookingKey;
      calculatePrice();
      bookingModal.classList.add('active');
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Hero Search Action — date validation + shake                               */
/* -------------------------------------------------------------------------- */
function initHeroSearch() {
  const searchBtn  = document.getElementById('heroSearchBtn');
  const searchBar  = document.querySelector('.hero-search-bar');
  const heroCheckIn  = document.getElementById('heroCheckIn');
  const heroCheckOut = document.getElementById('heroCheckOut');

  if (!searchBtn) return;

  // Sync hero check-out min when hero check-in changes
  if (heroCheckIn) {
    heroCheckIn.addEventListener('change', () => {
      const inDate = new Date(heroCheckIn.value);
      const nextDay = new Date(inDate);
      nextDay.setDate(inDate.getDate() + 1);
      const fmt = d => d.toISOString().split('T')[0];
      if (heroCheckOut) {
        heroCheckOut.min = fmt(nextDay);
        if (heroCheckOut.value && new Date(heroCheckOut.value) <= inDate) {
          heroCheckOut.value = fmt(nextDay);
        }
      }
    });
  }

  searchBtn.addEventListener('click', () => {
    const inDate  = heroCheckIn?.value;
    const outDate = heroCheckOut?.value;
    const today   = new Date().toISOString().split('T')[0];

    let invalid = false;

    if (!inDate || inDate < today) {
      heroCheckIn?.classList.add('invalid');
      invalid = true;
    } else {
      heroCheckIn?.classList.remove('invalid');
    }

    if (!outDate || outDate <= inDate) {
      heroCheckOut?.classList.add('invalid');
      invalid = true;
    } else {
      heroCheckOut?.classList.remove('invalid');
    }

    if (invalid && searchBar) {
      searchBar.classList.remove('shake');
      void searchBar.offsetWidth;
      searchBar.classList.add('shake');
      searchBar.addEventListener('animationend', () => searchBar.classList.remove('shake'), { once: true });
      return;
    }

    // Pre-fill booking modal
    document.getElementById('modalCheckIn').value  = inDate;
    document.getElementById('modalCheckOut').value = outDate;
    document.getElementById('modalGuests').value   = document.getElementById('heroGuests').value;
    document.getElementById('modalSuite').value    = document.getElementById('heroSuiteType').value;

    syncCheckOutMin();
    calculatePrice();
    document.getElementById('bookingModal').classList.add('active');
  });
}

/* -------------------------------------------------------------------------- */
/* Interactive Cocoa Blender Logic                                             */
/* -------------------------------------------------------------------------- */
function initCocoaBlender() {
  const slider     = document.getElementById('cocoaSlider');
  const pctVal     = document.getElementById('cocoaPctVal');
  const titleEl    = document.getElementById('recipeTitle');
  const notesEl    = document.getElementById('recipeNotes');
  const prepEl     = document.getElementById('recipePrep');
  const fillEl     = document.getElementById('intensityFill');

  if (!slider) return;

  function updateBlender() {
    const pct = parseInt(slider.value, 10);
    const vanilla  = document.getElementById('spiceVanilla')?.checked;
    const cardamom = document.getElementById('spiceCardamom')?.checked;
    const cinnamon = document.getElementById('spiceCinnamon')?.checked;
    const chili    = document.getElementById('spiceChili')?.checked;
    const sweetener = document.querySelector('input[name="sweetener"]:checked')?.value || 'honey';

    // Label update
    let typeName = 'Semi-Sweet Cocoa';
    if (pct >= 85) typeName = 'Pure Artisanal Dark';
    else if (pct >= 70) typeName = 'Single-Origin Dark';
    else if (pct >= 60) typeName = 'Smooth Medium Dark';

    pctVal.textContent = `${pct}% ${typeName}`;
    titleEl.textContent = `${pct}% ${typeName} Blend`;

    // Notes calculation
    const notes = [];
    if (pct >= 80) notes.push('Rich Roasted Nib', 'Earthy Espresso');
    else if (pct >= 65) notes.push('Deep Fudge', 'Subtle Fruitiness');
    else notes.push('Creamy Chocolate', 'Butterscotch');

    if (vanilla) notes.push('Floral Vanilla');
    if (cardamom) notes.push('Wild Cardamom');
    if (cinnamon) notes.push('Warm Cinnamon');
    if (chili) notes.push('Zesty Rift Chili');

    if (sweetener === 'honey') notes.push('Wild Forest Honey');
    else if (sweetener === 'cane') notes.push('Raw Cane Sugar');

    notesEl.textContent = notes.join(', ');

    // Prep suggestion
    if (chili) prepEl.textContent = 'Spiced Aztec Hot Chocolate';
    else if (pct >= 80) prepEl.textContent = 'Intense Espresso Cocoa Shot';
    else prepEl.textContent = 'Hot Rainforest Milk Cocoa or Iced Mocha';

    // Fill intensity bar
    if (fillEl) fillEl.style.width = `${pct}%`;
  }

  slider.addEventListener('input', updateBlender);

  ['spiceVanilla', 'spiceCardamom', 'spiceCinnamon', 'spiceChili'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updateBlender);
  });

  document.querySelectorAll('input[name="sweetener"]').forEach(radio => {
    radio.addEventListener('change', updateBlender);
  });

  // Initial call
  updateBlender();
}

/* -------------------------------------------------------------------------- */
/* Gear Modal Handler                                                         */
/* -------------------------------------------------------------------------- */
function initGearModal() {
  const gearModal  = document.getElementById('gearModal');
  const openBtn    = document.getElementById('openGearChecklistBtn');
  const closeBtn   = document.getElementById('closeGearModal');

  if (!gearModal) return;

  if (openBtn) {
    openBtn.addEventListener('click', () => gearModal.classList.add('active'));
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => gearModal.classList.remove('active'));
  }

  gearModal.addEventListener('click', (e) => {
    if (e.target === gearModal) gearModal.classList.remove('active');
  });
}
