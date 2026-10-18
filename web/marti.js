function C(e,t,n){return(o,i)=>{let r=()=>o.setSize([o.size[0],o.computeSize()[1]]),s=t({onChange(d){d&&r(),o.setDirtyCanvas(!0,!0)}},o),l=o.addDOMWidget(i,e,s.el,{getValue:()=>s.data,setValue:d=>s.setData(d),getMinHeight:()=>s.minHeight,hideOnZoom:!0,margin:4});s.afterQueued&&Object.assign(l,{afterQueued:()=>s.afterQueued()});let u=o.onRemoved;return o.onRemoved=function(){s.dispose(),u?.call(this)},requestAnimationFrame(r),{widget:l,minWidth:n}}}function a(e,t={},...n){let[o,...i]=e.split("."),r=document.createElement(o);i.length&&(r.className=i.join(" "));for(let[s,l]of Object.entries(t))l===!1||l==null||r.setAttribute(s,l===!0?"":String(l));for(let s of n)s&&r.append(s);return r}function v(e,t=["pointerdown","wheel","keydown","contextmenu"]){for(let n of t)e.addEventListener(n,o=>o.stopPropagation())}function Q(e,t,n,o,i){let r=new Set(n.map(u=>u.id));for(let u of t.keys())r.has(u)||t.delete(u);let s=n.map(u=>{let d=t.get(u.id);return d||t.set(u.id,d=o(u)),i(d,u),d.el}),l=e.children;(l.length!==s.length||s.some((u,d)=>l[d]!==u))&&e.replaceChildren(...s)}import{app as Mt}from"../../scripts/app.js";import{api as Rt}from"../../scripts/api.js";var Y=Mt,J=Rt;var Z=new Map;function Tt(e,t){let n=[],o=new Set,i=null,r=!1,s=new Set;async function l(){let d=await J.fetchApi(`/models/${encodeURIComponent(e)}`);if(!d.ok)throw new Error(`Failed to list models/${e} (${d.status})`);let p=await d.json();return Array.isArray(p)?p.filter(m=>typeof m=="string"):[]}function u(d=!1){return i&&!d||(i=l().then(p=>(n=p,o=new Set(p),r=!0,s.forEach(m=>m(n)),n)).catch(p=>(i=null,console.error("[comfyui-marti]",p),n))),i}return{noun:t,emptyText:`No ${t}s found in models/${e}`,list:()=>n,load:u,isMissing:d=>r&&d!==""&&!o.has(d),onChanged(d){return s.add(d),()=>s.delete(d)}}}function tt(e,t){let n=Z.get(e);return n||Z.set(e,n=Tt(e,t)),n}function S(e){let t=e.replace(/\\/g,"/"),n=t.lastIndexOf("/");return{name:t.slice(n+1).replace(/\.(safetensors|ckpt|pt|pth|bin)$/i,""),folder:n>=0?t.slice(0,n):""}}function et(e,t){if(!e)return 0;let n=e.toLowerCase(),o=t.toLowerCase(),i=o.lastIndexOf("/")+1,r=o.indexOf(n,i);if(r>=0)return 1e3-(r-i)-o.length*.01;let s=o.indexOf(n);if(s>=0)return 500-s-o.length*.01;let l=0,u=0,d=0;for(let p of n){let m=o.indexOf(p,u);if(m<0)return-1;d=m===u?d+1:0,l+=1+d*2+(m>=i?1:0),u=m+1}return l}var Dt=200,V=class{root=a("div.mt-picker",{role:"dialog"});search=a("input.mt-picker-search",{type:"search",spellcheck:!1,autocomplete:"off",role:"combobox","aria-expanded":!0,"aria-controls":"mt-picker-list"});refresh=a("button.mt-icon-btn",{type:"button",title:"Rescan"},"\u27F3");list=a("ul.mt-picker-list",{id:"mt-picker-list",role:"listbox"});status=a("div.mt-picker-status");options=null;results=[];active=0;constructor(){this.root.append(a("div.mt-picker-head",{},this.search,this.refresh),this.list,this.status),v(this.root),this.search.addEventListener("input",()=>this.filter()),this.search.addEventListener("keydown",t=>this.onKey(t)),this.refresh.addEventListener("click",async()=>{this.setStatus("Rescanning\u2026"),await this.options?.source.load(!0),this.filter()}),this.list.addEventListener("pointerdown",t=>t.preventDefault()),this.list.addEventListener("click",t=>{let n=t.target.closest("[data-index]");n&&this.choose(Number(n.dataset.index))}),this.list.addEventListener("pointermove",t=>{let n=t.target.closest("[data-index]");n&&this.highlight(Number(n.dataset.index),!1)})}open(t){this.options=t;let{noun:n}=t.source;this.root.setAttribute("aria-label",`Choose ${n}`),this.search.placeholder=`Search ${n}s\u2026`,this.root.isConnected||document.body.append(this.root),this.root.hidden=!1,this.search.value="",this.position(t.anchor),this.filter(),this.search.focus(),document.addEventListener("pointerdown",this.onOutside,!0),window.addEventListener("blur",this.close),t.source.list().length||(this.setStatus("Loading\u2026"),t.source.load().then(()=>this.options===t&&this.filter()))}close=()=>{this.options&&(this.options=null,this.root.hidden=!0,document.removeEventListener("pointerdown",this.onOutside,!0),window.removeEventListener("blur",this.close))};onOutside=t=>{this.root.contains(t.target)||this.close()};position(t){let n=t.getBoundingClientRect(),o=Math.max(n.width,320),i=360,r=window.innerHeight-n.bottom,s=r>=i||r>=n.top?n.bottom+4:Math.max(8,n.top-i-4),l=Math.min(Math.max(8,n.left),window.innerWidth-o-8);Object.assign(this.root.style,{top:`${s}px`,left:`${l}px`,width:`${o}px`,maxHeight:`${i}px`})}filter(){let t=this.search.value.trim();if(!this.options)return;let n=this.options.source.list(),o=t?n.map(s=>[s,et(t,s)]).filter(([,s])=>s>=0).sort((s,l)=>l[1]-s[1]).map(([s])=>s):n;this.results=o.slice(0,Dt),this.render();let i=this.options?.current?this.results.indexOf(this.options.current):-1;this.highlight(i>=0&&!t?i:0,!0);let r=o.length-this.results.length;this.setStatus(n.length?this.results.length?r>0?`${r} more \u2014 refine your search`:"":"No matches":this.options.source.emptyText)}render(){let{current:t,inUse:n}=this.options??{};this.list.replaceChildren(...this.results.map((o,i)=>{let{name:r,folder:s}=S(o);return a(`li.mt-picker-item${o===t?".mt-current":""}`,{role:"option","data-index":i,title:o},a("span.mt-picker-name",{},r),s?a("span.mt-picker-folder",{},s):null,n?.has(o)?a("span.mt-picker-badge",{title:"Already in this deck"},"in deck"):null)}))}highlight(t,n){if(!this.results.length)return;this.active=(t+this.results.length)%this.results.length,this.list.querySelector(".mt-active")?.classList.remove("mt-active");let o=this.list.children[this.active];o?.classList.add("mt-active"),o&&this.search.setAttribute("aria-activedescendant",o.id=`mt-opt-${this.active}`),n&&o?.scrollIntoView({block:"nearest"})}choose(t){let n=this.results[t],o=this.options;!n||!o||(this.close(),o.onPick(n))}onKey(t){let n={ArrowDown:1,ArrowUp:-1,PageDown:8,PageUp:-8};if(t.key in n)t.preventDefault(),this.highlight(this.active+n[t.key],!0);else if(t.key==="Enter")t.preventDefault(),this.choose(this.active);else if(t.key==="Escape"){t.preventDefault();let o=this.options?.anchor;this.close(),o?.focus()}}setStatus(t){this.status.textContent=t,this.status.hidden=!t}},At=null,_=e=>(At??=new V).open(e);function y(e,t,n=e.default){let o=typeof t=="number"?t:Number.parseFloat(String(t));if(!Number.isFinite(o))return n;let i=Number(o.toFixed(e.precision+1));return Math.min(e.max,Math.max(e.min,i))}var P=(e,t)=>t.toFixed(e.precision);var Ht=3,It=.01,Ot=2;function nt(e,t,n){let o=a("span.mt-scrub-fill"),i=a("span.mt-scrub-text"),r=a("input.mt-scrub-input",{type:"text",inputmode:"decimal","aria-label":e}),s=a("div.mt-scrub",{tabindex:0,role:"spinbutton","aria-label":e,"aria-valuemin":t.min,"aria-valuemax":t.max},o,i,r),l=t.default,u=()=>{i.textContent=P(t,l),s.setAttribute("aria-valuenow",String(l));let c=Math.min(1,Math.abs(l)/Ot)*100;o.style.width=`${c}%`,s.classList.toggle("mt-negative",l<0),s.classList.toggle("mt-zero",l===0)},d=(c,g)=>{c=y(t,c,l),!(c===l&&!g)&&(l=c,u(),n(l,g))},p=c=>c.shiftKey?.1:c.ctrlKey||c.metaKey?10:1;s.addEventListener("pointerdown",c=>{if(c.button!==0||s.classList.contains("mt-editing"))return;c.preventDefault();let g=c.clientX,Lt=l,I=!1;s.setPointerCapture(c.pointerId);let G=O=>{let X=O.clientX-g;if(!I&&Math.abs(X)<Ht)return;I=!0,s.classList.add("mt-scrubbing");let Nt=Lt+X*It*p(O),q=O.shiftKey?t.step/5:t.step;d(Math.round(Nt/q)*q,!1)},E=()=>{s.removeEventListener("pointermove",G),s.removeEventListener("pointerup",E),s.removeEventListener("pointercancel",E),s.classList.remove("mt-scrubbing"),I?d(l,!0):m()};s.addEventListener("pointermove",G),s.addEventListener("pointerup",E),s.addEventListener("pointercancel",E)}),s.addEventListener("dblclick",()=>{k(!1),d(t.default,!0)}),s.addEventListener("keydown",c=>{if(s.classList.contains("mt-editing"))return;let g=c.key==="ArrowUp"||c.key==="ArrowRight"?1:c.key==="ArrowDown"||c.key==="ArrowLeft"?-1:0;g?(c.preventDefault(),d(l+g*t.step*p(c),!0)):c.key==="Enter"&&(c.preventDefault(),m())});function m(){s.classList.add("mt-editing"),r.value=P(t,l),r.focus(),r.select()}function k(c){s.classList.contains("mt-editing")&&(s.classList.remove("mt-editing"),c&&d(y(t,r.value,l),!0))}return r.addEventListener("keydown",c=>{c.stopPropagation(),c.key==="Enter"?(k(!0),s.focus()):c.key==="Escape"&&(k(!1),s.focus())}),r.addEventListener("blur",()=>k(!0)),r.addEventListener("pointerdown",c=>c.stopPropagation()),u(),{el:s,set(c){l=y(t,c),u()}}}function W(e){let t=a("button.mt-toggle",{type:"button",role:"switch","aria-label":e},a("span.mt-toggle-knob"));return{el:t,set(n,o=!1){t.setAttribute("aria-checked",o?"mixed":String(n))}}}function ot(e,t){let n=null,o=()=>{n=null,window.removeEventListener("pointerup",o)};e.addEventListener("pointerdown",i=>{if(i.button!==0)return;let r=t(i.target);r&&(i.preventDefault(),n=!r.current,r.apply(n),window.addEventListener("pointerup",o))}),e.addEventListener("pointerover",i=>{if(n===null||!(i.buttons&1))return;let r=t(i.target);r&&r.current!==n&&r.apply(n)}),e.addEventListener("keydown",i=>{if(i.key!==" "&&i.key!=="Enter")return;let r=t(i.target);r&&(i.preventDefault(),r.apply(!r.current))})}var $=()=>Math.random().toString(36).slice(2,10);function rt(e){if(typeof e=="string")try{e=JSON.parse(e)}catch{return[]}let t=e?.rows;return Array.isArray(t)?t:[]}var L=e=>e!==null&&typeof e=="object"&&!Array.isArray(e);var st=1,N={min:-10,max:10,step:.05,default:1,precision:2},at=()=>({version:st,rows:[]});function lt(e,t={}){return{id:$(),on:!0,lora:e,strength:N.default,strengthClip:null,...t}}var it=(e,t)=>y(N,e,t);function Vt(e){return!L(e)||typeof e.lora!="string"?null:{id:typeof e.id=="string"&&e.id?e.id:$(),on:e.on!==!1,lora:e.lora.trim(),strength:it(e.strength),strengthClip:e.strengthClip==null?null:it(e.strengthClip)}}function dt(e){return{version:st,rows:rt(e).map(Vt).filter(t=>t!==null)}}var ct=e=>e.on&&e.lora!==""&&(e.strength!==0||(e.strengthClip??0)!==0);var x=tt("loras","LoRA"),f={headerHeight:30,rowHeight:30,rowGap:4,emptyHeight:44,padding:6},M=class{constructor(t){this.events=t;for(let[n,o]of Object.entries(f))this.el.style.setProperty(`--ld-${n}`,`${o}px`);this.masterToggle.el.classList.add("ld-master"),this.el.append(a("div.ld-header",{},this.masterToggle.el,this.countEl,this.addBtn),this.rowsEl,this.emptyEl),v(this.el),this.addBtn.addEventListener("click",()=>this.pickNew(this.addBtn)),this.emptyEl.addEventListener("click",()=>this.pickNew(this.emptyEl)),this.masterToggle.el.addEventListener("click",()=>{let n=!this.value.rows.every(o=>o.on);this.mutate(()=>this.value.rows.forEach(o=>o.on=n))}),ot(this.rowsEl,n=>{let o=this.rowFromEvent(n,".mt-toggle");return o&&{current:o.on,apply:i=>this.mutate(()=>o.on=i)}}),this.rowsEl.addEventListener("click",n=>this.onRowClick(n)),this.unsubscribe=x.onChanged(()=>this.render()),x.load(),this.render()}el=a("div.mt-root.ld-deck");value=at();views=new Map;rowsEl=a("div.ld-rows",{role:"list"});masterToggle=W("Toggle all LoRAs");countEl=a("span.ld-count");addBtn=a("button.mt-btn.ld-add",{type:"button",title:"Add a LoRA"},"+ Add LoRA");emptyEl=a("button.ld-empty",{type:"button"},"No LoRAs yet \u2014 click to add one");unsubscribe;get data(){return this.value}setData(t){this.value=dt(t),this.render()}get minHeight(){let t=this.value.rows.length,n=t?t*f.rowHeight+(t-1)*f.rowGap:f.emptyHeight;return f.headerHeight+f.rowGap+n+f.padding*2}dispose(){this.unsubscribe()}mutate(t,n=!1){t(),this.render(),this.events.onChange(n)}findRow(t){return t?this.value.rows.find(n=>n.id===t):void 0}rowFromEvent(t,n){let o=t?.closest?.(n);return o?this.findRow(o.closest(".ld-row")?.dataset.id):void 0}pickNew(t){_({source:x,anchor:t,inUse:new Set(this.value.rows.map(n=>n.lora)),onPick:n=>this.mutate(()=>this.value.rows.push(lt(n)),!0)})}onRowClick(t){let n=t.target,o=this.rowFromEvent(n,".ld-row");o&&(n.closest(".ld-remove")?this.mutate(()=>this.value.rows=this.value.rows.filter(i=>i!==o),!0):n.closest(".ld-name")&&_({source:x,anchor:this.views.get(o.id).name,current:o.lora,inUse:new Set(this.value.rows.map(i=>i.lora)),onPick:i=>this.mutate(()=>o.lora=i)}))}render(){let{rows:t}=this.value;Q(this.rowsEl,this.views,t,o=>this.createRowView(o),(o,i)=>this.updateRowView(o,i));let n=t.filter(ct).length;this.masterToggle.set(t.length>0&&n===t.length,n>0&&n<t.length),this.masterToggle.el.disabled=t.length===0,this.countEl.textContent=t.length?`${n} of ${t.length} active`:"",this.emptyEl.hidden=t.length>0,this.rowsEl.hidden=t.length===0}createRowView(t){let n=W("Enable LoRA"),o=a("button.ld-name",{type:"button"}),{id:i}=t,r=nt("Strength",N,(u,d)=>{let p=this.findRow(i);p&&(p.strength=u,d?this.mutate(()=>{}):this.render())}),s=a("button.mt-icon-btn.ld-remove",{type:"button",title:"Remove","aria-label":"Remove LoRA"},"\xD7");return{el:a("div.ld-row",{role:"listitem","data-id":t.id},n.el,o,r.el,s),toggle:n,name:o,scrubber:r}}updateRowView(t,n){let{name:o,folder:i}=S(n.lora),r=x.isMissing(n.lora);t.toggle.set(n.on),t.scrubber.set(n.strength),t.el.classList.toggle("ld-off",!n.on),t.el.classList.toggle("ld-missing",r),t.name.title=r?`Not found in models/loras: ${n.lora}`:n.lora||"Choose a LoRA",t.name.replaceChildren(a("span.ld-name-text",{},o||"Choose a LoRA\u2026"),i?a("span.ld-name-folder",{},i):"",r?a("span.ld-warn",{"aria-hidden":!0},"\u26A0"):"")}};var ut=`/* LoRA Deck layout. Shared controls and theme tokens live in shared/theme.css. */
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

`;var pt="LORA_DECK",mt={styles:ut,widgets:{[pt]:C(pt,e=>new M(e),340)}};function ht(e,t){let n=e.input?.optional;if(n)for(let o of Object.keys(n))t(o)&&delete n[o];e.input_order?.optional&&(e.input_order.optional=e.input_order.optional.filter(o=>!t(o)))}function gt(e,t){for(let n of["output","output_is_list","output_name","output_tooltips"])e[n]=e[n]?.slice(0,t)}var ft=2,z=12,U=8,Pt=(e,t)=>`c${e}_o${t}`,w=/^c(\d+)_o(\d+)$/,R=e=>`C${e}`,b=()=>({version:ft,channels:2,outputs:1,active:0,mode:"fixed"}),F=(e,t,n,o)=>Number.isInteger(e)?Math.min(n,Math.max(t,e)):o;function bt(e){if(typeof e=="string")try{e=JSON.parse(e)}catch{return b()}if(!L(e))return b();let t=b(),n=F(e.channels,1,z,t.channels);return{version:ft,channels:n,outputs:F(e.outputs,1,U,t.outputs),active:F(e.active,0,n-1,0),mode:e.mode==="cycle"?"cycle":"fixed"}}var vt=e=>(e.active+1)%e.channels;function yt(e){let t=[];for(let n=0;n<e.channels;n++)for(let o=0;o<e.outputs;o++)t.push(Pt(n,o));return t}var wt=`/* Source Switch panel. Shared controls and theme tokens live in shared/theme.css. */
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
`;function K(e,t,n,o){let i=a("button.mt-icon-btn",{type:"button","aria-label":`Fewer ${e.toLowerCase()}`},"\u2212"),r=a("button.mt-icon-btn",{type:"button","aria-label":`More ${e.toLowerCase()}`},"+"),s=a("span.mt-stepper-count",{"aria-live":"polite"}),l=a("div.mt-stepper",{role:"group","aria-label":e},a("span.mt-stepper-label",{},e),i,s,r);return i.addEventListener("click",()=>o(-1)),r.addEventListener("click",()=>o(1)),{el:l,set(u){s.textContent=String(u),i.disabled=u<=t,r.disabled=u>=n}}}var h="*",T=e=>w.test(e),$t=e=>Number(w.exec(e)[2]);function Ft(e,t){let n=Array.from({length:t.outputs},()=>h);return e.graph&&e.inputs.forEach((o,i)=>{if(!T(o.name))return;let r=e.getInputLink(i),s=$t(o.name);r&&s<n.length&&n[s]===h&&r.type&&r.type!==h&&(n[s]=r.type)}),n}function zt(e){let t=new Map;for(let n=e.inputs.length-1;n>=0;n--){let{name:o}=e.inputs[n];if(!T(o))continue;let i=e.getInputLink(n);i&&t.set(o,{originId:i.origin_id,originSlot:i.origin_slot}),e.removeInput(n)}return t}function Ut(e,t){for(let[n,{originId:o,originSlot:i}]of t){let r=e.graph?.getNodeById(o),s=e.inputs.findIndex(l=>l.name===n);r&&s>=0&&r.connect(i,e,s)}}function xt(e,t){let n=yt(t),o=new Set(n);for(let r=e.inputs.length-1;r>=0;r--){let{name:s}=e.inputs[r];T(s)&&!o.has(s)&&e.removeInput(r)}let i=e.inputs.filter(r=>T(r.name)).map(r=>r.name);if(i.every((r,s)=>n[s]===r))for(let r of n.slice(i.length))e.addInput(r,h);else{let r=zt(e);for(let s of n)e.addInput(s,h);Ut(e,r)}for(;e.outputs.length>t.outputs;)e.removeOutput(e.outputs.length-1);for(;e.outputs.length<t.outputs;)e.addOutput(`out${e.outputs.length}`,h);j(e,t)}function j(e,t){let n=Ft(e,t),o=i=>n[i]!==h?n[i]:`out${i}`;for(let i of e.inputs){let r=w.exec(i.name);if(!r)continue;let s=Number(r[2]);i.label=`${R(Number(r[1]))} \xB7 ${o(s)}`,i.type=n[s]??h}e.outputs.forEach((i,r)=>{i.label=o(r),i.type=n[r]??h}),e.setDirtyCanvas(!0,!0)}var Kt="channel";function kt(e){if(!e.graph)return!1;let t=e.inputs.findIndex(n=>n.name===Kt);return t>=0&&e.isInputConnected(t)}var D={rowHeight:26,gap:6,padding:6},B=D.rowHeight*2+D.gap+D.padding*2,A=class{constructor(t,n){this.events=t;this.node=n;for(let[i,r]of Object.entries(D))this.el.style.setProperty(`--ss-${i}`,`${r}px`);this.el.append(a("div.ss-row",{},a("label.ss-caption",{},"Channel"),this.select,this.modeBtn),a("div.ss-row",{},this.channels.el,this.outputs.el)),v(this.el),this.select.addEventListener("change",()=>this.update(()=>this.value.active=Number(this.select.value))),this.modeBtn.addEventListener("click",()=>this.update(()=>this.value.mode=this.value.mode==="cycle"?"fixed":"cycle"));let o=n.onConnectionsChange;n.onConnectionsChange=(...i)=>{o?.apply(n,i),j(n,this.value),this.render()},this.render(),this.scheduleSync()}el=a("div.mt-root.ss-switch");minHeight=B;value=b();select=a("select.ss-select",{"aria-label":"Active channel"});modeBtn=a("button.mt-btn.ss-mode",{type:"button",title:"Switch to the next channel after each queued run"},"\u27F3 Cycle");channels=K("Channels",1,z,t=>this.update(()=>{this.value.channels+=t,this.value.active=Math.min(this.value.active,this.value.channels-1)},!0));outputs=K("Outputs",1,U,t=>this.update(()=>this.value.outputs+=t,!0));syncQueued=!1;linked=!1;get data(){return this.value}setData(t){this.value=bt(t),this.render(),this.scheduleSync()}afterQueued(){this.value.mode==="cycle"&&!this.linked&&this.update(()=>this.value.active=vt(this.value))}dispose(){}update(t,n=!1){t(),this.render(),n&&this.scheduleSync(),this.events.onChange(!1)}scheduleSync(t=30){this.syncQueued||(this.syncQueued=!0,requestAnimationFrame(()=>{if(this.syncQueued=!1,!this.node.graph){t>0&&this.scheduleSync(t-1);return}xt(this.node,this.value),this.render(),this.events.onChange(!0)}))}render(){let{channels:t,outputs:n,active:o,mode:i}=this.value;this.linked=kt(this.node);let r=`${t}:${this.linked}`;if(this.select.dataset.options!==r){this.select.dataset.options=r;let s=Array.from({length:t},(l,u)=>a("option",{value:u},R(u)));this.linked&&s.push(a("option",{value:"input"},"From input")),this.select.replaceChildren(...s)}this.select.value=this.linked?"input":String(o),this.select.disabled=this.linked,this.modeBtn.disabled=this.linked,this.modeBtn.title=this.linked?"Disabled while the channel input is connected":"Switch to the next channel after each queued run",this.modeBtn.setAttribute("aria-pressed",String(i==="cycle"&&!this.linked)),this.channels.set(t),this.outputs.set(n)}};var Et="MARTI_SOURCE_SWITCH",jt=4,Ct={styles:wt,widgets:{[Et]:C(Et,(e,t)=>new A(e,t),300)},nodeId:"MartiSourceSwitch",patchDef(e){ht(e,t=>w.test(t)),gt(e,b().outputs)},patchType(e){e.slot_start_y=B+jt*2,Object.assign(e.prototype,{widgets_start_y:0})}};var St=`/* Shared theme tokens and controls. Colors come from ComfyUI theme variables so every palette works. */
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
`;var H=[mt,Ct];function Gt(){let e="comfyui-marti-styles";if(document.getElementById(e))return;let t=document.createElement("style");t.id=e,t.textContent=[St,...H.map(n=>n.styles??"")].join(`
`),document.head.append(t)}Y.registerExtension({name:"comfyui-marti",setup:Gt,getCustomWidgets:()=>Object.assign({},...H.map(e=>e.widgets??{})),addCustomNodeDefs(e){for(let t of H){let n=t.nodeId?e[t.nodeId]:void 0;n&&t.patchDef?.(n)}},beforeRegisterNodeDef(e,t){H.find(n=>n.nodeId===t.name)?.patchType?.(e)}});
