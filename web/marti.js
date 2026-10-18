function C(n,t,e){return(r,o)=>{let i=()=>r.setSize([r.size[0],r.computeSize()[1]]),s=t({onChange(d){d&&i(),r.setDirtyCanvas(!0,!0)}},r),l=r.addDOMWidget(o,n,s.el,{getValue:()=>s.data,setValue:d=>s.setData(d),getMinHeight:()=>s.minHeight,hideOnZoom:!0,margin:4});s.afterQueued&&Object.assign(l,{afterQueued:()=>s.afterQueued()});let u=r.onRemoved;return r.onRemoved=function(){s.dispose(),u?.call(this)},requestAnimationFrame(i),{widget:l,minWidth:e}}}function a(n,t={},...e){let[r,...o]=n.split("."),i=document.createElement(r);o.length&&(i.className=o.join(" "));for(let[s,l]of Object.entries(t))l===!1||l==null||i.setAttribute(s,l===!0?"":String(l));for(let s of e)s&&i.append(s);return i}function v(n,t=["pointerdown","wheel","keydown","contextmenu"]){for(let e of t)n.addEventListener(e,r=>r.stopPropagation())}function q(n,t,e,r,o){let i=new Set(e.map(u=>u.id));for(let u of t.keys())i.has(u)||t.delete(u);let s=e.map(u=>{let d=t.get(u.id);return d||t.set(u.id,d=r(u)),o(d,u),d.el}),l=n.children;(l.length!==s.length||s.some((u,d)=>l[d]!==u))&&n.replaceChildren(...s)}import{app as Nt}from"../../scripts/app.js";import{api as Rt}from"../../scripts/api.js";var Y=Nt,J=Rt;var Z=new Map;function Mt(n,t){let e=[],r=new Set,o=null,i=!1,s=new Set;async function l(){let d=await J.fetchApi(`/models/${encodeURIComponent(n)}`);if(!d.ok)throw new Error(`Failed to list models/${n} (${d.status})`);let p=await d.json();return Array.isArray(p)?p.filter(m=>typeof m=="string"):[]}function u(d=!1){return o&&!d||(o=l().then(p=>(e=p,r=new Set(p),i=!0,s.forEach(m=>m(e)),e)).catch(p=>(o=null,console.error("[comfyui-marti]",p),e))),o}return{noun:t,emptyText:`No ${t}s found in models/${n}`,list:()=>e,load:u,isMissing:d=>i&&d!==""&&!r.has(d),onChanged(d){return s.add(d),()=>s.delete(d)}}}function tt(n,t){let e=Z.get(n);return e||Z.set(n,e=Mt(n,t)),e}function S(n){let t=n.replace(/\\/g,"/"),e=t.lastIndexOf("/");return{name:t.slice(e+1).replace(/\.(safetensors|ckpt|pt|pth|bin)$/i,""),folder:e>=0?t.slice(0,e):""}}function et(n,t){if(!n)return 0;let e=n.toLowerCase(),r=t.toLowerCase(),o=r.lastIndexOf("/")+1,i=r.indexOf(e,o);if(i>=0)return 1e3-(i-o)-r.length*.01;let s=r.indexOf(e);if(s>=0)return 500-s-r.length*.01;let l=0,u=0,d=0;for(let p of e){let m=r.indexOf(p,u);if(m<0)return-1;d=m===u?d+1:0,l+=1+d*2+(m>=o?1:0),u=m+1}return l}var Tt=200,V=class{root=a("div.mt-picker",{role:"dialog"});search=a("input.mt-picker-search",{type:"search",spellcheck:!1,autocomplete:"off",role:"combobox","aria-expanded":!0,"aria-controls":"mt-picker-list"});refresh=a("button.mt-icon-btn",{type:"button",title:"Rescan"},"\u27F3");list=a("ul.mt-picker-list",{id:"mt-picker-list",role:"listbox"});status=a("div.mt-picker-status");options=null;results=[];active=0;constructor(){this.root.append(a("div.mt-picker-head",{},this.search,this.refresh),this.list,this.status),v(this.root),this.search.addEventListener("input",()=>this.filter()),this.search.addEventListener("keydown",t=>this.onKey(t)),this.refresh.addEventListener("click",async()=>{this.setStatus("Rescanning\u2026"),await this.options?.source.load(!0),this.filter()}),this.list.addEventListener("pointerdown",t=>t.preventDefault()),this.list.addEventListener("click",t=>{let e=t.target.closest("[data-index]");e&&this.choose(Number(e.dataset.index))}),this.list.addEventListener("pointermove",t=>{let e=t.target.closest("[data-index]");e&&this.highlight(Number(e.dataset.index),!1)})}open(t){this.options=t;let{noun:e}=t.source;this.root.setAttribute("aria-label",`Choose ${e}`),this.search.placeholder=`Search ${e}s\u2026`,this.root.isConnected||document.body.append(this.root),this.root.hidden=!1,this.search.value="",this.position(t.anchor),this.filter(),this.search.focus(),document.addEventListener("pointerdown",this.onOutside,!0),window.addEventListener("blur",this.close),t.source.list().length||(this.setStatus("Loading\u2026"),t.source.load().then(()=>this.options===t&&this.filter()))}close=()=>{this.options&&(this.options=null,this.root.hidden=!0,document.removeEventListener("pointerdown",this.onOutside,!0),window.removeEventListener("blur",this.close))};onOutside=t=>{this.root.contains(t.target)||this.close()};position(t){let e=t.getBoundingClientRect(),r=Math.max(e.width,320),o=360,i=window.innerHeight-e.bottom,s=i>=o||i>=e.top?e.bottom+4:Math.max(8,e.top-o-4),l=Math.min(Math.max(8,e.left),window.innerWidth-r-8);Object.assign(this.root.style,{top:`${s}px`,left:`${l}px`,width:`${r}px`,maxHeight:`${o}px`})}filter(){let t=this.search.value.trim();if(!this.options)return;let e=this.options.source.list(),r=t?e.map(s=>[s,et(t,s)]).filter(([,s])=>s>=0).sort((s,l)=>l[1]-s[1]).map(([s])=>s):e;this.results=r.slice(0,Tt),this.render();let o=this.options?.current?this.results.indexOf(this.options.current):-1;this.highlight(o>=0&&!t?o:0,!0);let i=r.length-this.results.length;this.setStatus(e.length?this.results.length?i>0?`${i} more \u2014 refine your search`:"":"No matches":this.options.source.emptyText)}render(){let{current:t,inUse:e}=this.options??{};this.list.replaceChildren(...this.results.map((r,o)=>{let{name:i,folder:s}=S(r);return a(`li.mt-picker-item${r===t?".mt-current":""}`,{role:"option","data-index":o,title:r},a("span.mt-picker-name",{},i),s?a("span.mt-picker-folder",{},s):null,e?.has(r)?a("span.mt-picker-badge",{title:"Already in this deck"},"in deck"):null)}))}highlight(t,e){if(!this.results.length)return;this.active=(t+this.results.length)%this.results.length,this.list.querySelector(".mt-active")?.classList.remove("mt-active");let r=this.list.children[this.active];r?.classList.add("mt-active"),r&&this.search.setAttribute("aria-activedescendant",r.id=`mt-opt-${this.active}`),e&&r?.scrollIntoView({block:"nearest"})}choose(t){let e=this.results[t],r=this.options;!e||!r||(this.close(),r.onPick(e))}onKey(t){let e={ArrowDown:1,ArrowUp:-1,PageDown:8,PageUp:-8};if(t.key in e)t.preventDefault(),this.highlight(this.active+e[t.key],!0);else if(t.key==="Enter")t.preventDefault(),this.choose(this.active);else if(t.key==="Escape"){t.preventDefault();let r=this.options?.anchor;this.close(),r?.focus()}}setStatus(t){this.status.textContent=t,this.status.hidden=!t}},Dt=null,P=n=>(Dt??=new V).open(n);function y(n,t,e=n.default){let r=typeof t=="number"?t:Number.parseFloat(String(t));if(!Number.isFinite(r))return e;let o=Number(r.toFixed(n.precision+1));return Math.min(n.max,Math.max(n.min,o))}var _=(n,t)=>t.toFixed(n.precision);var At=3,Ht=.01,Ot=2;function nt(n,t,e){let r=a("span.mt-scrub-fill"),o=a("span.mt-scrub-text"),i=a("input.mt-scrub-input",{type:"text",inputmode:"decimal","aria-label":n}),s=a("div.mt-scrub",{tabindex:0,role:"spinbutton","aria-label":n,"aria-valuemin":t.min,"aria-valuemax":t.max},r,o,i),l=t.default,u=()=>{o.textContent=_(t,l),s.setAttribute("aria-valuenow",String(l));let c=Math.min(1,Math.abs(l)/Ot)*100;r.style.width=`${c}%`,s.classList.toggle("mt-negative",l<0),s.classList.toggle("mt-zero",l===0)},d=(c,g)=>{c=y(t,c,l),!(c===l&&!g)&&(l=c,u(),e(l,g))},p=c=>c.shiftKey?.1:c.ctrlKey||c.metaKey?10:1;s.addEventListener("pointerdown",c=>{if(c.button!==0||s.classList.contains("mt-editing"))return;c.preventDefault();let g=c.clientX,St=l,O=!1;s.setPointerCapture(c.pointerId);let B=I=>{let X=I.clientX-g;if(!O&&Math.abs(X)<At)return;O=!0,s.classList.add("mt-scrubbing");let Lt=St+X*Ht*p(I),Q=I.shiftKey?t.step/5:t.step;d(Math.round(Lt/Q)*Q,!1)},E=()=>{s.removeEventListener("pointermove",B),s.removeEventListener("pointerup",E),s.removeEventListener("pointercancel",E),s.classList.remove("mt-scrubbing"),O?d(l,!0):m()};s.addEventListener("pointermove",B),s.addEventListener("pointerup",E),s.addEventListener("pointercancel",E)}),s.addEventListener("dblclick",()=>{k(!1),d(t.default,!0)}),s.addEventListener("keydown",c=>{if(s.classList.contains("mt-editing"))return;let g=c.key==="ArrowUp"||c.key==="ArrowRight"?1:c.key==="ArrowDown"||c.key==="ArrowLeft"?-1:0;g?(c.preventDefault(),d(l+g*t.step*p(c),!0)):c.key==="Enter"&&(c.preventDefault(),m())});function m(){s.classList.add("mt-editing"),i.value=_(t,l),i.focus(),i.select()}function k(c){s.classList.contains("mt-editing")&&(s.classList.remove("mt-editing"),c&&d(y(t,i.value,l),!0))}return i.addEventListener("keydown",c=>{c.stopPropagation(),c.key==="Enter"?(k(!0),s.focus()):c.key==="Escape"&&(k(!1),s.focus())}),i.addEventListener("blur",()=>k(!0)),i.addEventListener("pointerdown",c=>c.stopPropagation()),u(),{el:s,set(c){l=y(t,c),u()}}}function W(n){let t=a("button.mt-toggle",{type:"button",role:"switch","aria-label":n},a("span.mt-toggle-knob"));return{el:t,set(e,r=!1){t.setAttribute("aria-checked",r?"mixed":String(e))}}}function rt(n,t){let e=null,r=()=>{e=null,window.removeEventListener("pointerup",r)};n.addEventListener("pointerdown",o=>{if(o.button!==0)return;let i=t(o.target);i&&(o.preventDefault(),e=!i.current,i.apply(e),window.addEventListener("pointerup",r))}),n.addEventListener("pointerover",o=>{if(e===null||!(o.buttons&1))return;let i=t(o.target);i&&i.current!==e&&i.apply(e)}),n.addEventListener("keydown",o=>{if(o.key!==" "&&o.key!=="Enter")return;let i=t(o.target);i&&(o.preventDefault(),i.apply(!i.current))})}var $=()=>Math.random().toString(36).slice(2,10);function ot(n){if(typeof n=="string")try{n=JSON.parse(n)}catch{return[]}let t=n?.rows;return Array.isArray(t)?t:[]}var L=n=>n!==null&&typeof n=="object"&&!Array.isArray(n);var st=1,N={min:-10,max:10,step:.05,default:1,precision:2},at=()=>({version:st,rows:[]});function lt(n,t={}){return{id:$(),on:!0,lora:n,strength:N.default,strengthClip:null,...t}}var it=(n,t)=>y(N,n,t);function It(n){return!L(n)||typeof n.lora!="string"?null:{id:typeof n.id=="string"&&n.id?n.id:$(),on:n.on!==!1,lora:n.lora.trim(),strength:it(n.strength),strengthClip:n.strengthClip==null?null:it(n.strengthClip)}}function dt(n){return{version:st,rows:ot(n).map(It).filter(t=>t!==null)}}var ct=n=>n.on&&n.lora!==""&&(n.strength!==0||(n.strengthClip??0)!==0);var w=tt("loras","LoRA"),f={headerHeight:30,rowHeight:30,rowGap:4,emptyHeight:44,padding:6},R=class{constructor(t){this.events=t;for(let[e,r]of Object.entries(f))this.el.style.setProperty(`--ld-${e}`,`${r}px`);this.masterToggle.el.classList.add("ld-master"),this.el.append(a("div.ld-header",{},this.masterToggle.el,this.countEl,this.addBtn),this.rowsEl,this.emptyEl),v(this.el),this.addBtn.addEventListener("click",()=>this.pickNew(this.addBtn)),this.emptyEl.addEventListener("click",()=>this.pickNew(this.emptyEl)),this.masterToggle.el.addEventListener("click",()=>{let e=!this.value.rows.every(r=>r.on);this.mutate(()=>this.value.rows.forEach(r=>r.on=e))}),rt(this.rowsEl,e=>{let r=this.rowFromEvent(e,".mt-toggle");return r&&{current:r.on,apply:o=>this.mutate(()=>r.on=o)}}),this.rowsEl.addEventListener("click",e=>this.onRowClick(e)),this.unsubscribe=w.onChanged(()=>this.render()),w.load(),this.render()}el=a("div.mt-root.ld-deck");value=at();views=new Map;rowsEl=a("div.ld-rows",{role:"list"});masterToggle=W("Toggle all LoRAs");countEl=a("span.ld-count");addBtn=a("button.mt-btn.ld-add",{type:"button",title:"Add a LoRA"},"+ Add LoRA");emptyEl=a("button.ld-empty",{type:"button"},"No LoRAs yet \u2014 click to add one");unsubscribe;get data(){return this.value}setData(t){this.value=dt(t),this.render()}get minHeight(){let t=this.value.rows.length,e=t?t*f.rowHeight+(t-1)*f.rowGap:f.emptyHeight;return f.headerHeight+f.rowGap+e+f.padding*2}dispose(){this.unsubscribe()}mutate(t,e=!1){t(),this.render(),this.events.onChange(e)}findRow(t){return t?this.value.rows.find(e=>e.id===t):void 0}rowFromEvent(t,e){let r=t?.closest?.(e);return r?this.findRow(r.closest(".ld-row")?.dataset.id):void 0}pickNew(t){P({source:w,anchor:t,inUse:new Set(this.value.rows.map(e=>e.lora)),onPick:e=>this.mutate(()=>this.value.rows.push(lt(e)),!0)})}onRowClick(t){let e=t.target,r=this.rowFromEvent(e,".ld-row");r&&(e.closest(".ld-remove")?this.mutate(()=>this.value.rows=this.value.rows.filter(o=>o!==r),!0):e.closest(".ld-name")&&P({source:w,anchor:this.views.get(r.id).name,current:r.lora,inUse:new Set(this.value.rows.map(o=>o.lora)),onPick:o=>this.mutate(()=>r.lora=o)}))}render(){let{rows:t}=this.value;q(this.rowsEl,this.views,t,r=>this.createRowView(r),(r,o)=>this.updateRowView(r,o));let e=t.filter(ct).length;this.masterToggle.set(t.length>0&&e===t.length,e>0&&e<t.length),this.masterToggle.el.disabled=t.length===0,this.countEl.textContent=t.length?`${e} of ${t.length} active`:"",this.emptyEl.hidden=t.length>0,this.rowsEl.hidden=t.length===0}createRowView(t){let e=W("Enable LoRA"),r=a("button.ld-name",{type:"button"}),{id:o}=t,i=nt("Strength",N,(u,d)=>{let p=this.findRow(o);p&&(p.strength=u,d?this.mutate(()=>{}):this.render())}),s=a("button.mt-icon-btn.ld-remove",{type:"button",title:"Remove","aria-label":"Remove LoRA"},"\xD7");return{el:a("div.ld-row",{role:"listitem","data-id":t.id},e.el,r,i.el,s),toggle:e,name:r,scrubber:i}}updateRowView(t,e){let{name:r,folder:o}=S(e.lora),i=w.isMissing(e.lora);t.toggle.set(e.on),t.scrubber.set(e.strength),t.el.classList.toggle("ld-off",!e.on),t.el.classList.toggle("ld-missing",i),t.name.title=i?`Not found in models/loras: ${e.lora}`:e.lora||"Choose a LoRA",t.name.replaceChildren(a("span.ld-name-text",{},r||"Choose a LoRA\u2026"),o?a("span.ld-name-folder",{},o):"",i?a("span.ld-warn",{"aria-hidden":!0},"\u26A0"):"")}};var ut=`/* LoRA Deck layout. Shared controls and theme tokens live in shared/theme.css. */
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

`;var pt="LORA_DECK",mt={styles:ut,widgets:{[pt]:C(pt,n=>new R(n),340)}};function ht(n,t){let e=n.input?.optional;if(e)for(let r of Object.keys(e))t(r)&&delete e[r];n.input_order?.optional&&(n.input_order.optional=n.input_order.optional.filter(r=>!t(r)))}function gt(n,t){for(let e of["output","output_is_list","output_name","output_tooltips"])n[e]=n[e]?.slice(0,t)}var ft=2,z=12,U=8,Pt=(n,t)=>`c${n}_o${t}`,x=/^c(\d+)_o(\d+)$/,M=n=>`C${n}`,b=()=>({version:ft,channels:2,outputs:1,active:0,mode:"fixed"}),F=(n,t,e,r)=>Number.isInteger(n)?Math.min(e,Math.max(t,n)):r;function bt(n){if(typeof n=="string")try{n=JSON.parse(n)}catch{return b()}if(!L(n))return b();let t=b(),e=F(n.channels,1,z,t.channels);return{version:ft,channels:e,outputs:F(n.outputs,1,U,t.outputs),active:F(n.active,0,e-1,0),mode:n.mode==="cycle"?"cycle":"fixed"}}var vt=n=>(n.active+1)%n.channels;function yt(n){let t=[];for(let e=0;e<n.channels;e++)for(let r=0;r<n.outputs;r++)t.push(Pt(e,r));return t}var xt=`/* Source Switch panel. Shared controls and theme tokens live in shared/theme.css. */
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
`;function K(n,t,e,r){let o=a("button.mt-icon-btn",{type:"button","aria-label":`Fewer ${n.toLowerCase()}`},"\u2212"),i=a("button.mt-icon-btn",{type:"button","aria-label":`More ${n.toLowerCase()}`},"+"),s=a("span.mt-stepper-count",{"aria-live":"polite"}),l=a("div.mt-stepper",{role:"group","aria-label":n},a("span.mt-stepper-label",{},n),o,s,i);return o.addEventListener("click",()=>r(-1)),i.addEventListener("click",()=>r(1)),{el:l,set(u){s.textContent=String(u),o.disabled=u<=t,i.disabled=u>=e}}}var h="*",T=n=>x.test(n),Wt=n=>Number(x.exec(n)[2]);function $t(n,t){let e=Array.from({length:t.outputs},()=>h);return n.graph&&n.inputs.forEach((r,o)=>{if(!T(r.name))return;let i=n.getInputLink(o),s=Wt(r.name);i&&s<e.length&&e[s]===h&&i.type&&i.type!==h&&(e[s]=i.type)}),e}function Ft(n){let t=new Map;for(let e=n.inputs.length-1;e>=0;e--){let{name:r}=n.inputs[e];if(!T(r))continue;let o=n.getInputLink(e);o&&t.set(r,{originId:o.origin_id,originSlot:o.origin_slot}),n.removeInput(e)}return t}function zt(n,t){for(let[e,{originId:r,originSlot:o}]of t){let i=n.graph?.getNodeById(r),s=n.inputs.findIndex(l=>l.name===e);i&&s>=0&&i.connect(o,n,s)}}function wt(n,t){let e=yt(t),r=new Set(e);for(let i=n.inputs.length-1;i>=0;i--){let{name:s}=n.inputs[i];T(s)&&!r.has(s)&&n.removeInput(i)}let o=n.inputs.filter(i=>T(i.name)).map(i=>i.name);if(o.every((i,s)=>e[s]===i))for(let i of e.slice(o.length))n.addInput(i,h);else{let i=Ft(n);for(let s of e)n.addInput(s,h);zt(n,i)}for(;n.outputs.length>t.outputs;)n.removeOutput(n.outputs.length-1);for(;n.outputs.length<t.outputs;)n.addOutput(`out${n.outputs.length}`,h);j(n,t)}function j(n,t){let e=$t(n,t),r=o=>e[o]!==h?e[o]:`out${o}`;for(let o of n.inputs){let i=x.exec(o.name);if(!i)continue;let s=Number(i[2]);o.label=`${M(Number(i[1]))} \xB7 ${r(s)}`,o.type=e[s]??h}n.outputs.forEach((o,i)=>{o.label=r(i),o.type=e[i]??h}),n.setDirtyCanvas(!0,!0)}var D={rowHeight:26,gap:6,padding:6},G=D.rowHeight*2+D.gap+D.padding*2,A=class{constructor(t,e){this.events=t;this.node=e;for(let[o,i]of Object.entries(D))this.el.style.setProperty(`--ss-${o}`,`${i}px`);this.el.append(a("div.ss-row",{},a("label.ss-caption",{},"Channel"),this.select,this.modeBtn),a("div.ss-row",{},this.channels.el,this.outputs.el)),v(this.el),this.select.addEventListener("change",()=>this.update(()=>this.value.active=Number(this.select.value))),this.modeBtn.addEventListener("click",()=>this.update(()=>this.value.mode=this.value.mode==="cycle"?"fixed":"cycle"));let r=e.onConnectionsChange;e.onConnectionsChange=(...o)=>{r?.apply(e,o),j(e,this.value)},this.render(),this.scheduleSync()}el=a("div.mt-root.ss-switch");minHeight=G;value=b();select=a("select.ss-select",{"aria-label":"Active channel"});modeBtn=a("button.mt-btn.ss-mode",{type:"button",title:"Switch to the next channel after each queued run"},"\u27F3 Cycle");channels=K("Channels",1,z,t=>this.update(()=>{this.value.channels+=t,this.value.active=Math.min(this.value.active,this.value.channels-1)},!0));outputs=K("Outputs",1,U,t=>this.update(()=>this.value.outputs+=t,!0));syncQueued=!1;get data(){return this.value}setData(t){this.value=bt(t),this.render(),this.scheduleSync()}afterQueued(){this.value.mode==="cycle"&&this.update(()=>this.value.active=vt(this.value))}dispose(){}update(t,e=!1){t(),this.render(),e&&this.scheduleSync(),this.events.onChange(!1)}scheduleSync(t=30){this.syncQueued||(this.syncQueued=!0,requestAnimationFrame(()=>{if(this.syncQueued=!1,!this.node.graph){t>0&&this.scheduleSync(t-1);return}wt(this.node,this.value),this.events.onChange(!0)}))}render(){let{channels:t,outputs:e,active:r,mode:o}=this.value;this.select.options.length!==t&&this.select.replaceChildren(...Array.from({length:t},(i,s)=>a("option",{value:s},M(s)))),this.select.value=String(r),this.modeBtn.setAttribute("aria-pressed",String(o==="cycle")),this.channels.set(t),this.outputs.set(e)}};var kt="MARTI_SOURCE_SWITCH",Ut=4,Et={styles:xt,widgets:{[kt]:C(kt,(n,t)=>new A(n,t),300)},nodeId:"MartiSourceSwitch",patchDef(n){ht(n,t=>x.test(t)),gt(n,b().outputs)},patchType(n){n.slot_start_y=G+Ut*2,Object.assign(n.prototype,{widgets_start_y:0})}};var Ct=`/* Shared theme tokens and controls. Colors come from ComfyUI theme variables so every palette works. */
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
`;var H=[mt,Et];function jt(){let n="comfyui-marti-styles";if(document.getElementById(n))return;let t=document.createElement("style");t.id=n,t.textContent=[Ct,...H.map(e=>e.styles??"")].join(`
`),document.head.append(t)}Y.registerExtension({name:"comfyui-marti",setup:jt,getCustomWidgets:()=>Object.assign({},...H.map(n=>n.widgets??{})),addCustomNodeDefs(n){for(let t of H){let e=t.nodeId?n[t.nodeId]:void 0;e&&t.patchDef?.(e)}},beforeRegisterNodeDef(n,t){H.find(e=>e.nodeId===t.name)?.patchType?.(n)}});
