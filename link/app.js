/* ============================================
   Central de Instalações — app.js
============================================ */

/* ------ Canvas: Partículas de fundo ------ */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H, particles = [];

  const PARTICLE_COUNT = 80;
  const COLORS = ['#4f46e5', '#7c3aed', '#3b82f6', '#06b6d4'];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 10;
      this.r  = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.4 + 0.1);
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -10) this.reset();
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function drawGrid() {
    const step = 60;
    ctx.strokeStyle = 'rgba(79,70,229,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    particles.forEach(p => { p.update(); p.draw(); });

    // Linhas de conexão entre partículas próximas
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(79,70,229,${0.06 * (1 - dist / 90)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });
  resize();
  initParticles();
  animate();
})();


/* ------ Busca / filtro de cards ------ */
(function initSearch() {
  const input    = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');
  const cards    = document.querySelectorAll('.card');
  const noResult = document.getElementById('no-results');
  const noTerm   = document.getElementById('no-results-term');
  const grid     = document.getElementById('cards-grid');

  function filter(term) {
    const q = term.trim().toLowerCase();
    let visible = 0;

    cards.forEach(card => {
      const text = (
        card.dataset.category + ' ' +
        card.innerText
      ).toLowerCase();

      const match = q === '' || text.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });

    if (visible === 0 && q !== '') {
      noResult.classList.add('visible');
      noTerm.textContent = term;
      grid.style.display = 'none';
    } else {
      noResult.classList.remove('visible');
      grid.style.display = '';
    }

    clearBtn.classList.toggle('visible', q !== '');
  }

  input.addEventListener('input', () => filter(input.value));

  clearBtn.addEventListener('click', () => {
    input.value = '';
    filter('');
    input.focus();
  });
})();


/* ------ Relógio no footer ------ */
(function initClock() {
  const el = document.getElementById('footer-clock');

  function update() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  update();
  setInterval(update, 1000);
})();


/* ------ Ripple nos botões ------ */
(function initRipple() {
  document.querySelectorAll('.btn:not(.btn-gray)').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect   = this.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const ripple = document.createElement('span');

      ripple.style.cssText = `
        position:absolute; border-radius:50%; transform:scale(0);
        animation:ripple-anim 0.5s linear;
        background:rgba(255,255,255,0.12);
        width:120px; height:120px;
        left:${x - 60}px; top:${y - 60}px;
        pointer-events:none;
      `;

      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  // Injeta keyframe se ainda não existe
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes ripple-anim {
        to { transform: scale(3); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
})();


/* ------ Atalho Ctrl+Shift+L → abre ../index.html ------ */
(function initShortcut() {
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
      e.preventDefault();
      window.open('../index.html', '_blank');
    }
  });
})();


/* ------ Copiar comando (genérico) ------ */
function copyCode(codeId, btnId, iconId) {
  const cmd  = document.getElementById(codeId).textContent;
  const btn  = document.getElementById(btnId);
  const icon = document.getElementById(iconId);

  navigator.clipboard.writeText(cmd).then(() => {
    icon.textContent = '✅';
    btn.classList.add('copied');

    setTimeout(() => {
      icon.textContent = '📋';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    // Fallback para navegadores sem suporte a clipboard API
    const ta = document.createElement('textarea');
    ta.value = cmd;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);

    icon.textContent = '✅';
    setTimeout(() => { icon.textContent = '📋'; }, 2000);
  });
}

/* ------ Copiar comando PowerShell ------ */
function copyPsCmd() {
  copyCode('ps-cmd', 'ps-copy-btn', 'ps-copy-icon');
}

/* ------ Copiar comando VBS (arquivo.vbs) ------ */
function copyVbsCmd() {
  copyCode('vbs-cmd', 'vbs-copy-btn', 'vbs-copy-icon');
}

/* ------ Copiar comando shell:startup ------ */
function copyStartupCmd() {
  copyCode('startup-cmd', 'startup-copy-btn', 'startup-copy-icon');
}
