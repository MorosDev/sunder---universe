/* sonder. — «El origen»: la revelación final */
(function (SU) {
  'use strict';
  const S = () => SU.store.s;

  /* La carta se conserva tal como fue escrita. */
  const LETTER = [
    'Estaba pensando en cómo sorprenderte, así que pensé que tal vez una red social tuya haría algo especial.',
    'Pensé en el universo porque es muy extenso. Y la idea de que cada mundo sea una persona viene de que pienso que posiblemente tú serás mi mundo y que tienes mucho que puedo descubrir.'
  ];
  const SIGN = 'Atte: Moisés.';

  SU.origin = {
    open() {
      const name = (S().profile.name || '').trim();
      const stars = Array.from({ length: 70 }, (_, i) =>
        `<i style="left:${SU.hash('ox' + i) % 100}%;top:${SU.hash('oy' + i) % 100}%;animation-delay:${(i % 9) * 0.35}s;opacity:${0.3 + (i % 5) / 7}"></i>`).join('');
      const lines = [
        { cls: 'o-kicker', html: 'El origen' },
        { cls: 'o-line', html: 'Cada mundo que visitaste estaba hecho de preguntas. Ninguna tenía una respuesta correcta.' },
        { cls: 'o-line', html: 'Sonder Universe no se hizo para cualquier persona.' },
        { cls: 'o-line o-strong', html: `Se hizo para ti${name ? ', ' + SU.esc(name) : ''}.` }
      ];
      let k = 0;
      const delay = () => (k++) * 1.5;
      SU.nav.push({
        layer: 'universe', cls: 'origin-screen',
        render(el) {
          el.innerHTML = `<div class="o-sky">${stars}</div>
            <button class="icon-btn o-close" data-act="back" aria-label="Cerrar">${SU.icon('close')}</button>
            <div class="o-wrap">
              ${lines.map((l) => `<p class="${l.cls} o-in" style="animation-delay:${delay()}s">${l.html}</p>`).join('')}
              <article class="o-letter o-in" style="animation-delay:${delay() + 0.6}s">
                ${LETTER.map((p) => `<p class="o-in" style="animation-delay:${delay() + 0.8}s">${SU.esc(p)}</p>`).join('')}
                <p class="o-sign o-in" style="animation-delay:${delay() + 1}s">${SU.esc(SIGN)}</p>
              </article>
              <div class="o-foot o-in" style="animation-delay:${delay() + 1.4}s">
                <p>Los ocho mundos siguen aquí. Puedes volver cuando quieras.</p>
                <button class="btn btn-soft" data-act="back">Volver al universo</button>
              </div>
            </div>
            <div class="o-skip">Toca para mostrar todo</div>`;
          el.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            el.classList.add('o-all');
          }, { once: false });
        }
      });
      S().origin.seen = Date.now();
      SU.store.save();
    }
  };
  SU.actions.openOrigin = () => {
    // desde Configuración: abrir el universo y luego la carta
    if (!SU.universe.active) SU.universe.open();
    setTimeout(() => SU.origin.open(), 350);
  };
})(window.SU);
