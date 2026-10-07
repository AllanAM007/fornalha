/* ==========================================================================
   AUREVYO — main.js
   Vanilla JS, sem dependências. Cada módulo é independente e falha em
   silêncio se o elemento não existir na página.
   ========================================================================== */

/* EDITAR: canais de contacto. Deixar vazio para esconder. */
const CONTACT = {
  instagram: 'aurevyoagency',
  email: '',        // ex.: 'ola@aurevyo.com'
  whatsapp: '',     // só dígitos, com indicativo — ex.: '351912345678'
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- Ano, relógio, links de contacto ---------- */
(() => {
  $$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

  const clocks = $$('[data-clock]');
  const fmt = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Lisbon' });
  const tick = () => clocks.forEach(el => (el.textContent = fmt.format(new Date())));
  tick();
  setInterval(tick, 15000);

  $$('[data-ig]').forEach(a => (a.href = 'https://www.instagram.com/' + CONTACT.instagram));
  if (CONTACT.email) {
    $$('[data-email]').forEach(a => { a.href = 'mailto:' + CONTACT.email; a.textContent = CONTACT.email; });
    $$('[data-email-row]').forEach(r => (r.hidden = false));
  }
  if (CONTACT.whatsapp) {
    $$('[data-wa]').forEach(a => { a.href = 'https://wa.me/' + CONTACT.whatsapp; a.textContent = 'WhatsApp'; });
    $$('[data-wa-row]').forEach(r => (r.hidden = false));
  }
})();

/* ---------- Navegação: tom por secção, esconder ao descer, menu ---------- */
(() => {
  const nav = $('[data-nav]');
  if (!nav) return;

  // Tom: lê data-tone da secção que está por baixo da barra.
  const toned = $$('[data-tone]').filter(el => el !== nav);
  const setTone = () => {
    const y = nav.offsetHeight / 2;
    for (const sec of toned) {
      const r = sec.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) { nav.dataset.tone = sec.dataset.tone; break; }
    }
  };

  let lastY = scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    if (!nav.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > lastY && y > 400);
    lastY = y;
    setTone();
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', setTone);
  onScroll();

  // Menu fullscreen
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  if (!toggle || !menu) return;
  const label = $('.sr-only', toggle);

  const open = () => {
    menu.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
    nav.classList.add('is-open');
    nav.classList.remove('is-hidden');
    document.body.classList.add('is-locked');
    toggle.setAttribute('aria-expanded', 'true');
    label.textContent = 'Fechar menu';
    $('a', menu)?.focus({ preventScroll: true });
  };
  const close = (restoreFocus = true) => {
    menu.classList.remove('is-open');
    nav.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    toggle.setAttribute('aria-expanded', 'false');
    label.textContent = 'Abrir menu';
    setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduceMotion ? 0 : 800);
    if (restoreFocus) toggle.focus({ preventScroll: true });
  };

  toggle.addEventListener('click', () => (menu.classList.contains('is-open') ? close() : open()));
  $$('a', menu).forEach(a => a.addEventListener('click', () => close(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) close(); });
  matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches && menu.classList.contains('is-open')) close(false); });
})();

/* ---------- Reveal ao entrar no ecrã + intro do hero ---------- */
(() => {
  // Intro: escalonado no carregamento
  $$('[data-intro]').forEach((el, i) => {
    el.style.setProperty('--d', 120 + i * 90);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-in')));
  });

  const items = $$('[data-reveal], .case');
  if (!('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('is-in')); return; }

  // Elementos irmãos dentro da mesma .line/grupo ganham atraso progressivo
  $$('.line > [data-reveal]').forEach(el => {
    const lines = $$('.line', el.closest('h2, h1') || document);
    el.style.setProperty('--d', lines.indexOf(el.parentElement) * 110);
  });
  $$('.cases, .steps, .team, .results').forEach(group => {
    $$(':scope > [data-reveal], :scope > * > [data-reveal]', group).forEach((el, i) => {
      if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', (i % 3) * 90);
    });
  });

  // Um elemento escondido dentro de uma .line está recortado (intersecção 0),
  // por isso observa-se a .line e revela-se o filho.
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const t = e.target;
      (t.classList.contains('line') ? $$(':scope > [data-reveal]', t) : [t]).forEach(el => el.classList.add('is-in'));
      io.unobserve(t);
    });
  }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  new Set(items.map(el => (el.parentElement.classList.contains('line') ? el.parentElement : el))).forEach(el => io.observe(el));
})();

/* ---------- HERO: campo de ruído que se orienta para a atenção ----------
   Uma grelha de traços em ângulos aleatórios (ruído). Perto do cursor
   alinham-se e acendem (atenção). Um único ponto azul fica sempre no
   lugar: a escolha óbvia. Em touch, o "foco" passeia sozinho devagar. */
(() => {
  const canvas = $('[data-field]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;
  const css = getComputedStyle(document.documentElement);
  const ACCENT = css.getPropertyValue('--accent-bright').trim() || '#4D4AFF';

  let W = 0, H = 0, dpr = 1, cells = [], gap = 28, len = 10, dot = { x: 0, y: 0 };
  const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
  let running = false, visible = true, raf = 0, t0 = performance.now();

  const rand = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  function build() {
    const r = hero.getBoundingClientRect();
    W = r.width; H = r.height;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gap = W < 600 ? 24 : W < 1200 ? 28 : 32;
    len = gap * .36;
    cells = [];
    const cols = Math.ceil(W / gap) + 1, rows = Math.ceil(H / gap) + 1;
    const ox = (W - (cols - 1) * gap) / 2, oy = (H - (rows - 1) * gap) / 2;
    // O ponto: à direita, no terço superior (fora do bloco de texto)
    const dc = Math.round(cols * (W < 600 ? .78 : .74)), dr = Math.round(rows * (W < 600 ? .2 : .3));
    dot = { x: ox + dc * gap, y: oy + dr * gap };
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      const base = rand(k) * Math.PI;
      cells.push({ x: ox + i * gap, y: oy + j * gap, base, a: base, l: .14, ph: rand(k + 9) * 6.28, isDot: i === dc && j === dr });
    }
  }

  function draw(now) {
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);

    // Foco automático em ecrãs touch
    if (!pointer.active && !finePointer && !reduceMotion) {
      pointer.tx = W * (.5 + .32 * Math.sin(t * .23));
      // Fica no terço superior para não passar por cima do texto
      pointer.ty = H * (.22 + .1 * Math.sin(t * .31 + 1.3));
    }
    pointer.x = lerp(pointer.x < -999 ? pointer.tx : pointer.x, pointer.tx, .12);
    pointer.y = lerp(pointer.y < -999 ? pointer.ty : pointer.y, pointer.ty, .12);

    const R = Math.max(180, Math.min(W, H) * .32), R2 = R * R;
    const DR = gap * 4.2, DR2 = DR * DR;
    const buckets = Array.from({ length: 6 }, () => new Path2D());

    for (const c of cells) {
      if (c.isDot) continue;
      let target = c.base + (reduceMotion ? 0 : Math.sin(t * .4 + c.ph) * .25);
      let light = .13;

      const dx = pointer.x - c.x, dy = pointer.y - c.y, d2 = dx * dx + dy * dy;
      if (d2 < R2) {
        const f = 1 - Math.sqrt(d2) / R; // 0..1
        const toward = Math.atan2(dy, dx);
        target = angleMix(target, toward, Math.min(1, f * 1.6));
        light = .13 + f * .75;
      }
      // Halo calmo à volta do ponto azul
      const ex = dot.x - c.x, ey = dot.y - c.y, e2 = ex * ex + ey * ey;
      if (e2 < DR2) {
        const f = 1 - Math.sqrt(e2) / DR;
        target = angleMix(target, Math.atan2(ey, ex), f);
        light = Math.max(light, .13 + f * .45);
      }

      c.a = angleMix(c.a, target, reduceMotion ? 1 : .14);
      c.l = lerp(c.l, light, reduceMotion ? 1 : .12);

      const hx = Math.cos(c.a) * len / 2, hy = Math.sin(c.a) * len / 2;
      const b = Math.min(5, Math.floor(c.l * 6));
      buckets[b].moveTo(c.x - hx, c.y - hy);
      buckets[b].lineTo(c.x + hx, c.y + hy);
    }

    ctx.lineWidth = 1.25;
    ctx.lineCap = 'round';
    buckets.forEach((p, i) => {
      ctx.strokeStyle = `rgba(241,239,234,${(.1 + i * .16).toFixed(2)})`;
      ctx.stroke(p);
    });

    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, Math.max(5, gap * .2), 0, Math.PI * 2);
    ctx.fill();

    if (running) raf = requestAnimationFrame(draw);
  }

  function angleMix(a, b, t) {
    // Linhas não têm sentido: comparar em módulo PI
    let d = ((b - a) % Math.PI + Math.PI * 1.5) % Math.PI - Math.PI / 2;
    return a + d * t;
  }

  const start = () => { if (!running && visible && !reduceMotion) { running = true; raf = requestAnimationFrame(draw); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  build();
  if (reduceMotion) draw(performance.now());
  else { draw(performance.now()); start(); }
  canvas.classList.add('is-ready');

  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); if (reduceMotion) draw(performance.now()); }, 150); });

  if (finePointer) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      pointer.tx = e.clientX - r.left; pointer.ty = e.clientY - r.top; pointer.active = true;
      if (reduceMotion) draw(performance.now());
    });
    hero.addEventListener('pointerleave', () => { pointer.tx = pointer.ty = -9999; pointer.active = false; });
  }

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
})();

/* ---------- IMPACT: alavancas (hover no desktop, toque no mobile) ---------- */
(() => {
  const list = $('[data-levers]');
  if (!list) return;
  const levers = $$('[data-lever]', list);
  const set = (lv) => {
    levers.forEach(l => {
      const on = l === lv;
      l.classList.toggle('is-active', on);
      $('.lever__word', l).setAttribute('aria-expanded', String(on));
    });
    list.classList.toggle('has-active', !!lv);
  };
  levers.forEach(lv => {
    const btn = $('.lever__word', lv);
    btn.addEventListener('click', () => set(lv.classList.contains('is-active') && !finePointer ? null : lv));
    if (finePointer) {
      lv.addEventListener('pointerenter', () => set(lv));
      btn.addEventListener('focus', () => set(lv));
    }
  });
  if (finePointer) list.addEventListener('pointerleave', () => set(null));
  else set(levers[0]);
})();

/* ---------- WORK: paralaxe subtil da capa com o rato ---------- */
(() => {
  if (!finePointer || reduceMotion) return;
  $$('[data-tilt]').forEach(cover => {
    const layer = $('.cover__layer', cover) || cover;
    const link = cover.closest('a') || cover;
    link.addEventListener('pointermove', e => {
      const r = cover.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      layer.style.setProperty('--tx', (x * -14).toFixed(1) + 'px');
      layer.style.setProperty('--ty', (y * -14).toFixed(1) + 'px');
    });
    link.addEventListener('pointerleave', () => { layer.style.setProperty('--tx', '0px'); layer.style.setProperty('--ty', '0px'); });
  });
})();

/* ---------- MANIFESTO: palavras acendem com o scroll ---------- */
(() => {
  const paras = $$('[data-scrub]');
  if (!paras.length || reduceMotion) return;
  const words = [];
  paras.forEach(p => {
    const parts = p.textContent.trim().split(/\s+/);
    p.textContent = '';
    parts.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w'; s.textContent = w;
      p.append(s, i < parts.length - 1 ? ' ' : '');
      words.push(s);
    });
  });
  const box = paras[0].parentElement;
  let ticking = false;
  const update = () => {
    const r = box.getBoundingClientRect();
    const vh = innerHeight;
    // 0 quando o topo do bloco está a 85% do ecrã, 1 quando o fundo chega a 55%
    const p = clamp((vh * .85 - r.top) / (r.height + vh * .3), 0, 1);
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('is-on', i < n));
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();

/* ---------- SERVICES: número fixo acompanha a categoria ---------- */
(() => {
  const sec = $('.services');
  const digits = $('[data-svc-digits]');
  const items = $$('[data-svc]');
  if (!sec || !items.length) return;
  const mq = matchMedia('(min-width: 901px)');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      items.forEach(i => i.classList.toggle('is-current', i === e.target));
      digits?.style.setProperty('--i', e.target.dataset.svc);
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  items.forEach(i => io.observe(i));
  const sync = () => sec.classList.toggle('is-tracking', mq.matches);
  mq.addEventListener('change', sync); sync();
  items[0].classList.add('is-current');
})();

/* ---------- PROCESS: linha preenche com o scroll ---------- */
(() => {
  const steps = $('[data-steps]');
  const fill = $('[data-steps-fill]');
  if (!steps || !fill) return;
  let ticking = false;
  const update = () => {
    const r = steps.getBoundingClientRect();
    const p = clamp((innerHeight * .6 - r.top) / r.height, 0, 1);
    fill.style.setProperty('--p', p.toFixed(4));
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();

/* ---------- Contadores ---------- */
(() => {
  const els = $$('[data-count]');
  if (!els.length) return;
  const run = el => {
    const end = +el.dataset.count, pad = +(el.dataset.pad || 0), dur = 1400, t0 = performance.now();
    const step = now => {
      const k = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 4);
      el.textContent = String(Math.round(end * e)).padStart(pad, '0');
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  els.forEach(el => (el.textContent = '0'.padStart(+(el.dataset.pad || 0), '0')));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: .4 });
  els.forEach(el => io.observe(el));
})();

/* ---------- Botões magnéticos ---------- */
(() => {
  if (!finePointer || reduceMotion) return;
  $$('[data-magnetic]').forEach(btn => {
    btn.style.transition += ', transform .6s cubic-bezier(.16,1,.3,1)';
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .18, y = (e.clientY - r.top - r.height / 2) * .3;
      btn.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    btn.addEventListener('pointerleave', () => (btn.style.transform = ''));
  });
})();

/* ---------- Cursor personalizado ---------- */
(() => {
  const el = $('[data-cursor-el]');
  if (!el || !finePointer || reduceMotion) return;
  document.documentElement.classList.add('has-cursor');
  const label = $('[data-cursor-label]', el);
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, shown = false;

  addEventListener('pointermove', e => {
    x = e.clientX; y = e.clientY;
    if (!shown) { cx = x; cy = y; shown = true; el.classList.remove('is-hidden'); }
    const t = e.target.closest?.('[data-cursor], a, button, label, input, textarea');
    const lab = t?.closest('[data-cursor]')?.dataset.cursor;
    el.classList.toggle('is-label', !!lab);
    el.classList.toggle('is-link', !lab && !!t && !t.matches('input, textarea'));
    el.classList.toggle('is-hidden', !!t?.matches('input, textarea'));
    if (lab) label.textContent = lab;
    el.classList.toggle('on-accent', !!e.target.closest?.('[data-tone="accent"]'));
  }, { passive: true });
  document.addEventListener('pointerleave', () => { el.classList.add('is-hidden'); shown = false; });

  const loop = () => {
    cx = lerp(cx, x, .2); cy = lerp(cy, y, .2);
    el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
    requestAnimationFrame(loop);
  };
  el.classList.add('is-hidden');
  loop();
})();

/* ---------- CONTACT: pré-seleção de interesse + envio ----------
   Sem backend: compõe a mensagem e abre WhatsApp (se configurado) ou o
   Direct do Instagram, copiando o texto para colar. Para usar um serviço
   de formulários (Formspree, Netlify Forms...), substituir send(). */
(() => {
  const form = $('[data-form]');
  if (!form) return;
  const status = $('[data-form-status]', form);

  $$('[data-interest]').forEach(a => a.addEventListener('click', () => {
    const box = $(`input[name="interesse"][value="${a.dataset.interest}"]`, form);
    if (box) box.checked = true;
  }));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', form).forEach(inp => {
      const bad = !inp.value.trim();
      inp.closest('.field')?.classList.toggle('is-invalid', bad);
      inp.setAttribute('aria-invalid', String(bad));
      if (bad && ok) { inp.focus(); ok = false; }
    });
    if (!ok) { status.textContent = 'Faltam alguns campos — nome, empresa e contacto.'; return; }

    const d = new FormData(form);
    const interest = d.getAll('interesse').join(', ') || '—';
    const msg = [
      'Olá Aurevyo! Quero começar um projeto.',
      `Nome: ${d.get('nome')}`,
      `Empresa: ${d.get('empresa')}`,
      `Contacto: ${d.get('contacto')}`,
      `Interesse: ${interest}`,
      d.get('mensagem') ? `Mensagem: ${d.get('mensagem')}` : '',
    ].filter(Boolean).join('\n');

    if (CONTACT.whatsapp) {
      window.open(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
      status.textContent = 'A abrir o WhatsApp com a sua mensagem.';
      return;
    }
    let copied = false;
    try { await navigator.clipboard.writeText(msg); copied = true; } catch (_) {}
    window.open('https://ig.me/m/' + CONTACT.instagram, '_blank', 'noopener');
    status.textContent = copied
      ? 'Mensagem copiada. Cole-a na conversa do Instagram que acabou de abrir.'
      : 'Abrimos o Instagram — envie-nos os seus dados por mensagem.';
  });

  $$('[required]', form).forEach(inp => inp.addEventListener('input', () => {
    if (inp.value.trim()) { inp.closest('.field')?.classList.remove('is-invalid'); inp.removeAttribute('aria-invalid'); }
  }));
})();
