import{app as pt}from"../../scripts/app.js";import{api as mt}from"../../scripts/api.js";var f=pt;function g(t){return f.extensionManager?.setting?.get(t)??f.ui?.settings?.getSettingValue(t)}var h=mt;var j=new Map;function ht(t,e){let n=[],r=new Set,i=null,o=!1,a=new Set;async function l(){let c=await h.fetchApi(`/models/${encodeURIComponent(t)}`);if(!c.ok)throw new Error(`Failed to list models/${t} (${c.status})`);let m=await c.json();return Array.isArray(m)?m.filter(p=>typeof p=="string"):[]}function d(c=!1){return i&&!c||(i=l().then(m=>(n=m,r=new Set(m),o=!0,a.forEach(p=>p(n)),n)).catch(m=>(i=null,console.error("[comfyui-marti]",m),n))),i}return{noun:e,emptyText:`No ${e}s found in models/${t}`,list:()=>n,load:d,isMissing:c=>o&&c!==""&&!r.has(c),onChanged(c){return a.add(c),()=>a.delete(c)}}}function pe(t){j.get(t)?.load(!0)}function me(t,e){let n=j.get(t);return n||j.set(t,n=ht(t,e)),n}var L="Marti.Models.CivitaiToken",T="Marti.Models.HfToken";function ft(){let t={},e=String(g(L)??"").trim(),n=String(g(T)??"").trim();return e&&(t["X-Marti-Civitai-Token"]=e),n&&(t["X-Marti-HF-Token"]=n),t}async function k(t,e){let n={headers:ft()};e!==void 0&&(n.method="POST",n.body=JSON.stringify(e),n.headers["Content-Type"]="application/json");let r=await h.fetchApi(t,n),i=await r.json().catch(()=>({}));if(!r.ok)throw new Error(i.error||`Request failed (${r.status})`);return i}var he=()=>k("/marti/models/status"),fe=t=>k("/marti/models/resolve",{url:t}),ge=(t,e,n)=>k("/marti/models/download",{url:t,folder:e,filename:n}),ve=t=>k("/marti/models/cancel",{id:t}),be=()=>k("/marti/models/clear",{});function ye(t,e,n,r=""){let i=new URLSearchParams({query:t,type:e,sort:n,cursor:r});return k(`/marti/civitai/search?${i}`)}function s(t,e={},...n){let[r,...i]=t.split("."),o=document.createElement(r);i.length&&(o.className=i.join(" "));for(let[a,l]of Object.entries(e))l===!1||l==null||o.setAttribute(a,l===!0?"":String(l));for(let a of n)a&&o.append(a);return o}function S(t,e=["pointerdown","wheel","keydown","contextmenu"]){for(let n of e)t.addEventListener(n,r=>r.stopPropagation())}function we(t,e,n,r,i){let o=new Set(n.map(d=>d.id));for(let d of e.keys())o.has(d)||e.delete(d);let a=n.map(d=>{let c=e.get(d.id);return c||e.set(d.id,c=r(d)),i(c,d),c.el}),l=t.children;(l.length!==a.length||a.some((d,c)=>l[c]!==d))&&t.replaceChildren(...a)}var xe=[["","All types"],["Checkpoint","Checkpoint"],["LORA","LoRA"],["LoCon","LoCon"],["DoRA","DoRA"],["TextualInversion","Embedding"],["VAE","VAE"],["Controlnet","ControlNet"],["Upscaler","Upscaler"]],ke=[["","Relevance"],["Most Downloaded","Most downloaded"],["Highest Rated","Highest rated"],["Newest","Newest"]],Se=t=>t>=4;function v(t){if(!t||t<0)return"";let e=["B","KB","MB","GB","TB"],n=t,r=0;for(;n>=1024&&r<e.length-1;)n/=1024,r++;return`${n>=100||r===0?Math.round(n):n.toFixed(1).replace(/\.0$/,"")} ${e[r]}`}function Ee(t){return t<1e3?String(t):t<1e6?`${(t/1e3).toFixed(t<1e4?1:0).replace(/\.0$/,"")}k`:`${(t/1e6).toFixed(1).replace(/\.0$/,"")}M`}function Ce(t,e=160){return/\/(?:width=\d+|original=true)[^/]*\//.test(t)?t.replace(/\/(?:width=\d+|original=true)[^/]*\//,`/width=${e}/`):t}var J=(t,e)=>`https://civitai.com/models/${t}?modelVersionId=${e}`;function U(t){return t.status==="done"?1:t.size?Math.min(1,t.done/t.size):null}function Le(t){switch(t.status){case"queued":return"Waiting\u2026";case"verifying":return"Checking file\u2026";case"done":return`Done \xB7 ${v(t.size??t.done)}`;case"cancelled":return"Cancelled";case"error":return t.error||"Failed"}let e=U(t);return[e!=null?`${Math.floor(e*100)}%`:"",t.size?`${v(t.done)} of ${v(t.size)}`:v(t.done),t.speed?`${v(t.speed)}/s`:""].filter(Boolean).join(" \xB7 ")}var K=t=>t==="queued"||t==="downloading"||t==="verifying";var q="Marti.Models.BlurNsfw",gt={civitai:"Civitai",hf:"Hugging Face",url:"Direct link"},Te=(t,e)=>s("select.md-select",{"aria-label":e},...t.map(([n,r])=>s("option",{value:n},r))),I=class{constructor(e){this.onFinished=e;let n=s("form.md-row",{},this.linkInput,this.checkBtn);n.addEventListener("submit",o=>{o.preventDefault(),this.check()}),this.linkInput.addEventListener("paste",()=>setTimeout(()=>void this.check(),0));let r=s("button.mt-btn",{type:"button"},"Clear finished");r.addEventListener("click",async()=>{let{jobs:o}=await be();this.setJobs(o)}),this.jobsSection.append(s("div.md-heading",{},s("span",{},"Downloads"),r),this.jobList);let i=s("form.md-row",{},this.searchInput,s("button.mt-btn",{type:"submit"},"Search"));i.addEventListener("submit",o=>{o.preventDefault(),this.search(!1)});for(let o of[this.typeSelect,this.sortSelect])o.addEventListener("change",()=>this.searched&&void this.search(!1));this.moreBtn.addEventListener("click",()=>void this.search(!0)),this.root.append(s("section.md-section",{},s("div.md-heading",{},s("span",{},"Download a model")),n,this.tokens,this.linkError,this.preview),this.jobsSection,s("section.md-section",{},s("div.md-heading",{},s("span",{},"Search Civitai")),i,s("div.md-row",{},this.typeSelect,this.sortSelect),this.results,this.searchStatus,this.moreBtn))}root=s("div.mt-root.md-panel");linkInput=s("input.md-input",{type:"text",placeholder:"Civitai or Hugging Face link",spellcheck:!1,autocomplete:"off"});checkBtn=s("button.mt-btn",{type:"submit"},"Check");tokens=s("div.md-tokens");preview=s("div.md-card.md-preview",{hidden:!0});linkError=s("div.md-error",{hidden:!0});jobsSection=s("section.md-section",{hidden:!0});jobList=s("div.md-jobs");jobViews=new Map;jobs=new Map;searchInput=s("input.md-input",{type:"search",placeholder:"Search Civitai",spellcheck:!1,autocomplete:"off"});typeSelect=Te(xe,"Model type");sortSelect=Te(ke,"Sort");results=s("div.md-results");searchStatus=s("div.md-muted",{hidden:!0});moreBtn=s("button.mt-btn.md-more",{type:"button",hidden:!0},"Load more");status=null;lastFolder="";resolveSeq=0;searchSeq=0;nextCursor=null;searched=!1;async refresh(){try{this.status=await he(),this.setJobs(this.status.jobs)}catch(e){this.showLinkError(`Model download API unavailable: ${e.message}`)}this.renderTokens()}updateJob(e){let n=this.jobs.get(e.id);this.jobs.set(e.id,e),this.renderJob(e),e.status==="done"&&n?.status!=="done"&&(this.onFinished(e),this.preview.dataset.filename===e.filename&&this.check())}renderTokens(){let e=this.status?.env,n=(r,i,o)=>{let a=String(g(o)??"").trim()!=="";return s(`span.md-token${i||a?".md-ok":""}`,{title:i?"Read from the server's environment":"Set one in Settings \u2192 Marti \u2192 Models"},`${r}: ${i?"server token":a?"token from Settings":"no token"}`)};this.tokens.replaceChildren(n("Civitai",e?.civitai,L),n("HF",e?.hf,T))}showLinkError(e){this.linkError.textContent=e??"",this.linkError.hidden=!e}async check(){let e=this.linkInput.value.trim();if(!e)return;let n=++this.resolveSeq;this.checkBtn.disabled=!0,this.showLinkError(null),this.preview.hidden=!0;try{this.status||await this.refresh();let r=await fe(e);n===this.resolveSeq&&this.renderPreview(e,r)}catch(r){n===this.resolveSeq&&this.showLinkError(r.message)}finally{n===this.resolveSeq&&(this.checkBtn.disabled=!1)}}renderPreview(e,n){let r=this.status?.folders??[],i=s("select.md-select",{"aria-label":"Folder"},...r.map(p=>s("option",{value:p},p)));i.value=n.folder??(r.includes(this.lastFolder)?this.lastFolder:r[0]??"");let o=s("input.md-input",{type:"text",value:n.filename,spellcheck:!1,"aria-label":"File name"}),a=s("div.md-note"),l=s("button.mt-btn.md-primary",{type:"button"},"Download"),d=()=>{let p=o.value===n.filename&&n.exists.includes(i.value);a.textContent=p?`Already in models/${i.value}`:"",a.hidden=!p,l.disabled=p||!o.value.trim()||!i.value};i.addEventListener("change",d),o.addEventListener("input",d),d(),l.addEventListener("click",async()=>{l.disabled=!0,this.showLinkError(null);try{this.lastFolder=i.value,this.updateJob(await ge(e,i.value,o.value.trim())),this.preview.hidden=!0,this.linkInput.value=""}catch(p){this.showLinkError(p.message),l.disabled=!1}});let c=n.page?s("a.md-title",{href:n.page,target:"_blank",rel:"noopener noreferrer"},n.name):s("div.md-title",{},n.name),m=[gt[n.source],v(n.size),n.sha256?"checksum \u2713":""].filter(Boolean).join(" \xB7 ");this.preview.dataset.filename=n.filename,this.preview.replaceChildren(c,s("div.md-muted",{},m),s("label.md-field",{},s("span",{},"Folder"),i),s("label.md-field",{},s("span",{},"Save as"),o),a,l),this.preview.hidden=!1}setJobs(e){let n=new Set(e.map(r=>r.id));for(let r of[...this.jobs.keys()])n.has(r)||(this.jobs.delete(r),this.jobViews.get(r)?.el.remove(),this.jobViews.delete(r));for(let r of e)this.jobs.set(r.id,r),this.renderJob(r);this.jobsSection.hidden=this.jobs.size===0}renderJob(e){let n=this.jobViews.get(e.id);if(!n){let i=s("div.md-bar-fill"),o=s("div.md-job-text"),a=s("button.mt-icon-btn",{type:"button",title:"Cancel","aria-label":"Cancel download"},"\xD7");a.addEventListener("click",()=>void ve(e.id));let l=s("div.md-job",{},s("div.md-job-head",{},s("div.md-job-name",{title:e.name},e.name),a),s("div.md-muted.md-ellipsis",{title:`models/${e.folder}/${e.filename}`},`${e.folder}/${e.filename}`),s("div.md-bar",{},i),o);n={el:l,bar:i,text:o,cancel:a},this.jobViews.set(e.id,n),this.jobList.prepend(l)}let r=U(e);n.el.dataset.status=e.status,n.bar.style.width=r==null?"100%":`${r*100}%`,n.bar.classList.toggle("md-indeterminate",r==null&&K(e.status)),n.text.textContent=Le(e),n.cancel.hidden=!K(e.status),this.jobsSection.hidden=!1}async search(e){let n=++this.searchSeq;this.searched=!0,this.moreBtn.hidden=!0,this.setSearchStatus("Searching\u2026"),e||(this.nextCursor=null,this.results.replaceChildren());try{let r=await ye(this.searchInput.value,this.typeSelect.value,this.sortSelect.value,e?this.nextCursor??"":"");if(n!==this.searchSeq)return;this.results.append(...r.items.map(i=>this.renderResult(i))),this.nextCursor=r.nextCursor,this.moreBtn.hidden=!r.nextCursor,this.setSearchStatus(this.results.childElementCount?"":"No models found")}catch(r){n===this.searchSeq&&this.setSearchStatus(r.message)}}setSearchStatus(e){this.searchStatus.textContent=e,this.searchStatus.hidden=!e}renderResult(e){let n=e.thumb?s("img.md-thumb",{src:Ce(e.thumb.url),alt:"",loading:"lazy",referrerpolicy:"no-referrer"}):s("div.md-thumb");e.thumb&&Se(e.thumb.nsfwLevel)&&g(q)!==!1&&(n.classList.add("md-blur"),n.title="Click to reveal",n.addEventListener("click",()=>n.classList.remove("md-blur"),{once:!0}));let r=s("select.md-select",{"aria-label":"Version"},...e.versions.map(l=>s("option",{value:l.id},[l.name,l.baseModel].filter(Boolean).join(" \xB7 ")))),i=s("span",{},v(e.versions[0]?.size));r.addEventListener("change",()=>{i.textContent=v(e.versions.find(l=>String(l.id)===r.value)?.size)});let o=s("button.mt-btn.md-primary",{type:"button"},"Get");o.addEventListener("click",()=>{this.linkInput.value=J(e.id,Number(r.value)),this.root.scrollTo({top:0,behavior:"smooth"}),this.check()});let a=J(e.id,e.versions[0].id);return s("div.md-card.md-result",{},n,s("div.md-result-body",{},s("a.md-title",{href:a,target:"_blank",rel:"noopener noreferrer",title:e.name},e.name),s("div.md-muted",{},[e.type,e.creator&&`by ${e.creator}`,`\u2193 ${Ee(e.downloads)}`].filter(Boolean).join(" \xB7 ")),e.versions.length>1?r:s("div.md-muted",{},r.options[0]?.textContent??""),s("div.md-row.md-result-actions",{},s("span.md-muted",{},i),o)))}};var G=`/* Models sidebar tab. Shared controls and theme tokens live in shared/theme.css. */
.md-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: 100%;
  padding: 12px;
  overflow: hidden auto;
  font-size: 13px;
}
.md-panel [hidden] {
  display: none !important;
}
.md-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.md-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-weight: 600;
  color: var(--mt-fg);
}
.md-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.md-input,
.md-select {
  flex: 1;
  min-width: 0;
  height: 28px;
  padding: 0 8px;
  border-radius: var(--mt-radius);
  border: 1px solid var(--mt-border);
  background: var(--mt-bg);
  color: var(--mt-fg);
  font: inherit;
  outline: none;
}
.md-input:focus,
.md-select:focus {
  border-color: var(--mt-accent);
}
.md-panel .mt-btn {
  height: 28px;
  flex: none;
}
.md-panel .mt-btn:disabled {
  opacity: 0.45;
  cursor: default;
}
.md-panel .md-primary {
  background: var(--mt-accent) !important;
  border-color: var(--mt-accent) !important;
  color: #fff !important;
}
.md-panel .md-primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--mt-accent) 85%, #fff) !important;
}

.md-muted {
  color: var(--mt-muted);
  font-size: 12px;
}
.md-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.md-error {
  padding: 6px 8px;
  border-radius: var(--mt-radius);
  background: color-mix(in srgb, var(--mt-danger) 14%, transparent);
  color: var(--mt-danger);
  overflow-wrap: anywhere;
}
.md-note {
  color: var(--mt-muted);
}
.md-tokens {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-size: 11px;
  color: var(--mt-muted);
}
.md-token::before {
  content: "\u25CB ";
}
.md-token.md-ok::before {
  content: "\u25CF ";
  color: var(--mt-accent);
}

.md-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border-radius: 8px;
  background: var(--mt-bg);
  border: 1px solid var(--mt-border);
}
.md-title {
  font-weight: 600;
  color: var(--mt-fg) !important;
  text-decoration: none;
  overflow-wrap: anywhere;
}
a.md-title:hover {
  text-decoration: underline;
  text-underline-offset: 2px;
}
.md-field {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  color: var(--mt-muted);
}

/* ---- downloads ----------------------------------------------------------- */
.md-jobs {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.md-job {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--mt-bg);
}
.md-job-head {
  display: flex;
  align-items: center;
  gap: 6px;
}
.md-job-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.md-bar {
  height: 4px;
  border-radius: 2px;
  background: var(--mt-border);
  overflow: hidden;
}
.md-bar-fill {
  height: 100%;
  width: 0;
  background: var(--mt-accent);
  transition: width 400ms linear;
}
.md-bar-fill.md-indeterminate {
  opacity: 0.5;
  animation: md-pulse 1.2s ease-in-out infinite;
}
@keyframes md-pulse {
  50% {
    opacity: 1;
  }
}
.md-job-text {
  font-size: 11px;
  color: var(--mt-muted);
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.md-job[data-status="error"] .md-bar-fill,
.md-job[data-status="cancelled"] .md-bar-fill {
  background: var(--mt-danger);
}
.md-job[data-status="error"] .md-job-text {
  color: var(--mt-danger);
}

/* ---- search results ------------------------------------------------------ */
.md-results {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.md-result {
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  padding: 8px;
}
.md-thumb {
  flex: none;
  width: 72px;
  height: 96px;
  border-radius: 6px;
  object-fit: cover;
  background: var(--mt-border);
}
.md-thumb.md-blur {
  filter: blur(14px);
  cursor: pointer;
}
.md-result-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.md-result .md-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.md-result .md-select {
  height: 24px;
  font-size: 12px;
}
.md-result-actions {
  justify-content: space-between;
  margin-top: auto;
}
.md-result-actions .mt-btn {
  height: 24px;
}
.md-more {
  align-self: center;
}
`;var Me=t=>`Only used when the server has no ${t} environment variable (on Vast, set ${t} on the instance instead).`,Ne=[{id:L,category:["Marti","Models","Civitai token"],name:"Civitai API token",tooltip:Me("CIVITAI_TOKEN"),type:"text",defaultValue:""},{id:T,category:["Marti","Models","HF token"],name:"Hugging Face token",tooltip:Me("HF_TOKEN"),type:"text",defaultValue:""},{id:q,category:["Marti","Models","Blur NSFW"],name:"Blur NSFW thumbnails in Civitai search",tooltip:"Click a thumbnail to reveal it.",type:"boolean",defaultValue:!0}];function bt(t){f.refreshComboInNodes?.(),pe(t.folder),f.extensionManager?.toast?.add({severity:"success",summary:"Model downloaded",detail:`models/${t.folder}/${t.filename}`,life:5e3})}function Re(){let t=new I(bt);h.addEventListener("marti.download",e=>{let n=e.detail;t.updateJob(n),n.status==="error"&&f.extensionManager?.toast?.add({severity:"error",summary:"Download failed",detail:`${n.filename}: ${n.error}`,life:8e3})}),f.extensionManager?.registerSidebarTab?.({id:"marti-models",icon:"pi pi-download",title:"Models",tooltip:"Download models",type:"custom",render(e){e.append(t.root),t.refresh()}})}function A(t,e,n){return(r,i)=>{let o=()=>r.setSize([r.size[0],r.computeSize()[1]]),a=e({onChange(c){c&&o(),r.setDirtyCanvas(!0,!0)}},r),l=r.addDOMWidget(i,t,a.el,{getValue:()=>a.data,setValue:c=>a.setData(c),getMinHeight:()=>a.minHeight,hideOnZoom:!0,margin:4});a.afterQueued&&Object.assign(l,{afterQueued:()=>a.afterQueued()});let d=r.onRemoved;return r.onRemoved=function(){a.dispose(),d?.call(this)},requestAnimationFrame(o),{widget:l,minWidth:n}}}function D(t){let e=t.replace(/\\/g,"/"),n=e.lastIndexOf("/");return{name:e.slice(n+1).replace(/\.(safetensors|ckpt|pt|pth|bin)$/i,""),folder:n>=0?e.slice(0,n):""}}function Ie(t,e){if(!t)return 0;let n=t.toLowerCase(),r=e.toLowerCase(),i=r.lastIndexOf("/")+1,o=r.indexOf(n,i);if(o>=0)return 1e3-(o-i)-r.length*.01;let a=r.indexOf(n);if(a>=0)return 500-a-r.length*.01;let l=0,d=0,c=0;for(let m of n){let p=r.indexOf(m,d);if(p<0)return-1;c=p===d?c+1:0,l+=1+c*2+(p>=i?1:0),d=p+1}return l}var yt=200,X=class{root=s("div.mt-picker",{role:"dialog"});search=s("input.mt-picker-search",{type:"search",spellcheck:!1,autocomplete:"off",role:"combobox","aria-expanded":!0,"aria-controls":"mt-picker-list"});refresh=s("button.mt-icon-btn",{type:"button",title:"Rescan"},"\u27F3");list=s("ul.mt-picker-list",{id:"mt-picker-list",role:"listbox"});status=s("div.mt-picker-status");options=null;results=[];active=0;constructor(){this.root.append(s("div.mt-picker-head",{},this.search,this.refresh),this.list,this.status),S(this.root),this.search.addEventListener("input",()=>this.filter()),this.search.addEventListener("keydown",e=>this.onKey(e)),this.refresh.addEventListener("click",async()=>{this.setStatus("Rescanning\u2026"),await this.options?.source.load(!0),this.filter()}),this.list.addEventListener("pointerdown",e=>e.preventDefault()),this.list.addEventListener("click",e=>{let n=e.target.closest("[data-index]");n&&this.choose(Number(n.dataset.index))}),this.list.addEventListener("pointermove",e=>{let n=e.target.closest("[data-index]");n&&this.highlight(Number(n.dataset.index),!1)})}open(e){this.options=e;let{noun:n}=e.source;this.root.setAttribute("aria-label",`Choose ${n}`),this.search.placeholder=`Search ${n}s\u2026`,this.root.isConnected||document.body.append(this.root),this.root.hidden=!1,this.search.value="",this.position(e.anchor),this.filter(),this.search.focus(),document.addEventListener("pointerdown",this.onOutside,!0),window.addEventListener("blur",this.close),e.source.list().length||(this.setStatus("Loading\u2026"),e.source.load().then(()=>this.options===e&&this.filter()))}close=()=>{this.options&&(this.options=null,this.root.hidden=!0,document.removeEventListener("pointerdown",this.onOutside,!0),window.removeEventListener("blur",this.close))};onOutside=e=>{this.root.contains(e.target)||this.close()};position(e){let n=e.getBoundingClientRect(),r=Math.max(n.width,320),i=360,o=window.innerHeight-n.bottom,a=o>=i||o>=n.top?n.bottom+4:Math.max(8,n.top-i-4),l=Math.min(Math.max(8,n.left),window.innerWidth-r-8);Object.assign(this.root.style,{top:`${a}px`,left:`${l}px`,width:`${r}px`,maxHeight:`${i}px`})}filter(){let e=this.search.value.trim();if(!this.options)return;let n=this.options.source.list(),r=e?n.map(a=>[a,Ie(e,a)]).filter(([,a])=>a>=0).sort((a,l)=>l[1]-a[1]).map(([a])=>a):n;this.results=r.slice(0,yt),this.render();let i=this.options?.current?this.results.indexOf(this.options.current):-1;this.highlight(i>=0&&!e?i:0,!0);let o=r.length-this.results.length;this.setStatus(n.length?this.results.length?o>0?`${o} more \u2014 refine your search`:"":"No matches":this.options.source.emptyText)}render(){let{current:e,inUse:n}=this.options??{};this.list.replaceChildren(...this.results.map((r,i)=>{let{name:o,folder:a}=D(r);return s(`li.mt-picker-item${r===e?".mt-current":""}`,{role:"option","data-index":i,title:r},s("span.mt-picker-name",{},o),a?s("span.mt-picker-folder",{},a):null,n?.has(r)?s("span.mt-picker-badge",{title:"Already in this deck"},"in deck"):null)}))}highlight(e,n){if(!this.results.length)return;this.active=(e+this.results.length)%this.results.length,this.list.querySelector(".mt-active")?.classList.remove("mt-active");let r=this.list.children[this.active];r?.classList.add("mt-active"),r&&this.search.setAttribute("aria-activedescendant",r.id=`mt-opt-${this.active}`),n&&r?.scrollIntoView({block:"nearest"})}choose(e){let n=this.results[e],r=this.options;!n||!r||(this.close(),r.onPick(n))}onKey(e){let n={ArrowDown:1,ArrowUp:-1,PageDown:8,PageUp:-8};if(e.key in n)e.preventDefault(),this.highlight(this.active+n[e.key],!0);else if(e.key==="Enter")e.preventDefault(),this.choose(this.active);else if(e.key==="Escape"){e.preventDefault();let r=this.options?.anchor;this.close(),r?.focus()}}setStatus(e){this.status.textContent=e,this.status.hidden=!e}},wt=null,Q=t=>(wt??=new X).open(t);function E(t,e,n=t.default){let r=typeof e=="number"?e:Number.parseFloat(String(e));if(!Number.isFinite(r))return n;let i=Number(r.toFixed(t.precision+1));return Math.min(t.max,Math.max(t.min,i))}var Y=(t,e)=>e.toFixed(t.precision);var xt=3,kt=.01,St=2;function Ae(t,e,n){let r=s("span.mt-scrub-fill"),i=s("span.mt-scrub-text"),o=s("input.mt-scrub-input",{type:"text",inputmode:"decimal","aria-label":t}),a=s("div.mt-scrub",{tabindex:0,role:"spinbutton","aria-label":t,"aria-valuemin":e.min,"aria-valuemax":e.max},r,i,o),l=e.default,d=()=>{i.textContent=Y(e,l),a.setAttribute("aria-valuenow",String(l));let u=Math.min(1,Math.abs(l)/St)*100;r.style.width=`${u}%`,a.classList.toggle("mt-negative",l<0),a.classList.toggle("mt-zero",l===0)},c=(u,y)=>{u=E(e,u,l),!(u===l&&!y)&&(l=u,d(),n(l,y))},m=u=>u.shiftKey?.1:u.ctrlKey||u.metaKey?10:1;a.addEventListener("pointerdown",u=>{if(u.button!==0||a.classList.contains("mt-editing"))return;u.preventDefault();let y=u.clientX,ct=l,z=!1;a.setPointerCapture(u.pointerId);let de=B=>{let ce=B.clientX-y;if(!z&&Math.abs(ce)<xt)return;z=!0,a.classList.add("mt-scrubbing");let ut=ct+ce*kt*m(B),ue=B.shiftKey?e.step/5:e.step;c(Math.round(ut/ue)*ue,!1)},R=()=>{a.removeEventListener("pointermove",de),a.removeEventListener("pointerup",R),a.removeEventListener("pointercancel",R),a.classList.remove("mt-scrubbing"),z?c(l,!0):p()};a.addEventListener("pointermove",de),a.addEventListener("pointerup",R),a.addEventListener("pointercancel",R)}),a.addEventListener("dblclick",()=>{N(!1),c(e.default,!0)}),a.addEventListener("keydown",u=>{if(a.classList.contains("mt-editing"))return;let y=u.key==="ArrowUp"||u.key==="ArrowRight"?1:u.key==="ArrowDown"||u.key==="ArrowLeft"?-1:0;y?(u.preventDefault(),c(l+y*e.step*m(u),!0)):u.key==="Enter"&&(u.preventDefault(),p())});function p(){a.classList.add("mt-editing"),o.value=Y(e,l),o.focus(),o.select()}function N(u){a.classList.contains("mt-editing")&&(a.classList.remove("mt-editing"),u&&c(E(e,o.value,l),!0))}return o.addEventListener("keydown",u=>{u.stopPropagation(),u.key==="Enter"?(N(!0),a.focus()):u.key==="Escape"&&(N(!1),a.focus())}),o.addEventListener("blur",()=>N(!0)),o.addEventListener("pointerdown",u=>u.stopPropagation()),d(),{el:a,set(u){l=E(e,u),d()}}}function Z(t){let e=s("button.mt-toggle",{type:"button",role:"switch","aria-label":t},s("span.mt-toggle-knob"));return{el:e,set(n,r=!1){e.setAttribute("aria-checked",r?"mixed":String(n))}}}function De(t,e){let n=null,r=()=>{n=null,window.removeEventListener("pointerup",r)};t.addEventListener("pointerdown",i=>{if(i.button!==0)return;let o=e(i.target);o&&(i.preventDefault(),n=!o.current,o.apply(n),window.addEventListener("pointerup",r))}),t.addEventListener("pointerover",i=>{if(n===null||!(i.buttons&1))return;let o=e(i.target);o&&o.current!==n&&o.apply(n)}),t.addEventListener("keydown",i=>{if(i.key!==" "&&i.key!=="Enter")return;let o=e(i.target);o&&(i.preventDefault(),o.apply(!o.current))})}var ee=()=>Math.random().toString(36).slice(2,10);function _e(t){if(typeof t=="string")try{t=JSON.parse(t)}catch{return[]}let e=t?.rows;return Array.isArray(e)?e:[]}var _=t=>t!==null&&typeof t=="object"&&!Array.isArray(t);var He=1,$={min:-10,max:10,step:.05,default:1,precision:2},Ve=()=>({version:He,rows:[]});function Oe(t,e={}){return{id:ee(),on:!0,lora:t,strength:$.default,strengthClip:null,...e}}var $e=(t,e)=>E($,t,e);function Et(t){return!_(t)||typeof t.lora!="string"?null:{id:typeof t.id=="string"&&t.id?t.id:ee(),on:t.on!==!1,lora:t.lora.trim(),strength:$e(t.strength),strengthClip:t.strengthClip==null?null:$e(t.strengthClip)}}function Pe(t){return{version:He,rows:_e(t).map(Et).filter(e=>e!==null)}}var Fe=t=>t.on&&t.lora!==""&&(t.strength!==0||(t.strengthClip??0)!==0);var M=me("loras","LoRA"),w={headerHeight:30,rowHeight:30,rowGap:4,emptyHeight:44,padding:6},H=class{constructor(e){this.events=e;for(let[n,r]of Object.entries(w))this.el.style.setProperty(`--ld-${n}`,`${r}px`);this.masterToggle.el.classList.add("ld-master"),this.el.append(s("div.ld-header",{},this.masterToggle.el,this.countEl,this.addBtn),this.rowsEl,this.emptyEl),S(this.el),this.addBtn.addEventListener("click",()=>this.pickNew(this.addBtn)),this.emptyEl.addEventListener("click",()=>this.pickNew(this.emptyEl)),this.masterToggle.el.addEventListener("click",()=>{let n=!this.value.rows.every(r=>r.on);this.mutate(()=>this.value.rows.forEach(r=>r.on=n))}),De(this.rowsEl,n=>{let r=this.rowFromEvent(n,".mt-toggle");return r&&{current:r.on,apply:i=>this.mutate(()=>r.on=i)}}),this.rowsEl.addEventListener("click",n=>this.onRowClick(n)),this.unsubscribe=M.onChanged(()=>this.render()),M.load(),this.render()}el=s("div.mt-root.ld-deck");value=Ve();views=new Map;rowsEl=s("div.ld-rows",{role:"list"});masterToggle=Z("Toggle all LoRAs");countEl=s("span.ld-count");addBtn=s("button.mt-btn.ld-add",{type:"button",title:"Add a LoRA"},"+ Add LoRA");emptyEl=s("button.ld-empty",{type:"button"},"No LoRAs yet \u2014 click to add one");unsubscribe;get data(){return this.value}setData(e){this.value=Pe(e),this.render()}get minHeight(){let e=this.value.rows.length,n=e?e*w.rowHeight+(e-1)*w.rowGap:w.emptyHeight;return w.headerHeight+w.rowGap+n+w.padding*2}dispose(){this.unsubscribe()}mutate(e,n=!1){e(),this.render(),this.events.onChange(n)}findRow(e){return e?this.value.rows.find(n=>n.id===e):void 0}rowFromEvent(e,n){let r=e?.closest?.(n);return r?this.findRow(r.closest(".ld-row")?.dataset.id):void 0}pickNew(e){Q({source:M,anchor:e,inUse:new Set(this.value.rows.map(n=>n.lora)),onPick:n=>this.mutate(()=>this.value.rows.push(Oe(n)),!0)})}onRowClick(e){let n=e.target,r=this.rowFromEvent(n,".ld-row");r&&(n.closest(".ld-remove")?this.mutate(()=>this.value.rows=this.value.rows.filter(i=>i!==r),!0):n.closest(".ld-name")&&Q({source:M,anchor:this.views.get(r.id).name,current:r.lora,inUse:new Set(this.value.rows.map(i=>i.lora)),onPick:i=>this.mutate(()=>r.lora=i)}))}render(){let{rows:e}=this.value;we(this.rowsEl,this.views,e,r=>this.createRowView(r),(r,i)=>this.updateRowView(r,i));let n=e.filter(Fe).length;this.masterToggle.set(e.length>0&&n===e.length,n>0&&n<e.length),this.masterToggle.el.disabled=e.length===0,this.countEl.textContent=e.length?`${n} of ${e.length} active`:"",this.emptyEl.hidden=e.length>0,this.rowsEl.hidden=e.length===0}createRowView(e){let n=Z("Enable LoRA"),r=s("button.ld-name",{type:"button"}),{id:i}=e,o=Ae("Strength",$,(d,c)=>{let m=this.findRow(i);m&&(m.strength=d,c?this.mutate(()=>{}):this.render())}),a=s("button.mt-icon-btn.ld-remove",{type:"button",title:"Remove","aria-label":"Remove LoRA"},"\xD7");return{el:s("div.ld-row",{role:"listitem","data-id":e.id},n.el,r,o.el,a),toggle:n,name:r,scrubber:o}}updateRowView(e,n){let{name:r,folder:i}=D(n.lora),o=M.isMissing(n.lora);e.toggle.set(n.on),e.scrubber.set(n.strength),e.el.classList.toggle("ld-off",!n.on),e.el.classList.toggle("ld-missing",o),e.name.title=o?`Not found in models/loras: ${n.lora}`:n.lora||"Choose a LoRA",e.name.replaceChildren(s("span.ld-name-text",{},r||"Choose a LoRA\u2026"),i?s("span.ld-name-folder",{},i):"",o?s("span.ld-warn",{"aria-hidden":!0},"\u26A0"):"")}};var We=`/* LoRA Deck layout. Shared controls and theme tokens live in shared/theme.css. */
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

`;var ze="LORA_DECK",Be={styles:We,widgets:{[ze]:A(ze,t=>new H(t),340)}};function je(t,e){let n=t.input?.optional;if(n)for(let r of Object.keys(n))e(r)&&delete n[r];t.input_order?.optional&&(t.input_order.optional=t.input_order.optional.filter(r=>!e(r)))}function Je(t,e){for(let n of["output","output_is_list","output_name","output_tooltips"])t[n]=t[n]?.slice(0,e)}var Ue=2,ne=12,re=8,Lt=(t,e)=>`c${t}_o${e}`,C=/^c(\d+)_o(\d+)$/,V=t=>`C${t}`,x=()=>({version:Ue,channels:2,outputs:1,active:0,mode:"fixed"}),te=(t,e,n,r)=>Number.isInteger(t)?Math.min(n,Math.max(e,t)):r;function Ke(t){if(typeof t=="string")try{t=JSON.parse(t)}catch{return x()}if(!_(t))return x();let e=x(),n=te(t.channels,1,ne,e.channels);return{version:Ue,channels:n,outputs:te(t.outputs,1,re,e.outputs),active:te(t.active,0,n-1,0),mode:t.mode==="cycle"?"cycle":"fixed"}}var qe=t=>(t.active+1)%t.channels;function Ge(t){let e=[];for(let n=0;n<t.channels;n++)for(let r=0;r<t.outputs;r++)e.push(Lt(n,r));return e}var Xe=`/* Source Switch panel. Shared controls and theme tokens live in shared/theme.css. */
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
`;function ie(t,e,n,r){let i=s("button.mt-icon-btn",{type:"button","aria-label":`Fewer ${t.toLowerCase()}`},"\u2212"),o=s("button.mt-icon-btn",{type:"button","aria-label":`More ${t.toLowerCase()}`},"+"),a=s("span.mt-stepper-count",{"aria-live":"polite"}),l=s("div.mt-stepper",{role:"group","aria-label":t},s("span.mt-stepper-label",{},t),i,a,o);return i.addEventListener("click",()=>r(-1)),o.addEventListener("click",()=>r(1)),{el:l,set(d){a.textContent=String(d),i.disabled=d<=e,o.disabled=d>=n}}}var b="*",O=t=>C.test(t),Mt=t=>Number(C.exec(t)[2]);function Nt(t,e){let n=Array.from({length:e.outputs},()=>b);return t.graph&&t.inputs.forEach((r,i)=>{if(!O(r.name))return;let o=t.getInputLink(i),a=Mt(r.name);o&&a<n.length&&n[a]===b&&o.type&&o.type!==b&&(n[a]=o.type)}),n}function Rt(t){let e=new Map;for(let n=t.inputs.length-1;n>=0;n--){let{name:r}=t.inputs[n];if(!O(r))continue;let i=t.getInputLink(n);i&&e.set(r,{originId:i.origin_id,originSlot:i.origin_slot}),t.removeInput(n)}return e}function It(t,e){for(let[n,{originId:r,originSlot:i}]of e){let o=t.graph?.getNodeById(r),a=t.inputs.findIndex(l=>l.name===n);o&&a>=0&&o.connect(i,t,a)}}function Qe(t,e){let n=Ge(e),r=new Set(n);for(let o=t.inputs.length-1;o>=0;o--){let{name:a}=t.inputs[o];O(a)&&!r.has(a)&&t.removeInput(o)}let i=t.inputs.filter(o=>O(o.name)).map(o=>o.name);if(i.every((o,a)=>n[a]===o))for(let o of n.slice(i.length))t.addInput(o,b);else{let o=Rt(t);for(let a of n)t.addInput(a,b);It(t,o)}for(;t.outputs.length>e.outputs;)t.removeOutput(t.outputs.length-1);for(;t.outputs.length<e.outputs;)t.addOutput(`out${t.outputs.length}`,b);oe(t,e)}function oe(t,e){let n=Nt(t,e),r=i=>n[i]!==b?n[i]:`out${i}`;for(let i of t.inputs){let o=C.exec(i.name);if(!o)continue;let a=Number(o[2]);i.label=`${V(Number(o[1]))} \xB7 ${r(a)}`,i.type=n[a]??b}t.outputs.forEach((i,o)=>{i.label=r(o),i.type=n[o]??b}),t.setDirtyCanvas(!0,!0)}var At="channel";function Ye(t){if(!t.graph)return!1;let e=t.inputs.findIndex(n=>n.name===At);return e>=0&&t.isInputConnected(e)}var P={rowHeight:26,gap:6,padding:6},se=P.rowHeight*2+P.gap+P.padding*2,F=class{constructor(e,n){this.events=e;this.node=n;for(let[i,o]of Object.entries(P))this.el.style.setProperty(`--ss-${i}`,`${o}px`);this.el.append(s("div.ss-row",{},s("label.ss-caption",{},"Channel"),this.select,this.modeBtn),s("div.ss-row",{},this.channels.el,this.outputs.el)),S(this.el),this.select.addEventListener("change",()=>this.update(()=>this.value.active=Number(this.select.value))),this.modeBtn.addEventListener("click",()=>this.update(()=>this.value.mode=this.value.mode==="cycle"?"fixed":"cycle"));let r=n.onConnectionsChange;n.onConnectionsChange=(...i)=>{r?.apply(n,i),oe(n,this.value),this.render()},this.render(),this.scheduleSync()}el=s("div.mt-root.ss-switch");minHeight=se;value=x();select=s("select.ss-select",{"aria-label":"Active channel"});modeBtn=s("button.mt-btn.ss-mode",{type:"button",title:"Switch to the next channel after each queued run"},"\u27F3 Cycle");channels=ie("Channels",1,ne,e=>this.update(()=>{this.value.channels+=e,this.value.active=Math.min(this.value.active,this.value.channels-1)},!0));outputs=ie("Outputs",1,re,e=>this.update(()=>this.value.outputs+=e,!0));syncQueued=!1;linked=!1;get data(){return this.value}setData(e){this.value=Ke(e),this.render(),this.scheduleSync()}afterQueued(){this.value.mode==="cycle"&&!this.linked&&this.update(()=>this.value.active=qe(this.value))}dispose(){}update(e,n=!1){e(),this.render(),n&&this.scheduleSync(),this.events.onChange(!1)}scheduleSync(e=30){this.syncQueued||(this.syncQueued=!0,requestAnimationFrame(()=>{if(this.syncQueued=!1,!this.node.graph){e>0&&this.scheduleSync(e-1);return}Qe(this.node,this.value),this.render(),this.events.onChange(!0)}))}render(){let{channels:e,outputs:n,active:r,mode:i}=this.value;this.linked=Ye(this.node);let o=`${e}:${this.linked}`;if(this.select.dataset.options!==o){this.select.dataset.options=o;let a=Array.from({length:e},(l,d)=>s("option",{value:d},V(d)));this.linked&&a.push(s("option",{value:"input"},"From input")),this.select.replaceChildren(...a)}this.select.value=this.linked?"input":String(r),this.select.disabled=this.linked,this.modeBtn.disabled=this.linked,this.modeBtn.title=this.linked?"Disabled while the channel input is connected":"Switch to the next channel after each queued run",this.modeBtn.setAttribute("aria-pressed",String(i==="cycle"&&!this.linked)),this.channels.set(e),this.outputs.set(n)}};var Ze="MARTI_SOURCE_SWITCH",Dt=4,et={styles:Xe,widgets:{[Ze]:A(Ze,(t,e)=>new F(t,e),300)},nodeId:"MartiSourceSwitch",patchDef(t){je(t,e=>C.test(e)),Je(t,x().outputs)},patchType(t){t.slot_start_y=se+Dt*2,Object.assign(t.prototype,{widgets_start_y:0})}};function _t(t){let e=Math.round(t/1e3);if(e<60)return`${e}s`;let n=Math.floor(e/60);return n<60?`${n}m ${e%60}s`:`${Math.floor(n/60)}h ${n%60}m`}function tt(t){let e=t.workflow||(t.ok?"ComfyUI job finished":"ComfyUI job failed");return t.durationMs!=null?`${e} \xB7 ${_t(t.durationMs)}`:e}function nt(t){if(t.ok)return"Done";let e=t.nodeType?` at ${t.nodeType}`:"",n=t.error?`: ${t.error.replace(/\s+/g," ").slice(0,300)}`:"";return`Failed${e}${n}`}function ae(t,e,n){return e=e.trim(),e?`${(t.trim()||"https://ntfy.sh").replace(/\/+$/,"")}/${encodeURIComponent(e)}?${new URLSearchParams(n)}`:null}function rt(t){return t.ok?{title:tt(t),tags:"white_check_mark"}:{title:tt(t),tags:"x",priority:"high"}}var le="Marti.Ntfy.Topic",it="Marti.Ntfy.Server",ot="Marti.Ntfy.Attach",st=[{id:le,category:["Marti","ntfy","Topic"],name:"ntfy topic",tooltip:"Notify this topic when a job finishes or fails. Leave empty to disable.",type:"text",defaultValue:""},{id:it,category:["Marti","ntfy","Server"],name:"ntfy server",type:"text",defaultValue:"https://ntfy.sh"},{id:ot,category:["Marti","ntfy","Attach"],name:"Attach the result image",tooltip:"Uploads the job's main saved output to ntfy. Anyone who knows the topic can see it.",type:"boolean",defaultValue:!0}],at=()=>f.extensionManager?.workflow;function $t(t){if(!t)return;let e=(at()?.openWorkflows??[]).filter(n=>(n.activeState?.id??n.initialState?.id)===t);return e.length===1?e[0].filename:void 0}var Ht=t=>new Promise(e=>setTimeout(e,t));async function Vt(t){for(let e=0;e<20;e++){try{let n=await h.fetchApi(`/jobs/${encodeURIComponent(t)}`);if(n.ok){let r=await n.json();if(r.status!=="pending"&&r.status!=="in_progress")return r}}catch{}await Ht(250)}}var Ot=t=>`/view?${new URLSearchParams({filename:t.filename,subfolder:t.subfolder??"",type:t.type??"output"})}`;function Pt(t){let e=t?.preview_output;if(!(!e||e.type!=="output"||e.mediaType==="text"))return e}async function Ft(t,e){let n=String(g(it)??""),r=String(g(le)??""),i=rt(t),o=nt(t);if(e&&g(ot)!==!1)try{let l=await h.fetchApi(Ot(e)),d=ae(n,r,{...i,message:o,filename:e.filename});if(d&&l.ok&&(await fetch(d,{method:"PUT",body:await l.blob()})).ok)return}catch(l){console.warn("[marti] ntfy attachment failed, sending text only",l)}let a=ae(n,r,i);a&&await fetch(a,{method:"POST",body:o})}function lt(){let t=new Map,e=i=>i.detail??{},n=async(i,o)=>{let a=i.prompt_id??"",l=t.get(a);if(t.delete(a),!String(g(le)??"").trim())return;let d=a?await Vt(a):void 0,c={ok:o,workflow:$t(d?.workflow_id)??l?.workflow,durationMs:l?Date.now()-l.start:void 0,nodeType:i.node_type,error:i.exception_message?.trim()};await Ft(c,o?Pt(d):void 0)},r=i=>i().catch(o=>console.warn("[marti] ntfy failed",o));h.addEventListener("execution_start",i=>{let o=e(i).prompt_id;o&&t.set(o,{start:Date.now(),workflow:at()?.activeWorkflow?.filename})}),h.addEventListener("execution_success",i=>r(()=>n(e(i),!0))),h.addEventListener("execution_error",i=>r(()=>n(e(i),!1)))}var dt=`/* Shared theme tokens and controls. Colors come from ComfyUI theme variables so every palette works. */
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
`;var W=[Be,et];function zt(){let t="comfyui-marti-styles";if(document.getElementById(t))return;let e=document.createElement("style");e.id=t,e.textContent=[dt,G,...W.map(n=>n.styles??"")].join(`
`),document.head.append(e)}f.registerExtension({name:"comfyui-marti",settings:[...st,...Ne],setup(){zt(),lt(),Re()},getCustomWidgets:()=>Object.assign({},...W.map(t=>t.widgets??{})),addCustomNodeDefs(t){for(let e of W){let n=e.nodeId?t[e.nodeId]:void 0;n&&e.patchDef?.(n)}},beforeRegisterNodeDef(t,e){W.find(n=>n.nodeId===e.name)?.patchType?.(t)}});
