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

// menu do cabeçalho
(() => {
  const cabecalho = document.querySelector('[data-cabecalho]');
  const botao = document.querySelector('[data-menu-botao]');
  const menu = document.querySelector('[data-menu]');
  if (!cabecalho || !botao || !menu) return;

  function fecharMenu() {
    menu.classList.remove('is-aberto');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-label', 'Abrir menu');
  }

  botao.addEventListener('click', () => {
    const aberto = menu.classList.toggle('is-aberto');
    botao.setAttribute('aria-expanded', String(aberto));
    botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  });

  // Fecha ao escolher um link ou apertar Esc
  menu.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', fecharMenu),
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharMenu();
  });

  // Fundo do cabeçalho mais sólido depois de rolar
  const marcarRolagem = () =>
    cabecalho.classList.toggle('is-rolado', window.scrollY > 20);
  window.addEventListener('scroll', marcarRolagem, { passive: true });
  marcarRolagem();
})();

// ano do rodapé
document.querySelectorAll('[data-ano]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
