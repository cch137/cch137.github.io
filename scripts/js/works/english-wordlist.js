(() => {
  const run = () => {
    try { if (ix) 1; } catch { return setTimeout(run, 1) };

    const dataSourceSelectEl = ix.el.byId('data-source');
    const wordTitle = ix.el.byId('word-title');
    const wordListEl = ix.el.byId('word-list');
    const wordCardEl = ix.el.byId('word-card');
    const nextBtn = ix.el.byId('next-btn');
    const prevBtn = ix.el.byId('prev-btn');
    const wordDescription = ix.el.byId('word-description');
    const switchContentBtn = ix.el.byId('switch-content');
    const translateView = ix.el.byId('translate-view');
    const translateViewOpenBtn = ix.el.byId('translate-view-open-btn');
    const translateViewCloseBtn = ix.el.byId('translate-view-close-btn');
    const scrollToTopBtn = ix.el.byId('scroll-to-top');
    const resetBtn = ix.el.byId('reset-btn');
    const keysHintEl = ix.el.byId('keys-hint');
    const wordlist = [];
    const previousWordlist = [];
    const nextWordlist = [];
    const wordlistCaches = {};
    let contentMode = 0; // 0: word card; 1: word list;
    let currentWord, currentSourcePath, currentWordlistSource;

    let translateViewIsShow = false;

    ix.el.addListener(translateViewOpenBtn, 'click', () => {
      translateViewOpenBtn.classList.add('op-0');
      translateViewOpenBtn.style.transform = 'translate(-8vw,0)';
      ix.el.lock(translateViewOpenBtn);
      translateView.classList.add('opened');
      translateViewIsShow = true;
    });

    ix.el.addListener(translateViewCloseBtn, 'click', () => {
      translateViewOpenBtn.classList.remove('op-0');
      translateViewOpenBtn.style.transform = '';
      ix.el.unlock(translateViewOpenBtn);
      translateView.classList.remove('opened');
      translateViewIsShow = false;
    });

    const buildWorllist = (callback) => {
      if (currentWordlistSource === currentSourcePath) {
        contentMode = 1;
        switchContentBtn.innerText = '查看字卡';
        if (callback) callback();
        return;
      }
      currentWordlistSource = currentSourcePath;
      wordListEl.innerHTML = '正在加載...';
      setTimeout(() => {
        ix.el.destroyChildren(wordListEl);
        wordListEl.append(...wordlist.map(w => ix.el('li', {}, [
          ix.el('strong', {}, [], w[0]),
          ix.el('div', { style: 'margin-bottom:16px' }, [], w[1])
        ])));
        switchContentBtn.innerText = '查看字卡';
        contentMode = 1;
        if (callback) callback();
      }, 100);
    }

    ix.el.addListener(switchContentBtn, 'click', () => {
      if (contentMode === 0) {
        // 查看 word list
        ix.el.lock(switchContentBtn);
        ix.el.hide(wordCardEl);
        ix.el.hide(keysHintEl);
        ix.el.show(wordListEl);
        ix.el.show(scrollToTopBtn);
        buildWorllist(() => ix.el.unlock(switchContentBtn));
      } else {
        // 查看 word card
        switchContentBtn.innerText = '查看列表';
        contentMode = 0;
        ix.el.hide(wordListEl);
        ix.el.hide(scrollToTopBtn);
        ix.el.show(wordCardEl);
        ix.el.show(keysHintEl);
      }
    });

    ix.el.addListener(scrollToTopBtn, 'click', () => {
      ix.el.scrollToTop(wordListEl);
    });

    ix.el.addListener(doc, 'mouseup', () => {
      if (win.getSelection) {
        const selectedText = win.getSelection().toString();
        if (!selectedText || !translateViewIsShow) return;
        const translateInputEl = translateView.getElementsByTagName('textarea')[0];
        translateInputEl.value = selectedText;
        ix.el.getListener(translateInputEl, 'keyup')();
      }
    });

    const setWord = (wordData) => {
      ix.el.destroyChildren(wordTitle);
      ix.el.destroyChildren(wordDescription);
      wordTitle.appendChild(ix.el('span', {class: 'fadeIn', style: '--trans:.3s'}, [], wordData[0]));
      wordDescription.appendChild(ix.el('span', {class: 'fadeIn', style: '--trans:.3s'}, [], wordData[1]));
      while (previousWordlist.length > wordlist.length) previousWordlist.shift();
      while (nextWordlist.length > wordlist.length) nextWordlist.shift();
      if (previousWordlist.length) {
        if (prevBtn.classList.contains('locked')) {
          prevBtn.classList.remove('locked');
          prevBtn.classList.remove('op-025');
        }
      } else {
        if (!prevBtn.classList.contains('locked')) {
          prevBtn.classList.add('locked');
          prevBtn.classList.add('op-025');
        }
      }
    }

    const previousWord = () => {
      if (!previousWordlist.length) return;
      nextWordlist.push(currentWord);
      currentWord = previousWordlist.pop();
      setWord(currentWord);
    }

    const nextWord = () => {
      if (currentWord) previousWordlist.push(currentWord);
      if (!nextWordlist.length) nextWordlist.push(...ix.chee.random.shuffle(wordlist));
      currentWord = nextWordlist.pop();
      setWord(currentWord);
    }

    doc.onkeyup = (e) => {
      if (e.target != doc.body) return;
      if (['Enter', ' ', 'ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) nextWord(); 
      if (['Backspace', 'ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) previousWord(); 
    }

    ix.el.addListener(nextBtn, 'click', nextWord);
    ix.el.addListener(prevBtn, 'click', previousWord);
    if (!ix.cli.device.isTouchScreen) keysHintEl.innerText = `按下whitespace、enter、pgdn、→ 和 ↓ 可以查看下一個。\n按下backenter、pgup、← 和 ↑ 可以查看上一個。`;

    if (ix.query.has('src')) {
      for (const op of dataSourceSelectEl.children) if (op.innerText === ix.query.get('src')) {
        op.selected = true;
        break;
      }
    }

    const getSourceText = (sourcePath) => {
      if (!wordlistCaches[sourcePath]) {
        const xhr = ix.nw.xhr.get(sourcePath, {async: false});
        if (xhr.status === 200) wordlistCaches[sourcePath] = {text: xhr.responseText};
        else throw 'Resource not found';
      }
      if (currentSourcePath) {
        wordlistCaches[currentSourcePath] = {
          text: wordlistCaches[currentSourcePath].text,
          previous: [...previousWordlist],
          next: [...nextWordlist],
          current: currentWord
        }
      }
      wordlist.length = 0;
      currentSourcePath = sourcePath;
      previousWordlist.length = 0;
      nextWordlist.length = 0;
      previousWordlist.push(...wordlistCaches[sourcePath].previous||[]);
      nextWordlist.push(...wordlistCaches[sourcePath].next||[]);
      currentWord = wordlistCaches[sourcePath].current;
      return wordlistCaches[currentSourcePath].text;
    };
    
    const loadWordlist = () => {
      try {
        const [type, filename] = dataSourceSelectEl.value.split(':');
        const sourcePath = `/static/sources/en-learning/${filename}`;
        for (const op of dataSourceSelectEl.children) if (op.selected) ix.query.set('src', op.innerText, 1);
        switch (type) {
          case '0': // CCH137 list
            text = getSourceText(sourcePath);
            const regex = /^([^=]+)=(.*)?$/;
            wordlist.push(...(text.split('---\r\n')[1] || text.split('---\n')[1] || text.split('---\r')[1]).split('\n').map(row => row.replaceAll('\r','').match(regex).slice(1, 3)));
            break;
          default:
            return ix.popup.throw('Oops! Unable to process data source.');
        }
        nextWord();
        previousWord();
        if (contentMode === 1) buildWorllist();
      } catch (err) {
        ix.popup.throw(err ? `ERROR: ${err}` : 'Oops! Something went wrong!');
      }
    }
    
    ix.el.addListener(dataSourceSelectEl, 'input', loadWordlist);
    ix.el.addListener(resetBtn, 'click', () => {
      for (const i of Object.keys(wordlistCaches)) delete wordlistCaches[i];
      currentSourcePath = null;
      loadWordlist();
    });

    loadWordlist();
  };
  run();
})();