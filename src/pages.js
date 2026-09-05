document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  const activeLink = document.querySelector(`.nav-link[data-section="${page}"]`);
  if (activeLink) activeLink.classList.add('active');

  if (page === 'batwa') {
    const feature = document.querySelector('.standalone-feature');
    if (feature) {
      feature.insertAdjacentHTML('afterend', `
        <section class="batwa-section" id="batwa-culture">
          <div class="section-container">
            <div class="section-header text-center">
              <span class="section-subtitle">INDIGENOUS HERITAGE &amp; COMMUNITY</span>
              <h2 class="section-title">Batwa Cultural Immersion of Bundibugyo</h2>
              <p class="section-desc">Connect with the original guardians of the Semuliki rainforest. Experience ancient hunting lore, traditional music, herbal medicine wisdom, and handcraft workshops led by Batwa cultural leaders.</p>
            </div>
            <div class="cultural-pillars-grid">
              <div class="pillar-card">
                <div class="pillar-img-box"><img src="/images/trad dance.jpg" alt="Batwa Traditional Music and Dance" /><span class="pillar-tag">Pillar 01</span></div>
                <div class="pillar-content"><h4>Rhythmic Music &amp; Folk Dance</h4><p>Listen to traditional songs passed down through generations, accompanied by sacred drums, bamboo flutes, and vocal harmonies celebrating forest life.</p></div>
              </div>
              <div class="pillar-card">
                <div class="pillar-img-box"><img src="/images/traditional medice.webp" alt="Rainforest Herbal Medicine" /><span class="pillar-tag">Pillar 02</span></div>
                <div class="pillar-content"><h4>Rainforest Herbalism</h4><p>Guided botanical walk with Batwa elders revealing indigenous medicinal barks, leaves, and roots used for centuries to heal and protect.</p></div>
              </div>
              <div class="pillar-card">
                <div class="pillar-img-box"><img src="/images/fire making.jpeg" alt="Ancient Friction Fire Making" /><span class="pillar-tag">Pillar 03</span></div>
                <div class="pillar-content"><h4>Ancient Fire-Making Skills</h4><p>Witness how Batwa elders spark fire in seconds using natural rainforest woods and dry fungus tinder without matches or lighters.</p></div>
              </div>
              <div class="pillar-card">
                <div class="pillar-img-box"><img src="/images/baskets.jpg" alt="Artisan Basketry and Craftwork" /><span class="pillar-tag">Pillar 04</span></div>
                <div class="pillar-content"><h4>Artisan Craft Workshop</h4><p>Try your hand at traditional bamboo basket weaving, wood carving, or beadwork. Every participant receives a handmade souvenir craft.</p></div>
              </div>
            </div>
          </div>
        </section>`);
    }
  }

  const menuButton = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  if (!menuButton || !navLinks) return;

  menuButton.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('mobile-open');
    menuButton.classList.toggle('open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      menuButton.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
});
