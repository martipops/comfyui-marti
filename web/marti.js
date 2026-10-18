function V(n,e,t){return(r,i)=>{let s=()=>r.setSize([r.size[0],r.computeSize()[1]]),o=e({onChange(l){l&&s(),r.setDirtyCanvas(!0,!0)}},r),a=r.addDOMWidget(i,n,o.el,{getValue:()=>o.data,setValue:l=>o.setData(l),getMinHeight:()=>o.minHeight,hideOnZoom:!0,margin:4}),m=r.onRemoved;return r.onRemoved=function(){o.dispose(),m?.call(this)},requestAnimationFrame(s),{widget:a,minWidth:t}}}function c(n,e={},...t){let[r,...i]=n.split("."),s=document.createElement(r);i.length&&(s.className=i.join(" "));for(let[o,a]of Object.entries(e))a===!1||a==null||s.setAttribute(o,a===!0?"":String(a));for(let o of t)o&&s.append(o);return s}function w(n,e=["pointerdown","wheel","keydown","contextmenu"]){for(let t of e)n.addEventListener(t,r=>r.stopPropagation())}function P(n,e,t,r,i){let s=new Set(t.map(m=>m.id));for(let m of e.keys())s.has(m)||e.delete(m);let o=t.map(m=>{let l=e.get(m.id);return l||e.set(m.id,l=r(m)),i(l,m),l.el}),a=n.children;(a.length!==o.length||o.some((m,l)=>a[l]!==m))&&n.replaceChildren(...o)}import{app as oe}from"../../scripts/app.js";import{api as ie}from"../../scripts/api.js";var O=oe,W=ie;var z=new Map;function se(n,e){let t=[],r=new Set,i=null,s=!1,o=new Set;async function a(){let l=await W.fetchApi(`/models/${encodeURIComponent(n)}`);if(!l.ok)throw new Error(`Failed to list models/${n} (${l.status})`);let u=await l.json();return Array.isArray(u)?u.filter(p=>typeof p=="string"):[]}function m(l=!1){return i&&!l||(i=a().then(u=>(t=u,r=new Set(u),s=!0,o.forEach(p=>p(t)),t)).catch(u=>(i=null,console.error("[comfyui-marti]",u),t))),i}return{noun:e,emptyText:`No ${e}s found in models/${n}`,list:()=>t,load:m,isMissing:l=>s&&l!==""&&!r.has(l),onChanged(l){return o.add(l),()=>o.delete(l)}}}function F(n,e){let t=z.get(n);return t||z.set(n,t=se(n,e)),t}function y(n){let e=n.replace(/\\/g,"/"),t=e.lastIndexOf("/");return{name:e.slice(t+1).replace(/\.(safetensors|ckpt|pt|pth|bin)$/i,""),folder:t>=0?e.slice(0,t):""}}function $(n,e){if(!n)return 0;let t=n.toLowerCase(),r=e.toLowerCase(),i=r.lastIndexOf("/")+1,s=r.indexOf(t,i);if(s>=0)return 1e3-(s-i)-r.length*.01;let o=r.indexOf(t);if(o>=0)return 500-o-r.length*.01;let a=0,m=0,l=0;for(let u of t){let p=r.indexOf(u,m);if(p<0)return-1;l=p===m?l+1:0,a+=1+l*2+(p>=i?1:0),m=p+1}return a}var ae=200,S=class{root=c("div.mt-picker",{role:"dialog"});search=c("input.mt-picker-search",{type:"search",spellcheck:!1,autocomplete:"off",role:"combobox","aria-expanded":!0,"aria-controls":"mt-picker-list"});refresh=c("button.mt-icon-btn",{type:"button",title:"Rescan"},"\u27F3");list=c("ul.mt-picker-list",{id:"mt-picker-list",role:"listbox"});status=c("div.mt-picker-status");options=null;results=[];active=0;constructor(){this.root.append(c("div.mt-picker-head",{},this.search,this.refresh),this.list,this.status),w(this.root),this.search.addEventListener("input",()=>this.filter()),this.search.addEventListener("keydown",e=>this.onKey(e)),this.refresh.addEventListener("click",async()=>{this.setStatus("Rescanning\u2026"),await this.options?.source.load(!0),this.filter()}),this.list.addEventListener("pointerdown",e=>e.preventDefault()),this.list.addEventListener("click",e=>{let t=e.target.closest("[data-index]");t&&this.choose(Number(t.dataset.index))}),this.list.addEventListener("pointermove",e=>{let t=e.target.closest("[data-index]");t&&this.highlight(Number(t.dataset.index),!1)})}open(e){this.options=e;let{noun:t}=e.source;this.root.setAttribute("aria-label",`Choose ${t}`),this.search.placeholder=`Search ${t}s\u2026`,this.root.isConnected||document.body.append(this.root),this.root.hidden=!1,this.search.value="",this.position(e.anchor),this.filter(),this.search.focus(),document.addEventListener("pointerdown",this.onOutside,!0),window.addEventListener("blur",this.close),e.source.list().length||(this.setStatus("Loading\u2026"),e.source.load().then(()=>this.options===e&&this.filter()))}close=()=>{this.options&&(this.options=null,this.root.hidden=!0,document.removeEventListener("pointerdown",this.onOutside,!0),window.removeEventListener("blur",this.close))};onOutside=e=>{this.root.contains(e.target)||this.close()};position(e){let t=e.getBoundingClientRect(),r=Math.max(t.width,320),i=360,s=window.innerHeight-t.bottom,o=s>=i||s>=t.top?t.bottom+4:Math.max(8,t.top-i-4),a=Math.min(Math.max(8,t.left),window.innerWidth-r-8);Object.assign(this.root.style,{top:`${o}px`,left:`${a}px`,width:`${r}px`,maxHeight:`${i}px`})}filter(){let e=this.search.value.trim();if(!this.options)return;let t=this.options.source.list(),r=e?t.map(o=>[o,$(e,o)]).filter(([,o])=>o>=0).sort((o,a)=>a[1]-o[1]).map(([o])=>o):t;this.results=r.slice(0,ae),this.render();let i=this.options?.current?this.results.indexOf(this.options.current):-1;this.highlight(i>=0&&!e?i:0,!0);let s=r.length-this.results.length;this.setStatus(t.length?this.results.length?s>0?`${s} more \u2014 refine your search`:"":"No matches":this.options.source.emptyText)}render(){let{current:e,inUse:t}=this.options??{};this.list.replaceChildren(...this.results.map((r,i)=>{let{name:s,folder:o}=y(r);return c(`li.mt-picker-item${r===e?".mt-current":""}`,{role:"option","data-index":i,title:r},c("span.mt-picker-name",{},s),o?c("span.mt-picker-folder",{},o):null,t?.has(r)?c("span.mt-picker-badge",{title:"Already in this deck"},"in deck"):null)}))}highlight(e,t){if(!this.results.length)return;this.active=(e+this.results.length)%this.results.length,this.list.querySelector(".mt-active")?.classList.remove("mt-active");let r=this.list.children[this.active];r?.classList.add("mt-active"),r&&this.search.setAttribute("aria-activedescendant",r.id=`mt-opt-${this.active}`),t&&r?.scrollIntoView({block:"nearest"})}choose(e){let t=this.results[e],r=this.options;!t||!r||(this.close(),r.onPick(t))}onKey(e){let t={ArrowDown:1,ArrowUp:-1,PageDown:8,PageUp:-8};if(e.key in t)e.preventDefault(),this.highlight(this.active+t[e.key],!0);else if(e.key==="Enter")e.preventDefault(),this.choose(this.active);else if(e.key==="Escape"){e.preventDefault();let r=this.options?.anchor;this.close(),r?.focus()}}setStatus(e){this.status.textContent=e,this.status.hidden=!e}},le=null,C=n=>(le??=new S).open(n);function f(n,e,t=n.default){let r=typeof e=="number"?e:Number.parseFloat(String(e));if(!Number.isFinite(r))return t;let i=Number(r.toFixed(n.precision+1));return Math.min(n.max,Math.max(n.min,i))}var M=(n,e)=>e.toFixed(n.precision);var de=3,ce=.01,me=2;function K(n,e,t){let r=c("span.mt-scrub-fill"),i=c("span.mt-scrub-text"),s=c("input.mt-scrub-input",{type:"text",inputmode:"decimal","aria-label":n}),o=c("div.mt-scrub",{tabindex:0,role:"spinbutton","aria-label":n,"aria-valuemin":e.min,"aria-valuemax":e.max},r,i,s),a=e.default,m=()=>{i.textContent=M(e,a),o.setAttribute("aria-valuenow",String(a));let d=Math.min(1,Math.abs(a)/me)*100;r.style.width=`${d}%`,o.classList.toggle("mt-negative",a<0),o.classList.toggle("mt-zero",a===0)},l=(d,g)=>{d=f(e,d,a),!(d===a&&!g)&&(a=d,m(),t(a,g))},u=d=>d.shiftKey?.1:d.ctrlKey||d.metaKey?10:1;o.addEventListener("pointerdown",d=>{if(d.button!==0||o.classList.contains("mt-editing"))return;d.preventDefault();let g=d.clientX,re=a,L=!1;o.setPointerCapture(d.pointerId);let H=R=>{let N=R.clientX-g;if(!L&&Math.abs(N)<de)return;L=!0,o.classList.add("mt-scrubbing");let ne=re+N*ce*u(R),A=R.shiftKey?e.step/5:e.step;l(Math.round(ne/A)*A,!1)},x=()=>{o.removeEventListener("pointermove",H),o.removeEventListener("pointerup",x),o.removeEventListener("pointercancel",x),o.classList.remove("mt-scrubbing"),L?l(a,!0):p()};o.addEventListener("pointermove",H),o.addEventListener("pointerup",x),o.addEventListener("pointercancel",x)}),o.addEventListener("dblclick",()=>{v(!1),l(e.default,!0)}),o.addEventListener("keydown",d=>{if(o.classList.contains("mt-editing"))return;let g=d.key==="ArrowUp"||d.key==="ArrowRight"?1:d.key==="ArrowDown"||d.key==="ArrowLeft"?-1:0;g?(d.preventDefault(),l(a+g*e.step*u(d),!0)):d.key==="Enter"&&(d.preventDefault(),p())});function p(){o.classList.add("mt-editing"),s.value=M(e,a),s.focus(),s.select()}function v(d){o.classList.contains("mt-editing")&&(o.classList.remove("mt-editing"),d&&l(f(e,s.value,a),!0))}return s.addEventListener("keydown",d=>{d.stopPropagation(),d.key==="Enter"?(v(!0),o.focus()):d.key==="Escape"&&(v(!1),o.focus())}),s.addEventListener("blur",()=>v(!0)),s.addEventListener("pointerdown",d=>d.stopPropagation()),m(),{el:o,set(d){a=f(e,d),m()}}}function T(n){let e=c("button.mt-toggle",{type:"button",role:"switch","aria-label":n},c("span.mt-toggle-knob"));return{el:e,set(t,r=!1){e.setAttribute("aria-checked",r?"mixed":String(t))}}}function I(n,e){let t=null,r=()=>{t=null,window.removeEventListener("pointerup",r)};n.addEventListener("pointerdown",i=>{if(i.button!==0)return;let s=e(i.target);s&&(i.preventDefault(),t=!s.current,s.apply(t),window.addEventListener("pointerup",r))}),n.addEventListener("pointerover",i=>{if(t===null||!(i.buttons&1))return;let s=e(i.target);s&&s.current!==t&&s.apply(t)}),n.addEventListener("keydown",i=>{if(i.key!==" "&&i.key!=="Enter")return;let s=e(i.target);s&&(i.preventDefault(),s.apply(!s.current))})}var D=()=>Math.random().toString(36).slice(2,10);function U(n){if(typeof n=="string")try{n=JSON.parse(n)}catch{return[]}let e=n?.rows;return Array.isArray(e)?e:[]}var j=n=>n!==null&&typeof n=="object"&&!Array.isArray(n);var _=1,k={min:-10,max:10,step:.05,default:1,precision:2},B=()=>({version:_,rows:[]});function X(n,e={}){return{id:D(),on:!0,lora:n,strength:k.default,strengthClip:null,...e}}var G=(n,e)=>f(k,n,e);function ue(n){return!j(n)||typeof n.lora!="string"?null:{id:typeof n.id=="string"&&n.id?n.id:D(),on:n.on!==!1,lora:n.lora.trim(),strength:G(n.strength),strengthClip:n.strengthClip==null?null:G(n.strengthClip)}}function q(n){return{version:_,rows:U(n).map(ue).filter(e=>e!==null)}}var Y=n=>n.on&&n.lora!==""&&(n.strength!==0||(n.strengthClip??0)!==0);var b=F("loras","LoRA"),h={headerHeight:30,rowHeight:30,rowGap:4,emptyHeight:44,padding:6},E=class{constructor(e){this.events=e;for(let[t,r]of Object.entries(h))this.el.style.setProperty(`--ld-${t}`,`${r}px`);this.masterToggle.el.classList.add("ld-master"),this.el.append(c("div.ld-header",{},this.masterToggle.el,this.countEl,this.addBtn),this.rowsEl,this.emptyEl),w(this.el),this.addBtn.addEventListener("click",()=>this.pickNew(this.addBtn)),this.emptyEl.addEventListener("click",()=>this.pickNew(this.emptyEl)),this.masterToggle.el.addEventListener("click",()=>{let t=!this.value.rows.every(r=>r.on);this.mutate(()=>this.value.rows.forEach(r=>r.on=t))}),I(this.rowsEl,t=>{let r=this.rowFromEvent(t,".mt-toggle");return r&&{current:r.on,apply:i=>this.mutate(()=>r.on=i)}}),this.rowsEl.addEventListener("click",t=>this.onRowClick(t)),this.unsubscribe=b.onChanged(()=>this.render()),b.load(),this.render()}el=c("div.mt-root.ld-deck");value=B();views=new Map;rowsEl=c("div.ld-rows",{role:"list"});masterToggle=T("Toggle all LoRAs");countEl=c("span.ld-count");addBtn=c("button.mt-btn.ld-add",{type:"button",title:"Add a LoRA"},"+ Add LoRA");emptyEl=c("button.ld-empty",{type:"button"},"No LoRAs yet \u2014 click to add one");unsubscribe;get data(){return this.value}setData(e){this.value=q(e),this.render()}get minHeight(){let e=this.value.rows.length,t=e?e*h.rowHeight+(e-1)*h.rowGap:h.emptyHeight;return h.headerHeight+h.rowGap+t+h.padding*2}dispose(){this.unsubscribe()}mutate(e,t=!1){e(),this.render(),this.events.onChange(t)}findRow(e){return e?this.value.rows.find(t=>t.id===e):void 0}rowFromEvent(e,t){let r=e?.closest?.(t);return r?this.findRow(r.closest(".ld-row")?.dataset.id):void 0}pickNew(e){C({source:b,anchor:e,inUse:new Set(this.value.rows.map(t=>t.lora)),onPick:t=>this.mutate(()=>this.value.rows.push(X(t)),!0)})}onRowClick(e){let t=e.target,r=this.rowFromEvent(t,".ld-row");r&&(t.closest(".ld-remove")?this.mutate(()=>this.value.rows=this.value.rows.filter(i=>i!==r),!0):t.closest(".ld-name")&&C({source:b,anchor:this.views.get(r.id).name,current:r.lora,inUse:new Set(this.value.rows.map(i=>i.lora)),onPick:i=>this.mutate(()=>r.lora=i)}))}render(){let{rows:e}=this.value;P(this.rowsEl,this.views,e,r=>this.createRowView(r),(r,i)=>this.updateRowView(r,i));let t=e.filter(Y).length;this.masterToggle.set(e.length>0&&t===e.length,t>0&&t<e.length),this.masterToggle.el.disabled=e.length===0,this.countEl.textContent=e.length?`${t} of ${e.length} active`:"",this.emptyEl.hidden=e.length>0,this.rowsEl.hidden=e.length===0}createRowView(e){let t=T("Enable LoRA"),r=c("button.ld-name",{type:"button"}),{id:i}=e,s=K("Strength",k,(m,l)=>{let u=this.findRow(i);u&&(u.strength=m,l?this.mutate(()=>{}):this.render())}),o=c("button.mt-icon-btn.ld-remove",{type:"button",title:"Remove","aria-label":"Remove LoRA"},"\xD7");return{el:c("div.ld-row",{role:"listitem","data-id":e.id},t.el,r,s.el,o),toggle:t,name:r,scrubber:s}}updateRowView(e,t){let{name:r,folder:i}=y(t.lora),s=b.isMissing(t.lora);e.toggle.set(t.on),e.scrubber.set(t.strength),e.el.classList.toggle("ld-off",!t.on),e.el.classList.toggle("ld-missing",s),e.name.title=s?`Not found in models/loras: ${t.lora}`:t.lora||"Choose a LoRA",e.name.replaceChildren(c("span.ld-name-text",{},r||"Choose a LoRA\u2026"),i?c("span.ld-name-folder",{},i):"",s?c("span.ld-warn",{"aria-hidden":!0},"\u26A0"):"")}};var Z=`/* LoRA Deck layout. Shared controls and theme tokens live in shared/theme.css. */
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

`;var J="LORA_DECK",Q={styles:Z,widgets:{[J]:V(J,n=>new E(n),340)}};var ee=`/* Shared theme tokens and controls. Colors come from ComfyUI theme variables so every palette works. */
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
`;var te=[Q];function he(){let n="comfyui-marti-styles";if(document.getElementById(n))return;let e=document.createElement("style");e.id=n,e.textContent=[ee,...te.map(t=>t.styles??"")].join(`
`),document.head.append(e)}O.registerExtension({name:"comfyui-marti",setup:he,getCustomWidgets:()=>Object.assign({},...te.map(n=>n.widgets??{}))});
