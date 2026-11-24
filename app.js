/* Show supplied brand assets only after they load. */
for (const image of document.querySelectorAll('.brand-image,.naranja-image')) { const show=()=>{image.hidden=false;if(image.classList.contains('brand-image'))image.nextElementSibling.hidden=true;};image.addEventListener('load',show);if(image.complete&&image.naturalWidth>0)show();}

/* Each catalog opens its own accessible product gallery. */
(() => {
  const groups = [...document.querySelectorAll('.product-grid,.basket-grid')];
  if (!groups.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'product-dialog';
  dialog.setAttribute('aria-labelledby', 'detail-title');
  dialog.innerHTML = `<div class="detail-layout">
    <div class="detail-visual"></div>
    <div class="detail-content">
      <button type="button" class="detail-close" aria-label="Cerrar detalle del producto" autofocus>×</button>
      <p class="eyebrow detail-category"></p>
      <h2 id="detail-title"></h2>
      <p class="detail-presentation"></p>
      <div class="detail-price"></div>
      <p class="detail-unit"></p>
      <div class="detail-description"></div>
      <p class="detail-status" role="status" aria-live="polite" aria-atomic="true"></p>
      <div class="detail-navigation">
        <button type="button" class="detail-prev"><span aria-hidden="true">‹</span> Anterior</button>
        <button type="button" class="detail-next">Siguiente <span aria-hidden="true">›</span></button>
      </div>
    </div>
  </div>`;
  document.body.append(dialog);
  const find = selector => dialog.querySelector(selector);
  let cards = [], index = 0, opener;
  const render = () => {
    const card = cards[index];
    const section = card.closest('section');
    const title = card.querySelector('h3').textContent;
    find('#detail-title').textContent = title;
    find('.detail-category').textContent = section.querySelector('h2').textContent;
    const photo = card.querySelector('.product-photo img');
    const visual = find('.detail-visual');
    visual.replaceChildren();
    if (photo) {
      const image = photo.cloneNode(true);
      image.loading = 'eager';
      visual.append(image);
    } else {
      const illustration = card.querySelector('.basket-illustration');
      if (illustration) visual.append(illustration.cloneNode(true));
    }
    find('.detail-presentation').textContent = card.querySelector('.product-presentation')?.textContent || 'Canasta de 7 productos';
    find('.detail-price').replaceChildren(card.querySelector('.product-price').cloneNode(true));
    find('.detail-unit').textContent = card.querySelector('.product-unit')?.textContent || '';
    const description = find('.detail-description');
    description.replaceChildren();
    const list = card.querySelector('.basket-content ul');
    if (list) {
      const heading = document.createElement('p');
      heading.textContent = 'Esta canasta incluye:';
      const contents = list.cloneNode(true);
      contents.hidden = false;
      description.append(heading, contents);
    }
    const note = section.querySelector('.catalog-note');
    if (note) {
      const paragraph = document.createElement('p');
      paragraph.className = 'note';
      paragraph.textContent = note.textContent;
      description.append(paragraph);
    }
    find('.detail-status').textContent = (index + 1) + ' de ' + cards.length + ' · ' + title;
    find('.detail-navigation').hidden = cards.length < 2;
  };
  const move = step => { index = (index + step + cards.length) % cards.length; render(); };
  for (const group of groups) {
    for (const card of group.querySelectorAll('.product-card,.basket-card')) {
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'product-open';
      trigger.setAttribute('aria-label', 'Ver detalle de ' + card.querySelector('h3').textContent);
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.innerHTML = '<span>Ver detalles <span aria-hidden="true">↗</span></span>';
      card.append(trigger);
      trigger.addEventListener('click', () => {
        cards = [...group.querySelectorAll('.product-card,.basket-card')];
        index = cards.indexOf(card);
        opener = trigger;
        render();
        dialog.showModal();
        document.body.classList.add('detail-open');
      });
    }
  }
  find('.detail-close').addEventListener('click', () => dialog.close());
  find('.detail-prev').addEventListener('click', () => move(-1));
  find('.detail-next').addEventListener('click', () => move(1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('detail-open');
    opener?.focus({ preventScroll: true });
  });
})();
