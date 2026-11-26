/* =========================================
   GREEN SERVERLESS — MAIN.JS
   Interações, animações e formulário
   ========================================= */

'use strict';

/* ---- NAVBAR: scroll + menu mobile ---- */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const toggle    = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');

  // Adiciona classe "scrolled" após rolar 50px
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Executa na carga caso já esteja scrollado

  // Menu hamburguer (mobile)
  toggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Fecha menu ao clicar em um link
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Fecha menu ao clicar fora
  document.addEventListener('click', function (e) {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Destaca link ativo conforme seção visível
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = navLinks.querySelectorAll('a[href^="#"]');

  function highlightNav() {
    let current = '';
    sections.forEach(function (section) {
      const top = section.getBoundingClientRect().top;
      if (top <= 100) current = section.getAttribute('id');
    });
    navAnchors.forEach(function (a) {
      a.style.color = '';
      if (a.getAttribute('href') === '#' + current) {
        a.style.color = 'var(--green-light)';
      }
    });
  }
  window.addEventListener('scroll', highlightNav, { passive: true });
})();


/* ---- CANVAS DE PARTÍCULAS (hero) ---- */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrame;

  // Ajusta tamanho ao container
  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createParticle() {
    return {
      x:    randomBetween(0, canvas.width),
      y:    randomBetween(0, canvas.height),
      r:    randomBetween(1, 2.5),
      vx:   randomBetween(-0.3, 0.3),
      vy:   randomBetween(-0.5, -0.1),
      alpha: randomBetween(0.2, 0.7),
    };
  }

  function initParticlePool() {
    const count = Math.floor((canvas.width * canvas.height) / 14000);
    particles = Array.from({ length: count }, createParticle);
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(function (p) {
      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Reinicia quando sai do topo
      if (p.y < -5) {
        Object.assign(p, createParticle());
        p.y = canvas.height + 5;
      }
      if (p.x < -5 || p.x > canvas.width + 5) {
        Object.assign(p, createParticle());
      }

      // Desenha ponto
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 229, 176, ${p.alpha})`;
      ctx.fill();
    });

    // Conecta partículas próximas
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 229, 176, ${0.08 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    animFrame = requestAnimationFrame(drawParticles);
  }

  // Pausa animação quando fora da viewport (performance)
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animFrame = requestAnimationFrame(drawParticles);
      } else {
        cancelAnimationFrame(animFrame);
      }
    });
  });
  observer.observe(canvas.parentElement);

  window.addEventListener('resize', function () {
    resize();
    initParticlePool();
  });

  resize();
  initParticlePool();
})();


/* ---- ANIMAÇÕES DE SCROLL (Intersection Observer) ---- */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Anima só uma vez
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(function (el) { observer.observe(el); });
})();


/* ---- CONTAGEM ANIMADA DOS STATS (hero) ---- */
(function initCountUp() {
  const stats = document.querySelectorAll('.stat-number');
  if (!stats.length) return;

  function animateCount(el, target, suffix, duration) {
    const start  = performance.now();
    const isFloat = String(target).includes('.');
    const numTarget = parseFloat(target);

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = numTarget * ease;
      el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const el   = entry.target;
      const text = el.textContent;
      const num  = parseFloat(text);
      const suffix = text.replace(/[\d.]/g, '');
      if (!isNaN(num)) animateCount(el, num, suffix, 1200);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(function (el) { observer.observe(el); });
})();


/* ---- SMOOTH SCROLL para links âncora ---- */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();

      const navHeight = document.getElementById('navbar').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ---- FORMULÁRIO DE CONTATO (Lambda + SES) ---- */
(function initContactForm() {
  const form     = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('submit-btn');

  if (!form) return;

  // URL do API Gateway → Lambda (substitua após deploy)
  // Ex: https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/prod/contact
  const API_ENDPOINT = 'https://tybmaz3v49.execute-api.us-east-1.amazonaws.com/prod/contact';

  function setFeedback(type, message) {
    feedback.className = 'form-feedback ' + type;
    feedback.textContent = message;
    feedback.style.display = 'block';
    // Remove após 6 segundos
    setTimeout(function () {
      feedback.style.display = 'none';
      feedback.className = 'form-feedback';
    }, 6000);
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.innerHTML = loading
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Enviando...'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Enviar Mensagem';
  }

  // Adiciona estilo spin ao cabeçalho da página dinamicamente
  if (!document.getElementById('spin-style')) {
    const style = document.createElement('style');
    style.id = 'spin-style';
    style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
  }

  function validateForm(data) {
    if (!data.nome || data.nome.trim().length < 2) {
      return 'Por favor, informe seu nome completo.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      return 'Por favor, informe um e-mail válido.';
    }
    if (!data.servico) {
      return 'Por favor, selecione o tipo de projeto.';
    }
    if (!data.mensagem || data.mensagem.trim().length < 10) {
      return 'Por favor, descreva um pouco mais o seu projeto.';
    }
    return null;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const data = {
      nome:      form.nome.value.trim(),
      email:     form.email.value.trim(),
      whatsapp:  form.whatsapp.value.trim(),
      servico:   form.servico.value,
      mensagem:  form.mensagem.value.trim(),
    };

    // Validação client-side
    const validationError = validateForm(data);
    if (validationError) {
      setFeedback('error', validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setFeedback('success', '✅ Mensagem enviada com sucesso! Em breve entraremos em contato.');
        form.reset();
      } else {
        throw new Error('Resposta não OK: ' + response.status);
      }
    } catch (err) {
      console.error('Erro ao enviar formulário:', err);

      // Fallback: abre WhatsApp direto se a API não estiver configurada
      const msg = encodeURIComponent(
        `Olá! Tenho interesse em um serviço da Green Serverless.\n\nNome: ${data.nome}\nE-mail: ${data.email}\nServiço: ${data.servico}\n\n${data.mensagem}`
      );
      window.open(`https://wa.me/5562992099914?text=${msg}`, '_blank');
      setFeedback('success', '✅ Redirecionando para o WhatsApp...');
      form.reset();
    } finally {
      setLoading(false);
    }
  });
})();


/* ---- EFEITO DE DIGITAÇÃO no hero title ---- */
(function initTypingEffect() {
  const target = document.querySelector('.hero-title .line-2');
  if (!target) return;

  const words   = ['nuvem AWS', 'próximo nível', 'infraestrutura', 'Cloud AWS'];
  let wordIdx   = 0;
  let charIdx   = 0;
  let deleting  = false;
  let paused    = false;

  function type() {
    const word    = words[wordIdx];
    const current = deleting ? word.slice(0, charIdx - 1) : word.slice(0, charIdx + 1);

    target.textContent = current;
    charIdx = deleting ? charIdx - 1 : charIdx + 1;

    let delay = deleting ? 60 : 100;

    if (!deleting && charIdx === word.length) {
      // Pausa antes de apagar
      if (wordIdx === 0) return; // Mantém a palavra padrão por mais tempo na primeira carga
      paused = true;
      setTimeout(function () {
        deleting = true;
        paused   = false;
        setTimeout(type, delay);
      }, 2000);
      return;
    }

    if (deleting && charIdx === 0) {
      deleting = false;
      wordIdx  = (wordIdx + 1) % words.length;
    }

    if (!paused) setTimeout(type, delay);
  }

  // Começa o loop de digitação após 4 segundos (deixa o usuário ler primeiro)
  setTimeout(function () {
    deleting  = true;
    charIdx   = words[0].length;
    wordIdx   = 1;
    type();
  }, 4000);
})();


/* ---- HOVER PARALLAX no hero card ---- */
(function initCardParallax() {
  const visual = document.querySelector('.hero-visual');
  if (!visual) return;

  const card = visual.querySelector('.hero-card-main');
  if (!card) return;

  visual.addEventListener('mousemove', function (e) {
    const rect   = visual.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const rx     = ((e.clientX - cx) / rect.width)  * 12; // graus
    const ry     = ((e.clientY - cy) / rect.height) * -12;

    card.style.transform = `perspective(800px) rotateY(${rx}deg) rotateX(${ry}deg) translateZ(10px)`;
  });

  visual.addEventListener('mouseleave', function () {
    card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateZ(0)';
    card.style.transition = 'transform 0.5s ease';
    setTimeout(function () { card.style.transition = ''; }, 500);
  });
})();


/* ---- HIGHLIGHT nos steps ao passar o mouse ---- */
(function initStepHighlight() {
  document.querySelectorAll('.step-item').forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      this.querySelector('.step-number').style.cssText =
        'background:rgba(0,229,176,0.12);border-color:var(--green-light);color:var(--green-light);box-shadow:var(--glow-green)';
    });
    item.addEventListener('mouseleave', function () {
      this.querySelector('.step-number').style.cssText = '';
    });
  });
})();


/* ---- LOADING PROGRESSIVO das iframes de portfólio ---- */
(function initPortfolioFrames() {
  document.querySelectorAll('.portfolio-preview iframe').forEach(function (iframe) {
    const preview = iframe.parentElement;

    // Placeholder enquanto carrega
    preview.style.background = 'var(--navy-deep)';

    iframe.addEventListener('load', function () {
      iframe.style.opacity = '1';
    });
    iframe.style.opacity = '0';
    iframe.style.transition = 'opacity 0.5s ease';
  });
})();


/* ---- CURSOR GLOW (desktop only) ---- */
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // Pula em touch

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,229,176,0.04) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    will-change: transform;
  `;
  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let glowX  = 0, glowY  = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mouseleave', function () {
    glow.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    glow.style.opacity = '1';
  });

  function animGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
    requestAnimationFrame(animGlow);
  }
  animGlow();
})();


/* ---- UTILITÁRIO: Log de inicialização ---- */
console.log(
  '%c🟢 Green Serverless%c — Site carregado com sucesso\n%chttps://greenserverless.com',
  'color: #00E5B0; font-size: 16px; font-weight: bold;',
  'color: #B0C4D8; font-size: 12px;',
  'color: #607A94; font-size: 11px;'
);


/* ---- ACESSO INTERNO — Ctrl + Shift + L ---- */
(function initSecretAccess() {
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
      e.preventDefault();
      window.open('link/index.html', '_blank');
    }
  });
})();
