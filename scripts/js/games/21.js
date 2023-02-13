const poker = {};
(() => {
  const run = () => {
    try { if (ix) 1 } catch { return setTimeout(run, 1) }
    
    const chatBox = ix.el.byId('chat-box');
    const chatBoxTitle = ix.el.byId('chat-box-title');
    const chatBoxBody = ix.el.byId('chat-box-body');
    const resetChatBoxPositionBtn = ix.el.byId('reset-chat-box-position-btn');
    const clearChatBoxContentBtn = ix.el.byId('clear-chat-box-content-btn');
    const welcomeForm = ix.el.byId('welcome-form');
    const openedContextMenu = [];
    const waitingView = ix.el.byId('waiting-view');
    const gameView = ix.el.byId('game-view');
    const gameStatusEl = ix.el.byId('game-status');
    const bankerControlPanel = ix.el.byId('banker-control-panel');

    const scrollChatBox = () => {
      chatBoxBody.scrollTop = chatBoxBody.clientHeight * 1000000;
    }
    const addChatBoxMessage = (message, className='server') => {
      chatBoxBody.appendChild(ix.el('div', {class: className, title: ix.chee.time.format()}, message));
      scrollChatBox();
    }

    let started = false;

    const socket = ix.io();

    const pokerEvents = {
      join: 'joinPokerSocket',
      request: 'receive',
      receive: 'receive',
      joinRoom: 'joinRoom',
      createRoom: 'createRoom',
      roomJoined: 'roomJoined',
      resumeGame: 'resumeGame',
      bankerOrder: 'bankerOrder',
      startGame: 'startGame'
    };

    const localUserdata = {
      roomId: '',
      playerId: '',
      username: '',
      gameData: {},
      roomKey: ''
    };
    poker.userdata = localUserdata;

    (() => {
      const usernameInput = ix.el.byId('username-input');
      const roomIdInput = ix.el.byId('room-id-input');
      const joinBtn = ix.el.byId('join-btn');
      const createBtn = ix.el.byId('create-btn');

      const setXY = (el, x, y) => {
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > win.innerWidth - el.clientWidth) x = win.innerWidth - el.clientWidth;
        if (y > win.innerHeight - el.clientHeight) y = win.innerHeight - el.clientHeight;
        el.style.setProperty('--x', `${x}px`);
        el.style.setProperty('--y', `${y}px`);
      }

      chatBoxTitle.ondragstart = (e) => {
        const _x = e.offsetX, _y = e.offsetY;
        e.dataTransfer.effectAllowed = 'move';
        chatBoxTitle.ondrag = (e) => {
          const x = e.clientX, y = e.clientY;
          if (!(x && y)) return;
          setXY(chatBox, x - _x, y - _y);
        }
      }

      ix.el.addListener(chatBoxTitle, 'click', () => {
        const _ = 'collapsed';
        if (chatBox.classList.contains(_)) {
          chatBox.classList.remove(_);
          setTimeout(scrollChatBox, 300);
        } else chatBox.classList.add(_);
      });
  
      doc.body.ondragover = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }
  
      const openContextMenu = (el, e) => {
        el.classList.add('show');
        if (e) setXY(el, e.clientX, e.clientY);
        openedContextMenu.push(el);
      }
  
      const closeContextMenus = (e, preventDef=true) => {
        if (e && preventDef) e.preventDefault();
        while (openedContextMenu.length) openedContextMenu.pop().classList.remove('show');
      }
  
      ix.el.addListener(doc, 'click', (e) => closeContextMenus(e, false));
  
      chatBoxTitle.oncontextmenu = (e) => {
        closeContextMenus(e);
        const _ = resetChatBoxPositionBtn, boxStyle = getComputedStyle(chatBox);
        if (boxStyle.getPropertyValue('--x').trim() == '8px' && boxStyle.getPropertyValue('--y').trim() == '8px') return;
        openContextMenu(_, e);
      }
  
      chatBoxBody.oncontextmenu = (e) => {
        closeContextMenus(e);
        if (!chatBoxBody.innerHTML) return;
        openContextMenu(clearChatBoxContentBtn, e);
      }
  
      ix.el.addListener(resetChatBoxPositionBtn, 'click', () => {
        chatBox.style.removeProperty('--x');
        chatBox.style.removeProperty('--y');
      });
  
      ix.el.addListener(clearChatBoxContentBtn, 'click', () => {
        chatBoxBody.innerHTML = '';
      });
  
      const checkUsername = (unlockEl) => {
        if (usernameInput.value.length < 2) {
          ix.popup.message('The username must have a minimum length of 2 characters.', {
            callback: () => {
              if (unlockEl) ix.el.unlock(unlockEl);
              usernameInput.focus();
            }
          });
          return false;
        }
        return true;
      }, checkRoomId = (unlockEl) => {
        if (roomIdInput.value.length < 4) {
          ix.popup.message('The room ID must have a minimum length of 8 characters.', {
            callback: () => {
              if (unlockEl) ix.el.unlock(unlockEl);
              roomIdInput.focus();
            }
          });
          return false;
        }
        return true;
      }
  
      roomIdInput.onkeyup = (e) => {
        if (e.key === 'Enter') {
          if (!checkUsername()) return;
          if (roomIdInput.value) joinBtn.click();
          else createBtn.click();
        }
      }
  
      usernameInput.onkeyup = (e) => {
        if (e.key === 'Enter') {
          if (!checkUsername()) return;
          roomIdInput.focus();
        }
        ix.query.set('username', usernameInput.value.trim(), 1);
      }
  
      usernameInput.onblur = (e) => {
        usernameInput.value = usernameInput.value.trim();
      }
  
      addChatBoxMessage('You can move this window by dragging the header.');

      ix.el.addListener(joinBtn, 'click', (e) => {
        ix.el.lock(joinBtn);
        if (!checkUsername(joinBtn)) return;
        if (!roomIdInput.value) {
          ix.el.unlock(joinBtn);
          return createBtn.click();
        }
        if (!checkRoomId(joinBtn)) return;
        socket.emit(pokerEvents.joinRoom, {username: usernameInput.value, roomId: roomIdInput.value});
        ix.popup.show('Joining the room, please wait a moment...', {
          callback: () => ix.el.unlock(joinBtn),
          isTemporary: true
        });
      })

      ix.el.addListener(createBtn, 'click', () => {
        ix.el.lock(createBtn);
        if (!checkUsername(createBtn)) return;
        ix.popup.message('Would you like to create a new room?', {
          buttons: [
            {
              text: 'No',
              callback: () => ix.el.unlock(createBtn)
            },
            {
              text: 'Yes',
              tagName: 'strong',
              callback: () => {
                socket.emit(pokerEvents.createRoom, {username: usernameInput.value, gameName: 'Blackjack'});
                ix.popup.show('The room is being created, please wait a moment...', {
                  callback: () => ix.el.unlock(createBtn),
                  isTemporary: true
                });
              }
            }
          ]
        });
      });
  
      if (ix.query.get('username')) usernameInput.value = ix.query.get('username');
      if (ix.query.get('room')) {
        roomIdInput.value = ix.query.get('room');
        roomIdInput.setAttribute('readonly', '');
        ix.el.hide(roomIdInput), ix.el.hide(createBtn.parentElement);
        roomIdInput.previousElementSibling.innerText = `You are joining the room: ${roomIdInput.value}`;
        ix.el.show(ix.el.byId('join-another-room'));
      }

      if (welcomeForm.classList.contains('hidden')) {
        const playerId = loc.pathname.split('/').pop();
        socket.emit(pokerEvents.resumeGame, playerId);
      }

    })();

    const reqData = (packet) => socket.emit(pokerEvents.request, packet);
    const bankerOrder = (packet) => {
      packet.key = localUserdata.roomKey;
      socket.emit(pokerEvents.bankerOrder, packet);
    }
    const popupError = (err) => {
      console.error(err);
      ix.popup.throw(err);
    }

    socket.on('connect', () => {
      if (started) return loc.reload();
      addChatBoxMessage('Welcome to the game.');
      socket.emit(pokerEvents.join);
    });

    const startGame = () => {
      ix.el.hide(waitingView);
      ix.el.show(gameView);
      ix.el.hide(ix.el.byId('footer-buttons'))
      gameView.children[0].appendChild(ix.el.byId('player-list-container'));
      gameView.children[2].appendChild(bankerControlPanel);
      bankerControlPanel.innerHTML = '';
      if (started) ix.popup.show('遊戲已開始');
      else ix.popup.show('遊戲繼續');
    }

    socket.on(pokerEvents.startGame, startGame);

    socket.on(pokerEvents.roomJoined, (packet) => {
      const {roomId, playerId, username, gameData, roomKey} = packet;
      const roomIdEl = ix.el.byId('room-id');
      const roomIdCopyBtn = ix.el.byId('room-id-copy-btn');
      const roomIdCopyHint = ix.el.byId('room-id-copy-hint');
      const inviteLinkEl = ix.el.byId('invite-link');
      const inviteLinkCopyBtn = ix.el.byId('invite-link-copy-btn');
      const inviteLinkCopyHint = ix.el.byId('invite-link-copy-hint');
      reqData({name: 'playerList'});
      localUserdata.roomId = roomId;
      localUserdata.playerId = playerId;
      localUserdata.username = username;
      localUserdata.gameData = gameData;
      if (roomKey) {
        ix.el.show(bankerControlPanel);
        ix.el.hide(ix.el.byId('waiting-for-banker-start'));
        localUserdata.roomKey = roomKey;
        const startBtn = ix.el.byId('banker-start-game', bankerControlPanel);
        ix.el.addListener(startBtn, 'click', () => {
          ix.el.lock(startBtn);
          ix.popup.message('已向服務器提交開始遊戲請求', {
            callback: () => ix.el.unlock(startBtn),
            isTemporary: true
          });
          bankerOrder({
            name: 'startGame'
          });
        });
      }
      if (started) popupError('Game is started.');
      ix.popup.show('成功加入遊戲', {durationSec:1});
      welcomeForm.remove();
      ix.el.show(waitingView);
      addChatBoxMessage(`Room ID: ${roomId}\nPlayer ID: ${playerId}\nPlayer Name: ${username}`);
      roomIdEl.innerText = `Room ID: ${roomId}`;
      inviteLinkEl.innerText = inviteLinkEl.href = `${loc.origin}/games/21/join?room=${roomId}`;
      ix.el.copyBtnSetup(roomIdCopyBtn, roomId , {hintEl:roomIdCopyHint,hintText:'Copy'});
      ix.el.copyBtnSetup(inviteLinkCopyBtn, () => inviteLinkEl.innerText, {hintEl: inviteLinkCopyHint, hintText: 'Copy'});
      if (roomId) his.replaceState(0, 0, `./${playerId}`);
      if (gameData.status != 'waiting') startGame();
      started = true;
    });

    let updatePlayerList = (packet) => {
      const playerListEl = ix.el.byId('player-list');
      playerListEl.innerHTML = '';
      if (packet.banker) {
        playerListEl.appendChild(ix.el('li', {
          class: `text-lf banker-name${localUserdata.playerId === packet.banker.id ? ' self' : ''}`,
          title: packet.banker.id
        }, [
          ix.el('span', 0, `${packet.banker.username}`),
          ix.el('span', {style:'user-select:none;'}, ` (莊家)`),
          localUserdata.playerId === packet.banker.id ? ix.el('span', {class: 'you'}, ' (YOU)') : ''
        ]));
      } else {
        ix.popup.message(`警告：莊家已下線！`, {isTemporary: true});
      }
      for (const player of packet.playerList) {
        const {id, username} = player;
        playerListEl.appendChild(ix.el('li', {
          title: id, class: `text-lf${localUserdata.playerId === id ? ' self' : ''}`
        }, [
          ix.el('span', 0, username),
          localUserdata.playerId === id ? ix.el('span', {class: 'you'}, ' (YOU)') : ''
        ]));
      }
    }
    socket.on(pokerEvents.receive, packet => {
      switch (packet.name) {
        case 'updateGameData':
          const gameData = packet.content;
          localUserdata.gameData = gameData;
          gameStatusEl.innerText = gameData.status;
          break;
        case 'updateAction':
          break;
        case 'message':
          ix.popup.message(packet.content.text, packet.content.option);
          break;
        case 'chatBox':
          addChatBoxMessage(packet.content);
          break;
        case 'playerList':
          updatePlayerList(packet.content);
          break;
        case 'error':
          popupError(packet.content);
          break;
        case 'console':
          console.log(packet.content);
          break;
      }
    });

    win.onclose = () => {
      if (started) ix.popup.message('連線已中斷', {isTemporary: true});
      addChatBoxMessage('Disconnect, wait for reconnection...');
    }
    socket.on('disconnect', win.onclose);

  };
  run();
})();