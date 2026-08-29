# 🌿 Kyambu Resort — Eco-Luxury Sanctuary

> **Bundibugyo District, Western Uganda • Near Sempaya Hot Springs & Semuliki National Park**

Kyambu Resort is a modern, high-end web application for a premier eco-luxury sanctuary nestled in the rainforest of Bundibugyo. The platform showcases sanctuary accommodations, bespoke eco-tours, an interactive cocoa customizer, mountain trekking guides, indigenous cultural immersion, a live booking engine with price calculation, and a real-time admin management dashboard.

---

## 🌟 Key Features

### 🏡 1. Sanctuary Accommodations
- **Luxury Canopy Cottages**: Elevated wooden villas with tree canopy views, open-air rainwater showers, and private decks ($180/night).
- **Deluxe Safari Suites**: Handcrafted teak suites with outdoor copper soaking tubs looking onto the Albertine Rift ($250/night).
- **Executive Eco-Villas**: Two master-bedroom villas with private fire pits and dedicated shuttle service ($380/night).
- **Quick View Modals & Favourites**: Interactive room detail modal popups and guest favourite bookmarking.

### ☕ 2. Cocoa Farm-to-Cup Experience & Interactive Blender (`#cocoa-experience`)
- **5-Step Journey Visualizer**: Interactive guide detailing *Organic Harvest* ➔ *Banana Leaf Fermentation* ➔ *Rainforest Sun Drying* ➔ *Wood-Fired Roasting* ➔ *Artisan Chocolate Crafting*.
- **Interactive Cocoa Recipe Blender Tool**:
  - Live slider for cocoa darkness percentage (50% to 100%).
  - Rainforest spice infusion selectors (*Rwenzori Vanilla*, *Wild Cardamom*, *Bundibugyo Cinnamon*, *Rift Valley Chili*).
  - Natural sweetener choices (*Wild Forest Honey*, *Raw Cane Sugar*, *Unsweetened*).
  - Real-time recipe card update with intensity fill meter, flavor profile notes, and preparation recommendations.

### ⛰️ 3. Mungu Ni Mukubwa Mountain Ridge Trek (`#mungu-trek`)
- **Summit Guide & Trail Stats**: Key stats badges (**1,700m Altitude**, **4–5 Hours Duration**, **Moderate Difficulty**, **360° Panorama** over the Albertine Rift Valley and Rwenzori snowline).
- **Trail Waypoint Highlights**: Interactive timeline tracking the route from resort base to peak lookout.
- **🎒 Interactive Gear Checklist Modal**: Gear recommendations covering footwear, rain shells, hydration, energy packs, and photography tips.

### 🪘 4. Batwa Cultural Immersion of Bundibugyo (`#batwa-culture`)
- **4 Cultural Pillars**:
  1. *Rhythmic Music & Folk Dance* (Traditional song, sacred drums, and bamboo flutes)
  2. *Rainforest Herbalism* (Guided botanical walk with community elders)
  3. *Ancient Friction Fire-Making* (Friction fire technique demonstration)
  4. *Artisan Craft Workshop* (Hands-on bamboo basketry and wood carving)
- **100% Direct Impact Badge**: Highlighting community-led tourism where 100% of excursion fees directly support local Batwa families, healthcare, and land conservation.

### ♨️ 5. Geothermal Hot Springs & Wildlife Excursions (`#experiences`)
- **Sempaya Geothermal Thermal Walk**: Guided walking tour to male (*Nyasimbi*) and female (*Nyamugaite*) boiling hot springs ($45/guest).
- **Semuliki Primate & Birding Safari**: Rainforest safari tracking De Brazza's monkeys, chimpanzees, and 400+ bird species ($75/guest).
- **Ultimate Explorer Pass**: All-inclusive multi-day pass ($140/guest).

### 💳 6. Live Direct Booking Engine & Calculator
- Real-time automatic stay calculation: `(Nights × Suite Rate) + (Guests × Add-On Excursion Rate)`.
- Interactive date validation guards (automatic check-out min date handling).
- Multi-channel inquiry submission via **WhatsApp API** and **Email Inquiry**.

### 📊 7. Real-Time Admin Dashboard (`admin.html`)
- Built-in administrative control panel for reservation managers.
- Live inquiry metrics (Total Inquiries, Pending Review, Confirmed Stays, Total Revenue).
- Search and status filter controls (`Pending`, `Confirmed`, `Cancelled`).
- Powered by Supabase Realtime subscriptions for instant notification of new bookings.

### 🔊 8. Ambient Rainforest Soundscape
- Floating audio control toggle with live equalizer wave animation and volume slider for immersive rainforest soundscapes.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES Modules), Vanilla CSS3 (Custom Design System, Glassmorphism, CSS Grid/Flexbox, Keyframe Micro-animations)
- **Icons & Typography**: Google Fonts (*Playfair Display*, *Plus Jakarta Sans*), Custom inline SVG icons
- **Backend / Database**: Supabase Client (`@supabase/supabase-js`)
- **Build Tool & Dev Server**: Vite 5

---

## 📁 Project Structure

```
kyambu-resort/
├── index.html            # Main website homepage & modals
├── admin.html            # Admin management dashboard UI
├── public/
│   └── images/           # High-resolution resort & excursion photography
│       ├── Sempaya-Hot-Springs.jpg
│       ├── cocoa.jpg
│       ├── mungu.jpg
│       ├── batwa.jpg
│       ├── cottage.png
│       ├── suite.png
│       ├── hero.png
│       └── dining.png
├── src/
│   ├── style.css         # Complete design system & custom CSS styles
│   ├── admin.css         # Admin dashboard styles
│   ├── main.js           # Interactive UI logic, recipe blender, booking calculator
│   ├── admin.js          # Admin authentication & Supabase realtime data logic
│   └── supabase.js       # Supabase client initialization
├── package.json          # Dependencies & npm scripts
└── README.md             # Project documentation
```

---

## 🚀 Quick Start & Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Varos14/kyambu-resort.git
   cd kyambu-resort
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173/`.

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 🗄️ Supabase Setup (Optional)

The application includes optional real-time persistence with Supabase. To connect your own Supabase instance:

1. Create a table named `bookings` in your Supabase database:
   ```sql
   create table bookings (
     id uuid default gen_random_uuid() primary key,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     full_name text not null,
     email text not null,
     phone text not null,
     suite text not null,
     check_in date not null,
     check_out date not null,
     guests integer not null default 1,
     excursion text default 'none',
     nights integer not null default 1,
     total_cost numeric not null,
     status text default 'pending'
   );
   ```

2. Update `src/supabase.js` with your Supabase URL and Anon Key.

---

## 📜 License

© 2026 Kyambu Resort. All Rights Reserved. Crafted with care for nature.
