(() => {
  const run = () => {
    try { if (ix) 1 } catch { return setTimeout(run, 1) };

    const loginForm = ix.el.byId('login-form');
    const flasSubtitles = ix.el.byId('flash-subtitles');
    const emailInput = ix.el.byId('email');
    const usernameInput = ix.el.byId('username');
    const passwordInput = ix.el.byId('password');
    const password2Input = ix.el.byId('password2');
    const submitBtn = ix.el.byId('submit-btn');
    const gotoLoginBtn = ix.el.byId('goto-login');
    const gotoSignupBtn = ix.el.byId('goto-signup');
    const gotoResetPwBtn = ix.el.byId('goto-reset-pw');
    const gotoLoginAfterResetPwBtn = ix.el.byId('goto-login-after-resetpw');

    let formName = 'login';
    
    [emailInput, usernameInput, passwordInput, password2Input].forEach(el => {
      ix.el.addListener(el, 'focus', (e) => {
        el.parentElement.classList.remove('bd-2');
        el.parentElement.classList.add('bd-2h');
      });
      ix.el.addListener(el, 'blur', (e) => {
        el.parentElement.classList.remove('bd-2h');
        el.parentElement.classList.add('bd-2');
      });
    });

    ix.el.addListener(password2Input, 'paste', (e) => {
      setTimeout(() => ix.popup.message('Please ensure that the password is spelled correctly.', {
        callback: () => password2Input.focus()
      }), 0);
    });
    
    ix.el.addListener(emailInput, 'keyup', (e) => {
      if (!emailInput.value) return;
      if (e.key === 'Enter') {
        if (ix.el.isHide(usernameInput.parentElement)) passwordInput.focus();
        else usernameInput.focus();
      }
    });
    
    ix.el.addListener(usernameInput, 'keyup', (e) => {
      if (!usernameInput.value) return;
      if (e.key === 'Enter') passwordInput.focus();
    });
    
    ix.el.addListener(passwordInput, 'keyup', (e) => {
      if (!passwordInput.value) return;
      if (e.key === 'Enter') {
        if (formName === 'login') submitBtn.click();
        else password2Input.focus();
      }
    });
    
    ix.el.addListener(password2Input, 'keyup', (e) => {
      if (!password2Input.value) return;
      if (e.key === 'Enter') submitBtn.click();
    });

    const login = (username, password) => ix.api.send('login', {username, password});

    ix.api.setHandler('login', packet => {
      const {status, id, message} = packet;
      if (status) {
        ix.cookies.set(ix.chee.config.sessName, id);
        const nextPath = atob(ix.query.get('next') || '');
        loc.href = nextPath[0] === '/' ? nextPath : '/';
      } else ix.popup.message(message);
    });

    const changePageContent = (toShowName) => {
      const changeableElements = ix.el.childrenR(loginForm).concat(ix.el.childrenR(flasSubtitles));
      const toHideNames = ['cpn-login','cpn-signup','cpn-reset'].filter(i => i != toShowName);
      changeableElements.forEach(el => {
        if (el.classList.contains(toShowName)) ix.el.show(el);
        else {
          for (const c of [...toHideNames]) {
            if (el.classList.contains(c)) {
              ix.el.hide(el);
              break;
            }
          }
        }
      });
    }

    const loginClickHandler = (e) => {
      const user = usernameInput.value;
      const password = passwordInput.value;
      if (!user) return ix.popup.message('Username cannot be empty.', {
        callback: () => usernameInput.focus()
      });
      if (!password) return ix.popup.message('Password cannot be empty.', {
        callback: () => passwordInput.focus()
      });
      login(user, password);
    }

    const signupClickHandler = (e) => {
      const email = emailInput.value;
      const user = usernameInput.value;
      const password = passwordInput.value;
      const password2 = password2Input.value;

      for (const _ of [
        ['Email', email, emailInput],
        ['Username', user, usernameInput],
        ['Passwd', password, passwordInput],
      ]) {
        const [name, value, el] = _;
        try { ix.chee.valid[`test${name}`](value) }
        catch (err) {
          return ix.popup.message(
            err, {
            callback: () => el.focus()
          });
        }
      };

      if (password != password2) return ix.popup.message(
        'Passwords do not match.', {
        callback: () => password2Input.focus()
      });
      
      emailInput.value = '';
      setTimeout(() => {
        emailInput.value = email;
      }, 1);
      const vrfCodeLen = 6;
      const vrfCodeInput = usernameInput;
      vrfCodeInput.placeholder = `${vrfCodeLen} digits code`;
      vrfCodeInput.maxLength = vrfCodeLen;
      vrfCodeInput.classList.add('tx-ct', 'w-100');
      vrfCodeInput.value = '';
      vrfCodeInput.parentElement.childNodes[0].remove();
      vrfCodeInput.parentElement.style.width = '120px';
      vrfCodeInput.parentElement.classList.add('mg-b32');
      ix.el.addListener(vrfCodeInput, 'keyup', (e) => {
        if (vrfCodeInput.value.length === vrfCodeLen) submitBtn.click();
      });
      ix.el.hide(passwordInput.parentElement);
      ix.el.hide(password2Input.parentElement);
      ix.el.hide(gotoLoginBtn.parentElement);
      loginForm.insertBefore(ix.el('div', {class: 'mg-0 flex-ct flex-col sz-16'},
        [
          ix.el('div', {class: 'tx-ct mg-t32 bold tx-ct'}, [],
            'We have sent a verification code to your email, please check your inbox.'),
            ix.el('div', {class: 'tx-ct mg-y16'}, [], 'Please enter the verification code.'),
          vrfCodeInput.parentElement
        ]
      ), submitBtn);
      flasSubtitles.remove();
      doc.body.style.setProperty('--flash-subtitles-h', '0px');
      doc.body.style.setProperty('--flash-subtitles-top', '20vh');
      loginForm.insertBefore(
        ix.el('a', {href:`?p=signup&ea=${email}&user=${user}`, class: 'mg-t8'}, [], 'Resubmit the form'),
        ix.el.byId('signup-hint')
      );
      submitBtn.innerText = 'Sign Up!';
      vrfCodeInput.focus();
      ix.api.send('verifyEmail', {emailAddress: email, reference: 'signup-vrf'});
      ix.api.setHandler('checkVerificationCode', isSuccess => {
        ix.el.unlock(submitBtn);
        if (isSuccess) login(user, password);
        else return ix.popup.message('Invalid verification code.', {
          callback: () => vrfCodeInput.focus()
        });
      });
      ix.el.rmvListener(submitBtn, 'click', signupClickHandler);
      ix.el.addListener(submitBtn, 'click', () => {
        ix.el.lock(submitBtn);
        ix.api.send('checkVerificationCode', {
          username: user,
          email,
          password,
          code: vrfCodeInput.value,
          reference: 'signup-vrf'
        });
        ix.popup.show('Please wait, registration is in progress...', {isTemporary: 1});
      });
    }

    ix.api.setHandler('reset-pw', () => {
      const _ = () => ix.popup.message('Has the verification been completed?', {
        buttons: [
          {text: 'Yes', callback: () => gotoLoginAfterResetPwBtn.click()},
          {text: 'No', callback: _}
        ]
      });
      ix.popup.message('A verification email has been sent to you, please check your inbox.', {
        callback: () => {
          _();
        }
      });
    });
    const resetClickHandler = () => {
      const resetPwEa = emailInput.value;
      const resetPwPw = passwordInput.value;
      for (const _ of [
        ['Email', resetPwEa, emailInput],
        ['Passwd', resetPwPw, passwordInput],
      ]) {
        const [name, value, el] = _;
        try { ix.chee.valid[`test${name}`](value) }
        catch (err) {
          return ix.popup.message(
            err, {
            callback: () => el.focus()
          });
        }
      };
      ix.api.send('reset-pw', {
        resetPwOr: loc.origin,
        resetPwEa,
        resetPwPw
      });
    };
    
    ix.el.addListener(gotoLoginBtn, 'click', (e) => {
      e.preventDefault();
      formName = 'login';
      ix.query.set('p', 'login', 1);
      submitBtn.innerText = 'Log In';
      ix.el.rmvListener(submitBtn, 'click', signupClickHandler);
      ix.el.addListener(submitBtn, 'click', loginClickHandler);
      changePageContent('cpn-login');
      doc.body.style.setProperty('--flash-subtitles-top', '15vh');
      doc.body.style.setProperty('--flash-subtitles-h', '192px');
      usernameInput.focus();
    });
    
    ix.el.addListener(gotoSignupBtn, 'click', (e) => {
      e.preventDefault();
      formName = 'signup';
      ix.query.set('p', 'signup', 1);
      submitBtn.innerText = 'Next';
      ix.el.rmvListener(submitBtn, 'click', loginClickHandler);
      ix.el.addListener(submitBtn, 'click', signupClickHandler);
      changePageContent('cpn-signup');
      doc.body.style.setProperty('--flash-subtitles-top', '7.5vh');
      if (ix.cli.device.isMobile) doc.body.style.setProperty('--flash-subtitles-h', '96px');
      emailInput.focus();
    });
    
    ix.el.addListener(gotoResetPwBtn, 'click', (e) => {
      e.preventDefault();
      formName = 'reset-pw';
      ix.query.set('p', 'reset-pw', 1);
      loginForm.id = '';
      passwordInput.value = '';
      passwordInput.placeholder = 'New password';
      submitBtn.innerText = 'Verify your email';
      ix.el.rmvListener(submitBtn, 'click', loginClickHandler);
      ix.el.addListener(submitBtn, 'click', resetClickHandler);
      changePageContent('cpn-reset');
      emailInput.focus();
    });
    
    ix.el.addListener(gotoLoginAfterResetPwBtn, 'click', (e) => {
      e.preventDefault();
      loginForm.id = 'login-form';
      passwordInput.placeholder = 'Password';
      ix.el.rmvListener(submitBtn, 'click', resetClickHandler);
      ix.el.addListener(submitBtn, 'click', loginClickHandler);
      gotoLoginBtn.click();
    });
    
    if (his.length < 2) ix.el.byId('back-btn').href = '/';
    if (ix.query.get('p') === 'signup') gotoSignupBtn.click();
    else if (ix.query.get('p') === 'reset-pw') gotoResetPwBtn.click();
    else gotoLoginBtn.click();
    emailInput.value = ix.query.get('ea') || '';
    usernameInput.value = ix.query.get('user') || '';
    if (ix.query.has('ea')) {
      if (ix.query.has('user')) passwordInput.focus();
      else usernameInput.focus();
    }
    ix.query.remove('ea');
    ix.query.remove('user', 1);
  }
  run();
})();