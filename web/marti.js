function S(n,e,t){return(r,o)=>{let i=()=>r.setSize([r.size[0],r.computeSize()[1]]),s=e({onChange(c){c&&i(),r.setDirtyCanvas(!0,!0)}},r),a=r.addDOMWidget(o,n,s.el,{getValue:()=>s.data,setValue:c=>s.setData(c),getMinHeight:()=>s.minHeight,hideOnZoom:!0,margin:4});s.afterQueued&&Object.assign(a,{afterQueued:()=>s.afterQueued()});let u=r.onRemoved;return r.onRemoved=function(){s.dispose(),u?.call(this)},requestAnimationFrame(i),{widget:a,minWidth:t}}}function l(n,e={},...t){let[r,...o]=n.split("."),i=document.createElement(r);o.length&&(i.className=o.join(" "));for(let[s,a]of Object.entries(e))a===!1||a==null||i.setAttribute(s,a===!0?"":String(a));for(let s of t)s&&i.append(s);return i}function v(n,e=["pointerdown","wheel","keydown","contextmenu"]){for(let t of e)n.addEventListener(t,r=>r.stopPropagation())}function X(n,e,t,r,o){let i=new Set(t.map(u=>u.id));for(let u of e.keys())i.has(u)||e.delete(u);let s=t.map(u=>{let c=e.get(u.id);return c||e.set(u.id,c=r(u)),o(c,u),c.el}),a=n.children;(a.length!==s.length||s.some((u,c)=>a[c]!==u))&&n.replaceChildren(...s)}import{app as Ne}from"../../scripts/app.js";import{api as Me}from"../../scripts/api.js";var Q=Ne,q=Me;var Y=new Map;function Re(n,e){let t=[],r=new Set,o=null,i=!1,s=new Set;async function a(){let c=await q.fetchApi(`/models/${encodeURIComponent(n)}`);if(!c.ok)throw new Error(`Failed to list models/${n} (${c.status})`);let m=await c.json();return Array.isArray(m)?m.filter(p=>typeof p=="string"):[]}function u(c=!1){return o&&!c||(o=a().then(m=>(t=m,r=new Set(m),i=!0,s.forEach(p=>p(t)),t)).catch(m=>(o=null,console.error("[comfyui-marti]",m),t))),o}return{noun:e,emptyText:`No ${e}s found in models/${n}`,list:()=>t,load:u,isMissing:c=>i&&c!==""&&!r.has(c),onChanged(c){return s.add(c),()=>s.delete(c)}}}function J(n,e){let t=Y.get(n);return t||Y.set(n,t=Re(n,e)),t}function C(n){let e=n.replace(/\\/g,"/"),t=e.lastIndexOf("/");return{name:e.slice(t+1).replace(/\.(safetensors|ckpt|pt|pth|bin)$/i,""),folder:t>=0?e.slice(0,t):""}}function Z(n,e){if(!n)return 0;let t=n.toLowerCase(),r=e.toLowerCase(),o=r.lastIndexOf("/")+1,i=r.indexOf(t,o);if(i>=0)return 1e3-(i-o)-r.length*.01;let s=r.indexOf(t);if(s>=0)return 500-s-r.length*.01;let a=0,u=0,c=0;for(let m of t){let p=r.indexOf(m,u);if(p<0)return-1;c=p===u?c+1:0,a+=1+c*2+(p>=o?1:0),u=p+1}return a}var Te=200,P=class{root=l("div.mt-picker",{role:"dialog"});search=l("input.mt-picker-search",{type:"search",spellcheck:!1,autocomplete:"off",role:"combobox","aria-expanded":!0,"aria-controls":"mt-picker-list"});refresh=l("button.mt-icon-btn",{type:"button",title:"Rescan"},"\u27F3");list=l("ul.mt-picker-list",{id:"mt-picker-list",role:"listbox"});status=l("div.mt-picker-status");options=null;results=[];active=0;constructor(){this.root.append(l("div.mt-picker-head",{},this.search,this.refresh),this.list,this.status),v(this.root),this.search.addEventListener("input",()=>this.filter()),this.search.addEventListener("keydown",e=>this.onKey(e)),this.refresh.addEventListener("click",async()=>{this.setStatus("Rescanning\u2026"),await this.options?.source.load(!0),this.filter()}),this.list.addEventListener("pointerdown",e=>e.preventDefault()),this.list.addEventListener("click",e=>{let t=e.target.closest("[data-index]");t&&this.choose(Number(t.dataset.index))}),this.list.addEventListener("pointermove",e=>{let t=e.target.closest("[data-index]");t&&this.highlight(Number(t.dataset.index),!1)})}open(e){this.options=e;let{noun:t}=e.source;this.root.setAttribute("aria-label",`Choose ${t}`),this.search.placeholder=`Search ${t}s\u2026`,this.root.isConnected||document.body.append(this.root),this.root.hidden=!1,this.search.value="",this.position(e.anchor),this.filter(),this.search.focus(),document.addEventListener("pointerdown",this.onOutside,!0),window.addEventListener("blur",this.close),e.source.list().length||(this.setStatus("Loading\u2026"),e.source.load().then(()=>this.options===e&&this.filter()))}close=()=>{this.options&&(this.options=null,this.root.hidden=!0,document.removeEventListener("pointerdown",this.onOutside,!0),window.removeEventListener("blur",this.close))};onOutside=e=>{this.root.contains(e.target)||this.close()};position(e){let t=e.getBoundingClientRect(),r=Math.max(t.width,320),o=360,i=window.innerHeight-t.bottom,s=i>=o||i>=t.top?t.bottom+4:Math.max(8,t.top-o-4),a=Math.min(Math.max(8,t.left),window.innerWidth-r-8);Object.assign(this.root.style,{top:`${s}px`,left:`${a}px`,width:`${r}px`,maxHeight:`${o}px`})}filter(){let e=this.search.value.trim();if(!this.options)return;let t=this.options.source.list(),r=e?t.map(s=>[s,Z(e,s)]).filter(([,s])=>s>=0).sort((s,a)=>a[1]-s[1]).map(([s])=>s):t;this.results=r.slice(0,Te),this.render();let o=this.options?.current?this.results.indexOf(this.options.current):-1;this.highlight(o>=0&&!e?o:0,!0);let i=r.length-this.results.length;this.setStatus(t.length?this.results.length?i>0?`${i} more \u2014 refine your search`:"":"No matches":this.options.source.emptyText)}render(){let{current:e,inUse:t}=this.options??{};this.list.replaceChildren(...this.results.map((r,o)=>{let{name:i,folder:s}=C(r);return l(`li.mt-picker-item${r===e?".mt-current":""}`,{role:"option","data-index":o,title:r},l("span.mt-picker-name",{},i),s?l("span.mt-picker-folder",{},s):null,t?.has(r)?l("span.mt-picker-badge",{title:"Already in this deck"},"in deck"):null)}))}highlight(e,t){if(!this.results.length)return;this.active=(e+this.results.length)%this.results.length,this.list.querySelector(".mt-active")?.classList.remove("mt-active");let r=this.list.children[this.active];r?.classList.add("mt-active"),r&&this.search.setAttribute("aria-activedescendant",r.id=`mt-opt-${this.active}`),t&&r?.scrollIntoView({block:"nearest"})}choose(e){let t=this.results[e],r=this.options;!t||!r||(this.close(),r.onPick(t))}onKey(e){let t={ArrowDown:1,ArrowUp:-1,PageDown:8,PageUp:-8};if(e.key in t)e.preventDefault(),this.highlight(this.active+t[e.key],!0);else if(e.key==="Enter")e.preventDefault(),this.choose(this.active);else if(e.key==="Escape"){e.preventDefault();let r=this.options?.anchor;this.close(),r?.focus()}}setStatus(e){this.status.textContent=e,this.status.hidden=!e}},Ae=null,$=n=>(Ae??=new P).open(n);function b(n,e,t=n.default){let r=typeof e=="number"?e:Number.parseFloat(String(e));if(!Number.isFinite(r))return t;let o=Number(r.toFixed(n.precision+1));return Math.min(n.max,Math.max(n.min,o))}var W=(n,e)=>e.toFixed(n.precision);var He=3,De=.01,Ve=2;function ee(n,e,t){let r=l("span.mt-scrub-fill"),o=l("span.mt-scrub-text"),i=l("input.mt-scrub-input",{type:"text",inputmode:"decimal","aria-label":n}),s=l("div.mt-scrub",{tabindex:0,role:"spinbutton","aria-label":n,"aria-valuemin":e.min,"aria-valuemax":e.max},r,o,i),a=e.default,u=()=>{o.textContent=W(e,a),s.setAttribute("aria-valuenow",String(a));let d=Math.min(1,Math.abs(a)/Ve)*100;r.style.width=`${d}%`,s.classList.toggle("mt-negative",a<0),s.classList.toggle("mt-zero",a===0)},c=(d,g)=>{d=b(e,d,a),!(d===a&&!g)&&(a=d,u(),t(a,g))},m=d=>d.shiftKey?.1:d.ctrlKey||d.metaKey?10:1;s.addEventListener("pointerdown",d=>{if(d.button!==0||s.classList.contains("mt-editing"))return;d.preventDefault();let g=d.clientX,Ce=a,O=!1;s.setPointerCapture(d.pointerId);let U=I=>{let j=I.clientX-g;if(!O&&Math.abs(j)<He)return;O=!0,s.classList.add("mt-scrubbing");let Le=Ce+j*De*m(I),G=I.shiftKey?e.step/5:e.step;c(Math.round(Le/G)*G,!1)},E=()=>{s.removeEventListener("pointermove",U),s.removeEventListener("pointerup",E),s.removeEventListener("pointercancel",E),s.classList.remove("mt-scrubbing"),O?c(a,!0):p()};s.addEventListener("pointermove",U),s.addEventListener("pointerup",E),s.addEventListener("pointercancel",E)}),s.addEventListener("dblclick",()=>{k(!1),c(e.default,!0)}),s.addEventListener("keydown",d=>{if(s.classList.contains("mt-editing"))return;let g=d.key==="ArrowUp"||d.key==="ArrowRight"?1:d.key==="ArrowDown"||d.key==="ArrowLeft"?-1:0;g?(d.preventDefault(),c(a+g*e.step*m(d),!0)):d.key==="Enter"&&(d.preventDefault(),p())});function p(){s.classList.add("mt-editing"),i.value=W(e,a),i.focus(),i.select()}function k(d){s.classList.contains("mt-editing")&&(s.classList.remove("mt-editing"),d&&c(b(e,i.value,a),!0))}return i.addEventListener("keydown",d=>{d.stopPropagation(),d.key==="Enter"?(k(!0),s.focus()):d.key==="Escape"&&(k(!1),s.focus())}),i.addEventListener("blur",()=>k(!0)),i.addEventListener("pointerdown",d=>d.stopPropagation()),u(),{el:s,set(d){a=b(e,d),u()}}}function z(n){let e=l("button.mt-toggle",{type:"button",role:"switch","aria-label":n},l("span.mt-toggle-knob"));return{el:e,set(t,r=!1){e.setAttribute("aria-checked",r?"mixed":String(t))}}}function te(n,e){let t=null,r=()=>{t=null,window.removeEventListener("pointerup",r)};n.addEventListener("pointerdown",o=>{if(o.button!==0)return;let i=e(o.target);i&&(o.preventDefault(),t=!i.current,i.apply(t),window.addEventListener("pointerup",r))}),n.addEventListener("pointerover",o=>{if(t===null||!(o.buttons&1))return;let i=e(o.target);i&&i.current!==t&&i.apply(t)}),n.addEventListener("keydown",o=>{if(o.key!==" "&&o.key!=="Enter")return;let i=e(o.target);i&&(o.preventDefault(),i.apply(!i.current))})}var F=()=>Math.random().toString(36).slice(2,10);function ne(n){if(typeof n=="string")try{n=JSON.parse(n)}catch{return[]}let e=n?.rows;return Array.isArray(e)?e:[]}var y=n=>n!==null&&typeof n=="object"&&!Array.isArray(n);var oe=1,L={min:-10,max:10,step:.05,default:1,precision:2},ie=()=>({version:oe,rows:[]});function se(n,e={}){return{id:F(),on:!0,lora:n,strength:L.default,strengthClip:null,...e}}var re=(n,e)=>b(L,n,e);function Oe(n){return!y(n)||typeof n.lora!="string"?null:{id:typeof n.id=="string"&&n.id?n.id:F(),on:n.on!==!1,lora:n.lora.trim(),strength:re(n.strength),strengthClip:n.strengthClip==null?null:re(n.strengthClip)}}function ae(n){return{version:oe,rows:ne(n).map(Oe).filter(e=>e!==null)}}var le=n=>n.on&&n.lora!==""&&(n.strength!==0||(n.strengthClip??0)!==0);var x=J("loras","LoRA"),f={headerHeight:30,rowHeight:30,rowGap:4,emptyHeight:44,padding:6},N=class{constructor(e){this.events=e;for(let[t,r]of Object.entries(f))this.el.style.setProperty(`--ld-${t}`,`${r}px`);this.masterToggle.el.classList.add("ld-master"),this.el.append(l("div.ld-header",{},this.masterToggle.el,this.countEl,this.addBtn),this.rowsEl,this.emptyEl),v(this.el),this.addBtn.addEventListener("click",()=>this.pickNew(this.addBtn)),this.emptyEl.addEventListener("click",()=>this.pickNew(this.emptyEl)),this.masterToggle.el.addEventListener("click",()=>{let t=!this.value.rows.every(r=>r.on);this.mutate(()=>this.value.rows.forEach(r=>r.on=t))}),te(this.rowsEl,t=>{let r=this.rowFromEvent(t,".mt-toggle");return r&&{current:r.on,apply:o=>this.mutate(()=>r.on=o)}}),this.rowsEl.addEventListener("click",t=>this.onRowClick(t)),this.unsubscribe=x.onChanged(()=>this.render()),x.load(),this.render()}el=l("div.mt-root.ld-deck");value=ie();views=new Map;rowsEl=l("div.ld-rows",{role:"list"});masterToggle=z("Toggle all LoRAs");countEl=l("span.ld-count");addBtn=l("button.mt-btn.ld-add",{type:"button",title:"Add a LoRA"},"+ Add LoRA");emptyEl=l("button.ld-empty",{type:"button"},"No LoRAs yet \u2014 click to add one");unsubscribe;get data(){return this.value}setData(e){this.value=ae(e),this.render()}get minHeight(){let e=this.value.rows.length,t=e?e*f.rowHeight+(e-1)*f.rowGap:f.emptyHeight;return f.headerHeight+f.rowGap+t+f.padding*2}dispose(){this.unsubscribe()}mutate(e,t=!1){e(),this.render(),this.events.onChange(t)}findRow(e){return e?this.value.rows.find(t=>t.id===e):void 0}rowFromEvent(e,t){let r=e?.closest?.(t);return r?this.findRow(r.closest(".ld-row")?.dataset.id):void 0}pickNew(e){$({source:x,anchor:e,inUse:new Set(this.value.rows.map(t=>t.lora)),onPick:t=>this.mutate(()=>this.value.rows.push(se(t)),!0)})}onRowClick(e){let t=e.target,r=this.rowFromEvent(t,".ld-row");r&&(t.closest(".ld-remove")?this.mutate(()=>this.value.rows=this.value.rows.filter(o=>o!==r),!0):t.closest(".ld-name")&&$({source:x,anchor:this.views.get(r.id).name,current:r.lora,inUse:new Set(this.value.rows.map(o=>o.lora)),onPick:o=>this.mutate(()=>r.lora=o)}))}render(){let{rows:e}=this.value;X(this.rowsEl,this.views,e,r=>this.createRowView(r),(r,o)=>this.updateRowView(r,o));let t=e.filter(le).length;this.masterToggle.set(e.length>0&&t===e.length,t>0&&t<e.length),this.masterToggle.el.disabled=e.length===0,this.countEl.textContent=e.length?`${t} of ${e.length} active`:"",this.emptyEl.hidden=e.length>0,this.rowsEl.hidden=e.length===0}createRowView(e){let t=z("Enable LoRA"),r=l("button.ld-name",{type:"button"}),{id:o}=e,i=ee("Strength",L,(u,c)=>{let m=this.findRow(o);m&&(m.strength=u,c?this.mutate(()=>{}):this.render())}),s=l("button.mt-icon-btn.ld-remove",{type:"button",title:"Remove","aria-label":"Remove LoRA"},"\xD7");return{el:l("div.ld-row",{role:"listitem","data-id":e.id},t.el,r,i.el,s),toggle:t,name:r,scrubber:i}}updateRowView(e,t){let{name:r,folder:o}=C(t.lora),i=x.isMissing(t.lora);e.toggle.set(t.on),e.scrubber.set(t.strength),e.el.classList.toggle("ld-off",!t.on),e.el.classList.toggle("ld-missing",i),e.name.title=i?`Not found in models/loras: ${t.lora}`:t.lora||"Choose a LoRA",e.name.replaceChildren(l("span.ld-name-text",{},r||"Choose a LoRA\u2026"),o?l("span.ld-name-folder",{},o):"",i?l("span.ld-warn",{"aria-hidden":!0},"\u26A0"):"")}};var ce=`/* LoRA Deck layout. Shared controls and theme tokens live in shared/theme.css. */
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

`;var de="LORA_DECK",ue={styles:ce,widgets:{[de]:S(de,n=>new N(n),340)}};var me=`/* Source Switch. Shared controls and theme tokens live in shared/theme.css. */
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
  gap: 6px;
  height: var(--ss-rowHeight);
  flex: none;
  min-width: 0;
}
.ss-tabs,
.ss-channels {
  display: flex;
  gap: 4px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: thin;
}
.ss-caption {
  flex: none;
  color: var(--mt-muted);
}

/* ---- tabs --------------------------------------------------------------- */
.ss-tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  flex: none;
  height: 24px;
  padding: 0 10px;
  border-radius: var(--mt-radius);
  border: 1px solid var(--mt-border);
  background: var(--mt-bg);
  color: var(--mt-muted);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
.ss-tab:hover {
  color: var(--mt-fg);
  background: var(--mt-bg-hover);
}
.ss-tab.ss-active {
  color: var(--mt-fg);
  border-color: var(--mt-accent);
  background: color-mix(in srgb, var(--mt-accent) 22%, var(--mt-bg));
}
.ss-tab-remove {
  width: 0;
  overflow: hidden;
  color: var(--mt-muted) !important;
  line-height: 1;
  transition: width 120ms;
}
.ss-tab:hover .ss-tab-remove,
.ss-tab-remove:focus-visible {
  width: 12px;
}
.ss-tab-remove:hover {
  color: var(--mt-danger) !important;
}
.ss-tab-input {
  width: 90px;
  border: 0;
  padding: 0;
  font: inherit;
  color: var(--mt-fg);
  background: transparent;
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
.ss-add:disabled {
  opacity: 0.35;
  cursor: default;
}

/* ---- output channel chips -------------------------------------------------- */
.ss-chip {
  display: flex;
  align-items: center;
  flex: none;
  height: 22px;
  padding: 0 4px 0 8px;
  border-radius: 11px;
  background: var(--mt-bg);
  border: 1px solid var(--mt-border);
}
.ss-chip:focus-within {
  border-color: var(--mt-accent);
}
.ss-chip-input {
  width: 7ch;
  border: 0;
  padding: 0;
  font: inherit;
  color: var(--mt-fg);
  background: transparent;
  outline: none;
}
.ss-chip-input::placeholder {
  color: var(--mt-muted);
}
.ss-chip-remove {
  width: 16px;
  color: var(--mt-muted) !important;
  line-height: 1;
}
.ss-chip-remove:hover {
  color: var(--mt-danger) !important;
}
`;var he=1,ge=12,R=8,_=(n,e)=>`s${n}_c${e}`,w=/^s(\d+)_c(\d+)$/;function M(){return{version:he,sources:[{slot:0,name:"A"},{slot:1,name:"B"}],channels:[{slot:0,name:""}],active:0,mode:"fixed"}}function pe(n,e){if(!Array.isArray(n))return[];let t=new Set,r=[];for(let o of n){if(!y(o)||!Number.isInteger(o.slot))continue;let i=o.slot;i<0||i>=e||t.has(i)||(t.add(i),r.push({slot:i,name:typeof o.name=="string"?o.name.trim():""}))}return r}function fe(n){if(typeof n=="string")try{n=JSON.parse(n)}catch{return M()}if(!y(n))return M();let e=pe(n.sources,ge),t=pe(n.channels,R).map((o,i)=>({...o,slot:i})),r=e.some(o=>o.slot===n.active)?n.active:e[0]?.slot??null;return{version:he,sources:e,channels:t.length?t:[{slot:0,name:""}],active:r,mode:n.mode==="cycle"?"cycle":"fixed"}}function B(n){let e=new Set(n.sources.map(t=>t.slot));for(let t=0;t<ge;t++)if(!e.has(t))return t;return null}function ve(n){if(!n.sources.length)return null;let e=n.sources.findIndex(t=>t.slot===n.active);return n.sources[(e+1)%n.sources.length].slot}var be=n=>n.sources.flatMap(e=>n.channels.map(t=>_(e.slot,t.slot))),T=n=>n.name||`#${n.slot+1}`;var h="*",A=n=>w.test(n),$e=n=>Number(w.exec(n)[2]);function We(n){return n.inputs.filter(e=>A(e.name)).map(e=>e.name)}function K(n,e){let t=e.channels.map(()=>h);return n.inputs.forEach((r,o)=>{if(!A(r.name))return;let i=n.getInputLink(o),s=$e(r.name);i&&s<t.length&&t[s]===h&&i.type&&i.type!==h&&(t[s]=i.type)}),t}function ze(n){let e=new Map;for(let t=n.inputs.length-1;t>=0;t--){let{name:r}=n.inputs[t];if(!A(r))continue;let o=n.getInputLink(t);o&&e.set(r,{originId:o.origin_id,originSlot:o.origin_slot}),n.removeInput(t)}return e}function Fe(n,e){for(let[t,{originId:r,originSlot:o}]of e){let i=n.graph?.getNodeById(r),s=n.inputs.findIndex(a=>a.name===t);i&&s>=0&&i.connect(o,n,s)}}function ye(n,e){let t=be(e),r=new Set(t);for(let i=n.inputs.length-1;i>=0;i--){let{name:s}=n.inputs[i];A(s)&&!r.has(s)&&n.removeInput(i)}let o=We(n);if(o.every((i,s)=>t[s]===i))for(let i of t.slice(o.length))n.addInput(i,h);else{let i=ze(n);for(let s of t)n.addInput(s,h);Fe(n,i)}for(;n.outputs.length>e.channels.length;)n.removeOutput(n.outputs.length-1);for(;n.outputs.length<e.channels.length;)n.addOutput(`out${n.outputs.length}`,h);H(n,e)}function H(n,e){let t=K(n,e),r=i=>e.channels[i]?.name||(t[i]!==h?t[i]:`out ${i+1}`),o=new Map(e.sources.map(i=>[i.slot,T(i)]));for(let i of n.inputs){let s=w.exec(i.name);if(!s)continue;let a=Number(s[2]);i.label=`${o.get(Number(s[1]))??"?"} \xB7 ${r(a)}`,i.type=t[a]??h}n.outputs.forEach((i,s)=>{i.label=r(s),i.type=t[s]??h}),n.setDirtyCanvas(!0,!0)}function xe(n,e){e<n.outputs.length&&n.removeOutput(e);for(let t=n.inputs.length-1;t>=0;t--){let r=w.exec(n.inputs[t].name);if(!r)continue;let o=Number(r[2]);o===e?n.removeInput(t):o>e&&(n.inputs[t].name=_(Number(r[1]),o-1))}}var D={rowHeight:26,gap:6,padding:6},V=class{constructor(e,t){this.events=e;this.node=t;for(let[o,i]of Object.entries(D))this.el.style.setProperty(`--ss-${o}`,`${i}px`);this.el.append(l("div.ss-row",{},this.tabsEl,this.addSourceBtn,this.modeBtn),l("div.ss-row",{},l("span.ss-caption",{},"Outputs"),this.channelsEl,this.addChannelBtn)),v(this.el),this.tabsEl.addEventListener("click",o=>this.onTabClick(o)),this.tabsEl.addEventListener("dblclick",o=>this.renameSource(o)),this.tabsEl.addEventListener("keydown",o=>this.onTabKey(o)),this.addSourceBtn.addEventListener("click",()=>this.addSource()),this.modeBtn.addEventListener("click",()=>this.update(()=>this.value.mode=this.value.mode==="cycle"?"fixed":"cycle")),this.channelsEl.addEventListener("click",o=>this.onChannelClick(o)),this.channelsEl.addEventListener("change",o=>this.onChannelRename(o)),this.addChannelBtn.addEventListener("click",()=>this.addChannel());let r=t.onConnectionsChange;t.onConnectionsChange=(...o)=>{r?.apply(t,o),H(t,this.value),this.render()},this.render(),this.scheduleSync()}el=l("div.mt-root.ss-switch");value=M();tabsEl=l("div.ss-tabs",{role:"tablist","aria-label":"Sources"});addSourceBtn=l("button.mt-icon-btn.ss-add",{type:"button",title:"Add source"},"+");modeBtn=l("button.mt-btn.ss-mode",{type:"button",title:"Cycle: switch to the next source after each queued run"},"\u27F3 Cycle");channelsEl=l("div.ss-channels");addChannelBtn=l("button.mt-icon-btn.ss-add",{type:"button",title:"Add output"},"+");syncQueued=!1;get data(){return this.value}get minHeight(){return D.rowHeight*2+D.gap+D.padding*2}setData(e){this.value=fe(e),this.render(),this.scheduleSync()}afterQueued(){if(this.value.mode!=="cycle")return;let e=ve(this.value);e!==null&&this.update(()=>this.value.active=e)}dispose(){}update(e,t=!1){e(),this.render(),t?this.scheduleSync():H(this.node,this.value),this.events.onChange(!1)}scheduleSync(){this.syncQueued||(this.syncQueued=!0,requestAnimationFrame(()=>{this.syncQueued=!1,ye(this.node,this.value),this.render(),this.events.onChange(!0)}))}addSource(){let e=B(this.value);e!==null&&this.update(()=>this.value.sources.push({slot:e,name:String.fromCharCode(65+this.value.sources.length)}),!0)}addChannel(){let{channels:e}=this.value;e.length>=R||this.update(()=>e.push({slot:e.length,name:""}),!0)}onTabClick(e){let t=e.target.closest("[data-slot]");if(!t)return;let r=Number(t.dataset.slot);e.target.closest(".ss-tab-remove")?this.update(()=>{let o=this.value.sources.filter(i=>i.slot!==r);this.value.sources=o,this.value.active===r&&(this.value.active=o[0]?.slot??null)},!0):this.update(()=>this.value.active=r)}onTabKey(e){let t=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0;if(!t)return;e.preventDefault();let{sources:r}=this.value,o=r.findIndex(s=>s.slot===this.value.active),i=r[(o+t+r.length)%r.length];i&&(this.update(()=>this.value.active=i.slot),this.tabsEl.querySelector(`[data-slot="${i.slot}"]`)?.focus())}renameSource(e){let t=e.target.closest("[data-slot]"),r=this.value.sources.find(s=>s.slot===Number(t?.dataset.slot));if(!t||!r)return;let o=l("input.ss-tab-input",{type:"text",value:r.name,"aria-label":"Source name"}),i=s=>{o.isConnected&&(o.remove(),s?this.update(()=>r.name=o.value.trim()):this.render())};o.addEventListener("keydown",s=>{s.stopPropagation(),s.key==="Enter"?i(!0):s.key==="Escape"&&i(!1)}),o.addEventListener("blur",()=>i(!0)),t.replaceChildren(o),o.focus(),o.select()}onChannelClick(e){let t=e.target.closest(".ss-chip-remove");if(!t)return;let r=Number(t.dataset.channel);xe(this.node,r),this.update(()=>{this.value.channels=this.value.channels.filter((o,i)=>i!==r).map((o,i)=>({...o,slot:i}))},!0)}onChannelRename(e){let t=e.target,r=this.value.channels[Number(t.dataset.channel)];r&&this.update(()=>r.name=t.value.trim())}render(){let{sources:e,channels:t,active:r,mode:o}=this.value;this.tabsEl.replaceChildren(...e.map(a=>l(`div.ss-tab${a.slot===r?".ss-active":""}`,{role:"tab",tabindex:a.slot===r?0:-1,"aria-selected":a.slot===r,"data-slot":a.slot,title:"Click to activate \xB7 double-click to rename"},l("span.ss-tab-label",{},T(a)),e.length>1?l("button.ss-tab-remove",{type:"button",title:"Remove source","aria-label":"Remove source"},"\xD7"):null))),this.addSourceBtn.disabled=B(this.value)===null,this.modeBtn.setAttribute("aria-pressed",String(o==="cycle"));let i=K(this.node,this.value);(!this.channelsEl.contains(document.activeElement)||this.channelsEl.children.length!==t.length)&&this.channelsEl.replaceChildren(...t.map((a,u)=>l("span.ss-chip",{},l("input.ss-chip-input",{type:"text",value:a.name,placeholder:i[u]!=="*"?i[u]:`out ${u+1}`,"data-channel":u,"aria-label":`Output ${u+1} name`,size:6}),t.length>1?l("button.ss-chip-remove",{type:"button","data-channel":u,title:"Remove output","aria-label":"Remove output"},"\xD7"):null))),this.addChannelBtn.disabled=t.length>=R}};var we="MARTI_SOURCE_SWITCH",ke={styles:me,widgets:{[we]:S(we,(n,e)=>new V(n,e),300)}};var Ee=`/* Shared theme tokens and controls. Colors come from ComfyUI theme variables so every palette works. */
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
`;var Se=[ue,ke];function Be(){let n="comfyui-marti-styles";if(document.getElementById(n))return;let e=document.createElement("style");e.id=n,e.textContent=[Ee,...Se.map(t=>t.styles??"")].join(`
`),document.head.append(e)}Q.registerExtension({name:"comfyui-marti",setup:Be,getCustomWidgets:()=>Object.assign({},...Se.map(n=>n.widgets??{}))});
