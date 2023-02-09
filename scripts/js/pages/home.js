(() => {
  const run = () => {
    try { if (ix) 1 } catch { return setTimeout(run, 1) };

    const strSidebarClosed = atob('c2lkZWJhci1jbG9zZWQ='); // sidebar-closed
    const sidebar = ix.el.q('#ix-sidebar');

    const ui = {
      get data() {
        const data = ix.cli.local.get('ui');
        if (typeof data === 'object' && !Array.isArray(data)) {
          return ix.calcs.checkKeys(data, [strSidebarClosed]);
        }
        return {};
      },
      get: (key) => {
        return ui.data[key];
      },
      set: (key, value) => {
        const data = ui.data;
        data[key] = value;
        ix.cli.local.set('ui', data);
      }
    };

    if (ui.get(strSidebarClosed) || ix.cli.device.isMobile) doc.body.classList.add(strSidebarClosed);
    else doc.body.classList.remove(strSidebarClosed);

    ix.el.addListener(ix.el.byId('ix-hd-menu-btn'), 'click', () => {
      if (doc.body.classList.contains(strSidebarClosed)) {
        doc.body.classList.remove(strSidebarClosed);
        ui.set(strSidebarClosed, 0);
      } else {
        doc.body.classList.add(strSidebarClosed);
        ui.set(strSidebarClosed, 1);
      }
    });

    setTimeout(() => {
      [sidebar, sidebar.parentElement, sidebar.parentElement.nextElementSibling]
      .forEach(el => el.classList.replace('trans-0', 'trans-03'));
    }, ix.cli.device.isMobile?0:100);
    
  }
  run();
})();