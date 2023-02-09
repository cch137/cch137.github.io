const copyObj=e=>JSON.parse(JSON.stringify(e)),choices=(r,t=1)=>{var n=[];r=[...r];for(let e=0;e<t&&r.length;e++)n.push(r.splice(Math.floor(Math.random()*r.length),1)[0]);return n},shuffle=e=>choices(e,e.length),range=(r=null,t=null,n=null)=>{var o=[];if(null!==r&&null===t&&null===n)for(let e=0;e<r;e++)o.push(e);else if(null!==r&&null!==t&&null===n)for(let e=r;e<t;e++)o.push(e);else if(null!==r&&null!==t&&null!==n)for(let e=r;e<t;e+=n)o.push(e);return o};class Sudoku{constructor(e=[1,2,3,4,5,6,7,8,9]){this.legalNumbers=e,this.side=this.legalNumbers.length,this.size=Math.pow(this.side,.5)}checkList(e=[]){var r={};for(const t of e)if(null!==t&&void 0!==t&&""!==t){if(-1==this.legalNumbers.indexOf(t))return!1;if(r[t])return!1;r[t]=!0}return!0}checkMap(e){var r=e.length,t=[];for(const a of range(r*r/9))t.push([]);for(const l of range(r)){var n=[],o=[];for(const s of range(r))n.push(e[l][s]),o.push(e[s][l]),t[3*Math.ceil((l+.1)/3)+Math.ceil((s+.1)/3)-4].push(e[l][s]);if(!this.checkList(n))return!1;if(!this.checkList(o))return!1}for(const u of t)if(!this.checkList(u))return!1;return!0}drawMap(e){var r=copyObj(e);for(const t of range(r.length)){for(const n of range(r.length))null===r[t][n]&&(r[t][n]=" ");r[t]=r[t].join(" ")}return r.join("\n")}generateMap(){var e=(new Date).getTime(),r=(e=3)=>{var r=e*e,t=[];if(3!=e)throw'"size" can only be equal to 3.';for(const o of range(r)){var n=[];for(const a of range(r))n.push(null);t.push(n)}for(const l of range(r))for(const s of range(r)){let e=!1;for(const u of shuffle(this.legalNumbers))if(t[l][s]=u,this.checkMap(t)){e=!0;break}if(!e)throw"Generating error"}return t};let t=0;for(;;)try{var n=r();return console.log(`Successfully generated a Sudoku map after ${t+1} attempts (${(((new Date).getTime()-e)/1e3).toFixed(2)}s):
`+this.drawMap(n)),n}catch{t++}}buildSquare(e,r=3){for(var t=[];e.length;)t.push(e.splice(0,r));return t}squaresMakeMap(e){var r=3*Math.pow(e.length,.5),t=[],n=e=>{let r=e;for(;2<r;)r-=3;return r};for(const o of range(r))t.push(range(r));for(const a of range(r))for(const l of range(r))t[a][l]=e[3*(Math.ceil(a/3+.1)-1)+(Math.ceil(l/3+.1)-1)][n(a)][n(l)];return t}maskMap(e){var r=(new Date).getTime(),t=(e,r=1)=>{for(var t=copyObj(e).flat(1/0);r;){var n=choices(range(t.length));null!=t[n]&&(t[n]=null,r--)}return this.buildSquare(t)},n=copyObj(e),e=n.length/3,o=[];for(const f of range(e*e))o.push([]);for(const i of range(n.length))for(const c of range(n.length))o[3*Math.ceil((i+.1)/3)+Math.ceil((c+.1)/3)-4].push(n[i][c]);var e=Math.round(.21*n.length*n.length),a=n.length*n.length-e;let l=a;for(;0<l;)for(var s=l>o.length?range(o.length):shuffle(range(o.length));s.length&&l--;){var u=s.pop();o[u]=t(o[u])}var h=this.squaresMakeMap(o);return console.log(`Masked ${a} numbers with ${e} prompt numbers (${(((new Date).getTime()-r)/1e3).toFixed(2)}s):
`+this.drawMap(h)),h}}const sudoku=new Sudoku;window.onload=()=>{setTimeout(()=>{var e=sudoku.generateMap();sudoku.maskMap(e)},100)};