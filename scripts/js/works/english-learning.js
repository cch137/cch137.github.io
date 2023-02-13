(() => {
  const run = () => {
    try { if (ix) 1 } catch { return setTimeout(run, 1) };
    if (loc.pathname.split('').pop() != '/') his.pushState(0, 0, loc.pathname + '/');

    (() => {
      const socket = ix.api.socket;

      let lastCallId = null, lastCallValue = null, connected = false;

      const txArea = (t=1) => ix.el(t?'textarea':'div', {
        class: 'w-100 tx-100 textarea no-rsz pd-16 bg-950',
        placeholder: t ? '請輸入需要翻譯的文本（中文 / 英文）' : '翻譯結果會被展示在這裡',
        autofocus: t ? true : false,
        maxlength: 5000
      });

      const translateWrapper = ix.el.byId('translate-wrapper');
      const transInputEl = txArea();
      const transOutputEl = txArea(0);
      const transOutputLangEl = ix.el('span', {class:'flex-1'});
      const transControl = ix.el('div', {style: 'padding:16px'});

      let built = false;
      const build = () => {
        if (built) return;
        const clearTextareaBtn = ix.el('span', {class:'no-select v-btn mg-0',style:'min-width:fit-content;padding:2px 8px;'}, 'X');
        const copyInputBtn = ix.el('span', {class:'no-select mg-0 txarea-btn op-075'}, 'Copy text');
        const copyOutputBtn = ix.el('span', {class:'no-select mg-0 txarea-btn op-075'}, 'Copy text');
        ix.el.addListener(clearTextareaBtn, 'click', () => {
          transInputEl.value = '';
          transOutputEl.innerText = '';
          transOutputLangEl.innerText = '';
          lastCallValue = '';
          transInputEl.focus();
        });
        ix.el.copyBtnSetup(copyInputBtn, () => transInputEl.value);
        ix.el.copyBtnSetup(copyOutputBtn, () => transOutputEl.innerText);
        ix.el.addListener(transInputEl, 'keyup', () => {
          const text = transInputEl.value.trim();
          if (!text) return clearTextareaBtn.click();
          if (lastCallValue === text) return;
          transOutputLangEl.innerText = '正在觀察輸入...';
          const id = ix.chee.random.base64(8);
          lastCallId = id;
          lastCallValue = text;
          setTimeout(() => {
            if (lastCallId != id) return;
            socket.emit('useAPI', {
              name: 'translate',
              data: { id, text }
            });
          }, 300);
        });
        translateWrapper.append(...[
          ix.el('h2', 0, '翻譯'),
          ix.el('div', {id:'translate-view',class:'flex-ct w-100'}, [
            ix.el('div', {class:'flex-col flex-1 bd-1px bd-r-8 ovf-hd'}, [
              ix.el('div', {class:'w-100 flex-lf text-lf op-8',style:'padding:8px 16px'}, [
                ix.el('span', {class:'flex-1'}, '偵測語言'),
                copyInputBtn,
                clearTextareaBtn
              ]),
              transInputEl
            ]),
            transControl,
            ix.el('div', {class:'flex-col flex-1 bd-1px bd-r-8 ovf-hd'}, [
              ix.el('div', {class:'w-100 flex-lf text-lf',style:'padding:8px 16px'}, [
                ix.el('span',{class:'op-075'}, '翻譯結果：'),
                transOutputLangEl,
                copyOutputBtn
              ]),
              transOutputEl
            ])
          ]),
          ix.el('hr', {style:'margin-top:32px;'})
        ]);
        built = true;
      };

      ix.api.onConnected = build;

      socket.on('disconnect', () => {
        connected = false;
        setTimeout(() => {
          if (connected) return;
          ix.popup.message('連接中斷，刷新頁面以重新連接。', {callback:()=>loc.reload()});
        }, 5000);
      });

      ix.api.setHandler('translate', data => {
        if (data.id != lastCallId) return;
        transOutputEl.innerText = data.text || '';
        transOutputLangEl.innerText = data.lang ? ( data.lang[0] === '中' ? '英文' : '中文') : '';
        console.log('api time used:', data.timeUsed);
      });
    })();
  };
  run();
})();