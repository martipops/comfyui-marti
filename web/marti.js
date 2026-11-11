import{app as Ce}from"../../scripts/app.js";import{api as Le}from"../../scripts/api.js";var f=Ce;function g(e){return f.extensionManager?.setting?.get(e)??f.ui?.settings?.getSettingValue(e)}var h=Le;var q=new Map;function Te(e,t){let n=[],r=new Set,i=null,s=!1,a=new Set;async function l(){let c=await h.fetchApi(`/models/${encodeURIComponent(e)}`);if(!c.ok)throw new Error(`Failed to list models/${e} (${c.status})`);let m=await c.json();return Array.isArray(m)?m.filter(u=>typeof u=="string"):[]}function d(c=!1){return i&&!c||(i=l().then(m=>(n=m,r=new Set(m),s=!0,a.forEach(u=>u(n)),n)).catch(m=>(i=null,console.error("[comfyui-marti]",m),n))),i}return{noun:t,emptyText:`No ${t}s found in models/${e}`,list:()=>n,load:d,isMissing:c=>s&&c!==""&&!r.has(c),onChanged(c){return a.add(c),()=>a.delete(c)}}}function bt(e){q.get(e)?.load(!0)}function xt(e,t){let n=q.get(e);return n||q.set(e,n=Te(e,t)),n}var M="Marti.Models.CivitaiToken",N="Marti.Models.HfToken";function Me(){let e={},t=String(g(M)??"").trim(),n=String(g(N)??"").trim();return t&&(e["X-Marti-Civitai-Token"]=t),n&&(e["X-Marti-HF-Token"]=n),e}async function E(e,t){let n={headers:Me()};t!==void 0&&(n.method="POST",n.body=JSON.stringify(t),n.headers["Content-Type"]="application/json");let r=await h.fetchApi(e,n),i=await r.json().catch(()=>({}));if(!r.ok)throw new Error(i.error||`Request failed (${r.status})`);return i}var yt=()=>E("/marti/models/status"),wt=e=>E("/marti/models/resolve",{url:e}),kt=(e,t,n)=>E("/marti/models/download",{url:e,folder:t,filename:n}),St=e=>E("/marti/models/cancel",{id:e}),Et=()=>E("/marti/models/clear",{});function Ct(e,t,n,r=""){let i=new URLSearchParams({query:e,type:t,sort:n,cursor:r});return E(`/marti/civitai/search?${i}`)}function o(e,t={},...n){let[r,...i]=e.split("."),s=document.createElement(r);i.length&&(s.className=i.join(" "));for(let[a,l]of Object.entries(t))l===!1||l==null||s.setAttribute(a,l===!0?"":String(l));for(let a of n)a&&s.append(a);return s}function y(e,t=["pointerdown","wheel","keydown","contextmenu"]){for(let n of t)e.addEventListener(n,r=>r.stopPropagation())}function Lt(e,t,n,r,i){let s=new Set(n.map(d=>d.id));for(let d of t.keys())s.has(d)||t.delete(d);let a=n.map(d=>{let c=t.get(d.id);return c||t.set(d.id,c=r(d)),i(c,d),c.el}),l=e.children;(l.length!==a.length||a.some((d,c)=>l[c]!==d))&&e.replaceChildren(...a)}var Tt=[["","All types"],["Checkpoint","Checkpoint"],["LORA","LoRA"],["LoCon","LoCon"],["DoRA","DoRA"],["TextualInversion","Embedding"],["VAE","VAE"],["Controlnet","ControlNet"],["Upscaler","Upscaler"]],Mt=[["","Relevance"],["Most Downloaded","Most downloaded"],["Highest Rated","Highest rated"],["Newest","Newest"]],Nt=e=>e>=4;function v(e){if(!e||e<0)return"";let t=["B","KB","MB","GB","TB"],n=e,r=0;for(;n>=1024&&r<t.length-1;)n/=1024,r++;return`${n>=100||r===0?Math.round(n):n.toFixed(1).replace(/\.0$/,"")} ${t[r]}`}function Rt(e){return e<1e3?String(e):e<1e6?`${(e/1e3).toFixed(e<1e4?1:0).replace(/\.0$/,"")}k`:`${(e/1e6).toFixed(1).replace(/\.0$/,"")}M`}function It(e,t=160){return/\/(?:width=\d+|original=true)[^/]*\//.test(e)?e.replace(/\/(?:width=\d+|original=true)[^/]*\//,`/width=${t}/`):e}var G=(e,t)=>`https://civitai.com/models/${e}?modelVersionId=${t}`;function X(e){return e.status==="done"?1:e.size?Math.min(1,e.done/e.size):null}function At(e){switch(e.status){case"queued":return"Waiting\u2026";case"verifying":return"Checking file\u2026";case"done":return`Done \xB7 ${v(e.size??e.done)}`;case"cancelled":return"Cancelled";case"error":return e.error||"Failed"}let t=X(e);return[t!=null?`${Math.floor(t*100)}%`:"",e.size?`${v(e.done)} of ${v(e.size)}`:v(e.done),e.speed?`${v(e.speed)}/s`:""].filter(Boolean).join(" \xB7 ")}var Q=e=>e==="queued"||e==="downloading"||e==="verifying";var Y="Marti.Models.BlurNsfw",Ne={civitai:"Civitai",hf:"Hugging Face",url:"Direct link"},Dt=(e,t)=>o("select.md-select",{"aria-label":t},...e.map(([n,r])=>o("option",{value:n},r))),_=class{constructor(t){this.onFinished=t;let n=o("form.md-row",{},this.linkInput,this.checkBtn);n.addEventListener("submit",s=>{s.preventDefault(),this.check()}),this.linkInput.addEventListener("paste",()=>setTimeout(()=>void this.check(),0));let r=o("button.mt-btn",{type:"button"},"Clear finished");r.addEventListener("click",async()=>{let{jobs:s}=await Et();this.setJobs(s)}),this.jobsSection.append(o("div.md-heading",{},o("span",{},"Downloads"),r),this.jobList);let i=o("form.md-row",{},this.searchInput,o("button.mt-btn",{type:"submit"},"Search"));i.addEventListener("submit",s=>{s.preventDefault(),this.search(!1)});for(let s of[this.typeSelect,this.sortSelect])s.addEventListener("change",()=>this.searched&&void this.search(!1));this.moreBtn.addEventListener("click",()=>void this.search(!0)),this.root.append(o("section.md-section",{},o("div.md-heading",{},o("span",{},"Download a model")),n,this.tokens,this.linkError,this.preview),this.jobsSection,o("section.md-section",{},o("div.md-heading",{},o("span",{},"Search Civitai")),i,o("div.md-row",{},this.typeSelect,this.sortSelect),this.results,this.searchStatus,this.moreBtn))}root=o("div.mt-root.md-panel");linkInput=o("input.md-input",{type:"text",placeholder:"Civitai or Hugging Face link",spellcheck:!1,autocomplete:"off"});checkBtn=o("button.mt-btn",{type:"submit"},"Check");tokens=o("div.md-tokens");preview=o("div.md-card.md-preview",{hidden:!0});linkError=o("div.md-error",{hidden:!0});jobsSection=o("section.md-section",{hidden:!0});jobList=o("div.md-jobs");jobViews=new Map;jobs=new Map;searchInput=o("input.md-input",{type:"search",placeholder:"Search Civitai",spellcheck:!1,autocomplete:"off"});typeSelect=Dt(Tt,"Model type");sortSelect=Dt(Mt,"Sort");results=o("div.md-results");searchStatus=o("div.md-muted",{hidden:!0});moreBtn=o("button.mt-btn.md-more",{type:"button",hidden:!0},"Load more");status=null;lastFolder="";resolveSeq=0;searchSeq=0;nextCursor=null;searched=!1;async refresh(){try{this.status=await yt(),this.setJobs(this.status.jobs)}catch(t){this.showLinkError(`Model download API unavailable: ${t.message}`)}this.renderTokens()}updateJob(t){let n=this.jobs.get(t.id);this.jobs.set(t.id,t),this.renderJob(t),t.status==="done"&&n?.status!=="done"&&(this.onFinished(t),this.preview.dataset.filename===t.filename&&this.check())}renderTokens(){let t=this.status?.env,n=(r,i,s)=>{let a=String(g(s)??"").trim()!=="";return o(`span.md-token${i||a?".md-ok":""}`,{title:i?"Read from the server's environment":"Set one in Settings \u2192 Marti \u2192 Models"},`${r}: ${i?"server token":a?"token from Settings":"no token"}`)};this.tokens.replaceChildren(n("Civitai",t?.civitai,M),n("HF",t?.hf,N))}showLinkError(t){this.linkError.textContent=t??"",this.linkError.hidden=!t}async check(){let t=this.linkInput.value.trim();if(!t)return;let n=++this.resolveSeq;this.checkBtn.disabled=!0,this.showLinkError(null),this.preview.hidden=!0;try{this.status||await this.refresh();let r=await wt(t);n===this.resolveSeq&&this.renderPreview(t,r)}catch(r){n===this.resolveSeq&&this.showLinkError(r.message)}finally{n===this.resolveSeq&&(this.checkBtn.disabled=!1)}}renderPreview(t,n){let r=this.status?.folders??[],i=o("select.md-select",{"aria-label":"Folder"},...r.map(u=>o("option",{value:u},u)));i.value=n.folder??(r.includes(this.lastFolder)?this.lastFolder:r[0]??"");let s=o("input.md-input",{type:"text",value:n.filename,spellcheck:!1,"aria-label":"File name"}),a=o("div.md-note"),l=o("button.mt-btn.md-primary",{type:"button"},"Download"),d=()=>{let u=s.value===n.filename&&n.exists.includes(i.value);a.textContent=u?`Already in models/${i.value}`:"",a.hidden=!u,l.disabled=u||!s.value.trim()||!i.value};i.addEventListener("change",d),s.addEventListener("input",d),d(),l.addEventListener("click",async()=>{l.disabled=!0,this.showLinkError(null);try{this.lastFolder=i.value,this.updateJob(await kt(t,i.value,s.value.trim())),this.preview.hidden=!0,this.linkInput.value=""}catch(u){this.showLinkError(u.message),l.disabled=!1}});let c=n.page?o("a.md-title",{href:n.page,target:"_blank",rel:"noopener noreferrer"},n.name):o("div.md-title",{},n.name),m=[Ne[n.source],v(n.size),n.sha256?"checksum \u2713":""].filter(Boolean).join(" \xB7 ");this.preview.dataset.filename=n.filename,this.preview.replaceChildren(c,o("div.md-muted",{},m),o("label.md-field",{},o("span",{},"Folder"),i),o("label.md-field",{},o("span",{},"Save as"),s),a,l),this.preview.hidden=!1}setJobs(t){let n=new Set(t.map(r=>r.id));for(let r of[...this.jobs.keys()])n.has(r)||(this.jobs.delete(r),this.jobViews.get(r)?.el.remove(),this.jobViews.delete(r));for(let r of t)this.jobs.set(r.id,r),this.renderJob(r);this.jobsSection.hidden=this.jobs.size===0}renderJob(t){let n=this.jobViews.get(t.id);if(!n){let i=o("div.md-bar-fill"),s=o("div.md-job-text"),a=o("button.mt-icon-btn",{type:"button",title:"Cancel","aria-label":"Cancel download"},"\xD7");a.addEventListener("click",()=>void St(t.id));let l=o("div.md-job",{},o("div.md-job-head",{},o("div.md-job-name",{title:t.name},t.name),a),o("div.md-muted.md-ellipsis",{title:`models/${t.folder}/${t.filename}`},`${t.folder}/${t.filename}`),o("div.md-bar",{},i),s);n={el:l,bar:i,text:s,cancel:a},this.jobViews.set(t.id,n),this.jobList.prepend(l)}let r=X(t);n.el.dataset.status=t.status,n.bar.style.width=r==null?"100%":`${r*100}%`,n.bar.classList.toggle("md-indeterminate",r==null&&Q(t.status)),n.text.textContent=At(t),n.cancel.hidden=!Q(t.status),this.jobsSection.hidden=!1}async search(t){let n=++this.searchSeq;this.searched=!0,this.moreBtn.hidden=!0,this.setSearchStatus("Searching\u2026"),t||(this.nextCursor=null,this.results.replaceChildren());try{let r=await Ct(this.searchInput.value,this.typeSelect.value,this.sortSelect.value,t?this.nextCursor??"":"");if(n!==this.searchSeq)return;this.results.append(...r.items.map(i=>this.renderResult(i))),this.nextCursor=r.nextCursor,this.moreBtn.hidden=!r.nextCursor,this.setSearchStatus(this.results.childElementCount?"":"No models found")}catch(r){n===this.searchSeq&&this.setSearchStatus(r.message)}}setSearchStatus(t){this.searchStatus.textContent=t,this.searchStatus.hidden=!t}renderResult(t){let n=t.thumb?o("img.md-thumb",{src:It(t.thumb.url),alt:"",loading:"lazy",referrerpolicy:"no-referrer"}):o("div.md-thumb");t.thumb&&Nt(t.thumb.nsfwLevel)&&g(Y)!==!1&&(n.classList.add("md-blur"),n.title="Click to reveal",n.addEventListener("click",()=>n.classList.remove("md-blur"),{once:!0}));let r=o("select.md-select",{"aria-label":"Version"},...t.versions.map(l=>o("option",{value:l.id},[l.name,l.baseModel].filter(Boolean).join(" \xB7 ")))),i=o("span",{},v(t.versions[0]?.size));r.addEventListener("change",()=>{i.textContent=v(t.versions.find(l=>String(l.id)===r.value)?.size)});let s=o("button.mt-btn.md-primary",{type:"button"},"Get");s.addEventListener("click",()=>{this.linkInput.value=G(t.id,Number(r.value)),this.root.scrollTo({top:0,behavior:"smooth"}),this.check()});let a=G(t.id,t.versions[0].id);return o("div.md-card.md-result",{},n,o("div.md-result-body",{},o("a.md-title",{href:a,target:"_blank",rel:"noopener noreferrer",title:t.name},t.name),o("div.md-muted",{},[t.type,t.creator&&`by ${t.creator}`,`\u2193 ${Rt(t.downloads)}`].filter(Boolean).join(" \xB7 ")),t.versions.length>1?r:o("div.md-muted",{},r.options[0]?.textContent??""),o("div.md-row.md-result-actions",{},o("span.md-muted",{},i),s)))}};var Z=`/* Models sidebar tab. Shared controls and theme tokens live in shared/theme.css. */
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
`;var _t=e=>`Only used when the server has no ${e} environment variable (on Vast, set ${e} on the instance instead).`,Ht=[{id:M,category:["Marti","Models","Civitai token"],name:"Civitai API token",tooltip:_t("CIVITAI_TOKEN"),type:"text",defaultValue:""},{id:N,category:["Marti","Models","HF token"],name:"Hugging Face token",tooltip:_t("HF_TOKEN"),type:"text",defaultValue:""},{id:Y,category:["Marti","Models","Blur NSFW"],name:"Blur NSFW thumbnails in Civitai search",tooltip:"Click a thumbnail to reveal it.",type:"boolean",defaultValue:!0}];function Ie(e){f.refreshComboInNodes?.(),bt(e.folder),f.extensionManager?.toast?.add({severity:"success",summary:"Model downloaded",detail:`models/${e.folder}/${e.filename}`,life:5e3})}function $t(){let e=new _(Ie);h.addEventListener("marti.download",t=>{let n=t.detail;e.updateJob(n),n.status==="error"&&f.extensionManager?.toast?.add({severity:"error",summary:"Download failed",detail:`${n.filename}: ${n.error}`,life:8e3})}),f.extensionManager?.registerSidebarTab?.({id:"marti-models",icon:"pi pi-download",title:"Models",tooltip:"Download models",type:"custom",render(t){t.append(e.root),e.refresh()}})}function C(e,t,n){return(r,i)=>{let s=()=>{let c=r.computeSize()[1];r.setSize([r.size[0],a.stretches?Math.max(r.size[1],c):c])},a=t({onChange(c){c&&s(),r.setDirtyCanvas(!0,!0)}},r),l=r.addDOMWidget(i,e,a.el,{getValue:()=>a.data,setValue:c=>a.setData(c),getMinHeight:()=>a.minHeight,hideOnZoom:!0,margin:4});a.afterQueued&&Object.assign(l,{afterQueued:()=>a.afterQueued()});let d=r.onRemoved;return r.onRemoved=function(){a.dispose(),d?.call(this)},requestAnimationFrame(s),{widget:l,minWidth:n}}}function H(e){let t=e.replace(/\\/g,"/"),n=t.lastIndexOf("/");return{name:t.slice(n+1).replace(/\.(safetensors|ckpt|pt|pth|bin)$/i,""),folder:n>=0?t.slice(0,n):""}}function Ot(e,t){if(!e)return 0;let n=e.toLowerCase(),r=t.toLowerCase(),i=r.lastIndexOf("/")+1,s=r.indexOf(n,i);if(s>=0)return 1e3-(s-i)-r.length*.01;let a=r.indexOf(n);if(a>=0)return 500-a-r.length*.01;let l=0,d=0,c=0;for(let m of n){let u=r.indexOf(m,d);if(u<0)return-1;c=u===d?c+1:0,l+=1+c*2+(u>=i?1:0),d=u+1}return l}var Ae=200,tt=class{root=o("div.mt-picker",{role:"dialog"});search=o("input.mt-picker-search",{type:"search",spellcheck:!1,autocomplete:"off",role:"combobox","aria-expanded":!0,"aria-controls":"mt-picker-list"});refresh=o("button.mt-icon-btn",{type:"button",title:"Rescan"},"\u27F3");list=o("ul.mt-picker-list",{id:"mt-picker-list",role:"listbox"});status=o("div.mt-picker-status");options=null;results=[];active=0;constructor(){this.root.append(o("div.mt-picker-head",{},this.search,this.refresh),this.list,this.status),y(this.root),this.search.addEventListener("input",()=>this.filter()),this.search.addEventListener("keydown",t=>this.onKey(t)),this.refresh.addEventListener("click",async()=>{this.setStatus("Rescanning\u2026"),await this.options?.source.load(!0),this.filter()}),this.list.addEventListener("pointerdown",t=>t.preventDefault()),this.list.addEventListener("click",t=>{let n=t.target.closest("[data-index]");n&&this.choose(Number(n.dataset.index))}),this.list.addEventListener("pointermove",t=>{let n=t.target.closest("[data-index]");n&&this.highlight(Number(n.dataset.index),!1)})}open(t){this.options=t;let{noun:n}=t.source;this.root.setAttribute("aria-label",`Choose ${n}`),this.search.placeholder=`Search ${n}s\u2026`,this.root.isConnected||document.body.append(this.root),this.root.hidden=!1,this.search.value="",this.position(t.anchor),this.filter(),this.search.focus(),document.addEventListener("pointerdown",this.onOutside,!0),window.addEventListener("blur",this.close),t.source.list().length||(this.setStatus("Loading\u2026"),t.source.load().then(()=>this.options===t&&this.filter()))}close=()=>{this.options&&(this.options=null,this.root.hidden=!0,document.removeEventListener("pointerdown",this.onOutside,!0),window.removeEventListener("blur",this.close))};onOutside=t=>{this.root.contains(t.target)||this.close()};position(t){let n=t.getBoundingClientRect(),r=Math.max(n.width,320),i=360,s=window.innerHeight-n.bottom,a=s>=i||s>=n.top?n.bottom+4:Math.max(8,n.top-i-4),l=Math.min(Math.max(8,n.left),window.innerWidth-r-8);Object.assign(this.root.style,{top:`${a}px`,left:`${l}px`,width:`${r}px`,maxHeight:`${i}px`})}filter(){let t=this.search.value.trim();if(!this.options)return;let n=this.options.source.list(),r=t?n.map(a=>[a,Ot(t,a)]).filter(([,a])=>a>=0).sort((a,l)=>l[1]-a[1]).map(([a])=>a):n;this.results=r.slice(0,Ae),this.render();let i=this.options?.current?this.results.indexOf(this.options.current):-1;this.highlight(i>=0&&!t?i:0,!0);let s=r.length-this.results.length;this.setStatus(n.length?this.results.length?s>0?`${s} more \u2014 refine your search`:"":"No matches":this.options.source.emptyText)}render(){let{current:t,inUse:n}=this.options??{};this.list.replaceChildren(...this.results.map((r,i)=>{let{name:s,folder:a}=H(r);return o(`li.mt-picker-item${r===t?".mt-current":""}`,{role:"option","data-index":i,title:r},o("span.mt-picker-name",{},s),a?o("span.mt-picker-folder",{},a):null,n?.has(r)?o("span.mt-picker-badge",{title:"Already in this deck"},"in deck"):null)}))}highlight(t,n){if(!this.results.length)return;this.active=(t+this.results.length)%this.results.length,this.list.querySelector(".mt-active")?.classList.remove("mt-active");let r=this.list.children[this.active];r?.classList.add("mt-active"),r&&this.search.setAttribute("aria-activedescendant",r.id=`mt-opt-${this.active}`),n&&r?.scrollIntoView({block:"nearest"})}choose(t){let n=this.results[t],r=this.options;!n||!r||(this.close(),r.onPick(n))}onKey(t){let n={ArrowDown:1,ArrowUp:-1,PageDown:8,PageUp:-8};if(t.key in n)t.preventDefault(),this.highlight(this.active+n[t.key],!0);else if(t.key==="Enter")t.preventDefault(),this.choose(this.active);else if(t.key==="Escape"){t.preventDefault();let r=this.options?.anchor;this.close(),r?.focus()}}setStatus(t){this.status.textContent=t,this.status.hidden=!t}},De=null,et=e=>(De??=new tt).open(e);function L(e,t,n=e.default){let r=typeof t=="number"?t:Number.parseFloat(String(t));if(!Number.isFinite(r))return n;let i=Number(r.toFixed(e.precision+1));return Math.min(e.max,Math.max(e.min,i))}var nt=(e,t)=>t.toFixed(e.precision);var _e=3,He=.01,$e=2;function Vt(e,t,n){let r=o("span.mt-scrub-fill"),i=o("span.mt-scrub-text"),s=o("input.mt-scrub-input",{type:"text",inputmode:"decimal","aria-label":e}),a=o("div.mt-scrub",{tabindex:0,role:"spinbutton","aria-label":e,"aria-valuemin":t.min,"aria-valuemax":t.max},r,i,s),l=t.default,d=()=>{i.textContent=nt(t,l),a.setAttribute("aria-valuenow",String(l));let p=Math.min(1,Math.abs(l)/$e)*100;r.style.width=`${p}%`,a.classList.toggle("mt-negative",l<0),a.classList.toggle("mt-zero",l===0)},c=(p,w)=>{p=L(t,p,l),!(p===l&&!w)&&(l=p,d(),n(l,w))},m=p=>p.shiftKey?.1:p.ctrlKey||p.metaKey?10:1;a.addEventListener("pointerdown",p=>{if(p.button!==0||a.classList.contains("mt-editing"))return;p.preventDefault();let w=p.clientX,Se=l,J=!1;a.setPointerCapture(p.pointerId);let ft=K=>{let gt=K.clientX-w;if(!J&&Math.abs(gt)<_e)return;J=!0,a.classList.add("mt-scrubbing");let Ee=Se+gt*He*m(K),vt=K.shiftKey?t.step/5:t.step;c(Math.round(Ee/vt)*vt,!1)},D=()=>{a.removeEventListener("pointermove",ft),a.removeEventListener("pointerup",D),a.removeEventListener("pointercancel",D),a.classList.remove("mt-scrubbing"),J?c(l,!0):u()};a.addEventListener("pointermove",ft),a.addEventListener("pointerup",D),a.addEventListener("pointercancel",D)}),a.addEventListener("dblclick",()=>{A(!1),c(t.default,!0)}),a.addEventListener("keydown",p=>{if(a.classList.contains("mt-editing"))return;let w=p.key==="ArrowUp"||p.key==="ArrowRight"?1:p.key==="ArrowDown"||p.key==="ArrowLeft"?-1:0;w?(p.preventDefault(),c(l+w*t.step*m(p),!0)):p.key==="Enter"&&(p.preventDefault(),u())});function u(){a.classList.add("mt-editing"),s.value=nt(t,l),s.focus(),s.select()}function A(p){a.classList.contains("mt-editing")&&(a.classList.remove("mt-editing"),p&&c(L(t,s.value,l),!0))}return s.addEventListener("keydown",p=>{p.stopPropagation(),p.key==="Enter"?(A(!0),a.focus()):p.key==="Escape"&&(A(!1),a.focus())}),s.addEventListener("blur",()=>A(!0)),s.addEventListener("pointerdown",p=>p.stopPropagation()),d(),{el:a,set(p){l=L(t,p),d()}}}function rt(e){let t=o("button.mt-toggle",{type:"button",role:"switch","aria-label":e},o("span.mt-toggle-knob"));return{el:t,set(n,r=!1){t.setAttribute("aria-checked",r?"mixed":String(n))}}}function Pt(e,t){let n=null,r=()=>{n=null,window.removeEventListener("pointerup",r)};e.addEventListener("pointerdown",i=>{if(i.button!==0)return;let s=t(i.target);s&&(i.preventDefault(),n=!s.current,s.apply(n),window.addEventListener("pointerup",r))}),e.addEventListener("pointerover",i=>{if(n===null||!(i.buttons&1))return;let s=t(i.target);s&&s.current!==n&&s.apply(n)}),e.addEventListener("keydown",i=>{if(i.key!==" "&&i.key!=="Enter")return;let s=t(i.target);s&&(i.preventDefault(),s.apply(!s.current))})}var it=()=>Math.random().toString(36).slice(2,10);function Ft(e){if(typeof e=="string")try{e=JSON.parse(e)}catch{return[]}let t=e?.rows;return Array.isArray(t)?t:[]}var $=e=>e!==null&&typeof e=="object"&&!Array.isArray(e);var Wt=1,O={min:-10,max:10,step:.05,default:1,precision:2},Bt=()=>({version:Wt,rows:[]});function jt(e,t={}){return{id:it(),on:!0,lora:e,strength:O.default,strengthClip:null,...t}}var zt=(e,t)=>L(O,e,t);function Oe(e){return!$(e)||typeof e.lora!="string"?null:{id:typeof e.id=="string"&&e.id?e.id:it(),on:e.on!==!1,lora:e.lora.trim(),strength:zt(e.strength),strengthClip:e.strengthClip==null?null:zt(e.strengthClip)}}function Ut(e){return{version:Wt,rows:Ft(e).map(Oe).filter(t=>t!==null)}}var Jt=e=>e.on&&e.lora!==""&&(e.strength!==0||(e.strengthClip??0)!==0);var R=xt("loras","LoRA"),k={headerHeight:30,rowHeight:30,rowGap:4,emptyHeight:44,padding:6},V=class{constructor(t){this.events=t;for(let[n,r]of Object.entries(k))this.el.style.setProperty(`--ld-${n}`,`${r}px`);this.masterToggle.el.classList.add("ld-master"),this.el.append(o("div.ld-header",{},this.masterToggle.el,this.countEl,this.addBtn),this.rowsEl,this.emptyEl),y(this.el),this.addBtn.addEventListener("click",()=>this.pickNew(this.addBtn)),this.emptyEl.addEventListener("click",()=>this.pickNew(this.emptyEl)),this.masterToggle.el.addEventListener("click",()=>{let n=!this.value.rows.every(r=>r.on);this.mutate(()=>this.value.rows.forEach(r=>r.on=n))}),Pt(this.rowsEl,n=>{let r=this.rowFromEvent(n,".mt-toggle");return r&&{current:r.on,apply:i=>this.mutate(()=>r.on=i)}}),this.rowsEl.addEventListener("click",n=>this.onRowClick(n)),this.unsubscribe=R.onChanged(()=>this.render()),R.load(),this.render()}el=o("div.mt-root.ld-deck");value=Bt();views=new Map;rowsEl=o("div.ld-rows",{role:"list"});masterToggle=rt("Toggle all LoRAs");countEl=o("span.ld-count");addBtn=o("button.mt-btn.ld-add",{type:"button",title:"Add a LoRA"},"+ Add LoRA");emptyEl=o("button.ld-empty",{type:"button"},"No LoRAs yet \u2014 click to add one");unsubscribe;get data(){return this.value}setData(t){this.value=Ut(t),this.render()}get minHeight(){let t=this.value.rows.length,n=t?t*k.rowHeight+(t-1)*k.rowGap:k.emptyHeight;return k.headerHeight+k.rowGap+n+k.padding*2}dispose(){this.unsubscribe()}mutate(t,n=!1){t(),this.render(),this.events.onChange(n)}findRow(t){return t?this.value.rows.find(n=>n.id===t):void 0}rowFromEvent(t,n){let r=t?.closest?.(n);return r?this.findRow(r.closest(".ld-row")?.dataset.id):void 0}pickNew(t){et({source:R,anchor:t,inUse:new Set(this.value.rows.map(n=>n.lora)),onPick:n=>this.mutate(()=>this.value.rows.push(jt(n)),!0)})}onRowClick(t){let n=t.target,r=this.rowFromEvent(n,".ld-row");r&&(n.closest(".ld-remove")?this.mutate(()=>this.value.rows=this.value.rows.filter(i=>i!==r),!0):n.closest(".ld-name")&&et({source:R,anchor:this.views.get(r.id).name,current:r.lora,inUse:new Set(this.value.rows.map(i=>i.lora)),onPick:i=>this.mutate(()=>r.lora=i)}))}render(){let{rows:t}=this.value;Lt(this.rowsEl,this.views,t,r=>this.createRowView(r),(r,i)=>this.updateRowView(r,i));let n=t.filter(Jt).length;this.masterToggle.set(t.length>0&&n===t.length,n>0&&n<t.length),this.masterToggle.el.disabled=t.length===0,this.countEl.textContent=t.length?`${n} of ${t.length} active`:"",this.emptyEl.hidden=t.length>0,this.rowsEl.hidden=t.length===0}createRowView(t){let n=rt("Enable LoRA"),r=o("button.ld-name",{type:"button"}),{id:i}=t,s=Vt("Strength",O,(d,c)=>{let m=this.findRow(i);m&&(m.strength=d,c?this.mutate(()=>{}):this.render())}),a=o("button.mt-icon-btn.ld-remove",{type:"button",title:"Remove","aria-label":"Remove LoRA"},"\xD7");return{el:o("div.ld-row",{role:"listitem","data-id":t.id},n.el,r,s.el,a),toggle:n,name:r,scrubber:s}}updateRowView(t,n){let{name:r,folder:i}=H(n.lora),s=R.isMissing(n.lora);t.toggle.set(n.on),t.scrubber.set(n.strength),t.el.classList.toggle("ld-off",!n.on),t.el.classList.toggle("ld-missing",s),t.name.title=s?`Not found in models/loras: ${n.lora}`:n.lora||"Choose a LoRA",t.name.replaceChildren(o("span.ld-name-text",{},r||"Choose a LoRA\u2026"),i?o("span.ld-name-folder",{},i):"",s?o("span.ld-warn",{"aria-hidden":!0},"\u26A0"):"")}};var Kt=`/* LoRA Deck layout. Shared controls and theme tokens live in shared/theme.css. */
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

`;var qt="LORA_DECK",Gt={styles:Kt,widgets:{[qt]:C(qt,e=>new V(e),340)}};var Pe=40,ot=160,Fe=480,Qt=10,Yt=32,ze=17,Zt="marti.prompt.fontSize",I="marti-prompt-font",We=e=>e.split(/\s+/).filter(Boolean).length,b=Number(localStorage.getItem(Zt))||ze;document.documentElement.style.setProperty("--mp-font",`${b}px`);function Xt(e){b=Math.min(Math.max(e,Qt),Yt),localStorage.setItem(Zt,String(b)),document.documentElement.style.setProperty("--mp-font",`${b}px`),window.dispatchEvent(new Event(I))}var P=class{down=o("button.mt-btn.mp-btn.mp-font-btn",{type:"button",title:"Smaller text"},"A\u2212");up=o("button.mt-btn.mp-btn.mp-font-btn",{type:"button",title:"Bigger text"},"A+");label=o("span.mp-font-size");el=o("span.mp-font",{},this.down,this.label,this.up);sync=()=>{this.label.textContent=String(b),this.down.disabled=b<=Qt,this.up.disabled=b>=Yt};constructor(){this.el.addEventListener("mousedown",t=>t.preventDefault()),this.down.addEventListener("click",()=>Xt(b-1)),this.up.addEventListener("click",()=>Xt(b+1)),window.addEventListener(I,this.sync),this.sync()}dispose(){window.removeEventListener(I,this.sync)}},F=class{constructor(t){this.events=t;this.el.append(this.text,o("div.mp-toolbar",{},this.font.el,this.count,this.fullBtn)),this.el.style.setProperty("--mp-min",`${ot}px`),y(this.el),this.text.addEventListener("input",()=>this.edit(this.text.value)),this.fullBtn.addEventListener("click",()=>this.openSheet()),window.addEventListener(I,this.onFont),this.resizeObserver.observe(this.text),this.render()}el=o("div.mt-root.mp-prompt");stretches=!0;text=o("textarea.mp-text",{placeholder:"Prompt\u2026",rows:1,"aria-label":"Prompt"});count=o("span.mp-count");font=new P;onFont=()=>this.render();fullBtn=o("button.mt-btn.mp-btn",{type:"button",title:"Edit full screen"},"\u2922 Full");value="";textHeight=ot;lastWidth=0;resizeObserver=new ResizeObserver(()=>{this.text.clientWidth!==this.lastWidth&&this.autosize()});sheet=null;get data(){return this.value}get minHeight(){return this.textHeight+Pe}setData(t){this.value=typeof t=="string"?t:"",this.render()}dispose(){this.resizeObserver.disconnect(),window.removeEventListener(I,this.onFont),this.font.dispose(),this.sheet?.close()}edit(t){this.value=t,this.render(),this.events.onChange(!1)}render(){this.text.value!==this.value&&(this.text.value=this.value);let t=We(this.value);this.count.textContent=`${t} ${t===1?"word":"words"}`,this.autosize()}autosize(){this.lastWidth=this.text.clientWidth,this.text.style.flexGrow="0",this.text.style.height="0px";let t=Math.min(Math.max(this.text.scrollHeight,ot),Fe);this.text.style.height=`${t}px`,this.text.style.flexGrow="",t!==this.textHeight&&(this.textHeight=t,this.events.onChange(!0))}openSheet(){this.sheet=new st(this.value,t=>this.edit(t),()=>{this.sheet=null,this.text.scrollTop=this.text.scrollHeight})}},st=class{constructor(t,n,r){this.onClose=r;this.text.value=t,this.text.addEventListener("input",()=>n(this.text.value)),this.done.addEventListener("click",()=>this.close()),this.el.addEventListener("keydown",i=>{i.stopPropagation(),i.key==="Escape"&&this.close()}),window.visualViewport?.addEventListener("resize",this.fit),window.visualViewport?.addEventListener("scroll",this.fit),document.body.append(this.el),this.fit(),this.text.focus(),this.text.setSelectionRange(t.length,t.length)}text=o("textarea.mp-text.mp-sheet-text",{"aria-label":"Prompt"});font=new P;done=o("button.mp-done",{type:"button"},"Done");el=o("div.mt-root.mp-sheet",{role:"dialog","aria-modal":"true","aria-label":"Edit prompt"},o("div.mp-sheet-bar",{},o("span.mp-sheet-title",{},"Prompt"),this.font.el,this.done),this.text);fit=()=>{let t=window.visualViewport;t&&(this.el.style.top=`${t.offsetTop}px`,this.el.style.height=`${t.height}px`)};close(){window.visualViewport?.removeEventListener("resize",this.fit),window.visualViewport?.removeEventListener("scroll",this.fit),this.font.dispose(),this.el.remove(),this.onClose()}};var te=`/* Marti Prompt. --mp-font is set from the A\u2212/A+ buttons (promptView.ts). */
.mp-prompt {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.mp-text {
  display: block;
  flex: 1 0 auto;
  width: 100%;
  min-height: var(--mp-min);
  padding: 10px 12px;
  border-radius: var(--mt-radius) var(--mt-radius) 0 0;
  border: 1px solid var(--mt-border);
  background: var(--mt-bg);
  color: var(--mt-fg);
  font: var(--mp-font, 17px)/1.5 system-ui, sans-serif;
  resize: none !important;
  overflow-y: auto;
}
.mp-text:focus {
  outline: none;
  border-color: var(--mt-accent);
}
.mp-toolbar {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 4px 0 12px;
  border: 1px solid var(--mt-border);
  border-top: 0;
  border-radius: 0 0 var(--mt-radius) var(--mt-radius);
  background: var(--mt-bg);
}
.mp-count {
  flex: 1;
  text-align: right;
  color: var(--mt-muted);
  font-size: 13px;
}
.mt-root .mp-btn {
  height: 32px;
  min-width: 64px;
  font-size: 14px;
}
.mp-font {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mt-root .mp-font-btn {
  min-width: 40px;
}
.mt-root .mp-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
.mp-font-size {
  min-width: 2ch;
  text-align: center;
  color: var(--mt-muted);
  font-size: 13px;
}

.mp-sheet {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 100dvh;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  background: var(--comfy-menu-bg, #151517);
  overscroll-behavior: contain;
}
.mp-sheet-bar {
  /* Title left, size buttons centered, Done right. */
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  flex: none;
  height: 56px;
  padding: 0 12px 0 16px;
  padding-top: env(safe-area-inset-top);
  box-sizing: content-box;
  border-bottom: 1px solid var(--mt-border);
}
.mp-sheet-title {
  font-size: 17px;
  font-weight: 600;
}
.mp-sheet .mp-done {
  justify-self: end;
  height: 40px;
  padding: 0 18px;
  border-radius: 10px;
  background: var(--mt-accent);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}
.mp-sheet .mp-sheet-text {
  flex: 1;
  height: auto;
  min-height: 0;
  border: 0;
  border-radius: 0;
  padding: 16px max(16px, env(safe-area-inset-left)) 16px max(16px, env(safe-area-inset-right));
}
/* iOS Safari zooms the page into any field with text under 16px. */
@media (pointer: coarse) {
  .mp-text {
    font-size: max(16px, var(--mp-font, 17px));
  }
}
`;var ee="MARTI_PROMPT",ne={styles:te,widgets:{[ee]:C(ee,e=>new F(e),280)}};function re(e,t){let n=e.input?.optional;if(n)for(let r of Object.keys(n))t(r)&&delete n[r];e.input_order?.optional&&(e.input_order.optional=e.input_order.optional.filter(r=>!t(r)))}function ie(e,t){for(let n of["output","output_is_list","output_name","output_tooltips"])e[n]=e[n]?.slice(0,t)}var oe=2,lt=12,dt=8,je=(e,t)=>`c${e}_o${t}`,T=/^c(\d+)_o(\d+)$/,z=e=>`C${e}`,S=()=>({version:oe,channels:2,outputs:1,active:0,mode:"fixed"}),at=(e,t,n,r)=>Number.isInteger(e)?Math.min(n,Math.max(t,e)):r;function se(e){if(typeof e=="string")try{e=JSON.parse(e)}catch{return S()}if(!$(e))return S();let t=S(),n=at(e.channels,1,lt,t.channels);return{version:oe,channels:n,outputs:at(e.outputs,1,dt,t.outputs),active:at(e.active,0,n-1,0),mode:e.mode==="cycle"?"cycle":"fixed"}}var ae=e=>(e.active+1)%e.channels;function le(e){let t=[];for(let n=0;n<e.channels;n++)for(let r=0;r<e.outputs;r++)t.push(je(n,r));return t}var de=`/* Source Switch panel. Shared controls and theme tokens live in shared/theme.css. */
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
`;function ct(e,t,n,r){let i=o("button.mt-icon-btn",{type:"button","aria-label":`Fewer ${e.toLowerCase()}`},"\u2212"),s=o("button.mt-icon-btn",{type:"button","aria-label":`More ${e.toLowerCase()}`},"+"),a=o("span.mt-stepper-count",{"aria-live":"polite"}),l=o("div.mt-stepper",{role:"group","aria-label":e},o("span.mt-stepper-label",{},e),i,a,s);return i.addEventListener("click",()=>r(-1)),s.addEventListener("click",()=>r(1)),{el:l,set(d){a.textContent=String(d),i.disabled=d<=t,s.disabled=d>=n}}}var x="*",W=e=>T.test(e),Je=e=>Number(T.exec(e)[2]);function Ke(e,t){let n=Array.from({length:t.outputs},()=>x);return e.graph&&e.inputs.forEach((r,i)=>{if(!W(r.name))return;let s=e.getInputLink(i),a=Je(r.name);s&&a<n.length&&n[a]===x&&s.type&&s.type!==x&&(n[a]=s.type)}),n}function qe(e){let t=new Map;for(let n=e.inputs.length-1;n>=0;n--){let{name:r}=e.inputs[n];if(!W(r))continue;let i=e.getInputLink(n);i&&t.set(r,{originId:i.origin_id,originSlot:i.origin_slot}),e.removeInput(n)}return t}function Ge(e,t){for(let[n,{originId:r,originSlot:i}]of t){let s=e.graph?.getNodeById(r),a=e.inputs.findIndex(l=>l.name===n);s&&a>=0&&s.connect(i,e,a)}}function ce(e,t){let n=le(t),r=new Set(n);for(let s=e.inputs.length-1;s>=0;s--){let{name:a}=e.inputs[s];W(a)&&!r.has(a)&&e.removeInput(s)}let i=e.inputs.filter(s=>W(s.name)).map(s=>s.name);if(i.every((s,a)=>n[a]===s))for(let s of n.slice(i.length))e.addInput(s,x);else{let s=qe(e);for(let a of n)e.addInput(a,x);Ge(e,s)}for(;e.outputs.length>t.outputs;)e.removeOutput(e.outputs.length-1);for(;e.outputs.length<t.outputs;)e.addOutput(`out${e.outputs.length}`,x);pt(e,t)}function pt(e,t){let n=Ke(e,t),r=i=>n[i]!==x?n[i]:`out${i}`;for(let i of e.inputs){let s=T.exec(i.name);if(!s)continue;let a=Number(s[2]);i.label=`${z(Number(s[1]))} \xB7 ${r(a)}`,i.type=n[a]??x}e.outputs.forEach((i,s)=>{i.label=r(s),i.type=n[s]??x}),e.setDirtyCanvas(!0,!0)}var Xe="channel";function pe(e){if(!e.graph)return!1;let t=e.inputs.findIndex(n=>n.name===Xe);return t>=0&&e.isInputConnected(t)}var B={rowHeight:26,gap:6,padding:6},ut=B.rowHeight*2+B.gap+B.padding*2,j=class{constructor(t,n){this.events=t;this.node=n;for(let[i,s]of Object.entries(B))this.el.style.setProperty(`--ss-${i}`,`${s}px`);this.el.append(o("div.ss-row",{},o("label.ss-caption",{},"Channel"),this.select,this.modeBtn),o("div.ss-row",{},this.channels.el,this.outputs.el)),y(this.el),this.select.addEventListener("change",()=>this.update(()=>this.value.active=Number(this.select.value))),this.modeBtn.addEventListener("click",()=>this.update(()=>this.value.mode=this.value.mode==="cycle"?"fixed":"cycle"));let r=n.onConnectionsChange;n.onConnectionsChange=(...i)=>{r?.apply(n,i),pt(n,this.value),this.render()},this.render(),this.scheduleSync()}el=o("div.mt-root.ss-switch");minHeight=ut;value=S();select=o("select.ss-select",{"aria-label":"Active channel"});modeBtn=o("button.mt-btn.ss-mode",{type:"button",title:"Switch to the next channel after each queued run"},"\u27F3 Cycle");channels=ct("Channels",1,lt,t=>this.update(()=>{this.value.channels+=t,this.value.active=Math.min(this.value.active,this.value.channels-1)},!0));outputs=ct("Outputs",1,dt,t=>this.update(()=>this.value.outputs+=t,!0));syncQueued=!1;linked=!1;get data(){return this.value}setData(t){this.value=se(t),this.render(),this.scheduleSync()}afterQueued(){this.value.mode==="cycle"&&!this.linked&&this.update(()=>this.value.active=ae(this.value))}dispose(){}update(t,n=!1){t(),this.render(),n&&this.scheduleSync(),this.events.onChange(!1)}scheduleSync(t=30){this.syncQueued||(this.syncQueued=!0,requestAnimationFrame(()=>{if(this.syncQueued=!1,!this.node.graph){t>0&&this.scheduleSync(t-1);return}ce(this.node,this.value),this.render(),this.events.onChange(!0)}))}render(){let{channels:t,outputs:n,active:r,mode:i}=this.value;this.linked=pe(this.node);let s=`${t}:${this.linked}`;if(this.select.dataset.options!==s){this.select.dataset.options=s;let a=Array.from({length:t},(l,d)=>o("option",{value:d},z(d)));this.linked&&a.push(o("option",{value:"input"},"From input")),this.select.replaceChildren(...a)}this.select.value=this.linked?"input":String(r),this.select.disabled=this.linked,this.modeBtn.disabled=this.linked,this.modeBtn.title=this.linked?"Disabled while the channel input is connected":"Switch to the next channel after each queued run",this.modeBtn.setAttribute("aria-pressed",String(i==="cycle"&&!this.linked)),this.channels.set(t),this.outputs.set(n)}};var ue="MARTI_SOURCE_SWITCH",Qe=4,me={styles:de,widgets:{[ue]:C(ue,(e,t)=>new j(e,t),300)},nodeId:"MartiSourceSwitch",patchDef(e){re(e,t=>T.test(t)),ie(e,S().outputs)},patchType(e){e.slot_start_y=ut+Qe*2,Object.assign(e.prototype,{widgets_start_y:0})}};function Ye(e){let t=Math.round(e/1e3);if(t<60)return`${t}s`;let n=Math.floor(t/60);return n<60?`${n}m ${t%60}s`:`${Math.floor(n/60)}h ${n%60}m`}function he(e){let t=e.workflow||(e.ok?"ComfyUI job finished":"ComfyUI job failed");return e.durationMs!=null?`${t} \xB7 ${Ye(e.durationMs)}`:t}function fe(e){if(e.ok)return"Done";let t=e.nodeType?` at ${e.nodeType}`:"",n=e.error?`: ${e.error.replace(/\s+/g," ").slice(0,300)}`:"";return`Failed${t}${n}`}function mt(e,t,n){return t=t.trim(),t?`${(e.trim()||"https://ntfy.sh").replace(/\/+$/,"")}/${encodeURIComponent(t)}?${new URLSearchParams(n)}`:null}function ge(e){return e.ok?{title:he(e),tags:"white_check_mark"}:{title:he(e),tags:"x",priority:"high"}}var ht="Marti.Ntfy.Topic",ve="Marti.Ntfy.Server",be="Marti.Ntfy.Attach",xe=[{id:ht,category:["Marti","ntfy","Topic"],name:"ntfy topic",tooltip:"Notify this topic when a job finishes or fails. Leave empty to disable.",type:"text",defaultValue:""},{id:ve,category:["Marti","ntfy","Server"],name:"ntfy server",type:"text",defaultValue:"https://ntfy.sh"},{id:be,category:["Marti","ntfy","Attach"],name:"Attach the result image",tooltip:"Uploads the job's main saved output to ntfy. Anyone who knows the topic can see it.",type:"boolean",defaultValue:!0}],ye=()=>f.extensionManager?.workflow;function Ze(e){if(!e)return;let t=(ye()?.openWorkflows??[]).filter(n=>(n.activeState?.id??n.initialState?.id)===e);return t.length===1?t[0].filename:void 0}var tn=e=>new Promise(t=>setTimeout(t,e));async function en(e){for(let t=0;t<20;t++){try{let n=await h.fetchApi(`/jobs/${encodeURIComponent(e)}`);if(n.ok){let r=await n.json();if(r.status!=="pending"&&r.status!=="in_progress")return r}}catch{}await tn(250)}}var nn=e=>`/view?${new URLSearchParams({filename:e.filename,subfolder:e.subfolder??"",type:e.type??"output"})}`;function rn(e){let t=e?.preview_output;if(!(!t||t.type!=="output"||t.mediaType==="text"))return t}async function on(e,t){let n=String(g(ve)??""),r=String(g(ht)??""),i=ge(e),s=fe(e);if(t&&g(be)!==!1)try{let l=await h.fetchApi(nn(t)),d=mt(n,r,{...i,message:s,filename:t.filename});if(d&&l.ok&&(await fetch(d,{method:"PUT",body:await l.blob()})).ok)return}catch(l){console.warn("[marti] ntfy attachment failed, sending text only",l)}let a=mt(n,r,i);a&&await fetch(a,{method:"POST",body:s})}function we(){let e=new Map,t=i=>i.detail??{},n=async(i,s)=>{let a=i.prompt_id??"",l=e.get(a);if(e.delete(a),!String(g(ht)??"").trim())return;let d=a?await en(a):void 0,c={ok:s,workflow:Ze(d?.workflow_id)??l?.workflow,durationMs:l?Date.now()-l.start:void 0,nodeType:i.node_type,error:i.exception_message?.trim()};await on(c,s?rn(d):void 0)},r=i=>i().catch(s=>console.warn("[marti] ntfy failed",s));h.addEventListener("execution_start",i=>{let s=t(i).prompt_id;s&&e.set(s,{start:Date.now(),workflow:ye()?.activeWorkflow?.filename})}),h.addEventListener("execution_success",i=>r(()=>n(t(i),!0))),h.addEventListener("execution_error",i=>r(()=>n(t(i),!1)))}var ke=`/* Shared theme tokens and controls. Colors come from ComfyUI theme variables so every palette works. */
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
`;var U=[Gt,ne,me];function an(){let e="comfyui-marti-styles";if(document.getElementById(e))return;let t=document.createElement("style");t.id=e,t.textContent=[ke,Z,...U.map(n=>n.styles??"")].join(`
`),document.head.append(t)}f.registerExtension({name:"comfyui-marti",settings:[...xe,...Ht],setup(){an(),we(),$t()},getCustomWidgets:()=>Object.assign({},...U.map(e=>e.widgets??{})),addCustomNodeDefs(e){for(let t of U){let n=t.nodeId?e[t.nodeId]:void 0;n&&t.patchDef?.(n)}},beforeRegisterNodeDef(e,t){U.find(n=>n.nodeId===t.name)?.patchType?.(e)}});
