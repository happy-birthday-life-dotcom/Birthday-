/* ==========================================================================
   BIRTHDAY — Ayesha — script.js
   ========================================================================== */

(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ========================================================================
     LOADER
     ======================================================================== */
  window.addEventListener('load', () => {
    setTimeout(() => {
      $('#loader').classList.add('done');
    }, 700);
  });

  /* ========================================================================
     STARFIELD (ambient, section 1 onward)
     ======================================================================== */
  const starCanvas = $('#star-canvas');
  const starCtx = starCanvas.getContext('2d');
  let stars = [];

  function resizeStarCanvas() {
    starCanvas.width = window.innerWidth;
    starCanvas.height = document.documentElement.scrollHeight;
  }

  function initStars() {
    resizeStarCanvas();
    const count = Math.floor((starCanvas.width * starCanvas.height) / 9000);
    stars = Array.from({ length: Math.min(count, 420) }, () => ({
      x: Math.random() * starCanvas.width,
      y: Math.random() * starCanvas.height,
      r: Math.random() * 1.4 + 0.3,
      baseAlpha: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2
    }));
  }

  let starTime = 0;
  function drawStars() {
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    starTime += 0.016;
    for (const s of stars) {
      const twinkle = Math.sin(starTime * s.speed * 60 + s.phase) * 0.35;
      const alpha = Math.max(0, Math.min(1, s.baseAlpha + twinkle));
      starCtx.beginPath();
      starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      starCtx.fillStyle = `rgba(255,255,255,${alpha})`;
      starCtx.fill();
    }
    requestAnimationFrame(drawStars);
  }

  initStars();
  drawStars();
  window.addEventListener('resize', () => { initStars(); });

  /* ========================================================================
     FX CANVAS — confetti / fireworks / shooting stars
     ======================================================================== */
  const fxCanvas = $('#fx-canvas');
  const fxCtx = fxCanvas.getContext('2d');
  let fxParticles = [];

  function resizeFxCanvas() {
    fxCanvas.width = window.innerWidth;
    fxCanvas.height = window.innerHeight;
  }
  resizeFxCanvas();
  window.addEventListener('resize', resizeFxCanvas);

  function fxLoop() {
    fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    fxParticles = fxParticles.filter(p => p.life > 0);
    for (const p of fxParticles) {
      p.update();
      p.draw(fxCtx);
    }
    requestAnimationFrame(fxLoop);
  }
  fxLoop();

  class Confetto {
    constructor(x, y) {
      this.x = x; this.y = y;
      this.vx = (Math.random() - 0.5) * 8;
      this.vy = Math.random() * -10 - 4;
      this.gravity = 0.28;
      this.size = Math.random() * 7 + 4;
      this.rot = Math.random() * 360;
      this.vrot = (Math.random() - 0.5) * 14;
      this.color = ['#FFD369', '#FF5C8A', '#7A5FFF', '#FFFFFF'][Math.floor(Math.random() * 4)];
      this.life = 1;
      this.decay = Math.random() * 0.006 + 0.004;
    }
    update() {
      this.vy += this.gravity * 0.15;
      this.x += this.vx;
      this.y += this.vy;
      this.rot += this.vrot;
      this.life -= this.decay;
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rot * Math.PI) / 180);
      ctx.globalAlpha = Math.max(this.life, 0);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
      ctx.restore();
    }
  }

  function burstConfetti(x, y, amount = 90) {
    for (let i = 0; i < amount; i++) fxParticles.push(new Confetto(x, y));
  }

  class FireworkParticle {
    constructor(x, y, color) {
      this.x = x; this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.color = color;
      this.life = 1;
      this.decay = Math.random() * 0.012 + 0.012;
      this.size = Math.random() * 2.4 + 1.2;
    }
    update() {
      this.vy += 0.045;
      this.vx *= 0.985;
      this.vy *= 0.985;
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(this.life, 0);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function burstFirework(x, y) {
    const palette = ['#FFD369', '#FF5C8A', '#7A5FFF', '#FFFFFF'];
    const color = palette[Math.floor(Math.random() * palette.length)];
    for (let i = 0; i < 70; i++) fxParticles.push(new FireworkParticle(x, y, color));
  }

  function fireworksShow(duration = 2600, section) {
    if (reducedMotion) return;
    const rect = section.getBoundingClientRect();
    const top = rect.top;
    const start = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - start > duration) { clearInterval(interval); return; }
      const x = Math.random() * fxCanvas.width;
      const y = top + Math.random() * (rect.height * 0.5) + 40;
      burstFirework(x, Math.max(y, 60));
    }, 260);
  }

  class ShootingStar {
    constructor() {
      this.x = Math.random() * fxCanvas.width * 0.6;
      this.y = Math.random() * fxCanvas.height * 0.3;
      this.len = Math.random() * 120 + 80;
      this.speed = Math.random() * 12 + 10;
      this.angle = Math.PI / 5;
      this.life = 1;
      this.decay = 0.012;
    }
    update() {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.life -= this.decay;
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(this.life, 0);
      const grad = ctx.createLinearGradient(
        this.x, this.y,
        this.x - Math.cos(this.angle) * this.len,
        this.y - Math.sin(this.angle) * this.len
      );
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - Math.cos(this.angle) * this.len, this.y - Math.sin(this.angle) * this.len);
      ctx.stroke();
      ctx.restore();
    }
  }

  function spawnShootingStar() {
    if (reducedMotion) return;
    fxParticles.push(new ShootingStar());
  }

  /* ========================================================================
     PROGRESS RAIL
     ======================================================================== */
  const progressFill = $('#progressFill');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressFill.style.width = `${max > 0 ? (scrolled / max) * 100 : 0}%`;
  }, { passive: true });

  /* ========================================================================
     MUSIC
     ======================================================================== */
  const bgMusic = $('#bgMusic');
  const musicToggle = $('#musicToggle');
  let musicStarted = false;

  function startMusic() {
    if (musicStarted) return;
    musicStarted = true;
    bgMusic.volume = 0.55;
    bgMusic.play().catch(() => {});
    musicToggle.classList.remove('hidden');
  }

  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play().catch(() => {});
      musicToggle.classList.remove('paused');
    } else {
      bgMusic.pause();
      musicToggle.classList.add('paused');
    }
  });

  /* ========================================================================
     SECTION 1 — GATE / OPEN SURPRISE
     ======================================================================== */
  const openBtn = $('#openSurpriseBtn');
  const section2 = $('#section2');
  let journeyStarted = false;

  openBtn.addEventListener('click', () => {
    startMusic();
    journeyStarted = true;
    section2.scrollIntoView({ behavior: 'smooth' });
    startCountdown();
  });

  /* ========================================================================
     SECTION 2 — COUNTDOWN → FLASH → CAKE/HB → BALLOONS
     ======================================================================== */
  const countdownWrap = $('#countdownWrap');
  const countdownNum = $('#countdownNum');
  const flashEl = $('#flash');
  const celebrationContent = $('#celebrationContent');
  const balloonsWrap = $('#balloons');
  let countdownRan = false;

  function startCountdown() {
    if (countdownRan) return;
    countdownRan = true;
    const seq = [3, 2, 1];
    let i = 0;

    function tick() {
      if (i >= seq.length) {
        flashEl.classList.add('go');
        setTimeout(() => {
          countdownWrap.classList.add('hidden');
          celebrationContent.classList.remove('hidden');
          burstConfetti(fxCanvas.width / 2, fxCanvas.height * 0.35, 140);
          fireworksShow(2400, section2);
          launchBalloons();
        }, 260);
        return;
      }
      countdownNum.textContent = seq[i];
      countdownNum.classList.remove('pop');
      void countdownNum.offsetWidth;
      countdownNum.classList.add('pop');
      i++;
      setTimeout(tick, 900);
    }
    tick();
  }

  function launchBalloons() {
    if (reducedMotion) return;
    const colors = ['#FF5C8A', '#7A5FFF', '#FFD369', '#FFFFFF'];
    for (let i = 0; i < 14; i++) {
      setTimeout(() => {
        const b = document.createElement('div');
        b.className = 'balloon';
        b.style.left = `${Math.random() * 96}%`;
        b.style.background = `radial-gradient(circle at 32% 28%, rgba(255,255,255,.55), ${colors[i % colors.length]})`;
        b.style.animationDuration = `${Math.random() * 4 + 7}s`;
        balloonsWrap.appendChild(b);
        setTimeout(() => b.remove(), 12000);
      }, i * 220);
    }
  }

  /* ========================================================================
     SECTION 3 — LETTER TYPEWRITER
     ======================================================================== */
  const letterText = `Happy Birthday, Ayesha.

Some people enter our lives quietly, yet somehow leave a mark that words can never fully describe.

Today isn't just your birthday.
It's a reminder that the world became a little more beautiful the day you were born.

I pray that Allah fills your life with happiness, peace, good health, success and endless reasons to smile.

Kabhi kabhi zindagi kuch logon ko itni khubsurti se hamari kahani ka hissa bana deti hai ki unki khushi apni khushi lagne lagti hai.

Dil se dua hai ki Allah tumhari har dua qubool kare.

Tumhare baalon ki woh khushbu... aaj bhi mere zehan mein waise hi mehfooz hai, jaise kal ki baat ho. Shayad kuch yaadein sirf yaad nahi rehtin, balki insaan ka ek hissa ban jaati hain.

Happy Birthday once again.

— Mutayyab ❤️`;

  const letterBody = $('#letterBody');
  const typeCursor = $('#typeCursor');
  let letterTyped = false;

  function typeLetter() {
    if (letterTyped) return;
    letterTyped = true;
    let idx = 0;
    const speed = reducedMotion ? 0 : 16;

    if (reducedMotion) {
      letterBody.textContent = letterText;
      typeCursor.classList.add('done');
      return;
    }

    function step() {
      if (idx <= letterText.length) {
        letterBody.textContent = letterText.slice(0, idx);
        idx++;
        setTimeout(step, speed);
      } else {
        typeCursor.classList.add('done');
      }
    }
    step();
  }

  /* ========================================================================
     SECTION 4 — GALLERY LIGHTBOX
     ======================================================================== */
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxClose = $('#lightboxClose');

  $$('.gallery-card').forEach(card => {
    card.addEventListener('click', () => {
      lightboxImg.src = card.dataset.full;
      lightbox.classList.add('open');
    });
  });
  lightboxClose.addEventListener('click', () => lightbox.classList.remove('open'));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.classList.remove('open'); });

  /* ========================================================================
     SECTION 5 — SONG PLAYER
     ======================================================================== */
  const songPlayBtn = $('#songPlayBtn');
  const songPlayIcon = $('#songPlayIcon');
  const songPauseIcon = $('#songPauseIcon');
  const songBarFill = $('#songBarFill');

  songPlayBtn.addEventListener('click', () => {
    startMusic();
    if (bgMusic.paused) {
      bgMusic.play().catch(() => {});
    } else {
      bgMusic.pause();
    }
  });

  bgMusic.addEventListener('play', () => {
    songPlayIcon.classList.add('hidden');
    songPauseIcon.classList.remove('hidden');
    musicToggle.classList.remove('paused');
  });
  bgMusic.addEventListener('pause', () => {
    songPlayIcon.classList.remove('hidden');
    songPauseIcon.classList.add('hidden');
    musicToggle.classList.add('paused');
  });
  bgMusic.addEventListener('timeupdate', () => {
    if (bgMusic.duration) {
      songBarFill.style.width = `${(bgMusic.currentTime / bgMusic.duration) * 100}%`;
    }
  });

  /* ========================================================================
     SECTION 6 — DUA LINES (sequenced by observer)
     ======================================================================== */
  let duaRan = false;
  function playDua() {
    if (duaRan) return;
    duaRan = true;
    const lines = $$('#duaLines [data-line]');
    lines.forEach((line, i) => {
      setTimeout(() => line.classList.add('is-visible'), i * 750);
    });
  }

  /* ========================================================================
     SECTION 7 — GIFT BOX
     ======================================================================== */
  const giftBoxWrap = $('#giftBoxWrap');
  const giftBox = $('#giftBox');
  const giftMessage = $('#giftMessage');
  let giftOpened = false;

  giftBoxWrap.addEventListener('click', () => {
    if (giftOpened) return;
    giftOpened = true;
    giftBox.classList.add('opened');
    const rect = giftBox.getBoundingClientRect();
    burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 130);
    setTimeout(() => {
      giftMessage.classList.remove('hidden');
      requestAnimationFrame(() => giftMessage.classList.add('is-visible'));
      giftMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 500);
  });

  /* ========================================================================
     SECTION 8 — FINALE (lanterns, fireworks, shooting star)
     ======================================================================== */
  const lanternsWrap = $('#lanterns');
  let finaleRan = false;

  function launchLanterns() {
    if (reducedMotion) return;
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const l = document.createElement('div');
        l.className = 'lantern';
        l.style.left = `${Math.random() * 92}%`;
        l.style.animationDuration = `${Math.random() * 6 + 10}s`;
        lanternsWrap.appendChild(l);
        setTimeout(() => l.remove(), 17000);
      }, i * 500);
    }
  }

  function playFinale() {
    if (finaleRan) return;
    finaleRan = true;
    launchLanterns();
    fireworksShow(3000, $('#section8'));
    spawnShootingStar();
    setTimeout(spawnShootingStar, 1800);
    setTimeout(spawnShootingStar, 3400);
  }

  const replayBtn = $('#replayBtn');
  replayBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ========================================================================
     INTERSECTION OBSERVER — reveal-up + section triggers
     ======================================================================== */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.2 });

  $$('.reveal-up').forEach(el => revealObserver.observe(el));

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      if (id === 'section3') typeLetter();
      if (id === 'section6') playDua();
      if (id === 'section8') playFinale();
    });
  }, { threshold: 0.35 });

  ['section3', 'section6', 'section8'].forEach(id => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });

  /* Fallback: if user never clicks "Open My Surprise" but scrolls into section2 */
  const gateObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !journeyStarted) {
        journeyStarted = true;
        startCountdown();
      }
    });
  }, { threshold: 0.5 });
  gateObserver.observe(section2);

})();
