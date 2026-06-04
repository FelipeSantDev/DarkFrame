document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('[data-reveal]');

  // Se usuário prefere reduzir movimento: mostra tudo e sai
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // Função: checa se elemento já está visível na janela
  const isInjanelaNow = (el, offset = 0) => {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;

    // visível se o topo já entrou e a base ainda não passou
    return rect.top < vh - offset && rect.bottom > 0;
  };

  // 1) Tudo que já nasceu visível -> já aparece (sem animação)
  revealElements.forEach((el) => {
    if (isInjanelaNow(el, 80)) {
      // 80px de folga, ajuste se quiser
      el.classList.add('is-visible');
    }
  });

  // 2) Observer anima apenas o que ainda NÃO está visível
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = Number(entry.target.dataset.delay || 0);

          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, delay);

          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px',
    },
  );

  revealElements.forEach((el) => {
    // só observa quem ainda não ficou visível na carga
    if (!el.classList.contains('is-visible')) {
      observer.observe(el);
    }
  });
});

// carrossel
(() => {
  const root = document.querySelector('[data-carrossel]');
  if (!root) return;

  const janela = root.querySelector('[data-carrossel-janela]');
  const faixa = root.querySelector('[data-carrossel-faixa]');
  const deslizars = Array.from(
    root.querySelectorAll('[data-carrossel-deslizar]'),
  );

  const btnPrev = root.querySelector('[data-carrossel-prev]');
  const btnproximo = root.querySelector('[data-carrossel-proximo]');
  const dotsWrap = root.querySelector('[data-carrossel-dots]');

  // Preferência do usuário (acessibilidade)
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  let index = 0;
  let deslizarWidth = 0;

  // --- Dots ---
  const dots = deslizars.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'portfolio__dot';
    b.setAttribute('aria-label', `Ir para projeto ${i + 1}`);
    b.addEventListener('click', () => goTo(i));
    dotsWrap?.appendChild(b);
    return b;
  });

  function setActiveDot(i) {
    dots.forEach((d, idx) => {
      d.classList.toggle('is-active', idx === i);
      d.setAttribute('aria-current', idx === i ? 'true' : 'false');
    });
  }

  // --- Layout calc ---
  function measure() {
    deslizarWidth = janela.getBoundingClientRect().width;
    // Reposiciona sem animação para evitar "pulo"
    const prev = faixa.style.transition;
    faixa.style.transition = 'none';
    translate();
    // força reflow
    faixa.getBoundingClientRect();
    faixa.style.transition = prev;
  }

  function translate() {
    faixa.style.transform = `translateX(${-index * deslizarWidth}px)`;
  }

  function goTo(i) {
    index = Math.max(0, Math.min(i, deslizars.length - 1));
    faixa.style.transition = reduceMotion ? 'none' : 'transform 0.7s ease';
    translate();
    setActiveDot(index);
    updateNav();
  }

  function updateNav() {
    if (btnPrev) btnPrev.disabled = index === 0;
    if (btnproximo) btnproximo.disabled = index === deslizars.length - 1;
  }

  // --- Nav buttons ---
  btnPrev?.addEventListener('click', () => goTo(index - 1));
  btnproximo?.addEventListener('click', () => goTo(index + 1));

  // --- Swipe (touch + mouse) ---
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  function onStart(clientX) {
    isDragging = true;
    startX = clientX;
    currentX = clientX;
    faixa.style.transition = 'none';
  }

  function onMove(clientX) {
    if (!isDragging) return;
    currentX = clientX;
    const dx = currentX - startX;
    // “arrasta” junto
    faixa.style.transform = `translateX(${-index * deslizarWidth + dx}px)`;
  }

  function onEnd() {
    if (!isDragging) return;
    isDragging = false;

    const dx = currentX - startX;
    const threshold = Math.min(120, deslizarWidth * 0.2); // limite elegante
    if (dx > threshold) goTo(index - 1);
    else if (dx < -threshold) goTo(index + 1);
    else goTo(index); // volta pro lugar
  }

  // Touch
  janela.addEventListener('touchstart', (e) => onStart(e.touches[0].clientX), {
    passive: true,
  });
  janela.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX), {
    passive: true,
  });
  janela.addEventListener('touchend', onEnd);

  // Mouse (desktop arrastar opcional)
  janela.addEventListener('mousedown', (e) => onStart(e.clientX));
  window.addEventListener('mousemove', (e) => onMove(e.clientX));
  window.addEventListener('mouseup', onEnd);

  // Init
  window.addEventListener('resize', measure);
  measure();
  setActiveDot(index);
  updateNav();
  goTo(0);
})();
