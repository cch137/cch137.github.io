const win = window, doc = document, loc = location, his = history;

const ix = (() => {
  const nw = {
    fetchSync: async (url, options={}) => await fetch(url, options),
    evalFetchScript: (url) => {
      const xhr = nw.xhr.get(url,{headers:{'mode':'no-cors'},async:false,cache:'force-cache'});
      eval(xhr.responseText);
    },
    xhr: {
      get(url, options={}) {
        const xhr = new XMLHttpRequest();
        if (!('async' in options)) options.async = true;
        xhr.open('GET', url, options.async);
        if (options.headers) {
          for (const h in options.headers) {
            xhr.setRequestHeader(h, options.headers[h]);
          }
        };
        xhr.send();
        return xhr;
      },
      post: (url, data='', options={contentType:'form',async:true,responseType:''}, callback=(xhr)=>{}) => {
        const xhr = new XMLHttpRequest;
        xhr.open('POST', url, 'async' in options ? options.async : true);
        switch(options.contentType.toLowerCase()) {
          case 'json':
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            break;
          case 'form':
          default:
            xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (options.responseType) xhr.responseType = options.responseType;
        xhr.onerror = (e) => {if (xhr.status != 200) alert(`Oops! Something went wrong. [Error: ${xhr.status} ${xhr.statusText}]`) };
        xhr.onloadend = (e) => {};
        if (typeof data === 'object') data = JSON.stringify(data);
        xhr.send(data);
        if (callback) xhr.onload = () => callback(xhr);
        return xhr;
      }
    }
  };
  return {
    nw,
    get chee() {
      try {
        nw.evalFetchScript('/scr/js/chee.js');
        Object.defineProperty(ix, 'chee', {
          writable: true,
          value: chee
        });
        delete chee;
        return ix.chee;
      } catch {
        console.warn(`Missing component: chee.js`);
      }
    },
    io: () => {
      try {
        nw.evalFetchScript('/socket.io/socket.io.js');
        ix.io = io;
        io = null;
        delete io;
        const _io = ix.io();
        return _io;
      } catch {
        console.warn(`Missing component: socket.io`);
      }
    },
    api: (() => {
      let apiSocket, connectedCallback;
      const handlers = {};
      return {
        handlers,
        /**
         * @param {() => void} callback
         */
        set onConnected(callback) {
          if (apiSocket.connected) callback();
          else connectedCallback = callback;
        },
        get socket() {
          return apiSocket ? apiSocket : (() => {
            apiSocket = ix.io();
            apiSocket.emit('connectAPISocket');
            apiSocket.on('APIResponse', ({name, data}) => {
              if (handlers[name]) return handlers[name](data);
            });
            ix.api.setHandler('APIconnected', s => {
              console.log(s);
              if (connectedCallback) connectedCallback();
            });
            ix.api.setHandler('error', s => ix.popup.message(s?s:'Oops! Something went wrong!'));
            return apiSocket;
          })();
        },
        userdata(callback) {
          ix.api.setHandler('userdata', callback);
          ix.api.send('userdata');
        },
        setHandler(apiName, callback) {
          handlers[apiName] = callback;
        },
        removeHandler(apiName) {
          delete handlers[apiName];
        },
        send(name, data) {
          apiSocket.emit('useAPI', {name, data});
        }
      };
    })(),
    el: (() => {
      const __elRenderer = (el, attributes={}, children=[], innerText='') => {
        if (children && !Array.isArray(children)) children = [children];
        if (Array.isArray(attributes.class)) attributes.class = attributes.class.join(' ');
        for (const attr in attributes) el.setAttribute(attr, attributes[attr]);
        if (children.length) el.append(...children);
        if (innerText) el.innerText = innerText;
        return el;
      }
      const ixEl = (tagName='div', attributes={}, children=[], innerText='') => {
        const el = doc.createElement(tagName);
        return __elRenderer(el, attributes, children, innerText);
      }
      ixEl.new = ixEl;
      ixEl.ns = (qualifiedName='svg', attributes={}, children=[], namespaceURI = 'http:\/\/www.w3.org/2000/svg') => {
        const el = doc.createElementNS(namespaceURI, qualifiedName);
        return __elRenderer(el, attributes, children);
      }
      ixEl.setAttr = (el, attr, value) => el.setAttribute(attr, value);
      ixEl.getAttr = (el, attr) => el.getAttribute(attr);
      ixEl.rmvAttr = (el, attr) => el.removeAttribute(attr);
      ixEl.getAttrs = (el) => {
        const attrs = {};
        [...el.attributes].forEach(attr => {
          if (attr.value) attrs[attr.name] = attr.value;
        });
        return attrs;
      };
      ixEl.collections = {};
      const elData = (el) => {
        if (!ix.el.collections[el]) {
          ix.el.collections[el] = {
            listners: {}
          };
        }
        return ix.el.collections[el];
      };
      ixEl.removeData = (el) => {delete ix.el.collections[el]};
      ixEl.addListener = (el, eventName, handler) => {
        // if (ix.el.getListener(el, eventName)) ix.el.rmvListener(el, eventName);
        elData(el).listners[eventName] = handler;
        el.addEventListener(eventName, elData(el).listners[eventName]);
      };
      ixEl.rmvListener = (el, eventName, handler) => {
        el.removeEventListener(eventName, handler || elData(el).listners[eventName]);
        delete elData(el).listners[eventName];
      };
      ixEl.getListener = (el, eventName) => {
        el = elData(el);
        if (el) return el.listners[eventName];
        return undefined;
      }
      ixEl.getAllListeners = (el) => ix.el.collections[el].listners;
      ixEl.hide = (el) => el.classList.add('hidden');
      ixEl.show = (el) => el.classList.remove('hidden');
      ixEl.lock = (el) => el.classList.add('locked');
      ixEl.unlock = (el) => el.classList.remove('locked');
      ixEl.childrenR = (el) => {
        const elements = [...el.children];
        const _elements = [el, ...elements];
        for (const i of elements) ix.el.childrenR(i).forEach(j => _elements.push(j));
        return _elements;
      }
      ixEl.destroyChildren = (el) => {
        const elements = [...el.childNodes];
        while (elements.length) elements.pop().remove();
      }
      ixEl.destroy = (el) => {
        ix.el.destroyChildren(el);
        el.remove();
      }
      ixEl.byId = (id) => doc.getElementById(id);
      ixEl.q = (selector) => doc.querySelector(selector);
      ixEl.qAll = (selector) => doc.querySelectorAll(selector);
      ixEl.copyBtnSetup = (btnEl, text, options={
        hintEl: 1,
        hintText: 'Copy text',
        hintTextAfter: 'Copied!',
        hintDuration: 1500
      }) => {
        ix.el.addListener(btnEl, 'click', () => {
          ix.cli.copy(typeof text === 'function' ? text() : text);
          if (options.hintEl === true || options.hintEl === 1) options.hintEl = btnEl;
          if (options.hintEl) {
            options.hintEl.innerText = options.hintTextAfter || 'Copied!';
            setTimeout(() => {
              options.hintEl.innerText = options.hintText || 'Copy text';
              ix.el.unlock(btnEl);
            }, options.hintDuration || 1500);
          };
          if (options.focusEl) try {options.focusEl.focus()} catch {};
          ix.el.lock(btnEl);
        });
      }
      ixEl.setupSwitch = (el, handler, defaultValue) => {
        el.classList.add('v-switch');
        if (defaultValue) el.classList.add('on');
        ix.el.addListener(el, 'click', () => {
          const v = el.classList.contains('on');
          if (v) el.classList.remove('on');
          else el.classList.add('on');
          if (handler) handler(!v);
        });
      }
      ixEl.blockPasteHTML = (el) => {
        try {
          const onpaste = el.onpaste || ix.el.getListener(el, 'paste');
          el.onpaste = (e) => {
            e.preventDefault();
            doc.execCommand('insertText', false, (e.originalEvent || e).clipboardData.getData('text/plain'));
            if (onpaste) onpaste(e);
          }
        } catch (e) {
          console.error(e);
        }
      };
      ixEl.convertHyperlinks = (el) => {
        const regEx = /((https?|ftp|file):\/\/)?([-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}|localhost:[0-9]{4})(\/[-A-Z0-9+&@#/%?=~_|!.,:;\u0250-\uffff]{1,})?\/?(?!\w|\S)/gi;
        // const regEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/gi;
        const collectedLinks = {};
        let content = el.innerText;
        try {
          content.replace(regEx, function (link) {
            let href = `${(link.indexOf("http") == -1 ? 'http://' : '')}${link}`;
            collectedLinks[link] = href;
            return link;
          })
        } catch (e) {}
        let normalTextCollection = '';
        const processedElements =[];
        for (let i = 0; i < content.length; i++) {
          let foundLink = false;
          for (const link in collectedLinks) {
            if(link == content.substring(i, i + link.length)) {
              if (normalTextCollection !='') {
                processedElements.push(ix.el('span', {}, [], normalTextCollection ))
                normalTextCollection = '';
              }
              processedElements.push(ix.el('a', {
                href: collectedLinks[link],
                target: '_blank',
                rel: 'noopener noreferrer'
              }, [], link));
              i += link.length - 1;
              foundLink = true;
              break;
            }
          }
          if (!foundLink) normalTextCollection += content[i];
        }
        if (normalTextCollection) {
          processedElements.push(ix.el('span', {} , [], normalTextCollection));
        }
        el.innerHTML = '';
        el.append(...processedElements);
        return el;
      }
      let elScrollTop = 0;
      ixEl.scrollToTop = (el) => {
        if (el) {
          el.scrollTop = Math.floor(el.scrollTop - el.scrollTop / 16);
          if (el.scrollTop > 0) setTimeout(ix.el.scrollToTop, 1, el);
        } else {
          elScrollTop = doc.documentElement.scrollTop || doc.body.scrollTop;
          const i = elScrollTop - elScrollTop / 8;
          if (elScrollTop > 0) {
            win.requestAnimationFrame(ix.el.scrollToTop);
            win.scrollTo(0, i > 1 ? i : 0);
          }
        }
      }
      ixEl.imgLoadAnim = {
        controller: {
          isLoadingAnim(bgEl) {
            return bgEl.classList.contains('img-loading-bg');
          },
          endLoadingProcess(bgEl) {
            bgEl.classList.remove('img-loading-processing');
          },
          removeLoadingAnim(bgEl) {
            bgEl.classList.add('loaded');
            setTimeout(() => {
              bgEl.classList.remove('img-loading-bg');
              bgEl.classList.remove('loaded');
              ix.el.imgLoadAnim.controller.endLoadingProcess(bgEl);
            }, 500);
          },
          disableLoadingAnim(bgEl) {
            bgEl.style.setProperty('--transition', '0');
            bgEl.classList.remove('img-loading-bg');
            ix.el.imgLoadAnim.controller.endLoadingProcess(bgEl);
          }
        },
        setOnloadHandle: (imgBgElement) => {
          if (imgBgElement.classList.contains('img-loading-processing')) return;
          imgBgElement.classList.add('img-loading-processing');
          const img = imgBgElement.getElementsByTagName('img')[0];
          const _next = img.onload;
          const ctrl = ix.el.imgLoadAnim.controller;
          const timeoutId = setTimeout(() => {
            // 修復：當圖片在被設置 onload 前就已經加載完成而沒有執行到 onload 的漏洞
            if (!img.complete) return;
            if (!ctrl.isLoadingAnim(imgBgElement)) return;
            ctrl.removeLoadingAnim(imgBgElement);
          }, 500);
          img.onload = () => {
            clearTimeout(timeoutId);
            if (_next) _next();
            if (new Date() - ix.calcs.t0 < 300) ctrl.disableLoadingAnim(imgBgElement);
            else ctrl.removeLoadingAnim(imgBgElement);
          }
        },
        initAllImg: () => {
          const elements = doc.getElementsByClassName('img-loading-bg');
          if (elements.length) {
            for (const i of elements) ixEl.imgLoadAnim.setOnloadHandle(i);
            return true;
          }
          return false;
        }
      }
      const renderIxSvg = (el, expression) => {
        const attrs = ix.el.getAttrs(el);
        attrs.xmlns = 'http://www.w3.org/2000/svg';
        attrs.viewBox = '0 0 48 48';
        attrs.class = (attrs.class || '').replaceAll('ix-svg', '').trim();
        if (!attrs.class) delete attrs.class;
        el.replaceWith(ix.el.ns('svg', attrs, [ixEl.ns('path', {d: expression})]));
      }
      ixEl.svg = (el, name, expression) => {
        if (el) {
          if (expression) return renderIxSvg(el, expression);
          fetch(`/api/icons/${name || el.innerHTML.trim()}`)
          .then(res => res.text())
          .then(expression => renderIxSvg(el, expression));
        } else {
          [...ixEl.qAll('.ix-svg')].forEach(el => ixEl.svg(el));
          // const svgList = [...ixEl.qAll('.ix-svg')];
          // nw.xhr.post('/api/icons/', svgList.map(el => el.innerHTML.trim()), {contentType: 'json', responseType: 'json'}, (xhr) => {
          //   for (let i = 0; i < svgList.length; i++) ixEl.svg(svgList[i], 0, xhr.response[i]);
          // });
        }
        return el;
      };
      ixEl.svg();
      ixEl.imgLoadAnim.initAllImg();
      Object.freeze(ixEl);
      return ixEl;
    })(),
    query: (() => {
      const params = new URLSearchParams(loc.search);
      const __save = (type) => {
        if (type === 1) query.save();
        else if (type === 2) query.push();
      };
      const query = {
        params,
        get: (key) => params.get(key),
        set: (key, value, save) => {
          params.set(key, value);
          __save(save);
        },
        has: (key) => params.has(key),
        remove: (key, save=0) => {
          params.delete(key);
          __save(save);
        },
        save: () => his.replaceState(0, 0, query.pathname),
        push: () => his.pushState(0, 0, query.pathname),
        get pathname() {
          const s = [...params.entries()].map(i=>i[0]?encodeURI(`${i[0]}=${i[1]}`):'').join('&');
          return `${loc.pathname}${s.length?'?':''}${s}${loc.hash}`;
        }
      };
      Object.freeze(params);
      Object.freeze(query);
      return query;
    })(),
    cookies: {
      get: (itemKey) => decodeURIComponent(doc.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(itemKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null,
      set: (key, value, maxAge, path, domain, secure) => {
        if (!key || /^(?:expires|max\-age|path|domain|secure)$/i.test(key)) return false;
        let expires = '';
        if (maxAge) {
          switch (maxAge.constructor) {
            case Number:
              expires = maxAge === Infinity ? `; expires=Fri, 31 Dec 9999 23:59:59 GMT` : `; max-age=${maxAge}`;
              break;
            case String:
              expires = `; expires=${maxAge}`;
              break;
            case Date:
              expires = `; expires=${maxAge.toUTCString()}`;
              break;
          }
        }
        doc.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}${expires}${domain?'; domain='+domain:''}${path?'; path='+path:''}${secure?'; secure':''}`;
        return true;
      },
      remove: (key, path, domain) => {
        if (!key || !ix.cookies.has(key)) return false;
        doc.cookie = encodeURIComponent(key) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' + ( domain ? '; domain=' + domain : '') + ( path ? '; path=' + path : '');
        return true;
      },
      has: (key) => (new RegExp(`(?:^|;\\s*)${encodeURIComponent(key).replace(/[-.+*]/g, '\\$&')}\\s*\\=`)).test(doc.cookie),
      keys: () => (doc.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/)).map(decodeURIComponent),
      json: () => {
        const cookies = {};
        ix.cookies.keys().forEach((i) => {
          cookies[i] = ix.cookies.get(i);
        });
        return cookies;
      },
      jsonify: () => JSON.stringify(ix.cookies.json())
    },
    popup: {
      blocker: () => ix.el('div',{class:'popup-bg vh-100 vw-100 flex-ct pg-ct z-idx_top',style:'background:#0008;'}),
      temporaryPopups: [],
      clearTemporaryPopups() {
        while (ix.popup.temporaryPopups.length) {
          try {
            const el = ix.popup.temporaryPopups.pop();
            ix.popup.remove(el, 0);
            if (el.callback) el.callback();
          } catch {}
        }
      },
      remove(popupWindow, timeout=1000) {
        try {
          popupWindow.classList.add('locked');
          setTimeout(ix.el.destroy, timeout, popupWindow);
          popupWindow.blocker.remove();
        } catch (e) { console.error(e) }
      },
      close(popupWindow, callback) {
        popupWindow.classList.add('closed');
        for (const btn of popupWindow.getElementsByClassName('popup-btn')) btn.style.opacity = 0;
        ix.popup.remove(popupWindow);
        if (callback) callback();
      },
      fade(popupWindow) {
        popupWindow.classList.add('faded');
        ix.popup.remove(popupWindow);
      },
      message(message, options={}) {
        const buttons = options.buttons || [{}];
        const buttonsEl = buttons.map(btn => {
          const el = ix.el(btn.tagName||'div', {class: 'popup-btn'}, [], btn.text || 'OK');
          ix.el.addListener(el, 'click', () => {
            if (btn.callback) btn.callback();
            if (options.callback) options.callback();
            ix.popup.close(popupWindow);
          });
          return el;
        });
        const defaultBtn = (() => {
          if (buttonsEl.length === 0) return;
          if (buttonsEl.length === 1) return buttonsEl[0];
          for (const el of buttonsEl) if (el.innerText === 'OK') return el;
        })();
        const closeByKeyboard = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (defaultBtn) defaultBtn.click();
          }
        };
        const popupWindow = ix.el('div', {
          id: `popup-${ix.chee.random.base64(8)}`,
          class: 'pg-ct popup-window flex-ct flex-col z-idx_top'
        }, [
          ix.el('div', {class: 'popup-message flex-ct flex-1'}, [], message || 'Oops! Something went wrong.'),
          ix.el('div', {class: 'flex-ct'}, buttonsEl)
        ]);
        const blocker = ix.popup.blocker();
        popupWindow.blocker = blocker;
        doc.body.append(blocker, popupWindow);
        doc.activeElement.blur();
        setTimeout(() => {
          ix.el.addListener(doc, 'keyup', closeByKeyboard);
          if (defaultBtn) ix.el.addListener(defaultBtn, 'click', () => ix.el.rmvListener(doc, 'keyup', closeByKeyboard))
        }, 0);
        ix.popup.clearTemporaryPopups();
        popupWindow.callback = options.callback;
        if (options.isTemporary) ix.popup.temporaryPopups.push(popupWindow);
        const durationSec = options.durationSec || 0;
        if (durationSec) {
          setTimeout(() => {
            if (options.callback) options.callback();
            ix.popup.fade(popupWindow);
          }, durationSec * 1000);
        }
        return popupWindow;
      },
      show(message, options={}) {
        if (!options.durationSec) options.durationSec = 1.5;
        const popupWindow = ix.popup.message(message, options={buttons: [], ...options});
        return popupWindow;
      },
      throw(errMessage, options={}) {
        const popupWindow = ix.popup.message(`ERROR ⇒ ${errMessage}`, options);
        popupWindow.classList.add('popup-error');
        ix.popup.clearTemporaryPopups();
      },
      featureNotAvailable: () => ix.popup.message('Sorry, this feature is currently not available. If you need assistance, please contact the website administrator (137emailservice@gmail.com).')
    },
    calcs: {
      t0: new Date(),
      versionParser: (s) => {
        const [major, minor, revision, date, reference, stage] = s.split('.');
        return {major, minor, revision, date, reference, stage,
          stageLvl: ['base', 'alpha', 'beta', 'rc', 'release'].indexOf(stage)};
      },
      randomRGBValue: (minV=0, maxV=255) => {
        const _ = (minV, maxV) => (minV + Math.random() * (maxV - minV)).toFixed(2);
        return `rgb(${_(minV,maxV)},${_(minV,maxV)},${_(minV,maxV)})`;
      },
      checkKeys: (obj, legalKeys=[]) => {
        for (const k of Object.keys(obj)) if (!legalKeys.includes(k)) delete obj[k];
        return obj;
      }
    },
    cli: {
      device: {
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        get isTouchScreen() {return 'ontouchstart' in doc || navigator.maxTouchPoints}
      },
      get loadedResources() {return win.performance.getEntriesByType('resource')},
      copy(text) {
        try {
          const tempElement = doc.createElement('input')
          tempElement.value = text;
          doc.body.appendChild(tempElement);
          tempElement.select();
          doc.execCommand('copy');
          tempElement.remove();
        } catch(e) {
          console.error(`Copy text failed: ${e}`);
          return false;
        };
        return true;
      },
      local: {
        save: (data) => {
          data = ix.calcs.checkKeys(data, ['ui', 'v']);
          ix.cookies.set('ix-local', btoa(JSON.stringify(data)));
        },
        get data() {
          try { return JSON.parse(atob(ix.cookies.get('ix-local')) || '{}') }
          catch { return {} };
        },
        get: (key) => ix.cli.local.data[key],
        set: (key, value) => {
          const data = ix.cli.local.data;
          data[key] = value;
          ix.cli.local.save(data);
          return true;
        }
      }
    }
  };
})();

try {
  if (ix.query.has('fbclid')) ix.query.remove('fbclid', 1);
  const v = ix.chee.version;
  ix.cli.local.set('v', v);
  console.log(`%cv${v}`, `color:#0dd;`);
  if (ix.calcs.versionParser(v).stageLvl < 2) {
    // The current running version is a development version.
    // The page will refresh when page resources are changed or the server is restarted,
    // and page resources will not be cached.
    ix.api.socket.on('debug', name => {
      if (name === true) return loc.reload();
      const resourcePaths = ix.cli.loadedResources.map(p => p.name);
      for (const r of resourcePaths) if (r.includes(name)) return loc.reload();
    });
    console.log('%cDEBUG MODE ✔', 'color:#4f4;');
  } else {
    console.log('%cBug Reports: %cIf you encounter any vulnerabilities, please report them to us promptly by sending an email to 137emailservice@google.com',
      `font-size:24px;font-weight:bold;color:#f82;`, `font-size:14px;color:#f82;`);
    console.log('%cWarning! Pasting anything here could allow attackers to gain access to your account.',
      `font-size:24px;font-weight:bold;color:#fff;background:#f00;padding:16px;border:2px solid #fff;margin:8px 0;`);
  }
} catch {};