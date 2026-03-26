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

/* =====================================================
   11. MODALES DE DETALLE (yacimientos, cards)
   ===================================================== */
(function initModales() {
  document.querySelectorAll('.ver-detalle-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var modalId = btn.getAttribute('data-modal');
      var modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        modal.querySelector('.detalle-modal__close') &&
          modal.querySelector('.detalle-modal__close').focus();
      }
    });
  });

  document.querySelectorAll('.detalle-modal').forEach(function(modal) {
    var closeBtn = modal.querySelector('.detalle-modal__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.detalle-modal.active').forEach(function(m) {
        m.classList.remove('active');
        document.body.style.overflow = '';
      });
    }
  });
})();

/* =====================================================
   12. WIZARD DE RESERVA — 3 pasos
   ===================================================== */
(function initWizard() {
  var paso1 = document.getElementById('wizard-paso1');
  var paso2 = document.getElementById('wizard-paso2');
  var paso3 = document.getElementById('wizard-paso3');
  var btnPaso2 = document.getElementById('btn-paso2');
  var btnVolverPaso1 = document.getElementById('btn-volver-paso1');
  var btnPaso3 = document.getElementById('btn-paso3');

  if (!paso1 || !paso2 || !paso3) return;

  var steps = document.querySelectorAll('.wizard-step');
  var lines = document.querySelectorAll('.wizard-step__line');

  function irAPaso(num) {
    [paso1, paso2, paso3].forEach(function(p, i) {
      p.style.display = (i + 1 === num) ? 'block' : 'none';
    });
    steps.forEach(function(s, i) {
      s.classList.remove('wizard-step--active', 'wizard-step--done');
      if (i + 1 === num) s.classList.add('wizard-step--active');
      if (i + 1 < num) s.classList.add('wizard-step--done');
    });
    lines.forEach(function(l, i) {
      l.classList.toggle('active', i + 1 < num);
    });
    window.scrollTo({ top: paso1.closest('.section') ? paso1.closest('.section').offsetTop - 100 : 0, behavior: 'smooth' });
  }

  if (btnPaso2) {
    btnPaso2.addEventListener('click', function() {
      var form = document.getElementById('reservas-form');
      var valid = true;
      form.querySelectorAll('.form-error').forEach(function(e) { e.remove(); });
      form.querySelectorAll('.form-control').forEach(function(e) { e.classList.remove('error'); });
      form.querySelectorAll('[required]').forEach(function(field) {
        if (!field.value.trim() || (field.type === 'checkbox' && !field.checked)) {
          valid = false;
          field.classList.add('error');
          var err = document.createElement('span');
          err.className = 'form-error';
          err.textContent = 'Este campo es obligatorio';
          field.parentNode.appendChild(err);
        }
      });
      if (!valid) return;
      rellenarResumen();
      irAPaso(2);
    });
  }

  if (btnVolverPaso1) {
    btnVolverPaso1.addEventListener('click', function() { irAPaso(1); });
  }

  if (btnPaso3) {
    btnPaso3.addEventListener('click', function() {
      mostrarConfirmacion();
      irAPaso(3);
    });
  }

  var cardNum = document.getElementById('card-number');
  if (cardNum) {
    cardNum.addEventListener('input', function() {
      var v = cardNum.value.replace(/\D/g,'').substring(0,16);
      cardNum.value = v.match(/.{1,4}/g) ? v.match(/.{1,4}/g).join(' ') : v;
    });
  }

  var cardExp = document.getElementById('card-expiry');
  if (cardExp) {
    cardExp.addEventListener('input', function() {
      var v = cardExp.value.replace(/\D/g,'');
      if (v.length >= 2) v = v.substring(0,2) + '/' + v.substring(2,4);
      cardExp.value = v;
    });
  }

  function rellenarResumen() {
    var exp = document.getElementById('experiencia');
    var nom = document.getElementById('nombre');
    var ape = document.getElementById('apellidos');
    var fec = document.getElementById('fecha');
    var per = document.getElementById('num-personas');
    var des = document.getElementById('destino');

    var expMap = {
      'estandar': 'Experiencia Est\u00e1ndar',
      'personalizada': 'Experiencia Personalizada',
      'premium': 'Experiencia Premium'
    };
    var precioMap = { 'estandar': 90, 'personalizada': null, 'premium': 250 };

    var expVal = exp ? exp.value : '';
    var perVal = parseInt(per ? per.value : '2', 10) || 2;
    var precio = precioMap[expVal];
    var totalText = precio ? (precio * perVal).toLocaleString('es-ES') + ' \u20ac' : 'A consultar';
    var fechaText = fec && fec.value ? new Date(fec.value).toLocaleDateString('es-ES', {day:'2-digit',month:'long',year:'numeric'}) : 'Sin especificar';
    var desText = des && des.options[des.selectedIndex] ? des.options[des.selectedIndex].text : '';

    var html = [
      '<div style="display:flex;justify-content:space-between;"><span style="color:#777;">Experiencia:</span><span style="font-weight:600;">' + (expMap[expVal] || '\u2014') + '</span></div>',
      '<div style="display:flex;justify-content:space-between;"><span style="color:#777;">Nombre:</span><span style="font-weight:600;">' + ((nom ? nom.value : '') + ' ' + (ape ? ape.value : '')).trim() + '</span></div>',
      '<div style="display:flex;justify-content:space-between;"><span style="color:#777;">Fecha:</span><span style="font-weight:600;">' + fechaText + '</span></div>',
      '<div style="display:flex;justify-content:space-between;"><span style="color:#777;">Personas:</span><span style="font-weight:600;">' + perVal + '</span></div>',
      desText ? '<div style="display:flex;justify-content:space-between;"><span style="color:#777;">Destino:</span><span style="font-weight:600;">' + desText + '</span></div>' : ''
    ].join('');

    var resumenDiv = document.getElementById('resumen-contenido');
    if (resumenDiv) resumenDiv.innerHTML = html;
    var totalDiv = document.getElementById('resumen-total');
    if (totalDiv) totalDiv.textContent = totalText;
    var btnTotal = document.getElementById('btn-total-precio');
    if (btnTotal) btnTotal.textContent = precio ? '\u00b7 ' + totalText : '';
  }

  function mostrarConfirmacion() {
    var codigo = 'VR-2026-' + Math.floor(1000 + Math.random() * 9000);
    var numEl = document.getElementById('reserva-numero');
    if (numEl) numEl.textContent = codigo;

    var exp = document.getElementById('experiencia');
    var fec = document.getElementById('fecha');
    var per = document.getElementById('num-personas');
    var expMap = { 'estandar': 'Experiencia Est\u00e1ndar', 'personalizada': 'Experiencia Personalizada', 'premium': 'Experiencia Premium' };
    var fechaText = fec && fec.value ? new Date(fec.value).toLocaleDateString('es-ES', {day:'2-digit',month:'long',year:'numeric'}) : 'Sin especificar';

    var html = [
      '<div style="display:flex;gap:.5rem;"><span style="color:#9f4040;font-weight:600;">Experiencia:</span><span>' + (expMap[exp ? exp.value : ''] || '\u2014') + '</span></div>',
      '<div style="display:flex;gap:.5rem;"><span style="color:#9f4040;font-weight:600;">Fecha:</span><span>' + fechaText + '</span></div>',
      '<div style="display:flex;gap:.5rem;"><span style="color:#9f4040;font-weight:600;">Personas:</span><span>' + (per ? per.value : '\u2014') + '</span></div>'
    ].join('');

    var detalle = document.getElementById('confirmacion-detalle');
    if (detalle) detalle.innerHTML = html;

    if (window.lucide) lucide.createIcons();
  }

  irAPaso(1);
})();

/* =====================================================
   13. CARRUSELES (destinos)
   ===================================================== */
(function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(function(car) {
    var track = car.querySelector('.carousel__track');
    var slides = car.querySelectorAll('.carousel__slide');
    var dots = car.querySelectorAll('.carousel__dot');
    var total = slides.length;
    if (total < 2) return;
    var current = 0;

    function goTo(idx) {
      current = (idx + total) % total;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function(d, i) {
        d.classList.toggle('carousel__dot--active', i === current);
      });
    }

    var prevBtn = car.querySelector('.carousel__btn--prev');
    var nextBtn = car.querySelector('.carousel__btn--next');
    if (prevBtn) prevBtn.addEventListener('click', function(e) { e.preventDefault(); goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function(e) { e.preventDefault(); goTo(current + 1); });

    dots.forEach(function(d, i) {
      d.addEventListener('click', function() { goTo(i); });
    });

    // Auto-advance every 5 s, pause on hover
    var timer = setInterval(function() { goTo(current + 1); }, 5000);
    car.addEventListener('mouseenter', function() { clearInterval(timer); });
    car.addEventListener('mouseleave', function() { timer = setInterval(function() { goTo(current + 1); }, 5000); });
  });
})();
