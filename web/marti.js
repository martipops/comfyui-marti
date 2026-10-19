function N(e,t,n){return(o,r)=>{let i=()=>o.setSize([o.size[0],o.computeSize()[1]]),s=t({onChange(c){c&&i(),o.setDirtyCanvas(!0,!0)}},o),a=o.addDOMWidget(r,e,s.el,{getValue:()=>s.data,setValue:c=>s.setData(c),getMinHeight:()=>s.minHeight,hideOnZoom:!0,margin:4});s.afterQueued&&Object.assign(a,{afterQueued:()=>s.afterQueued()});let d=o.onRemoved;return o.onRemoved=function(){s.dispose(),d?.call(this)},requestAnimationFrame(i),{widget:a,minWidth:n}}}function l(e,t={},...n){let[o,...r]=e.split("."),i=document.createElement(o);r.length&&(i.className=r.join(" "));for(let[s,a]of Object.entries(t))a===!1||a==null||i.setAttribute(s,a===!0?"":String(a));for(let s of n)s&&i.append(s);return i}function y(e,t=["pointerdown","wheel","keydown","contextmenu"]){for(let n of t)e.addEventListener(n,o=>o.stopPropagation())}function et(e,t,n,o,r){let i=new Set(n.map(d=>d.id));for(let d of t.keys())i.has(d)||t.delete(d);let s=n.map(d=>{let c=t.get(d.id);return c||t.set(d.id,c=o(d)),r(c,d),c.el}),a=e.children;(a.length!==s.length||s.some((d,c)=>a[c]!==d))&&e.replaceChildren(...s)}import{app as $t}from"../../scripts/app.js";import{api as Wt}from"../../scripts/api.js";var w=$t;function E(e){return w.extensionManager?.setting?.get(e)??w.ui?.settings?.getSettingValue(e)}var f=Wt;var nt=new Map;function Ft(e,t){let n=[],o=new Set,r=null,i=!1,s=new Set;async function a(){let c=await f.fetchApi(`/models/${encodeURIComponent(e)}`);if(!c.ok)throw new Error(`Failed to list models/${e} (${c.status})`);let p=await c.json();return Array.isArray(p)?p.filter(m=>typeof m=="string"):[]}function d(c=!1){return r&&!c||(r=a().then(p=>(n=p,o=new Set(p),i=!0,s.forEach(m=>m(n)),n)).catch(p=>(r=null,console.error("[comfyui-marti]",p),n))),r}return{noun:t,emptyText:`No ${t}s found in models/${e}`,list:()=>n,load:d,isMissing:c=>i&&c!==""&&!o.has(c),onChanged(c){return s.add(c),()=>s.delete(c)}}}function ot(e,t){let n=nt.get(e);return n||nt.set(e,n=Ft(e,t)),n}function M(e){let t=e.replace(/\\/g,"/"),n=t.lastIndexOf("/");return{name:t.slice(n+1).replace(/\.(safetensors|ckpt|pt|pth|bin)$/i,""),folder:n>=0?t.slice(0,n):""}}function rt(e,t){if(!e)return 0;let n=e.toLowerCase(),o=t.toLowerCase(),r=o.lastIndexOf("/")+1,i=o.indexOf(n,r);if(i>=0)return 1e3-(i-r)-o.length*.01;let s=o.indexOf(n);if(s>=0)return 500-s-o.length*.01;let a=0,d=0,c=0;for(let p of n){let m=o.indexOf(p,d);if(m<0)return-1;c=m===d?c+1:0,a+=1+c*2+(m>=r?1:0),d=m+1}return a}var Ut=200,$=class{root=l("div.mt-picker",{role:"dialog"});search=l("input.mt-picker-search",{type:"search",spellcheck:!1,autocomplete:"off",role:"combobox","aria-expanded":!0,"aria-controls":"mt-picker-list"});refresh=l("button.mt-icon-btn",{type:"button",title:"Rescan"},"\u27F3");list=l("ul.mt-picker-list",{id:"mt-picker-list",role:"listbox"});status=l("div.mt-picker-status");options=null;results=[];active=0;constructor(){this.root.append(l("div.mt-picker-head",{},this.search,this.refresh),this.list,this.status),y(this.root),this.search.addEventListener("input",()=>this.filter()),this.search.addEventListener("keydown",t=>this.onKey(t)),this.refresh.addEventListener("click",async()=>{this.setStatus("Rescanning\u2026"),await this.options?.source.load(!0),this.filter()}),this.list.addEventListener("pointerdown",t=>t.preventDefault()),this.list.addEventListener("click",t=>{let n=t.target.closest("[data-index]");n&&this.choose(Number(n.dataset.index))}),this.list.addEventListener("pointermove",t=>{let n=t.target.closest("[data-index]");n&&this.highlight(Number(n.dataset.index),!1)})}open(t){this.options=t;let{noun:n}=t.source;this.root.setAttribute("aria-label",`Choose ${n}`),this.search.placeholder=`Search ${n}s\u2026`,this.root.isConnected||document.body.append(this.root),this.root.hidden=!1,this.search.value="",this.position(t.anchor),this.filter(),this.search.focus(),document.addEventListener("pointerdown",this.onOutside,!0),window.addEventListener("blur",this.close),t.source.list().length||(this.setStatus("Loading\u2026"),t.source.load().then(()=>this.options===t&&this.filter()))}close=()=>{this.options&&(this.options=null,this.root.hidden=!0,document.removeEventListener("pointerdown",this.onOutside,!0),window.removeEventListener("blur",this.close))};onOutside=t=>{this.root.contains(t.target)||this.close()};position(t){let n=t.getBoundingClientRect(),o=Math.max(n.width,320),r=360,i=window.innerHeight-n.bottom,s=i>=r||i>=n.top?n.bottom+4:Math.max(8,n.top-r-4),a=Math.min(Math.max(8,n.left),window.innerWidth-o-8);Object.assign(this.root.style,{top:`${s}px`,left:`${a}px`,width:`${o}px`,maxHeight:`${r}px`})}filter(){let t=this.search.value.trim();if(!this.options)return;let n=this.options.source.list(),o=t?n.map(s=>[s,rt(t,s)]).filter(([,s])=>s>=0).sort((s,a)=>a[1]-s[1]).map(([s])=>s):n;this.results=o.slice(0,Ut),this.render();let r=this.options?.current?this.results.indexOf(this.options.current):-1;this.highlight(r>=0&&!t?r:0,!0);let i=o.length-this.results.length;this.setStatus(n.length?this.results.length?i>0?`${i} more \u2014 refine your search`:"":"No matches":this.options.source.emptyText)}render(){let{current:t,inUse:n}=this.options??{};this.list.replaceChildren(...this.results.map((o,r)=>{let{name:i,folder:s}=M(o);return l(`li.mt-picker-item${o===t?".mt-current":""}`,{role:"option","data-index":r,title:o},l("span.mt-picker-name",{},i),s?l("span.mt-picker-folder",{},s):null,n?.has(o)?l("span.mt-picker-badge",{title:"Already in this deck"},"in deck"):null)}))}highlight(t,n){if(!this.results.length)return;this.active=(t+this.results.length)%this.results.length,this.list.querySelector(".mt-active")?.classList.remove("mt-active");let o=this.list.children[this.active];o?.classList.add("mt-active"),o&&this.search.setAttribute("aria-activedescendant",o.id=`mt-opt-${this.active}`),n&&o?.scrollIntoView({block:"nearest"})}choose(t){let n=this.results[t],o=this.options;!n||!o||(this.close(),o.onPick(n))}onKey(t){let n={ArrowDown:1,ArrowUp:-1,PageDown:8,PageUp:-8};if(t.key in n)t.preventDefault(),this.highlight(this.active+n[t.key],!0);else if(t.key==="Enter")t.preventDefault(),this.choose(this.active);else if(t.key==="Escape"){t.preventDefault();let o=this.options?.anchor;this.close(),o?.focus()}}setStatus(t){this.status.textContent=t,this.status.hidden=!t}},zt=null,W=e=>(zt??=new $).open(e);function x(e,t,n=e.default){let o=typeof t=="number"?t:Number.parseFloat(String(t));if(!Number.isFinite(o))return n;let r=Number(o.toFixed(e.precision+1));return Math.min(e.max,Math.max(e.min,r))}var F=(e,t)=>t.toFixed(e.precision);var jt=3,Kt=.01,Bt=2;function it(e,t,n){let o=l("span.mt-scrub-fill"),r=l("span.mt-scrub-text"),i=l("input.mt-scrub-input",{type:"text",inputmode:"decimal","aria-label":e}),s=l("div.mt-scrub",{tabindex:0,role:"spinbutton","aria-label":e,"aria-valuemin":t.min,"aria-valuemax":t.max},o,r,i),a=t.default,d=()=>{r.textContent=F(t,a),s.setAttribute("aria-valuenow",String(a));let u=Math.min(1,Math.abs(a)/Bt)*100;o.style.width=`${u}%`,s.classList.toggle("mt-negative",a<0),s.classList.toggle("mt-zero",a===0)},c=(u,g)=>{u=x(t,u,a),!(u===a&&!g)&&(a=u,d(),n(a,g))},p=u=>u.shiftKey?.1:u.ctrlKey||u.metaKey?10:1;s.addEventListener("pointerdown",u=>{if(u.button!==0||s.classList.contains("mt-editing"))return;u.preventDefault();let g=u.clientX,Pt=a,P=!1;s.setPointerCapture(u.pointerId);let Y=V=>{let Z=V.clientX-g;if(!P&&Math.abs(Z)<jt)return;P=!0,s.classList.add("mt-scrubbing");let Vt=Pt+Z*Kt*p(V),tt=V.shiftKey?t.step/5:t.step;c(Math.round(Vt/tt)*tt,!1)},L=()=>{s.removeEventListener("pointermove",Y),s.removeEventListener("pointerup",L),s.removeEventListener("pointercancel",L),s.classList.remove("mt-scrubbing"),P?c(a,!0):m()};s.addEventListener("pointermove",Y),s.addEventListener("pointerup",L),s.addEventListener("pointercancel",L)}),s.addEventListener("dblclick",()=>{S(!1),c(t.default,!0)}),s.addEventListener("keydown",u=>{if(s.classList.contains("mt-editing"))return;let g=u.key==="ArrowUp"||u.key==="ArrowRight"?1:u.key==="ArrowDown"||u.key==="ArrowLeft"?-1:0;g?(u.preventDefault(),c(a+g*t.step*p(u),!0)):u.key==="Enter"&&(u.preventDefault(),m())});function m(){s.classList.add("mt-editing"),i.value=F(t,a),i.focus(),i.select()}function S(u){s.classList.contains("mt-editing")&&(s.classList.remove("mt-editing"),u&&c(x(t,i.value,a),!0))}return i.addEventListener("keydown",u=>{u.stopPropagation(),u.key==="Enter"?(S(!0),s.focus()):u.key==="Escape"&&(S(!1),s.focus())}),i.addEventListener("blur",()=>S(!0)),i.addEventListener("pointerdown",u=>u.stopPropagation()),d(),{el:s,set(u){a=x(t,u),d()}}}function U(e){let t=l("button.mt-toggle",{type:"button",role:"switch","aria-label":e},l("span.mt-toggle-knob"));return{el:t,set(n,o=!1){t.setAttribute("aria-checked",o?"mixed":String(n))}}}function st(e,t){let n=null,o=()=>{n=null,window.removeEventListener("pointerup",o)};e.addEventListener("pointerdown",r=>{if(r.button!==0)return;let i=t(r.target);i&&(r.preventDefault(),n=!i.current,i.apply(n),window.addEventListener("pointerup",o))}),e.addEventListener("pointerover",r=>{if(n===null||!(r.buttons&1))return;let i=t(r.target);i&&i.current!==n&&i.apply(n)}),e.addEventListener("keydown",r=>{if(r.key!==" "&&r.key!=="Enter")return;let i=t(r.target);i&&(r.preventDefault(),i.apply(!i.current))})}var z=()=>Math.random().toString(36).slice(2,10);function at(e){if(typeof e=="string")try{e=JSON.parse(e)}catch{return[]}let t=e?.rows;return Array.isArray(t)?t:[]}var R=e=>e!==null&&typeof e=="object"&&!Array.isArray(e);var dt=1,T={min:-10,max:10,step:.05,default:1,precision:2},ct=()=>({version:dt,rows:[]});function ut(e,t={}){return{id:z(),on:!0,lora:e,strength:T.default,strengthClip:null,...t}}var lt=(e,t)=>x(T,e,t);function Gt(e){return!R(e)||typeof e.lora!="string"?null:{id:typeof e.id=="string"&&e.id?e.id:z(),on:e.on!==!1,lora:e.lora.trim(),strength:lt(e.strength),strengthClip:e.strengthClip==null?null:lt(e.strengthClip)}}function pt(e){return{version:dt,rows:at(e).map(Gt).filter(t=>t!==null)}}var mt=e=>e.on&&e.lora!==""&&(e.strength!==0||(e.strengthClip??0)!==0);var C=ot("loras","LoRA"),b={headerHeight:30,rowHeight:30,rowGap:4,emptyHeight:44,padding:6},D=class{constructor(t){this.events=t;for(let[n,o]of Object.entries(b))this.el.style.setProperty(`--ld-${n}`,`${o}px`);this.masterToggle.el.classList.add("ld-master"),this.el.append(l("div.ld-header",{},this.masterToggle.el,this.countEl,this.addBtn),this.rowsEl,this.emptyEl),y(this.el),this.addBtn.addEventListener("click",()=>this.pickNew(this.addBtn)),this.emptyEl.addEventListener("click",()=>this.pickNew(this.emptyEl)),this.masterToggle.el.addEventListener("click",()=>{let n=!this.value.rows.every(o=>o.on);this.mutate(()=>this.value.rows.forEach(o=>o.on=n))}),st(this.rowsEl,n=>{let o=this.rowFromEvent(n,".mt-toggle");return o&&{current:o.on,apply:r=>this.mutate(()=>o.on=r)}}),this.rowsEl.addEventListener("click",n=>this.onRowClick(n)),this.unsubscribe=C.onChanged(()=>this.render()),C.load(),this.render()}el=l("div.mt-root.ld-deck");value=ct();views=new Map;rowsEl=l("div.ld-rows",{role:"list"});masterToggle=U("Toggle all LoRAs");countEl=l("span.ld-count");addBtn=l("button.mt-btn.ld-add",{type:"button",title:"Add a LoRA"},"+ Add LoRA");emptyEl=l("button.ld-empty",{type:"button"},"No LoRAs yet \u2014 click to add one");unsubscribe;get data(){return this.value}setData(t){this.value=pt(t),this.render()}get minHeight(){let t=this.value.rows.length,n=t?t*b.rowHeight+(t-1)*b.rowGap:b.emptyHeight;return b.headerHeight+b.rowGap+n+b.padding*2}dispose(){this.unsubscribe()}mutate(t,n=!1){t(),this.render(),this.events.onChange(n)}findRow(t){return t?this.value.rows.find(n=>n.id===t):void 0}rowFromEvent(t,n){let o=t?.closest?.(n);return o?this.findRow(o.closest(".ld-row")?.dataset.id):void 0}pickNew(t){W({source:C,anchor:t,inUse:new Set(this.value.rows.map(n=>n.lora)),onPick:n=>this.mutate(()=>this.value.rows.push(ut(n)),!0)})}onRowClick(t){let n=t.target,o=this.rowFromEvent(n,".ld-row");o&&(n.closest(".ld-remove")?this.mutate(()=>this.value.rows=this.value.rows.filter(r=>r!==o),!0):n.closest(".ld-name")&&W({source:C,anchor:this.views.get(o.id).name,current:o.lora,inUse:new Set(this.value.rows.map(r=>r.lora)),onPick:r=>this.mutate(()=>o.lora=r)}))}render(){let{rows:t}=this.value;et(this.rowsEl,this.views,t,o=>this.createRowView(o),(o,r)=>this.updateRowView(o,r));let n=t.filter(mt).length;this.masterToggle.set(t.length>0&&n===t.length,n>0&&n<t.length),this.masterToggle.el.disabled=t.length===0,this.countEl.textContent=t.length?`${n} of ${t.length} active`:"",this.emptyEl.hidden=t.length>0,this.rowsEl.hidden=t.length===0}createRowView(t){let n=U("Enable LoRA"),o=l("button.ld-name",{type:"button"}),{id:r}=t,i=it("Strength",T,(d,c)=>{let p=this.findRow(r);p&&(p.strength=d,c?this.mutate(()=>{}):this.render())}),s=l("button.mt-icon-btn.ld-remove",{type:"button",title:"Remove","aria-label":"Remove LoRA"},"\xD7");return{el:l("div.ld-row",{role:"listitem","data-id":t.id},n.el,o,i.el,s),toggle:n,name:o,scrubber:i}}updateRowView(t,n){let{name:o,folder:r}=M(n.lora),i=C.isMissing(n.lora);t.toggle.set(n.on),t.scrubber.set(n.strength),t.el.classList.toggle("ld-off",!n.on),t.el.classList.toggle("ld-missing",i),t.name.title=i?`Not found in models/loras: ${n.lora}`:n.lora||"Choose a LoRA",t.name.replaceChildren(l("span.ld-name-text",{},o||"Choose a LoRA\u2026"),r?l("span.ld-name-folder",{},r):"",i?l("span.ld-warn",{"aria-hidden":!0},"\u26A0"):"")}};var ht=`/* LoRA Deck layout. Shared controls and theme tokens live in shared/theme.css. */
.ld-deck {
  display: flex;
  flex-direction: column;
  gap: var(--ld-rowGap);
  padding: var(--ld-padding);
  width: 100%;
  height: 100%;
  overflow: hidden auto;
}
.ld-header {
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--ld-headerHeight);
  flex: none;
  padding: 0 2px;
}
.ld-count {
  flex: 1;
  color: var(--mt-muted);
  font-variant-numeric: tabular-nums;
}
.ld-rows {
  display: flex;
  flex-direction: column;
  gap: var(--ld-rowGap);
}
.ld-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 64px 22px;
  align-items: center;
  gap: 8px;
  height: var(--ld-rowHeight);
  padding: 0 4px 0 8px;
  border-radius: var(--mt-radius);
  background: var(--mt-bg);
  border: 1px solid transparent;
  transition: opacity 120ms, border-color 120ms;
}
.ld-row:hover {
  border-color: var(--mt-border);
}
.ld-row.ld-off .ld-name,
.ld-row.ld-off .mt-scrub {
  opacity: 0.45;
}
.ld-row.ld-missing {
  border-color: color-mix(in srgb, var(--mt-danger) 55%, transparent);
}

.ld-remove {
  opacity: 0;
}
.ld-row:hover .ld-remove,
.ld-remove:focus-visible {
  opacity: 1;
}
.ld-remove:hover {
  color: var(--mt-danger) !important;
}
.ld-empty {
  height: var(--ld-emptyHeight);
  border: 1px dashed var(--mt-border) !important;
  border-radius: var(--mt-radius);
  color: var(--mt-muted) !important;
}
.ld-empty:hover {
  color: var(--mt-fg) !important;
  border-color: var(--mt-accent) !important;
}

.ld-name {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  height: 100%;
  line-height: 1;
  text-align: left;
}
.ld-name-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ld-name-folder {
  flex: none;
  max-width: 40%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--mt-muted);
  font-size: 11px;
}
.ld-name:hover .ld-name-text {
  text-decoration: underline;
  text-underline-offset: 2px;
}
.ld-warn {
  color: var(--mt-danger);
}

`;var ft="LORA_DECK",gt={styles:ht,widgets:{[ft]:N(ft,e=>new D(e),340)}};function bt(e,t){let n=e.input?.optional;if(n)for(let o of Object.keys(n))t(o)&&delete n[o];e.input_order?.optional&&(e.input_order.optional=e.input_order.optional.filter(o=>!t(o)))}function vt(e,t){for(let n of["output","output_is_list","output_name","output_tooltips"])e[n]=e[n]?.slice(0,t)}var yt=2,K=12,B=8,Xt=(e,t)=>`c${e}_o${t}`,k=/^c(\d+)_o(\d+)$/,A=e=>`C${e}`,v=()=>({version:yt,channels:2,outputs:1,active:0,mode:"fixed"}),j=(e,t,n,o)=>Number.isInteger(e)?Math.min(n,Math.max(t,e)):o;function wt(e){if(typeof e=="string")try{e=JSON.parse(e)}catch{return v()}if(!R(e))return v();let t=v(),n=j(e.channels,1,K,t.channels);return{version:yt,channels:n,outputs:j(e.outputs,1,B,t.outputs),active:j(e.active,0,n-1,0),mode:e.mode==="cycle"?"cycle":"fixed"}}var xt=e=>(e.active+1)%e.channels;function kt(e){let t=[];for(let n=0;n<e.channels;n++)for(let o=0;o<e.outputs;o++)t.push(Xt(n,o));return t}var Et=`/* Source Switch panel. Shared controls and theme tokens live in shared/theme.css. */
.ss-switch {
  display: flex;
  flex-direction: column;
  gap: var(--ss-gap);
  padding: var(--ss-padding);
  width: 100%;
  height: 100%;
}
.ss-row {
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--ss-rowHeight);
  flex: none;
  min-width: 0;
}
.ss-caption {
  flex: none;
  color: var(--mt-muted);
}
.ss-select {
  flex: 1;
  min-width: 0;
  height: 24px;
  padding: 0 6px;
  border-radius: var(--mt-radius);
  border: 1px solid var(--mt-border);
  background: var(--mt-bg);
  color: var(--mt-fg);
  font: inherit;
  cursor: pointer;
}
.ss-select:hover {
  background: var(--mt-bg-hover);
}
.ss-select:focus-visible {
  border-color: var(--mt-accent);
  outline: none;
}
.ss-mode {
  flex: none;
  color: var(--mt-muted) !important;
}
.ss-mode[aria-pressed="true"] {
  color: var(--mt-fg) !important;
  border-color: var(--mt-accent) !important;
  background: color-mix(in srgb, var(--mt-accent) 22%, var(--mt-bg)) !important;
}
.ss-row .mt-stepper {
  flex: 1;
}

/* Vue nodes mode lays nodes out with HTML (sockets, then widgets, in a flex column),
   so slot_start_y doesn't apply there. Move the section holding the panel to the top. */
[data-testid^="node-body-"]:has(.ss-switch) > :has(.ss-switch) {
  order: -1;
}
.ss-select:disabled,
.ss-mode:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`;function G(e,t,n,o){let r=l("button.mt-icon-btn",{type:"button","aria-label":`Fewer ${e.toLowerCase()}`},"\u2212"),i=l("button.mt-icon-btn",{type:"button","aria-label":`More ${e.toLowerCase()}`},"+"),s=l("span.mt-stepper-count",{"aria-live":"polite"}),a=l("div.mt-stepper",{role:"group","aria-label":e},l("span.mt-stepper-label",{},e),r,s,i);return r.addEventListener("click",()=>o(-1)),i.addEventListener("click",()=>o(1)),{el:a,set(d){s.textContent=String(d),r.disabled=d<=t,i.disabled=d>=n}}}var h="*",_=e=>k.test(e),Qt=e=>Number(k.exec(e)[2]);function Yt(e,t){let n=Array.from({length:t.outputs},()=>h);return e.graph&&e.inputs.forEach((o,r)=>{if(!_(o.name))return;let i=e.getInputLink(r),s=Qt(o.name);i&&s<n.length&&n[s]===h&&i.type&&i.type!==h&&(n[s]=i.type)}),n}function Zt(e){let t=new Map;for(let n=e.inputs.length-1;n>=0;n--){let{name:o}=e.inputs[n];if(!_(o))continue;let r=e.getInputLink(n);r&&t.set(o,{originId:r.origin_id,originSlot:r.origin_slot}),e.removeInput(n)}return t}function te(e,t){for(let[n,{originId:o,originSlot:r}]of t){let i=e.graph?.getNodeById(o),s=e.inputs.findIndex(a=>a.name===n);i&&s>=0&&i.connect(r,e,s)}}function Ct(e,t){let n=kt(t),o=new Set(n);for(let i=e.inputs.length-1;i>=0;i--){let{name:s}=e.inputs[i];_(s)&&!o.has(s)&&e.removeInput(i)}let r=e.inputs.filter(i=>_(i.name)).map(i=>i.name);if(r.every((i,s)=>n[s]===i))for(let i of n.slice(r.length))e.addInput(i,h);else{let i=Zt(e);for(let s of n)e.addInput(s,h);te(e,i)}for(;e.outputs.length>t.outputs;)e.removeOutput(e.outputs.length-1);for(;e.outputs.length<t.outputs;)e.addOutput(`out${e.outputs.length}`,h);J(e,t)}function J(e,t){let n=Yt(e,t),o=r=>n[r]!==h?n[r]:`out${r}`;for(let r of e.inputs){let i=k.exec(r.name);if(!i)continue;let s=Number(i[2]);r.label=`${A(Number(i[1]))} \xB7 ${o(s)}`,r.type=n[s]??h}e.outputs.forEach((r,i)=>{r.label=o(i),r.type=n[i]??h}),e.setDirtyCanvas(!0,!0)}var ee="channel";function St(e){if(!e.graph)return!1;let t=e.inputs.findIndex(n=>n.name===ee);return t>=0&&e.isInputConnected(t)}var H={rowHeight:26,gap:6,padding:6},X=H.rowHeight*2+H.gap+H.padding*2,O=class{constructor(t,n){this.events=t;this.node=n;for(let[r,i]of Object.entries(H))this.el.style.setProperty(`--ss-${r}`,`${i}px`);this.el.append(l("div.ss-row",{},l("label.ss-caption",{},"Channel"),this.select,this.modeBtn),l("div.ss-row",{},this.channels.el,this.outputs.el)),y(this.el),this.select.addEventListener("change",()=>this.update(()=>this.value.active=Number(this.select.value))),this.modeBtn.addEventListener("click",()=>this.update(()=>this.value.mode=this.value.mode==="cycle"?"fixed":"cycle"));let o=n.onConnectionsChange;n.onConnectionsChange=(...r)=>{o?.apply(n,r),J(n,this.value),this.render()},this.render(),this.scheduleSync()}el=l("div.mt-root.ss-switch");minHeight=X;value=v();select=l("select.ss-select",{"aria-label":"Active channel"});modeBtn=l("button.mt-btn.ss-mode",{type:"button",title:"Switch to the next channel after each queued run"},"\u27F3 Cycle");channels=G("Channels",1,K,t=>this.update(()=>{this.value.channels+=t,this.value.active=Math.min(this.value.active,this.value.channels-1)},!0));outputs=G("Outputs",1,B,t=>this.update(()=>this.value.outputs+=t,!0));syncQueued=!1;linked=!1;get data(){return this.value}setData(t){this.value=wt(t),this.render(),this.scheduleSync()}afterQueued(){this.value.mode==="cycle"&&!this.linked&&this.update(()=>this.value.active=xt(this.value))}dispose(){}update(t,n=!1){t(),this.render(),n&&this.scheduleSync(),this.events.onChange(!1)}scheduleSync(t=30){this.syncQueued||(this.syncQueued=!0,requestAnimationFrame(()=>{if(this.syncQueued=!1,!this.node.graph){t>0&&this.scheduleSync(t-1);return}Ct(this.node,this.value),this.render(),this.events.onChange(!0)}))}render(){let{channels:t,outputs:n,active:o,mode:r}=this.value;this.linked=St(this.node);let i=`${t}:${this.linked}`;if(this.select.dataset.options!==i){this.select.dataset.options=i;let s=Array.from({length:t},(a,d)=>l("option",{value:d},A(d)));this.linked&&s.push(l("option",{value:"input"},"From input")),this.select.replaceChildren(...s)}this.select.value=this.linked?"input":String(o),this.select.disabled=this.linked,this.modeBtn.disabled=this.linked,this.modeBtn.title=this.linked?"Disabled while the channel input is connected":"Switch to the next channel after each queued run",this.modeBtn.setAttribute("aria-pressed",String(r==="cycle"&&!this.linked)),this.channels.set(t),this.outputs.set(n)}};var Lt="MARTI_SOURCE_SWITCH",ne=4,Nt={styles:Et,widgets:{[Lt]:N(Lt,(e,t)=>new O(e,t),300)},nodeId:"MartiSourceSwitch",patchDef(e){bt(e,t=>k.test(t)),vt(e,v().outputs)},patchType(e){e.slot_start_y=X+ne*2,Object.assign(e.prototype,{widgets_start_y:0})}};function oe(e){let t=Math.round(e/1e3);if(t<60)return`${t}s`;let n=Math.floor(t/60);return n<60?`${n}m ${t%60}s`:`${Math.floor(n/60)}h ${n%60}m`}function Mt(e){let t=e.workflow||(e.ok?"ComfyUI job finished":"ComfyUI job failed");return e.durationMs!=null?`${t} \xB7 ${oe(e.durationMs)}`:t}function Rt(e){if(e.ok)return"Done";let t=e.nodeType?` at ${e.nodeType}`:"",n=e.error?`: ${e.error.replace(/\s+/g," ").slice(0,300)}`:"";return`Failed${t}${n}`}function q(e,t,n){return t=t.trim(),t?`${(e.trim()||"https://ntfy.sh").replace(/\/+$/,"")}/${encodeURIComponent(t)}?${new URLSearchParams(n)}`:null}function Tt(e){return e.ok?{title:Mt(e),tags:"white_check_mark"}:{title:Mt(e),tags:"x",priority:"high"}}var Q="Marti.Ntfy.Topic",Dt="Marti.Ntfy.Server",At="Marti.Ntfy.Attach",_t=[{id:Q,category:["Marti","ntfy","Topic"],name:"ntfy topic",tooltip:"Notify this topic when a job finishes or fails. Leave empty to disable.",type:"text",defaultValue:""},{id:Dt,category:["Marti","ntfy","Server"],name:"ntfy server",type:"text",defaultValue:"https://ntfy.sh"},{id:At,category:["Marti","ntfy","Attach"],name:"Attach the result image",tooltip:"Uploads the job's main saved output to ntfy. Anyone who knows the topic can see it.",type:"boolean",defaultValue:!0}],Ht=()=>w.extensionManager?.workflow;function re(e){if(!e)return;let t=(Ht()?.openWorkflows??[]).filter(n=>(n.activeState?.id??n.initialState?.id)===e);return t.length===1?t[0].filename:void 0}var ie=e=>new Promise(t=>setTimeout(t,e));async function se(e){for(let t=0;t<20;t++){try{let n=await f.fetchApi(`/jobs/${encodeURIComponent(e)}`);if(n.ok){let o=await n.json();if(o.status!=="pending"&&o.status!=="in_progress")return o}}catch{}await ie(250)}}var ae=e=>`/view?${new URLSearchParams({filename:e.filename,subfolder:e.subfolder??"",type:e.type??"output"})}`;function le(e){let t=e?.preview_output;if(!(!t||t.type!=="output"||t.mediaType==="text"))return t}async function de(e,t){let n=String(E(Dt)??""),o=String(E(Q)??""),r=Tt(e),i=Rt(e);if(t&&E(At)!==!1)try{let a=await f.fetchApi(ae(t)),d=q(n,o,{...r,message:i,filename:t.filename});if(d&&a.ok&&(await fetch(d,{method:"PUT",body:await a.blob()})).ok)return}catch(a){console.warn("[marti] ntfy attachment failed, sending text only",a)}let s=q(n,o,r);s&&await fetch(s,{method:"POST",body:i})}function Ot(){let e=new Map,t=r=>r.detail??{},n=async(r,i)=>{let s=r.prompt_id??"",a=e.get(s);if(e.delete(s),!String(E(Q)??"").trim())return;let d=s?await se(s):void 0,c={ok:i,workflow:re(d?.workflow_id)??a?.workflow,durationMs:a?Date.now()-a.start:void 0,nodeType:r.node_type,error:r.exception_message?.trim()};await de(c,i?le(d):void 0)},o=r=>r().catch(i=>console.warn("[marti] ntfy failed",i));f.addEventListener("execution_start",r=>{let i=t(r).prompt_id;i&&e.set(i,{start:Date.now(),workflow:Ht()?.activeWorkflow?.filename})}),f.addEventListener("execution_success",r=>o(()=>n(t(r),!0))),f.addEventListener("execution_error",r=>o(()=>n(t(r),!1)))}var It=`/* Shared theme tokens and controls. Colors come from ComfyUI theme variables so every palette works. */
.mt-root,
.mt-picker {
  --mt-bg: var(--comfy-input-bg, #222);
  --mt-bg-hover: color-mix(in srgb, var(--mt-fg) 8%, var(--mt-bg));
  --mt-fg: var(--input-text, #ddd);
  --mt-muted: var(--descrip-text, #999);
  --mt-border: var(--border-color, #444);
  --mt-accent: var(--p-primary-color, #4f8cff);
  --mt-danger: var(--error-text, #ff6b6b);
  --mt-radius: 6px;
  font: 12px/1.3 system-ui, sans-serif;
  color: var(--mt-fg);
  box-sizing: border-box;
}
.mt-root *,
.mt-picker * {
  box-sizing: border-box;
}
.mt-root button,
.mt-picker button {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
}
.mt-root :focus-visible,
.mt-picker :focus-visible {
  outline: 2px solid var(--mt-accent);
  outline-offset: 1px;
}

/* ---- buttons ----------------------------------------------------------- */
.mt-btn {
  height: 24px;
  padding: 0 10px !important;
  border-radius: var(--mt-radius);
  background: var(--mt-bg) !important;
  border: 1px solid var(--mt-border) !important;
}
.mt-btn:hover {
  background: var(--mt-bg-hover) !important;
}
.mt-icon-btn {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  color: var(--mt-muted) !important;
  font-size: 15px !important;
  line-height: 1;
}
.mt-icon-btn:hover {
  background: var(--mt-bg-hover) !important;
  color: var(--mt-fg) !important;
}

/* ---- toggle switch ----------------------------------------------------- */
.mt-toggle {
  position: relative;
  width: 28px;
  height: 16px;
  flex: none;
  border-radius: 8px;
  background: var(--mt-border) !important;
  transition: background 120ms;
  touch-action: none;
}
.mt-toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  transition: transform 120ms;
}
.mt-toggle[aria-checked="true"] {
  background: var(--mt-accent) !important;
}
.mt-toggle[aria-checked="true"] .mt-toggle-knob {
  transform: translateX(12px);
}
.mt-toggle[aria-checked="mixed"] {
  background: color-mix(in srgb, var(--mt-accent) 50%, var(--mt-border)) !important;
}
.mt-toggle[aria-checked="mixed"] .mt-toggle-knob {
  transform: translateX(6px);
}
.mt-toggle:disabled {
  opacity: 0.4;
  cursor: default;
}

/* ---- strength scrubber -------------------------------------------------- */
.mt-scrub {
  position: relative;
  height: 22px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--mt-fg) 6%, transparent);
  cursor: ew-resize;
  overflow: hidden;
  touch-action: none;
  user-select: none;
}
.mt-scrub:hover,
.mt-scrub.mt-scrubbing {
  background: color-mix(in srgb, var(--mt-fg) 12%, transparent);
}
.mt-scrub-fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: color-mix(in srgb, var(--mt-accent) 35%, transparent);
  pointer-events: none;
}
.mt-scrub.mt-negative .mt-scrub-fill {
  background: color-mix(in srgb, var(--mt-danger) 35%, transparent);
}
.mt-scrub-text,
.mt-scrub-input {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-variant-numeric: tabular-nums;
}
.mt-scrub.mt-zero .mt-scrub-text {
  color: var(--mt-muted);
}
.mt-scrub-input {
  display: none;
  width: 100%;
  border: 0;
  padding: 0;
  text-align: center;
  font: inherit;
  color: inherit;
  background: var(--mt-bg);
  outline: none;
}
.mt-scrub.mt-editing {
  cursor: text;
}
.mt-scrub.mt-editing .mt-scrub-input {
  display: block;
}
.mt-scrub.mt-editing .mt-scrub-text,
.mt-scrub.mt-editing .mt-scrub-fill {
  visibility: hidden;
}

/* ---- picker popover ------------------------------------------------------ */
.mt-picker {
  position: fixed;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  background: var(--comfy-menu-bg, #1e1e1e);
  border: 1px solid var(--mt-border);
  border-radius: 8px;
  box-shadow: 0 8px 28px rgb(0 0 0 / 0.45);
  overflow: hidden;
}
.mt-picker[hidden] {
  display: none;
}
.mt-picker-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-bottom: 1px solid var(--mt-border);
}
.mt-picker-search {
  flex: 1;
  height: 28px;
  padding: 0 8px;
  border-radius: var(--mt-radius);
  border: 1px solid var(--mt-border);
  background: var(--mt-bg);
  color: var(--mt-fg);
  font: inherit;
  outline: none;
}
.mt-picker-search:focus {
  border-color: var(--mt-accent);
}
.mt-picker-list {
  list-style: none;
  margin: 0;
  padding: 4px;
  overflow-y: auto;
}
.mt-picker-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.mt-picker-item.mt-active {
  background: color-mix(in srgb, var(--mt-accent) 22%, transparent);
}
.mt-picker-item.mt-current .mt-picker-name {
  font-weight: 600;
}
.mt-picker-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mt-picker-folder,
.mt-picker-badge {
  flex: none;
  color: var(--mt-muted);
  font-size: 11px;
}
.mt-picker-badge {
  padding: 0 6px;
  border-radius: 8px;
  border: 1px solid var(--mt-border);
}
.mt-picker-status {
  padding: 8px 12px;
  color: var(--mt-muted);
  border-top: 1px solid var(--mt-border);
}
.mt-picker-status[hidden] {
  display: none;
}

/* ---- stepper ------------------------------------------------------------- */
.mt-stepper {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
}
.mt-stepper-label {
  flex: 1;
  color: var(--mt-muted);
}
.mt-stepper-count {
  min-width: 2ch;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.mt-stepper .mt-icon-btn:disabled {
  opacity: 0.35;
  cursor: default;
}
`;var I=[gt,Nt];function ue(){let e="comfyui-marti-styles";if(document.getElementById(e))return;let t=document.createElement("style");t.id=e,t.textContent=[It,...I.map(n=>n.styles??"")].join(`
`),document.head.append(t)}w.registerExtension({name:"comfyui-marti",settings:_t,setup(){ue(),Ot()},getCustomWidgets:()=>Object.assign({},...I.map(e=>e.widgets??{})),addCustomNodeDefs(e){for(let t of I){let n=t.nodeId?e[t.nodeId]:void 0;n&&t.patchDef?.(n)}},beforeRegisterNodeDef(e,t){I.find(n=>n.nodeId===t.name)?.patchType?.(e)}});
