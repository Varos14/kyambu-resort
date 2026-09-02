document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  const activeLink = document.querySelector(`.nav-link[data-section="${page}"]`);
  if (activeLink) activeLink.classList.add('active');

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
