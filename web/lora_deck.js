import{app as ee}from"../../scripts/app.js";import{api as te}from"../../scripts/api.js";var z=ee,$=te;var I=`/* LoRA Deck. Colors come from ComfyUI's theme variables so light/dark/custom palettes just work. */
.ld-deck,
.ld-picker {
  --ld-bg: var(--comfy-input-bg, #222);
  --ld-bg-hover: color-mix(in srgb, var(--ld-fg) 8%, var(--ld-bg));
  --ld-fg: var(--input-text, #ddd);
  --ld-muted: var(--descrip-text, #999);
  --ld-border: var(--border-color, #444);
  --ld-accent: var(--p-primary-color, #4f8cff);
  --ld-danger: var(--error-text, #ff6b6b);
  --ld-radius: 6px;
  font: 12px/1.3 system-ui, sans-serif;
  color: var(--ld-fg);
  box-sizing: border-box;
}
.ld-deck *,
.ld-picker * {
  box-sizing: border-box;
}
.ld-deck button,
.ld-picker button {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
}
.ld-deck :focus-visible,
.ld-picker :focus-visible {
  outline: 2px solid var(--ld-accent);
  outline-offset: 1px;
}

/* ---- layout ---------------------------------------------------------- */
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
  color: var(--ld-muted);
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
  border-radius: var(--ld-radius);
  background: var(--ld-bg);
  border: 1px solid transparent;
  transition: opacity 120ms, border-color 120ms;
}
.ld-row:hover {
  border-color: var(--ld-border);
}
.ld-row.ld-off .ld-name,
.ld-row.ld-off .ld-scrub {
  opacity: 0.45;
}
.ld-row.ld-missing {
  border-color: color-mix(in srgb, var(--ld-danger) 55%, transparent);
}

/* ---- buttons ----------------------------------------------------------- */
.ld-btn {
  height: 24px;
  padding: 0 10px !important;
  border-radius: var(--ld-radius);
  background: var(--ld-bg) !important;
  border: 1px solid var(--ld-border) !important;
}
.ld-btn:hover {
  background: var(--ld-bg-hover) !important;
}
.ld-icon-btn {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  color: var(--ld-muted) !important;
  font-size: 15px !important;
  line-height: 1;
}
.ld-icon-btn:hover {
  background: var(--ld-bg-hover) !important;
  color: var(--ld-fg) !important;
}
.ld-remove {
  opacity: 0;
}
.ld-row:hover .ld-remove,
.ld-remove:focus-visible {
  opacity: 1;
}
.ld-remove:hover {
  color: var(--ld-danger) !important;
}
.ld-empty {
  height: var(--ld-emptyHeight);
  border: 1px dashed var(--ld-border) !important;
  border-radius: var(--ld-radius);
  color: var(--ld-muted) !important;
}
.ld-empty:hover {
  color: var(--ld-fg) !important;
  border-color: var(--ld-accent) !important;
}

/* ---- toggle switch ----------------------------------------------------- */
.ld-toggle {
  position: relative;
  width: 28px;
  height: 16px;
  flex: none;
  border-radius: 8px;
  background: var(--ld-border) !important;
  transition: background 120ms;
  touch-action: none;
}
.ld-toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  transition: transform 120ms;
}
.ld-toggle[aria-checked="true"] {
  background: var(--ld-accent) !important;
}
.ld-toggle[aria-checked="true"] .ld-toggle-knob {
  transform: translateX(12px);
}
.ld-toggle[aria-checked="mixed"] {
  background: color-mix(in srgb, var(--ld-accent) 50%, var(--ld-border)) !important;
}
.ld-toggle[aria-checked="mixed"] .ld-toggle-knob {
  transform: translateX(6px);
}
.ld-toggle:disabled {
  opacity: 0.4;
  cursor: default;
}

/* ---- name -------------------------------------------------------------- */
.ld-name {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
  height: 100%;
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
  color: var(--ld-muted);
  font-size: 11px;
}
.ld-name:hover .ld-name-text {
  text-decoration: underline;
  text-underline-offset: 2px;
}
.ld-warn {
  color: var(--ld-danger);
}

/* ---- strength scrubber -------------------------------------------------- */
.ld-scrub {
  position: relative;
  height: 22px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--ld-fg) 6%, transparent);
  cursor: ew-resize;
  overflow: hidden;
  touch-action: none;
  user-select: none;
}
.ld-scrub:hover,
.ld-scrub.ld-scrubbing {
  background: color-mix(in srgb, var(--ld-fg) 12%, transparent);
}
.ld-scrub-fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: color-mix(in srgb, var(--ld-accent) 35%, transparent);
  pointer-events: none;
}
.ld-scrub.ld-negative .ld-scrub-fill {
  background: color-mix(in srgb, var(--ld-danger) 35%, transparent);
}
.ld-scrub-text,
.ld-scrub-input {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-variant-numeric: tabular-nums;
}
.ld-scrub.ld-zero .ld-scrub-text {
  color: var(--ld-muted);
}
.ld-scrub-input {
  display: none;
  width: 100%;
  border: 0;
  padding: 0;
  text-align: center;
  font: inherit;
  color: inherit;
  background: var(--ld-bg);
  outline: none;
}
.ld-scrub.ld-editing {
  cursor: text;
}
.ld-scrub.ld-editing .ld-scrub-input {
  display: block;
}
.ld-scrub.ld-editing .ld-scrub-text,
.ld-scrub.ld-editing .ld-scrub-fill {
  visibility: hidden;
}

/* ---- picker popover ------------------------------------------------------ */
.ld-picker {
  position: fixed;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  background: var(--comfy-menu-bg, #1e1e1e);
  border: 1px solid var(--ld-border);
  border-radius: 8px;
  box-shadow: 0 8px 28px rgb(0 0 0 / 0.45);
  overflow: hidden;
}
.ld-picker[hidden] {
  display: none;
}
.ld-picker-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-bottom: 1px solid var(--ld-border);
}
.ld-picker-search {
  flex: 1;
  height: 28px;
  padding: 0 8px;
  border-radius: var(--ld-radius);
  border: 1px solid var(--ld-border);
  background: var(--ld-bg);
  color: var(--ld-fg);
  font: inherit;
  outline: none;
}
.ld-picker-search:focus {
  border-color: var(--ld-accent);
}
.ld-picker-list {
  list-style: none;
  margin: 0;
  padding: 4px;
  overflow-y: auto;
}
.ld-picker-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.ld-picker-item.ld-active {
  background: color-mix(in srgb, var(--ld-accent) 22%, transparent);
}
.ld-picker-item.ld-current .ld-picker-name {
  font-weight: 600;
}
.ld-picker-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ld-picker-folder,
.ld-picker-badge {
  flex: none;
  color: var(--ld-muted);
  font-size: 11px;
}
.ld-picker-badge {
  padding: 0 6px;
  border-radius: 8px;
  border: 1px solid var(--ld-border);
}
.ld-picker-status {
  padding: 8px 12px;
  color: var(--ld-muted);
  border-top: 1px solid var(--ld-border);
}
.ld-picker-status[hidden] {
  display: none;
}
`;var x=[],K=new Set,v=null,W=!1,S=new Set;async function ne(){let n=await $.fetchApi("/models/loras");if(!n.ok)throw new Error(`Failed to list LoRAs (${n.status})`);let e=await n.json();return Array.isArray(e)?e.filter(t=>typeof t=="string"):[]}function w(n=!1){return v&&!n||(v=ne().then(e=>(x=e,K=new Set(e),W=!0,S.forEach(t=>t(x)),x)).catch(e=>(v=null,console.error("[LoRA Deck]",e),x))),v}var A=()=>x,F=n=>W&&n!==""&&!K.has(n);function _(n){return S.add(n),()=>S.delete(n)}var c={min:-10,max:10,step:.05,default:1,precision:2},k=()=>({version:1,rows:[]}),U=()=>Math.random().toString(36).slice(2,10);function G(n,e={}){return{id:U(),on:!0,lora:n,strength:c.default,strengthClip:null,...e}}function b(n,e=c.default){let t=typeof n=="number"?n:Number.parseFloat(String(n));if(!Number.isFinite(t))return e;let r=Number(t.toFixed(c.precision+1));return Math.min(c.max,Math.max(c.min,r))}var T=n=>n.toFixed(c.precision);function oe(n){if(!n||typeof n!="object")return null;let e=n;return typeof e.lora!="string"?null:{id:typeof e.id=="string"&&e.id?e.id:U(),on:e.on!==!1,lora:e.lora.trim(),strength:b(e.strength),strengthClip:e.strengthClip==null?null:b(e.strengthClip)}}function j(n){if(typeof n=="string")try{n=JSON.parse(n)}catch{return k()}let e=n?.rows;return Array.isArray(e)?{version:1,rows:e.map(oe).filter(t=>t!==null)}:k()}var B=n=>n.on&&n.lora!==""&&(n.strength!==0||(n.strengthClip??0)!==0);function E(n){let e=n.replace(/\\/g,"/"),t=e.lastIndexOf("/");return{name:e.slice(t+1).replace(/\.(safetensors|ckpt|pt|pth|bin)$/i,""),folder:t>=0?e.slice(0,t):""}}function X(n,e){if(!n)return 0;let t=n.toLowerCase(),r=e.toLowerCase(),s=r.lastIndexOf("/")+1,o=r.indexOf(t,s);if(o>=0)return 1e3-(o-s)-r.length*.01;let i=r.indexOf(t);if(i>=0)return 500-i-r.length*.01;let d=0,p=0,h=0;for(let g of t){let u=r.indexOf(g,p);if(u<0)return-1;h=u===p?h+1:0,d+=1+h*2+(u>=s?1:0),p=u+1}return d}function a(n,e={},...t){let[r,...s]=n.split("."),o=document.createElement(r);s.length&&(o.className=s.join(" "));for(let[i,d]of Object.entries(e))d===!1||d==null||o.setAttribute(i,d===!0?"":String(d));for(let i of t)i&&o.append(i);return o}function L(n,e=["pointerdown","wheel","keydown","contextmenu"]){for(let t of e)n.addEventListener(t,r=>r.stopPropagation())}var ie=200,H=class{root=a("div.ld-picker",{role:"dialog","aria-label":"Choose LoRA"});search=a("input.ld-picker-search",{type:"search",placeholder:"Search LoRAs\u2026",spellcheck:!1,autocomplete:"off",role:"combobox","aria-expanded":!0,"aria-controls":"ld-picker-list"});refresh=a("button.ld-icon-btn",{type:"button",title:"Rescan LoRA folder"},"\u27F3");list=a("ul.ld-picker-list",{id:"ld-picker-list",role:"listbox"});status=a("div.ld-picker-status");options=null;results=[];active=0;constructor(){this.root.append(a("div.ld-picker-head",{},this.search,this.refresh),this.list,this.status),L(this.root),this.search.addEventListener("input",()=>this.filter()),this.search.addEventListener("keydown",e=>this.onKey(e)),this.refresh.addEventListener("click",async()=>{this.setStatus("Rescanning\u2026"),await w(!0),this.filter()}),this.list.addEventListener("pointerdown",e=>e.preventDefault()),this.list.addEventListener("click",e=>{let t=e.target.closest("[data-index]");t&&this.choose(Number(t.dataset.index))}),this.list.addEventListener("pointermove",e=>{let t=e.target.closest("[data-index]");t&&this.highlight(Number(t.dataset.index),!1)})}open(e){this.options=e,this.root.isConnected||document.body.append(this.root),this.root.hidden=!1,this.search.value="",this.position(e.anchor),this.filter(),this.search.focus(),document.addEventListener("pointerdown",this.onOutside,!0),window.addEventListener("blur",this.close),A().length||(this.setStatus("Loading\u2026"),w().then(()=>this.options===e&&this.filter()))}close=()=>{this.options&&(this.options=null,this.root.hidden=!0,document.removeEventListener("pointerdown",this.onOutside,!0),window.removeEventListener("blur",this.close))};onOutside=e=>{this.root.contains(e.target)||this.close()};position(e){let t=e.getBoundingClientRect(),r=Math.max(t.width,320),s=360,o=window.innerHeight-t.bottom,i=o>=s||o>=t.top?t.bottom+4:Math.max(8,t.top-s-4),d=Math.min(Math.max(8,t.left),window.innerWidth-r-8);Object.assign(this.root.style,{top:`${i}px`,left:`${d}px`,width:`${r}px`,maxHeight:`${s}px`})}filter(){let e=this.search.value.trim(),t=A(),r=e?t.map(i=>[i,X(e,i)]).filter(([,i])=>i>=0).sort((i,d)=>d[1]-i[1]).map(([i])=>i):t;this.results=r.slice(0,ie),this.render();let s=this.options?.current?this.results.indexOf(this.options.current):-1;this.highlight(s>=0&&!e?s:0,!0);let o=r.length-this.results.length;this.setStatus(t.length?this.results.length?o>0?`${o} more \u2014 refine your search`:"":"No matches":"No LoRAs found in models/loras")}render(){let{current:e,inUse:t}=this.options??{};this.list.replaceChildren(...this.results.map((r,s)=>{let{name:o,folder:i}=E(r);return a(`li.ld-picker-item${r===e?".ld-current":""}`,{role:"option","data-index":s,title:r},a("span.ld-picker-name",{},o),i?a("span.ld-picker-folder",{},i):null,t?.has(r)?a("span.ld-picker-badge",{title:"Already in this deck"},"in deck"):null)}))}highlight(e,t){if(!this.results.length)return;this.active=(e+this.results.length)%this.results.length,this.list.querySelector(".ld-active")?.classList.remove("ld-active");let r=this.list.children[this.active];r?.classList.add("ld-active"),r&&this.search.setAttribute("aria-activedescendant",r.id=`ld-opt-${this.active}`),t&&r?.scrollIntoView({block:"nearest"})}choose(e){let t=this.results[e],r=this.options;!t||!r||(this.close(),r.onPick(t))}onKey(e){let t={ArrowDown:1,ArrowUp:-1,PageDown:8,PageUp:-8};if(e.key in t)e.preventDefault(),this.highlight(this.active+t[e.key],!0);else if(e.key==="Enter")e.preventDefault(),this.choose(this.active);else if(e.key==="Escape"){e.preventDefault();let r=this.options?.anchor;this.close(),r?.focus()}}setStatus(e){this.status.textContent=e,this.status.hidden=!e}},se=null,M=n=>(se??=new H).open(n);var le=3,ae=.01,de=2;function q(n,e){let t=a("span.ld-scrub-fill"),r=a("span.ld-scrub-text"),s=a("input.ld-scrub-input",{type:"text",inputmode:"decimal","aria-label":n}),o=a("div.ld-scrub",{tabindex:0,role:"spinbutton","aria-label":n,"aria-valuemin":c.min,"aria-valuemax":c.max},t,r,s),i=c.default,d=()=>{r.textContent=T(i),o.setAttribute("aria-valuenow",String(i));let l=Math.min(1,Math.abs(i)/de)*100;t.style.width=`${l}%`,o.classList.toggle("ld-negative",i<0),o.classList.toggle("ld-zero",i===0)},p=(l,m)=>{l=b(l,i),!(l===i&&!m)&&(i=l,d(),e(i,m))},h=l=>l.shiftKey?.1:l.ctrlKey||l.metaKey?10:1;o.addEventListener("pointerdown",l=>{if(l.button!==0||o.classList.contains("ld-editing"))return;l.preventDefault();let m=l.clientX,J=i,C=!1;o.setPointerCapture(l.pointerId);let N=D=>{let O=D.clientX-m;if(!C&&Math.abs(O)<le)return;C=!0,o.classList.add("ld-scrubbing");let Q=J+O*ae*h(D),P=D.shiftKey?.01:c.step;p(Math.round(Q/P)*P,!1)},y=()=>{o.removeEventListener("pointermove",N),o.removeEventListener("pointerup",y),o.removeEventListener("pointercancel",y),o.classList.remove("ld-scrubbing"),C?p(i,!0):g()};o.addEventListener("pointermove",N),o.addEventListener("pointerup",y),o.addEventListener("pointercancel",y)}),o.addEventListener("dblclick",()=>{u(!1),p(c.default,!0)}),o.addEventListener("keydown",l=>{if(o.classList.contains("ld-editing"))return;let m=l.key==="ArrowUp"||l.key==="ArrowRight"?1:l.key==="ArrowDown"||l.key==="ArrowLeft"?-1:0;m?(l.preventDefault(),p(i+m*c.step*h(l),!0)):l.key==="Enter"&&(l.preventDefault(),g())});function g(){o.classList.add("ld-editing"),s.value=T(i),s.focus(),s.select()}function u(l){o.classList.contains("ld-editing")&&(o.classList.remove("ld-editing"),l&&p(b(s.value,i),!0))}return s.addEventListener("keydown",l=>{l.stopPropagation(),l.key==="Enter"?(u(!0),o.focus()):l.key==="Escape"&&(u(!1),o.focus())}),s.addEventListener("blur",()=>u(!0)),s.addEventListener("pointerdown",l=>l.stopPropagation()),d(),{el:o,set(l){i=b(l),d()}}}function V(n){let e=a("button.ld-toggle",{type:"button",role:"switch","aria-label":n},a("span.ld-toggle-knob"));return{el:e,set(t,r=!1){e.setAttribute("aria-checked",r?"mixed":String(t))}}}function Y(n,e){let t=null,r=()=>{t=null,window.removeEventListener("pointerup",r)};n.addEventListener("pointerdown",s=>{if(s.button!==0)return;let o=e(s.target);o&&(s.preventDefault(),t=!o.current,o.apply(t),window.addEventListener("pointerup",r))}),n.addEventListener("pointerover",s=>{if(t===null||!(s.buttons&1))return;let o=e(s.target);o&&o.current!==t&&o.apply(t)}),n.addEventListener("keydown",s=>{if(s.key!==" "&&s.key!=="Enter")return;let o=e(s.target);o&&(s.preventDefault(),o.apply(!o.current))})}var f={headerHeight:30,rowHeight:30,rowGap:4,emptyHeight:44,padding:6},R=class{constructor(e){this.events=e;for(let[t,r]of Object.entries(f))this.el.style.setProperty(`--ld-${t}`,`${r}px`);this.masterToggle.el.classList.add("ld-master"),this.el.append(a("div.ld-header",{},this.masterToggle.el,this.countEl,this.addBtn),this.rowsEl,this.emptyEl),L(this.el),this.addBtn.addEventListener("click",()=>this.pickNew(this.addBtn)),this.emptyEl.addEventListener("click",()=>this.pickNew(this.emptyEl)),this.masterToggle.el.addEventListener("click",()=>{let t=!this.value.rows.every(r=>r.on);this.mutate(()=>this.value.rows.forEach(r=>r.on=t))}),Y(this.rowsEl,t=>{let r=this.rowFromEvent(t,".ld-toggle");return r&&{current:r.on,apply:s=>this.mutate(()=>r.on=s)}}),this.rowsEl.addEventListener("click",t=>this.onRowClick(t)),this.unsubscribe=_(()=>this.render()),w(),this.render()}el=a("div.ld-deck");value=k();views=new Map;rowsEl=a("div.ld-rows",{role:"list"});masterToggle=V("Toggle all LoRAs");countEl=a("span.ld-count");addBtn=a("button.ld-btn.ld-add",{type:"button",title:"Add a LoRA"},"+ Add LoRA");emptyEl=a("button.ld-empty",{type:"button"},"No LoRAs yet \u2014 click to add one");unsubscribe;get data(){return this.value}setData(e){this.value=j(e),this.render()}get minHeight(){let e=this.value.rows.length,t=e?e*f.rowHeight+(e-1)*f.rowGap:f.emptyHeight;return f.headerHeight+f.rowGap+t+f.padding*2}dispose(){this.unsubscribe()}mutate(e,t=!1){e(),this.render(),this.events.onChange(t)}findRow(e){return e?this.value.rows.find(t=>t.id===e):void 0}rowFromEvent(e,t){let r=e?.closest?.(t);return r?this.findRow(r.closest(".ld-row")?.dataset.id):void 0}pickNew(e){M({anchor:e,inUse:new Set(this.value.rows.map(t=>t.lora)),onPick:t=>this.mutate(()=>this.value.rows.push(G(t)),!0)})}onRowClick(e){let t=e.target,r=this.rowFromEvent(t,".ld-row");r&&(t.closest(".ld-remove")?this.mutate(()=>this.value.rows=this.value.rows.filter(s=>s!==r),!0):t.closest(".ld-name")&&M({anchor:this.views.get(r.id).name,current:r.lora,inUse:new Set(this.value.rows.map(s=>s.lora)),onPick:s=>this.mutate(()=>r.lora=s)}))}render(){let{rows:e}=this.value,t=new Set(e.map(i=>i.id));for(let i of this.views.keys())t.has(i)||this.views.delete(i);let r=e.map(i=>{let d=this.views.get(i.id)??this.createRowView(i);return this.views.set(i.id,d),this.updateRowView(d,i),d.el}),s=Array.from(this.rowsEl.children);(s.length!==r.length||r.some((i,d)=>s[d]!==i))&&this.rowsEl.replaceChildren(...r);let o=e.filter(B).length;this.masterToggle.set(e.length>0&&o===e.length,o>0&&o<e.length),this.masterToggle.el.disabled=e.length===0,this.countEl.textContent=e.length?`${o} of ${e.length} active`:"",this.emptyEl.hidden=e.length>0,this.rowsEl.hidden=e.length===0}createRowView(e){let t=V("Enable LoRA"),r=a("button.ld-name",{type:"button"}),{id:s}=e,o=q("Strength",(p,h)=>{let g=this.findRow(s);g&&(g.strength=p,h?this.mutate(()=>{}):this.render())}),i=a("button.ld-icon-btn.ld-remove",{type:"button",title:"Remove","aria-label":"Remove LoRA"},"\xD7");return{el:a("div.ld-row",{role:"listitem","data-id":e.id},t.el,r,o.el,i),toggle:t,name:r,scrubber:o}}updateRowView(e,t){let{name:r,folder:s}=E(t.lora),o=F(t.lora);e.toggle.set(t.on),e.scrubber.set(t.strength),e.el.classList.toggle("ld-off",!t.on),e.el.classList.toggle("ld-missing",o),e.name.title=o?`Not found in models/loras: ${t.lora}`:t.lora||"Choose a LoRA",e.name.replaceChildren(a("span.ld-name-text",{},r||"Choose a LoRA\u2026"),s?a("span.ld-name-folder",{},s):"",o?a("span.ld-warn",{"aria-hidden":!0},"\u26A0"):"")}};var Z="LORA_DECK";function ce(){let n="lora-deck-styles";if(document.getElementById(n))return;let e=document.createElement("style");e.id=n,e.textContent=I,document.head.append(e)}function pe(n,e){let t=()=>{let[,i]=n.computeSize();n.setSize([n.size[0],i])},r=new R({onChange(i){i&&t(),n.setDirtyCanvas(!0,!0)}}),s=n.addDOMWidget(e,Z,r.el,{getValue:()=>r.data,setValue:i=>r.setData(i),getMinHeight:()=>r.minHeight,hideOnZoom:!0,margin:4}),o=n.onRemoved;return n.onRemoved=function(){r.dispose(),o?.call(this)},requestAnimationFrame(t),{widget:s,minWidth:340}}z.registerExtension({name:"LoraDeck",setup:ce,getCustomWidgets:()=>({[Z]:pe})});
