/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
document.getElementById('year').textContent = new Date().getFullYear();

/* ═══════════════════════════════════════════════
   NAVBAR: opacity on scroll
═══════════════════════════════════════════════ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ═══════════════════════════════════════════════
   MOBILE MENU
═══════════════════════════════════════════════ */
const mobileBtn  = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
mobileBtn.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  mobileBtn.classList.toggle('open', open);
  mobileBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    mobileBtn.classList.remove('open');
  });
});

/* ═══════════════════════════════════════════════
   SCROLL FADE-IN (IntersectionObserver)
═══════════════════════════════════════════════ */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in-on-scroll').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  fadeObserver.observe(el);
});

/* ═══════════════════════════════════════════════
   PRICING TOGGLE
═══════════════════════════════════════════════ */
const billingToggle = document.getElementById('billing-toggle');
const proPrice      = document.getElementById('pro-price');
const yearlyNote    = document.getElementById('yearly-note');
const lblMonthly    = document.getElementById('lbl-monthly');
const lblYearly     = document.getElementById('lbl-yearly');

billingToggle.addEventListener('change', () => {
  const isYearly = billingToggle.checked;
  proPrice.textContent = isYearly ? '6' : '8';
  yearlyNote.classList.toggle('visible', isYearly);
  lblMonthly.classList.toggle('active', !isYearly);
  lblYearly.classList.toggle('active', isYearly);
});
// Set initial active state
lblMonthly.classList.add('active');

/* ═══════════════════════════════════════════════
   CHAOS ANIMATION
═══════════════════════════════════════════════ */
(function initChaos() {
  const container = document.getElementById('chaosContainer');
  if (!container) return;

  const icons = Array.from(container.querySelectorAll('.chaos-icon'));
  const ICON_SIZE = 46;
  const MAX_SPEED = 1.6;
  const REPEL_RADIUS = 110;
  const REPEL_FORCE = 0.35;

  let W = 0, H = 0;
  let mouseX = -9999, mouseY = -9999;

  // Each particle: position, velocity, rotation
  const particles = icons.map(() => ({
    x: 0, y: 0,
    vx: (Math.random() - 0.5) * MAX_SPEED * 1.2,
    vy: (Math.random() - 0.5) * MAX_SPEED * 1.2,
    rot: Math.random() * 360,
    rotV: (Math.random() - 0.5) * 0.6,
  }));

  function updateBounds() {
    const rect = container.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
  }

  function scatterInitialPositions() {
    updateBounds();
    particles.forEach((p) => {
      p.x = Math.random() * Math.max(0, W - ICON_SIZE);
      p.y = Math.random() * Math.max(0, H - ICON_SIZE);
    });
  }

  // Defer until layout is stable
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scatterInitialPositions();
      animate();
    });
  });

  window.addEventListener('resize', updateBounds, { passive: true });

  // Track mouse relative to container
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }, { passive: true });

  container.addEventListener('mouseleave', () => {
    mouseX = -9999;
    mouseY = -9999;
  }, { passive: true });

  function clampSpeed(p) {
    const spd = Math.hypot(p.vx, p.vy);
    if (spd > MAX_SPEED) {
      p.vx = (p.vx / spd) * MAX_SPEED;
      p.vy = (p.vy / spd) * MAX_SPEED;
    }
    // Keep a minimum drift
    if (spd < 0.15) {
      p.vx += (Math.random() - 0.5) * 0.12;
      p.vy += (Math.random() - 0.5) * 0.12;
    }
  }

  function animate() {
    const maxX = W - ICON_SIZE;
    const maxY = H - ICON_SIZE;

    particles.forEach((p, i) => {
      const el = icons[i];

      // Mouse repulsion
      const cx = p.x + ICON_SIZE / 2;
      const cy = p.y + ICON_SIZE / 2;
      const dx = cx - mouseX;
      const dy = cy - mouseY;
      const dist = Math.hypot(dx, dy);

      if (dist < REPEL_RADIUS && dist > 0) {
        const strength = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_FORCE;
        p.vx += (dx / dist) * strength;
        p.vy += (dy / dist) * strength;
      }

      // Light friction
      p.vx *= 0.992;
      p.vy *= 0.992;

      clampSpeed(p);

      p.x += p.vx;
      p.y += p.vy;

      // Bounce off walls
      if (p.x < 0)    { p.x = 0;    p.vx =  Math.abs(p.vx); }
      if (p.y < 0)    { p.y = 0;    p.vy =  Math.abs(p.vy); }
      if (p.x > maxX) { p.x = maxX; p.vx = -Math.abs(p.vx); }
      if (p.y > maxY) { p.y = maxY; p.vy = -Math.abs(p.vy); }

      p.rot += p.rotV;

      el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`;
    });

    requestAnimationFrame(animate);
  }
})();

/* ═══════════════════════════════════════════════
   SMOOTH SCROLL for nav links
═══════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
