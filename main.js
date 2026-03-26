/* =====================================================
   ViveRioja Experience — main.js
   ===================================================== */

'use strict';

/* =====================================================
   1. NAVBAR STICKY + SCROLL
   ===================================================== */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 60;

  function updateNavbar() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // Hamburger menu
  const hamburger = document.querySelector('.navbar__hamburger');
  const mobileMenu = document.querySelector('.navbar__mobile');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Cerrar al hacer click en un link
    mobileMenu.querySelectorAll('.navbar__mobile-link').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active link según página actual
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__link, .navbar__mobile-link').forEach(function (link) {
    const href = link.getAttribute('href') || '';
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* =====================================================
   2. HERO — animación de fondo al cargar
   ===================================================== */
(function initHeroBg() {
  const heroBg = document.querySelector('.hero__bg');
  if (!heroBg) return;
  setTimeout(function () {
    heroBg.classList.add('loaded');
  }, 100);
})();

/* =====================================================
   3. SCROLL REVEAL
   ===================================================== */
(function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal--left, .reveal--right, .reveal--scale');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );

  reveals.forEach(function (el) {
    observer.observe(el);
  });
})();

/* =====================================================
   4. CONTADOR ANIMADO (números en hero stats)
   ===================================================== */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(function (el) {
    observer.observe(el);
  });

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const start = performance.now();

    function step(timestamp) {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }
})();

/* =====================================================
   5. EASTER EGG — 5 clicks en el logo → popup + confetti
   ===================================================== */
(function initEasterEgg() {
  // El logo tiene id="logo-easter-egg" en nosotros.html
  const logoTrigger = document.getElementById('logo-easter-egg');
  const overlay = document.getElementById('easter-overlay');
  const closeBtn = document.getElementById('easter-close');
  const canvas = document.getElementById('confetti-canvas');

  if (!logoTrigger || !overlay) return;

  let clickCount = 0;
  let resetTimer = null;

  logoTrigger.addEventListener('click', function () {
    clickCount++;

    clearTimeout(resetTimer);
    resetTimer = setTimeout(function () { clickCount = 0; }, 2500);

    if (clickCount >= 5) {
      clickCount = 0;
      showEasterEgg();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', hideEasterEgg);
  }

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) hideEasterEgg();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hideEasterEgg();
  });

  function showEasterEgg() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (canvas) {
      canvas.classList.add('active');
      startConfetti(canvas);
    }
  }

  function hideEasterEgg() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    if (canvas) {
      canvas.classList.remove('active');
      stopConfetti();
    }
  }

  // --- CONFETTI ENGINE ---
  let animFrame = null;
  let particles = [];

  function startConfetti(cvs) {
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
    particles = [];

    const COLORS = ['#9f4040', '#c9a84c', '#ffffff', '#f5e8e8', '#e8d08a', '#7a2f2f', '#ffd700'];

    for (let i = 0; i < 180; i++) {
      particles.push({
        x: Math.random() * cvs.width,
        y: -20 - Math.random() * 300,
        w: 8 + Math.random() * 8,
        h: 4 + Math.random() * 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        opacity: 0.8 + Math.random() * 0.2,
      });
    }

    const ctx = cvs.getContext('2d');

    function draw() {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      particles.forEach(function (p) {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.vy += 0.06;
        p.opacity -= 0.004;
      });

      particles = particles.filter(function (p) {
        return p.y < cvs.height + 20 && p.opacity > 0;
      });

      if (particles.length > 0) {
        animFrame = requestAnimationFrame(draw);
      }
    }

    animFrame = requestAnimationFrame(draw);
  }

  function stopConfetti() {
    if (animFrame) cancelAnimationFrame(animFrame);
    particles = [];
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  window.addEventListener('resize', function () {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });
})();

/* =====================================================
   6. CALCULADORA DE PRECIOS — reservas.html
   ===================================================== */
(function initPriceCalculator() {
  const experienciaSelect = document.getElementById('experiencia');
  const personasInput = document.getElementById('num-personas');
  const priceBadge = document.getElementById('price-result');
  const priceAmount = document.getElementById('price-amount');
  const priceNote = document.getElementById('price-note');

  if (!experienciaSelect || !personasInput) return;

  const PRICES = {
    'estandar':     { base: 90,  label: 'Estándar (desde 90€/persona)' },
    'personalizada':{ base: 0,   label: 'Personalizada (presupuesto a medida)' },
    'premium':      { base: 250, label: 'Premium (desde 250€/persona)' },
  };

  function calcularPrecio() {
    const tipo = experienciaSelect.value;
    const personas = parseInt(personasInput.value, 10) || 1;

    if (!tipo || !PRICES[tipo]) {
      if (priceBadge) priceBadge.style.display = 'none';
      return;
    }

    const price = PRICES[tipo];

    if (priceBadge) priceBadge.style.display = 'block';

    if (tipo === 'personalizada') {
      if (priceAmount) priceAmount.textContent = 'Presupuesto personalizado';
      if (priceNote) priceNote.textContent = 'Nos pondremos en contacto contigo para diseñar tu experiencia a medida.';
    } else {
      const total = price.base * personas;
      if (priceAmount) priceAmount.textContent = total.toLocaleString('es-ES') + ' €';
      if (priceNote) {
        priceNote.textContent = price.base + '€ × ' + personas + ' persona' + (personas > 1 ? 's' : '') +
          ' · Precio estimado, sujeto a disponibilidad';
      }
    }

    // Animación de cambio
    if (priceAmount) {
      priceAmount.style.transform = 'scale(1.12)';
      setTimeout(function () { priceAmount.style.transform = 'scale(1)'; }, 180);
    }
  }

  experienciaSelect.addEventListener('change', calcularPrecio);
  personasInput.addEventListener('input', calcularPrecio);
  personasInput.addEventListener('change', calcularPrecio);
  calcularPrecio();
})();

/* =====================================================
   7. FORMULARIOS — validación suave + feedback
   ===================================================== */
(function initForms() {
  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      let valid = true;

      // Limpiar errores previos
      form.querySelectorAll('.form-error').forEach(function (el) { el.remove(); });
      form.querySelectorAll('.form-control').forEach(function (el) { el.classList.remove('error'); });

      // Validar requeridos
      form.querySelectorAll('[required]').forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.classList.add('error');
          const err = document.createElement('span');
          err.className = 'form-error';
          err.textContent = 'Este campo es obligatorio';
          field.parentNode.appendChild(err);
        }
      });

      // Validar email
      form.querySelectorAll('[type="email"]').forEach(function (field) {
        if (field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          valid = false;
          field.classList.add('error');
          const err = document.createElement('span');
          err.className = 'form-error';
          err.textContent = 'Introduce un email válido';
          field.parentNode.appendChild(err);
        }
      });

      if (valid) {
        showFormSuccess(form);
      }
    });
  });

  function showFormSuccess(form) {
    const msg = document.createElement('div');
    msg.className = 'form-success';
    msg.innerHTML = '<strong>¡Mensaje enviado!</strong> Nos pondremos en contacto contigo en menos de 24 horas.';
    form.parentNode.insertBefore(msg, form.nextSibling);
    form.reset();
    setTimeout(function () { msg.remove(); }, 6000);
  }
})();

/* =====================================================
   8. SMOOTH SCROLL para anclas internas
   ===================================================== */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    const id = this.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  });
});

/* =====================================================
   9. HERO SCROLL ARROW
   ===================================================== */
(function initHeroScroll() {
  const scrollBtn = document.querySelector('.hero__scroll');
  if (!scrollBtn) return;
  scrollBtn.addEventListener('click', function () {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  });
})();

/* =====================================================
   10. NEWSLETTER — feedback visual
   ===================================================== */
(function initNewsletter() {
  const form = document.querySelector('.newsletter__form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const input = form.querySelector('.newsletter__input');
    if (!input || !input.value.trim()) return;

    const btn = form.querySelector('button, .btn');
    if (btn) {
      btn.textContent = '¡Suscrito!';
      btn.style.background = '#16a34a';
      btn.disabled = true;
    }
    input.value = '';

    setTimeout(function () {
      if (btn) {
        btn.textContent = 'Suscribirme';
        btn.style.background = '';
        btn.disabled = false;
      }
    }, 4000);
  });
})();

/* =====================================================
   CSS extra para errores de formulario (inyectado por JS)
   ===================================================== */
(function injectFormStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .form-control.error {
      border-color: #ef4444;
      box-shadow: 0 0 0 4px rgba(239,68,68,0.1);
    }
    .form-error {
      display: block;
      font-size: 0.78rem;
      color: #ef4444;
      margin-top: 0.3rem;
    }
    .form-success {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 12px;
      padding: 1rem 1.4rem;
      color: #166534;
      font-size: 0.9rem;
      margin-top: 1rem;
      animation: fadeIn 0.4s ease;
    }
    .price-badge__amount {
      transition: transform 0.18s ease;
    }
  `;
  document.head.appendChild(style);
})();
