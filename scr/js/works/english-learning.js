(()=>{const e=()=>{try{ix}catch{return setTimeout(e,1)}"/"!=loc.pathname.split("").pop()&&his.pushState(0,0,loc.pathname+"/");{const n=ix.api.socket;let a=null,i=null,e;var t=(e=1)=>ix.el(e?"textarea":"div",{class:"w-100 tx-100 textarea no-rsz pd-16 bg-950",placeholder:e?"請輸入需要翻譯的文本（中文 / 英文）":"翻譯結果會被展示在這裡",autofocus:!!e,maxlength:5e3});const x=ix.el.byId("translate-wrapper"),p=t(),c=t(0),o=ix.el("span",{class:"flex-1"}),d=ix.el("div",{style:"padding:16px"});let s=!1;ix.api.onConnected=()=>{if(!s){const l=ix.el.new("span",{class:"no-select v-btn mg-0",style:"min-width:fit-content;padding:2px 8px;"},[],"X");var e=ix.el("span",{class:"no-select mg-0 txarea-btn op-075"},[],"Copy text"),t=ix.el("span",{class:"no-select mg-0 txarea-btn op-075"},[],"Copy text");ix.el.addListener(l,"click",()=>{p.value="",c.innerText="",o.innerText="",i="",p.focus()}),ix.el.copyBtnSetup(e,()=>p.value),ix.el.copyBtnSetup(t,()=>c.innerText),ix.el.addListener(p,"keyup",()=>{const e=p.value.trim();if(!e)return l.click();if(i!==e){o.innerText="正在觀察輸入...";const t=ix.chee.random.base64(8);a=t,i=e,setTimeout(()=>{a==t&&n.emit("useAPI",{name:"translate",data:{id:t,text:e}})},300)}}),x.append(ix.el("h2",{},[],"翻譯"),ix.el("div",{id:"translate-view",class:"flex-ct w-100"},[ix.el("div",{class:"flex-col flex-1 bd-1px bd-r-8 ovf-hd"},[ix.el("div",{class:"w-100 flex-lf text-lf op-8",style:"padding:8px 16px"},[ix.el("span",{class:"flex-1"},[],"偵測語言"),e,l]),p]),d,ix.el("div",{class:"flex-col flex-1 bd-1px bd-r-8 ovf-hd"},[ix.el("div",{class:"w-100 flex-lf text-lf",style:"padding:8px 16px"},[ix.el("span",{class:"op-075"},["翻譯結果："]),o,t]),c])]),ix.el("hr",{style:"margin-top:32px;"})),s=!0}},n.on("disconnect",()=>{e=!1,setTimeout(()=>{ix.popup.message("連接中斷，刷新頁面以重新連接。",{callback:()=>loc.reload()})},5e3)}),ix.api.setHandler("translate",e=>{e.id==a&&(c.innerText=e.text||"",o.innerText=e.lang?"中"===e.lang[0]?"英文":"中文":"",console.log("api time used:",e.timeUsed))})}};e()})();