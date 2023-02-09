const buildGallery = (galleryTitle, contents, galleryEl) => {
  const build = () => {
    const data = contents;
    const galleryElement = galleryEl || document.getElementsByClassName('v-gallery')[0];
    const galleryBody = ix.el('div', {
      class: 'flex-ct v-gallery-body'
    });
    data.forEach((item) => {
      galleryBody.appendChild(ix.el('a', {
        class: 'v-gallery-item flex-ct flex-col',
          href: item.path,
          rel: 'noopener noreferrer',
          target: item.newtab ? '_blank' : '_self'
        }, [
        ix.el('div', {
          class: 'card-header'
        }, [
          ix.el('div', {
            class: 'img-loading-bg item-thumbnail-bg'
          }, [
            ix.el('img', {
              src: item.thumbnail,
              class: 'item-thumbnail',
              title: item.title
            })
          ])
        ]),
        ix.el('div', {
          class: 'card-body'
        }, [
          ix.el('div', {
            class: 'item-title text-ct'
          }, [], item.title),
          ix.el('div', {
            class: 'item-description text-ct'
          }, [], item.description)
        ]),
        ix.el('div', {
          class: 'card-footer'
        })
      ]));
    });
    galleryElement.append(
      ix.el('h1', {id: galleryTitle.toLowerCase(), class: 'v-gallery-title'}, [], galleryTitle),
      galleryBody,
      ix.el('hr')
    );
    ix.el.imgLoadAnim.initAllImg();
  }
  const run = () => {
    try {
      if (ix) build();
    } catch {
      setTimeout(run, 0);
    }
  };
  run();
};