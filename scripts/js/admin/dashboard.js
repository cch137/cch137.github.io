(() => {
  const adminKey = ix.cookies.get('admin-key');
  const consoleInput = ix.el.byId('console-input');
  const consoleView = ix.el.byId('console-view');
  const consoleClsBtn = ix.el.byId('console-cls-btn');

  ix.el.blockPasteHTML(consoleInput);

  const consolePrint = message => {
    if (!message) return;
    consoleView.appendChild(ix.el('pre', {}, [], message));
    consoleView.scrollTop = consoleView.clientHeight * 1000000;
  }
  
  const consoleCls = () => consoleView.innerHTML = '';

  const build = () => {
    let started = false;
    
    const socket = ix.io();

    const logout = () => {
      ix.cookies.remove('admin-key', '/');
      location = '/about';
    }

    const sendCommand = (command) => {
      socket.emit('execCommand', command);
    }

    socket.on('connect', () => {
      if (started) loc.reload();
      started = true;
      socket.emit('joinAdminSocket', adminKey+'a');
    });

    socket.on('disconnect', () => {
      consolePrint('Waiting for server response...');
    });

    socket.on('updateConfig', config => {
      ix.chee.config = config;
    })

    socket.on('consolePrint', message => {
      consolePrint(message);
    })

    const actionButtons = doc.getElementsByClassName('action-btn');
    for (const btn of actionButtons) {
      const action = btn.id;
      ix.el.addListener(btn, 'click', () => {
        socket.emit('execAction', action);
        consoleInput.focus();
      });
    };

    const changeConfig = (key, value) => socket.emit('changeConfig', [key, value]);

    ix.el.addListener(ix.el.byId('logout-admin-account'), 'click', logout);
    ix.el.setupSwitch(ix.el.byId('minified-code-switch'), (v) => changeConfig('minifiedCodes', v), ix.chee.config.minifiedCodes);
    ix.el.setupSwitch(ix.el.byId('dc-bot-switch'), (v) => changeConfig('runDcBot', v), ix.chee.config.runDcBot);

    ix.el.addListener(consoleInput, 'keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const command = consoleInput.innerText;
        switch (command) {
          case 'cls':
            consoleCls();
            break;
          default:
            sendCommand(command);
        } 
        consoleInput.innerText = '';
        consoleInput.focus();
      }
    });

    ix.el.addListener(consoleClsBtn, 'click', () => {
      consoleCls();
      consoleInput.focus();
    });

    let escCount = 0, delCount = 0;
    doc.onkeyup = (e) => {
      if (e.key === 'Escape') {
        escCount ++;
        if (escCount > 2) {
          if (history.length > 1) history.back();
          else location = '/about';
        }
      } else escCount = 0;
      if (e.key === 'Delete') {
        delCount ++;
        if (delCount > 2) logout();
        return;
      } else delCount = 0;
    }
  }
  consoleInput.focus();
  (() => {
    const run = () => {
      try { if (ix) 1 } catch { return setTimeout(run, 1) }
      build();
    }; run();
  })();
})();