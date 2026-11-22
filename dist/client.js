window.__ModuleLoader__.load({id:"dsh-interview-desk",factory:(require)=>{const module={exports:{}};const exports=module.exports;
var pn=Object.create;var xt=Object.defineProperty;var cn=Object.getOwnPropertyDescriptor;var un=Object.getOwnPropertyNames;var mn=Object.getPrototypeOf,gn=Object.prototype.hasOwnProperty;var fn=(e,t)=>{for(var r in t)xt(e,r,{get:t[r],enumerable:!0})},hr=(e,t,r,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of un(t))!gn.call(e,n)&&n!==r&&xt(e,n,{get:()=>t[n],enumerable:!(i=cn(t,n))||i.enumerable});return e};var ye=(e,t,r)=>(r=e!=null?pn(mn(e)):{},hr(t||!e||!e.__esModule?xt(r,"default",{value:e,enumerable:!0}):r,e)),hn=e=>hr(xt({},"__esModule",{value:!0}),e);var To={};fn(To,{apply:()=>Eo,inject:()=>Io});module.exports=hn(To);var Ys=require("react");var Ge=(e,t=e)=>Object.assign(new Error(t),{code:e});function vr(e){let t=(i,n,o)=>e(i,{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify(n),signal:o});async function r(i){if(i.ok)return;let n;try{n=await i.json()}catch{}throw Ge(n?.error?.code??"REALTIME_REQUEST_FAILED",n?.error?.message??"Voice connection failed")}return{async control(i,{signal:n}={}){let o=await t("/zhijing/realtime/control",i,n);await r(o);let a=await o.json();if(a?.ok!==!0)throw Ge("REALTIME_INVALID_RESPONSE");return a.data},async open(i,{signal:n,onEvent:o}={}){let a=await t("/zhijing/realtime/open",i,n);if(await r(a),!a.headers.get("content-type")?.startsWith("application/x-ndjson")||!a.body)throw Ge("REALTIME_INVALID_RESPONSE");let l=a.body.getReader(),s=new TextDecoder("utf-8",{fatal:!0}),c="",u=async x=>{if(!x.trim())return;let k;try{k=JSON.parse(x)}catch{throw Ge("REALTIME_INVALID_RESPONSE")}if(!k||typeof k!="object"||Array.isArray(k)||typeof k.type!="string")throw Ge("REALTIME_INVALID_RESPONSE");await o?.(k)};try{for(;;){n?.throwIfAborted();let x=await l.read();if(x.done)break;if(c+=s.decode(x.value,{stream:!0}),c.length>1024*1024)throw Ge("REALTIME_EVENT_TOO_LARGE");let k;for(;(k=c.indexOf(`
`))>=0;){let h=c.slice(0,k);c=c.slice(k+1),await u(h)}}if(c+=s.decode(),c.trim())throw Ge("REALTIME_STREAM_TRUNCATED")}finally{await l.cancel().catch(()=>{}),l.releaseLock()}}}}function zt(e=globalThis.fetch.bind(globalThis)){function t(o){if(o?.requestId===void 0)return{};if(typeof o.requestId!="string"||!/^[A-Za-z0-9_-]{1,100}$/.test(o.requestId))throw Object.assign(new Error("Invalid request identity"),{code:"INVALID_REQUEST_ID"});return{requestId:o.requestId}}async function r(o,a,{signal:l}={}){l?.throwIfAborted();let s=await e(o,{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify(a),signal:l}),c;try{c=await s.json()}catch{throw Object.assign(new Error("Invalid server response"),{code:"INVALID_RESPONSE"})}if(!s.ok||c?.ok!==!0)throw Object.assign(new Error(c?.error?.message||`HTTP ${s.status}`),{code:c?.error?.code||"REQUEST_FAILED"});return c.data}let i=(o,a={},l)=>r("/zhijing/api",{action:o,input:a,...t(l)},l);async function n(o,a,l,{signal:s}={}){let c=await e(o,{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify(a),signal:s});if(!c.ok){let k=await c.json();throw Object.assign(new Error(k?.error?.message||`HTTP ${c.status}`),{code:k?.error?.code||"EXPORT_FAILED"})}let u=/filename\*=UTF-8''([^;]+)/i.exec(c.headers.get("content-disposition")||"")?.[1],x=l;if(u)try{x=decodeURIComponent(u)}catch{}return{blob:await c.blob(),filename:x.replace(/[\\/:*?"<>|]/g,"_")}}return{request:i,async upload(o,{title:a,kind:l},s){let c=t(s);if(s?.signal?.throwIfAborted(),o.size>25*1024*1024)throw Object.assign(new Error("File exceeds 25 MB"),{code:"FILE_TOO_LARGE"});let u=new Uint8Array(await o.arrayBuffer());s?.signal?.throwIfAborted();let x="";for(let k=0;k<u.length;k+=8192)x+=String.fromCharCode(...u.subarray(k,k+8192));return r("/zhijing/upload",{filename:o.name,mime:o.type,dataBase64:btoa(x),title:a||o.name,kind:l,...c},s)},exportDocument:(o,a,l,s)=>n("/zhijing/export",{kind:o,id:a,format:l},`zhijing-${o}-${a}.${l}`,s),original:(o,a)=>n("/zhijing/original",{versionId:o},"zhijing-original",a),voice:{catalog:o=>i("voice.catalog",{},o),transcribe:(o,a)=>i("voice.transcribe",o,a)},realtime:{...vr(e),catalog:o=>i("realtime.catalog",{},o)}}}function _t({blob:e,filename:t},r=document,i=URL){let n=i.createObjectURL(e),o=r.createElement("a");o.href=n,o.download=t,o.click(),setTimeout(()=>i.revokeObjectURL(n),1e3)}var vn={materials:[],goals:[],conversations:[],assessments:[],rewrites:[],interviews:[],reports:[],runs:[]};function bn(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return`zhijing-${e.randomUUID()}`;if(typeof e?.getRandomValues!="function")throw Object.assign(new Error("Secure request identity unavailable"),{code:"CLIENT_CRYPTO_REQUIRED"});return`zhijing-${[...e.getRandomValues(new Uint8Array(16))].map(t=>t.toString(16).padStart(2,"0")).join("")}`}function be(e,t){for(let r of e.materials){let i=r.versions.find(n=>n.id===t);if(i)return{material:r,version:i}}return null}function ot(e){return e.materials.filter(t=>t.kind==="resume").flatMap(t=>t.versions.filter(r=>r.confirmed).map(r=>({material:t,version:r})))}function Ht(e,t){return!!t?.materialLinks.some(r=>{let i=be(e,r.versionId);return i?.material.kind==="job"&&i.version.confirmed})}function kt(e,t,r,i="resume"){return e.assessments.find(n=>n.versionId===t&&n.kind===i&&(i==="resume"||n.goalId===r))||null}function br(e,t){let r=be(e,t);if(r)return{title:r.material.title,revision:r.version.revision,text:r.version.text};for(let i of e.interviews){let n=i.questions.find(o=>o.answer?.id===t);if(n)return{title:n.text,text:n.answer.text}}return null}function wt(e,t){if(!t?.quote)return{before:e,quote:"",after:""};let r=t.start,i=t.end;if(!Number.isInteger(r)||!Number.isInteger(i)||r<0||i<r||e.slice(r,i)!==t.quote){if(r=e.indexOf(t.quote),r<0||e.indexOf(t.quote,r+1)!==-1)return{before:e,quote:"",after:""};i=r+t.quote.length}return{before:e.slice(0,r),quote:e.slice(r,i),after:e.slice(i)}}function jr(e,{intervalMs:t=5e3,schedule:r=setInterval,unschedule:i=clearInterval,now:n=Date.now,requestIdFactory:o=bn,cancelTimeoutMs:a=5e3}={}){let l={data:vn,ready:!1,loading:!1,pending:0,error:null,operation:null,operations:[],lastOperation:null},s=new Set,c=new Set,u=new Map,x=new Set,k=new Set(["state","conversation.context","material.get","material.source","material.original","report.get","document.export","voice.catalog","realtime.catalog"]),h=0,v=null,w,S=!1,j,b=0;if(!Number.isInteger(a)||a<10||a>2e4)throw new Error("Invalid cancellation timeout");let f=()=>Object.assign(new Error("Operation cancelled"),{name:"AbortError",code:"CANCELLED"}),E=m=>m?.name==="AbortError"||m?.code==="CANCELLED"||m?.code==="ABORT_ERR",P=m=>m?{action:m.action,requestId:m.requestId,startedAt:m.startedAt,status:m.status,canCancel:m.status==="running"&&!m.cancelRequested,...m.finishedAt!==void 0?{finishedAt:m.finishedAt}:{},...m.cancelState?{cancelState:m.cancelState}:{},...m.error?{error:m.error}:{},...m.receipt?{receipt:m.receipt}:{},canRetry:m.status==="failed"&&!m.saveAcknowledged,saveAcknowledged:m.saveAcknowledged}:null,L=m=>{if(!S){l={...l,...m};for(let G of[...s])G()}};function Y(m={}){let G=[...u.values()].filter(ne=>ne.status==="running"||ne.status==="refreshing"),W=G.at(-1)??v;L({...m,operation:P(W),operations:G.map(P),lastOperation:P(v)})}function d(m,G,W){m.status=G,m.finishedAt??=n(),W&&(m.error=W),(!v||m.sequence>=v.sequence)&&(v=m),Y()}async function p(m){if(S)throw new Error("Client disposed");let G=new AbortController;c.add(G);try{return await m(G.signal)}finally{c.delete(G)}}async function y(){if(S)return;if(j)return j;let m=b;return L({loading:!l.ready}),j=p(G=>e.request("state",{},{signal:G})).then(G=>{m===b&&L({data:G,ready:!0,error:null})}).catch(G=>{m===b&&!E(G)&&L({error:G})}).finally(()=>{j=void 0,L({loading:!1})}),j}async function V(m){b+=1,L({pending:l.pending+1,error:null});try{let G=await p(m);return j&&await j,await y(),G}catch(G){throw G.name!=="AbortError"&&L({error:G}),G}finally{L({pending:Math.max(0,l.pending-1)})}}async function $(){b+=1,j&&await j,await y()}function M(m,G){let W=m.controller.signal;return new Promise((ne,Z)=>{let le=()=>{W.removeEventListener("abort",le),Z(f())};if(W.aborted){le();return}W.addEventListener("abort",le,{once:!0});let oe;try{oe=Promise.resolve(G(W,m.requestId))}catch(D){W.removeEventListener("abort",le),Z(D);return}oe.then(D=>{W.removeEventListener("abort",le),m.cancelRequested?(S||$(),Z(f())):ne(D)},D=>{W.removeEventListener("abort",le),m.cancelRequested&&!S&&$(),Z(D)})})}async function O(m,G){if(S)throw new Error("Client disposed");let W=o();if(typeof W!="string"||!/^[A-Za-z0-9_-]{1,100}$/.test(W)||x.has(W))throw Object.assign(new Error("Invalid or repeated request identity"),{code:"INVALID_REQUEST_ID"});x.add(W);let ne={action:m,requestId:W,sequence:++h,startedAt:n(),status:"running",saveAcknowledged:!1,retry:G,controller:new AbortController,cancelRequested:!1};u.set(W,ne),c.add(ne.controller),b+=1,Y({pending:l.pending+1,error:null});try{let Z=await M(ne,G);if(ne.cancelRequested||ne.controller.signal.aborted)throw f();return ne.saveAcknowledged=!0,ne.receipt=Z?.receipt,ne.status="refreshing",Y(),await $(),d(ne,"succeeded"),Z}catch(Z){throw ne.cancelRequested||E(Z)?(d(ne,"cancelled"),f()):(d(ne,"failed",Z),l.operation?.requestId===W&&L({error:Z}),Z)}finally{c.delete(ne.controller),u.delete(W),Y({pending:Math.max(0,l.pending-1)})}}function X(m){if(m.cancelPromise)return m.cancelPromise;if(m.status!=="running")return Promise.resolve({cancelled:!1});m.cancelRequested=!0,m.cancelState="requested",b+=1,m.controller.abort(),d(m,"cancelled");let G=new AbortController,W=setTimeout(()=>G.abort(),a);return m.cancelPromise=new Promise(ne=>{let Z=!1,le=(ie,q)=>{Z||(Z=!0,clearTimeout(W),G.signal.removeEventListener("abort",oe),m.cancelState=ie,Y(),S||$(),ne({requestId:m.requestId,cancelled:!0,hostCancelled:q}))},oe=()=>le("failed",null);G.signal.addEventListener("abort",oe,{once:!0});let D;try{D=e.request("task.cancel",{requestId:m.requestId},{signal:G.signal})}catch{le("failed",null);return}Promise.resolve(D).then(ie=>ie?.cancelled===!0?le("acknowledged",!0):ie?.cancelled===!1?le("not-active",!1):le("failed",null),()=>le("failed",null))}),m.cancelPromise}return{source:{getSnapshot:()=>l,subscribe(m){return s.add(m),s.size===1&&(y(),w=r(()=>{l.pending||y()},t)),()=>{s.delete(m),!s.size&&w!==void 0&&(i(w),w=void 0)}}},refresh:y,retryCurrent:()=>v?.status==="failed"&&!v.saveAcknowledged&&!u.size?O(v.action,v.retry):Promise.resolve(void 0),action:(m,G)=>m==="task.cancel"?Promise.reject(Object.assign(new Error("Use this client\u2019s current task cancellation"),{code:"CLIENT_TASK_INTERNAL"})):k.has(m)?p(W=>e.request(m,G,{signal:W})):O(m,(W,ne)=>e.request(m,G,{signal:W,requestId:ne})),upload:(m,G)=>O("material.upload",(W,ne)=>e.upload(m,G,{signal:W,requestId:ne})),cancelCurrent(m){let G=u.get(l.operation?.requestId);return m!==void 0&&m!==G?.requestId?Promise.resolve({cancelled:!1}):!S&&G&&l.operation.canCancel?X(G):Promise.resolve({cancelled:!1})},perform:V,dispose(){S=!0,w!==void 0&&i(w);for(let m of u.values())m.status==="running"&&X(m);for(let m of c)m.abort();s.clear()}}}var jn="dsh-resource://zhijingchat/session/";function xr(e){if(!e)throw new Error("Session identity required");return jn+encodeURIComponent(e)}function xn(e){let t=new URL(e);if(t.protocol!=="dsh-resource:"||t.hostname!=="zhijingchat"||!t.pathname.startsWith("/session/"))throw new Error("Invalid career session address");let r=decodeURIComponent(t.pathname.slice(9));if(!r||r.includes("/"))throw new Error("Invalid career session identity");return r}function zr(e){return{protocol:"zhijingchat",async*open(t,{signal:r}){let i;try{let n=xn(t);if(r.aborted||(await e.refresh(),r.aborted))return;i=e.retain(n,{source:"zhijingChat",signal:r}),yield{ok:!0,value:{reference:i}},r.aborted||await new Promise(o=>r.addEventListener("abort",o,{once:!0}))}catch(n){r.aborted||(yield{ok:!1,error:{code:"INTERNAL_ERROR",message:n.message}})}finally{i?.release()}}}}function yt(e,t,r){if(e==="interview.start")return r("interviewStartPrompt",{language:r(t.language==="en"?"enLanguage":"zhLanguage"),number:t.questionCount});if(e==="interview.answer"){if(typeof t.text!="string"||!t.text.trim())throw new Error(r("answerPlaceholder"));if(!Number.isInteger(t.questionNumber)||t.questionNumber<1||t.questionNumber>20)throw Object.assign(new Error("Select the current interview question before submitting an answer."),{code:"QUESTION_CHANGED"});return`${r("interviewAnswerPrompt",{number:t.questionNumber})}

${t.text}`}let i={"interview.pause":"interviewPausePrompt","interview.resume":"interviewResumePrompt","interview.finish":"interviewFinishPrompt"}[e];if(!i)throw new Error("Invalid interview action");return r(i)}async function St(e,t,r,i){if(!t||typeof e?.using!="function")throw Object.assign(new Error("DSH native conversation submission is unavailable."),{code:"NATIVE_PROMPT_UNAVAILABLE"});return e.using(t,{source:"zhijingChat",signal:i},async n=>{let{session:o}=await n.ready;i?.throwIfAborted();let a=o.beginSubmission({mode:"queue",text:r,attachments:[]}),l=!1;try{i?.throwIfAborted(),l=!0;let s=await o.prompt([{type:"text",text:r}],"queue",i,a.requestId);if(!s?.ok||s.value?.accepted!==!0)throw Object.assign(new Error(s?.error?.message||"DSH did not accept the interview message."),{code:s?.error?.code||"NATIVE_PROMPT_REJECTED"});return{accepted:!0,sessionId:t}}finally{l||a.abandon()}})}async function kr({api:e,submit:t},r,i){if(i?.throwIfAborted(),r.speechDraftId){let n=await e.request("interview.voiceReview",{interviewId:r.interviewId,questionId:r.questionId,speechDraftId:r.speechDraftId,editedTranscript:r.editedTranscript,finalText:r.text},{signal:i});if(!n?.reviewed||n.interviewId!==r.interviewId||n.questionId!==r.questionId||n.speechDraftId!==r.speechDraftId)throw Object.assign(new Error("The reviewed transcript was not saved."),{code:"VOICE_REVIEW_NOT_SAVED"})}return i?.throwIfAborted(),t(r.text,i)}var at="@deepseek-ai/dsh-experimental-voice-input-bundle";async function wr({getManager:e,openSettings:t,signal:r}){try{r?.throwIfAborted();let i=e();if(typeof i?.listBundles!="function"||typeof i?.setBundleEnabled!="function")return{status:"unavailable"};let n=await i.listBundles();if(r?.throwIfAborted(),!n?.ok||!Array.isArray(n.value))return{status:"failed"};let o=n.value.find(s=>s.name===at);if(!o||!["installation","profile"].includes(o.availability))return{status:"missing"};if(o.error||o.readOnlyReason)return{status:"failed"};r?.throwIfAborted();let a=await i.setBundleEnabled(at,!0);if(r?.throwIfAborted(),!a?.ok||a.value?.error||a.value?.target!==at||a.value.enabled!==!0)return{status:"failed"};if(a.value.application==="restart-required")return{status:"restart-required"};if(a.value.application==="overridden")return{status:"overridden"};if(a.value.application!=="applied")return{status:"failed"};let l=!1;try{l=!!t?.()}catch{}return{status:l?"applied":"applied-no-navigation"}}catch{return r?.throwIfAborted(),{status:"failed"}}}function yr(e){return{enabling:"voiceEnabling",applied:"voiceEnabled","applied-no-navigation":"voiceEnabledNoNavigation","restart-required":"voiceEnableRestart",overridden:"voiceEnableOverridden",missing:"voiceBundleMissing",unavailable:"voiceManagerUnavailable",failed:"voiceEnableFailed"}[e]??"voiceEnableNote"}var He=ye(require("react"),1);function zn({renderSlot:e}){return He.default.createElement(He.default.Fragment,null,e("conversation.session",{view:"chat"}))}function Sr({useSession:e,renderFactorySlot:t}){let i=e(n=>n).openState==="loading"?"settling":"active";return He.default.createElement("div",{className:"zj-native-conversation"},t("conversation.content",{variant:"embedded",phase:i,hero:!1},{slots:{views:zn}}))}function Nr({sessionId:e,useResource:t,SessionProvider:r,renderSlot:i,t:n}){let o=t(xr(e));return He.default.createElement("div",{className:"zj-chat"},o.status==="failed"?He.default.createElement("p",{className:"zj-error",role:"alert"},n("errorTitle")," ",o.failure?.message):o.value?He.default.createElement(r,{session:o.value.reference},i("zhijing.conversation",{})):He.default.createElement("p",{className:"zj-subtle"},n("loading")))}var I=ye(require("react"),1);var Nt=`/*
 * Design tokens. Surfaces, text and the accent follow the DSH host theme; the
 * fallbacks are the plugin's own light palette for hosts without those tokens.
 */
.zj {
  --zj-bg: var(--dsw-alias-bg-base, #fbfcfd);
  --zj-panel: var(--dsw-alias-bg-layer-1, #e6eaee);
  --zj-ink: var(--dsw-alias-label-primary, #17212b);
  --zj-muted: var(--dsw-alias-label-secondary, #4f5b67);
  --zj-line: var(--dsw-alias-border-l3, #cbd3db);
  --zj-accent: var(--dsw-alias-state-business-primary, #2443b8);
  /* Black or white text, whichever reads on the host's accent. */
  --zj-on-accent: oklch(from var(--zj-accent) clamp(0, (0.68 - l) * 1000, 1) 0 0);
  --zj-edge: color-mix(in srgb, var(--zj-ink) 38%, var(--zj-bg));
  --zj-glow: color-mix(in srgb, var(--zj-accent) 24%, transparent);
  --zj-kai: 'Kaiti SC', 'STKaiti', 'KaiTi', 'LXGW WenKai', 'Noto Serif SC', serif;
  --zj-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex;
  height: 100%;
  min-height: 0;
  color: var(--zj-ink);
  background: var(--zj-bg);
  font-family: var(--dsw-font-family, inherit);
  font-size: 14px;
}
.zj * {
  box-sizing: border-box;
}
.zj button,
.zj input,
.zj select,
.zj textarea {
  font: inherit;
}
.zj button {
  cursor: pointer;
}
.zj button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.zj button:focus-visible,
.zj input:focus-visible,
.zj select:focus-visible,
.zj textarea:focus-visible {
  outline: 2px solid var(--zj-accent);
  outline-offset: 3px;
}
.zj-rail {
  width: 238px;
  flex: 0 0 238px;
  border-right: 1px solid var(--zj-line);
  padding: 26px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--zj-panel);
  overflow: auto;
}
.zj-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
  font-size: 21px;
  font-weight: 650;
  letter-spacing: -0.6px;
}
.zj-brand svg {
  color: var(--zj-ink);
  flex-shrink: 0;
}
.zj-nav {
  display: grid;
  gap: 4px;
}
.zj-nav button,
.zj-goal-name,
.zj-chat-link {
  border: 0;
  background: transparent;
  color: var(--zj-ink);
  text-align: left;
  border-radius: 7px;
  padding: 9px 11px;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.zj-nav button:hover,
.zj-chat-link:hover,
.zj-goal-name:hover {
  background: var(--dsw-alias-interactive-bg-hover, #e9eee9);
}
.zj-nav .is-active,
.zj-chat-link.is-active,
.zj-goal-name.is-active {
  background: color-mix(in srgb, var(--zj-accent) 11%, transparent);
  color: var(--zj-accent);
}
.zj-section-label {
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--zj-muted);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  margin: 0 0 7px;
}
.zj-section-label button {
  border: 0;
  background: none;
  color: inherit;
  font-size: 20px;
  padding: 0 4px;
}
.zj-goals {
  display: grid;
  gap: 8px;
}
.zj-goal-name {
  font-weight: 600;
  width: 100%;
}
.zj-goal-name span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.zj-chat-link {
  margin-left: 14px;
  padding: 7px 11px;
  font-size: 12px;
  width: calc(100% - 14px);
}
.zj-chat-link span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.zj-rail-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--zj-line);
}
.zj-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}
.zj-topbar {
  min-height: 66px;
  padding: 14px 30px;
  border-bottom: 1px solid var(--zj-line);
  display: flex;
  align-items: center;
  gap: 12px;
}
.zj-topbar h1 {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}
.zj-topbar .zj-subtle {
  margin-left: 8px;
}
.zj-toolbar {
  margin-left: auto;
  display: flex;
  gap: 8px;
  align-items: center;
}
.zj-body {
  overflow: auto;
  flex: 1;
  padding: 34px 38px;
}
.zj-page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 28px;
}
.zj-page-heading h2 {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.7px;
  margin: 0 0 8px;
}
.zj-page-heading p {
  margin: 0;
  color: var(--zj-muted);
  line-height: 1.65;
  max-width: 620px;
}
.zj-btn {
  border: 1px solid var(--zj-line);
  border-radius: 7px;
  padding: 9px 13px;
  background: var(--zj-bg);
  color: var(--zj-ink);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}
.zj-btn:hover {
  border-color: var(--zj-accent);
}
.zj-btn.primary {
  background: var(--zj-accent);
  border-color: var(--zj-accent);
  color: var(--zj-on-accent);
}
.zj-btn.small {
  font-size: 12px;
  padding: 6px 10px;
}
.zj-btn.quiet {
  border-color: transparent;
  background: transparent;
  color: var(--zj-muted);
}
.zj-subtle {
  color: var(--zj-muted);
  font-size: 12px;
  line-height: 1.7;
}
.zj-empty {
  display: grid;
  align-content: center;
  justify-items: start;
  gap: 17px;
  max-width: 610px;
  min-height: 360px;
  margin: auto;
  padding: 34px 0;
}
.zj-empty h2 {
  font-size: 37px;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -1px;
  margin: 0;
}
.zj-empty p {
  color: var(--zj-muted);
  font-size: 15px;
  line-height: 1.8;
  margin: 0;
}
.zj-eyebrow {
  color: var(--zj-accent);
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.08em;
}
.zj-actions {
  display: flex;
  gap: 9px;
  flex-wrap: wrap;
  align-items: center;
}
.zj-error {
  padding: 12px 18px;
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #b23e3e) 8%, var(--zj-bg));
  color: var(--dsw-alias-state-error-primary, #b23e3e);
  font-size: 13px;
  line-height: 1.6;
  display: flex;
  gap: 10px;
  align-items: center;
}
.zj-error strong {
  font-weight: 600;
}
.zj-error .zj-btn {
  margin-left: auto;
}
.zj-progress {
  height: 3px;
  background: color-mix(in srgb, var(--zj-accent) 15%, transparent);
}
.zj-progress::before {
  content: "";
  display: block;
  width: 35%;
  height: 100%;
  background: var(--zj-accent);
  animation: zj-progress 1.4s ease-in-out infinite alternate;
}
@keyframes zj-progress {
  to {
    transform: translateX(180%);
  }
}
.zj-split {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 25px;
}
.zj-material-list {
  display: grid;
  align-content: start;
  gap: 7px;
}
.zj-material-item {
  padding: 14px;
  border: 1px solid var(--zj-line);
  border-radius: 9px;
  background: transparent;
  color: var(--zj-ink);
  text-align: left;
}
.zj-material-item.is-active {
  border-color: var(--zj-accent);
  background: color-mix(in srgb, var(--zj-accent) 5%, transparent);
}
.zj-material-item strong {
  display: block;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 6px 0;
}
.zj-paper {
  border: 1px solid var(--zj-line);
  border-radius: 10px;
  overflow: hidden;
}
.zj-paper-head {
  padding: 19px 22px;
  border-bottom: 1px solid var(--zj-line);
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.zj-paper-head h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}
.zj-paper-content {
  padding: 24px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.85;
  font-size: 14px;
}
.zj-tag {
  font-size: 11px;
  padding: 3px 7px;
  border-radius: 4px;
  background: var(--zj-panel);
  color: var(--zj-muted);
}
.zj-tag.confirmed {
  color: var(--zj-accent);
}
.zj-review-note {
  padding: 13px 22px;
  background: var(--zj-panel);
  font-size: 12px;
  line-height: 1.7;
  color: var(--zj-muted);
  display: flex;
  gap: 16px;
  align-items: center;
}
.zj-review-note .zj-btn {
  margin-left: auto;
}
.zj-form {
  display: grid;
  gap: 17px;
}
.zj-form label {
  display: grid;
  gap: 7px;
  font-size: 12px;
  color: var(--zj-muted);
}
.zj-form input,
.zj-form textarea,
.zj-form select,
.zj-select {
  width: 100%;
  border: 1px solid var(--zj-line);
  border-radius: 7px;
  padding: 10px 12px;
  background: var(--zj-bg);
  color: var(--zj-ink);
}
.zj-form textarea {
  resize: vertical;
  min-height: 145px;
  line-height: 1.7;
}
.zj-inline-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.zj-tabs {
  display: flex;
  gap: 5px;
  padding: 4px;
  background: var(--zj-panel);
  border-radius: 8px;
  margin-bottom: 22px;
  width: fit-content;
  flex-wrap: wrap;
}
.zj-tabs button {
  border: 0;
  border-radius: 5px;
  padding: 8px 13px;
  background: transparent;
  color: var(--zj-muted);
  font-size: 13px;
}
.zj-tabs .is-active {
  background: var(--zj-bg);
  color: var(--zj-ink);
  box-shadow: 0 1px 3px #0000000a;
}
.zj-modal {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: #0005;
  display: grid;
  place-items: center;
  padding: 20px;
}
.zj-dialog {
  width: min(660px, 100%);
  max-height: 90vh;
  overflow: auto;
  background: var(--zj-bg);
  border: 1px solid var(--zj-line);
  border-radius: 14px;
  box-shadow: 0 24px 80px #0003;
  padding: 26px;
}
.zj-dialog-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.zj-dialog-head h2 {
  font-size: 21px;
  margin: 0;
}
.zj-dialog-foot {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.zj-attach {
  padding: 16px;
  border-bottom: 1px solid var(--zj-line);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}
.zj-attach:last-child {
  border-bottom: 0;
}
.zj-attach strong {
  display: block;
  font-weight: 550;
  margin-bottom: 3px;
}
.zj-card {
  border: 1px solid var(--zj-line);
  border-radius: 10px;
  padding: 23px;
  margin-top: 20px;
}
.zj-card h3 {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 16px;
}
.zj-card p {
  line-height: 1.8;
}
.zj-score {
  font-size: 47px;
  letter-spacing: -2px;
  font-weight: 500;
  color: var(--zj-accent);
  display: block;
}
.zj-score small {
  font-size: 14px;
  letter-spacing: 0;
  color: var(--zj-muted);
  margin-left: 8px;
}
.zj-criterion {
  padding: 15px 0;
  border-top: 1px solid var(--zj-line);
  line-height: 1.7;
}
.zj-criterion-head {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  font-weight: 600;
}
.zj-list {
  padding-left: 20px;
  line-height: 1.85;
}
.zj-list li {
  padding: 4px 0;
}
.zj-diff {
  border-top: 1px solid var(--zj-line);
  padding: 18px 0;
}
.zj-diff label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 13px;
}
.zj-diff-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 13px;
}
.zj-diff pre {
  font: inherit;
  font-size: 13px;
  white-space: pre-wrap;
  margin: 6px 0;
  padding: 12px;
  background: var(--zj-panel);
  border-radius: 6px;
  line-height: 1.75;
}
.zj-diff .after {
  background: color-mix(in srgb, var(--zj-accent) 7%, var(--zj-bg));
}
.zj-chat {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.zj-native-conversation {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.zj-native-conversation > * {
  flex: 1;
  min-height: 0;
}
.zj-interview-layout {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(320px, 1fr);
  height: 100%;
  min-height: 0;
}
.zj-interview-work {
  overflow: auto;
  padding: 26px;
  border-right: 1px solid var(--zj-line);
}
.zj-question {
  font-size: 21px;
  line-height: 1.7;
  font-weight: 500;
  margin: 12px 0 25px;
}
.zj-answer-history {
  border-top: 1px solid var(--zj-line);
  padding: 16px 0;
}
.zj-answer-history summary {
  cursor: pointer;
  font-size: 13px;
  line-height: 1.7;
}
.zj-answer-history p {
  white-space: pre-wrap;
  line-height: 1.8;
  font-size: 13px;
  color: var(--zj-muted);
}
.zj-voice {
  padding: 14px 0;
}
.zj-voice-state {
  font-size: 12px;
  color: var(--zj-muted);
  margin: 9px 0;
}
.zj-voice .zj-form {
  margin-top: 12px;
}
.zj-status-line {
  font-size: 12px;
  line-height: 1.7;
  margin: 9px 0;
  color: var(--zj-accent);
}
@media (max-width: 1000px) {
  .zj-rail {
    width: 195px;
    flex-basis: 195px;
  }
  .zj-body {
    padding: 26px;
  }
  .zj-split {
    grid-template-columns: 180px minmax(0, 1fr);
  }
  .zj-interview-layout {
    display: flex;
    flex-direction: column;
    overflow: auto;
  }
  .zj-interview-work {
    overflow: visible;
    border-right: 0;
  }
  .zj-interview-layout > .zj-chat {
    min-height: 500px;
  }
}
@media (max-width: 720px) {
  .zj {
    flex-direction: column;
  }
  .zj-rail {
    width: 100%;
    flex-basis: auto;
    padding: 10px 14px;
    max-height: 190px;
    gap: 10px;
    border-right: 0;
    border-bottom: 1px solid var(--zj-line);
  }
  .zj-brand {
    font-size: 17px;
  }
  .zj-nav {
    display: flex;
    flex-wrap: wrap;
  }
  .zj-rail-footer {
    margin-top: 0;
    border: 0;
    padding: 0;
  }
  .zj-goals {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .zj-goal-name {
    width: auto;
  }
  .zj-chat-link {
    display: none;
  }
  .zj-topbar {
    padding: 12px 16px;
    min-height: 55px;
  }
  .zj-body {
    padding: 24px 18px;
  }
  .zj-page-heading {
    flex-wrap: wrap;
  }
  .zj-page-heading h2 {
    font-size: 24px;
  }
  .zj-split {
    grid-template-columns: 1fr;
  }
  .zj-material-list {
    display: flex;
    overflow: auto;
  }
  .zj-material-item {
    min-width: 170px;
  }
  .zj-diff-grid,
  .zj-inline-fields {
    grid-template-columns: 1fr;
  }
  .zj-empty h2 {
    font-size: 30px;
  }
  .zj-dialog {
    padding: 20px;
  }
  .zj-toolbar .zj-subtle {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .zj-progress::before {
    animation: none;
  }
}
.zj-evidence {
  display: grid;
  gap: 7px;
}
.zj-evidence button {
  border: 0;
  border-left: 2px solid var(--zj-line);
  background: transparent;
  color: var(--zj-muted);
  padding: 7px 12px;
  text-align: left;
  font-size: 12px;
  line-height: 1.75;
}
.zj-evidence button:hover {
  border-color: var(--zj-accent);
  color: var(--zj-accent);
}
.zj-evidence button span {
  display: block;
  font-size: 10px;
  font-weight: 600;
}
.zj mark {
  color: inherit;
  background: color-mix(in srgb, var(--zj-accent) 22%, transparent);
  border-radius: 2px;
}
.zj-source-link {
  color: var(--zj-accent);
  font-size: 12px;
}
.zj-source-blocks {
  display: grid;
  gap: 6px;
  max-height: 230px;
  overflow: auto;
  margin-top: 20px;
}
.zj-source-blocks > button {
  border: 1px solid var(--zj-line);
  border-radius: 6px;
  background: transparent;
  color: var(--zj-muted);
  padding: 9px 11px;
  text-align: left;
  font-size: 12px;
  line-height: 1.7;
}
.zj-source-blocks > button span {
  display: block;
  font-size: 10px;
}
.zj-source-blocks > button.is-active {
  border-color: var(--zj-accent);
  color: var(--zj-accent);
}
.zj-source-details {
  font-size: 12px;
  color: var(--zj-muted);
  border-top: 1px solid var(--zj-line);
  padding-top: 14px;
}
.zj-source-details summary {
  cursor: pointer;
}
.zj-source-details pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 11px;
  line-height: 1.65;
}
.zj-original-image {
  position: relative;
  margin-top: 18px;
  line-height: 0;
}
.zj-original-image img {
  width: 100%;
  height: auto;
}
.zj-original-image svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.zj-original-image rect {
  fill: color-mix(in srgb, var(--zj-accent) 15%, transparent);
  stroke: var(--zj-accent);
  stroke-width: 2;
}
.zj-task-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 12px 32px;
  padding: 14px 18px;
  border: 1px solid var(--zj-line);
  border-radius: 8px;
}
.zj-task-card > div {
  display: grid;
  gap: 5px;
}
.zj-task-card strong {
  font-size: 13px;
}
.zj-realtime-interview {
  max-width: 1000px;
  width: 100%;
  align-self: center;
}
.zj-realtime-call {
  padding: 28px;
}
.zj-realtime-call .zj-question {
  margin: 16px 0 24px;
}
.zj-realtime-call .zj-voice {
  margin-top: 24px;
}
.zj-realtime-interview textarea {
  display: block;
  width: 100%;
  margin: 10px 0;
  resize: vertical;
}
.zj-voice-setup {
  padding: 10px;
}
.zj-voice-setup > details {
  margin-top: 10px;
  color: var(--zj-muted);
  font-size: 11px;
}
@media (max-width: 760px) {
  .zj-task-card {
    margin: 10px 16px;
  }
  .zj-realtime-call {
    padding: 20px;
  }
}

.zj-stage {
  flex: 1;
  min-height: 0;
  display: flex;
  position: relative;
  overflow: hidden;
}
.zj-workspace-page {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.zj-assistant {
  display: flex;
  flex-direction: column;
  flex: 0 0 390px;
  width: 390px;
  max-width: 100%;
  min-height: 0;
  border-left: 1px solid var(--zj-line);
  background: var(--zj-bg);
}
.zj-assistant-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid var(--zj-line);
  min-height: 64px;
}
.zj-assistant-head > div:first-child {
  display: grid;
  min-width: 0;
  gap: 4px;
}
.zj-assistant-head .zj-subtle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.zj-assistant-context {
  display: grid;
  gap: 3px;
  padding: 10px 16px;
  background: var(--zj-panel);
  font-size: 11px;
  color: var(--zj-muted);
  overflow-wrap: anywhere;
}
.zj-assistant-empty {
  padding: 24px;
  color: var(--zj-muted);
  line-height: 1.8;
}
.zj-stage.is-chat > .zj-assistant {
  flex: 1;
  width: auto;
  border-left: 0;
}
.zj-stage .is-hidden {
  display: none;
}
.zj-stage.has-assistant .zj-split {
  grid-template-columns: minmax(135px, 180px) minmax(0, 1fr);
  gap: 16px;
}
.zj-stage.has-assistant .zj-body {
  padding: 26px;
}
.zj-stage .zj-interview-layout {
  grid-template-columns: minmax(0, 1fr);
}
.zj-stage .zj-interview-work {
  border-right: 0;
}
.zj-context-actions {
  padding: 16px 22px;
  border-top: 1px solid var(--zj-line);
  display: grid;
  justify-items: start;
  gap: 12px;
}
.zj-context-actions details {
  width: 100%;
}
.zj-context-actions summary,
.zj-context-preview summary {
  cursor: pointer;
  font-size: 12px;
  line-height: 1.7;
}
.zj-context-actions textarea {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 12px;
  border: 1px solid var(--zj-line);
  border-radius: 6px;
  resize: vertical;
  line-height: 1.7;
  color: var(--zj-ink);
  background: var(--zj-bg);
}
.zj-context-preview {
  margin: 12px;
  padding: 14px;
  border: 1px solid var(--zj-line);
  border-radius: 8px;
  background: var(--zj-panel);
  max-height: 45%;
  overflow: auto;
}
.zj-context-preview .zj-page-heading {
  margin-bottom: 8px;
  align-items: center;
  font-size: 12px;
}
.zj-context-preview pre {
  font: inherit;
  font-size: 12px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  max-height: 180px;
  overflow: auto;
}
.zj-context-notice {
  font-size: 12px;
  line-height: 1.7;
  color: var(--zj-accent);
  margin: 10px 16px;
}
.zj-narrow .zj-stage:not(.is-chat) > .zj-assistant {
  position: absolute;
  inset: 0 0 0 auto;
  width: min(440px, 100%);
  box-shadow: -12px 0 32px #0002;
  z-index: 8;
}
.zj-narrow .zj-topbar {
  flex-wrap: wrap;
  gap: 8px;
}
.zj-narrow .zj-toolbar {
  flex-wrap: wrap;
}
.zj-narrow .zj-stage .zj-split {
  grid-template-columns: 1fr;
}
.zj-narrow .zj-stage .zj-material-list {
  display: flex;
  overflow: auto;
}
.zj-narrow .zj-stage .zj-material-item {
  min-width: 170px;
}
.zj-review-note {
  flex-wrap: wrap;
}
.zj-review-note select {
  max-width: 240px;
}
`;var Cr=`.zj-desk-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 26px 0;
  border-bottom: 1px solid var(--zj-line);
  flex-shrink: 0;
  overflow: auto;
}
.zj-desk-nav > button {
  border: 0;
  border-bottom: 2px solid transparent;
  padding: 14px 16px;
  white-space: nowrap;
  background: transparent;
  color: var(--zj-muted);
  font-weight: 550;
}
.zj-desk-nav > button.is-active {
  border-color: var(--zj-accent);
  color: var(--zj-accent);
}
.zj-desk-nav > button:hover {
  color: var(--zj-ink);
}
.zj-topbar {
  min-height: 48px;
  padding: 9px 26px;
}
.zj-collection-tools {
  display: flex;
  gap: 12px;
  align-items: end;
  flex-wrap: wrap;
}
.zj-collection-tools label {
  display: grid;
  gap: 7px;
  font-size: 11px;
  color: var(--zj-muted);
}
.zj-search {
  flex: 1;
  min-width: 160px;
}
.zj-collection-tools input,
.zj-collection-tools select {
  padding: 10px 12px;
  min-height: 39px;
  border: 1px solid var(--zj-line);
  border-radius: 8px;
  color: var(--zj-ink);
  background: var(--zj-bg);
}
.zj-layout-toggle {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--zj-panel);
  border-radius: 8px;
}
.zj-layout-toggle button {
  border: 0;
  background: transparent;
}
.zj-layout-toggle [aria-pressed="true"] {
  background: var(--zj-bg);
  box-shadow: 0 1px 4px #0001;
  color: var(--zj-accent);
}
.zj-object-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(225px, 1fr));
  gap: 16px;
  padding-bottom: 28px;
}
.zj-object-card {
  border: 1px solid var(--zj-line);
  border-radius: 12px;
  background: var(--zj-bg);
  color: var(--zj-ink);
  padding: 22px;
  text-align: left;
  min-width: 0;
  min-height: 206px;
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 12px;
  transition:
    border-color 0.16s,
    box-shadow 0.16s;
}
.zj-object-card:hover {
  border-color: var(--zj-accent);
  box-shadow: 0 5px 18px #00000008;
}
.zj-object-card strong {
  font-size: 18px;
  line-height: 1.5;
  font-weight: 550;
  overflow-wrap: anywhere;
}
.zj-object-card p {
  margin: 0;
  color: var(--zj-muted);
  font-size: 12px;
  line-height: 1.8;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.zj-object-meta {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  width: 100%;
  font-size: 11px;
  color: var(--zj-muted);
  margin-top: auto;
  padding-top: 14px;
}
.zj-object-grid.is-list {
  grid-template-columns: 1fr;
  gap: 8px;
}
.zj-object-grid.is-list .zj-object-card {
  min-height: 90px;
  display: grid;
  grid-template-columns: 85px minmax(120px, 1fr) minmax(80px, 1.4fr);
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
}
.zj-object-grid.is-list .zj-object-card strong {
  font-size: 15px;
}
.zj-object-grid.is-list .zj-object-card p {
  -webkit-line-clamp: 2;
}
.zj-object-grid.is-list .zj-object-meta {
  grid-column: 2/-1;
  padding: 0;
}
.zj-studio-head {
  padding: 12px 26px;
  border-bottom: 1px solid var(--zj-line);
  display: flex;
  gap: 16px;
  align-items: center;
  flex-shrink: 0;
}
.zj-studio-head > strong {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 550;
}
.zj-stage.is-studio > .zj-assistant {
  order: -1;
  border-left: 0;
  border-right: 1px solid var(--zj-line);
  flex-basis: 350px;
  width: 350px;
}
.zj-narrow .zj-stage.is-studio > .zj-assistant {
  inset: 0 auto 0 0;
  width: min(440px, 100%);
  box-shadow: 12px 0 32px #0002;
}
.zj-material-studio .zj-paper {
  margin-top: 20px;
}
.zj-material-studio .zj-paper-head {
  flex-wrap: wrap;
}
.zj-copy {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.zj-receipts {
  border-bottom: 1px solid var(--zj-line);
  font-size: 12px;
}
.zj-receipts > summary {
  padding: 12px 16px;
  cursor: pointer;
  color: var(--zj-muted);
}
.zj-receipts > div {
  max-height: 210px;
  overflow: auto;
}
.zj-receipt {
  padding: 10px 16px;
  border-top: 1px solid var(--zj-line);
}
.zj-receipt > div:first-child {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
}
.zj-receipt strong {
  font-weight: 500;
}
.zj-receipt time {
  color: var(--zj-muted);
  font-size: 10px;
}
.zj-receipt-undo {
  border-bottom: 1px solid var(--zj-line);
  padding: 3px 8px;
}
.zj-receipt .zj-actions {
  gap: 3px;
  margin-top: 5px;
}
.zj-collection .zj-empty {
  min-height: 240px;
}
.zj-result-studio .zj-tabs {
  margin-bottom: 24px;
}
@media (max-width: 800px) {
  .zj-desk-nav {
    padding: 0 8px;
    gap: 0;
  }
  .zj-desk-nav > button {
    padding: 12px 10px;
  }
  .zj-studio-head {
    padding: 10px 12px;
    gap: 8px;
    flex-wrap: wrap;
  }
  .zj-object-grid.is-list .zj-object-card {
    grid-template-columns: 70px minmax(100px, 1fr);
  }
  .zj-object-grid.is-list .zj-object-card p {
    grid-column: 2;
  }
  .zj-collection-tools {
    gap: 8px;
  }
  .zj-studio-head > strong {
    min-width: 100px;
  }
  .zj-desk-nav > button {
    font-size: 12px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .zj-object-card {
    transition: none;
  }
}

.zj {
  width: 100%;
  min-width: 0;
  overflow: hidden;
}
.zj-main,
.zj-native-conversation {
  min-width: 0;
}
.zj-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--zj-line);
}
.zj-suggestions .zj-btn {
  white-space: normal;
  text-align: left;
  font-size: 11px;
}

.zj-role-board {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.zj-board-column {
  background: var(--zj-panel);
  border: 1px solid var(--zj-line);
  border-radius: 12px;
  min-height: 300px;
  padding: 16px;
}
.zj-board-column h3 {
  margin: 0 0 18px;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  color: var(--zj-muted);
  font-weight: 500;
}
.zj-board-card {
  background: var(--zj-bg);
  border: 1px solid var(--zj-line);
  border-radius: 9px;
  margin-bottom: 12px;
  padding: 14px;
  cursor: grab;
}
.zj-board-card > button:first-child {
  display: block;
  width: 100%;
  border: 0;
  background: none;
  color: var(--zj-ink);
  text-align: left;
  padding: 0;
}
.zj-board-card p {
  font-size: 12px;
  line-height: 1.7;
  color: var(--zj-muted);
  white-space: pre-wrap;
}
.zj-report-trend {
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 22px;
  border: 1px solid var(--zj-line);
  border-radius: 12px;
  margin-bottom: 20px;
}
.zj-report-trend > div {
  flex: 1;
}
.zj-report-trend strong {
  display: block;
  font-size: 35px;
  font-weight: 500;
  color: var(--zj-accent);
  margin: 9px 0;
}
.zj-report-trend small {
  font-size: 12px;
  color: var(--zj-muted);
}
.zj-report-trend p {
  font-size: 11px;
  color: var(--zj-muted);
  line-height: 1.8;
}
.zj-report-trend svg {
  width: 48%;
  max-width: 320px;
  overflow: visible;
}
@media (max-width: 800px) {
  .zj-role-board {
    grid-template-columns: 1fr;
  }
  .zj-report-trend {
    gap: 12px;
  }
}

.zj-rail {
  overflow-x: hidden;
}
.zj-rail > * {
  min-width: 0;
  max-width: 100%;
}
.zj-goals > div {
  min-width: 0;
}
.zj-rail button {
  max-width: 100%;
}
`;var Ir=`/*
 * Shell pieces shared by the prepare flow and the interview room, plus the
 * shape language (pill buttons, softer corners) applied to the workbench.
 */
.zj-immersive .zj-main {
  background: var(--zj-bg);
}
.zj-slim {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 57px;
  padding: 8px 32px;
  border-bottom: 1px solid var(--zj-line);
}
.zj-slim .zj-brand {
  padding: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0;
}
.zj-immersive .zj-task-card {
  margin: 10px 32px;
}

.zj-btn {
  min-height: 36px;
  padding: 0 18px;
  border-color: var(--zj-edge);
  border-radius: 18px;
  background: transparent;
  transition: border-color 0.2s ease-out;
}
.zj-btn:hover {
  border-color: var(--zj-ink);
}
.zj-btn.primary {
  color: var(--zj-on-accent);
  font-weight: 600;
}
.zj-btn.primary:hover {
  border-color: var(--zj-ink);
}
.zj-btn.small {
  min-height: 30px;
  padding: 0 12px;
  border-radius: 15px;
}
.zj-btn.quiet {
  border-color: transparent;
}
.zj-btn.quiet:hover {
  border-color: transparent;
  color: var(--zj-ink);
}
.zj-btn[aria-pressed='true']:not(.primary) {
  border-color: var(--zj-accent);
  color: var(--zj-accent);
}
.zj-form input,
.zj-form textarea,
.zj-form select,
.zj-select {
  border-radius: 12px;
}
.zj-card,
.zj-paper,
.zj-dialog {
  border-radius: 16px;
}
.zj-error {
  line-height: 1.6;
}
@media (max-width: 760px) {
  .zj-slim {
    padding: 8px 16px;
  }
}
`;var Er=`/*
 * Prepare flow: one vertical axis, one step per screen.
 * The job sits left of the axis, the candidate right of it; the axis ends at
 * the start bar. A button slides to the next step and the wheel steps back.
 */
.zj-kai {
  font-family: var(--zj-kai);
}
.zj-flow {
  flex: 1 1 0;
  min-height: 0;
  position: relative;
  overflow-y: auto;
  overscroll-behavior: contain;
  scroll-snap-type: y mandatory;
  container-type: size;
}
.zj-hero,
.zj-sec {
  min-height: 100%;
  min-height: 100cqh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

/* Opening: the axis starts under the button and leads the eye down. */
.zj-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 32px;
  overflow: hidden;
  text-align: center;
  background: var(--zj-bg);
}
.zj-hero-space {
  flex: 1 1 0;
}
.zj-hero h1 {
  margin: 0;
  font-size: 44px;
  line-height: 1.3;
  font-weight: 600;
  letter-spacing: -0.3px;
  text-wrap: balance;
}
.zj-hero-lead {
  margin: 14px 0 0;
  font-size: 16px;
  color: var(--zj-muted);
}
.zj-hero .zj-btn.primary {
  margin-top: 28px;
}
.zj-lead {
  position: relative;
  flex: 1 1 0;
  width: 1px;
  margin-top: 28px;
  background: linear-gradient(to bottom, transparent, var(--zj-edge) 45%);
}
.zj-lead::after {
  content: '';
  position: absolute;
  left: -1px;
  top: 0;
  width: 3px;
  height: 36px;
  border-radius: 2px;
  background: linear-gradient(to bottom, transparent, var(--zj-accent));
  animation: zj-fall 2.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes zj-fall {
  0% {
    transform: translateY(-40px);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  100% {
    transform: translateY(340px);
    opacity: 0;
  }
}

/* Steps: a two-tone field split by the axis. */
.zj-sec {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-content: start;
  background: linear-gradient(to right, var(--zj-panel) 50%, var(--zj-bg) 50%);
}
.zj-sec.is-start {
  grid-template-rows: 270px auto;
}
.zj-side {
  min-width: 0;
  padding: 92px 64px 56px;
}
.zj-sec.is-start .zj-side {
  padding-bottom: 0;
}
.zj-block {
  display: block;
  max-width: 440px;
}
.zj-side.is-l .zj-block {
  margin-left: auto;
}
.zj-side.is-r .zj-block {
  margin-right: auto;
}
.zj-block h2,
.zj-block .zj-block-title {
  margin: 0;
  font-family: var(--zj-kai);
  font-size: 28px;
  line-height: 1.4;
  font-weight: 400;
}
.zj-side.is-quiet .zj-block-title {
  color: var(--zj-muted);
}
.zj-block-note {
  margin: 4px 0 18px;
  color: var(--zj-muted);
  line-height: 1.6;
}
.zj-side.is-quiet .zj-block-note {
  margin-bottom: 0;
}
.zj-block-label {
  display: block;
  font-size: 13px;
  color: var(--zj-muted);
}
.zj-block-value {
  font-family: var(--zj-kai);
  font-size: 24px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.zj-block-value.is-missing {
  color: var(--zj-muted);
}

.zj-axis {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--zj-edge);
  transition: background-color 0.9s ease;
  pointer-events: none;
}
.zj-axis.is-short {
  bottom: auto;
  height: 270px;
}
.zj-axis.is-lit {
  background: var(--zj-accent);
}
.zj-node {
  position: absolute;
  left: 50%;
  top: 104px;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  border-radius: 50%;
  border: 1px solid var(--zj-edge);
  background: var(--zj-bg);
  transition:
    background-color 0.9s ease,
    border-color 0.9s ease;
  pointer-events: none;
}
.zj-node.is-done {
  background: var(--zj-accent);
  border-color: var(--zj-accent);
}
.zj-node.is-current {
  border-color: var(--zj-accent);
  animation: zj-breathe 2.4s ease-in-out infinite;
}
@keyframes zj-breathe {
  0%,
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--zj-accent) 45%, transparent);
  }
  50% {
    box-shadow: 0 0 0 10px transparent;
  }
}

/* Inputs inside the flow. */
.zj-field-label {
  display: block;
  margin: 0 0 6px;
  font-size: 12px;
  color: var(--zj-muted);
}
.zj-field {
  display: block;
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--zj-line);
  border-radius: 12px;
  background: var(--zj-bg);
  color: var(--zj-ink);
  line-height: 1.7;
}
textarea.zj-field {
  resize: vertical;
  min-height: 150px;
}
.zj-field + .zj-field-label,
.zj-field + label {
  margin-top: 14px;
}
.zj-flow-actions {
  display: flex;
  align-items: center;
  gap: 6px 16px;
  flex-wrap: wrap;
  margin-top: 14px;
}
.zj-flow .zj-btn.quiet {
  padding-left: 2px;
  padding-right: 2px;
  text-decoration: underline;
  text-underline-offset: 4px;
}
.zj-flow .zj-btn.quiet:hover {
  color: var(--zj-ink);
}
.zj-drop {
  display: grid;
  place-items: center;
  min-height: 190px;
  padding: 24px;
  border: 1px dashed var(--zj-muted);
  border-radius: 12px;
  color: var(--zj-muted);
  text-align: center;
  line-height: 1.7;
  cursor: pointer;
  transition:
    border-color 0.2s ease-out,
    color 0.2s ease-out,
    background-color 0.2s ease-out;
}
.zj-drop:hover,
.zj-drop.is-over,
.zj-drop:focus-within {
  border-color: var(--zj-accent);
  color: var(--zj-ink);
}
.zj-drop.is-over {
  background: color-mix(in srgb, var(--zj-accent) 6%, transparent);
}
.zj-drop.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.zj-drop input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}
.zj-doc {
  padding: 16px 18px;
  border: 1px solid var(--zj-line);
  border-radius: 12px;
  background: var(--zj-bg);
}
.zj-doc.is-confirmed {
  border-color: var(--zj-edge);
}
.zj-doc strong {
  display: block;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.zj-doc-text {
  margin: 8px 0 0;
  max-height: 168px;
  overflow: auto;
  font-size: 13px;
  line-height: 1.8;
  color: var(--zj-muted);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.zj-doc-state {
  color: var(--zj-muted);
}

/* Start bar: sits on the end of the axis and straddles both sides. */
.zj-bar {
  grid-column: 1 / -1;
  justify-self: center;
  position: relative;
  max-width: calc(100% - 48px);
  margin-bottom: 56px;
  padding: 16px 22px;
  border: 1px solid var(--zj-edge);
  border-radius: 16px;
  background: var(--zj-bg);
  text-align: center;
}
.zj-bar p {
  margin: 0;
  color: var(--zj-muted);
  line-height: 1.7;
}
.zj-bar-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px 18px;
  flex-wrap: wrap;
}
.zj-bar-note {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px 12px;
  flex-wrap: wrap;
  font-size: 13px;
}
.zj-opts {
  display: flex;
  align-items: center;
  gap: 2px;
}
.zj-opt {
  min-height: 36px;
  padding: 0 14px;
  border-radius: 18px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--zj-muted);
  white-space: nowrap;
}
.zj-opt:hover {
  color: var(--zj-ink);
}
.zj-opt[aria-pressed='true'] {
  color: var(--zj-ink);
  border-color: var(--zj-edge);
  font-weight: 600;
}
.zj-bar select {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--zj-line);
  border-radius: 18px;
  background: var(--zj-bg);
  color: var(--zj-ink);
}

/* Motion: slow fades; steps reveal as they scroll into view. */
.zj-fade {
  animation: zj-fade 0.6s ease both;
}
@keyframes zj-fade {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes zj-reveal {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@supports (animation-timeline: view()) {
  .zj-reveal {
    animation: zj-reveal linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 40%;
  }
}

@container (max-width: 759px) {
  .zj-sec {
    grid-template-columns: minmax(0, 1fr);
    background: var(--zj-bg);
  }
  .zj-sec.is-start {
    grid-template-rows: auto;
  }
  .zj-side {
    padding: 40px 24px 24px;
  }
  .zj-side.is-quiet,
  .zj-axis,
  .zj-node {
    display: none;
  }
  .zj-side.is-l .zj-block,
  .zj-side.is-r .zj-block {
    margin: 0;
    max-width: none;
  }
  .zj-bar {
    justify-self: stretch;
    max-width: none;
    margin: 24px 24px 40px;
  }
  .zj-hero h1 {
    font-size: 30px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .zj-fade,
  .zj-reveal,
  .zj-node.is-current,
  .zj-lead::after {
    animation: none;
  }
}
`;var Tr=`/*
 * Interview room: the interviewer left of the axis, the candidate right of it.
 * The light along the axis shows whose turn it is. During a voice call it
 * follows the real loudness of each side (see RealtimeCall); otherwise the
 * phase classes drive a slower, simulated pulse.
 */
.zj-room {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  container-type: inline-size;
}
.zj-room-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  flex-wrap: wrap;
  min-height: 56px;
  padding: 8px 32px;
  border-bottom: 1px solid var(--zj-line);
}
.zj-room-status {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  font-variant-numeric: tabular-nums;
}
.zj-room-phase {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
.zj-room-clock {
  color: var(--zj-muted);
}
.zj-tally {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid var(--zj-muted);
}
.zj-tally.is-live {
  border-color: var(--zj-accent);
  background: var(--zj-accent);
  animation: zj-tally 1.6s ease-in-out infinite;
}
@keyframes zj-tally {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

.zj-dip {
  flex: 1 1 auto;
  min-height: 0;
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  overflow: hidden;
  background: linear-gradient(to right, var(--zj-panel) 50%, var(--zj-bg) 50%);
}
/* Each side scrolls on its own, so a long answer never pushes the question away. */
.zj-pane {
  position: relative;
  z-index: 1;
  min-width: 0;
  padding: 64px 64px 56px;
  overflow-y: auto;
}
.zj-pane.is-l {
  padding-right: 116px;
}
.zj-pane.is-r {
  padding-left: 116px;
}
.zj-pane-block {
  display: block;
  max-width: 440px;
}
.zj-pane.is-l .zj-pane-block {
  margin-left: auto;
}
.zj-pane.is-r .zj-pane-block {
  margin-right: auto;
}
.zj-who {
  display: block;
  font-size: 13px;
}
.zj-ask {
  margin: 12px 0 0;
  font-family: var(--zj-kai);
  font-size: 30px;
  line-height: 1.6;
  font-weight: 400;
  text-wrap: pretty;
  overflow-wrap: anywhere;
}
.zj-ask.is-quiet {
  font-size: 22px;
  color: var(--zj-muted);
}
.zj-say {
  margin: 12px 0 0;
  font-family: var(--zj-kai);
  font-size: 20px;
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.zj-pane .zj-actions {
  margin-top: 18px;
}
.zj-pane .zj-subtle {
  margin: 14px 0 0;
}
.zj-pane .zj-error {
  margin-top: 14px;
  border-radius: 10px;
}
.zj-pane .zj-form {
  margin-top: 12px;
}
.zj-pane .zj-form textarea {
  border-radius: 12px;
  padding: 14px 16px;
}
.zj-dip-axis {
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(to bottom, transparent, var(--zj-edge) 12%, var(--zj-edge) 88%, transparent);
  pointer-events: none;
}

/* The light. */
.zj-glow {
  position: absolute;
  top: 50%;
  width: 560px;
  height: 680px;
  margin-top: -340px;
  opacity: 0;
  transition: opacity 0.9s ease;
  pointer-events: none;
}
.zj-glow.is-l {
  right: 50%;
  transform-origin: 100% 50%;
  background: radial-gradient(farthest-side at 100% 50%, var(--zj-glow), transparent);
}
.zj-glow.is-r {
  left: 50%;
  transform-origin: 0 50%;
  background: radial-gradient(farthest-side at 0 50%, var(--zj-glow), transparent);
}
.zj-dip.is-idle .zj-glow.is-l {
  opacity: 0.5;
}
.zj-dip.is-speaking .zj-glow.is-l {
  opacity: 1;
  animation: zj-speak 1.1s ease-in-out infinite alternate;
}
.zj-dip.is-listening .zj-glow.is-r {
  opacity: 1;
  animation: zj-speak 0.9s ease-in-out infinite alternate;
}
.zj-dip.is-thinking .zj-glow {
  animation: zj-think 2.4s ease-in-out infinite;
}
.zj-dip.is-thinking .zj-dip-axis {
  animation: zj-axis 2.4s ease-in-out infinite;
}
/* Real loudness replaces the simulated pulse while the meter is live. */
.zj-dip[data-levels='on'] .zj-glow {
  animation: none;
  transition: none;
}
.zj-dip[data-levels='on'] .zj-glow.is-l {
  opacity: calc(0.14 + var(--zj-level-out, 0) * 0.86);
  transform: scale(calc(1 + var(--zj-level-out, 0) * 0.1));
}
.zj-dip[data-levels='on'] .zj-glow.is-r {
  opacity: calc(0.14 + var(--zj-level-in, 0) * 0.86);
  transform: scale(calc(1 + var(--zj-level-in, 0) * 0.1));
}
@keyframes zj-speak {
  0% {
    opacity: 0.6;
    transform: scale(1);
  }
  30% {
    opacity: 1;
    transform: scale(1.06);
  }
  55% {
    opacity: 0.72;
    transform: scale(1.02);
  }
  100% {
    opacity: 0.95;
    transform: scale(1.05);
  }
}
@keyframes zj-think {
  0%,
  100% {
    opacity: 0.2;
    transform: scaleX(0.35);
  }
  50% {
    opacity: 0.42;
    transform: scaleX(0.5);
  }
}
@keyframes zj-axis {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

/* Countdown shown over the axis while the call connects. */
.zj-count {
  position: absolute;
  z-index: 2;
  inset: 0;
  display: grid;
  place-items: center;
  background: var(--zj-bg);
  pointer-events: none;
}
.zj-count span {
  font-size: 180px;
  line-height: 1;
  font-weight: 200;
  font-variant-numeric: tabular-nums;
  animation: zj-count 0.8s ease both;
}
@keyframes zj-count {
  0% {
    opacity: 0;
    transform: scale(0.86);
  }
  25% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale(1.08);
  }
}

/* After the call: transcript review and the report use the full width. */
.zj-room-after {
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
  padding: 8px 32px 48px;
}
.zj-room-after textarea {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 12px 14px;
  border: 1px solid var(--zj-line);
  border-radius: 12px;
  background: var(--zj-bg);
  color: var(--zj-ink);
  line-height: 1.7;
  resize: vertical;
}
.zj-room-scroll {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
.zj-room-scroll > .zj-room {
  flex: 1 0 auto;
  min-height: 440px;
}

@container (max-width: 759px) {
  .zj-dip {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: none;
    overflow-y: auto;
    background: var(--zj-bg);
  }
  .zj-pane {
    overflow: visible;
  }
  .zj-pane,
  .zj-pane.is-l,
  .zj-pane.is-r {
    padding: 32px 24px;
  }
  .zj-pane.is-l {
    background: var(--zj-panel);
  }
  .zj-pane.is-l .zj-pane-block,
  .zj-pane.is-r .zj-pane-block {
    margin: 0;
    max-width: none;
  }
  .zj-dip-axis,
  .zj-glow {
    display: none;
  }
  .zj-room-bar {
    padding: 8px 16px;
  }
  .zj-ask {
    font-size: 24px;
  }
  .zj-count span {
    font-size: 120px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .zj-glow,
  .zj-dip-axis,
  .zj-tally.is-live,
  .zj-count span {
    animation: none !important;
  }
  .zj-dip[data-levels='on'] .zj-glow {
    transform: none !important;
  }
}
`;var Ar=`/*
 * Score step: sits between the resume and the start on the same axis.
 * The dial rides the axis; the job side reads the fit, the candidate side
 * reads the resume itself. The verdict bar and the revision panel straddle
 * both sides, like the start bar.
 */
@property --zj-p {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}
.zj-sec.is-score {
  grid-template-rows: auto auto auto;
}
.zj-sec.is-score .zj-side {
  padding-bottom: 28px;
}

/* The dial replaces the node and carries the score on the axis. */
.zj-dial {
  --zj-p: 0;
  position: absolute;
  left: 50%;
  top: 84px;
  z-index: 1;
  width: 112px;
  height: 112px;
  margin-left: -56px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background:
    radial-gradient(closest-side, var(--zj-bg) calc(100% - 5px), transparent calc(100% - 4px)),
    conic-gradient(var(--zj-dial-color, var(--zj-accent)) calc(var(--zj-p) * 1%), var(--zj-line) 0);
  transition: --zj-p 1.4s var(--zj-ease);
  pointer-events: none;
}
.zj-dial.is-below {
  --zj-dial-color: var(--zj-edge);
}
/* The 80 mark: a short tick on the ring. */
.zj-dial::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(transparent 79.4%, var(--zj-ink) 79.4% 80.6%, transparent 80.6%);
  mask: radial-gradient(closest-side, transparent calc(100% - 9px), #000 calc(100% - 9px));
  opacity: 0.55;
}
.zj-dial-num {
  font-family: var(--zj-kai);
  font-size: 40px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.zj-dial-num small {
  display: block;
  margin-top: 4px;
  font-family: var(--dsw-font-family, inherit);
  font-size: 11px;
  color: var(--zj-muted);
  text-align: center;
}
.zj-dial.is-busy {
  background:
    radial-gradient(closest-side, var(--zj-bg) calc(100% - 5px), transparent calc(100% - 4px)),
    conic-gradient(from 0deg, transparent 0 70%, var(--zj-accent) 100%);
  animation: zj-spin 1.6s linear infinite;
}
.zj-dial.is-busy .zj-dial-num {
  animation: zj-spin 1.6s linear infinite reverse;
  color: var(--zj-muted);
  font-size: 22px;
}
.zj-dial.is-busy::after {
  display: none;
}
@keyframes zj-spin {
  to {
    transform: rotate(1turn);
  }
}

/* Criteria: name, four pips, the points they carry. */
.zj-crits {
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.zj-crits > li {
  border-top: 1px solid var(--zj-line);
}
.zj-crits > li:last-child {
  border-bottom: 1px solid var(--zj-line);
}
.zj-crit summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 46px;
  align-items: center;
  gap: 12px;
  min-height: 42px;
  cursor: pointer;
  list-style: none;
}
.zj-crit summary::-webkit-details-marker {
  display: none;
}
.zj-crit summary:focus-visible {
  outline: 2px solid var(--zj-accent);
  outline-offset: 2px;
  border-radius: 4px;
}
.zj-crit-name {
  overflow-wrap: anywhere;
}
.zj-crit-pts {
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--zj-muted);
}
.zj-pips {
  display: flex;
  gap: 3px;
}
.zj-pip {
  width: 14px;
  height: 6px;
  border-radius: 3px;
  background: var(--zj-line);
}
.zj-pip.is-on {
  background: var(--zj-accent);
  animation: zj-pip 0.5s var(--zj-ease) both;
  animation-delay: calc(var(--zj-i, 0) * 70ms + 300ms);
}
@keyframes zj-pip {
  from {
    background: var(--zj-line);
  }
}
.zj-crit-unknown {
  font-size: 12px;
  color: var(--zj-muted);
}
.zj-crit p {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.75;
  color: var(--zj-muted);
}
.zj-skel {
  height: 42px;
  border-top: 1px solid var(--zj-line);
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--zj-ink) 6%, transparent), transparent) 0 0 / 200% 100%;
  animation: zj-shimmer 1.6s linear infinite;
}
.zj-skel:last-child {
  border-bottom: 1px solid var(--zj-line);
}
@keyframes zj-shimmer {
  to {
    background-position: -200% 0;
  }
}

/* Verdict bar. */
.zj-sec.is-score .zj-bar {
  width: min(720px, calc(100% - 48px));
  margin-bottom: 24px;
}
.zj-verdict {
  margin: 0;
  font-family: var(--zj-kai);
  font-size: 22px;
  line-height: 1.5;
  color: var(--zj-ink);
}
.zj-sec.is-score .zj-bar .zj-verdict {
  color: var(--zj-ink);
}
.zj-delta {
  margin-left: 10px;
  font-family: var(--dsw-font-family, inherit);
  font-size: 13px;
  color: var(--zj-muted);
}
.zj-delta.is-up {
  color: var(--zj-accent);
}
.zj-hints {
  margin: 10px auto 0;
  padding: 0;
  max-width: 560px;
  list-style: none;
  text-align: left;
  font-size: 13px;
  line-height: 1.7;
  color: var(--zj-muted);
}
.zj-hints li {
  position: relative;
  padding-left: 14px;
}
.zj-hints li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.8em;
  width: 5px;
  height: 1px;
  background: var(--zj-edge);
}
.zj-bar .zj-flow-actions {
  justify-content: center;
}
.zj-weights {
  margin-top: 8px;
  font-size: 12px;
  color: var(--zj-muted);
}

/* Revision panel: proposed edits or the user's own edit, full width. */
.zj-revise {
  grid-column: 1 / -1;
  justify-self: center;
  width: min(880px, calc(100% - 48px));
  margin-bottom: 56px;
  padding: 20px 22px;
  border: 1px solid var(--zj-edge);
  border-radius: 16px;
  background: var(--zj-bg);
}
.zj-revise-head {
  margin: 0 0 12px;
  color: var(--zj-muted);
  line-height: 1.7;
}
.zj-revise-list {
  display: grid;
  gap: 10px;
  max-height: 46cqh;
  overflow: auto;
  margin: 0;
  padding: 0;
  list-style: none;
}
.zj-change {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px 12px;
  padding: 12px 14px;
  border: 1px solid var(--zj-line);
  border-radius: 12px;
  transition: border-color 0.2s ease-out, opacity 0.2s ease-out;
}
.zj-change:has(input:checked) {
  border-color: var(--zj-edge);
}
.zj-change:not(:has(input:checked)) {
  opacity: 0.6;
}
.zj-change input {
  margin-top: 4px;
  accent-color: var(--zj-accent);
}
.zj-change-pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  font-size: 13px;
  line-height: 1.75;
}
.zj-change-before {
  color: var(--zj-muted);
  text-decoration: line-through;
  text-decoration-color: color-mix(in srgb, var(--zj-muted) 50%, transparent);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.zj-change-after {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.zj-change-why {
  grid-column: 2;
  margin: 0;
  font-size: 12px;
  color: var(--zj-muted);
}
.zj-revise textarea.zj-field {
  min-height: 260px;
  max-height: 46cqh;
}
.zj-revise .zj-flow-actions {
  justify-content: flex-end;
}

@container (max-width: 759px) {
  .zj-dial {
    position: relative;
    left: auto;
    top: auto;
    margin: 32px auto 0;
    grid-column: 1;
  }
  .zj-sec.is-score .zj-side {
    padding-top: 28px;
  }
  .zj-change-pair {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (prefers-reduced-motion: reduce) {
  .zj-dial,
  .zj-dial.is-busy,
  .zj-dial.is-busy .zj-dial-num,
  .zj-pip.is-on,
  .zj-skel {
    transition: none;
    animation: none;
  }
}
`;var Dr=`/*
 * dev.10 shell, after the community plugin \u81EA\u5A92\u4F53\u5DE5\u4F5C\u53F0 (dsh-media-desk, MIT):
 * glass tab bar top left, quiet status and buttons top right, a collapsible
 * assistant on the right, black pill-free buttons, a serif display face and a
 * faint drifting wash. Colours bind to DSH host tokens so the dark theme follows DSH.
 */
.zj-desk {
  --d-ink: var(--dsw-alias-label-primary, #141414);
  --d-ink2: var(--dsw-alias-label-secondary, #4a4a48);
  --d-ink3: var(--dsw-alias-label-tertiary, #64645f);
  --d-on: var(--dsw-alias-label-primary-inverted, #ffffff);
  --d-primary: var(--dsw-alias-button-primary-fill, #141414);
  --d-primary-hover: var(--dsw-alias-button-primary-hover, #2c2c2a);
  --d-line: var(--dsw-alias-border-l2, rgba(20, 20, 20, 0.09));
  --d-line2: var(--dsw-alias-border-l4, rgba(20, 20, 20, 0.2));
  --d-hover: var(--dsw-alias-interactive-bg-hover, rgba(20, 20, 20, 0.06));
  --d-bg: var(--dsw-alias-bg-base, #f7f7f5);
  --d-card: var(--dsw-alias-bg-layer-2, #ffffff);
  --d-glass: color-mix(in srgb, var(--d-card) 74%, transparent);
  --d-shadow: var(--dsw-elevation-soft, 0 1px 2px rgba(0, 0, 0, 0.04), 0 6px 20px rgba(0, 0, 0, 0.05));
  --d-lift: 0 24px 80px rgba(0, 0, 0, 0.18);
  --d-warn: color-mix(in srgb, #b4500a 72%, var(--d-ink));
  --d-warn-bg: color-mix(in srgb, #c2410c 10%, transparent);
  --d-ok: color-mix(in srgb, #15803d 78%, var(--d-ink));
  --d-ok-bg: color-mix(in srgb, #15803d 11%, transparent);
  --d-serif: 'Songti SC', 'STSong', 'Noto Serif SC', 'Source Han Serif SC', Georgia, serif;
  --d-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  /* Older components read these; point them at the same palette. */
  --zj-bg: var(--d-bg);
  --zj-ink: var(--d-ink);
  --zj-muted: var(--d-ink3);
  --zj-accent: var(--d-primary);
  --zj-on-accent: var(--d-on);
  --zj-line: var(--d-line2);
  position: relative;
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: clip;
  background: var(--d-bg);
  color: var(--d-ink);
  font-size: 14px;
  line-height: 22px;
  -webkit-font-smoothing: antialiased;
}
body[data-ds-dark-theme] .zj-desk { color-scheme: dark; }
.zj-desk :focus-visible { outline: 2px solid var(--dsw-alias-link, #2f5bd3); outline-offset: 2px; }
.zj-desk :is(h1, h2, h3, p) { margin: 0; }

.zj-ambient { position: absolute; inset: 0; overflow: clip; pointer-events: none; }
.zj-ambient i { position: absolute; width: 56vmax; height: 56vmax; border-radius: 50%; filter: blur(70px); opacity: 0.5; animation: zj-drift 42s ease-in-out infinite alternate; }
.zj-ambient i:nth-child(1) { left: -18vmax; top: -24vmax; background: radial-gradient(circle, color-mix(in srgb, #d9e4ff 42%, var(--d-bg)), transparent 68%); }
.zj-ambient i:nth-child(2) { right: -14vmax; top: -8vmax; background: radial-gradient(circle, color-mix(in srgb, #f6e2ef 42%, var(--d-bg)), transparent 68%); animation-delay: -14s; }
.zj-ambient i:nth-child(3) { left: 22vmax; bottom: -34vmax; background: radial-gradient(circle, color-mix(in srgb, #e2f3e0 42%, var(--d-bg)), transparent 68%); animation-delay: -28s; }
@keyframes zj-drift { to { transform: translate3d(6vmax, 4vmax, 0) scale(1.12); } }

.zj-desk .zj-main { position: relative; z-index: 1; flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; background: transparent; }

/* Top bar */
.zj-top { flex: none; display: flex; align-items: center; gap: 8px; padding: 14px 18px; padding-left: max(18px, var(--dsh-frame-leading-clearance, 0px)); }
.zj-top-space { flex: 1; }
.zj-wordmark { display: inline-flex; align-items: center; gap: 7px; padding: 0 8px 0 4px; font-family: var(--d-serif); font-size: 18px; }
.zj-tabs-nav { display: flex; gap: 2px; padding: 4px; border-radius: 16px; background: var(--d-glass); backdrop-filter: blur(24px) saturate(160%); box-shadow: var(--d-shadow); }
.zj-tabs-nav button { height: 32px; padding: 0 13px; border: 0; border-radius: 12px; background: none; color: var(--d-ink2); font-size: 13px; line-height: 32px; white-space: nowrap; transition: background 0.18s var(--d-ease), color 0.18s var(--d-ease); }
.zj-tabs-nav button:hover { background: var(--d-hover); color: var(--d-ink); }
.zj-tabs-nav button.is-on { background: var(--d-primary); color: var(--d-on); }
.zj-chip { display: inline-flex; align-items: center; gap: 7px; height: 36px; padding: 0 13px; border: 0; border-radius: 12px; background: var(--d-glass); backdrop-filter: blur(24px); box-shadow: var(--d-shadow); color: var(--d-ink); font-size: 13px; white-space: nowrap; }
.zj-chip:hover { background: var(--d-card); }
.zj-chip[aria-pressed='true'] { background: var(--d-card); }
.zj-dot { width: 8px; height: 8px; border-radius: 50%; background: #c2410c; flex: none; }
.zj-chip.is-ok .zj-dot { background: #15803d; }
.zj-icon-btn { display: inline-flex; align-items: center; justify-content: center; flex: none; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 12px; background: none; color: var(--d-ink2); }
.zj-icon-btn:hover { background: var(--d-hover); color: var(--d-ink); }
.zj-icon-btn.is-glass { width: 36px; height: 36px; background: var(--d-glass); backdrop-filter: blur(24px); box-shadow: var(--d-shadow); }
.zj-icon-btn.is-glass:hover { background: var(--d-card); }

.zj-desk .zj-progress { position: absolute; left: 0; right: 0; top: 0; z-index: 3; }
.zj-desk .zj-error { margin: 0 18px 8px; border-radius: 14px; }
.zj-desk .zj-task-card { margin: 0 18px 8px; padding: 8px 10px 8px 16px; border: 0; border-radius: 14px; background: var(--d-glass); backdrop-filter: blur(24px); box-shadow: var(--d-shadow); }
.zj-desk .zj-task-card > div { display: flex; align-items: baseline; gap: 10px; }
.zj-scroll { flex: 1; min-height: 0; overflow: auto; animation: zj-rise 0.45s var(--d-ease) both; }
.zj-scroll.is-room { overflow: hidden; display: flex; flex-direction: column; animation-duration: 0.3s; }
.zj-scroll.is-room > * { flex: 1; min-height: 0; }
/* Opacity only: a transform here would trap the side sheet inside the scrolling area. */
@keyframes zj-rise { from { opacity: 0; } }

/* Buttons and fields, as in the reference: 36px, 12px corners, black primary. */
.zj-desk .zj-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 36px; padding: 0 15px; border: 0.5px solid var(--d-line2); border-radius: 12px; background: var(--d-card); color: var(--d-ink); font-size: 13px; line-height: 20px; white-space: nowrap; transition: background 0.15s, transform 0.25s var(--d-ease); }
.zj-desk .zj-btn:hover:not(:disabled) { background: var(--d-hover); border-color: var(--d-line2); }
.zj-desk .zj-btn:active:not(:disabled) { transform: scale(0.97); }
.zj-desk .zj-btn.primary { background: var(--d-primary); color: var(--d-on); border-color: transparent; font-weight: 500; }
.zj-desk .zj-btn.primary:hover:not(:disabled) { background: var(--d-primary-hover); }
.zj-desk .zj-btn.small { min-height: 30px; padding: 0 11px; border-radius: 9px; font-size: 12px; }
.zj-desk .zj-btn.quiet { background: transparent; border-color: transparent; color: var(--d-ink2); }
.zj-desk .zj-btn.quiet:hover:not(:disabled) { background: var(--d-hover); color: var(--d-ink); }
.zj-desk .zj-btn:disabled { opacity: 0.42; }
.zj-seg { display: inline-flex; flex-wrap: wrap; gap: 0; padding: 4px; border-radius: 12px; background: var(--d-hover); }
.zj-seg button { height: 30px; min-width: 36px; padding: 0 12px; border: 0; border-radius: 9px; background: none; color: var(--d-ink3); font-size: 13px; white-space: nowrap; transition: background 0.2s var(--d-ease), color 0.2s; }
.zj-seg button:hover:not(:disabled) { color: var(--d-ink); }
.zj-seg button.is-on { background: var(--d-card); color: var(--d-ink); box-shadow: var(--d-shadow); }
.zj-control { display: flex; flex-direction: column; gap: 6px; }
.zj-desk .zj-control :is(input:not([type='file']), select, textarea), .zj-input { width: 100%; min-height: 40px; padding: 0 12px; border: 0.5px solid var(--d-line2); border-radius: 12px; background: var(--d-card); color: var(--d-ink); font: inherit; }
.zj-desk .zj-control textarea, textarea.zj-input { padding: 10px 12px; line-height: 22px; resize: vertical; }
.zj-input.is-small { min-height: 30px; height: 30px; width: auto; max-width: 180px; padding: 0 8px; border-radius: 9px; font-size: 12px; }
.zj-label { font-size: 12px; line-height: 18px; color: var(--d-ink3); letter-spacing: 0.02em; }
.zj-hint { font-size: 12px; line-height: 18px; color: var(--d-ink3); }
.zj-muted { color: var(--d-ink3); }
.zj-badge { display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 9px; border-radius: 999px; background: var(--d-ok-bg); color: var(--d-ok); font-size: 12px; line-height: 22px; white-space: nowrap; }
.zj-badge.is-warn { background: var(--d-warn-bg); color: var(--d-warn); }
.zj-badge.is-gray { background: var(--d-hover); color: var(--d-ink2); }
.zj-stack { display: flex; flex-direction: column; gap: 14px; }
.zj-desk .zj-flow-actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; justify-content: flex-start; }
.zj-desk .zj-card { background: var(--d-card); border: 0.5px solid var(--d-line); border-radius: 20px; box-shadow: var(--d-shadow); }
.zj-note { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 14px; background: var(--d-hover); color: var(--d-ink2); }
.zj-note > span { flex: 1; min-width: 200px; }
.zj-note.is-warn { background: var(--d-warn-bg); color: var(--d-warn); }
.zj-warn-line { padding: 10px 14px; border-radius: 14px; background: var(--d-warn-bg); color: var(--d-warn); }
.zj-ok-line { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 14px; background: var(--d-ok-bg); color: var(--d-ok); }
.zj-ok-line > span { flex: 1; min-width: 180px; }

/* Pages */
.zj-page { max-width: 1180px; margin: 0 auto; padding: 8px 32px 56px; display: flex; flex-direction: column; gap: 22px; }
.zj-page-head { display: flex; flex-direction: column; gap: 6px; max-width: 860px; }
.zj-page-head.is-row { max-width: none; flex-direction: row; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px; }
.zj-page-head.is-row > div:first-child { display: flex; flex-direction: column; gap: 6px; min-width: 260px; flex: 1; }
.zj-display { font-family: var(--d-serif); font-weight: 400; font-size: 40px; line-height: 54px; text-wrap: balance; }
.zj-display.is-md { font-size: 34px; line-height: 46px; }
.zj-display.is-num { font-size: 34px; line-height: 40px; font-variant-numeric: tabular-nums; }
.zj-intro { color: var(--d-ink3); font-size: 16px; line-height: 26px; }
.zj-section { display: flex; flex-direction: column; gap: 10px; }
.zj-section-title { font-size: 15px; line-height: 22px; font-weight: 600; }

/* Interview page: the checklist and the start card */
.zj-desk-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: 20px; align-items: stretch; }
.zj-checklist { padding: 14px 24px; }
.zj-rows { position: relative; list-style: none; margin: 0; padding: 0; }
.zj-rows::before { content: ''; position: absolute; left: 15px; top: 30px; bottom: 30px; width: 1px; background: var(--d-line2); }
.zj-row { position: relative; display: flex; align-items: center; gap: 14px; padding: 16px 0; }
.zj-row + .zj-row { border-top: 0.5px solid var(--d-line); }
.zj-row-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.zj-row-text strong { font-weight: 600; }
.zj-step { position: relative; z-index: 1; display: grid; place-items: center; flex: none; width: 30px; height: 30px; border-radius: 50%; border: 1.5px solid var(--d-line2); background: var(--d-card); color: var(--d-ink); font-size: 13px; font-weight: 600; transition: background 0.4s var(--d-ease), border-color 0.4s; }
.zj-step.is-done { background: var(--d-primary); border-color: var(--d-primary); color: var(--d-on); }
.zj-step.is-warn { border-color: currentColor; color: var(--d-warn); background: color-mix(in srgb, var(--d-warn-bg) 100%, var(--d-card)); }
.zj-start { padding: 30px; display: flex; flex-direction: column; gap: 16px; min-height: 420px; }
.zj-start-opts { display: flex; flex-wrap: wrap; gap: 10px; }
.zj-start-go { margin-top: auto; padding-top: 6px; }
.zj-start-go .zj-btn { width: 100%; min-height: 52px; border-radius: 16px; font-size: 15px; }

/* Side sheet and settings window: they stay inside the plugin panel. */
.zj-scrim { position: absolute; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(20, 20, 20, 0.22); animation: zj-fade 0.2s both; }
.zj-scrim.is-side { justify-content: flex-end; align-items: stretch; padding: 12px; }
@keyframes zj-fade { from { opacity: 0; } }
.zj-sheet { display: flex; flex-direction: column; width: 480px; max-width: 100%; height: 100%; overflow: hidden; background: var(--d-card); border-radius: 24px; box-shadow: var(--d-lift); animation: zj-slide 0.3s var(--d-ease) both; }
.zj-sheet.is-wide { width: 640px; }
@keyframes zj-slide { from { opacity: 0; transform: translateX(24px); } }
.zj-sheet-head, .zj-window-head { flex: none; display: flex; align-items: center; gap: 8px; padding: 20px 16px 6px 24px; }
.zj-sheet-head h2, .zj-window-head h2 { flex: 1; font-size: 17px; line-height: 26px; font-weight: 600; }
.zj-sheet-body { flex: 1; min-height: 0; overflow: auto; padding: 10px 24px 28px; }
.zj-window { display: flex; flex-direction: column; width: 580px; max-width: 100%; max-height: 100%; background: var(--d-card); border-radius: 28px; box-shadow: var(--d-lift); animation: zj-pop 0.28s var(--d-ease) both; }
@keyframes zj-pop { from { opacity: 0; transform: translateY(10px) scale(0.98); } }
.zj-window-head { padding: 22px 18px 4px 26px; }
.zj-window-body { flex: 1; min-height: 0; overflow: auto; padding: 4px 26px 8px; }
.zj-window-foot { flex: none; display: flex; justify-content: flex-end; gap: 8px; padding: 14px 26px 22px; border-top: 0.5px solid var(--d-line); }
.zj-set { display: flex; flex-direction: column; gap: 14px; padding: 12px 0 18px; }
.zj-set-head { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.zj-set-head h3 { font-size: 15px; line-height: 22px; font-weight: 600; }
.zj-set-head .zj-badge { margin-left: auto; }
.zj-set-name { font-weight: 600; }
.zj-set-test { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.zj-set-test .zj-hint { flex: 1; min-width: 200px; }
.zj-set-status:empty { display: none; }
.zj-set-status { display: flex; flex-direction: column; gap: 8px; }
.zj-link-btn { align-self: flex-start; padding: 2px 0; border: 0; background: none; color: var(--d-ink2); font-size: 13px; text-decoration: underline; text-decoration-color: var(--d-line2); text-underline-offset: 3px; }
.zj-link-btn:hover { color: var(--d-ink); }
.zj-radios { display: flex; flex-direction: column; gap: 8px; }
.zj-radio { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border: 0.5px solid var(--d-line2); border-radius: 12px; background: var(--d-card); color: var(--d-ink); text-align: left; }
.zj-radio code { flex: 1; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
.zj-radio.is-on { border-color: var(--d-primary); box-shadow: 0 0 0 1px var(--d-primary); }
.zj-rule { height: 0.5px; background: var(--d-line2); }
.zj-window .zj-rail-footer { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 0; border: 0; }
.zj-window .zj-rail-footer .zj-btn.quiet { border-color: var(--d-line2); background: var(--d-card); color: var(--d-ink); }
.zj-window .zj-rail-footer > p { flex-basis: 100%; margin: 0; font-size: 12px; line-height: 18px; color: var(--d-ink3); }

/* The interview room keeps its own blue voice light. */
.zj-desk .zj-room { --zj-accent: var(--dsw-alias-state-business-primary, #2443b8); --zj-glow: color-mix(in srgb, var(--zj-accent) 24%, transparent); --zj-on-accent: var(--d-on); }

/* Score in its sheet */
.zj-score-panel { display: flex; flex-direction: column; gap: 18px; }
.zj-score-top { display: flex; flex-wrap: wrap; align-items: center; gap: 24px; }
.zj-score-panel .zj-dial { position: relative; left: auto; top: auto; margin: 0; flex: none; --zj-bg: var(--d-card); }
.zj-score-verdict { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 10px; }
.zj-score-verdict .zj-verdict { font-size: 15px; line-height: 24px; }
.zj-score-parts { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr)); gap: 18px; }
.zj-score-parts section { display: flex; flex-direction: column; gap: 6px; }
.zj-score-parts h3 { font-size: 15px; font-weight: 600; }
.zj-score-parts .is-quiet { opacity: 0.5; }
.zj-desk .zj-doc { display: flex; flex-direction: column; gap: 8px; padding: 14px 16px; border: 0.5px solid var(--d-line); border-radius: 14px; background: color-mix(in srgb, var(--d-hover) 50%, var(--d-card)); }
.zj-desk .zj-doc .zj-badge { align-self: flex-start; }
.zj-desk .zj-doc-text { max-height: 320px; overflow: auto; white-space: pre-line; font-size: 13px; line-height: 22px; color: var(--d-ink2); }
.zj-desk .zj-drop { min-height: 120px; border-radius: 16px; }

/* Review and library */
.zj-groups { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr)); gap: 16px; }
.zj-group { padding: 18px 20px 10px; display: flex; flex-direction: column; gap: 6px; }
.zj-list-rows { list-style: none; margin: 0; padding: 0; }
.zj-list-row { display: flex; align-items: center; gap: 10px; width: 100%; padding: 11px 6px; border: 0; border-top: 0.5px solid var(--d-line); background: none; color: var(--d-ink); text-align: left; border-radius: 8px; }
.zj-list-rows > li:first-child .zj-list-row { border-top: 0; }
.zj-list-row:hover { background: var(--d-hover); }
.zj-list-row strong { flex: 1; min-width: 0; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.zj-section > .zj-list-rows { background: var(--d-card); border: 0.5px solid var(--d-line); border-radius: 20px; box-shadow: var(--d-shadow); padding: 6px 14px; }
.zj-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr)); gap: 16px; }
.zj-tile { padding: 20px 22px; display: flex; flex-direction: column; gap: 10px; }
.zj-tile-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.zj-tile-score { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
.zj-tile-score .zj-muted { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.zj-tile-actions { display: flex; gap: 8px; margin-top: auto; }
.zj-clamp { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.zj-desk .zj-report-trend { background: var(--d-card); border: 0.5px solid var(--d-line); border-radius: 20px; box-shadow: var(--d-shadow); }
.zj-desk .zj-material-studio, .zj-desk .zj-paper { border-radius: 20px; }
.zj-desk .zj-page .zj-body { padding: 0; overflow: visible; }

/* Home (dev.11): the next interview, the record so far, and a way into each page. */
.zj-display.is-xl { font-size: 46px; line-height: 60px; }
.zj-home > * { animation: zj-up 0.5s var(--d-ease) both; animation-delay: calc(var(--i, 0) * 55ms); }
.zj-home .zj-home-how > li { animation: zj-up 0.5s var(--d-ease) both; animation-delay: calc(var(--i, 0) * 55ms); }
@keyframes zj-up { from { opacity: 0; transform: translateY(8px); } }
.zj-home.is-new { padding-top: 40px; gap: 30px; }
.zj-home-intro { gap: 10px; }
.zj-home-intro .zj-flow-actions { margin-top: 14px; }
.zj-desk .zj-btn svg { flex: none; }
.zj-home-how { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr)); gap: 16px; }
.zj-how { padding: 20px 22px 22px; display: flex; flex-direction: column; gap: 8px; }
.zj-how-num { font-family: var(--d-serif); font-size: 30px; line-height: 36px; color: var(--d-ink3); font-variant-numeric: tabular-nums; }
.zj-how strong { font-size: 15px; line-height: 22px; font-weight: 600; }
.zj-home-voice { display: flex; align-items: center; gap: 14px; padding: 16px 18px 16px 22px; }
.zj-home-voice > div { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.zj-home-voice.is-ok .zj-dot { background: #15803d; }
.zj-home-hero { position: relative; overflow: hidden; display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(260px, 1fr); gap: 32px; align-items: center; padding: 30px 32px; }
.zj-home-hero::after { content: ''; position: absolute; right: -90px; top: -120px; width: 320px; height: 320px; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, var(--d-hero-glow), transparent 70%); }
.zj-desk { --d-hero-glow: color-mix(in srgb, #d9e4ff 50%, transparent); }
body[data-ds-dark-theme] .zj-desk { --d-hero-glow: color-mix(in srgb, #3b5bdb 14%, transparent); }
.zj-home-hero > * { position: relative; z-index: 1; }
.zj-home-hero-text { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.zj-home-hero-text .zj-display { overflow-wrap: anywhere; }
.zj-home-hero-text .zj-flow-actions { margin-top: 14px; }
.zj-home-steps { list-style: none; margin: 0; padding: 4px 0 4px 26px; border-left: 0.5px solid var(--d-line2);
  display: grid; grid-template-columns: 24px max-content minmax(0, 1fr); align-items: center; column-gap: 14px; row-gap: 16px; }
.zj-home-step { display: contents; }
.zj-home-step .zj-step { width: 24px; height: 24px; font-size: 12px; border-width: 1.2px; }
.zj-home-step strong { font-weight: 600; font-size: 13px; white-space: nowrap; }
.zj-home-step .zj-hint { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
.zj-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr)); gap: 16px; }
.zj-stat { position: relative; padding: 18px 22px 18px; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.zj-stat .zj-display.is-num { font-size: 36px; line-height: 46px; }
.zj-stat .zj-display small { margin-left: 4px; font-family: inherit; font-size: 13px; color: var(--d-ink3); }
.zj-stat .zj-display.is-below { color: var(--d-warn); }
.zj-stat .zj-hint { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 4px; }
.zj-spark { position: absolute; right: 20px; top: 22px; width: 104px; height: 38px; color: var(--d-ink2); overflow: visible; }
.zj-spark polyline { stroke-dasharray: 1; stroke-dashoffset: 1; animation: zj-draw 1.1s 0.3s var(--d-ease) forwards; }
@keyframes zj-draw { to { stroke-dashoffset: 0; } }
.zj-section-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.zj-home-roles .zj-home-role { display: flex; align-items: center; gap: 12px; min-height: 48px; padding: 8px 6px; }
.zj-home-roles .zj-home-role + .zj-home-role { border-top: 0.5px solid var(--d-line); }
.zj-home-role strong { flex: 1; min-width: 0; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.zj-desk.zj-narrow .zj-home-hero { grid-template-columns: minmax(0, 1fr); gap: 18px; padding: 24px; }
.zj-desk.zj-narrow .zj-home-steps { border-left: 0; border-top: 0.5px solid var(--d-line2); padding: 12px 0 0; }
.zj-desk.zj-narrow .zj-display.is-xl { font-size: 36px; line-height: 48px; }
.zj-desk.zj-narrow .zj-home.is-new { padding-top: 16px; }
.zj-desk.zj-narrow .zj-home-role .zj-hint { display: none; }

/* Assistant */
.zj-dock { position: relative; z-index: 2; flex: none; width: 336px; display: flex; flex-direction: column; margin: 12px 12px 12px 0; border-radius: 28px; overflow: hidden; background: var(--d-glass); backdrop-filter: blur(24px) saturate(160%); box-shadow: var(--d-shadow); }
.zj-dock-head { flex: none; display: flex; align-items: center; gap: 8px; padding: 16px 12px 6px 18px; }
.zj-dock-bar { flex: none; display: flex; align-items: center; gap: 8px; padding: 0 14px 8px 18px; }
.zj-dock-chat { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: auto; }
.zj-dock-chat > .zj-chat { flex: 1; min-height: 0; }
.zj-dock-note { padding: 12px 18px; }
.zj-dock .zj-suggestions { flex: none; display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 12px 12px; }
.zj-dock .zj-receipts { margin: 0 14px 6px; }
.zj-dock .zj-assistant-empty { padding: 18px; display: flex; flex-direction: column; gap: 12px; align-items: flex-start; color: var(--d-ink3); }
.zj-dock .zj-context-preview { margin: 0 14px 8px; padding: 12px; border-radius: 14px; background: var(--d-card); }
.zj-dock .zj-context-notice { margin: 0 18px 8px; }

.zj-toast { position: absolute; left: 50%; bottom: 24px; z-index: 60; transform: translateX(-50%); display: flex; align-items: center; gap: 14px; min-height: 44px; padding: 6px 8px 6px 18px; border-radius: 14px; background: var(--d-primary); color: var(--d-on); font-size: 13px; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2); animation: zj-fade 0.25s both; }
.zj-toast button { height: 30px; padding: 0 10px; border: 0; border-radius: 9px; background: color-mix(in srgb, var(--d-on) 16%, transparent); color: var(--d-on); }

/* Narrow panels: one column, the assistant floats over the page. */
.zj-desk.zj-narrow .zj-desk-grid { grid-template-columns: minmax(0, 1fr); }
.zj-desk.zj-narrow .zj-page { padding: 4px 16px 40px; }
.zj-desk.zj-narrow .zj-display { font-size: 32px; line-height: 44px; }
.zj-desk.zj-narrow .zj-top { flex-wrap: wrap; }
.zj-desk.zj-narrow .zj-wordmark span { display: none; }
.zj-desk.zj-narrow .zj-dock { position: absolute; right: 0; top: 0; bottom: 0; z-index: 40; width: min(360px, calc(100% - 24px)); box-shadow: var(--d-lift); background: var(--d-card); }
.zj-desk.zj-narrow .zj-start { min-height: 0; }

@media (prefers-reduced-motion: reduce) {
  .zj-ambient i, .zj-scroll, .zj-scrim, .zj-sheet, .zj-window, .zj-toast, .zj-home > *, .zj-home .zj-home-how > li { animation: none; }
  .zj-spark polyline { animation: none; stroke-dashoffset: 0; }
  .zj-step { transition: none; }
}
`;var N=ye(require("react"),1);var T=ye(require("react"),1),Ft=T.default.createContext(null);function It({size:e=22}){let t="M22 6H38C42.8 6 45.8 7.4 48 10L10 48C7.4 45.8 6 42.8 6 38V22C6 11.8 11.8 6 22 6Z";return T.default.createElement("svg",{width:e,height:e,viewBox:"0 0 64 64",fill:"currentColor",style:{color:"var(--dsw-alias-label-primary, #212523)",flexShrink:0},"aria-hidden":"true",focusable:"false"},T.default.createElement("path",{d:t}),T.default.createElement("path",{d:t,transform:"rotate(180 32 32)"}))}function z({children:e,primary:t,small:r,quiet:i,...n}){return T.default.createElement("button",{type:"button",className:`zj-btn${t?" primary":""}${r?" small":""}${i?" quiet":""}`,...n},e)}function Fe({title:e,children:t,onClose:r,t:i,busy:n=!1}){let o=T.default.useContext(Ft),a=T.default.useRef(null);T.default.useEffect(()=>{let c=document.activeElement;return(a.current?.querySelector("input,textarea,select")||a.current?.querySelector("button"))?.focus(),()=>{c instanceof HTMLElement&&c.isConnected&&c.focus()}},[]);let l=c=>{if(c.key==="Escape"&&(c.preventDefault(),n||r()),c.key!=="Tab")return;let u=[...a.current.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]')],x=u[0],k=u.at(-1);c.shiftKey&&document.activeElement===x?(c.preventDefault(),k?.focus()):!c.shiftKey&&document.activeElement===k&&(c.preventDefault(),x?.focus())},s=T.default.useId();return T.default.createElement("div",{className:"zj-modal",onKeyDown:l},T.default.createElement("section",{ref:a,className:"zj-dialog",role:"dialog","aria-modal":"true","aria-labelledby":s},T.default.createElement("div",{className:"zj-dialog-head"},T.default.createElement("h2",{id:s},e),n&&o?.canCancel&&T.default.createElement(z,{small:!0,onClick:()=>{o.cancel?.()}},i("cancelTask")),T.default.createElement(z,{quiet:!0,disabled:n,onClick:r},i("close"))),t))}function Pr(e,t,r){return T.default.useEffect(()=>{let i=document.activeElement;return(e.current?.querySelector("[data-autofocus]")||e.current?.querySelector("input,textarea,select")||e.current?.querySelector("button"))?.focus(),()=>{i instanceof HTMLElement&&i.isConnected&&i.focus()}},[]),i=>{if(i.key==="Escape"&&(i.preventDefault(),i.stopPropagation(),r||t()),i.key!=="Tab")return;let n=[...e.current.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]')],o=n[0],a=n.at(-1);i.shiftKey&&document.activeElement===o?(i.preventDefault(),a?.focus()):!i.shiftKey&&document.activeElement===a&&(i.preventDefault(),o?.focus())}}var Br=()=>T.default.createElement("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round","aria-hidden":"true"},T.default.createElement("path",{d:"M6 6l12 12M18 6L6 18"}));function Et({title:e,children:t,onClose:r,t:i,busy:n=!1,wide:o=!1}){let a=T.default.useRef(null),l=Pr(a,r,n),s=T.default.useId();return T.default.createElement("div",{className:"zj-scrim is-side",onKeyDown:l,onMouseDown:c=>{c.target===c.currentTarget&&!n&&r()}},T.default.createElement("section",{ref:a,className:`zj-sheet${o?" is-wide":""}`,role:"dialog","aria-modal":"true","aria-labelledby":s},T.default.createElement("header",{className:"zj-sheet-head"},T.default.createElement("h2",{id:s},e),T.default.createElement("button",{type:"button",className:"zj-icon-btn","aria-label":i("close"),disabled:n,onClick:r},T.default.createElement(Br,null))),T.default.createElement("div",{className:"zj-sheet-body"},t)))}function Lr({title:e,children:t,onClose:r,t:i,busy:n=!1,footer:o=null}){let a=T.default.useRef(null),l=Pr(a,r,n),s=T.default.useId();return T.default.createElement("div",{className:"zj-scrim",onKeyDown:l,onMouseDown:c=>{c.target===c.currentTarget&&!n&&r()}},T.default.createElement("section",{ref:a,className:"zj-window",role:"dialog","aria-modal":"true","aria-labelledby":s},T.default.createElement("header",{className:"zj-window-head"},T.default.createElement("h2",{id:s},e),T.default.createElement("button",{type:"button",className:"zj-icon-btn","aria-label":i("close"),onClick:r},T.default.createElement(Br,null))),T.default.createElement("div",{className:"zj-window-body"},t),o&&T.default.createElement("footer",{className:"zj-window-foot"},o)))}function Je({values:e,active:t,onChange:r,t:i}){return T.default.createElement("div",{className:"zj-tabs",role:"tablist",onKeyDown:o=>{if(!["ArrowLeft","ArrowRight","Home","End"].includes(o.key))return;o.preventDefault();let a=e.indexOf(t),l=o.key==="Home"?0:o.key==="End"?e.length-1:(a+(o.key==="ArrowLeft"?-1:1)+e.length)%e.length;r(e[l]),o.currentTarget.querySelectorAll('[role="tab"]')[l]?.focus()}},e.map(o=>T.default.createElement("button",{type:"button",key:o,role:"tab","aria-selected":t===o,tabIndex:t===o?0:-1,className:t===o?"is-active":"",onClick:()=>r(o)},i(o))))}function Wt({t:e,busy:t,disabled:r=!1,onClose:i,submit:n="save",saving:o=!1}){return T.default.createElement("div",{className:"zj-dialog-foot"},T.default.createElement(z,{disabled:o,onClick:i},e("cancel")),T.default.createElement(z,{type:"submit",primary:!0,disabled:t||r},e(t?"processing":n)))}function Ue(){let e=!1;return async t=>{if(!e){e=!0;try{return await t()}finally{e=!1}}}}function $t(e,t,r){let[i,n]=T.default.useState(()=>t||e),o=t||i;return[o,a=>{let l={...o,...a};n(l),r?.(l)}]}function Mr({t:e,busy:t,onClose:r,onSave:i,onUpload:n,material:o,version:a,initialKind:l="resume",draft:s,onDraftChange:c,saving:u=!1}){let[{mode:x,kind:k,title:h,text:v,url:w,file:S},j]=$t({mode:"paste",kind:o?.kind||l,title:o?.title||"",text:a?.text||"",url:"",file:null},s,c),b=async f=>{f.preventDefault(),!t&&(o?await i("material.update",{materialId:o.id,title:h,text:v}):x==="paste"?await i("material.add",{title:h,kind:k,text:v}):x==="url"?await i("material.fetch",{title:h,kind:k,url:w}):S&&await n(S,{title:h,kind:k}))};return T.default.createElement(Fe,{title:e(o?"newVersion":"addMaterial"),onClose:r,t:e,busy:u},!o&&T.default.createElement(Je,{values:["paste","file","url"],active:x,onChange:f=>{u||j({mode:f})},t:e}),T.default.createElement("form",{className:"zj-form",onSubmit:b},T.default.createElement("div",{className:"zj-inline-fields"},T.default.createElement("label",null,e("title"),T.default.createElement("input",{required:!0,disabled:u,maxLength:160,value:h,onChange:f=>j({title:f.target.value})})),T.default.createElement("label",null,e("kind"),T.default.createElement("select",{value:k,onChange:f=>j({kind:f.target.value}),disabled:u||!!o},["resume","job","company","experience"].map(f=>T.default.createElement("option",{key:f,value:f},e(f==="company"?"companyMaterial":f)))))),x==="paste"&&T.default.createElement("label",null,e("content"),T.default.createElement("textarea",{required:!0,disabled:u,rows:12,maxLength:2e5,value:v,onChange:f=>j({text:f.target.value})})),x==="url"&&T.default.createElement("label",null,e("sourceUrl"),T.default.createElement("input",{required:!0,disabled:u,type:"url",value:w,onChange:f=>j({url:f.target.value})})),x==="file"&&T.default.createElement("label",null,e("chooseFile"),T.default.createElement("input",{required:!S,disabled:u,type:"file",accept:".pdf,.docx,.txt,.png,.jpg,.jpeg",onChange:f=>{let E=f.target.files?.[0];E&&j({file:E})}}),S&&T.default.createElement("span",null,S.name),T.default.createElement("span",null,e("fileHelp"))),T.default.createElement(Wt,{t:e,busy:t,saving:u,onClose:r,submit:o?"newVersion":x==="url"?"fetch":x==="file"?"import":"save"})))}function Vr({t:e,busy:t,onClose:r,onSave:i,draft:n,onDraftChange:o,saving:a=!1,editing:l=!1}){let[{title:s,company:c,description:u},x]=$t({title:"",company:"",description:""},n,o);return T.default.createElement(Fe,{title:e(l?"deskEditGoal":"newGoal"),onClose:r,t:e,busy:a},T.default.createElement("form",{className:"zj-form",onSubmit:k=>{k.preventDefault(),t||i({title:s,company:c,description:u})}},T.default.createElement("label",null,e("title"),T.default.createElement("input",{required:!0,disabled:a,maxLength:160,value:s,onChange:k=>x({title:k.target.value})})),T.default.createElement("label",null,e("company"),T.default.createElement("input",{disabled:a,maxLength:160,value:c,onChange:k=>x({company:k.target.value})})),T.default.createElement("label",null,e("description"),T.default.createElement("textarea",{disabled:a,value:u,onChange:k=>x({description:k.target.value}),rows:4})),T.default.createElement(Wt,{t:e,busy:t,saving:a,onClose:r,submit:l?"save":"create"})))}function Or({t:e,state:t,busy:r,onClose:i,onSelect:n,resumesOnly:o=!1}){let a=t.materials.filter(l=>!o||l.kind==="resume").flatMap(l=>l.versions.filter(s=>s.confirmed).map(s=>({material:l,version:s})));return T.default.createElement(Fe,{title:e("selectMaterial"),onClose:i,t:e},a.length?a.map(({material:l,version:s})=>T.default.createElement("div",{className:"zj-attach",key:s.id},T.default.createElement("div",null,T.default.createElement("strong",null,l.title),T.default.createElement("span",{className:"zj-subtle"},e(l.kind==="company"?"companyMaterial":l.kind)," \xB7 ",e("version",{number:s.revision}))),T.default.createElement(z,{small:!0,disabled:r,onClick:()=>n(s.id)},e("link")))):T.default.createElement("p",{className:"zj-subtle"},e("noConfirmed")))}function Ur(e){return typeof e=="string"||typeof e=="number"?String(e):e&&(e.text||e.quote||e.reason||e.message||e.suggestion||e.label||e.name)||""}function st({values:e=[]}){let t=e.map(Ur).filter(Boolean);return t.length?T.default.createElement("ul",{className:"zj-list"},t.map((r,i)=>T.default.createElement("li",{key:`${i}-${r}`},r))):null}function Ct({values:e=[],onEvidence:t,t:r}){return T.default.createElement("div",{className:"zj-evidence"},e.map((i,n)=>T.default.createElement("button",{type:"button",key:`${i.sourceId}-${n}`,onClick:()=>t(i)},T.default.createElement("span",null,r("evidence")),i.quote)))}function We({result:e,t,onEvidence:r}){return e?T.default.createElement("section",{className:"zj-card"},typeof e.total=="number"?T.default.createElement("span",{className:"zj-score"},e.total,T.default.createElement("small",null,"/ 100")):T.default.createElement("p",{className:"zj-status-line"},t("insufficient")),e.summary&&T.default.createElement("p",null,e.summary),(e.criteria||[]).map((i,n)=>T.default.createElement("div",{className:"zj-criterion",key:i.id||n},T.default.createElement("div",{className:"zj-criterion-head"},T.default.createElement("span",null,i.name||i.label||i.dimension||i.id),T.default.createElement("span",null,typeof i.score=="number"?i.score:"")),i.reason&&T.default.createElement("p",null,i.reason),r?T.default.createElement(Ct,{values:i.evidence||[],onEvidence:r,t}):T.default.createElement(st,{values:i.evidence||[]}))),e.suggestions?.length>0&&T.default.createElement(T.default.Fragment,null,T.default.createElement("h3",null,t("suggestions")),e.suggestions.map((i,n)=>T.default.createElement("div",{key:n},T.default.createElement("p",null,Ur(i)),r&&T.default.createElement(Ct,{values:i.evidence||[],onEvidence:r,t}))))):T.default.createElement("p",{className:"zj-subtle"},t("noAssessment"))}var B=ye(require("react"),1);var qr=Object.freeze({fit:.65,resume:.35}),En=Object.freeze(["fit","resume"]);function _r(e,t,{goalId:r,resumeVersionId:i,jobVersionId:n}){return!r||!i?null:(e?.assessments||[]).find(o=>o.kind===t&&o.versionId===i&&o.goalId===r&&(!n||!Array.isArray(o.inputVersions)||o.inputVersions.some(a=>a.id===n)))||null}function Tn(e,t){return typeof e?.total!="number"||typeof t?.total!="number"?null:Math.round(e.total*qr.fit+t.total*qr.resume)}function et(e,t){let r=_r(e,"fit",t),i=_r(e,"resume",t),n=En.filter(l=>!(l==="fit"?r:i)),o=Tn(r,i),a=n.length===2?"none":n.length?"partial":o===null?"unknown":"scored";return{fit:r,resume:i,missing:n,total:o,status:a,pass:o!==null&&o>=80,gap:o===null?null:Math.max(0,80-o)}}function Hr(e,t,r){if(!r)return null;let n=((e?.materials||[]).find(o=>o.id===r)?.versions||[]).filter(o=>o.id!==t.resumeVersionId).sort((o,a)=>a.revision-o.revision);for(let o of n){let a=et(e,{...t,resumeVersionId:o.id});if(a.total!==null)return a.total}return null}function Kt(e,t=3){let r=new Set,i=[];for(let n of[...e.fit?.suggestions||[],...e.resume?.suggestions||[]]){let o=String(n?.text||"").trim();!o||r.has(o)||(r.add(o),i.push(o))}return t?i.slice(0,t):i}function Fr(e,t){let r=Kt(e,0);return[t("prepReviseRule"),...r.map(i=>`- ${i}`)].join(`
`).slice(0,1e4)}function Wr(e,t,r){return(e?.rewrites||[]).find(i=>i.goalId===t&&i.versionId===r&&!i.acceptedVersionId)||null}function Gt(e,t,r){let i=(e?.goals||[]).filter(n=>n.status!=="archived");return i.find(n=>n.id===t)||i.find(n=>r&&n.materialLinks?.some(o=>o.kind==="job"&&o.versionId===r))||null}var Kr=()=>!!globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;function Dn({total:e,busy:t,t:r}){let i=B.default.useRef(null),n=B.default.useRef(null);return B.default.useEffect(()=>{let o=i.current,a=n.current;if(!o||!a||typeof e!="number")return;if(Kr()||typeof requestAnimationFrame!="function"){o.style.setProperty("--zj-p",String(e)),a.textContent=String(e);return}let l=requestAnimationFrame(()=>{l=requestAnimationFrame(()=>o.style.setProperty("--zj-p",String(e)))}),s=performance.now(),c=requestAnimationFrame(function u(x){let k=Math.min(1,(x-s)/1400);a.textContent=String(Math.round(e*(1-(1-k)**3))),k<1&&(c=requestAnimationFrame(u))});return()=>{cancelAnimationFrame(l),cancelAnimationFrame(c)}},[e]),t?B.default.createElement("div",{className:"zj-dial is-busy","aria-hidden":"true"},B.default.createElement("span",{className:"zj-dial-num"},r("score"))):typeof e!="number"?B.default.createElement("div",{className:"zj-dial is-below","aria-hidden":"true"},B.default.createElement("span",{className:"zj-dial-num"},"\u2014",B.default.createElement("small",null,"/ 100"))):B.default.createElement("div",{ref:i,className:`zj-dial${e>=80?"":" is-below"}`,role:"img","aria-label":r("prepScoreOf",{score:e})},B.default.createElement("span",{className:"zj-dial-num","aria-hidden":"true"},B.default.createElement("span",{ref:n},e),B.default.createElement("small",null,"/ 100")))}function $r({kind:e,assessment:t,busy:r,t:i}){return r?B.default.createElement("div",{className:"zj-crits","aria-hidden":"true"},(e==="fit"?[1,2,3]:[1,2,3,4]).map(n=>B.default.createElement("div",{className:"zj-skel",key:n}))):t?B.default.createElement("ul",{className:"zj-crits"},t.criteria.map(n=>{let o=i(`crit_${e}_${n.id}`)===`crit_${e}_${n.id}`?n.name:i(`crit_${e}_${n.id}`),a=typeof n.rating=="number"?n.rating:null;return B.default.createElement("li",{key:n.id},B.default.createElement("details",{className:"zj-crit"},B.default.createElement("summary",null,B.default.createElement("span",{className:"zj-crit-name"},o),a===null?B.default.createElement("span",{className:"zj-crit-unknown"},i("prepUnknownCrit")):B.default.createElement("span",{className:"zj-pips",role:"img","aria-label":`${a} / 4`},[0,1,2,3].map(l=>B.default.createElement("i",{key:l,className:`zj-pip${l<a?" is-on":""}`,style:{"--zj-i":l}}))),B.default.createElement("span",{className:"zj-crit-pts"},typeof n.score=="number"?`${Math.round(n.score)}/${n.weight}`:`\u2014/${n.weight}`)),n.reason&&B.default.createElement("p",null,n.reason)))})):null}function Pn({rewrite:e,selected:t,onToggle:r,onApply:i,onClose:n,busy:o,t:a}){return B.default.createElement("div",{className:"zj-revise zj-fade","data-panel":""},B.default.createElement("p",{className:"zj-revise-head"},a("prepReviseNote")),B.default.createElement("ul",{className:"zj-revise-list"},e.items.map(l=>B.default.createElement("li",{key:l.id},B.default.createElement("label",{className:"zj-change"},B.default.createElement("input",{type:"checkbox",disabled:o,checked:t.includes(l.id),onChange:s=>r(l.id,s.target.checked)}),B.default.createElement("span",{className:"zj-change-pair"},B.default.createElement("span",{className:"zj-change-before"},l.before),B.default.createElement("span",{className:"zj-change-after"},l.after)),l.reason&&B.default.createElement("p",{className:"zj-change-why"},l.reason))))),B.default.createElement("div",{className:"zj-flow-actions"},B.default.createElement(z,{quiet:!0,disabled:o,onClick:n},a("prepReviseDrop")),B.default.createElement(z,{primary:!0,disabled:o||!t.length,onClick:i},a("prepReviseApply",{count:t.length}))))}function Bn({text:e,onChange:t,onSave:r,onClose:i,busy:n,t:o}){return B.default.createElement("form",{className:"zj-revise zj-fade","data-panel":"",onSubmit:a=>{a.preventDefault(),!n&&e.trim()&&r()}},B.default.createElement("p",{className:"zj-revise-head"},o("prepEditNote")),B.default.createElement("label",{className:"zj-field-label",htmlFor:"zj-prep-edit"},o("resume")),B.default.createElement("textarea",{id:"zj-prep-edit",className:"zj-field",rows:14,maxLength:2e5,value:e,disabled:n,onChange:a=>t(a.target.value)}),B.default.createElement("div",{className:"zj-flow-actions"},B.default.createElement(z,{quiet:!0,disabled:n,onClick:i},o("prepReviseDrop")),B.default.createElement(z,{type:"submit",primary:!0,disabled:n||!e.trim()},o("prepEditSave"))))}function Gr({t:e,busy:t,ready:r,score:i,previous:n,working:o,failure:a,panel:l,skipped:s,onScore:c,onRevise:u,onEdit:x,onSkip:k,onContinue:h,onPanel:v,onApply:w,onSave:S}){let j=o==="score",{total:b,status:f,pass:E}=i,P=f==="scored"&&!E?Kt(i):[],L=typeof b=="number"&&typeof n=="number"&&n!==b?b-n:null,Y=!!l||o==="revise",d=B.default.useRef(null);B.default.useEffect(()=>{d.current?.querySelector("[data-panel]")?.scrollIntoView?.({behavior:Kr()?"auto":"smooth",block:"nearest"})},[l?.kind]);let p;return r?j?p=B.default.createElement("p",{role:"status"},e("prepScoring")):f==="none"||f==="partial"?p=B.default.createElement(B.default.Fragment,null,B.default.createElement("p",null,e("prepScoreIdle")),B.default.createElement("div",{className:"zj-flow-actions"},B.default.createElement(z,{primary:!0,disabled:t,onClick:c},e("prepScoreRun")),a&&B.default.createElement(z,{quiet:!0,disabled:t,onClick:k},e("prepSkipScore")))):p=B.default.createElement(B.default.Fragment,null,B.default.createElement("p",{className:"zj-verdict"},f==="unknown"?e("prepScoreUnknown"):e(E?"prepScorePass":"prepScoreBelow",{score:b,gap:i.gap}),L!==null&&B.default.createElement("span",{className:`zj-delta${L>0?" is-up":""}`},e("prepScoreDelta",{delta:L>0?`+${L}`:String(L)}))),f==="unknown"&&(i.fit?.missing||[]).concat(i.resume?.missing||[]).length>0&&B.default.createElement("ul",{className:"zj-hints"},[...new Set([...i.fit?.missing||[],...i.resume?.missing||[]])].slice(0,3).map(y=>B.default.createElement("li",{key:y},y))),P.length>0&&B.default.createElement("ul",{className:"zj-hints"},P.map(y=>B.default.createElement("li",{key:y},y))),B.default.createElement("div",{className:"zj-weights"},e("prepScoreWeights"),s&&!E?` \xB7 ${e("prepSkipped")}`:""),B.default.createElement("div",{className:"zj-flow-actions"},E?B.default.createElement(B.default.Fragment,null,B.default.createElement(z,{primary:!0,disabled:t,onClick:h},e("prepContinue")),B.default.createElement(z,{quiet:!0,disabled:t||Y,onClick:u},e("prepReviseAgain"))):B.default.createElement(B.default.Fragment,null,B.default.createElement(z,{primary:!0,disabled:t||Y,onClick:u},e("prepRevise")),B.default.createElement(z,{disabled:t||Y,onClick:x},e("prepEditSelf")),B.default.createElement(z,{quiet:!0,disabled:t,onClick:s?h:k},e(s?"prepContinue":"prepSkipScore"))))):p=B.default.createElement("p",null,e("prepScoreWait")),B.default.createElement("div",{className:"zj-score-panel","data-score":"",ref:d},B.default.createElement("div",{className:"zj-score-top"},B.default.createElement(Dn,{total:j?null:b,busy:j,t:e}),B.default.createElement("div",{className:"zj-score-verdict"},B.default.createElement("div",{className:"zj-fade",key:`${f}:${b}:${j}`},p),a&&!j&&B.default.createElement("p",{className:"zj-warn-line",role:"alert"},a))),o==="revise"&&!l&&B.default.createElement("div",{className:"zj-revise zj-fade","data-panel":"",role:"status"},B.default.createElement("p",{className:"zj-revise-head",style:{margin:0}},e("prepRevising"))),l?.kind==="rewrite"&&B.default.createElement(Pn,{rewrite:l.rewrite,selected:l.selected,busy:t,onToggle:(y,V)=>v({...l,selected:V?[...new Set([...l.selected,y])]:l.selected.filter($=>$!==y)}),onApply:w,onClose:()=>v(null),t:e}),l?.kind==="edit"&&B.default.createElement(Bn,{text:l.text,busy:t,onChange:y=>v({...l,text:y}),onSave:S,onClose:()=>v(null),t:e}),B.default.createElement("div",{className:"zj-score-parts"},B.default.createElement("section",{className:r?"":"is-quiet"},B.default.createElement("h3",null,e("prepFitTitle")),B.default.createElement("p",{className:"zj-hint"},e("prepFitNote")),B.default.createElement($r,{kind:"fit",assessment:i.fit,busy:j&&!i.fit,t:e})),B.default.createElement("section",{className:r?"":"is-quiet"},B.default.createElement("h3",null,e("prepResumeTitle")),B.default.createElement("p",{className:"zj-hint"},e("prepResumeNote")),B.default.createElement($r,{kind:"resume",assessment:i.resume,busy:j&&!i.resume,t:e}))))}var Ln=Object.freeze({role:"",jobSource:"paste",jobText:"",jobUrl:"",jobVersionId:null,resumeSource:"file",resumeText:"",resumeVersionId:null,goalId:null,scoreSkippedFor:null,language:"zh",questionCount:5,mode:"realtime"}),Mn=[3,5,8];function lt(e,t,r){let i=t?be(e,t):null;return i?.material.kind===r?i:null}var Jr=(e,t)=>String(t.createdAt||"").localeCompare(String(e.createdAt||""));function Xr(e){let t={};for(let i of[...e?.goals||[]].filter(n=>n.status!=="archived").sort(Jr)){let n=(i.materialLinks||[]).map(o=>lt(e,o.versionId,"job")).filter(o=>o?.version.confirmed).sort((o,a)=>a.version.revision-o.version.revision)[0];if(n){Object.assign(t,{role:i.title||"",goalId:i.id,jobVersionId:n.version.id});break}}let r=e?ot(e).sort((i,n)=>Jr(i.material,n.material)||n.version.revision-i.version.revision)[0]:null;return r&&(t.resumeVersionId=r.version.id),t}function Yt(e,t){let r={...Ln,...t},i=lt(e,r.jobVersionId,"job"),n=lt(e,r.resumeVersionId,"resume"),o=!!i?.version.confirmed,a=!!n?.version.confirmed,l=r.role.trim(),s=o&&a&&l.length>0,c=s?Gt(e,r.goalId,i.version.id):null,u=et(e,{goalId:c?.id,resumeVersionId:n?.version.id,jobVersionId:i?.version.id}),x=s&&r.scoreSkippedFor===n.version.id,k=s&&(u.pass||x);return{value:r,job:i,resume:n,role:l,jobReady:o,resumeReady:a,ready:s,goal:c,score:u,skipped:x,cleared:k,current:!o||!l?"job":a?k?"start":"score":"resume"}}function Qt(e,{voiceReady:t=!1,workspaceReady:r=!1}={}){return e.ready?e.cleared?e.value.mode==="realtime"&&!t?"voice":r?null:"workspace":"score":"prep"}var Yr={job:"deskHeadJob",resume:"deskHeadResume",score:"deskHeadScore",voice:"deskHeadVoice",workspace:"deskHeadWorkspace"},Vn=new Set(["EVIDENCE_QUOTE_MISMATCH","EVIDENCE_RANGE_REQUIRED","EVIDENCE_REQUIRED","EVIDENCE_SOURCE_INVALID","EVIDENCE_HASH_MISMATCH","INVALID_EVIDENCE","FIT_EVIDENCE_INCOMPLETE"]),On=new Set(["MODEL_INVALID_JSON","INVALID_MODEL_RESULT","RUBRIC_INCOMPLETE","INVALID_RATING","INVALID_TEXT","MODEL_INCOMPLETE"]);function Un(e,t){let r=typeof e?.code=="string"?e.code:"",i=r==="MODEL_NOT_CONFIGURED"||r==="MODEL_SELECTION_INVALID"?t("prepFailModel"):r==="MODEL_TIMEOUT"?t("prepFailTimeout"):r==="BUSY"||r==="REQUEST_IN_PROGRESS"?t("prepFailBusy"):Vn.has(r)?t("prepFailEvidence"):On.has(r)?t("prepFailFormat"):r.startsWith("REWRITE_")?t("prepFailRewrite"):t("prepFailGeneric");return/^[A-Z][A-Z0-9_]{1,80}$/u.test(r)?`${i}${t("prepFailCode",{code:r})}`:i}async function qn(e){let t=await Promise.allSettled(e),r=t.find(i=>i.status==="rejected");if(r)throw r.reason;return t.map(i=>i.value)}var Qr=(e,t=400)=>String(e||"").trim().slice(0,t),_n=()=>N.default.createElement("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},N.default.createElement("path",{d:"M5 12.5l4.5 4.5L19 7.5"}));function Jt({label:e,values:t,value:r,onChange:i,render:n,disabled:o}){return N.default.createElement("div",{className:"zj-seg",role:"group","aria-label":e},t.map(a=>N.default.createElement("button",{type:"button",key:a,"aria-pressed":r===a,className:r===a?"is-on":"",disabled:o,onClick:()=>i(a)},n(a))))}function Zr({entry:e,t,busy:r,onConfirm:i,onReplace:n,onContinue:o}){let{material:a,version:l}=e;return l.confirmed?N.default.createElement("div",{className:"zj-fade zj-stack"},N.default.createElement("div",{className:"zj-doc is-confirmed"},N.default.createElement("strong",null,a.title),N.default.createElement("span",{className:"zj-badge"},t("prepConfirmed")),N.default.createElement("p",{className:"zj-doc-text"},Qr(l.text,1200))),N.default.createElement("div",{className:"zj-flow-actions"},N.default.createElement(z,{primary:!0,disabled:r,onClick:o},t("prepContinue")),N.default.createElement(z,{quiet:!0,disabled:r,onClick:n},t("prepReplace")))):N.default.createElement("div",{className:"zj-fade zj-stack"},N.default.createElement("div",{className:"zj-doc"},N.default.createElement("strong",null,a.title),N.default.createElement("p",{className:"zj-doc-text"},Qr(l.text,4e3))),N.default.createElement("p",{className:"zj-hint"},t("prepReviewNote")),N.default.createElement("div",{className:"zj-flow-actions"},N.default.createElement(z,{primary:!0,disabled:r,onClick:i},t("prepConfirmThis")),N.default.createElement(z,{quiet:!0,disabled:r,onClick:n},t("prepReplace"))))}function Rr({t:e,state:t,busy:r=!1,draft:i,onDraftChange:n,action:o,task:a,upload:l,startInterview:s,sheet:c=null,onSheet:u=()=>{},voiceReady:x=!1,voiceChecking:k=!1,workspaceReady:h=!1,onOpenSettings:v,unfinished:w=null,onContinue:S}){let j=Yt(t,i),{value:b,job:f,resume:E,role:P,jobReady:L,resumeReady:Y,ready:d,goal:p,score:y,skipped:V,cleared:$}=j,M=N.default.useRef(b);M.current=b;let O=C=>{M.current={...M.current,...C},n?.(M.current)},X=N.default.useRef(!0);N.default.useEffect(()=>(X.current=!0,()=>{X.current=!1}),[]);let m=Qt(j,{voiceReady:x,workspaceReady:h}),G=ot(t),W=(t.goals||[]).filter(C=>C.status!=="archived"&&C.id!==p?.id&&(C.materialLinks||[]).some(Q=>lt(t,Q.versionId,"job")?.version.confirmed)),[ne,Z]=N.default.useState(!1),le=()=>u(Y?null:"resume"),oe=async()=>{let C=await o("material.add",{title:e("prepJobTitle",{role:P}),kind:"job",text:b.jobText});C&&(O({jobVersionId:C.latestVersionId}),await o("material.confirm",{versionId:C.latestVersionId})&&le())},D=async()=>{let C=await o("material.fetch",{title:e("prepJobTitle",{role:P}),kind:"job",url:b.jobUrl});C&&O({jobVersionId:C.latestVersionId})},ie=async()=>{await o("material.confirm",{versionId:f.version.id})&&le()},q=C=>{let Q=W.find(ze=>ze.id===C),Se=Q&&(Q.materialLinks||[]).map(ze=>lt(t,ze.versionId,"job")).filter(ze=>ze?.version.confirmed).sort((ze,it)=>it.version.revision-ze.version.revision)[0];Se&&O({role:Q.title||"",goalId:Q.id,jobVersionId:Se.version.id,scoreSkippedFor:null})},R=async C=>{if(!C||r)return;let Q=await l(C,{title:C.name,kind:"resume"});Q&&O({resumeVersionId:Q.latestVersionId})},pe=async()=>{let C=await o("material.add",{title:e("resume"),kind:"resume",text:b.resumeText});C&&(O({resumeVersionId:C.latestVersionId}),await o("material.confirm",{versionId:C.latestVersionId})&&ke(C.latestVersionId))},ge=async()=>{await o("material.confirm",{versionId:E.version.id})&&ke(E.version.id)},je=async C=>{let Q=Gt(t,M.current.goalId,f.version.id);return!Q&&(Q=await C("goal.create",{title:P}),!Q)||(Q.id!==M.current.goalId&&O({goalId:Q.id}),!Q.materialLinks?.some(ze=>ze.kind==="job"&&ze.versionId===f.version.id)&&!await C("goal.linkMaterial",{goalId:Q.id,versionId:f.version.id}))?null:Q.id},[xe,Ie]=N.default.useState(null),[Ae,Ee]=N.default.useState(null),[te,_]=N.default.useState(null),me=(C,Q)=>(a??(Se=>Se(o)))(async Se=>{Ie(C),Ee(null);try{return await Q(Se)}catch(ze){ze?.name!=="AbortError"&&X.current&&Ee(Un(ze,e));return}finally{X.current&&Ie(null)}}),fe=async(C,Q)=>{let Se=await je(C);if(!Se)return;Ie("score");let ze=et(t,{goalId:Se,resumeVersionId:Q,jobVersionId:f.version.id}),it=Q===E?.version.id?ze.missing:["fit","resume"];await qn(it.map(Vt=>C("assessment.run",{kind:Vt,versionId:Q,goalId:Se})))},he=C=>{C&&P&&f&&me("score",Q=>fe(Q,C))};function ke(C){u("score"),he(C)}N.default.useEffect(()=>{_(null),Ee(null)},[E?.version.id,f?.version.id]);let De=()=>{if(!p||r)return;let C=Wr(t,p.id,E.version.id);if(C){_({kind:"rewrite",rewrite:C,selected:C.items.map(Q=>Q.id)});return}me("revise",async Q=>{let Se=await Q("rewrite.run",{versionId:E.version.id,goalId:p.id,instructions:Fr(y,e)});Se&&X.current&&_({kind:"rewrite",rewrite:Se,selected:Se.items.map(ze=>ze.id)})})},$e=async(C,Q)=>{await C("material.confirm",{versionId:Q})&&(O({resumeVersionId:Q,scoreSkippedFor:null}),X.current&&_(null),await fe(C,Q))},Qe=()=>{te?.kind!=="rewrite"||!te.selected.length||r||me("apply",async C=>{let Q=await C("rewrite.accept",{rewriteId:te.rewrite.id,itemIds:te.selected});Q?.version?.id&&await $e(C,Q.version.id)})},Pe=()=>{te?.kind!=="edit"||!te.text.trim()||r||me("edit",async C=>{let Q=await C("material.update",{materialId:E.material.id,text:te.text});Q?.latestVersionId&&Q.latestVersionId!==E.version.id&&await $e(C,Q.latestVersionId)})},Ve=()=>{u("score"),d&&!r&&xe!=="score"&&(y.status==="none"||y.status==="partial")&&he(E.version.id)},Te=()=>{E&&O({scoreSkippedFor:E.version.id}),u(null)},ut=async()=>{if(m||r)return;let C=p?.id;if(!C){if(C=await o("goal.create",{title:P}).then(Q=>Q?.id),!C)return;O({goalId:C})}await o("goal.linkMaterial",{goalId:C,versionId:f.version.id})&&await s({goalId:C,versionId:E.version.id,language:b.language,questionCount:b.questionCount,mode:b.mode})},Le=d?xe==="score"?e("deskScoring"):y.status==="none"||y.status==="partial"?e("deskScoreNone"):y.status==="unknown"?e("deskScoreUnknown"):y.pass?e("deskScorePass",{score:y.total}):V?e("deskScoreSkipped",{score:y.total}):e("deskScoreBelow",{score:y.total,gap:y.gap}):e("deskScoreWait"),mt=[{id:"job",title:e("deskRowJob"),done:L&&!!P,primary:j.current==="job",value:f?`${P||f.material.title} \xB7 ${e(f.version.confirmed?"deskConfirmedShort":"prepUnconfirmed")}`:P||e("prepMissing"),action:f?!f.version.confirmed||!P?"deskConfirmIt":"deskView":"deskAdd",open:()=>u("job")},{id:"resume",title:e("deskRowResume"),done:Y,primary:j.current==="resume",value:E?`${E.material.title} \xB7 ${e("version",{number:E.version.revision})} \xB7 ${e(E.version.confirmed?"deskConfirmedShort":"prepUnconfirmed")}`:e("prepMissing"),action:E?E.version.confirmed?"deskView":"deskConfirmIt":"deskAdd",open:()=>u("resume")},{id:"score",title:e("deskRowScore"),done:$,warn:d&&!$,primary:j.current==="score",disabled:!d,value:Le,action:y.status==="none"||y.status==="partial"?"deskScoreIt":$?"deskView":"deskRevise",open:Ve},{id:"voice",title:e("deskRowVoice"),done:b.mode==="text"||x,warn:b.mode==="realtime"&&!x&&!k,primary:m==="voice",value:b.mode==="text"?e("deskVoiceText"):e(k&&!x?"deskVoiceChecking":x?"deskVoiceReady":"deskVoiceNone"),action:b.mode==="text"||x?"deskSettingsShort":"deskConnect",open:()=>v?.()}],qe=m==="prep"?Yr[j.current==="resume"?"resume":"job"]:m?Yr[m]:"deskHeadReady",gt=P.length>0&&(b.jobSource==="paste"?b.jobText.trim().length>0:b.jobUrl.trim().length>0);return N.default.createElement("div",{className:"zj-page zj-interview-page","data-prepare":""},N.default.createElement("header",{className:"zj-page-head"},P?N.default.createElement(N.default.Fragment,null,N.default.createElement("span",{className:"zj-label"},e("deskThisOne")),N.default.createElement("h1",{className:"zj-display"},P)):N.default.createElement(N.default.Fragment,null,N.default.createElement("h1",{className:"zj-display"},e("prepSlogan")),N.default.createElement("p",{className:"zj-intro"},e("prepLead")))),w&&S&&N.default.createElement("div",{className:"zj-note",role:"status"},N.default.createElement("span",null,e("deskUnfinished",{date:String(w.createdAt||"").slice(0,10)})),N.default.createElement(z,{small:!0,primary:!0,onClick:()=>S(w.sessionId)},e("reviewContinue"))),N.default.createElement("div",{className:"zj-desk-grid"},N.default.createElement("section",{className:"zj-card zj-checklist","aria-label":e("deskThisOne")},N.default.createElement("ol",{className:"zj-rows"},mt.map((C,Q)=>N.default.createElement("li",{key:C.id,className:"zj-row","data-row":C.id},N.default.createElement("span",{className:`zj-step${C.done?" is-done":C.warn?" is-warn":""}`,"aria-hidden":"true"},C.done?N.default.createElement(_n,null):Q+1),N.default.createElement("div",{className:"zj-row-text"},N.default.createElement("strong",null,C.title),N.default.createElement("span",{className:"zj-hint"},C.value)),N.default.createElement(z,{small:!0,primary:C.primary&&!C.done,disabled:C.disabled,onClick:C.open},e(C.action)))))),N.default.createElement("section",{className:"zj-card zj-start","aria-label":e("deskStartLabel")},N.default.createElement("span",{className:"zj-label"},e("deskStartLabel")),N.default.createElement("h2",{className:"zj-display is-md"},e(qe)),N.default.createElement("p",{className:"zj-muted"},e("deskStartSub",{count:b.questionCount,mode:e(b.mode==="realtime"?"deskModeVoice":"deskModeText"),language:e(b.language==="en"?"enLanguage":"zhLanguage")})),N.default.createElement("div",{className:"zj-start-opts"},N.default.createElement(Jt,{label:e("interviewMode"),values:["realtime","text"],value:b.mode,disabled:r,onChange:C=>O({mode:C}),render:C=>e(C==="realtime"?"realtimeCall":"textInterview")}),N.default.createElement(Jt,{label:e("questions"),values:Mn,value:b.questionCount,disabled:r,onChange:C=>O({questionCount:C}),render:C=>e("prepCount",{number:C})}),N.default.createElement(Jt,{label:e("language"),values:["zh","en"],value:b.language,disabled:r,onChange:C=>O({language:C}),render:C=>e(C==="en"?"enLanguage":"zhLanguage")})),m==="prep"&&N.default.createElement("p",{className:"zj-note"},e("prepNotReady")),m==="score"&&N.default.createElement("div",{className:"zj-note is-warn",role:"status"},N.default.createElement("span",null,typeof y.total=="number"&&y.status==="scored"?e("prepGateBelow",{score:y.total}):e("prepGateNone")),N.default.createElement(z,{small:!0,onClick:Ve},e("prepGateBack")),y.status==="scored"&&N.default.createElement(z,{small:!0,quiet:!0,onClick:Te},e("prepSkipScore"))),m==="voice"&&N.default.createElement("div",{className:"zj-note is-warn",role:"status"},N.default.createElement("span",null,e("deskBlockedVoice")),N.default.createElement(z,{small:!0,onClick:()=>v?.()},e("deskOpenSettings")),N.default.createElement(z,{small:!0,quiet:!0,onClick:()=>O({mode:"text"})},e("deskUseText"))),m==="workspace"&&N.default.createElement("div",{className:"zj-note is-warn",role:"status"},N.default.createElement("span",null,e("deskBlockedWorkspace")),N.default.createElement(z,{small:!0,onClick:()=>v?.()},e("deskOpenSettings"))),V&&!y.pass&&!m&&N.default.createElement("p",{className:"zj-hint"},e("prepScoreOf",{score:y.total})," \xB7 ",e("prepSkipped")),N.default.createElement("div",{className:"zj-start-go"},N.default.createElement(z,{primary:!0,disabled:r||!!m,onClick:()=>{ut()}},e("prepStart"))))),c==="job"&&N.default.createElement(Et,{title:e("deskRowJob"),t:e,onClose:()=>u(null)},N.default.createElement("div",{className:"zj-stack"},N.default.createElement("label",{className:"zj-control"},N.default.createElement("span",{className:"zj-label"},e("prepRole")),N.default.createElement("input",{className:"zj-input",required:!0,maxLength:160,value:b.role,placeholder:e("prepRoleHint"),onChange:C=>O({role:C.target.value})})),W.length>0&&N.default.createElement("label",{className:"zj-control"},N.default.createElement("span",{className:"zj-label"},e("deskPickRole")),N.default.createElement("select",{className:"zj-input",value:"",disabled:r,onChange:C=>{C.target.value&&q(C.target.value)}},N.default.createElement("option",{value:""},e("selectPlaceholder")),W.map(C=>N.default.createElement("option",{key:C.id,value:C.id},C.title)))),f?N.default.createElement(N.default.Fragment,null,N.default.createElement(Zr,{entry:f,t:e,busy:r,onConfirm:()=>{ie()},onReplace:()=>O({jobVersionId:null}),onContinue:le}),N.default.createElement("div",null,N.default.createElement(z,{quiet:!0,small:!0,disabled:r,onClick:()=>O({role:"",goalId:null,jobVersionId:null,jobText:"",jobUrl:"",scoreSkippedFor:null})},e("deskNewRole")))):N.default.createElement("form",{className:"zj-stack",onSubmit:C=>{C.preventDefault(),!r&&gt&&(b.jobSource==="paste"?oe():D())}},N.default.createElement("p",{className:"zj-hint"},e("prepTheirsNote")),b.jobSource==="paste"?N.default.createElement("label",{className:"zj-control"},N.default.createElement("span",{className:"zj-label"},e("prepJobText")),N.default.createElement("textarea",{className:"zj-input",required:!0,rows:9,maxLength:2e5,value:b.jobText,placeholder:e("prepJobHint"),onChange:C=>O({jobText:C.target.value})})):N.default.createElement("label",{className:"zj-control"},N.default.createElement("span",{className:"zj-label"},e("sourceUrl")),N.default.createElement("input",{className:"zj-input",required:!0,type:"url",value:b.jobUrl,placeholder:e("prepJobUrlHint"),onChange:C=>O({jobUrl:C.target.value})})),N.default.createElement("div",{className:"zj-flow-actions"},N.default.createElement(z,{type:"submit",primary:!0,disabled:r||!gt},e(b.jobSource==="paste"?"prepConfirmNext":"prepReadLink")),N.default.createElement(z,{quiet:!0,disabled:r,onClick:()=>O({jobSource:b.jobSource==="paste"?"url":"paste"})},e(b.jobSource==="paste"?"prepUseLink":"prepUsePaste")))))),c==="resume"&&N.default.createElement(Et,{title:e("deskRowResume"),t:e,onClose:()=>u(null)},N.default.createElement("div",{className:"zj-stack"},E?N.default.createElement(Zr,{entry:E,t:e,busy:r,onConfirm:()=>{ge()},onReplace:()=>O({resumeVersionId:null}),onContinue:()=>{d?Ve():u(L&&P?null:"job")}}):b.resumeSource==="file"?N.default.createElement(N.default.Fragment,null,N.default.createElement("p",{className:"zj-hint"},e("prepYoursNote")),N.default.createElement("label",{className:`zj-drop${ne?" is-over":""}${r?" is-disabled":""}`,onDragOver:C=>{C.preventDefault(),r||Z(!0)},onDragLeave:()=>Z(!1),onDrop:C=>{C.preventDefault(),Z(!1),R(C.dataTransfer?.files?.[0])}},N.default.createElement("input",{type:"file",disabled:r,accept:".pdf,.docx,.txt,.png,.jpg,.jpeg",onChange:C=>{let Q=C.target.files?.[0];C.target.value="",R(Q)}}),N.default.createElement("span",null,e("prepDrop"))),N.default.createElement("div",{className:"zj-flow-actions"},N.default.createElement(z,{quiet:!0,disabled:r,onClick:()=>O({resumeSource:"paste"})},e("prepPasteResume")))):N.default.createElement("form",{className:"zj-stack",onSubmit:C=>{C.preventDefault(),!r&&b.resumeText.trim()&&pe()}},N.default.createElement("label",{className:"zj-control"},N.default.createElement("span",{className:"zj-label"},e("resume")),N.default.createElement("textarea",{className:"zj-input",required:!0,rows:10,maxLength:2e5,value:b.resumeText,placeholder:e("prepResumeHint"),onChange:C=>O({resumeText:C.target.value})})),N.default.createElement("div",{className:"zj-flow-actions"},N.default.createElement(z,{type:"submit",primary:!0,disabled:r||!b.resumeText.trim()},e("prepConfirmNext")),N.default.createElement(z,{quiet:!0,disabled:r,onClick:()=>O({resumeSource:"file"})},e("prepUseFile")))),G.length>0&&N.default.createElement("label",{className:"zj-control"},N.default.createElement("span",{className:"zj-label"},e("prepExisting")),N.default.createElement("select",{className:"zj-input",value:"",disabled:r,onChange:C=>{C.target.value&&O({resumeVersionId:C.target.value})}},N.default.createElement("option",{value:""},e("selectPlaceholder")),G.map(({material:C,version:Q})=>N.default.createElement("option",{key:Q.id,value:Q.id},C.title," \xB7 ",e("version",{number:Q.revision}))))))),c==="score"&&N.default.createElement(Et,{title:e("deskScoreDrawer"),t:e,wide:!0,onClose:()=>u(null)},N.default.createElement(Gr,{t:e,busy:r,ready:d,score:y,previous:Hr(t,{goalId:p?.id,jobVersionId:f?.version.id,resumeVersionId:E?.version.id},E?.material.id),working:xe,failure:Ae,panel:te,skipped:V,onScore:()=>{d&&!r&&he(E.version.id)},onRevise:De,onEdit:()=>_({kind:"edit",text:E.version.text}),onSkip:Te,onContinue:()=>u(null),onPanel:_,onApply:Qe,onSave:Pe})))}var H=ye(require("react"),1);var J=ye(require("react"),1);function Tt({state:e,value:t,onChange:r,t:i}){let n=ot(e),o=be(e,t);return o?.material.kind==="resume"&&!n.some(a=>a.version.id===t)&&n.push(o),J.default.createElement("label",null,i("selectResume"),J.default.createElement("select",{required:!0,value:o?.material.kind==="resume"?t:"",onChange:a=>r(a.target.value)},J.default.createElement("option",{value:""},i("selectPlaceholder")),n.map(({material:a,version:l})=>J.default.createElement("option",{key:l.id,value:l.id},a.title," \xB7 ",i("version",{number:l.revision}),!l.confirmed&&` \xB7 ${i("unconfirmed")}`))))}function Zt(e,t){if(!e||typeof e.text!="string"||t?.versionId!==e.id||t.value!==e.text.replace(/\r\n?/g,`
`)||!Number.isInteger(t.start)||!Number.isInteger(t.end)||t.start<0||t.end<=t.start)return null;let r=[0];for(let a=0;a<e.text.length;)a+=e.text[a]==="\r"&&e.text[a+1]===`
`?2:1,r.push(a);if(t.end>=r.length)return null;let i=r[t.start],n=r[t.end],o=e.text.slice(i,n);return o.trim()?{versionId:e.id,start:i,end:n,text:o}:null}function Hn(e,t,r){return e.rewrites.find(i=>i.goalId===t&&i.versionId===r)||e.rewrites.find(i=>i.goalId===t&&(i.acceptedVersionId===r||i.acceptances?.some(n=>n.versionId===r)))}function ei(e,t,r){let i=e.acceptances?.find(o=>o.versionId===r),n=Array.isArray(t?.selectedIds)?t.selectedIds:i?.itemIds??e.items.map(o=>o.id);return[...new Set(n)].filter(o=>e.items.some(a=>a.id===o))}function Fn(e,t){let r=t?.version;return t?.rewriteId===e.id&&typeof r?.id=="string"&&r.id!==e.versionId&&r.materialId===e.materialId&&Number.isSafeInteger(r.revision)&&r.revision>0?{id:r.id,revision:r.revision,materialId:r.materialId}:null}function Xt({rewrite:e,state:t,selectedVersion:r,onSelectVersion:i,onReviewVersion:n,t:o,busy:a,onAccept:l,onExport:s,onEvidence:c,draft:u,onDraftChange:x}){let[k,h]=J.default.useState({}),[v,w]=J.default.useState(!1),S=u??k,j=ei(e,S,r),b=J.default.useRef(S);b.current=S;let f=J.default.useRef(Ue()),E=V=>{let $={...b.current,...V};b.current=$,h($),x?.($)},P=S.savedVersion?.id??e.acceptedVersionId,L=be(t,P),Y=L?.material.id===e.materialId?L.version:S.savedVersion?.materialId===e.materialId?S.savedVersion:null,d=be(t,e.versionId),p=n??i,y=()=>f.current(async()=>{if(!(a||!j.length)){w(!0);try{let V=await l(e.id,[...j]),$=Fn(e,V);$&&E({savedVersion:$})}finally{w(!1)}}});return J.default.createElement("section",{className:"zj-card"},J.default.createElement("h3",null,o("selectChanges")),e.items.map(V=>J.default.createElement("article",{className:"zj-diff",key:V.id},J.default.createElement("label",null,J.default.createElement("input",{type:"checkbox",disabled:a||v,checked:j.includes(V.id),onChange:$=>{let M=ei(e,b.current,r);E({selectedIds:$.target.checked?[...new Set([...M,V.id])]:M.filter(O=>O!==V.id)})}}),V.reason),J.default.createElement("div",{className:"zj-diff-grid"},J.default.createElement("div",null,J.default.createElement("span",{className:"zj-subtle"},o("original")),J.default.createElement("pre",null,V.before)),J.default.createElement("div",null,J.default.createElement("span",{className:"zj-subtle"},o("revised")),J.default.createElement("pre",{className:"after"},V.after))),c&&J.default.createElement(Ct,{values:V.evidence||[],onEvidence:c,t:o}))),d&&J.default.createElement("p",{className:"zj-subtle"},o("rewriteSourceVersion",{version:o("version",{number:d.version.revision})})),Y&&J.default.createElement("div",{className:"zj-review-note"},J.default.createElement("p",{className:"zj-status-line",role:"status"},o("rewriteSavedVersion",{version:o("version",{number:Y.revision})})," ",o("accepted")),J.default.createElement("div",{className:"zj-actions"},J.default.createElement(z,{small:!0,disabled:a||v||!n&&r===Y.id||!p,onClick:()=>p(Y.id)},o("rewriteViewNewVersion")),J.default.createElement(z,{small:!0,disabled:a||v||r===e.versionId||!d||!i,onClick:()=>i(e.versionId)},o("rewriteReturnOriginalVersion"))),J.default.createElement("p",{className:"zj-subtle"},o("rewriteVersionSwitchNote"))),J.default.createElement(z,{primary:!0,disabled:a||v||!j.length,onClick:()=>{y()}},o("acceptChanges")),J.default.createElement("details",{className:"zj-card"},J.default.createElement("summary",null,o("fullResume")),J.default.createElement("div",{className:"zj-paper-content"},e.fullText)),Y&&s&&J.default.createElement("div",{className:"zj-actions"},J.default.createElement(z,{small:!0,onClick:()=>s("resume",Y.id,"docx")},o("exportDocx")),J.default.createElement(z,{small:!0,onClick:()=>s("resume",Y.id,"pdf")},o("exportPdf"))))}function ti({state:e,goal:t,tab:r,t:i,busy:n,onAction:o,onExport:a,selectedVersion:l,onSelectVersion:s,onReviewVersion:c,onEvidence:u,draft:x,onDraftChange:k,onChatContext:h}){let v=`${t.id}:${l||""}:${r}`,[w,S]=J.default.useState({}),[j,b]=J.default.useState(null),[f,E]=J.default.useState(null),P=x??w[v]??{},L=P.instructions??"",Y=J.default.useRef({scope:v,value:P});Y.current={scope:v,value:P};let d=J.default.useRef(null),p=J.default.useId(),y=J.default.useId(),V=J.default.useRef(Ue()),$=R=>{let ge={...Y.current.scope===v?Y.current.value:P,...R};Y.current.scope===v&&(Y.current={scope:v,value:ge}),S(je=>({...je,[v]:ge})),k?.(ge)},M=r==="fit"?"fit":"resume",O=Ht(e,t),X=be(e,l),m=X?.material.kind==="resume"?X:null,G=!!m?.version.confirmed&&!n&&L.length<=1e4&&(r!=="fit"||O),W=Hn(e,t.id,l),ne=kt(e,l,t.id,M),Z=Zt(m?.version,j),le=Z?i("rewriteSelectionPrompt",{version:i("version",{number:m.version.revision}),passage:Z.text}):"",oe=`${L}${L?`

`:""}${le}`,D=!!Z&&oe.length>1e4,ie=R=>b({versionId:l,value:R.currentTarget.value,start:R.currentTarget.selectionStart,end:R.currentTarget.selectionEnd}),q=()=>{!Z||D||n||($({instructions:oe}),E({scope:v,key:"rewriteSelectionAdded"}),d.current?.focus())};return J.default.createElement(J.default.Fragment,null,J.default.createElement("form",{className:"zj-form",onSubmit:R=>{R.preventDefault(),G&&V.current(()=>o(r==="rewrite"?"rewrite.run":"assessment.run",r==="rewrite"?{versionId:l,goalId:t.id,instructions:L}:{versionId:l,goalId:t.id,kind:M}))}},J.default.createElement(Tt,{state:e,value:l,onChange:s,t:i}),m?J.default.createElement("p",{className:"zj-subtle"},i("analysisContext",{goal:t.title,material:m.material.title,version:i("version",{number:m.version.revision})})):J.default.createElement("p",{className:"zj-subtle"},i("resumeRequired")),m&&h&&J.default.createElement("div",null,J.default.createElement(z,{small:!0,disabled:n||!m.version.confirmed,onClick:()=>h(m.version.id)},i("askAboutMaterial"))),m&&!m.version.confirmed&&J.default.createElement("p",{className:"zj-review-note"},i("unconfirmed")," \xB7 ",i("reviewNote")),r==="rewrite"?J.default.createElement(J.default.Fragment,null,typeof m?.version.text=="string"&&J.default.createElement("details",{className:"zj-card"},J.default.createElement("summary",null,i("rewriteSource")),J.default.createElement("label",{htmlFor:p},i("rewriteSourceVersion",{version:i("version",{number:m.version.revision})})),J.default.createElement("p",{className:"zj-subtle",id:y},i("rewriteSourceHelp")),J.default.createElement("textarea",{id:p,readOnly:!0,rows:8,"aria-describedby":y,value:m.version.text.replace(/\r\n?/g,`
`),onSelect:ie,onKeyUp:ie,onMouseUp:ie}),J.default.createElement(z,{small:!0,disabled:n||!Z||D,onClick:q},i("rewriteUseSelection")),h&&J.default.createElement(z,{small:!0,disabled:n||!m.version.confirmed||!Z,onClick:()=>Z&&h(m.version.id,Z)},i("askAboutPassage")),D&&J.default.createElement("p",{className:"zj-error",role:"status"},i("rewriteSelectionTooLong"))),J.default.createElement("label",null,i("rewriteInstructions"),J.default.createElement("textarea",{ref:d,rows:3,maxLength:1e4,disabled:n,value:L,placeholder:i("rewritePlaceholder"),onChange:R=>$({instructions:R.target.value})})),f?.scope===v&&J.default.createElement("p",{className:"zj-status-line",role:"status"},i(f.key))):J.default.createElement("p",{className:"zj-subtle"},i("assessNote")),r==="fit"&&!O&&J.default.createElement("p",{className:"zj-subtle"},i("jobRequired")),J.default.createElement("div",null,J.default.createElement(z,{type:"submit",primary:!0,disabled:!G},i(r==="rewrite"?"generateRewrite":r==="fit"?"assessFit":"assessResume")))),r==="rewrite"?W&&J.default.createElement(Xt,{key:`${W.id}:${v}`,rewrite:W,state:e,selectedVersion:l,onSelectVersion:s,onReviewVersion:c,draft:P.rewrites?.[W.id],onDraftChange:R=>$({rewrites:{...(Y.current.scope===v?Y.current.value:P).rewrites,[W.id]:R}}),t:i,busy:n,onAccept:(R,pe)=>o("rewrite.accept",{rewriteId:R,itemIds:pe}),onExport:a,onEvidence:u}):J.default.createElement(We,{result:ne,t:i,onEvidence:u}))}var ue=ye(require("react"),1);function Wn(e){let t=new Uint8Array(44+e.length*2),r=new DataView(t.buffer),i=(n,o)=>{for(let a=0;a<o.length;a++)t[n+a]=o.charCodeAt(a)};return i(0,"RIFF"),r.setUint32(4,t.length-8,!0),i(8,"WAVE"),i(12,"fmt "),r.setUint32(16,16,!0),r.setUint16(20,1,!0),r.setUint16(22,1,!0),r.setUint32(24,16e3,!0),r.setUint32(28,32e3,!0),r.setUint16(32,2,!0),r.setUint16(34,16,!0),i(36,"data"),r.setUint32(40,e.length*2,!0),e.forEach((n,o)=>{let a=Math.max(-1,Math.min(1,n));r.setInt16(44+o*2,Math.round(a*(a<0?32768:32767)),!0)}),t}function $n(e){let t="";for(let r=0;r<e.length;r+=8192)t+=String.fromCharCode(...e.subarray(r,r+8192));return btoa(t)}var Kn=e=>e?.name==="NotAllowedError"?"\u9EA6\u514B\u98CE\u6216\u64AD\u653E\u6743\u9650\u672A\u5F00\u542F\uFF0C\u8BF7\u68C0\u67E5\u6D4F\u89C8\u5668\u4E0E\u7CFB\u7EDF\u8BBE\u7F6E\uFF0C\u6216\u6539\u7528\u6587\u5B57":e?.name==="NotFoundError"||e?.name==="OverconstrainedError"?"\u672A\u627E\u5230\u53EF\u7528\u9EA6\u514B\u98CE\uFF0C\u8BF7\u8FDE\u63A5\u8BBE\u5907\u6216\u6539\u7528\u6587\u5B57":e?.voiceMessage?e.voiceMessage:"\u8BED\u97F3\u64CD\u4F5C\u672A\u5B8C\u6210\uFF0C\u8BF7\u68C0\u67E5\u8BED\u97F3\u8BBE\u7F6E\u540E\u91CD\u8BD5\uFF0C\u6216\u6539\u7528\u6587\u5B57",Gn=e=>e?.name==="NotAllowedError"?"permission-denied":e?.name==="NotFoundError"||e?.name==="OverconstrainedError"?"device-missing":typeof e?.code=="string"?e.code:"voice-unavailable",Me=(e,t="voice-unavailable")=>Object.assign(new Error(e),{voiceMessage:e,code:t});function ri({api:e,onChange:t=()=>{},translateError:r,transcriptionContext:i,language:n="zh",environment:o=globalThis}){let a=i?{interviewId:i.interviewId,questionId:i.questionId}:{},l={phase:"idle",transcript:"",rawTranscript:"",speechDraftId:null,error:null,errorCode:null,elapsedSeconds:0,catalog:null},s=!1,c=0,u,x,k,h,v,w=new Set,S=()=>({...l}),j=D=>{s||(l={...l,...D,...D.error===null?{errorCode:null}:{}},t(S()))},b=(D,ie={})=>{let q=Gn(D),R=Kn(D);j({...ie,errorCode:q,error:r?.({code:q,message:R})??R})},f=D=>!s&&D===c,E=D=>{w.add(D),D.finally(()=>w.delete(D)).catch(()=>{})},P=()=>{o.clearInterval(h),o.clearTimeout(v),h=void 0,v=void 0};function L(){P();let D=x;if(x=void 0,!!D){if(D.stream.getTracks().forEach(ie=>ie.stop()),D.recorder.state==="recording")try{D.recorder.stop()}catch{}D.chunks.length=0,D.context.state!=="closed"&&E(Promise.resolve(D.context.close()).catch(()=>{}))}}function Y(){k&&(k.onend=null,k.onerror=null,k=void 0,o.speechSynthesis?.cancel())}function d(){let D=o.speechSynthesis;if(!D||!o.SpeechSynthesisUtterance)return null;let ie=String(n).toLowerCase().replaceAll("_","-").split("-")[0],q=D.getVoices().filter(R=>R.localService===!0&&String(R.lang).toLowerCase().replaceAll("_","-").split("-")[0]===ie);return q.find(R=>R.default)??q[0]??null}function p(){try{let D=d();return{available:!!D,kind:"device-local",language:n,voiceName:D?.name??null,reasonCode:D?null:"device-voice-missing"}}catch{return{available:!1,kind:"device-local",language:n,reasonCode:"device-speech-unavailable"}}}let y=()=>{j({catalog:{maxDurationSeconds:120,maxAudioBytes:4194304,asr:{available:!1},...l.catalog,tts:p()}})};function V(){c+=1,u?.abort(),u=void 0,L(),Y(),j({phase:"idle",elapsedSeconds:0})}function $(){l.phase==="playing"||l.phase==="synthesizing"?V():Y()}async function M(){let D=c;try{let q={...await e.catalog(),tts:p()};return f(D)&&j({catalog:q}),q}catch(ie){return f(D)&&(y(),b(ie)),null}}async function O(){if(s)return;V();let D=c;j({phase:"requesting",error:null,elapsedSeconds:0});try{let ie=await M();if(!f(D))return;if(!ie?.asr.available)throw Me("\u8BF7\u5728 DSH \u8BED\u97F3\u8F93\u5165\u4E2D\u542F\u7528\u5E76\u51C6\u5907\u8BC6\u522B\u670D\u52A1\uFF0C\u6216\u6539\u7528\u6587\u5B57","host-asr-unavailable");if(!o.navigator?.mediaDevices?.getUserMedia||!o.MediaRecorder||!o.AudioContext||!o.OfflineAudioContext)throw Me("\u6B64\u9875\u9762\u65E0\u6CD5\u5F55\u97F3\uFF0C\u8BF7\u4F7F\u7528 DSH \u684C\u9762\u7248\u6216 localhost\u3001HTTPS \u9875\u9762\uFF0C\u6216\u6539\u7528\u6587\u5B57");let q=await o.navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0},video:!1});if(!f(D)){q.getTracks().forEach(pe=>pe.stop());return}let R;try{R=new o.AudioContext;let pe=new o.MediaRecorder(q),ge={stream:q,context:R,recorder:pe,chunks:[],started:Date.now()};x=ge;let je=()=>{f(D)&&l.phase==="recording"&&(V(),b(Me("\u5F55\u97F3\u5DF2\u4E2D\u65AD\uFF0C\u8BF7\u68C0\u67E5\u9EA6\u514B\u98CE\u540E\u91CD\u8BD5\uFF0C\u6216\u6539\u7528\u6587\u5B57","recording-interrupted")))};q.getTracks().forEach(xe=>xe.addEventListener("ended",je,{once:!0})),pe.ondataavailable=xe=>{f(D)&&xe.data.size&&ge.chunks.push(xe.data)},pe.onerror=je,pe.start(),j({phase:"recording"}),h=o.setInterval(()=>{f(D)&&j({elapsedSeconds:Math.min(ie.maxDurationSeconds,(Date.now()-ge.started)/1e3)})},250),v=o.setTimeout(()=>{f(D)&&X()},ie.maxDurationSeconds*1e3)}catch(pe){throw q.getTracks().forEach(ge=>ge.stop()),x?L():R?.state!=="closed"&&R&&await R.close().catch(()=>{}),pe}}catch(ie){f(D)&&(L(),b(ie,{phase:"idle"}))}}async function X(){let D=x;if(!D||l.phase!=="recording")return;let ie=c;P(),j({phase:"transcribing",error:null}),u=new AbortController;let q=u.signal;try{if(await new Promise((_,me)=>{D.recorder.onstop=_,D.recorder.onerror=()=>me(Me("\u5F55\u97F3\u672A\u5B8C\u6210\uFF0C\u8BF7\u91CD\u8BD5\u6216\u6539\u7528\u6587\u5B57")),D.recorder.stop()}),D.stream.getTracks().forEach(_=>_.stop()),!f(ie))return;let R=new Blob(D.chunks,{type:D.recorder.mimeType});if(!R.size)throw Me("\u6CA1\u6709\u5F55\u5230\u58F0\u97F3\uFF0C\u8BF7\u91CD\u8BD5\u6216\u6539\u7528\u6587\u5B57");let pe=await D.context.decodeAudioData(await R.arrayBuffer());if(!f(ie))return;let ge=Math.min(pe.duration,l.catalog.maxDurationSeconds),je=Math.floor(ge*16e3);if(je<1||44+je*2>l.catalog.maxAudioBytes)throw Me("\u5F55\u97F3\u8FC7\u77ED\u6216\u8D85\u8FC7\u5927\u5C0F\u9650\u5236\uFF0C\u8BF7\u7F29\u77ED\u56DE\u7B54\u540E\u91CD\u8BD5");let xe=new o.OfflineAudioContext(1,je,16e3),Ie=xe.createBufferSource();Ie.buffer=pe,Ie.connect(xe.destination),Ie.start();let Ae=await xe.startRendering();if(!f(ie))return;let Ee=$n(Wn(Ae.getChannelData(0)));L();let te=await e.transcribe({audioBase64:Ee,...a},{signal:q});if(!f(ie))return;if(typeof te?.text!="string"||!te.text.trim())throw Me("\u672A\u8BC6\u522B\u5230\u6587\u5B57\uFF0C\u8BF7\u91CD\u5F55\u6216\u8F93\u5165\u6587\u5B57");if(i&&(typeof te.speechDraftId!="string"||!te.speechDraftId))throw Me("\u8F6C\u5199\u8BB0\u5F55\u672A\u4FDD\u5B58\uFF0C\u8BF7\u91CD\u8BD5\u6216\u8F93\u5165\u6587\u5B57","voice-draft-missing");j({phase:"idle",transcript:te.text,rawTranscript:te.text,speechDraftId:te.speechDraftId??null,elapsedSeconds:0})}catch(R){f(ie)&&(L(),b(R,{phase:"idle"}))}}async function m(D){if(s)return;V();let ie=c;j({error:null});try{if(typeof D!="string"||!D.trim()||D.length>4e3)throw Me("\u6717\u8BFB\u6587\u5B57\u65E0\u6548\uFF0C\u8BF7\u9605\u8BFB\u6587\u5B57\u95EE\u9898","invalid-speech-text");let q=d(),R=o.speechSynthesis;if(!q)throw Me("\u8BBE\u5907\u5C1A\u65E0\u5F53\u524D\u8BED\u8A00\u7684\u672C\u5730\u6717\u8BFB\u58F0\u97F3\uFF0C\u8BF7\u9605\u8BFB\u6587\u5B57\u95EE\u9898","device-voice-missing");if(R.speaking||R.pending)throw Me("\u5176\u4ED6\u6717\u8BFB\u6B63\u5728\u8FDB\u884C\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5","device-speech-busy");let pe=new o.SpeechSynthesisUtterance(D);pe.voice=q,pe.lang=q.lang,k=pe,pe.onend=()=>{f(ie)&&k===pe&&(k=void 0,j({phase:"idle"}))},pe.onerror=()=>{f(ie)&&k===pe&&(k=void 0,b(Me("\u8BBE\u5907\u6717\u8BFB\u672A\u5B8C\u6210\uFF0C\u8BF7\u9605\u8BFB\u6587\u5B57\u95EE\u9898","playback-failed"),{phase:"idle"}))},j({phase:"playing"}),R.speak(pe)}catch(q){f(ie)&&(Y(),b(q,{phase:"idle"}))}}let G=D=>{typeof D=="string"&&j({transcript:D,error:null})},W=()=>{if(!l.transcript.trim())return null;let D={text:l.transcript,editedTranscript:l.transcript,rawTranscript:l.rawTranscript,speechDraftId:l.speechDraftId,...a};return j({transcript:"",rawTranscript:"",speechDraftId:null}),D},ne=()=>W()?.text.trim()??"",Z=()=>{o.document?.hidden&&V()},le=()=>V();o.document?.addEventListener("visibilitychange",Z),o.addEventListener?.("pagehide",le),o.speechSynthesis?.addEventListener?.("voiceschanged",y);async function oe(){s||(V(),s=!0,o.document?.removeEventListener("visibilitychange",Z),o.removeEventListener?.("pagehide",le),o.speechSynthesis?.removeEventListener?.("voiceschanged",y),await Promise.allSettled(w))}return{getState:S,refreshCatalog:M,startRecording:O,stopRecording:X,cancel:V,speak:m,stopPlayback:$,setTranscript:G,takeTranscript:ne,takeTranscriptDraft:W,dispose:oe}}function ii({t:e,enableVoiceInput:t,openVoiceSettings:r}){let[i,n]=ue.default.useState("idle"),o=ue.default.useRef(null),a=ue.default.useRef(!1);ue.default.useEffect(()=>{let c=new AbortController;return o.current=c,()=>{c.abort()}},[]);let l=async()=>{let c=o.current;if(!(!c||c.signal.aborted||a.current)){a.current=!0,n("enabling");try{let u=await t?.({signal:c.signal});c.signal.aborted||n(u?.status??"unavailable")}catch{c.signal.aborted||n("failed")}finally{a.current=!1}}},s=()=>{try{r?.()||n("unavailable")}catch{n("unavailable")}};return ue.default.createElement("div",{className:"zj-rail-footer"},ue.default.createElement("p",{className:"zj-subtle"},e("voiceManagedByHost")),ue.default.createElement(z,{quiet:!0,small:!0,disabled:i==="enabling",onClick:()=>{l()}},e(i==="enabling"?"voiceEnabling":"enableHostVoice")),ue.default.createElement(z,{quiet:!0,small:!0,disabled:i==="enabling",onClick:s},e("hostVoiceSettings")),ue.default.createElement("p",{className:"zj-subtle",role:"status","aria-live":"polite"},e(yr(i))))}function ni({api:e,t,question:r,interviewId:i,questionId:n,language:o,onDraft:a,disabled:l}){let[s,c]=ue.default.useState({phase:"idle",transcript:"",error:null,catalog:null,elapsedSeconds:0}),u=ue.default.useRef(null);ue.default.useEffect(()=>{let v=ri({api:e,onChange:c,language:o,transcriptionContext:{interviewId:i,questionId:n},translateError:({code:w})=>t(w==="device-speech-busy"?"systemSpeechBusy":w.startsWith("device-")?"systemSpeechUnavailable":w.startsWith("host-")?"hostAsrUnavailable":"voiceUnavailable")});return u.current=v,()=>{u.current=null,v.dispose()}},[e,i,n,o]),ue.default.useEffect(()=>{u.current?.refreshCatalog()},[e,i,n,o]),ue.default.useEffect(()=>{l&&u.current?.cancel()},[l]);let x={idle:"voiceIdle",requesting:"voiceRequesting",recording:"voiceRecording",transcribing:"voiceTranscribing",playing:"voicePlaying",synthesizing:"processing"},k=s.phase==="recording",h=["requesting","transcribing"].includes(s.phase);return ue.default.createElement("div",{className:"zj-voice"},ue.default.createElement("div",{className:"zj-actions"},k?ue.default.createElement(z,{small:!0,onClick:()=>u.current?.stopRecording()},t("stopRecord")):ue.default.createElement(z,{small:!0,disabled:l||h||!s.catalog?.asr.available,onClick:()=>u.current?.startRecording()},t("record")),(k||h)&&ue.default.createElement(z,{small:!0,quiet:!0,onClick:()=>u.current?.cancel()},t("discardRecord")),["playing","synthesizing"].includes(s.phase)?ue.default.createElement(z,{small:!0,onClick:()=>u.current?.stopPlayback()},t("stopListen")):ue.default.createElement(z,{small:!0,disabled:!r||k||!s.catalog?.tts.available,onClick:()=>u.current?.speak(r)},t("listen")),ue.default.createElement(z,{small:!0,quiet:!0,disabled:k||h,onClick:()=>u.current?.refreshCatalog()},t("refreshVoice"))),ue.default.createElement("p",{className:"zj-voice-state",role:"status"},s.phase!=="idle"?`${t(x[s.phase])}${k?` \xB7 ${s.elapsedSeconds}s`:""}`:s.catalog?.asr.available?t("voiceHint"):t("hostAsrUnavailable")),!s.catalog?.tts.available&&ue.default.createElement("p",{className:"zj-subtle"},t("systemSpeechUnavailable")),s.error&&ue.default.createElement("p",{className:"zj-error",role:"alert"},s.error),s.rawTranscript&&s.rawTranscript!==s.transcript&&ue.default.createElement("details",null,ue.default.createElement("summary",null,t("voiceOriginalTranscript")),ue.default.createElement("p",null,s.rawTranscript)),s.transcript&&ue.default.createElement("div",{className:"zj-form"},ue.default.createElement("label",null,t("voiceDraft"),ue.default.createElement("textarea",{value:s.transcript,onChange:v=>u.current?.setTranscript(v.target.value)})),ue.default.createElement("div",null,ue.default.createElement(z,{small:!0,disabled:l,onClick:()=>{let v=u.current?.takeTranscriptDraft();v&&a(v.text,v)}},t("useTranscript")))))}var re=ye(require("react"),1);function oi(e,t=16e3){if(!Number.isFinite(e)||e<t||t!==16e3)throw new Error("INVALID_SAMPLE_RATE");let r=e/t,i=0,n=0;return o=>{let a=[];for(let c of o){let u=Number.isFinite(c)?Math.max(-1,Math.min(1,c)):0,x=1;for(;x>1e-9;){let k=Math.min(x,r-i);if(n+=u*k,i+=k,x-=k,i>=r-1e-9){let h=n/i;a.push(Math.round(h*(h<0?32768:32767))),i=0,n=0}}}let l=new Uint8Array(a.length*2),s=new DataView(l.buffer);return a.forEach((c,u)=>s.setInt16(u*2,c,!0)),l}}var Jn=`class CareerCapture extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0]?.[0];
    if (input?.length) { const frame = new Float32Array(input); this.port.postMessage(frame, [frame.buffer]); }
    return true;
  }
}
registerProcessor('career-pcm-capture', CareerCapture);`;function Yn(e){let t="";for(let r=0;r<e.length;r+=8192)t+=String.fromCharCode(...e.subarray(r,r+8192));return btoa(t)}function Qn(e){if(typeof e!="string"||!e.length||e.length>262144||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(e))throw new Error("INVALID_AUDIO");let t=atob(e);if(t.length%2)throw new Error("INVALID_AUDIO");return Uint8Array.from(t,r=>r.charCodeAt(0))}function ai(e){try{if(typeof e?.createAnalyser!="function")return null;let t=e.createAnalyser();t.fftSize=512;let r=new Uint8Array(t.fftSize);return{node:t,read(){t.getByteTimeDomainData(r);let i=0;for(let n of r){let o=(n-128)/128;i+=o*o}return Math.min(1,Math.sqrt(i/r.length)*3.2)}}}catch{return null}}function si({sendAudio:e,onState:t=()=>{},mediaDevices:r=globalThis.navigator?.mediaDevices,createAudioContext:i=()=>new globalThis.AudioContext,createCaptureNode:n=x=>new globalThis.AudioWorkletNode(x,"career-pcm-capture"),documentImpl:o=globalThis.document,urlApi:a=globalThis.URL,BlobImpl:l=globalThis.Blob,maxQueuedFrames:s=32,maxPlaybackSeconds:c=30,flushTimeoutMs:u=1e3}={}){if(typeof e!="function"||!Number.isInteger(s)||s<1||!Number.isFinite(c)||c<=0||!Number.isFinite(u)||u<1||u>1e3)throw new Error("INVALID_MEDIA_OPTIONS");let x="idle",k=null,h=!1,v=0,w=null,S,j,b,f,E,P,L,Y=null,d=null,p=new Uint8Array(0),y=[],V=!1,$=0,M,O,X=new WeakSet,m=0,G=0,W=new Set,ne=()=>({phase:x,muted:h,error:k,playing:W.size>0}),Z=()=>t(ne()),le=te=>{try{te?.disconnect()}catch{}};function oe(){f&&(f.port.onmessage=null),le(b),le(f),le(E);for(let te of j?.getTracks()??[])X.has(te)||(X.add(te),te.stop())}function D(){m++;for(let te of W){te.onended=null;try{te.stop()}catch{}le(te)}return W.clear(),G=S?.currentTime||0,Z(),m}async function ie(){v++,w?.abort(),w=null,y=[],p=new Uint8Array(0),D(),f&&(f.port.onmessage=null,f.port.close?.()),oe();let te=S;le(Y?.node),le(d?.node),Y=d=null,S=j=b=f=E=L=void 0,P&&(a.revokeObjectURL(P),P=void 0),o?.removeEventListener("visibilitychange",R),x="closed",Z();try{await te?.close()}catch{}}async function q(te){k=te,await ie(),x="error",Z()}function R(){o.hidden&&ie()}function pe(te,_){return V||(V=!0,M=(async()=>{try{for(;y.length&&te===v&&!_.aborted;){let me=y.shift();await e({audioBase64:Yn(me),seq:$++,sampleRate:16e3},{signal:_})}}catch{te===v&&!_.aborted&&await q("audio-transport-failed")}finally{V=!1}})()),M}function ge(){if(O)return O;if(x!=="listening")return ie();let te=v,_=w.signal;return x="finishing",oe(),D(),p.length&&y.push(p),p=new Uint8Array(0),O=(async()=>{let me;try{if(!await Promise.race([pe(te,_).then(()=>!0),new Promise(he=>{me=setTimeout(()=>he(!1),u)})])||te!==v||_.aborted||y.length||k)throw Object.assign(new Error("audio-flush-incomplete"),{code:"audio-flush-incomplete"})}finally{clearTimeout(me),await ie()}})(),O}function je(te,_,me){if(_!==v||x!=="listening"||h||me.aborted)return;let fe=L(te),he=new Uint8Array(p.length+fe.length);he.set(p),he.set(fe,p.length);let ke=0;for(;he.length-ke>=3200;)y.push(he.slice(ke,ke+3200)),ke+=3200;if(p=he.slice(ke),y.length>s){q("audio-backpressure");return}pe(_,me)}async function xe(){if(x!=="idle")throw new Error("MEDIA_ALREADY_STARTED");let te=++v,_=new AbortController;w=_,x="requesting",Z();try{if(!r?.getUserMedia)throw new Error("MICROPHONE_UNAVAILABLE");let me=await r.getUserMedia({audio:{channelCount:1,echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0},video:!1});if(te!==v){me.getTracks().forEach(he=>he.stop());return}if(j=me,S=i(),!S.audioWorklet?.addModule)throw new Error("AUDIO_WORKLET_UNAVAILABLE");let fe=S;if(P=a.createObjectURL(new l([Jn],{type:"text/javascript"})),await fe.audioWorklet.addModule(P),te!==v||(a.revokeObjectURL(P),P=void 0,await fe.resume(),te!==v))return;if(L=oi(fe.sampleRate),b=fe.createMediaStreamSource(j),f=n(fe),E=fe.createGain(),E.gain.value=0,f.port.onmessage=he=>je(he.data,te,_.signal),b.connect(f),f.connect(E),E.connect(fe.destination),Y=ai(fe),d=ai(fe),Y)try{b.connect(Y.node)}catch{Y=null}for(let he of j.getTracks())he.addEventListener?.("ended",()=>{te===v&&x==="listening"&&q("microphone-ended")},{once:!0});if(o?.addEventListener("visibilitychange",R),o?.hidden){await ie();return}x="listening",Z()}catch{te===v&&await q("microphone-unavailable")}}function Ie(te){if(x==="listening"){h=!!te,y=[],p=new Uint8Array(0),L=oi(S.sampleRate);for(let _ of j.getAudioTracks())_.enabled=!h;Z()}}function Ae({audioBase64:te,sampleRate:_=24e3,epoch:me=m}){if(!S||x!=="listening"||me!==m)return!1;try{if(_!==24e3)throw new Error("INVALID_AUDIO_RATE");let fe=Qn(te),he=fe.length/2,ke=Math.max(G,S.currentTime);if(ke-S.currentTime+he/_>c)throw new Error("PLAYBACK_LIMIT");let De=S.createBuffer(1,he,_),$e=De.getChannelData(0),Qe=new DataView(fe.buffer,fe.byteOffset,fe.byteLength);for(let Ve=0;Ve<he;Ve++)$e[Ve]=Qe.getInt16(Ve*2,!0)/32768;let Pe=S.createBufferSource();if(Pe.buffer=De,Pe.connect(S.destination),d)try{Pe.connect(d.node)}catch{d=null}return Pe.onended=()=>{W.delete(Pe),le(Pe),Z()},W.add(Pe),Pe.start(ke),G=ke+he/_,Z(),!0}catch{return q("invalid-playback-audio"),!1}}function Ee(){if(x!=="listening")return{input:0,output:0,available:!1};try{return{input:h||!Y?0:Y.read(),output:d&&W.size?d.read():0,available:!!(Y||d)}}catch{return{input:0,output:0,available:!1}}}return{start:xe,close:ie,finishCapture:ge,setMuted:Ie,interrupt:D,play:Ae,snapshot:ne,levels:Ee,get playbackEpoch(){return m}}}var Zn=new Set(["invalid-config","credential-unavailable","not-configured","realtime-not-configured","realtime-unavailable","host-unavailable","provider-unavailable"]),dt=e=>typeof e?.code=="string"?e.code:"connection-failed",At=e=>typeof e=="string"&&e.length>0&&e.length<=256,Dt=e=>typeof e=="string"?e.slice(0,32e3):"",tt=e=>e?.available===!1||e?.configured===!1;function li({interviewId:e,api:t,onChange:r=()=>{},onChanged:i=()=>{},createMedia:n=si,createOwnerId:o=()=>globalThis.crypto.randomUUID(),cleanupTimeoutMs:a=5e3,connectTimeoutMs:l=3e4}={}){if(!At(e)||typeof t?.realtime?.open!="function"||typeof t?.realtime?.control!="function")throw new Error("INVALID_REALTIME_CALL");if(![a,l].every(d=>Number.isSafeInteger(d)&&d>0&&d<=6e4))throw new Error("INVALID_REALTIME_TIMEOUT");let s=!1,c=null,u=null,x={phase:"idle",stopping:!1,muted:!1,callId:null,epoch:null,turnId:0,inputTranscript:"",outputTranscript:"",inputFinal:!1,outputFinal:!1,errorCode:null,capabilityMissing:!1,catalog:null,checking:!1},k=()=>({...x}),h=d=>{s||(x={...x,...d},r(k()))},v=()=>{if(!s)try{Promise.resolve(i()).catch(()=>{})}catch{}},w=d=>!!d&&!s&&c===d&&!d.closed,S=d=>d.media?.snapshot().playing?"speaking":d.waiting?"thinking":"listening";async function j(d,p){if(!p||!d.callId||d.remoteClosing)return;d.remoteClosing=!0;let y=new AbortController,V;try{await Promise.race([t.realtime.control({callId:d.callId,ownerId:d.ownerId,action:p},{signal:y.signal}),new Promise(($,M)=>{V=setTimeout(()=>{y.abort(),M(new Error("CLEANUP_TIMEOUT"))},a)})])}catch{}finally{clearTimeout(V),y.abort()}}function b(d,p,y=null,V="end",$=!1){if(!d||d.closed){if(d?.finishingAudio&&!$){d.finishingAudio=!1,d.flushAborted=!0,d.scope.abort();try{Promise.resolve(d.media?.close()).catch(()=>{})}catch{}}return d?.stopped||Promise.resolve()}d.finishingAudio=!!($&&d.callId&&d.ready&&typeof d.media?.finishCapture=="function"),d.closed=!0,d.ready=!1,d.waiting=!1,clearTimeout(d.connectTimer),(!d.callId||!V)&&d.scope.abort();let M,O;if(d.finishingAudio){try{M=Promise.resolve(d.media.finishCapture())}catch(X){M=Promise.reject(X)}O=M.catch(X=>{!d.flushAborted&&c===d&&h({phase:"error",errorCode:X?.code||"audio-flush-incomplete",capabilityMissing:!1})}).then(()=>(d.finishingAudio=!1,j(d,V))),M=M.catch(()=>{})}else{try{M=Promise.resolve(d.media?.close()).catch(()=>{})}catch{M=Promise.resolve()}O=j(d,V)}return c===d&&h({phase:p,stopping:!0,errorCode:y,capabilityMissing:Zn.has(y),muted:!1}),d.stopped=Promise.all([M,O]).then(()=>{d.scope.abort(),c===d&&h({stopping:!1}),v()}),d.stopped}function f(d,p){d.responseId&&d.blockedResponses.add(d.responseId),d.responseId=null,d.waiting=!1,d.outputBlocked=!0,d.minimumOutputTurn=Math.max(d.minimumOutputTurn,p),d.media?.interrupt()}function E(d,p){if(!p||typeof p!="object")return;if(w(d)&&!d.callId&&p.type==="error"){b(d,"error",typeof p.code=="string"?p.code:"provider-error");return}if(p.type==="call"){if(!At(p.callId)||!Number.isSafeInteger(p.epoch)||p.epoch<0||d.callId&&(d.callId!==p.callId||d.epoch!==p.epoch))return;if(d.callId=p.callId,d.epoch=p.epoch,!w(d)){j(d,"end");return}h({callId:d.callId,epoch:d.epoch});return}if(!w(d)||!d.callId||p.epoch!==d.epoch||p.callId!==void 0&&p.callId!==d.callId)return;if(p.providerEventId){if(d.events.has(p.providerEventId))return;if(d.events.size>=1e5){b(d,"error","session-limit");return}d.events.add(p.providerEventId)}if(p.type==="error"){b(d,"error",typeof p.code=="string"?p.code:"provider-error");return}if(p.type==="closed"){let V=p.reason==="ENDED"?"ended":p.reason==="PAUSED"?"paused":"error";b(d,V,V==="error"?p.reason||"connection-closed":null,null);return}if(p.type==="ready"){if(d.ready)return;if(p.inputSampleRate!==16e3||p.outputSampleRate!==24e3||p.format!=="pcm16"||p.channels!==1){b(d,"error","invalid-session");return}d.ready=!0,clearTimeout(d.connectTimer),h({phase:S(d),errorCode:null});return}if(!d.ready)return;let y=Number.isSafeInteger(p.turnId)&&p.turnId>=0?p.turnId:-1;if(["input-transcript","output-transcript","tool-result"].includes(p.type)&&v(),!(y<d.turn)){if(p.type==="speech-started"){d.turn=y,f(d,y),h({phase:"listening",turnId:y,inputTranscript:"",inputFinal:!1});return}if(p.type==="interrupted"){p.responseId&&d.blockedResponses.add(p.responseId),p.reason==="user"&&(d.interruptAwaitingAck=!1),f(d,y),h({phase:"listening"});return}if(p.type==="speech-stopped"||p.type==="input-committed"){p.type==="input-committed"&&!d.interruptAwaitingAck&&(d.outputBlocked=!1),d.turn=y,d.waiting=!0,h({turnId:y,phase:S(d)});return}if(p.type==="input-transcript-delta"||p.type==="input-transcript"){d.turn=y,h({turnId:y,inputTranscript:Dt(p.type==="input-transcript"?p.text:p.preview??`${p.text||""}${p.stash||""}`),inputFinal:p.type==="input-transcript"});return}if(p.type==="input-transcript-failed"){b(d,"error","transcription-failed");return}if(p.type==="response-started"){if(d.outputBlocked||y<d.minimumOutputTurn||!At(p.responseId)||d.blockedResponses.has(p.responseId))return;d.turn=y,d.responseId=p.responseId,d.waiting=!0,h({turnId:y,phase:S(d),outputTranscript:"",outputFinal:!1});return}if(!(d.outputBlocked||!d.responseId||p.responseId!==d.responseId||y<d.minimumOutputTurn||d.blockedResponses.has(p.responseId)))if(p.type==="audio")try{!d.media.play({audioBase64:p.audioBase64,sampleRate:p.sampleRate,epoch:d.media.playbackEpoch})&&w(d)&&b(d,"error","invalid-playback-audio")}catch{b(d,"error","invalid-playback-audio")}else p.type==="output-transcript-delta"?h({outputTranscript:Dt(x.outputTranscript+Dt(p.delta)),outputFinal:!1}):p.type==="output-transcript"?h({outputTranscript:Dt(p.text),outputFinal:!0}):p.type==="response-done"&&(d.blockedResponses.add(d.responseId),d.responseId=null,d.waiting=!1,p.status!=="completed"&&d.media.interrupt(),h({phase:S(d)}))}}async function P(){if(s||x.stopping||c&&!c.closed)return!1;if(tt(x.catalog))return h({phase:"error",errorCode:x.catalog.reason||"realtime-unavailable",capabilityMissing:!0}),!1;let d;try{if(d=o(),!At(d))throw new Error("INVALID_OWNER")}catch{return h({phase:"error",errorCode:"client-unavailable"}),!1}let p={ownerId:d,scope:new AbortController,closed:!1,ready:!1,callId:null,epoch:null,turn:0,minimumOutputTurn:0,responseId:null,waiting:!1,outputBlocked:!1,interruptAwaitingAck:!1,events:new Set,blockedResponses:new Set,remoteClosing:!1,interruptPending:!1};c=p,h({phase:"requesting",stopping:!1,muted:!1,callId:null,epoch:null,errorCode:null,capabilityMissing:!1});try{return p.media=n({async sendAudio({audioBase64:y,seq:V},{signal:$}={}){if(!(!(!s&&c===p&&p.finishingAudio)&&(!w(p)||!p.ready||x.muted)))try{await t.realtime.control({callId:p.callId,ownerId:p.ownerId,action:"audio",audioBase64:y,seq:V},{signal:$||p.scope.signal})}catch(O){throw w(p)&&b(p,"error",dt(O)),O}},onState(y){if(w(p)){if(y.error){b(p,"error",y.error);return}if(y.phase==="closed"){b(p,"paused",null,"pause");return}h({muted:y.muted,...p.ready?{phase:S(p)}:{}})}}}),await p.media.start(),w(p)?p.media.snapshot().phase!=="listening"?(await b(p,"error","microphone-unavailable"),!1):(h({phase:"connecting"}),p.connectTimer=setTimeout(()=>{w(p)&&!p.ready&&b(p,"error","connect-timeout")},l),Promise.resolve().then(()=>{if(w(p))return t.realtime.open({interviewId:e,ownerId:p.ownerId},{signal:p.scope.signal,onEvent:y=>E(p,y)})}).then(()=>{w(p)&&b(p,"error","connection-closed")}).catch(y=>{w(p)&&b(p,"error",dt(y))}),!0):!1}catch(y){return await b(p,"error",dt(y)),!1}}async function L(){if(s||typeof t.realtime.catalog!="function")return x.catalog;u?.abort();let d=new AbortController;u=d,h({checking:!0});try{let p=await t.realtime.catalog({signal:d.signal});return!s&&u===d&&!d.signal.aborted&&h({catalog:p,checking:!1,capabilityMissing:tt(p)}),p}catch(p){return!s&&u===d&&!d.signal.aborted&&h({checking:!1,errorCode:dt(p)}),null}}let Y=Object.freeze({input:0,output:0,available:!1});return{getState:k,start:P,refreshCatalog:L,levels(){let d=c;if(!w(d)||!d.ready||typeof d.media?.levels!="function")return Y;try{return d.media.levels()||Y}catch{return Y}},setMuted(d){w(c)&&c.ready&&c.media.setMuted(!!d)},async interrupt(){let d=c;if(!(!w(d)||!d.ready||d.interruptPending||d.interruptAwaitingAck)){d.interruptPending=!0,d.interruptAwaitingAck=!0,f(d,d.turn),h({phase:"listening"});try{await t.realtime.control({callId:d.callId,ownerId:d.ownerId,action:"interrupt"},{signal:d.scope.signal})}catch(p){w(d)&&await b(d,"error",dt(p))}finally{d.interruptPending=!1}}},pause:()=>b(c,"paused",null,"pause",!0),end:()=>b(c,"ended",null,"end",!0),async dispose(){s||(s=!0,u?.abort(),await b(c,"ended"))}}}function Xn(e){return e.capabilityMissing?"realtimeConfigure":/microphone|permission|device|worklet/i.test(e.errorCode||"")?"realtimeMicrophoneError":e.errorCode==="transcription-failed"?"realtimeTranscriptError":/audio|playback|backpressure/i.test(e.errorCode||"")?"realtimeAudioError":"realtimeConnectionError"}var di=["listening","speaking","thinking"],pi=["requesting","connecting"],Rn={idle:"realtimeIdle",requesting:"realtimeRequesting",connecting:"realtimeConnecting",listening:"realtimeListening",speaking:"realtimeSpeaking",thinking:"realtimeThinking",paused:"realtimePaused",ended:"realtimeEnded",error:"realtimeEnded"};function eo(e){let t=Number.isFinite(e)&&e>0?Math.floor(e):0;return`${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`}var to=()=>!!globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;function ro(e,t,r){re.default.useEffect(()=>{let i=e.current;if(!r||!i||typeof globalThis.requestAnimationFrame!="function")return;let n=0,o=0,a=0,l=(c,u)=>c+(u-c)*(u>c?.5:.1),s=()=>{let c=t.current?.levels?.();if(c?.available){let u=x=>Math.max(0,((x||0)-.08)/.92);o=l(o,u(c.input)),a=l(a,u(c.output)),i.dataset.levels="on",i.style.setProperty("--zj-level-in",o.toFixed(3)),i.style.setProperty("--zj-level-out",a.toFixed(3))}else delete i.dataset.levels;n=globalThis.requestAnimationFrame(s)};return n=globalThis.requestAnimationFrame(s),()=>{globalThis.cancelAnimationFrame(n),delete i.dataset.levels,i.style.removeProperty("--zj-level-in"),i.style.removeProperty("--zj-level-out")}},[e,t,r])}function ci({interview:e,api:t,t:r,onChanged:i,openSettings:n}){let[o,a]=re.default.useState({phase:"idle",muted:!1,stopping:!1,checking:!1,inputTranscript:"",outputTranscript:"",errorCode:null,capabilityMissing:!1,catalog:null}),l=re.default.useRef(null),s=re.default.useRef(i),c=re.default.useRef(null);s.current=i,re.default.useEffect(()=>{let f=li({interviewId:e.id,api:t,onChange:a,onChanged:()=>s.current?.()});return l.current=f,f.refreshCatalog(),()=>{l.current=null,f.dispose()}},[t,e.id]),re.default.useEffect(()=>{e.status==="completed"&&l.current?.end()},[e.status]);let u=di.includes(o.phase),x=pi.includes(o.phase);ro(c,l,u);let[k,h]=re.default.useState(null),v=re.default.useRef([]),w=()=>{v.current.forEach(clearTimeout),v.current=[],h(null)};re.default.useEffect(()=>()=>v.current.forEach(clearTimeout),[]),re.default.useEffect(()=>{!u&&!x&&w()},[u,x]);let[S,j]=re.default.useState(null);re.default.useEffect(()=>{j(null)},[e.id]),re.default.useEffect(()=>{if(!u)return;j(E=>E??0);let f=setInterval(()=>j(E=>(E??0)+1),1e3);return()=>clearInterval(f)},[u]);let b=Object.fromEntries(["setMuted","interrupt","pause","end","refreshCatalog"].map(f=>[f,(...E)=>l.current?.[f](...E)]));return b.start=()=>{let f=l.current?.start();return to()||(w(),h(3),v.current=[setTimeout(()=>h(2),800),setTimeout(()=>h(1),1600),setTimeout(()=>h(null),2400)]),f},re.default.createElement(io,{interview:e,state:o,t:r,actions:b,openSettings:n,stageRef:c,countdown:k,elapsed:S})}function io({interview:e,state:t,t:r,actions:i={},openSettings:n,stageRef:o,countdown:a=null,elapsed:l=null}){let s=di.includes(t.phase),c=pi.includes(t.phase),u=e.questions?.find(v=>v.id===e.currentQuestionId)?.text||"",x=t.outputTranscript||u,k=s?t.phase:c?"thinking":"idle",h=()=>{try{n?.()}catch{}};return re.default.createElement("section",{className:"zj-room zj-call","aria-label":r("realtimeCall"),"aria-busy":t.stopping||c},re.default.createElement("header",{className:"zj-room-bar"},re.default.createElement("div",{className:"zj-room-status"},re.default.createElement("span",{className:`zj-tally${s?" is-live":""}`,"aria-hidden":"true"}),re.default.createElement("h2",{className:"zj-room-phase",role:"status","aria-live":"polite"},r(Rn[t.phase]||"realtimeIdle")),l!==null&&re.default.createElement("time",{className:"zj-room-clock"},eo(l))),re.default.createElement("div",{className:"zj-actions"},s&&re.default.createElement(re.default.Fragment,null,re.default.createElement(z,{small:!0,onClick:()=>{i.pause?.()}},r("pause")),re.default.createElement(z,{small:!0,quiet:!0,onClick:()=>{i.end?.()}},r("realtimeEnd"))),c&&re.default.createElement(z,{small:!0,onClick:()=>{i.end?.()}},r("cancel")))),re.default.createElement("div",{className:`zj-dip is-${k}`,ref:o},re.default.createElement("div",{className:"zj-glow is-l","aria-hidden":"true"}),re.default.createElement("div",{className:"zj-glow is-r","aria-hidden":"true"}),re.default.createElement("div",{className:"zj-dip-axis","aria-hidden":"true"}),a!==null&&(s||c)&&re.default.createElement("div",{className:"zj-count","aria-hidden":"true"},re.default.createElement("span",{key:a},a)),re.default.createElement("div",{className:"zj-pane is-l"},re.default.createElement("div",{className:"zj-pane-block"},re.default.createElement("span",{className:"zj-who"},r("realtimeInterviewer")),x?re.default.createElement("p",{className:"zj-ask"},x):re.default.createElement("p",{className:"zj-ask is-quiet"},r("realtimeTranscriptHere")))),re.default.createElement("div",{className:"zj-pane is-r"},re.default.createElement("div",{className:"zj-pane-block"},re.default.createElement("span",{className:"zj-who"},r("realtimeYou")),t.inputTranscript&&re.default.createElement("p",{className:"zj-say"},t.inputTranscript),s&&re.default.createElement("div",{className:"zj-actions"},re.default.createElement(z,{"aria-pressed":t.muted,onClick:()=>i.setMuted?.(!t.muted)},r(t.muted?"realtimeUnmute":"realtimeMute")),re.default.createElement(z,{onClick:()=>{i.interrupt?.()}},r("realtimeInterrupt"))),!s&&!c&&re.default.createElement(re.default.Fragment,null,re.default.createElement("p",{className:"zj-subtle"},r("realtimeAudioNotice")),re.default.createElement("div",{className:"zj-actions"},re.default.createElement(z,{primary:!0,disabled:t.stopping||t.checking||tt(t.catalog)||e.status==="completed",onClick:()=>{i.start?.()}},r(t.phase==="idle"?"realtimeStart":"realtimeReconnect")),re.default.createElement(z,{quiet:!0,disabled:t.stopping||!n,onClick:h},r("realtimeSettings")),re.default.createElement(z,{quiet:!0,disabled:t.stopping||t.checking,onClick:()=>{i.refreshCatalog?.()}},r("refreshVoice")))),t.muted&&re.default.createElement("p",{className:"zj-status-line"},r("realtimeMute")),(t.errorCode||t.capabilityMissing)&&re.default.createElement("p",{className:"zj-error",role:"alert"},r(Xn(t))),(x||t.inputTranscript)&&re.default.createElement("p",{className:"zj-subtle"},r("realtimeTranscriptNote"))))))}function ui({state:e,interview:t,t:r,busy:i,onAction:n,onExport:o,voiceApi:a,realtimeApi:l,openRealtimeSettings:s,onChanged:c,nativeChat:u,onEvidence:x,answerDraft:k,onAnswerDraftChange:h}){let[v,w]=H.default.useState(null),S=t.questions.find(p=>p.id===t.currentQuestionId),j=k||v,b=S&&j?.questionId===S.id?j.text:"",f=S&&j?.questionId===S.id?j.speechDraft:null,E=(p,y=f)=>{let V={questionId:S?.id,text:p,speechDraft:y};w(V),h?.(V)},P=e.reports.find(p=>p.id===t.reportId),L=async p=>{if(p.preventDefault(),i||t.status!=="active"||!S||S.answer||!b.trim())return;await n("interview.answer",{interviewId:t.id,questionId:S?.id,questionNumber:t.questions.findIndex(V=>V.id===S?.id)+1,text:b,...f?.questionId===S?.id?{speechDraftId:f.speechDraftId,editedTranscript:f.editedTranscript}:{}})&&(w(null),h?.(void 0))};if(t.mode==="realtime"&&t.status!=="completed")return H.default.createElement(no,{interview:t,t:r,busy:i,onAction:n,api:l,openSettings:s,onChanged:c});let Y=S?t.questions.indexOf(S)+1:0,d=t.questions.filter(p=>p.answer).map((p,y)=>{let V=p.speechDrafts?.find(M=>M.id===p.answer.speechDraftId),$=V?.reviews?.find(M=>M.id===p.answer.speechReviewId);return H.default.createElement("details",{className:"zj-answer-history",key:p.id},H.default.createElement("summary",null,r("question",{number:y+1})," \xB7 ",p.text),H.default.createElement("p",null,p.answer.text),V&&$&&H.default.createElement("details",null,H.default.createElement("summary",null,r("voiceEvidence")),H.default.createElement("h4",null,r("voiceOriginalTranscript")),H.default.createElement("p",null,V.rawTranscript),H.default.createElement("h4",null,r("voiceEditedTranscript")),H.default.createElement("p",null,$.editedTranscript)))});return t.status==="completed"?H.default.createElement("div",{className:"zj-room"},H.default.createElement("header",{className:"zj-room-bar"},H.default.createElement("div",{className:"zj-room-status"},H.default.createElement("span",{className:"zj-tally","aria-hidden":"true"}),H.default.createElement("h2",{className:"zj-room-phase"},r("report")))),H.default.createElement("div",{className:"zj-room-scroll"},H.default.createElement("div",{className:"zj-room-after"},P?H.default.createElement(H.default.Fragment,null,H.default.createElement(We,{result:P,t:r,onEvidence:x}),[["strengths",P.strengths],["improvements",P.improvements],["nextSteps",P.nextSteps]].map(([p,y])=>H.default.createElement("section",{className:"zj-card",key:p},H.default.createElement("h3",null,r(p)),H.default.createElement(st,{values:y}))),H.default.createElement("div",{className:"zj-actions"},H.default.createElement(z,{onClick:()=>o("report",P.id,"docx")},r("exportDocx")),H.default.createElement(z,{onClick:()=>o("report",P.id,"pdf")},r("exportPdf")))):H.default.createElement("p",null,r("noReport")),d)),u):H.default.createElement("div",{className:"zj-room"},H.default.createElement("header",{className:"zj-room-bar"},H.default.createElement("div",{className:"zj-room-status"},H.default.createElement("span",{className:`zj-tally${t.status==="active"?" is-live":""}`,"aria-hidden":"true"}),H.default.createElement("h2",{className:"zj-room-phase"},r(t.status==="paused"?"paused":"interview")),S&&H.default.createElement("span",{className:"zj-room-clock"},r("question",{number:Y}),S.kind==="followup"?` \xB7 ${r("followup")}`:"")),H.default.createElement("div",{className:"zj-actions"},H.default.createElement(z,{small:!0,disabled:i,onClick:()=>n(`interview.${t.status==="paused"?"resume":"pause"}`,{interviewId:t.id})},r(t.status==="paused"?"resumeInterview":"pause")),H.default.createElement(z,{small:!0,quiet:!0,disabled:i,onClick:()=>n("interview.finish",{interviewId:t.id})},r("finish")))),H.default.createElement("div",{className:"zj-dip is-idle"},H.default.createElement("div",{className:"zj-glow is-l","aria-hidden":"true"}),H.default.createElement("div",{className:"zj-glow is-r","aria-hidden":"true"}),H.default.createElement("div",{className:"zj-dip-axis","aria-hidden":"true"}),H.default.createElement("div",{className:"zj-pane is-l"},H.default.createElement("div",{className:"zj-pane-block"},H.default.createElement("span",{className:"zj-who"},r("realtimeInterviewer")),S?H.default.createElement("h2",{className:"zj-ask"},S.text):H.default.createElement("p",{className:"zj-ask is-quiet"},r("interviewWaiting")),t.lastError&&H.default.createElement("p",{className:"zj-error"},r("errorTitle")),H.default.createElement("p",{className:"zj-subtle"},r("interviewNativeHint")),d)),H.default.createElement("div",{className:"zj-pane is-r"},H.default.createElement("div",{className:"zj-pane-block"},H.default.createElement("form",{className:"zj-form",onSubmit:L},H.default.createElement("label",null,r("answer"),H.default.createElement("textarea",{required:!0,rows:8,value:b,placeholder:r("answerPlaceholder"),disabled:i||t.status!=="active"||!!S?.answer,onChange:p=>E(p.target.value)})),H.default.createElement("div",{className:"zj-actions"},H.default.createElement(z,{type:"submit",primary:!0,disabled:i||t.status!=="active"||!b.trim()||!!S?.answer},r("submitAnswer")))),H.default.createElement(ni,{key:`${t.id}:${S?.id||""}`,api:a,language:t.language,t:r,interviewId:t.id,questionId:S?.id,question:S?.text||"",onDraft:(p,y)=>{y.questionId===S?.id&&E(p,y)},disabled:i||t.status!=="active"||!S||!!S.answer})))),u)}function no({interview:e,t,busy:r,onAction:i,api:n,openSettings:o,onChanged:a}){let[l,s]=H.default.useState({}),c=H.default.useMemo(()=>({realtime:n}),[n]),u=e.questions.filter(h=>h.answer),x=h=>l[h.id]?.baseHash===h.hash?l[h.id].text:h.text,k=async()=>{let h=u.filter(w=>l[w.answer.id]?.baseHash===w.answer.hash).map(w=>({answerId:w.answer.id,text:l[w.answer.id].text}));await i("realtime.review",{interviewId:e.id,revisions:h})&&await i("interview.finish",{interviewId:e.id})};return H.default.createElement("div",{className:"zj-room-scroll"},H.default.createElement(ci,{interview:e,api:c,t,onChanged:a,openSettings:o}),(e.unassignedTranscripts?.length>0||e.status==="paused"&&u.length>0)&&H.default.createElement("div",{className:"zj-room-after"},e.unassignedTranscripts?.length>0&&H.default.createElement("details",{className:"zj-answer-history"},H.default.createElement("summary",null,t("realtimeUnassigned")),H.default.createElement("p",{className:"zj-subtle"},t("realtimeUnassignedNote")),e.unassignedTranscripts.map(h=>H.default.createElement("p",{key:h.eventId},h.text))),e.status==="paused"&&u.length>0&&H.default.createElement("section",{className:"zj-card"},H.default.createElement("h3",null,t("realtimeReview")),H.default.createElement("p",{className:"zj-subtle"},t("realtimeReviewNote")),u.map(h=>H.default.createElement("details",{className:"zj-answer-history",key:h.id},H.default.createElement("summary",null,h.text),h.interrupted&&H.default.createElement("p",{className:"zj-subtle"},t("realtimePartialQuestion")),H.default.createElement("label",null,t("answer"),H.default.createElement("textarea",{rows:4,disabled:r,value:x(h.answer),onChange:v=>s(w=>({...w,[h.answer.id]:{text:v.target.value,baseHash:h.answer.hash}}))})),H.default.createElement("details",null,H.default.createElement("summary",null,t("voiceOriginalTranscript")),H.default.createElement("p",null,h.answer.parts?.map(v=>v.text).join(`
`))))),H.default.createElement(z,{primary:!0,disabled:r||u.some(h=>!x(h.answer).trim()),onClick:k},t("realtimeConfirmReport")))))}var ve=ye(require("react"),1);function mi({data:e,t,onClose:r,loadOriginal:i,onDownload:n}){let[o,a]=ve.default.useState(0),[l,s]=ve.default.useState(100),[c,u]=ve.default.useState(null),[x,k]=ve.default.useState(!1),h=e.metadata,v=h.document?.blocks||h.ocr?.lines||[],w=v[o],S=wt(h.text||"",w?{quote:w.text,start:w.startOffset,end:w.endOffset}:null),j=["image/png","image/jpeg"].includes(h.original?.mime);return ve.default.useEffect(()=>{if(!j)return;let b=new AbortController,f;return i(e.versionId,{signal:b.signal}).then(E=>{b.signal.aborted||(f=URL.createObjectURL(E.blob),u(f))}).catch(E=>{E.name!=="AbortError"&&k(!0)}),()=>{b.abort(),f&&URL.revokeObjectURL(f)}},[e.versionId,j,i]),ve.default.createElement(Fe,{title:`${t("viewSource")} \xB7 ${e.title}`,t,onClose:r},ve.default.createElement("p",{className:"zj-subtle"},t("sourceReview")),ve.default.createElement("div",{className:"zj-actions"},e.source.originalFileId&&ve.default.createElement(z,{small:!0,onClick:()=>n(e.versionId)},t("downloadOriginal")),e.source.sourceUrl&&ve.default.createElement("a",{className:"zj-source-link",href:e.source.sourceUrl,target:"_blank",rel:"noreferrer"},e.source.pageTitle||t("source"))),x&&ve.default.createElement("p",{className:"zj-error"},t("sourceUnavailable")),c&&ve.default.createElement("div",{className:"zj-original-image"},ve.default.createElement("img",{src:c,alt:t("originalImage")}),w?.box&&h.ocr&&ve.default.createElement("svg",{viewBox:`0 0 ${h.ocr.width} ${h.ocr.height}`,preserveAspectRatio:"none","aria-hidden":"true"},ve.default.createElement("rect",{x:w.box.x,y:w.box.y,width:w.box.width,height:w.box.height}))),v.length>0&&ve.default.createElement("div",{className:"zj-source-blocks"},v.slice(0,l).map((b,f)=>ve.default.createElement("button",{type:"button",className:o===f?"is-active":"",key:f,onClick:()=>a(f)},ve.default.createElement("span",null,b.kind==="pdf"?t("page",{number:b.pageNumber}):t("block",{number:f+1})),b.text)),v.length>l&&ve.default.createElement(z,{small:!0,onClick:()=>s(b=>b+100)},t("loadMore"))),ve.default.createElement("div",{className:"zj-paper-content"},S.before,S.quote&&ve.default.createElement("mark",null,S.quote),S.after),w&&ve.default.createElement("details",{className:"zj-source-details"},ve.default.createElement("summary",null,t("sourceDetails")),ve.default.createElement("pre",null,JSON.stringify({...w.kind==="pdf"?{page:w.pageNumber,bounds:w.bbox}:{},...w.kind==="docx"?{part:w.sourcePart,path:w.path}:{},...w.box?{bounds:w.box}:{},textRange:[w.startOffset,w.endOffset]},null,2))))}var Ce=ye(require("react"),1);var Rt={"receipt.undo":"deskUndone","assessment.run":"taskAssessment","rewrite.run":"taskRewrite","rewrite.accept":"taskAccept","material.upload":"taskImport","material.fetch":"taskImport","material.add":"taskSaveMaterial","material.update":"taskSaveMaterial","material.confirm":"taskConfirmMaterial","goal.create":"taskSaveGoal","goal.update":"taskSaveGoal","goal.linkMaterial":"taskLinkMaterial","realtime.create":"taskPrepareInterview","realtime.review":"taskReviewTranscript","interview.finish":"taskReport","conversation.link":"taskSaveConversation"},gi=e=>Rt[e]||"taskSucceeded";function fi({operation:e,onCancel:t,onRetry:r,onOpen:i,t:n}){if(!e)return null;let o={running:"taskRunning",refreshing:"taskRefreshing",succeeded:"taskSucceeded",failed:"taskFailed",cancelled:"taskCancelled"}[e.status];return o?Ce.default.createElement("section",{className:"zj-task-card","aria-label":n("taskStatus")},Ce.default.createElement("div",{role:"status","aria-live":"polite"},Ce.default.createElement("strong",null,n(Rt[e.action]||"processing")),Ce.default.createElement("span",{className:"zj-subtle"},n(o))),e.canCancel&&Ce.default.createElement(z,{small:!0,onClick:()=>{t?.(e.requestId)}},n("cancelTask")),e.canRetry&&r&&Ce.default.createElement(z,{small:!0,onClick:r},n("retry")),e.status==="succeeded"&&e.receipt?.target&&i&&Ce.default.createElement(z,{small:!0,onClick:()=>i(e.receipt.target)},n("deskOpenResult"))):null}function hi({receipts:e=[],onOpen:t,onUndo:r,busy:i,t:n}){return e.length?Ce.default.createElement("details",{className:"zj-receipts"},Ce.default.createElement("summary",null,n("deskReceipts")," \xB7 ",e.length),Ce.default.createElement("div",null,e.slice(0,30).map(o=>Ce.default.createElement("div",{className:"zj-receipt",key:o.id},Ce.default.createElement("div",null,Ce.default.createElement("strong",null,n(Rt[o.action]||"taskSucceeded")),Ce.default.createElement("time",{dateTime:o.createdAt},o.createdAt.slice(0,16).replace("T"," "))),Ce.default.createElement("div",{className:"zj-actions"},Ce.default.createElement(z,{small:!0,quiet:!0,onClick:()=>t(o.target)},n("deskOpenResult")),Ce.default.createElement(z,{small:!0,quiet:!0,disabled:i||!o.undo.available,title:n(o.undo.reasonCode==="UNDO_CONFLICT"?"deskUndoConflict":o.undo.reasonCode==="UNDO_USED"?"deskUndoUsed":o.undo.available?"deskUndoNote":"deskUndoUnavailable"),onClick:()=>r(o)},n("deskUndo"))))))):null}function vi(e,t,r){let i=be(e,t);if(!i?.version.confirmed||typeof i.version.text!="string")return null;let{material:n,version:o}=i;if(r&&(r.versionId!==o.id||!Number.isInteger(r.start)||!Number.isInteger(r.end)||r.start<0||r.end<=r.start||r.end>o.text.length||o.text.slice(r.start,r.end)!==r.text))return null;let a=r?.text??o.text;return a.trim()?{versionId:t,materialId:n.id,kind:n.kind,title:n.title,revision:o.revision,text:a,...r?{start:r.start,end:r.end}:{}}:null}function bi(e,t){if(!e?.text?.trim())throw new Error(t("contextUnavailable"));return t("contextDraftText",{title:e.title,version:t("version",{number:e.revision}),versionId:e.versionId,text:e.text})}async function ji(e,t,r,i){if(!r||typeof e?.using!="function"||typeof t?.input?.requestDraftInitialization!="function")throw Object.assign(new Error("DSH native draft preparation is unavailable."),{code:"NATIVE_DRAFT_UNAVAILABLE"});return e.using(r,{source:"zhijingChat"},async n=>{let o=await n.ready,a=t.input.requestDraftInitialization(o,{prompt:i,whenDraftExists:"append"});if(a!=="applied")throw Object.assign(new Error("The conversation draft is busy. Try again when submission finishes."),{code:"NATIVE_DRAFT_BLOCKED"});return a})}var F=ye(require("react"),1);var U=ye(require("react"),1);var pt=["qwen3.5-omni-plus-realtime","qwen3.5-omni-flash-realtime","qwen3.8-omni-flash-realtime"],xi=/^[A-Za-z_][A-Za-z0-9_]*$/,er=/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,oo=Object.freeze({status:"unavailable",writable:!1}),ao={getSnapshot:()=>oo,subscribe:()=>()=>{}};function rt(e={}){return{realtimeEnabled:e.realtimeEnabled===!0,realtimeRegion:e.realtimeRegion??"beijing",realtimeWorkspace:e.realtimeWorkspace??"",realtimeModel:e.realtimeModel??pt[0],realtimeCredential:e.realtimeCredential??"ZHIJING_REALTIME_API_KEY"}}function tr(e,t,r){let i=(...a)=>(r??=zt()).request(...a),n=()=>rt(e?.getSnapshot()?.value).realtimeCredential,o=async a=>{if(e?.getSnapshot()?.status!=="ready"||!t?.describe||!xi.test(a)||a!==n())return{status:"unavailable"};try{let l=await t.describe([a]),s=l.ok&&l.value?.[a];return s?{status:"ready",configured:s.configured===!0,writable:s.writable===!0}:{status:"failed"}}catch{return{status:"failed"}}};return{hooks:{realtimeSettings:e??ao},async saveSettings(a,l){if(!e||e.getSnapshot().status!=="ready"||!e.getSnapshot().writable)return"readonly";let s=rt(a);if(!["beijing","singapore"].includes(s.realtimeRegion)||!pt.includes(s.realtimeModel)||typeof s.realtimeWorkspace!="string"||s.realtimeEnabled&&!er.test(s.realtimeWorkspace)||!xi.test(s.realtimeCredential))return"invalid";try{return await e.mutate(Object.entries(s).map(([c,u])=>({op:"set",path:[c],value:u})),l)?"saved":"conflict"}catch{return"failed"}},describeCredential:o,async testAudio(a){let l=e?.getSnapshot(),s=rt(l?.value);if(l?.status!=="ready"||!s.realtimeEnabled||!er.test(s.realtimeWorkspace))throw Object.assign(new Error("Audio settings unavailable"),{code:"not-configured"});let c=await o(s.realtimeCredential);if(a.signal.throwIfAborted(),c.status!=="ready"||!c.configured)throw Object.assign(new Error("Audio credential unavailable"),{code:"credential-unavailable"});return i("realtime.test",{},a)},cancelAudio:({requestId:a,signal:l})=>i("task.cancel",{requestId:a},{signal:l}),async storeCredential(a,l){if(typeof l!="string"||!l.trim()||!t?.set||a!==n())return"invalid";let s=await o(a);if(s.status!=="ready")return"failed";if(!s.writable)return"readonly";try{return(await t.set(a,l)).ok?"saved":"failed"}catch{return"failed"}}}}var zi={BUSY:"rtProbeBusy","probe-timeout":"rtProbeTimeout","connect-timeout":"rtProbeTimeout","response-timeout":"rtProbeTimeout","not-configured":"rtProbeConfigure","invalid-config":"rtProbeConfigure","credential-unavailable":"rtProbeCredential","probe-no-audio":"rtProbeNoAudio","invalid-audio":"rtProbeNoAudio","probe-no-transcript":"rtProbeNoTranscript","authentication-failed":"rtProbeAuthentication","access-denied":"rtProbeAccess","endpoint-unavailable":"rtProbeEndpoint","rate-limited":"rtProbeRateLimit","provider-unavailable":"rtProbeProvider","dns-failed":"rtProbeNetwork","tls-failed":"rtProbeTls",cancelled:"rtProbeCancelled"};function so(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return`realtime_test_${e.randomUUID()}`;if(typeof e?.getRandomValues!="function")throw new Error("Secure request identity unavailable");return`realtime_test_${[...e.getRandomValues(new Uint8Array(16))].map(t=>t.toString(16).padStart(2,"0")).join("")}`}function rr({testAudio:e,cancelAudio:t},{onChange:r,urlApi:i=globalThis.URL,makeAudio:n=s=>new Audio(s),setTimer:o=setTimeout,clearTimer:a=clearTimeout,makeRequestId:l=so}={}){let s,c,u,x=!1,k=0,h={status:"idle",playing:!1},v=f=>{h=f,x||r?.(f)},w=()=>{k+=1,c&&(c.pause(),c.currentTime=0),h.playing&&v({...h,playing:!1})},S=()=>{w(),c&&(c.onended=null,c.onerror=null,c.removeAttribute("src"),c.load(),c=null),u&&(i.revokeObjectURL(u),u=null)},j=()=>{if(!s)return;let f=s;s=null,a(f.timer),f.controller.abort();let E=new AbortController,P=o(()=>E.abort(),3e3);try{Promise.resolve(t({requestId:f.requestId,signal:E.signal})).catch(()=>{}).finally(()=>a(P))}catch{a(P)}};return{async start(){if(x||s)return;S();let f;try{f={requestId:l(),controller:new AbortController}}catch{v({status:"failed",playing:!1,message:"rtProbeFailed"});return}s=f,v({status:"running",playing:!1}),f.timer=o(()=>{s===f&&(j(),v({status:"failed",playing:!1,message:"rtProbeTimeout"}))},3e4);try{let E=await e({requestId:f.requestId,signal:f.controller.signal});if(x||s!==f)return;let P=E?.audio?.base64,L=E?.latencyMs;if(E?.ok!==!0||E.checks?.handshake!==!0||E.checks?.audio!==!0||E.checks?.transcript!==!0||E.audio.mimeType!=="audio/wav"||typeof P!="string"||!P.length||P.length>256*1024||!/^[A-Za-z0-9+/]+={0,2}$/.test(P)||!L||!["ready","firstAudio","total"].every(p=>Number.isFinite(L[p])&&L[p]>=0))throw new Error("Invalid audio test result");let Y=atob(P);if(Y.length<44||Y.slice(0,4)!=="RIFF"||Y.slice(8,12)!=="WAVE")throw new Error("Invalid test audio");let d=Uint8Array.from(Y,p=>p.charCodeAt(0));u=i.createObjectURL(new Blob([d],{type:"audio/wav"})),v({status:"succeeded",playing:!1,latencyMs:{ready:Math.round(L.ready),firstAudio:Math.round(L.firstAudio),total:Math.round(L.total)}})}catch(E){!x&&s===f&&v({status:"failed",playing:!1,message:Object.hasOwn(zi,E?.code)?zi[E.code]:"rtProbeFailed"})}finally{a(f.timer),s===f&&(s=null)}},cancel(){s&&(j(),S(),v({status:"cancelled",playing:!1,message:"rtProbeCancelled"}))},clear:()=>{j(),S(),v({status:"idle",playing:!1})},async play(){if(x||!u||h.status!=="succeeded"||h.playing)return;let f=++k;try{if(!c){let E=n(u);c=E,E.onended=()=>{x||c!==E||(k+=1,v({...h,playing:!1}))},E.onerror=()=>{x||c!==E||(k+=1,v({...h,playing:!1,playbackMessage:"rtProbePlaybackFailed"}))}}v({...h,playing:!0,playbackMessage:void 0}),await c.play()}catch{!x&&f===k&&v({...h,playing:!1,playbackMessage:"rtProbePlaybackFailed"})}},stop:w,dispose(){x=!0,j(),S()}}}function ki(e,t){let r;return e.slots.inject("plugins.bundle.config",()=>e.slots.register({name:"plugins.bundle.config",key:"dsh-interview-desk",locale:t,inject:()=>{let i=e.get("configForms")?.get("dsh-interview-desk"),n=e.get("remote.credentials")??e.get("remote")?.credentials;return(!r||r.form!==i||r.credentials!==n)&&(r={form:i,credentials:n,actions:tr(i,n)}),r.actions}},lo))}function lo({t:e,useRealtimeSettings:t,saveSettings:r,describeCredential:i,storeCredential:n,testAudio:o,cancelAudio:a}){let l=t(q=>q),s=rt(l.value),[c,u]=U.default.useState(null),[x,k]=U.default.useState(void 0),[h,v]=U.default.useState(!1),[w,S]=U.default.useState(null),[j,b]=U.default.useState({status:"loading"}),[f,E]=U.default.useState(""),[P,L]=U.default.useState(!1),[Y,d]=U.default.useState(null),[p,y]=U.default.useState(0),[V,$]=U.default.useState({status:"idle",playing:!1}),M=U.default.useRef(null),O=U.default.useRef(Ue()),X=U.default.useRef(Ue()),m=c??s,G=s.realtimeCredential,W=U.default.useRef(!0);U.default.useEffect(()=>(W.current=!0,()=>{W.current=!1}),[]),U.default.useEffect(()=>{let q=rr({testAudio:o,cancelAudio:a},{onChange:$});return M.current=q,()=>{q.dispose(),M.current===q&&(M.current=null)}},[o,a]),U.default.useEffect(()=>{M.current?.clear()},[l.status,l.revision,s.realtimeEnabled,s.realtimeRegion,s.realtimeWorkspace,s.realtimeModel,G,p]),U.default.useEffect(()=>{let q=!0;return E(""),d(null),b({status:"loading"}),l.status==="ready"?i(G).then(R=>{q&&b(R)}):b({status:"unavailable"}),()=>{q=!1}},[G,l.status,p,i]);let ne=(q,R)=>{M.current?.clear(),c||k(l.revision),u(pe=>({...pe??s,[q]:R})),S(null)},Z=l.status!=="ready"||!l.writable||h||P,le=m.realtimeCredential!==G,oe=c!==null||f.length>0,D=l.status!=="ready"||h||P||oe||!s.realtimeEnabled||!er.test(s.realtimeWorkspace)||j.status!=="ready"||!j.configured||V.status==="running",ie=(q,R)=>`${q}${R[0].toUpperCase()}${R.slice(1)}`;return U.default.createElement("section",{className:"zj","data-zhijing-realtime-settings":"",style:{display:"block",height:"auto",minHeight:0,maxWidth:720}},U.default.createElement("style",null,Nt),U.default.createElement("h3",null,e("realtimeSettings")),U.default.createElement("p",{className:"zj-subtle"},e("rtSettingsNote")),U.default.createElement("p",{className:"zj-subtle"},e("rtSettingsPrivacy")),l.status!=="ready"&&U.default.createElement("p",{role:"status"},e(l.status==="loading"?"loading":"rtSettingsUnavailable")),U.default.createElement("form",{className:"zj-form",onSubmit:q=>{q.preventDefault(),!Z&&O.current(async()=>{M.current?.clear(),v(!0);let R=await r(m,c?x:l.revision);W.current&&(v(!1),S(ie("rtSettings",R)),R==="saved"&&u(null))})}},U.default.createElement("label",null,e("rtSettingsEnabled"),U.default.createElement("select",{disabled:Z,value:String(m.realtimeEnabled),onChange:q=>ne("realtimeEnabled",q.target.value==="true")},U.default.createElement("option",{value:"false"},e("rtSettingsOff")),U.default.createElement("option",{value:"true"},e("rtSettingsOn")))),U.default.createElement("label",null,e("rtSettingsRegion"),U.default.createElement("select",{disabled:Z,value:m.realtimeRegion,onChange:q=>ne("realtimeRegion",q.target.value)},U.default.createElement("option",{value:"beijing"},e("rtSettingsBeijing")),U.default.createElement("option",{value:"singapore"},e("rtSettingsSingapore")))),U.default.createElement("label",null,e("rtSettingsWorkspace"),U.default.createElement("input",{disabled:Z,required:m.realtimeEnabled,maxLength:64,value:m.realtimeWorkspace,onChange:q=>ne("realtimeWorkspace",q.target.value.trim()),autoComplete:"off",placeholder:e("rtSettingsWorkspaceHint")})),U.default.createElement("label",null,e("rtSettingsModel"),U.default.createElement("select",{disabled:Z,value:m.realtimeModel,onChange:q=>ne("realtimeModel",q.target.value)},pt.map(q=>U.default.createElement("option",{value:q,key:q},q)))),U.default.createElement("details",null,U.default.createElement("summary",null,e("rtSettingsAdvanced")),U.default.createElement("label",null,e("rtSettingsCredentialRef"),U.default.createElement("input",{disabled:Z,required:!0,pattern:"[A-Za-z_][A-Za-z0-9_]*",value:m.realtimeCredential,onChange:q=>ne("realtimeCredential",q.target.value),autoComplete:"off"}))),U.default.createElement("div",{className:"zj-actions"},U.default.createElement(z,{type:"submit",primary:!0,disabled:Z},e(h?"processing":"rtSettingsSave")),U.default.createElement(z,{disabled:h||P||!c,onClick:()=>{M.current?.clear(),u(null),S(null)}},e("rtSettingsDiscard"))),!l.writable&&l.status==="ready"&&U.default.createElement("p",{role:"status"},e("rtSettingsReadonly")),w&&U.default.createElement("p",{role:"status",className:"zj-status-line"},e(w))),U.default.createElement("form",{className:"zj-card zj-form",onSubmit:q=>{q.preventDefault(),!(Z||le||P||!f.trim()||j.status!=="ready"||!j.writable)&&X.current(async()=>{M.current?.clear(),L(!0);let R=await n(G,f);W.current&&(L(!1),d(ie("rtCredential",R)),R==="saved"&&(E(""),b({status:"ready",configured:!0,writable:!0})))})}},U.default.createElement("h3",null,e("rtCredentialTitle")),U.default.createElement("p",{className:"zj-subtle"},e("rtCredentialNote")),U.default.createElement("p",{role:"status"},e(j.status==="loading"?"loading":j.status!=="ready"?"rtCredentialFailed":j.configured?"rtCredentialConfigured":"rtCredentialMissing")),le&&U.default.createElement("p",{role:"status"},e("rtCredentialSaveSettingsFirst")),U.default.createElement("label",null,e("rtCredentialKey"),U.default.createElement("input",{type:"password",autoComplete:"new-password",spellCheck:!1,value:f,disabled:Z||le||j.status!=="ready"||!j.writable,onChange:q=>{M.current?.clear(),E(q.target.value),d(null)}})),U.default.createElement("div",{className:"zj-actions"},U.default.createElement(z,{type:"submit",primary:!0,disabled:Z||le||!f.trim()||j.status!=="ready"||!j.writable},e(P?"processing":"rtCredentialSave")),U.default.createElement(z,{disabled:h||P,onClick:()=>{M.current?.clear(),y(q=>q+1)}},e("refresh"))),j.status==="ready"&&!j.writable&&U.default.createElement("p",{role:"status"},e("rtCredentialReadonly")),Y&&U.default.createElement("p",{role:"status",className:"zj-status-line"},e(Y)),U.default.createElement("p",{className:"zj-subtle"},e("rtCredentialUntested")),U.default.createElement("p",{className:"zj-subtle"},e("rtProbeNote")),oe&&U.default.createElement("p",{role:"status"},e("rtProbeSaveFirst")),!oe&&!s.realtimeEnabled&&U.default.createElement("p",{role:"status"},e("rtProbeEnableFirst")),U.default.createElement("div",{className:"zj-actions"},U.default.createElement(z,{disabled:D,onClick:()=>{D||M.current?.start()}},e(V.status==="running"?"rtProbeRunning":"rtProbeTest")),V.status==="running"&&U.default.createElement(z,{onClick:()=>M.current?.cancel()},e("rtProbeCancel")),V.status==="succeeded"&&U.default.createElement(U.default.Fragment,null,U.default.createElement(z,{disabled:V.playing,onClick:()=>{M.current?.play()}},e("rtProbePlay")),U.default.createElement(z,{disabled:!V.playing,onClick:()=>M.current?.stop()},e("rtProbeStop")),U.default.createElement(z,{onClick:()=>M.current?.clear()},e("rtProbeClear")))),U.default.createElement("div",{role:"status","aria-live":"polite"},V.status==="running"&&U.default.createElement("p",null,e("rtProbeWaiting")),V.status==="succeeded"&&U.default.createElement(U.default.Fragment,null,U.default.createElement("p",null,e("rtProbeSuccess",V.latencyMs)),U.default.createElement("p",{className:"zj-subtle"},e("rtProbeScope"))),V.message&&U.default.createElement("p",null,e(V.message)),V.playbackMessage&&U.default.createElement("p",null,e(V.playbackMessage)))))}var po={"qwen3.5-omni-plus-realtime":"setModelDefault","qwen3.5-omni-flash-realtime":"setModelFast","qwen3.8-omni-flash-realtime":"setModelNew"},co=/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,uo=[["beijing","rtSettingsBeijing"],["singapore","rtSettingsSingapore"]],mo=Object.freeze({status:"unavailable",writable:!1}),wi=e=>`${e[0].toUpperCase()}${e.slice(1)}`,go=e=>(typeof e=="function"?e(t=>t):null)||mo;function yi(e,t){let r={...e,...t};r.realtimeEnabled=!!r.realtimeWorkspace;let i=["realtimeRegion","realtimeWorkspace","realtimeModel","realtimeEnabled"].some(n=>r[n]!==e[n]);return{next:r,dirty:i}}function fo({ready:e,writable:t,next:r,key:i}){return e?t?r.realtimeWorkspace&&!co.test(r.realtimeWorkspace)?"rtSettingsInvalid":i&&!r.realtimeWorkspace?"setNeedWorkspace":i&&!i.startsWith("sk-")?"setKeyBadPrefix":null:"rtSettingsReadonly":"rtSettingsUnavailable"}async function ho({ready:e,writable:t,base:r,draft:i,revision:n,key:o,saveSettings:a,storeCredential:l}){let{next:s,dirty:c}=yi(r,i),u=String(o||"").trim(),x=fo({ready:e,writable:t,next:s,key:u});if(x)return{ok:!1,notice:x,savedSettings:!1,savedKey:!1};let k=!1;if(c){let h=await a(s,n);if(h!=="saved")return{ok:!1,notice:`rtSettings${wi(String(h||"failed"))}`,savedSettings:k,savedKey:!1};k=!0}if(u){let h=await l(r.realtimeCredential,u);return h!=="saved"?{ok:!1,notice:`rtCredential${wi(String(h||"failed"))}`,savedSettings:k,savedKey:!1}:{ok:!0,savedSettings:k,savedKey:!0}}return{ok:!0,savedSettings:k,savedKey:!1}}function Si({t:e,onClose:t,onSaved:r,voiceReady:i=!1,useRealtimeSettings:n,saveSettings:o,describeCredential:a,storeCredential:l,testAudio:s,cancelAudio:c,workspaces:u=[],workspaceId:x="",onWorkspace:k,onManageWorkspaces:h,enableVoiceInput:v,openVoiceSettings:w}){let S=go(n),j=rt(S.value),b=S.status==="ready",f=b&&S.writable===!0,[E,P]=F.default.useState(null),[L,Y]=F.default.useState(void 0),[d,p]=F.default.useState(""),[y,V]=F.default.useState(!1),[$,M]=F.default.useState({status:"loading"}),[O,X]=F.default.useState(null),[m,G]=F.default.useState(!1),[W,ne]=F.default.useState({status:"idle",playing:!1}),Z=F.default.useRef(null),le=F.default.useRef(Ue()),oe=F.default.useRef(!0),D=F.default.useId();F.default.useEffect(()=>(oe.current=!0,()=>{oe.current=!1}),[]),F.default.useEffect(()=>{if(typeof s!="function"||typeof c!="function")return;let _=rr({testAudio:s,cancelAudio:c},{onChange:me=>{oe.current&&ne(me)}});return Z.current=_,()=>{_.dispose(),Z.current===_&&(Z.current=null)}},[s,c]),F.default.useEffect(()=>{let _=!0;if(!b||typeof a!="function"){M({status:"unavailable"});return}return M({status:"loading"}),Promise.resolve(a(j.realtimeCredential)).then(me=>{_&&M(me||{status:"failed"})},()=>{_&&M({status:"failed"})}),()=>{_=!1}},[b,j.realtimeCredential,a]);let ie={...j,...E},{next:q}=yi(j,E),R=d.trim(),pe=f&&$.status==="ready"&&$.writable!==!1,ge=i||W.status==="succeeded",je=_=>{Z.current?.clear(),E||Y(S.revision),P(me=>({...me||{},..._})),X(null)},xe=async()=>{let _=await ho({ready:b,writable:f,base:j,draft:E,revision:E?L:S.revision,key:d,saveSettings:o,storeCredential:l});return oe.current&&(_.savedSettings&&P(null),_.savedKey&&(p(""),M({status:"ready",configured:!0,writable:!0})),_.ok||X(_.notice)),_.ok},Ie=()=>le.current(async()=>{G(!0),X(null);let _=await xe().catch(()=>(X("rtSettingsFailed"),!1));oe.current&&(G(!1),_&&(r?.(),t()))}),Ae=()=>le.current(async()=>{if(!q.realtimeWorkspace){X("setNeedWorkspace");return}if(!R&&!($.status==="ready"&&$.configured)){X("setNeedKey");return}G(!0),X(null);let _=await xe().catch(()=>(X("rtSettingsFailed"),!1));oe.current&&(G(!1),_&&(r?.({quiet:!0}),Z.current?.start()))}),Ee=W.status==="running",te=F.default.createElement(F.default.Fragment,null,F.default.createElement(z,{disabled:m,onClick:t},e("cancel")),F.default.createElement(z,{primary:!0,disabled:m||!f,onClick:()=>{Ie()}},e(m?"processing":"save")));return F.default.createElement(Lr,{title:e("setTitle"),onClose:t,t:e,busy:m,footer:te},F.default.createElement("section",{className:"zj-set","aria-label":e("setVoice"),"data-settings-voice":""},F.default.createElement("div",{className:"zj-set-head"},F.default.createElement("h3",null,e("setVoice")),F.default.createElement("span",{className:"zj-hint"},e("setVoiceVendor")),F.default.createElement("span",{className:`zj-badge${ge?"":" is-warn"}`},e(ge?"setStatusOk":"setStatusNone"))),!b&&F.default.createElement("p",{className:"zj-note",role:"status"},e(S.status==="loading"?"loading":"rtSettingsUnavailable")),b&&!f&&F.default.createElement("p",{className:"zj-note",role:"status"},e("rtSettingsReadonly")),F.default.createElement("div",{className:"zj-control"},F.default.createElement("span",{className:"zj-label",id:D},e("setRegion")),F.default.createElement("div",{className:"zj-seg",role:"radiogroup","aria-labelledby":D},uo.map(([_,me])=>F.default.createElement("button",{type:"button",role:"radio",key:_,"aria-checked":ie.realtimeRegion===_,className:ie.realtimeRegion===_?"is-on":"",disabled:!f||m,onClick:()=>je({realtimeRegion:_})},e(me)))),F.default.createElement("span",{className:"zj-hint"},e("setRegionNote"))),F.default.createElement("label",{className:"zj-control"},F.default.createElement("span",{className:"zj-label"},e("setWorkspace")),F.default.createElement("input",{value:ie.realtimeWorkspace,maxLength:64,spellCheck:!1,autoComplete:"off",disabled:!f||m,placeholder:e("setWorkspaceHint"),onChange:_=>je({realtimeWorkspace:_.target.value.trim()})}),F.default.createElement("span",{className:"zj-hint"},e("setWorkspaceNote"))),F.default.createElement("label",{className:"zj-control"},F.default.createElement("span",{className:"zj-label"},e("setKey")),F.default.createElement("input",{type:"password",autoComplete:"new-password",spellCheck:!1,value:d,disabled:!pe||m,placeholder:e($.status==="ready"&&$.configured?"setKeySaved":"setKeyEmpty"),onChange:_=>{Z.current?.clear(),p(_.target.value),X(null)}}),F.default.createElement("span",{className:"zj-hint"},e("setKeyNote")),$.status==="ready"&&$.writable===!1&&F.default.createElement("span",{className:"zj-hint",role:"status"},e("rtCredentialReadonly")),$.status==="failed"&&F.default.createElement("span",{className:"zj-hint",role:"status"},e("rtCredentialFailed"))),F.default.createElement("button",{type:"button",className:"zj-link-btn","aria-expanded":y,onClick:()=>V(_=>!_)},e(y?"setAdvancedHide":"setAdvanced")),y&&F.default.createElement("div",{className:"zj-radios",role:"radiogroup","aria-label":e("rtSettingsModel")},pt.map(_=>F.default.createElement("button",{type:"button",role:"radio",key:_,"aria-checked":ie.realtimeModel===_,className:`zj-radio${ie.realtimeModel===_?" is-on":""}`,disabled:!f||m,onClick:()=>je({realtimeModel:_})},F.default.createElement("code",null,_),F.default.createElement("span",{className:"zj-hint"},e(po[_]))))),F.default.createElement("div",{className:"zj-set-test"},F.default.createElement(z,{disabled:m||Ee||!f,onClick:()=>{Ae()}},e(Ee?"setTesting":"setTest")),Ee&&F.default.createElement(z,{quiet:!0,onClick:()=>Z.current?.cancel()},e("rtProbeCancel")),F.default.createElement("span",{className:"zj-hint"},e("setTestNote"))),F.default.createElement("div",{role:"status","aria-live":"polite",className:"zj-set-status"},W.status==="succeeded"&&F.default.createElement("div",{className:"zj-ok-line"},F.default.createElement("span",null,e("rtProbeSuccess",W.latencyMs)),F.default.createElement(z,{small:!0,onClick:()=>{W.playing?Z.current?.stop():Z.current?.play()}},e(W.playing?"setStop":"setPlay"))),Ee&&F.default.createElement("p",{className:"zj-hint"},e("rtProbeWaiting")),W.message&&W.status!=="succeeded"&&F.default.createElement("p",{className:"zj-warn-line"},e(W.message)),W.playbackMessage&&F.default.createElement("p",{className:"zj-warn-line"},e(W.playbackMessage)),O&&F.default.createElement("p",{className:"zj-warn-line"},e(O)))),F.default.createElement("div",{className:"zj-rule",role:"presentation"}),F.default.createElement("section",{className:"zj-set","aria-label":e("compatibleVoiceInput")},F.default.createElement("div",null,F.default.createElement("div",{className:"zj-set-name"},e("compatibleVoiceInput")),F.default.createElement("p",{className:"zj-hint"},e("setDictationNote"))),F.default.createElement(ii,{t:e,enableVoiceInput:v,openVoiceSettings:w})),F.default.createElement("div",{className:"zj-rule",role:"presentation"}),F.default.createElement("section",{className:"zj-set","aria-label":e("setWorkspaceDsh")},F.default.createElement("label",{className:"zj-control"},F.default.createElement("span",{className:"zj-label"},e("setWorkspaceDsh")),F.default.createElement("select",{value:x,onChange:_=>k?.(_.target.value)},F.default.createElement("option",{value:""},e("selectWorkspace")),u.map(_=>F.default.createElement("option",{key:_.workspaceId,value:_.workspaceId},_.title))),u.length===1&&x&&F.default.createElement("span",{className:"zj-hint"},e("setWorkspaceAuto")),!u.length&&F.default.createElement("span",{className:"zj-hint"},e("workspaceRequired"))),h&&F.default.createElement("div",null,F.default.createElement(z,{quiet:!0,small:!0,onClick:h},e("manageWorkspaces")))))}var ce=ye(require("react"),1);var se=ye(require("react"),1);function ir(e,t,r={}){let i=n=>e.goals.find(o=>o.id===n)?.title||"";return t==="personal"?e.materials.map(n=>({...n,entity:n,kind:"material",category:n.kind,versionId:n.latestVersionId,description:n.versions.find(o=>o.id===n.latestVersionId)?.text||"",count:n.versions.length})):t==="goals"?e.goals.map(n=>({...n,entity:n,kind:"goal",category:n.status,description:[n.company,n.description].filter(Boolean).join(" \xB7 "),count:n.conversations.length})):t==="interviews"?e.interviews.map(n=>({...n,entity:n,kind:"interview",category:n.status,title:r[n.sessionId]?.title||i(n.goalId),description:n.questions?.find(o=>o.id===n.currentQuestionId)?.text||"",count:n.questions?.filter(o=>o.answer).length||0})):t==="reports"?[...e.reports.map(n=>({...n,entity:n,kind:"report",category:"report",title:i(n.goalId),description:n.summary||""})),...e.assessments.map(n=>({...n,entity:n,kind:"assessment",category:n.kind==="fit"?"fit":"review",title:i(n.goalId)||e.materials.find(o=>o.versions.some(a=>a.id===n.versionId))?.title,description:n.summary||""})),...e.rewrites.map(n=>({...n,entity:n,kind:"rewrite",category:"rewrite",title:i(n.goalId),description:n.items?.map(o=>o.reason).join(" \xB7 ")||""}))]:(e.conversations||[]).filter(n=>n.kind==="chat").map(n=>({...n,entity:n,kind:"conversation",category:n.goalId?"goals":"ungrouped",title:r[n.sessionId]?.title||n.title,description:i(n.goalId)}))}function Ni({rows:e,t}){let r=e.filter(o=>Number.isFinite(o.total)).sort((o,a)=>o.createdAt.localeCompare(a.createdAt));if(!r.length)return null;let i=r.slice(-12),n=i.map((o,a)=>`${20+a*260/Math.max(1,i.length-1)},${108-o.total*.88}`).join(" ");return se.default.createElement("section",{className:"zj-report-trend","aria-label":t("deskReportTrend")},se.default.createElement("div",null,se.default.createElement("span",{className:"zj-subtle"},t("deskReportTrend")),se.default.createElement("strong",null,i.at(-1).total,se.default.createElement("small",null," / 100")),se.default.createElement("p",null,t("deskTrendNote"))),se.default.createElement("svg",{viewBox:"0 0 300 130",role:"img","aria-label":i.map(o=>`${o.createdAt.slice(0,10)}: ${o.total}`).join("; ")},se.default.createElement("path",{d:"M20 20V108H280",fill:"none",stroke:"currentColor",opacity:".2"}),se.default.createElement("polyline",{points:n,fill:"none",stroke:"var(--zj-accent)",strokeWidth:"2"}),i.map((o,a)=>se.default.createElement("circle",{key:o.id,cx:20+a*260/Math.max(1,i.length-1),cy:108-o.total*.88,r:"3",fill:"var(--zj-accent)"},se.default.createElement("title",null,o.createdAt.slice(0,10),": ",o.total)))))}function nr({text:e,t}){let[r,i]=se.default.useState(null);return se.default.useEffect(()=>i(null),[e]),se.default.createElement("span",{className:"zj-copy"},se.default.createElement(z,{small:!0,disabled:!e,onClick:async()=>{try{await navigator.clipboard.writeText(e),i("deskCopied")}catch{i("deskCopyFailed")}}},t("deskCopy")),r&&se.default.createElement("span",{role:"status",className:"zj-subtle"},t(r)))}function Ci({row:e,state:t,t:r,busy:i,onExport:n,onEvidence:o,onAction:a,onReviewVersion:l,draft:s,onDraftChange:c}){let[u,x]=se.default.useState("deskResult"),k=e?.entity;if(!k)return se.default.createElement("div",{className:"zj-body"},se.default.createElement("p",null,r("unavailable")));let h=t.materials.flatMap(w=>w.versions).find(w=>w.id===k.versionId),v=e.kind==="rewrite"?k.fullText:[k.summary,...(k.criteria||[]).map(w=>`${w.label||w.name||w.id}: ${w.reason||""}`),...k.strengths||[],...k.improvements||[],...k.nextSteps||[]].filter(Boolean).join(`

`);return se.default.createElement("div",{className:"zj-body zj-result-studio"},se.default.createElement("div",{className:"zj-page-heading"},se.default.createElement("div",null,se.default.createElement("span",{className:"zj-eyebrow"},r(e.category)),se.default.createElement("h2",null,e.title||r("deskReports")),se.default.createElement("time",{className:"zj-subtle",dateTime:e.createdAt},e.createdAt?.slice(0,10))),se.default.createElement(nr,{text:v,t:r})),se.default.createElement(Je,{values:["deskResult","deskSources"],active:u,onChange:x,t:r}),u==="deskSources"?se.default.createElement("section",{className:"zj-card"},se.default.createElement("h3",null,r("chatSnapshot")),h?se.default.createElement(se.default.Fragment,null,se.default.createElement("p",null,h.title," \xB7 ",r("version",{number:h.revision})),se.default.createElement(z,{small:!0,onClick:()=>l(h.id)},r("viewSource")),se.default.createElement("div",{className:"zj-paper-content"},h.text)):se.default.createElement("p",null,r("unavailable"))):e.kind==="rewrite"?se.default.createElement(Xt,{rewrite:k,state:t,selectedVersion:k.versionId,t:r,busy:i,onAccept:(w,S)=>a("rewrite.accept",{rewriteId:w,itemIds:S}),onExport:n,onReviewVersion:l,onEvidence:o,draft:s,onDraftChange:c}):se.default.createElement(se.default.Fragment,null,se.default.createElement(We,{result:k,t:r,onEvidence:o}),e.kind==="report"&&se.default.createElement(se.default.Fragment,null,[["strengths",k.strengths],["improvements",k.improvements],["nextSteps",k.nextSteps]].map(([w,S])=>se.default.createElement("section",{className:"zj-card",key:w},se.default.createElement("h3",null,r(w)),se.default.createElement(st,{values:S}))),se.default.createElement("div",{className:"zj-actions"},se.default.createElement(z,{disabled:i,onClick:()=>n("report",k.id,"docx")},r("exportDocx")),se.default.createElement(z,{disabled:i,onClick:()=>n("report",k.id,"pdf")},r("exportPdf"))))))}var Ei=(e,t)=>String(t.createdAt||"").localeCompare(String(e.createdAt||"")),Ii=e=>String(e||"").slice(0,10);function Pt(e){return[...e.interviews||[]].sort(Ei).map(t=>({interview:t,report:(e.reports||[]).find(r=>r.id===t.reportId||r.interviewId===t.id)||null,goal:(e.goals||[]).find(r=>r.id===t.goalId)||null}))}function Ti({t:e,state:t,nativeTitles:r={},open:i,onOpen:n,onClose:o,onEnterRoom:a,busy:l,onExport:s,onEvidence:c,onAction:u,onReviewVersion:x,drafts:k={},onDraft:h}){if(i){let j=ir(t,"reports").find(b=>b.kind===i.kind&&b.id===i.id);return ce.default.createElement("div",{className:"zj-page","data-page":"review"},ce.default.createElement("div",null,ce.default.createElement(z,{quiet:!0,small:!0,onClick:o},e("reviewBack"))),ce.default.createElement(Ci,{key:i.id,row:j,state:t,t:e,busy:l,onExport:s,onEvidence:c,onAction:u,onReviewVersion:x,draft:k[`result:${i.id}`],onDraftChange:b=>h?.(`result:${i.id}`,b)}))}let v=Pt(t),w=v.filter(j=>typeof j.report?.total=="number"),S=ir(t,"reports",r).filter(j=>j.kind!=="report").sort(Ei);return ce.default.createElement("div",{className:"zj-page","data-page":"review"},ce.default.createElement("header",{className:"zj-page-head"},ce.default.createElement("span",{className:"zj-label"},e("navReview")),ce.default.createElement("h1",{className:"zj-display"},v.length?w.length?e("reviewTitle",{count:v.length,score:w[0].report.total}):e("reviewTitleNoScore",{count:v.length}):e("reviewTitleNone")),ce.default.createElement("p",{className:"zj-intro"},e(v.length?"reviewLead":"reviewLeadNone"))),w.length>1&&ce.default.createElement(Ni,{rows:w.map(j=>j.report),t:e}),v.length>0&&ce.default.createElement("section",{className:"zj-section","aria-label":e("reviewInterviews")},ce.default.createElement("h2",{className:"zj-section-title"},e("reviewInterviews")),ce.default.createElement("div",{className:"zj-cards"},v.map(({interview:j,report:b,goal:f})=>ce.default.createElement("article",{className:"zj-card zj-tile",key:j.id},ce.default.createElement("div",{className:"zj-tile-meta"},ce.default.createElement("span",{className:"zj-badge is-gray"},e(j.mode==="realtime"?"realtimeCall":"textInterview")),ce.default.createElement("span",{className:"zj-hint"},Ii(j.createdAt)),ce.default.createElement("span",{className:"zj-hint"},e(j.status==="completed"?"reviewDone":"reviewActive"))),ce.default.createElement("div",{className:"zj-tile-score"},ce.default.createElement("span",{className:"zj-display is-num"},typeof b?.total=="number"?b.total:"\u2014"),ce.default.createElement("span",{className:"zj-muted"},r[j.sessionId]?.title||f?.title||e("interview"))),b?.summary?ce.default.createElement("p",{className:"zj-hint zj-clamp"},b.summary):j.status==="completed"?ce.default.createElement("p",{className:"zj-hint"},e("reviewNoReport")):null,ce.default.createElement("div",{className:"zj-tile-actions"},ce.default.createElement(z,{small:!0,primary:j.status!=="completed",disabled:!j.sessionId,onClick:()=>a(j.sessionId)},e(j.status==="completed"?"reviewOpenReport":"reviewContinue")),b&&ce.default.createElement(z,{small:!0,quiet:!0,disabled:l,onClick:()=>s("report",b.id,"pdf")},e("exportPdf"))))))),S.length>0&&ce.default.createElement("section",{className:"zj-section","aria-label":e("reviewResumeWork")},ce.default.createElement("h2",{className:"zj-section-title"},e("reviewResumeWork")),ce.default.createElement("ul",{className:"zj-list-rows"},S.map(j=>ce.default.createElement("li",{key:`${j.kind}:${j.id}`},ce.default.createElement("button",{type:"button",className:"zj-list-row",onClick:()=>n({kind:j.kind,id:j.id})},ce.default.createElement("span",{className:"zj-badge is-gray"},e(j.category)),ce.default.createElement("strong",null,j.title||e("resume")),ce.default.createElement("span",{className:"zj-hint"},typeof j.total=="number"?`${j.total} / 100 \xB7 `:"",Ii(j.createdAt))))))))}var ae=ye(require("react"),1);var K=ye(require("react"),1);function Ai({state:e,t,busy:r,onAdd:i,onEdit:n,onConfirm:o,onExport:a,onAssess:l,selectedId:s,selectedVersionId:c,onSelect:u,onEvidence:x,onSource:k,onChatContext:h,studio:v=!1}){let[w,S]=K.default.useState(c??null),[j,b]=K.default.useState("deskDocument");K.default.useEffect(()=>b("deskDocument"),[s]);let[f,E]=K.default.useState(null);K.default.useEffect(()=>{S(c??null)},[c,s]);let P=e.materials.find(p=>p.id===s)||(v?null:e.materials[0]),L=P?.versions.find(p=>p.id===w)||P?.versions.find(p=>p.id===P.latestVersionId)||P?.versions.at(-1),Y=Zt(L,f),d=p=>E({versionId:L.id,value:p.currentTarget.value,start:p.currentTarget.selectionStart,end:p.currentTarget.selectionEnd});return K.default.createElement("div",{className:"zj-body"},!v&&K.default.createElement("div",{className:"zj-page-heading"},K.default.createElement("div",null,K.default.createElement("h2",null,t("personal")),K.default.createElement("p",null,t("personalNote"))),K.default.createElement(z,{primary:!0,onClick:i},t("addMaterial"))),P?K.default.createElement("div",{className:v?"zj-material-studio":"zj-split"},!v&&K.default.createElement("div",{className:"zj-material-list"},e.materials.map(p=>K.default.createElement("button",{key:p.id,className:`zj-material-item${p.id===P.id?" is-active":""}`,onClick:()=>{u(p.id),S(null)}},K.default.createElement("span",{className:"zj-subtle"},t(p.kind==="company"?"companyMaterial":p.kind)),K.default.createElement("strong",null,p.title),K.default.createElement("span",{className:"zj-subtle"},t("version",{number:p.versions.length}))))),K.default.createElement("div",null,L&&K.default.createElement(K.default.Fragment,null,K.default.createElement(Je,{values:["deskDocument",...P.kind==="resume"?["review"]:[],"deskVersionsTab"],active:j,onChange:b,t}),j==="deskVersionsTab"?K.default.createElement("section",{className:"zj-card"},P.versions.map(p=>K.default.createElement("div",{className:"zj-attach",key:p.id},K.default.createElement("div",null,K.default.createElement("strong",null,t("version",{number:p.revision})),K.default.createElement("span",{className:"zj-subtle"},t(p.confirmed?"confirmed":"unconfirmed")," \xB7 ",p.createdAt.slice(0,10))),K.default.createElement(z,{small:!0,onClick:()=>{S(p.id),b("deskDocument")}},t("deskOpenResult"))))):j==="deskDocument"?K.default.createElement("article",{className:"zj-paper"},K.default.createElement("header",{className:"zj-paper-head"},K.default.createElement("h3",null,P.title),K.default.createElement("span",{className:`zj-tag ${L.confirmed?"confirmed":""}`},t(L.confirmed?"confirmed":"unconfirmed")),K.default.createElement("div",{className:"zj-toolbar"},K.default.createElement("select",{className:"zj-select",value:L.id,"aria-label":t("savedVersion"),onChange:p=>S(p.target.value)},P.versions.map(p=>K.default.createElement("option",{key:p.id,value:p.id},t("version",{number:p.revision})))),L.source?.metadataFileId&&K.default.createElement(z,{small:!0,disabled:r,onClick:()=>k(L.id)},t("viewSource")),K.default.createElement(z,{small:!0,onClick:()=>n(P,L)},t("edit")))),!L.confirmed&&K.default.createElement("div",{className:"zj-review-note"},K.default.createElement("span",null,t("reviewNote")),K.default.createElement(z,{primary:!0,small:!0,disabled:r,onClick:()=>o(L.id)},t("confirm"))),K.default.createElement("div",{className:"zj-paper-content"},L.text),K.default.createElement("div",{className:"zj-context-actions"},K.default.createElement(nr,{text:L.text,t})),h&&K.default.createElement("div",{className:"zj-context-actions"},K.default.createElement(z,{small:!0,disabled:r||!L.confirmed,onClick:()=>h(L.id)},t("askAboutMaterial")),K.default.createElement("details",null,K.default.createElement("summary",null,t("choosePassage")),K.default.createElement("label",{className:"zj-subtle"},t("choosePassageNote"),K.default.createElement("textarea",{readOnly:!0,rows:6,value:L.text.replace(/\r\n?/g,`
`),onSelect:d,onKeyUp:d,onMouseUp:d})),K.default.createElement(z,{small:!0,disabled:r||!L.confirmed||!Y,onClick:()=>Y&&h(L.id,Y)},t("askAboutPassage"))))):null,P.kind==="resume"&&j!=="deskVersionsTab"&&K.default.createElement("div",{className:"zj-card"},K.default.createElement("div",{className:"zj-actions"},K.default.createElement(z,{disabled:r||!L.confirmed,onClick:()=>{b("review"),l(L.id)}},t("assessResume")),K.default.createElement(z,{small:!0,disabled:r,onClick:()=>a("resume",L.id,"docx")},t("exportDocx")),K.default.createElement(z,{small:!0,disabled:r,onClick:()=>a("resume",L.id,"pdf")},t("exportPdf"))),K.default.createElement(We,{result:kt(e,L.id),t,onEvidence:x}))))):K.default.createElement("div",{className:"zj-empty"},K.default.createElement("h2",null,t("noMaterials")),K.default.createElement("p",null,t("noMaterialsNote")),K.default.createElement(z,{onClick:i},t("addMaterial"))))}function Di({state:e,goal:t,t:r,onAdd:i,onLink:n,onChatContext:o}){return K.default.createElement("section",{className:"zj-card"},K.default.createElement("div",{className:"zj-page-heading"},K.default.createElement("h3",null,r("goalMaterials")),K.default.createElement("div",{className:"zj-actions"},K.default.createElement(z,{small:!0,onClick:n},r("linkExisting")),K.default.createElement(z,{small:!0,onClick:i},r("addMaterial")))),t.materialLinks.map(a=>{let l=be(e,a.versionId);return l?K.default.createElement("div",{className:"zj-attach",key:a.versionId},K.default.createElement("div",null,K.default.createElement("strong",null,l.material.title),K.default.createElement("span",{className:"zj-subtle"},r(l.material.kind==="company"?"companyMaterial":l.material.kind)," \xB7 ",r("version",{number:l.version.revision}))),o&&K.default.createElement(z,{small:!0,disabled:!l.version.confirmed,onClick:()=>o(a.versionId)},r("askAboutMaterial")),K.default.createElement("span",{className:"zj-tag confirmed"},r("confirmed"))):null}),!t.materialLinks.length&&K.default.createElement("p",{className:"zj-subtle"},r("noConfirmed")))}var or=(e,t)=>String(t.createdAt||"").localeCompare(String(e.createdAt||"")),Pi=e=>String(e||"").slice(0,10);function Bt({title:e,rows:t,t:r,onOpen:i,empty:n}){return ae.default.createElement("section",{className:"zj-card zj-group","aria-label":e},ae.default.createElement("h2",{className:"zj-section-title"},e),t.length?ae.default.createElement("ul",{className:"zj-list-rows"},t.map(o=>ae.default.createElement("li",{key:o.key},ae.default.createElement("button",{type:"button",className:"zj-list-row",onClick:()=>i(o.target)},ae.default.createElement("strong",null,o.title),ae.default.createElement("span",{className:"zj-hint"},o.meta),o.badge&&ae.default.createElement("span",{className:`zj-badge${o.warn?" is-warn":""}`},o.badge))))):ae.default.createElement("p",{className:"zj-hint"},n||r("libraryEmpty")))}function vo({t:e,state:t,goal:r,busy:i,onAction:n,onExport:o,onEvidence:a,onReviewVersion:l,onChatContext:s,onEdit:c,onLink:u,onAddJob:x,onUseRole:k,drafts:h,onDraft:v}){let w=h[`role:${r.id}`]||{},S=w.tab||"overview",j=[...t.materials].filter(E=>E.kind==="resume").sort(or).map(E=>be(t,E.latestVersionId)).find(E=>E?.version.confirmed),b=w.versionId??j?.version.id??"",f=E=>v(`role:${r.id}`,{...w,...E});return ae.default.createElement(ae.default.Fragment,null,ae.default.createElement("header",{className:"zj-page-head is-row"},ae.default.createElement("div",null,ae.default.createElement("span",{className:"zj-label"},e("libraryRoles")),ae.default.createElement("h1",{className:"zj-display"},r.title),(r.company||r.description)&&ae.default.createElement("p",{className:"zj-intro"},[r.company,r.description].filter(Boolean).join(" \xB7 "))),ae.default.createElement("div",{className:"zj-actions"},ae.default.createElement(z,{primary:!0,onClick:()=>k(r)},e("libraryUseRole")),ae.default.createElement(z,{small:!0,disabled:i,onClick:()=>c(r)},e("deskEditGoal")),ae.default.createElement(z,{small:!0,quiet:!0,disabled:i,onClick:()=>n("goal.update",{goalId:r.id,status:r.status==="active"?"archived":"active"})},e(r.status==="active"?"deskArchive":"deskRestore")))),ae.default.createElement(Je,{values:["overview","review","fit","rewrite"],active:S,onChange:E=>f({tab:E}),t:e}),S==="overview"?ae.default.createElement(ae.default.Fragment,null,ae.default.createElement("div",{className:"zj-form"},ae.default.createElement(Tt,{state:t,value:b,onChange:E=>f({versionId:E}),t:e})),ae.default.createElement(Di,{state:t,goal:r,t:e,onAdd:x,onLink:u,onChatContext:s})):ae.default.createElement(ti,{state:t,goal:r,tab:S,t:e,busy:i,onAction:n,onExport:o,selectedVersion:b,onSelectVersion:E=>f({versionId:E}),onReviewVersion:l,onEvidence:a,onChatContext:s,draft:h[`analysis:${r.id}:${b}:${S}`],onDraftChange:E=>v(`analysis:${r.id}:${b}:${S}`,E)}))}function Bi({t:e,state:t,open:r,onOpen:i,onClose:n,busy:o,onAddMaterial:a,onEditMaterial:l,onConfirm:s,onExport:c,onAssess:u,onEvidence:x,onSource:k,onChatContext:h,onAction:v,onReviewVersion:w,onEditGoal:S,onLinkMaterial:j,onUseRole:b,drafts:f={},onDraft:E=()=>{}}){if(r?.kind==="material")return ae.default.createElement("div",{className:"zj-page","data-page":"library"},ae.default.createElement("div",null,ae.default.createElement(z,{quiet:!0,small:!0,onClick:n},e("libraryBack"))),ae.default.createElement(Ai,{studio:!0,state:t,t:e,busy:o,selectedId:r.id,selectedVersionId:r.versionId||null,onSelect:y=>i({kind:"material",id:y}),onAdd:()=>a("resume"),onEdit:l,onConfirm:s,onExport:c,onAssess:u,onEvidence:x,onSource:k,onChatContext:h}));let P=r?.kind==="goal"?t.goals.find(y=>y.id===r.id):null;if(P)return ae.default.createElement("div",{className:"zj-page","data-page":"library"},ae.default.createElement("div",null,ae.default.createElement(z,{quiet:!0,small:!0,onClick:n},e("libraryBack"))),ae.default.createElement(vo,{t:e,state:t,goal:P,busy:o,onAction:v,onExport:c,onEvidence:x,onReviewVersion:w,onChatContext:h,onEdit:S,onLink:()=>j(P),onAddJob:()=>a("job",P.id),onUseRole:b,drafts:f,onDraft:E}));let L=y=>{let V=y.versions.find($=>$.id===y.latestVersionId)||y.versions.at(-1);return{key:y.id,title:y.title,target:{kind:"material",id:y.id},meta:`${e("libraryVersions",{count:y.versions.length})} \xB7 ${Pi(V?.createdAt||y.createdAt)}`,badge:e(V?.confirmed?"confirmed":"unconfirmed"),warn:!V?.confirmed}},Y=[...t.materials].sort(or),d=[...t.goals].sort(or).map(y=>({key:y.id,title:y.title,target:{kind:"goal",id:y.id},meta:[y.company,Pi(y.createdAt)].filter(Boolean).join(" \xB7 "),badge:y.status==="archived"?e("archived"):null})),p=Y.filter(y=>!["resume","job"].includes(y.kind)).map(L);return ae.default.createElement("div",{className:"zj-page","data-page":"library"},ae.default.createElement("header",{className:"zj-page-head is-row"},ae.default.createElement("div",null,ae.default.createElement("span",{className:"zj-label"},e("navLibrary")),ae.default.createElement("h1",{className:"zj-display"},e("libraryTitle")),ae.default.createElement("p",{className:"zj-intro"},e("libraryLead"))),ae.default.createElement("div",{className:"zj-actions"},ae.default.createElement(z,{onClick:()=>a("job")},e("libraryAddJob")),ae.default.createElement(z,{primary:!0,onClick:()=>a("resume")},e("libraryAddResume")))),ae.default.createElement("div",{className:"zj-groups"},ae.default.createElement(Bt,{title:e("libraryResumes"),rows:Y.filter(y=>y.kind==="resume").map(L),t:e,onOpen:i}),ae.default.createElement(Bt,{title:e("libraryJobs"),rows:Y.filter(y=>y.kind==="job").map(L),t:e,onOpen:i}),ae.default.createElement(Bt,{title:e("libraryRoles"),rows:d,t:e,onOpen:i}),p.length>0&&ae.default.createElement(Bt,{title:e("libraryOther"),rows:p,t:e,onOpen:i})))}var A=ye(require("react"),1);var Li=(e,t)=>String(t.createdAt||"").localeCompare(String(e.createdAt||"")),ar=e=>String(e||"").slice(0,10),Mi={job:"deskHeadJob",resume:"deskHeadResume",score:"deskHeadScore",voice:"deskHeadVoice",workspace:"deskHeadWorkspace"};function bo(e,t,{voiceReady:r=!1,workspaceReady:i=!1}={}){let n=Yt(e,t||{}),o=Qt(n,{voiceReady:r,workspaceReady:i}),a=(e.goals||[]).filter(v=>v.status!=="archived"),l=[...e.interviews||[]].sort(Li),s=!(e.materials||[]).length&&!l.length&&!a.length,c=Pt(e).map(v=>v.report&&Number.isFinite(v.report.total)?{...v,total:v.report.total}:null).filter(Boolean),u=n.resume?.version.confirmed?n.resume.version.id:void 0,x=a.map(v=>{let w=(v.materialLinks||[]).map(j=>be(e,j.versionId)).filter(j=>j?.material.kind==="job"&&j.version.confirmed).sort((j,b)=>b.version.revision-j.version.revision)[0];if(!w)return null;let S=et(e,{goalId:v.id,resumeVersionId:u,jobVersionId:w.version.id});return{goal:v,job:w,score:S.total,interviews:l.filter(j=>j.goalId===v.id).length,current:v.id===n.goal?.id||v.id===n.value.goalId}}).filter(Boolean).sort((v,w)=>Number(w.current)-Number(v.current)||Li(v.goal,w.goal)),k=l.find(v=>v.status!=="completed"&&v.sessionId)||null,h=["job","resume","score"].includes(n.current)?n.current:null;return{fresh:s,progress:n,block:o,sheet:h,interviews:l,done:l.filter(v=>v.status==="completed").length,reports:c,roles:x,unfinished:k}}var jo=()=>A.default.createElement("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.6",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},A.default.createElement("path",{d:"M5 12.5l4.5 4.5L19 7.5"})),Lt=()=>A.default.createElement("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.9",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},A.default.createElement("path",{d:"M5 12h14M13 6l6 6-6 6"}));function xo({values:e,label:t}){if(e.length<2)return null;let r=104,i=38,n=Math.min(...e)-8,o=Math.max(...e)+8,a=c=>3+c*(r-6)/(e.length-1),l=c=>i-4-(c-n)/Math.max(1,o-n)*(i-8),s=e.map((c,u)=>`${a(u).toFixed(1)},${l(c).toFixed(1)}`).join(" ");return A.default.createElement("svg",{className:"zj-spark",viewBox:`0 0 ${r} ${i}`,role:"img","aria-label":t},A.default.createElement("polyline",{points:s,fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round",pathLength:"1"}),A.default.createElement("circle",{cx:a(e.length-1),cy:l(e.at(-1)),r:"3",fill:"currentColor"}))}function zo({t:e,summary:t,voiceReady:r,voiceChecking:i}){let{progress:n,block:o}=t,{score:a,value:l}=n,s=n.ready?a.status==="scored"?`${a.total} / 100`:a.status==="unknown"?e("deskScoreUnknown"):e("deskScoreNone"):e("deskScoreNone"),c=[{id:"job",title:e("deskRowJob"),done:n.jobReady&&!!n.role,text:n.job?n.role||n.job.material.title:e("prepMissing")},{id:"resume",title:e("deskRowResume"),done:n.resumeReady,text:n.resume?n.resume.material.title:e("prepMissing")},{id:"score",title:e("deskRowScore"),done:n.cleared,warn:n.ready&&!n.cleared,text:n.skipped&&!a.pass?`${s} \xB7 ${e("prepSkipped")}`:s},{id:"voice",title:e("deskRowVoice"),done:l.mode==="text"||r,warn:o==="voice",text:l.mode==="text"?e("deskVoiceText"):e(i&&!r?"deskVoiceChecking":r?"deskVoiceReady":"deskVoiceNone")}];return A.default.createElement("ol",{className:"zj-home-steps"},c.map((u,x)=>A.default.createElement("li",{key:u.id,className:"zj-home-step","data-home-step":u.id},A.default.createElement("span",{className:`zj-step${u.done?" is-done":u.warn?" is-warn":""}`,"aria-hidden":"true"},u.done?A.default.createElement(jo,null):x+1),A.default.createElement("strong",null,u.title),A.default.createElement("span",{className:"zj-hint"},u.text))))}function Vi({t:e,state:t,draft:r,voiceReady:i=!1,voiceChecking:n=!1,workspaceReady:o=!1,nativeTitles:a={},busy:l=!1,onPrepare:s,onUseRole:c,onEnterRoom:u,onPage:x,onOpenSettings:k}){let h=bo(t,r,{voiceReady:i,workspaceReady:o}),{fresh:v,progress:w,block:S,sheet:j,interviews:b,done:f,reports:E,roles:P,unfinished:L}=h,Y={"--i":0},d=m=>({style:{"--i":m}});if(v)return A.default.createElement("div",{className:"zj-page zj-home is-new","data-page":"home"},A.default.createElement("header",{className:"zj-page-head zj-home-intro",style:Y},A.default.createElement("h1",{className:"zj-display is-xl"},e("prepSlogan")),A.default.createElement("p",{className:"zj-intro"},e("prepLead")),A.default.createElement("div",{className:"zj-flow-actions"},A.default.createElement(z,{primary:!0,onClick:()=>s?.("job")},e("homeStartFirst"),A.default.createElement(Lt,null)),!i&&A.default.createElement(z,{quiet:!0,onClick:()=>k?.()},e("homeSetupVoice")))),A.default.createElement("section",{className:"zj-section","aria-label":e("homeHowLabel"),...d(1)},A.default.createElement("h2",{className:"zj-label"},e("homeHowLabel")),A.default.createElement("ol",{className:"zj-home-how"},[1,2,3,4].map(m=>A.default.createElement("li",{key:m,className:"zj-card zj-how",...d(m+1)},A.default.createElement("span",{className:"zj-how-num","aria-hidden":"true"},String(m).padStart(2,"0")),A.default.createElement("strong",null,e(`homeStep${m}Title`)),A.default.createElement("p",{className:"zj-hint"},e(`homeStep${m}Text`)))))),A.default.createElement("section",{className:`zj-card zj-home-voice${i?" is-ok":""}`,...d(6)},A.default.createElement("span",{className:"zj-dot","aria-hidden":"true"}),A.default.createElement("div",null,A.default.createElement("strong",null,e("homeVoiceTitle")),A.default.createElement("p",{className:"zj-hint"},e(i?"homeVoiceReady":"homeVoiceNone"))),A.default.createElement(z,{small:!0,onClick:()=>k?.()},e(i?"deskSettingsShort":"deskConnect"))));let p=S==="prep"?Mi[w.current==="resume"?"resume":"job"]:S?Mi[S]:"deskHeadReady",y=E[0]||null,V=E.slice(0,8).reverse().map(m=>m.total),$=w.score,M=w.ready?$.status==="scored"?$.pass?e("homeScorePass"):w.skipped?e("prepSkipped"):e("homeScoreGap",{gap:$.gap}):$.status==="unknown"?e("deskScoreUnknown"):e("homeStatScoreNone"):e("deskScoreWait"),O=m=>a[m.interview.sessionId]?.title||m.goal?.title||e("interview"),X=Pt(t).slice(0,3);return A.default.createElement("div",{className:"zj-page zj-home","data-page":"home"},L&&A.default.createElement("div",{className:"zj-note",role:"status",style:Y},A.default.createElement("span",null,e("deskUnfinished",{date:ar(L.createdAt)})),A.default.createElement(z,{small:!0,primary:!0,onClick:()=>u?.(L.sessionId)},e("reviewContinue"))),A.default.createElement("section",{className:"zj-card zj-home-hero","aria-label":e("homeNextLabel"),...d(1)},A.default.createElement("div",{className:"zj-home-hero-text"},A.default.createElement("span",{className:"zj-label"},e("homeNextLabel")),A.default.createElement("h1",{className:"zj-display"},w.role||e("homeNextUntitled")),A.default.createElement("p",{className:"zj-intro"},e(p)),A.default.createElement("div",{className:"zj-flow-actions"},A.default.createElement(z,{primary:!0,onClick:()=>s?.(S?j:null)},e(S?"homeContinue":"homeGoStart"),A.default.createElement(Lt,null)),P.length>1&&A.default.createElement(z,{quiet:!0,onClick:()=>s?.("job")},e("homeSwitchRole")))),A.default.createElement(zo,{t:e,summary:h,voiceReady:i,voiceChecking:n})),A.default.createElement("div",{className:"zj-stats"},A.default.createElement("section",{className:"zj-card zj-stat",...d(2)},A.default.createElement("span",{className:"zj-label"},e("homeStatInterviews")),A.default.createElement("span",{className:"zj-display is-num"},b.length?e("homeStatCount",{count:b.length}):"\u2014"),A.default.createElement("span",{className:"zj-hint"},b.length?e("homeStatDone",{done:f}):e("homeStatNoneYet"))),A.default.createElement("section",{className:"zj-card zj-stat",...d(3)},A.default.createElement("span",{className:"zj-label"},e("homeStatLatest")),A.default.createElement("span",{className:"zj-display is-num"},y?y.total:"\u2014",y&&A.default.createElement("small",null,"/ 100")),A.default.createElement("span",{className:"zj-hint"},y?e("homeStatLatestSub",{date:ar(y.interview.createdAt),role:O(y)}):e("homeStatNoReport")),A.default.createElement(xo,{values:V,label:e("homeTrend",{count:V.length})})),A.default.createElement("section",{className:"zj-card zj-stat",...d(4)},A.default.createElement("span",{className:"zj-label"},e("homeStatScore")),A.default.createElement("span",{className:`zj-display is-num${typeof $.total=="number"&&!$.pass?" is-below":""}`},typeof $.total=="number"?$.total:"\u2014",typeof $.total=="number"&&A.default.createElement("small",null,"/ 100")),A.default.createElement("span",{className:"zj-hint"},M))),X.length>0&&A.default.createElement("section",{className:"zj-section","aria-label":e("homeRecent"),...d(5)},A.default.createElement("div",{className:"zj-section-head"},A.default.createElement("h2",{className:"zj-section-title"},e("homeRecent")),A.default.createElement(z,{small:!0,quiet:!0,onClick:()=>x?.("review")},e("homeAllReview"),A.default.createElement(Lt,null))),A.default.createElement("div",{className:"zj-cards"},X.map(m=>A.default.createElement("article",{className:"zj-card zj-tile",key:m.interview.id},A.default.createElement("div",{className:"zj-tile-meta"},A.default.createElement("span",{className:"zj-badge is-gray"},e(m.interview.mode==="realtime"?"realtimeCall":"textInterview")),A.default.createElement("span",{className:"zj-hint"},ar(m.interview.createdAt)),A.default.createElement("span",{className:"zj-hint"},e(m.interview.status==="completed"?"reviewDone":"reviewActive"))),A.default.createElement("div",{className:"zj-tile-score"},A.default.createElement("span",{className:"zj-display is-num"},typeof m.report?.total=="number"?m.report.total:"\u2014"),A.default.createElement("span",{className:"zj-muted"},O(m))),m.report?.summary&&A.default.createElement("p",{className:"zj-hint zj-clamp"},m.report.summary),A.default.createElement("div",{className:"zj-tile-actions"},A.default.createElement(z,{small:!0,primary:m.interview.status!=="completed",disabled:!m.interview.sessionId,onClick:()=>u?.(m.interview.sessionId)},e(m.interview.status==="completed"?"reviewOpenReport":"reviewContinue"))))))),P.length>0&&A.default.createElement("section",{className:"zj-section","aria-label":e("homeRoles"),...d(6)},A.default.createElement("div",{className:"zj-section-head"},A.default.createElement("h2",{className:"zj-section-title"},e("homeRoles")),A.default.createElement(z,{small:!0,quiet:!0,onClick:()=>x?.("library")},e("homeAllLibrary"),A.default.createElement(Lt,null))),A.default.createElement("ul",{className:"zj-list-rows zj-home-roles"},P.slice(0,6).map(m=>A.default.createElement("li",{key:m.goal.id,className:"zj-home-role"},A.default.createElement("strong",null,m.goal.title),A.default.createElement("span",{className:"zj-hint"},[typeof m.score=="number"?e("homeRoleScore",{score:m.score}):e("homeStatScoreNone"),m.interviews?e("homeRoleInterviews",{count:m.interviews}):e("homeRoleNever")].join(" \xB7 ")),m.current?A.default.createElement("span",{className:"zj-badge is-gray"},e("homeRoleCurrent")):A.default.createElement(z,{small:!0,disabled:l,onClick:()=>c?.(m.goal)},e("homeRolePrepare")))))),!i&&w.value.mode==="realtime"&&A.default.createElement("section",{className:"zj-card zj-home-voice",...d(7)},A.default.createElement("span",{className:"zj-dot","aria-hidden":"true"}),A.default.createElement("div",null,A.default.createElement("strong",null,e("homeVoiceTitle")),A.default.createElement("p",{className:"zj-hint"},e("homeVoiceNone"))),A.default.createElement(z,{small:!0,onClick:()=>k?.()},e("deskConnect"))))}var ct=Object.freeze(["home","interview","review","library"]),Oi=Object.freeze(["job","resume","score"]);function sr(e="home"){return{page:ct.includes(e)?e:"home",room:null,open:null,sheet:null,settings:!1,dock:!0,sessionId:null,drafts:{}}}function lr(e,t){switch(t.type){case"page":return ct.includes(t.page)?{...e,page:t.page,open:null,sheet:t.page==="interview"&&Oi.includes(t.sheet)?t.sheet:null,room:null}:e;case"open":return t.page&&!ct.includes(t.page)?e:{...e,page:t.page||e.page,open:t.target,sheet:null,room:null};case"close":return{...e,open:null};case"sheet":return{...e,sheet:Oi.includes(t.sheet)?t.sheet:null};case"room":return t.sessionId?{...e,room:t.sessionId,sheet:null,settings:!1}:e;case"leaveRoom":return{...e,room:null};case"settings":return{...e,settings:!!t.open};case"dock":return{...e,dock:typeof t.open=="boolean"?t.open:!e.dock};case"session":return{...e,sessionId:t.sessionId||null,dock:t.sessionId?!0:e.dock};case"draft":{let r={...e.drafts};return t.value===void 0?delete r[t.key]:r[t.key]=t.value,{...e,drafts:r}}default:return e}}var ko={home:"navHome",interview:"navInterview",review:"navReview",library:"navLibrary"},wo=new Set(["NATIVE_DRAFT_UNAVAILABLE","NATIVE_DRAFT_BLOCKED","CONTEXT_UNAVAILABLE","NETWORK","FILE_TOO_LARGE","JOB_MATERIAL_REQUIRED","INVALID_RESPONSE","REQUEST_FAILED","EXPORT_FAILED","WORKSPACE_REQUIRED"]),Ui=(e,t)=>String(t.createdAt||"").localeCompare(String(e.createdAt||"")),yo=()=>I.default.createElement("svg",{width:"17",height:"17",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},I.default.createElement("circle",{cx:"12",cy:"12",r:"3"}),I.default.createElement("path",{d:"M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"})),So=()=>I.default.createElement("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},I.default.createElement("path",{d:"M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"})),No=()=>I.default.createElement("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round","aria-hidden":"true"},I.default.createElement("path",{d:"M6 6l12 12M18 6L6 18"}));function Co(e){let[t,r]=I.default.useState(null),[i,n]=I.default.useState(!1),o=I.default.useRef(!0),a=I.default.useCallback(async()=>{if(typeof e?.catalog=="function"){n(!0);try{let l=await e.catalog();o.current&&r(l)}catch{o.current&&r(null)}finally{o.current&&n(!1)}}},[e]);return I.default.useEffect(()=>(o.current=!0,a(),()=>{o.current=!1}),[a]),I.default.useEffect(()=>{let l=globalThis.document;if(!l?.addEventListener)return;let s=()=>{l.hidden||a()};return l.addEventListener("visibilitychange",s),()=>l.removeEventListener("visibilitychange",s)},[a]),{catalog:t,checking:i,check:a,ready:!!t&&!tt(t)}}function qi({t:e,useCareer:t,useNativeSessions:r,useWorkspaceChoices:i,action:n,upload:o,refresh:a,cancelCurrent:l,retryCurrent:s,createConversation:c,startInterview:u,interviewAction:x,download:k,voiceApi:h,realtimeApi:v,prepareChatDraft:w,enableVoiceInput:S,openVoiceSettings:j,openWorkspaceManager:b,readSource:f,loadOriginal:E,downloadOriginal:P,useResource:L,SessionProvider:Y,renderSlot:d,useRealtimeSettings:p,settingsActions:y={},initialPage:V}){let $=t(g=>g),M=$.data,[O,X]=I.default.useReducer(lr,V,sr),m=I.default.useRef(O);m.current=O;let G=O.drafts,W=(g,ee)=>X({type:"draft",key:g,value:ee}),ne=Co(v),[Z,le]=I.default.useState(!1),[oe,D]=I.default.useState(null),[ie,q]=I.default.useState(null),[R,pe]=I.default.useState(0),[ge,je]=I.default.useState(null),[xe,Ie]=I.default.useState(null),[Ae,Ee]=I.default.useState(null),te=I.default.useRef(null),_=I.default.useRef(null),me=I.default.useRef(null);me.current||(me.current=Ue());let fe=I.default.useRef(oe);fe.current=oe,I.default.useEffect(()=>{if(!te.current||typeof ResizeObserver!="function")return;let g=new ResizeObserver(([ee])=>le(ee.contentRect.width<1100));return g.observe(te.current),()=>g.disconnect()},[]),I.default.useEffect(()=>{Z&&X({type:"dock",open:!1})},[Z]),I.default.useEffect(()=>()=>clearTimeout(_.current),[]);let he=(g,ee=null)=>{clearTimeout(_.current),Ee({text:g,receipt:ee,key:Date.now()}),_.current=setTimeout(()=>Ee(null),ee?6500:3800)},ke=r(g=>g),De=i(g=>g),[$e,Qe]=I.default.useState(""),Pe=ke.ids.filter(g=>ke.byId[g]?.retainedBy?.mainView>0),Ve=Pe.length===1?De.items.find(g=>g.sessionIds.includes(Pe[0])):void 0,Te=De.items.find(g=>g.workspaceId===$e)||($e?void 0:Ve||(De.items.length===1?De.items[0]:void 0)),ut=g=>{let ee=De.items.find(de=>de.sessionIds.includes(g));ee&&Qe(ee.workspaceId)},Le=G.prepare??($.ready?Xr(M):void 0),mt=M.conversations||M.goals.flatMap(g=>g.conversations),qe=mt.filter(g=>g.kind!=="interview").sort(Ui),gt=[...M.interviews].filter(g=>g.status!=="completed"&&g.sessionId&&g.goalId&&g.goalId===Le?.goalId).sort(Ui)[0]||null,C=O.room?M.interviews.find(g=>g.sessionId===O.room):null,Q=O.room?C?.mode==="text"?O.room:null:O.sessionId||qe.find(g=>g.goalId&&g.goalId===Le?.goalId)?.sessionId||qe[0]?.sessionId||null,Se=mt.find(g=>g.sessionId===Q),ze=g=>ke.byId[g.sessionId]?.title||g.title,it=De.items.find(g=>g.sessionIds.includes(Q)),Vt=!!ke.byId[Q]?.running,Ne=R>0||$.pending>0||Vt,ft=ie||$.error;I.default.useEffect(()=>{je(g=>g?.sessionId===Q?g:null),Ie(null)},[Q]);let we=(g,ee)=>me.current(async()=>{q(null),pe(de=>de+1);try{let de=await g();return ee?.(de),de}catch(de){de?.name!=="AbortError"&&!["CANCELLED","ABORT_ERR"].includes(de?.code)&&q(de);return}finally{pe(de=>Math.max(0,de-1))}}),Ze=(g,ee)=>we(()=>n(g,ee)),Xi=(g,ee)=>we(()=>x(g,ee)),Ot=(g,ee,de)=>we(()=>k(g,ee,de)),Xe=()=>(X({type:"settings",open:!0}),!0),Ri=()=>we(async()=>{if(!b?.())throw new Error(e("unavailable"))}),ht=()=>{q({code:"WORKSPACE_REQUIRED"}),Xe()},Ut=g=>we(()=>n("receipt.undo",{receiptId:g.id})),Oe=(M.receipts||[]).find(g=>g.undo?.available),vt=I.default.useRef(void 0);I.default.useEffect(()=>{if($.ready){if(vt.current===void 0){vt.current=Oe?.id??null;return}Oe&&Oe.id!==vt.current&&he(e(gi(Oe.action)),Oe),vt.current=Oe?.id??null}},[$.ready,Oe?.id]),I.default.useEffect(()=>{let g=de=>{if(!te.current?.contains(de.target)||oe||O.settings)return;let _e=/^(INPUT|TEXTAREA|SELECT)$/.test(de.target.tagName)||de.target.isContentEditable;(de.ctrlKey||de.metaKey)&&de.key.toLowerCase()==="z"&&!de.shiftKey&&!_e&&Oe&&!Ne&&(de.preventDefault(),Ut(Oe))},ee=te.current;return ee?.addEventListener("keydown",g),()=>ee?.removeEventListener("keydown",g)},[oe,O.settings,Oe?.id,Ne]);let nt=g=>{g&&(ut(g),X({type:"room",sessionId:g}))},en=g=>Te?we(()=>u({...g,workspaceId:Te.workspaceId}),ee=>{ee?.sessionId&&nt(ee.sessionId),a?.()}):(ht(),Promise.resolve(void 0)),tn=()=>{X({type:"leaveRoom"}),a?.()},dr=g=>{if(!Te){ht();return}let ee=be(M,Le?.resumeVersionId),de=ee?.material.kind==="resume"&&ee.version.confirmed?ee.version.id:void 0;return we(()=>c(g||null,e("untitledChat"),de,Te.workspaceId),_e=>X({type:"session",sessionId:_e.sessionId}))},rn=(g,ee)=>{let de=vi(M,g,ee);if(!de){q({code:"CONTEXT_UNAVAILABLE"});return}if(!Q&&!Te){ht();return}let _e=m.current;return we(async()=>{let jt=O.room?null:Q;jt||(jt=(await c(Le?.goalId||null,e("untitledChat"),de.kind==="resume"?g:void 0,Te.workspaceId)).sessionId),!(m.current.page!==_e.page||m.current.room!==_e.room)&&(X({type:"session",sessionId:jt}),Ie(null),je({...de,sessionId:jt}))})},nn=()=>{let g=ge;if(!(!g||g.sessionId!==Q))return we(async()=>{if(!w)throw Object.assign(new Error(e("unavailable")),{code:"NATIVE_DRAFT_UNAVAILABLE"});await w(g.sessionId,bi(g,e)),je(ee=>ee===g?null:ee),Ie(e("contextAdded"))})},on=g=>{if(!Q&&!Te){ht();return}return we(async()=>{let ee=Q;if(ee||(ee=(await c(Le?.goalId||null,e("untitledChat"),void 0,Te.workspaceId)).sessionId),!w)throw Object.assign(new Error(e("unavailable")),{code:"NATIVE_DRAFT_UNAVAILABLE"});await w(ee,e(g)),X({type:"session",sessionId:ee}),Ie(e("contextAdded"))})},an=(g="resume",ee=null)=>D({kind:"material",initialKind:g,goalId:ee}),pr=g=>{let ee=fe.current;W(Mt(ee),void 0),ee?.goalId&&g?.latestVersionId&&Ze("goal.linkMaterial",{goalId:ee.goalId,versionId:g.latestVersionId}),fe.current===ee&&(D(null),X({type:"open",page:"library",target:{kind:"material",id:g.id,versionId:g.latestVersionId}}))},sn=g=>Ze("material.confirm",{versionId:g}),cr=g=>{let ee=be(M,g);ee&&X({type:"open",page:"library",target:{kind:"material",id:ee.material.id,versionId:g}})},qt=g=>D({kind:"citation",citation:g}),ur=g=>{let ee=(g.materialLinks||[]).map(de=>be(M,de.versionId)).filter(de=>de?.material.kind==="job"&&de.version.confirmed).sort((de,_e)=>_e.version.revision-de.version.revision)[0];W("prepare",{...Le||{},role:g.title||"",goalId:g.id,jobVersionId:ee?.version.id||null,scoreSkippedFor:null}),X({type:"page",page:"interview"})},mr=g=>{g&&(g.kind==="material"?X({type:"open",page:"library",target:{kind:"material",id:g.id,versionId:g.versionId}}):g.kind==="goal"?X({type:"open",page:"library",target:{kind:"goal",id:g.id}}):g.kind==="interview"?nt(M.interviews.find(ee=>ee.id===g.id)?.sessionId):["report","assessment","rewrite"].includes(g.kind)&&X({type:"open",page:"review",target:{kind:g.kind,id:g.id}}))},Re=oe?.kind==="citation"?br(M,oe.citation.sourceId):null,bt=Re?wt(Re.text,oe.citation):null,gr=oe?.kind==="linkMaterial"?M.goals.find(g=>g.id===oe.goalId):null,Be=!!O.room,fr=O.dock&&(!Be||C?.mode==="text"),ln=Q?it?I.default.createElement(Nr,{key:Q,sessionId:Q,t:e,useResource:L,SessionProvider:Y,renderSlot:d}):I.default.createElement("p",{className:"zj-hint zj-dock-note"},De.phase==="ready"?e("floatingConversation"):e("loading")):null,dn=I.default.createElement("header",{className:"zj-top"},I.default.createElement("span",{className:"zj-wordmark"},I.default.createElement(It,{size:18}),I.default.createElement("span",null,e("panel"))),Be?I.default.createElement("div",{className:"zj-top-space"}):I.default.createElement(I.default.Fragment,null,I.default.createElement("nav",{className:"zj-tabs-nav","aria-label":e("navLabel")},ct.map(g=>I.default.createElement("button",{type:"button",key:g,"aria-current":O.page===g?"page":void 0,className:O.page===g?"is-on":"",onClick:()=>X({type:"page",page:g})},e(ko[g])))),I.default.createElement("div",{className:"zj-top-space"})),I.default.createElement("button",{type:"button",className:`zj-chip${ne.ready?" is-ok":""}`,title:e("voiceChipTitle"),onClick:Xe},I.default.createElement("span",{className:"zj-dot","aria-hidden":"true"}),e(ne.ready?"voiceChipReady":ne.checking&&!ne.catalog?"voiceChipChecking":"voiceChipNone")),I.default.createElement("button",{type:"button",className:"zj-icon-btn is-glass","aria-label":e("openSettings"),title:e("openSettings"),onClick:Xe},I.default.createElement(yo,null)),(!Be||C?.mode==="text")&&I.default.createElement("button",{type:"button",className:"zj-chip","aria-pressed":fr,onClick:()=>X({type:"dock"})},I.default.createElement(So,null),e("assistantToggle")),Be&&I.default.createElement(z,{small:!0,onClick:tn,title:e("roomBackTitle")},e("roomBack"))),Ke;return $.ready?Be?Ke=C?I.default.createElement(ui,{key:C.id,state:M,interview:C,t:e,busy:Ne,onAction:Xi,onExport:Ot,voiceApi:h,realtimeApi:v,openRealtimeSettings:Xe,onChanged:a,nativeChat:null,onEvidence:qt,answerDraft:G[`answer:${C.id}:${C.currentQuestionId}`],onAnswerDraftChange:g=>W(`answer:${C.id}:${C.currentQuestionId}`,g)}):I.default.createElement("div",{className:"zj-page"},I.default.createElement("p",{className:"zj-hint",role:"status"},e("interviewWaiting"))):O.page==="home"?Ke=I.default.createElement(Vi,{t:e,state:M,draft:Le,busy:Ne,voiceReady:ne.ready,voiceChecking:ne.checking,workspaceReady:!!Te,nativeTitles:ke.byId,onPrepare:g=>X({type:"page",page:"interview",sheet:g}),onUseRole:ur,onEnterRoom:nt,onPage:g=>X({type:"page",page:g}),onOpenSettings:Xe}):O.page==="review"?Ke=I.default.createElement(Ti,{t:e,state:M,nativeTitles:ke.byId,open:O.open,onOpen:g=>X({type:"open",target:g}),onClose:()=>X({type:"close"}),onEnterRoom:nt,busy:Ne,onExport:Ot,onEvidence:qt,onAction:Ze,onReviewVersion:cr,drafts:G,onDraft:W}):O.page==="library"?Ke=I.default.createElement(Bi,{t:e,state:M,open:O.open,onOpen:g=>X({type:"open",target:g}),onClose:()=>X({type:"close"}),busy:Ne,onAddMaterial:an,onEditMaterial:(g,ee)=>D({kind:"material",material:g,version:ee}),onConfirm:sn,onExport:Ot,onAssess:g=>Ze("assessment.run",{kind:"resume",versionId:g}),onEvidence:qt,onSource:g=>we(()=>f(g),ee=>D({kind:"source",data:ee})),onChatContext:rn,onAction:Ze,onReviewVersion:cr,onEditGoal:g=>D({kind:"editGoal",goal:g}),onLinkMaterial:g=>D({kind:"linkMaterial",goalId:g.id}),onUseRole:ur,drafts:G,onDraft:W}):Ke=I.default.createElement(Rr,{t:e,state:M,busy:Ne,draft:Le,onDraftChange:g=>W("prepare",g),action:Ze,task:g=>we(()=>g(n)),upload:(g,ee)=>we(()=>o(g,ee)),startInterview:en,unfinished:gt,onContinue:nt,sheet:O.sheet,onSheet:g=>X({type:"sheet",sheet:g}),voiceReady:ne.ready,voiceChecking:ne.checking,workspaceReady:!!Te,onOpenSettings:Xe}):Ke=I.default.createElement("div",{className:"zj-page"},I.default.createElement("p",{className:"zj-hint"},e("loading"))),I.default.createElement(Ft.Provider,{value:{canCancel:!!$.operation?.canCancel,cancel:()=>l?.($.operation?.requestId)}},I.default.createElement("div",{className:`zj zj-desk${Z?" zj-narrow":""}${Be?" is-room":""}`,ref:te,"data-zhijing-workbench":"","data-screen":Be?"room":O.page},I.default.createElement("style",null,Nt+Cr+Ir+Er+Ar+Tr+Dr),I.default.createElement("div",{className:"zj-ambient","aria-hidden":"true"},I.default.createElement("i",null),I.default.createElement("i",null),I.default.createElement("i",null)),I.default.createElement("section",{className:"zj-main"},dn,(Ne||$.loading)&&I.default.createElement("div",{className:"zj-progress",role:"progressbar","aria-label":e("processing")}),!Be&&$.operation?.status!=="succeeded"&&I.default.createElement(fi,{operation:$.operation,onCancel:l,onRetry:()=>we(()=>s?.()),onOpen:mr,t:e}),ft&&I.default.createElement("div",{className:"zj-error",role:"alert"},I.default.createElement("strong",null,e("errorTitle")),I.default.createElement("span",null,wo.has(ft.code)?e(`error_${ft.code}`):ft.message||e("error_REQUEST_FAILED")),I.default.createElement(z,{quiet:!0,small:!0,onClick:()=>{q(null),a()}},e("retry"))),I.default.createElement("div",{className:`zj-scroll${Be?" is-room":""}`,key:Be?`room:${O.room}`:O.page},Ke)),fr&&I.default.createElement("aside",{className:"zj-dock","aria-label":e("assistant")},I.default.createElement("header",{className:"zj-dock-head"},I.default.createElement("strong",null,e("assistant")),I.default.createElement("span",{className:"zj-hint"},e("assistantSame")),I.default.createElement("div",{className:"zj-top-space"}),I.default.createElement("button",{type:"button",className:"zj-icon-btn","aria-label":e("hideAssistant"),onClick:()=>X({type:"dock",open:!1})},I.default.createElement(No,null))),!Be&&I.default.createElement("div",{className:"zj-dock-bar"},qe.length>1&&I.default.createElement("select",{className:"zj-input is-small","aria-label":e("assistantPick"),value:Q||"",onChange:g=>{ut(g.target.value),X({type:"session",sessionId:g.target.value})}},qe.map(g=>I.default.createElement("option",{key:g.sessionId,value:g.sessionId},ze(g)))),qe.length===1&&Se&&I.default.createElement("span",{className:"zj-hint"},ze(Se)),qe.length>0&&I.default.createElement(z,{small:!0,quiet:!0,disabled:Ne,onClick:()=>dr(Le?.goalId)},e("newChat"))),ge&&ge.sessionId===Q&&I.default.createElement("section",{className:"zj-context-preview","aria-label":e("selectedContext")},I.default.createElement("div",{className:"zj-page-heading"},I.default.createElement("strong",null,ge.title," \xB7 ",e("version",{number:ge.revision})),I.default.createElement(z,{small:!0,quiet:!0,disabled:Ne,onClick:()=>je(null)},e("cancelContext"))),I.default.createElement("details",null,I.default.createElement("summary",null,e("previewContext")),I.default.createElement("pre",null,ge.text)),I.default.createElement("p",{className:"zj-hint"},e("contextPreviewNote")),I.default.createElement(z,{small:!0,primary:!0,disabled:Ne,onClick:nn},e("addToChatDraft"))),xe&&I.default.createElement("p",{className:"zj-context-notice",role:"status"},xe),!Be&&I.default.createElement(hi,{receipts:M.receipts,onOpen:mr,onUndo:Ut,busy:Ne,t:e}),I.default.createElement("div",{className:"zj-dock-chat"},ln||I.default.createElement("div",{className:"zj-assistant-empty"},I.default.createElement("p",null,e("assistantEmpty")),I.default.createElement(z,{primary:!0,disabled:Ne,onClick:()=>dr(Le?.goalId)},e("newChat")))),!Be&&I.default.createElement("div",{className:"zj-suggestions"},["deskSuggestReview","deskSuggestPrepare"].map(g=>I.default.createElement(z,{small:!0,quiet:!0,key:g,disabled:Ne,onClick:()=>on(g)},e(g))))),O.settings&&I.default.createElement(Si,{t:e,onClose:()=>X({type:"settings",open:!1}),onSaved:g=>{ne.check(),g?.quiet||he(e("setSaved"))},voiceReady:ne.ready,useRealtimeSettings:p,...y,workspaces:De.items,workspaceId:Te?.workspaceId||"",onWorkspace:g=>{Qe(g),q(null)},onManageWorkspaces:Ri,enableVoiceInput:S,openVoiceSettings:j}),Ae&&I.default.createElement("div",{className:"zj-toast",role:"status",key:Ae.key},I.default.createElement("span",null,Ae.text),Ae.receipt&&I.default.createElement("button",{type:"button",disabled:Ne,onClick:()=>{let g=Ae.receipt;Ee(null),Ut(g)}},e("deskUndo"))),oe?.kind==="editGoal"&&I.default.createElement(Vr,{t:e,busy:Ne,saving:R>0,editing:!0,draft:G[`goal:${oe.goal.id}`]||oe.goal,onDraftChange:g=>W(`goal:${oe.goal.id}`,g),onClose:()=>D(null),onSave:g=>we(()=>n("goal.update",{goalId:oe.goal.id,...g}),()=>{W(`goal:${oe.goal.id}`,void 0),D(null)})}),oe?.kind==="material"&&I.default.createElement(Mr,{key:Mt(oe),t:e,busy:Ne,saving:R>0,...oe,draft:G[Mt(oe)],onDraftChange:g=>W(Mt(oe),g),onClose:()=>D(null),onSave:(g,ee)=>we(()=>n(g,ee),pr),onUpload:(g,ee)=>we(()=>o(g,ee),pr)}),oe?.kind==="linkMaterial"&&gr&&I.default.createElement(Or,{t:e,state:M,busy:Ne,onClose:()=>D(null),onSelect:g=>we(()=>n("goal.linkMaterial",{goalId:gr.id,versionId:g}),()=>D(null))}),oe?.kind==="citation"&&I.default.createElement(Fe,{title:Re?.title||e("evidence"),t:e,onClose:()=>D(null)},Re?I.default.createElement(I.default.Fragment,null,Re.revision&&I.default.createElement("p",{className:"zj-subtle"},e("version",{number:Re.revision})),I.default.createElement("div",{className:"zj-paper-content"},bt.before,bt.quote&&I.default.createElement("mark",null,bt.quote),bt.after)):I.default.createElement("p",{className:"zj-subtle"},e("unavailable"))),oe?.kind==="source"&&I.default.createElement(mi,{key:oe.data.versionId,data:oe.data,t:e,onClose:()=>D(null),loadOriginal:E,onDownload:g=>we(()=>P(g))})))}function Mt(e){return e?.material?`material:${e.material.id}:${e.version?.id||""}`:`material:new:${e?.goalId||""}:${e?.initialKind||"resume"}`}var Ye=ye(require("react"),1);function _i(e,t){let r=i=>{let n=i.get?.("betterSidebar")||i.betterSidebar;typeof n?.registerTab=="function"&&i.effect(()=>{let o=!0;function a(){let[s,c]=Ye.default.useState(!1);return Ye.default.createElement("section",{style:{padding:24}},Ye.default.createElement("h2",null,t("panel")),Ye.default.createElement("p",null,t("deskSidebarNote")),Ye.default.createElement("button",{type:"button",onClick:()=>{let u=o&&e.get?.("layout");if(typeof u?.selectPanel!="function"){c(!0);return}u.selectPanel("zhijing"),c(!1)}},t("deskOpenWorkbench")),s&&Ye.default.createElement("p",{role:"alert"},t("unavailable")))}let l=n.registerTab({id:"dsh-interview-desk:workbench",title:()=>t("panel"),description:()=>t("deskSidebarNote"),order:60,single:!0,component:a});return()=>{o=!1,l?.()}},"zhijing: optional better-sidebar entry")};typeof e.inject=="function"?e.inject(["betterSidebar"],r):r(e)}var Hi={deskOpenWorkbench:"\u6253\u5F00\u804C\u955CAI\u5DE5\u4F5C\u53F0",deskSidebarNote:"\u5728 DSH \u4E3B\u5DE5\u4F5C\u533A\u6253\u5F00\u5B8C\u6574\u5DE5\u4F5C\u53F0\uFF0C\u7EE7\u7EED\u4F7F\u7528\u539F\u751F\u5BF9\u8BDD\u3002",deskSuggestReview:"\u5E2E\u6211\u68C0\u67E5\u5DF2\u6709\u7ECF\u5386\u7684\u8868\u8FBE",deskSuggestPrepare:"\u5E2E\u6211\u6574\u7406\u63A5\u4E0B\u6765\u7684\u51C6\u5907\u6B65\u9AA4",deskLayout_board:"\u770B\u677F",deskReportTrend:"\u6700\u8FD1\u9762\u8BD5\u6210\u7EE9",deskTrendNote:"\u6309\u5B8C\u6210\u65F6\u95F4\u663E\u793A\u6700\u8FD1\u5341\u4E8C\u4EFD\u62A5\u544A\u3002\u5C97\u4F4D\u548C\u8D44\u6599\u4E0D\u540C\u7684\u6210\u7EE9\u4EC5\u4F5C\u56DE\u770B\u3002",deskNavigation:"\u5DE5\u4F5C\u53F0\u5BFC\u822A",deskReports:"\u62A5\u544A",deskBack:"\u8FD4\u56DE\u5217\u8868",deskPrevious:"\u4E0A\u4E00\u4E2A\u5BF9\u8C61",deskNext:"\u4E0B\u4E00\u4E2A\u5BF9\u8C61",deskFocus:"\u4E13\u6CE8\u7ED3\u679C",deskSplit:"\u5E76\u6392\u67E5\u770B",deskIntro_home:"\u4ECE\u4E00\u4E2A\u95EE\u9898\u5F00\u59CB\uFF0C\u548C\u52A9\u624B\u4E00\u8D77\u6574\u7406\u4E0B\u4E00\u6B65\u3002",deskIntro_personal:"\u6574\u7406\u7B80\u5386\u548C\u7ECF\u5386\u3002\u6BCF\u4E2A\u5DF2\u4FDD\u5B58\u7248\u672C\u90FD\u4F1A\u4FDD\u7559\u3002",deskIntro_goals:"\u6309\u76EE\u6807\u5C97\u4F4D\u6574\u7406\u8D44\u6599\u3001\u5BF9\u8BDD\u548C\u9762\u8BD5\u3002",deskIntro_interviews:"\u7EE7\u7EED\u7EC3\u4E60\uFF0C\u6216\u56DE\u770B\u5DF2\u5B8C\u6210\u7684\u6A21\u62DF\u9762\u8BD5\u3002",deskIntro_reports:"\u67E5\u770B\u7B80\u5386\u5206\u6790\u3001\u5C97\u4F4D\u9002\u914D\u3001\u6539\u5199\u5EFA\u8BAE\u548C\u9762\u8BD5\u62A5\u544A\u3002",deskSearch:"\u641C\u7D22",deskSearchHint:"\u641C\u7D22\u540D\u79F0\u548C\u5185\u5BB9",deskFilter:"\u7B5B\u9009",deskAll:"\u5168\u90E8",deskSort:"\u6392\u5E8F",deskSort_newest:"\u6700\u8FD1\u521B\u5EFA",deskSort_oldest:"\u6700\u65E9\u521B\u5EFA",deskSort_title:"\u540D\u79F0",deskLayout:"\u663E\u793A\u65B9\u5F0F",deskLayout_cards:"\u5361\u7247",deskLayout_list:"\u5217\u8868",deskCount:"\u663E\u793A {shown} \u9879\uFF0C\u5171 {total} \u9879",deskVersions:"{count} \u4E2A\u7248\u672C",deskAnswers:"{count} \u4E2A\u56DE\u7B54",deskConversations:"{count} \u4E2A\u5BF9\u8BDD",deskEmpty:"\u4ECE\u8FD9\u91CC\u5F00\u59CB",deskNoMatches:"\u6CA1\u6709\u5339\u914D\u7684\u7ED3\u679C",deskNoMatchesNote:"\u6362\u4E2A\u5173\u952E\u8BCD\uFF0C\u6216\u6E05\u9664\u7B5B\u9009\u540E\u518D\u627E\u627E\u3002",deskClearFilters:"\u6E05\u9664\u7B5B\u9009",deskResult:"\u7ED3\u679C",deskSources:"\u539F\u59CB\u8D44\u6599",deskDocument:"\u6B63\u6587",deskVersionsTab:"\u7248\u672C\u8BB0\u5F55",deskCopy:"\u590D\u5236\u6B63\u6587",deskCopied:"\u5DF2\u590D\u5236",deskCopyFailed:"\u590D\u5236\u672A\u6210\u529F\uFF0C\u8BF7\u9009\u4E2D\u6B63\u6587\u540E\u590D\u5236\u3002",deskReceipts:"\u64CD\u4F5C\u8BB0\u5F55",deskOpenResult:"\u67E5\u770B\u7ED3\u679C",deskUndo:"\u64A4\u9500",deskUndoLast:"\u64A4\u9500\u4E0A\u4E00\u6B65",deskUndone:"\u5DF2\u64A4\u9500",deskUndoNote:"\u64A4\u9500\u6700\u8FD1\u53EF\u6062\u590D\u7684\u4FEE\u6539\u3002\u7B80\u5386\u4F1A\u8FFD\u52A0\u6062\u590D\u7248\u672C\uFF0C\u4ECD\u9700\u68C0\u67E5\u786E\u8BA4\u3002",deskUndoConflict:"\u7ED3\u679C\u5DF2\u88AB\u540E\u7EED\u64CD\u4F5C\u6539\u53D8\uFF0C\u65E0\u6CD5\u64A4\u9500\u3002",deskUndoUsed:"\u8FD9\u4E00\u6B65\u5DF2\u64A4\u9500\u3002",deskUndoUnavailable:"\u6B64\u64CD\u4F5C\u4FDD\u7559\u5386\u53F2\u8BB0\u5F55\uFF0C\u4E0D\u63D0\u4F9B\u64A4\u9500\u3002",deskArchive:"\u5F52\u6863\u5C97\u4F4D",deskRestore:"\u6062\u590D\u5C97\u4F4D",deskEditGoal:"\u7F16\u8F91\u76EE\u6807\u5C97\u4F4D",active:"\u8FDB\u884C\u4E2D",archived:"\u5DF2\u5F52\u6863"},Fi={deskOpenWorkbench:"Open Zhijing AI workbench",deskSidebarNote:"Open the full workbench in the DSH main area with native conversations.",deskSuggestReview:"Help me review how I describe my experience",deskSuggestPrepare:"Help me plan my next preparation steps",deskLayout_board:"Board",deskReportTrend:"Recent interview scores",deskTrendNote:"The latest twelve saved reports, by completion time. Scores for different roles and materials are for review only.",deskNavigation:"Workbench navigation",deskReports:"Reports",deskBack:"Back to list",deskPrevious:"Previous item",deskNext:"Next item",deskFocus:"Focus result",deskSplit:"Side by side",deskIntro_home:"Start with a question and prepare your next step with the assistant.",deskIntro_personal:"Organize resumes and experience. Every saved version is retained.",deskIntro_goals:"Keep materials, conversations, and practice together for each role.",deskIntro_interviews:"Continue practice or revisit completed mock interviews.",deskIntro_reports:"Review resume analysis, role fit, revisions, and interview reports.",deskSearch:"Search",deskSearchHint:"Search titles and content",deskFilter:"Filter",deskAll:"All",deskSort:"Sort",deskSort_newest:"Newest first",deskSort_oldest:"Oldest first",deskSort_title:"Title",deskLayout:"Layout",deskLayout_cards:"Cards",deskLayout_list:"List",deskCount:"Showing {shown} of {total}",deskVersions:"{count} versions",deskAnswers:"{count} answers",deskConversations:"{count} conversations",deskEmpty:"Start here",deskNoMatches:"No matching results",deskNoMatchesNote:"Try another keyword or clear the filters.",deskClearFilters:"Clear filters",deskResult:"Result",deskSources:"Original materials",deskDocument:"Document",deskVersionsTab:"Version history",deskCopy:"Copy text",deskCopied:"Copied",deskCopyFailed:"Copy failed. Select and copy the text manually.",deskReceipts:"Activity",deskOpenResult:"View result",deskUndo:"Undo",deskUndoLast:"Undo last change",deskUndone:"Undone",deskUndoNote:"Undo the latest restorable change. Resume restoration creates a new version for review.",deskUndoConflict:"A later change prevents undo.",deskUndoUsed:"Already undone.",deskUndoUnavailable:"This operation retains history and cannot be undone.",deskArchive:"Archive role",deskRestore:"Restore role",deskEditGoal:"Edit target role",active:"In progress",archived:"Archived"};var Wi={prepSlogan:"\u6B63\u5F0F\u9762\u8BD5\u524D\uFF0C\u5148\u5728\u8FD9\u91CC\u9762\u4E00\u573A\u3002",prepLead:"\u5148\u653E\u4E24\u6837\u4E1C\u897F\uFF1A\u5C97\u4F4D\u8981\u6C42\uFF0C\u548C\u4F60\u7684\u7B80\u5386\u3002",prepBegin:"\u5F00\u59CB\u51C6\u5907",prepSkip:"\u5148\u53BB\u5DE5\u4F5C\u53F0\u770B\u770B",prepOpen:"\u51C6\u5907\u4E00\u573A\u9762\u8BD5",prepTheirs:"\u4ED6\u4EEC\u8981\u4EC0\u4E48\u6837\u7684\u4EBA",prepTheirsNote:"\u8D34\u4E0A\u4F60\u60F3\u9762\u7684\u5C97\u4F4D\u8981\u6C42\u3002",prepYours:"\u4F60\u662F\u4EC0\u4E48\u6837\u7684\u4EBA",prepYoursNote:"\u653E\u4E0A\u4F60\u7684\u7B80\u5386\u3002",prepNextResume:"\u4E0B\u4E00\u6B65\u653E\u7B80\u5386\u3002",prepRole:"\u5C97\u4F4D\u540D\u79F0",prepRoleHint:"\u4F8B\u5982\uFF1A\u9AD8\u7EA7\u524D\u7AEF\u5DE5\u7A0B\u5E08",prepJobText:"\u5C97\u4F4D\u8981\u6C42",prepJobHint:"\u7C98\u8D34\u5C97\u4F4D\u8981\u6C42\u7684\u6B63\u6587",prepJobTitle:"{role} \u5C97\u4F4D\u8981\u6C42",prepJobUrlHint:"\u516C\u5F00\u7684\u62DB\u8058\u9875\u9762\u94FE\u63A5",prepUseLink:"\u6539\u7528\u62DB\u8058\u94FE\u63A5",prepUsePaste:"\u6539\u4E3A\u7C98\u8D34\u6B63\u6587",prepReadLink:"\u8BFB\u53D6\u94FE\u63A5",prepConfirmNext:"\u786E\u8BA4\u5E76\u7EE7\u7EED",prepContinue:"\u7EE7\u7EED",prepConfirmThis:"\u786E\u8BA4\u662F\u8FD9\u4EFD",prepReplace:"\u6362\u4E00\u4EFD",prepReviewNote:"\u8FD9\u662F\u8BC6\u522B\u51FA\u7684\u6B63\u6587\u3002\u770B\u4E00\u773C\u59D3\u540D\u3001\u65F6\u95F4\u548C\u6570\u5B57\uFF0C\u6CA1\u95EE\u9898\u5C31\u786E\u8BA4\u3002",prepConfirmed:"\u5DF2\u786E\u8BA4\uFF0C\u8FD9\u4E00\u573A\u6309\u8FD9\u4EFD\u6765\u95EE\u3002",prepDrop:"\u62D6\u5165 PDF\u3001Word \u6216\u56FE\u7247\uFF0C\u4E5F\u53EF\u4EE5\u70B9\u8FD9\u91CC\u9009\u62E9\u6587\u4EF6",prepPasteResume:"\u6539\u4E3A\u7C98\u8D34\u7B80\u5386\u6B63\u6587",prepUseFile:"\u6539\u4E3A\u5BFC\u5165\u6587\u4EF6",prepResumeHint:"\u7C98\u8D34\u7B80\u5386\u6B63\u6587",prepExisting:"\u7528\u5DF2\u6709\u7684\u7B80\u5386",prepBackJob:"\u56DE\u5230\u5C97\u4F4D\u8981\u6C42",prepBackResume:"\u56DE\u5230\u7B80\u5386",prepJobMissing:"\u8FD8\u6CA1\u586B\u5C97\u4F4D\u8981\u6C42\u3002",prepMissing:"\u8FD8\u6CA1\u653E",prepUnconfirmed:"\u8FD8\u6CA1\u786E\u8BA4",prepNotReady:"\u5C97\u4F4D\u548C\u7B80\u5386\u90FD\u653E\u597D\uFF0C\u5C31\u53EF\u4EE5\u5F00\u59CB\u3002",prepStart:"\u5F00\u59CB\u9762\u8BD5",prepCount:"{number} \u9898",prepVoiceSetup:"\u8BED\u97F3\u9762\u8BD5\u8981\u5148\u63A5\u5165\u97F3\u9891\u670D\u52A1\u3002\u63A5\u597D\u540E\u56DE\u5230\u8FD9\u91CC\u91CD\u65B0\u68C0\u67E5\u3002",prepRecheck:"\u91CD\u65B0\u68C0\u67E5",prepScoreStep:"\u7B80\u5386\u8BC4\u5206",prepFitTitle:"\u5BF9\u7167\u5C97\u4F4D",prepFitNote:"\u6280\u80FD\u3001\u7ECF\u5386\u3001\u660E\u786E\u8981\u6C42\uFF0C\u5404\u5BF9\u4E0A\u591A\u5C11\u3002",prepResumeTitle:"\u7B80\u5386\u672C\u8EAB",prepResumeNote:"\u4F9D\u636E\u3001\u8868\u8FBE\u3001\u7EC4\u7EC7\u3001\u5177\u4F53\u7A0B\u5EA6\u3002",prepScoreOf:"\u7B80\u5386\u8BC4\u5206 {score} \u5206",prepScoreIdle:"\u5C97\u4F4D\u548C\u7B80\u5386\u90FD\u786E\u8BA4\u4E86\u3002\u8BC4\u4E00\u6B21\u5206\uFF0C\u770B\u770B\u79BB 80 \u5206\u8FD8\u6709\u591A\u8FDC\u3002",prepScoreRun:"\u5F00\u59CB\u8BC4\u5206",prepScoreWait:"\u5148\u653E\u597D\u5C97\u4F4D\u548C\u7B80\u5386\u3002",prepScoring:"\u6B63\u5728\u5BF9\u7167\u5C97\u4F4D\u8BFB\u4F60\u7684\u7B80\u5386\u3002",prepScorePass:"{score} \u5206\uFF0C\u53EF\u4EE5\u5F00\u59CB\u4E86\u3002",prepScoreBelow:"{score} \u5206\uFF0C\u79BB 80 \u8FD8\u5DEE {gap} \u5206\u3002",prepScoreUnknown:"\u8D44\u6599\u4E0D\u591F\uFF0C\u6709\u51E0\u9879\u8BC4\u4E0D\u51FA\u6765\uFF0C\u6240\u4EE5\u6CA1\u6709\u603B\u5206\u3002",prepScoreWeights:"\u5C97\u4F4D 65% \xB7 \u7B80\u5386 35%",prepScoreDelta:"\u6BD4\u4E0A\u4E00\u7248 {delta}",prepRevise:"\u6309\u5EFA\u8BAE\u6539\u4E00\u7248",prepEditSelf:"\u81EA\u5DF1\u6539",prepSkipScore:"\u8DF3\u8FC7\uFF0C\u76F4\u63A5\u9762\u8BD5",prepReviseAgain:"\u518D\u6539\u4E00\u7248",prepRescore:"\u91CD\u65B0\u8BC4\u5206",prepRevising:"\u6B63\u5728\u9010\u6BB5\u6539\u5199\u3002\u53EA\u6539\u8BF4\u6CD5\u548C\u987A\u5E8F\uFF0C\u4E0D\u52A0\u7B80\u5386\u91CC\u6CA1\u6709\u7684\u4E8B\u5B9E\u548C\u6570\u5B57\u3002",prepReviseNote:"\u53EA\u6539\u8BF4\u6CD5\u548C\u987A\u5E8F\uFF0C\u4E0D\u52A0\u7B80\u5386\u91CC\u6CA1\u6709\u7684\u4E8B\u5B9E\u548C\u6570\u5B57\u3002\u52FE\u6389\u4E0D\u60F3\u8981\u7684\uFF1B\u91C7\u7528\u540E\u5B58\u6210\u65B0\u7248\u672C\uFF0C\u6309\u65B0\u7248\u672C\u91CD\u65B0\u8BC4\u5206\u3002",prepReviseApply:"\u91C7\u7528\u9009\u4E2D\u7684 {count} \u5904\uFF0C\u91CD\u65B0\u8BC4\u5206",prepReviseDrop:"\u4E0D\u7528\u4E86",prepEditNote:"\u76F4\u63A5\u6539\u6B63\u6587\u3002\u4FDD\u5B58\u540E\u5B58\u6210\u65B0\u7248\u672C\uFF0C\u518D\u8BC4\u4E00\u6B21\u3002",prepEditSave:"\u4FDD\u5B58\u5E76\u91CD\u65B0\u8BC4\u5206",prepReviseRule:"\u6309\u4EE5\u4E0B\u5EFA\u8BAE\u6539\u5199\u7B80\u5386\uFF0C\u8BA9\u5B83\u66F4\u8D34\u5408\u5C97\u4F4D\u8981\u6C42\u3001\u8868\u8FBE\u66F4\u5177\u4F53\u3002\u53EA\u6539\u63AA\u8F9E\u3001\u987A\u5E8F\u548C\u683C\u5F0F\uFF0C\u4E0D\u65B0\u589E\u7B80\u5386\u91CC\u6CA1\u6709\u7684\u4E8B\u5B9E\u3001\u6570\u5B57\u3001\u6280\u80FD\u6216\u7ECF\u5386\u3002",prepUnknownCrit:"\u8BC4\u4E0D\u51FA",prepGateBelow:"\u7B80\u5386 {score} \u5206\uFF0C\u5230 80 \u5206\u518D\u5F00\u59CB\u3002",prepGateNone:"\u5F00\u59CB\u524D\u5148\u770B\u4E00\u4E0B\u7B80\u5386\u8BC4\u5206\u3002",prepGateBack:"\u56DE\u5230\u8BC4\u5206",prepSkipped:"\u5DF2\u8DF3\u8FC7\u8BC4\u5206",prepFailModel:"\u8FD8\u6CA1\u6709\u53EF\u7528\u7684\u6587\u5B57\u6A21\u578B\u3002\u5728 DSH \u91CC\u9009\u597D\u6A21\u578B\u540E\u518D\u8BC4\u5206\uFF0C\u4E5F\u53EF\u4EE5\u5148\u8DF3\u8FC7\u3002",prepFailTimeout:"\u6A21\u578B\u8FD9\u6B21\u6CA1\u6709\u6309\u65F6\u8FD4\u56DE\uFF0C\u53EF\u4EE5\u518D\u8BD5\u4E00\u6B21\u3002",prepFailRewrite:"\u8FD9\u6B21\u6CA1\u6539\u51FA\u53EF\u7528\u7684\u7248\u672C\uFF1A\u6709\u6539\u52A8\u52A0\u5165\u4E86\u539F\u6587\u6CA1\u6709\u7684\u5185\u5BB9\uFF0C\u6216\u6CA1\u6709\u53EF\u6539\u7684\u5730\u65B9\u3002\u53EF\u4EE5\u518D\u8BD5\u4E00\u6B21\uFF0C\u6216\u8005\u81EA\u5DF1\u6539\u3002",prepFailGeneric:"\u8FD9\u4E00\u6B65\u6CA1\u5B8C\u6210\uFF0C\u53EF\u4EE5\u518D\u8BD5\u4E00\u6B21\u3002",prepFailBusy:"\u4E0A\u4E00\u6B21\u8BC4\u5206\u8FD8\u6CA1\u7ED3\u675F\uFF0C\u7B49\u5B83\u5B8C\u6210\u518D\u770B\u3002",prepFailEvidence:"\u6A21\u578B\u8FD9\u6B21\u7ED9\u7684\u4F9D\u636E\u548C\u539F\u6587\u5BF9\u4E0D\u4E0A\uFF0C\u6CA1\u6709\u91C7\u7528\u3002\u518D\u8BC4\u4E00\u6B21\u901A\u5E38\u5C31\u597D\u3002",prepFailFormat:"\u6A21\u578B\u8FD9\u6B21\u6CA1\u6309\u8981\u6C42\u7684\u683C\u5F0F\u56DE\u7B54\uFF0C\u53EF\u4EE5\u518D\u8BD5\u4E00\u6B21\u3002",prepFailCode:"\uFF08\u4EE3\u7801 {code}\uFF09",crit_fit_skills:"\u5C97\u4F4D\u6280\u80FD",crit_fit_experience:"\u76F8\u5173\u7ECF\u5386",crit_fit_requirements:"\u660E\u786E\u5C97\u4F4D\u8981\u6C42",crit_resume_evidence:"\u7ECF\u5386\u4E0E\u6210\u679C\u4F9D\u636E",crit_resume_clarity:"\u8868\u8FBE\u6E05\u695A",crit_resume_structure:"\u5185\u5BB9\u7EC4\u7EC7",crit_resume_specificity:"\u5185\u5BB9\u5177\u4F53",realtimeTranscriptHere:"\u9762\u8BD5\u5B98\u7684\u8BDD\u4F1A\u663E\u793A\u5728\u8FD9\u91CC\u3002",interviewWaiting:"\u6B63\u5728\u51C6\u5907\u95EE\u9898"},$i={prepSlogan:"Rehearse the interview before the real one.",prepLead:"Start with two things: the job description and your resume.",prepBegin:"Get ready",prepSkip:"Open the workbench first",prepOpen:"Prepare an interview",prepTheirs:"Who they are looking for",prepTheirsNote:"Paste the description of the job you want to interview for.",prepYours:"Who you are",prepYoursNote:"Add your resume.",prepNextResume:"Your resume comes next.",prepRole:"Role",prepRoleHint:"For example: Senior frontend engineer",prepJobText:"Job description",prepJobHint:"Paste the job description",prepJobTitle:"{role} job description",prepJobUrlHint:"Link to a public job posting",prepUseLink:"Use a posting link instead",prepUsePaste:"Paste the text instead",prepReadLink:"Read the link",prepConfirmNext:"Confirm and continue",prepContinue:"Continue",prepConfirmThis:"Confirm this one",prepReplace:"Use a different one",prepReviewNote:"This is the extracted text. Check names, dates and numbers, then confirm.",prepConfirmed:"Confirmed. This interview will use it.",prepDrop:"Drop a PDF, Word file or image here, or click to choose a file",prepPasteResume:"Paste your resume text instead",prepUseFile:"Import a file instead",prepResumeHint:"Paste your resume",prepExisting:"Use a saved resume",prepBackJob:"Back to the job description",prepBackResume:"Back to the resume",prepJobMissing:"No job description yet.",prepMissing:"Not added yet",prepUnconfirmed:"Not confirmed yet",prepNotReady:"Add the job description and your resume to start.",prepStart:"Start the interview",prepCount:"{number} questions",prepVoiceSetup:"Voice interviews need an audio service first. Set it up, then check again here.",prepRecheck:"Check again",prepScoreStep:"Resume score",prepFitTitle:"Against the job",prepFitNote:"Skills, experience and stated requirements: how much matches.",prepResumeTitle:"The resume itself",prepResumeNote:"Evidence, clarity, structure and specificity.",prepScoreOf:"Resume score {score}",prepScoreIdle:"Both are confirmed. Score the resume to see how far it is from 80.",prepScoreRun:"Score the resume",prepScoreWait:"Add the job description and your resume first.",prepScoring:"Reading your resume against the job.",prepScorePass:"{score}. Ready to start.",prepScoreBelow:"{score}, {gap} short of 80.",prepScoreUnknown:"Some items could not be judged from the material, so there is no total.",prepScoreWeights:"Job 65% \xB7 Resume 35%",prepScoreDelta:"{delta} from the last version",prepRevise:"Revise from the suggestions",prepEditSelf:"Edit it myself",prepSkipScore:"Skip and interview now",prepReviseAgain:"Revise again",prepRescore:"Score again",prepRevising:"Rewriting passage by passage. Only wording and order change; nothing the resume does not say is added.",prepReviseNote:"Only wording and order change; no facts or numbers the resume does not contain. Untick what you do not want. Accepted changes become a new version, which is scored again.",prepReviseApply:"Use {count} selected changes and score again",prepReviseDrop:"Not now",prepEditNote:"Edit the text directly. Saving creates a new version and scores it again.",prepEditSave:"Save and score again",prepReviseRule:"Revise the resume following these suggestions so it fits the job better and reads more concretely. Change only wording, order and format. Add no facts, numbers, skills or experience the resume does not contain.",prepUnknownCrit:"Not judged",prepGateBelow:"Resume score {score}. Reach 80 before starting.",prepGateNone:"Check the resume score before starting.",prepGateBack:"Back to the score",prepSkipped:"Score skipped",prepFailModel:"No text model is available. Choose one in DSH and score again, or skip for now.",prepFailTimeout:"The model did not answer in time. Try again.",prepFailRewrite:"No usable revision this time: a change added something the resume does not say, or there was nothing to change. Try again, or edit it yourself.",prepFailGeneric:"This step did not finish. Try again.",prepFailBusy:"The last scoring run has not finished yet. Wait for it.",prepFailEvidence:"The model cited text that is not in your material, so the result was not used. Scoring again usually works.",prepFailFormat:"The model did not answer in the required format. Try again.",prepFailCode:" (code {code})",crit_fit_skills:"Job skills",crit_fit_experience:"Relevant experience",crit_fit_requirements:"Stated requirements",crit_resume_evidence:"Evidence of results",crit_resume_clarity:"Clarity",crit_resume_structure:"Structure",crit_resume_specificity:"Specificity",realtimeTranscriptHere:"The interviewer's words appear here.",interviewWaiting:"Preparing the question"};var Ki={navLabel:"\u804C\u955C\u9875\u9762",navInterview:"\u9762\u8BD5",navReview:"\u590D\u76D8",navLibrary:"\u8D44\u6599",voiceChipNone:"\u8BED\u97F3\u672A\u63A5\u5165",voiceChipReady:"\u8BED\u97F3\u5DF2\u63A5\u5165",voiceChipChecking:"\u6B63\u5728\u68C0\u67E5\u8BED\u97F3",voiceChipTitle:"\u8BED\u97F3\u9762\u8BD5\u7528\u7684\u97F3\u9891\u670D\u52A1\uFF0C\u70B9\u5F00\u8BBE\u7F6E",openSettings:"\u8BBE\u7F6E",assistantToggle:"\u52A9\u624B",assistantSame:"\u548C DSH \u91CC\u662F\u540C\u4E00\u4E2A\u5BF9\u8BDD",assistantPick:"\u9009\u62E9\u5BF9\u8BDD",roomBack:"\u8FD4\u56DE",roomBackTitle:"\u79BB\u5F00\u9762\u8BD5\u95F4\u3002\u6CA1\u7ED3\u675F\u7684\u9762\u8BD5\u53EF\u4EE5\u5728\u300C\u590D\u76D8\u300D\u91CC\u7EE7\u7EED\u3002",deskThisOne:"\u8FD9\u4E00\u573A",deskRowJob:"\u5C97\u4F4D\u8981\u6C42",deskRowResume:"\u7B80\u5386",deskRowScore:"\u7B80\u5386\u8BC4\u5206",deskRowVoice:"\u8BED\u97F3",deskConfirmedShort:"\u5DF2\u786E\u8BA4",deskAdd:"\u653E\u8FDB\u6765",deskView:"\u770B\u770B",deskConfirmIt:"\u53BB\u786E\u8BA4",deskScoreIt:"\u8BC4\u5206",deskRevise:"\u6539\u4E00\u7248",deskConnect:"\u53BB\u63A5\u5165",deskSettingsShort:"\u8BBE\u7F6E",deskScoreNone:"\u8FD8\u6CA1\u8BC4\u5206",deskScoreWait:"\u5148\u653E\u597D\u5C97\u4F4D\u8981\u6C42\u548C\u7B80\u5386",deskScoring:"\u6B63\u5728\u8BC4\u5206\u2026",deskScorePass:"{score} \u5206 \xB7 \u5DF2\u8FC7 80",deskScoreBelow:"{score} \u5206 \xB7 \u79BB 80 \u8FD8\u5DEE {gap} \u5206",deskScoreSkipped:"{score} \u5206 \xB7 \u5DF2\u8DF3\u8FC7",deskScoreUnknown:"\u8D44\u6599\u4E0D\u591F\uFF0C\u6CA1\u6709\u603B\u5206",deskVoiceText:"\u8FD9\u4E00\u573A\u7528\u6587\u5B57\u9762\u8BD5\uFF0C\u4E0D\u9700\u8981",deskVoiceReady:"\u5DF2\u63A5\u5165\u767E\u70BC\u5B9E\u65F6\u8BED\u97F3",deskVoiceNone:"\u8FD8\u6CA1\u63A5\u5165\u767E\u70BC\u5B9E\u65F6\u8BED\u97F3",deskVoiceChecking:"\u6B63\u5728\u68C0\u67E5\u2026",deskStartLabel:"\u5F00\u59CB",deskStartSub:"{count} \u9898 \xB7 {mode} \xB7 {language}",deskModeVoice:"\u8BED\u97F3",deskModeText:"\u6587\u5B57",deskHeadJob:"\u5148\u653E\u5C97\u4F4D\u8981\u6C42\u3002",deskHeadResume:"\u518D\u653E\u4F60\u7684\u7B80\u5386\u3002",deskHeadScore:"\u8FD8\u5DEE\u4E00\u6B65\uFF1A\u7B80\u5386\u8BC4\u5206\u3002",deskHeadVoice:"\u8FD8\u5DEE\u4E00\u6B65\uFF1A\u63A5\u5165\u8BED\u97F3\u3002",deskHeadWorkspace:"\u8FD8\u5DEE\u4E00\u6B65\uFF1A\u9009\u4E00\u4E2A\u5DE5\u4F5C\u533A\u3002",deskHeadReady:"\u53EF\u4EE5\u5F00\u59CB\u4E86\u3002",deskBlockedPrep:"\u5148\u653E\u597D\u5C97\u4F4D\u8981\u6C42\u548C\u7B80\u5386\u3002",deskBlockedVoice:"\u8BED\u97F3\u8FD8\u6CA1\u63A5\u5165\u3002\u586B\u597D\u767E\u70BC\u7684\u4E1A\u52A1\u7A7A\u95F4 ID \u548C API Key \u5C31\u80FD\u5F00\u59CB\u3002",deskUseText:"\u6539\u7528\u6587\u5B57\u9762\u8BD5",deskBlockedWorkspace:"\u8FD8\u6CA1\u9009 DSH \u5DE5\u4F5C\u533A\uFF0C\u9762\u8BD5\u5BF9\u8BDD\u4F1A\u5B58\u5728\u90A3\u91CC\u3002",deskOpenSettings:"\u6253\u5F00\u8BBE\u7F6E",deskSwitchRole:"\u6362\u4E00\u4E2A\u5C97\u4F4D",deskPickRole:"\u7528\u5DF2\u6709\u5C97\u4F4D",deskNewRole:"\u65B0\u5C97\u4F4D",deskScoreDrawer:"\u7B80\u5386\u8BC4\u5206",deskUnfinished:"{date} \u90A3\u573A\u9762\u8BD5\u8FD8\u6CA1\u7ED3\u675F\uFF0C\u53EF\u4EE5\u63A5\u7740\u9762\u3002",reviewTitleNone:"\u8FD8\u6CA1\u6709\u9762\u8BD5\u8BB0\u5F55\u3002",reviewLeadNone:"\u9762\u5B8C\u4E00\u573A\uFF0C\u62A5\u544A\u548C\u5206\u6570\u4F1A\u51FA\u73B0\u5728\u8FD9\u91CC\u3002",reviewTitle:"{count} \u573A\uFF0C\u6700\u8FD1\u4E00\u573A {score} \u5206\u3002",reviewTitleNoScore:"{count} \u573A\u9762\u8BD5\u3002",reviewLead:"\u62A5\u544A\u53EA\u7528\u4F60\u6838\u5BF9\u8FC7\u7684\u56DE\u7B54\u3002",reviewInterviews:"\u9762\u8BD5",reviewActive:"\u8FDB\u884C\u4E2D",reviewDone:"\u5DF2\u7ED3\u675F",reviewContinue:"\u7EE7\u7EED",reviewOpenReport:"\u770B\u62A5\u544A",reviewResumeWork:"\u7B80\u5386\u8BC4\u5206\u4E0E\u4FEE\u6539",reviewBack:"\u8FD4\u56DE\u590D\u76D8",reviewNoReport:"\u8FD8\u6CA1\u6709\u62A5\u544A",libraryTitle:"\u4F60\u7684\u7B80\u5386\u548C\u60F3\u9762\u7684\u5C97\u4F4D\u3002",libraryLead:"\u6BCF\u6B21\u4FEE\u6539\u90FD\u5B58\u6210\u65B0\u7248\u672C\uFF0C\u65E7\u7248\u672C\u548C\u65E7\u62A5\u544A\u4E0D\u52A8\u3002",libraryAddJob:"\u6DFB\u52A0\u5C97\u4F4D\u8981\u6C42",libraryAddResume:"\u6DFB\u52A0\u7B80\u5386",libraryResumes:"\u7B80\u5386",libraryJobs:"\u5C97\u4F4D\u8981\u6C42",libraryOther:"\u5176\u4ED6\u8D44\u6599",libraryRoles:"\u5C97\u4F4D",libraryVersions:"{count} \u4E2A\u7248\u672C",libraryEmpty:"\u8FD8\u6CA1\u6709",libraryBack:"\u8FD4\u56DE\u8D44\u6599",libraryUseRole:"\u7528\u8FD9\u4E2A\u5C97\u4F4D\u51C6\u5907\u9762\u8BD5",setTitle:"\u8BBE\u7F6E",setVoice:"\u8BED\u97F3\u9762\u8BD5",setVoiceVendor:"\u963F\u91CC\u4E91\u767E\u70BC \xB7 \u5B9E\u65F6\u8BED\u97F3",setRegion:"\u5730\u57DF",setRegionNote:"\u548C API Key \u6240\u5728\u7684\u5730\u57DF\u4E00\u81F4\u3002",setWorkspace:"\u4E1A\u52A1\u7A7A\u95F4 ID",setWorkspaceHint:"\u5728\u767E\u70BC\u63A7\u5236\u53F0\u7684\u4E1A\u52A1\u7A7A\u95F4\u8BE6\u60C5\u91CC\u590D\u5236",setWorkspaceNote:"\u767E\u70BC\u63A7\u5236\u53F0\u5DE6\u4E0A\u89D2 \u2192 \u4E1A\u52A1\u7A7A\u95F4\u8BE6\u60C5\u3002\u5B9E\u65F6\u8BED\u97F3\u7684\u8FDE\u63A5\u5730\u5740\u91CC\u5FC5\u987B\u5E26\u5B83\uFF0C\u53EA\u586B Key \u63A5\u4E0D\u901A\u3002",setKey:"API Key",setKeyNote:"\u53EA\u5B58\u8FDB\u8FD9\u53F0\u7535\u8111\u7684 DSH \u51ED\u636E\uFF0C\u4FDD\u5B58\u540E\u4E0D\u518D\u663E\u793A\uFF0C\u4E5F\u4E0D\u4F1A\u8FDB\u5B89\u88C5\u5305\u3002",setKeySaved:"\u5DF2\u4FDD\u5B58\uFF0C\u4E0D\u518D\u663E\u793A\uFF1B\u8981\u6362\u5C31\u91CD\u65B0\u7C98\u8D34",setKeyEmpty:"sk-\u2026",setAdvanced:"\u9AD8\u7EA7\u9009\u9879\uFF1A\u6362\u6A21\u578B",setAdvancedHide:"\u6536\u8D77\u9AD8\u7EA7\u9009\u9879",setModelDefault:"\u9ED8\u8BA4",setModelFast:"\u66F4\u5FEB\u66F4\u7701",setModelNew:"\u767E\u70BC\u5F53\u524D\u63A8\u8350",setTest:"\u6D4B\u8BD5\u8FDE\u63A5",setTesting:"\u6B63\u5728\u6D4B\u8BD5\u2026",setTestNote:"\u7528\u4E00\u53E5\u56FA\u5B9A\u77ED\u53E5\u8BD5\u4E00\u6B21\uFF1A\u4E0D\u5F00\u9EA6\u514B\u98CE\uFF0C\u53EF\u80FD\u4EA7\u751F\u5C11\u91CF\u8D39\u7528\u3002",setPlay:"\u8BD5\u542C",setStop:"\u505C\u6B62",setStatusOk:"\u5DF2\u63A5\u5165",setStatusNone:"\u672A\u63A5\u5165",setDictationNote:"\u7528 DSH \u5B98\u65B9\u542C\u5199\u628A\u4F60\u8BF4\u7684\u8BDD\u8F6C\u6210\u6587\u5B57\uFF0C\u6838\u5BF9\u540E\u518D\u53D1\u51FA\u3002\u548C\u4E0A\u9762\u7684\u5B9E\u65F6\u8BED\u97F3\u662F\u4E24\u56DE\u4E8B\u3002",setWorkspaceDsh:"\u5BF9\u8BDD\u4FDD\u5B58\u5728 DSH \u7684\u54EA\u4E2A\u5DE5\u4F5C\u533A",setWorkspaceAuto:"\u53EA\u6709\u8FD9\u4E00\u4E2A\uFF0C\u5DF2\u81EA\u52A8\u9009\u4E0A\u3002",setNeedWorkspace:"\u5148\u586B\u4E1A\u52A1\u7A7A\u95F4 ID\u3002",setNeedKey:"\u8FD8\u6CA1\u586B API Key\u3002",setKeyBadPrefix:"\u8FD9\u4E32\u4E0D\u50CF\u767E\u70BC\u7684 API Key\uFF1A\u767E\u70BC\u7684 Key \u4EE5 sk- \u5F00\u5934\u3002",setSaved:"\u8BBE\u7F6E\u5DF2\u4FDD\u5B58\u3002"},Gi={navLabel:"Zhijing pages",navInterview:"Interview",navReview:"Review",navLibrary:"Library",voiceChipNone:"Voice not set up",voiceChipReady:"Voice ready",voiceChipChecking:"Checking voice",voiceChipTitle:"Audio service for voice interviews. Open settings.",openSettings:"Settings",assistantToggle:"Assistant",assistantSame:"Same conversation as in DSH",assistantPick:"Choose a conversation",roomBack:"Back",roomBackTitle:"Leave the interview room. An unfinished interview can be continued from Review.",deskThisOne:"This interview",deskRowJob:"Job description",deskRowResume:"Resume",deskRowScore:"Resume score",deskRowVoice:"Voice",deskConfirmedShort:"Confirmed",deskAdd:"Add",deskView:"View",deskConfirmIt:"Confirm",deskScoreIt:"Score",deskRevise:"Revise",deskConnect:"Set up",deskSettingsShort:"Settings",deskScoreNone:"Not scored yet",deskScoreWait:"Add the job description and resume first",deskScoring:"Scoring\u2026",deskScorePass:"{score} \xB7 passed 80",deskScoreBelow:"{score} \xB7 {gap} short of 80",deskScoreSkipped:"{score} \xB7 skipped",deskScoreUnknown:"Not enough to give a total",deskVoiceText:"Not needed for a text interview",deskVoiceReady:"Model Studio realtime voice is set up",deskVoiceNone:"Model Studio realtime voice is not set up",deskVoiceChecking:"Checking\u2026",deskStartLabel:"Start",deskStartSub:"{count} questions \xB7 {mode} \xB7 {language}",deskModeVoice:"voice",deskModeText:"text",deskHeadJob:"Start with the job description.",deskHeadResume:"Now add your resume.",deskHeadScore:"One step left: the resume score.",deskHeadVoice:"One step left: set up voice.",deskHeadWorkspace:"One step left: choose a workspace.",deskHeadReady:"Ready to start.",deskBlockedPrep:"Add the job description and your resume first.",deskBlockedVoice:"Voice is not set up. Add your Model Studio workspace ID and API key to start.",deskUseText:"Use a text interview",deskBlockedWorkspace:"No DSH workspace chosen. The interview conversation is saved there.",deskOpenSettings:"Open settings",deskSwitchRole:"Switch role",deskPickRole:"Use a saved role",deskNewRole:"New role",deskScoreDrawer:"Resume score",deskUnfinished:"The interview from {date} is not finished. You can pick it up.",reviewTitleNone:"No interviews yet.",reviewLeadNone:"Reports and scores appear here after your first interview.",reviewTitle:"{count} interviews, latest {score}.",reviewTitleNoScore:"{count} interviews.",reviewLead:"Reports use only the answers you confirmed.",reviewInterviews:"Interviews",reviewActive:"In progress",reviewDone:"Finished",reviewContinue:"Continue",reviewOpenReport:"Open report",reviewResumeWork:"Resume scores and revisions",reviewBack:"Back to Review",reviewNoReport:"No report yet",libraryTitle:"Your resumes and the roles you want.",libraryLead:"Every edit becomes a new version; older versions and reports stay as they were.",libraryAddJob:"Add a job description",libraryAddResume:"Add a resume",libraryResumes:"Resumes",libraryJobs:"Job descriptions",libraryOther:"Other material",libraryRoles:"Roles",libraryVersions:"{count} versions",libraryEmpty:"None yet",libraryBack:"Back to Library",libraryUseRole:"Prepare an interview for this role",setTitle:"Settings",setVoice:"Voice interviews",setVoiceVendor:"Alibaba Cloud Model Studio \xB7 Realtime",setRegion:"Region",setRegionNote:"Must match the region of your API key.",setWorkspace:"Workspace ID",setWorkspaceHint:"Copy it from the workspace details in Model Studio",setWorkspaceNote:"Model Studio console, top left \u2192 workspace details. The realtime address needs it; a key alone will not connect.",setKey:"API key",setKeyNote:"Stored only in DSH credentials on this computer. It is not shown again and never goes into the package.",setKeySaved:"Saved and hidden. Paste a new one to replace it.",setKeyEmpty:"sk-\u2026",setAdvanced:"Advanced: change model",setAdvancedHide:"Hide advanced options",setModelDefault:"Default",setModelFast:"Faster, cheaper",setModelNew:"Recommended by Model Studio",setTest:"Test connection",setTesting:"Testing\u2026",setTestNote:"Sends one fixed sentence. The microphone stays off; it may cost a little.",setPlay:"Play",setStop:"Stop",setStatusOk:"Set up",setStatusNone:"Not set up",setDictationNote:"Uses official DSH dictation to turn speech into text you check before sending. Separate from realtime voice above.",setWorkspaceDsh:"DSH workspace for conversations",setWorkspaceAuto:"The only one, chosen automatically.",setNeedWorkspace:"Enter the workspace ID first.",setNeedKey:"Enter the API key first.",setKeyBadPrefix:"This does not look like a Model Studio API key; those start with sk-.",setSaved:"Settings saved."};var Ji={navHome:"\u9996\u9875",homeHowLabel:"\u4E00\u573A\u9762\u8BD5\u600E\u4E48\u8D70",homeStartFirst:"\u51C6\u5907\u7B2C\u4E00\u573A\u9762\u8BD5",homeSetupVoice:"\u5148\u63A5\u5165\u8BED\u97F3",homeStep1Title:"\u653E\u5C97\u4F4D\u548C\u7B80\u5386",homeStep1Text:"PDF\u3001Word\u3001\u56FE\u7247\u6216\u76F4\u63A5\u7C98\u8D34\uFF0C\u8BC6\u522B\u51FA\u7684\u6B63\u6587\u4F60\u6838\u5BF9\u4E00\u904D\u3002",homeStep2Title:"\u7B80\u5386\u8BC4\u5230 80 \u5206",homeStep2Text:"\u5BF9\u7167\u5C97\u4F4D\u5360 65%\uFF0C\u7B80\u5386\u672C\u8EAB\u5360 35%\u3002\u4E0D\u5230 80\uFF0C\u53EF\u4EE5\u6309\u5EFA\u8BAE\u6539\u4E00\u7248\u3002",homeStep3Title:"\u9762\u4E00\u573A",homeStep3Text:"\u9ED8\u8BA4\u8BED\u97F3\u30015 \u9898\uFF0C\u95EE\u9898\u6765\u81EA\u4F60\u7684\u7B80\u5386\u548C\u8FD9\u4E2A\u5C97\u4F4D\u3002",homeStep4Title:"\u770B\u590D\u76D8",homeStep4Text:"\u62A5\u544A\u53EA\u7528\u4F60\u6838\u5BF9\u8FC7\u7684\u56DE\u7B54\uFF0C\u53EF\u4EE5\u5BFC\u51FA PDF\u3002",homeNextLabel:"\u4E0B\u4E00\u573A",homeNextUntitled:"\u9009\u4E00\u4E2A\u60F3\u9762\u7684\u5C97\u4F4D",homeContinue:"\u7EE7\u7EED\u51C6\u5907",homeGoStart:"\u53BB\u5F00\u59CB",homeSwitchRole:"\u6362\u4E2A\u5C97\u4F4D",homeStatInterviews:"\u9762\u8BD5",homeStatCount:"{count} \u573A",homeStatDone:"{done} \u573A\u5DF2\u7ED3\u675F",homeStatNoneYet:"\u8FD8\u6CA1\u9762\u8FC7",homeStatLatest:"\u6700\u8FD1\u4E00\u573A",homeStatLatestSub:"{date} \xB7 {role}",homeStatNoReport:"\u9762\u5B8C\u4E00\u573A\u5C31\u6709\u5206\u6570",homeStatScore:"\u7B80\u5386\u5206",homeStatScoreNone:"\u8FD8\u6CA1\u8BC4\u5206",homeScorePass:"\u5DF2\u8FC7 80\uFF0C\u53EF\u4EE5\u9762\u4E86",homeScoreGap:"\u79BB 80 \u8FD8\u5DEE {gap} \u5206",homeRecent:"\u6700\u8FD1\u7684\u9762\u8BD5",homeAllReview:"\u5168\u90E8\u590D\u76D8",homeRoles:"\u4F60\u7684\u5C97\u4F4D",homeAllLibrary:"\u5168\u90E8\u8D44\u6599",homeRolePrepare:"\u51C6\u5907\u8FD9\u4E00\u573A",homeRoleCurrent:"\u6B63\u5728\u51C6\u5907",homeRoleInterviews:"\u9762\u8FC7 {count} \u573A",homeRoleNever:"\u8FD8\u6CA1\u9762\u8FC7",homeRoleScore:"\u7B80\u5386 {score} \u5206",homeTrend:"\u6700\u8FD1 {count} \u573A\u7684\u5206\u6570",homeVoiceTitle:"\u8BED\u97F3\u9762\u8BD5",homeVoiceReady:"\u767E\u70BC\u5B9E\u65F6\u8BED\u97F3\u5DF2\u63A5\u5165\u3002",homeVoiceNone:"\u8981\u7528\u8BED\u97F3\u9762\uFF0C\u5148\u5728\u8BBE\u7F6E\u91CC\u586B\u767E\u70BC\u7684\u4E1A\u52A1\u7A7A\u95F4 ID \u548C API Key\u3002\u4E5F\u53EF\u4EE5\u5148\u7528\u6587\u5B57\u9762\u3002"},Yi={navHome:"Home",homeHowLabel:"How an interview goes",homeStartFirst:"Prepare your first interview",homeSetupVoice:"Set up voice first",homeStep1Title:"Add the job and your resume",homeStep1Text:"PDF, Word, an image or pasted text. You check the text that was read.",homeStep2Title:"Score the resume to 80",homeStep2Text:"The job match counts 65%, the resume itself 35%. Below 80, revise it with the suggestions.",homeStep3Title:"Interview",homeStep3Text:"Voice and 5 questions by default, drawn from your resume and this job.",homeStep4Title:"Review",homeStep4Text:"Reports use only the answers you confirmed, and export to PDF.",homeNextLabel:"Next interview",homeNextUntitled:"Pick a role to interview for",homeContinue:"Continue preparing",homeGoStart:"Go to start",homeSwitchRole:"Switch role",homeStatInterviews:"Interviews",homeStatCount:"{count}",homeStatDone:"{done} finished",homeStatNoneYet:"None yet",homeStatLatest:"Latest",homeStatLatestSub:"{date} \xB7 {role}",homeStatNoReport:"A score appears after an interview",homeStatScore:"Resume score",homeStatScoreNone:"Not scored yet",homeScorePass:"Passed 80, ready to interview",homeScoreGap:"{gap} short of 80",homeRecent:"Recent interviews",homeAllReview:"All of Review",homeRoles:"Your roles",homeAllLibrary:"All of Library",homeRolePrepare:"Prepare this one",homeRoleCurrent:"Preparing",homeRoleInterviews:"{count} interviews",homeRoleNever:"Not interviewed yet",homeRoleScore:"resume {score}",homeTrend:"Scores of the last {count} interviews",homeVoiceTitle:"Voice interviews",homeVoiceReady:"Model Studio realtime voice is set up.",homeVoiceNone:"For voice, add your Model Studio workspace ID and API key in Settings. A text interview works without it."};var Qi={...Hi,...Wi,...Ki,...Ji,assistant:"\u6C42\u804C\u52A9\u624B",showAssistant:"\u6253\u5F00\u52A9\u624B",hideAssistant:"\u6536\u8D77\u52A9\u624B",expandChat:"\u5C55\u5F00\u5BF9\u8BDD",backToWorkbench:"\u8FD4\u56DE\u5DE5\u4F5C\u53F0",assistantEmpty:"\u65B0\u5EFA\u6216\u9009\u62E9\u4E00\u4E2A\u5BF9\u8BDD\uFF0C\u5C31\u53EF\u4EE5\u4E00\u8FB9\u67E5\u770B\u8D44\u6599\uFF0C\u4E00\u8FB9\u548C\u52A9\u624B\u8BA8\u8BBA\u3002",askAboutMaterial:"\u4EA4\u7ED9\u52A9\u624B\u8BA8\u8BBA",choosePassage:"\u9009\u62E9\u4E00\u6BB5\u539F\u6587",choosePassageNote:"\u9009\u4E2D\u6587\u5B57\u540E\u4EA4\u7ED9\u52A9\u624B\uFF0C\u539F\u6587\u4E0D\u4F1A\u88AB\u4FEE\u6539\u3002",askAboutPassage:"\u8BA8\u8BBA\u9009\u4E2D\u6587\u5B57",selectedContext:"\u51C6\u5907\u5F15\u7528\u7684\u8D44\u6599",cancelContext:"\u53D6\u6D88\u5F15\u7528",previewContext:"\u67E5\u770B\u5F15\u7528\u6B63\u6587",addToChatDraft:"\u52A0\u5165\u5BF9\u8BDD\u8349\u7A3F",contextPreviewNote:"\u8FD9\u91CC\u53EA\u51C6\u5907\u5F15\u7528\u3002\u52A0\u5165\u8349\u7A3F\u540E\u4ECD\u53EF\u4FEE\u6539\uFF0C\u70B9\u51FB DSH \u53D1\u9001\u6309\u94AE\u540E\u624D\u4F1A\u53D1\u9001\u7ED9\u6A21\u578B\u3002",contextAdded:"\u5DF2\u52A0\u5165\u5F53\u524D DSH \u5BF9\u8BDD\u8349\u7A3F\uFF0C\u539F\u6709\u8349\u7A3F\u5DF2\u4FDD\u7559\u3002\u8BF7\u68C0\u67E5\u540E\u53D1\u9001\u3002",contextUnavailable:"\u8BF7\u5148\u9009\u62E9\u5DF2\u786E\u8BA4\u7684\u8D44\u6599\u7248\u672C\uFF0C\u5E76\u4F7F\u7528\u666E\u901A\u6C42\u804C\u5BF9\u8BDD\u3002",contextDraftText:`\u8BF7\u7ED3\u5408\u8FD9\u4EFD\u8D44\u6599\u8BA8\u8BBA\uFF0C\u4EE5\u4E0B\u5185\u5BB9\u662F\u8D44\u6599\u539F\u6587\u3002
\u8D44\u6599\uFF1A{title} \xB7 {version}
\u7248\u672C ID\uFF1A{versionId}

{text}`,error_NATIVE_DRAFT_UNAVAILABLE:"\u5F53\u524D DSH \u6682\u4E0D\u63D0\u4F9B\u5BF9\u8BDD\u8349\u7A3F\u63A5\u53E3\uFF0C\u8BF7\u66F4\u65B0\u6216\u91CD\u65B0\u542F\u7528\u63D2\u4EF6\u540E\u91CD\u8BD5\u3002",error_NATIVE_DRAFT_BLOCKED:"\u5F53\u524D\u5BF9\u8BDD\u6B63\u5728\u63D0\u4EA4\uFF0C\u8BF7\u7A0D\u540E\u518D\u52A0\u5165\u8349\u7A3F\u3002\u5F15\u7528\u4ECD\u5DF2\u4FDD\u7559\u3002",error_CONTEXT_UNAVAILABLE:"\u8BF7\u4F7F\u7528\u5DF2\u786E\u8BA4\u7684\u8D44\u6599\u7248\u672C\uFF0C\u5E76\u65B0\u5EFA\u6216\u9009\u62E9\u666E\u901A\u6C42\u804C\u5BF9\u8BDD\u3002",rtSettingsNote:"\u6587\u5B57\u5206\u6790\u7EE7\u7EED\u4F7F\u7528 DSH \u5DF2\u914D\u7F6E\u7684\u6A21\u578B\u3002\u8FD9\u91CC\u53EA\u8BBE\u7F6E\u4E13\u7528\u5B9E\u65F6\u97F3\u9891\u670D\u52A1\u3002",rtSettingsPrivacy:"\u901A\u8BDD\u65F6\u4F1A\u5411\u6240\u9009\u533A\u57DF\u7684\u963F\u91CC\u4E91\u767E\u70BC\u53D1\u9001\u97F3\u9891\u548C\u672C\u6B21\u9762\u8BD5\u8D44\u6599\uFF0C\u53EF\u80FD\u4EA7\u751F\u670D\u52A1\u8D39\u7528\u3002",rtSettingsUnavailable:"\u5F53\u524D\u5BBF\u4E3B\u672A\u63D0\u4F9B\u53EF\u7528\u7684\u8BED\u97F3\u914D\u7F6E\uFF0C\u8BF7\u786E\u8BA4\u63D2\u4EF6\u5DF2\u542F\u7528\u540E\u91CD\u8BD5\u3002",rtSettingsEnabled:"\u5B9E\u65F6\u8BED\u97F3\u9762\u8BD5",rtSettingsOn:"\u542F\u7528",rtSettingsOff:"\u505C\u7528",rtSettingsRegion:"\u97F3\u9891\u670D\u52A1\u5730\u57DF",rtSettingsBeijing:"\u4E2D\u56FD\u5185\u5730\uFF08\u5317\u4EAC\uFF09",rtSettingsSingapore:"\u56FD\u9645\uFF08\u65B0\u52A0\u5761\uFF09",rtSettingsWorkspace:"\u767E\u70BC\u4E1A\u52A1\u7A7A\u95F4 ID",rtSettingsWorkspaceHint:"\u586B\u5199\u97F3\u9891\u670D\u52A1\u5BF9\u5E94\u7684\u4E1A\u52A1\u7A7A\u95F4 ID",rtSettingsModel:"\u5B9E\u65F6\u97F3\u9891\u6A21\u578B",rtSettingsAdvanced:"\u9AD8\u7EA7\u9009\u9879",rtSettingsCredentialRef:"DSH \u97F3\u9891\u51ED\u636E\u540D\u79F0",rtSettingsSave:"\u4FDD\u5B58\u8BED\u97F3\u8BBE\u7F6E",rtSettingsDiscard:"\u6062\u590D\u5DF2\u4FDD\u5B58\u8BBE\u7F6E",rtSettingsSaved:"\u8BED\u97F3\u8BBE\u7F6E\u5DF2\u4FDD\u5B58\u3002",rtSettingsInvalid:"\u8BF7\u68C0\u67E5\u5730\u57DF\u3001\u4E1A\u52A1\u7A7A\u95F4 ID\u3001\u6A21\u578B\u548C\u51ED\u636E\u540D\u79F0\u3002",rtSettingsReadonly:"\u5F53\u524D DSH \u914D\u7F6E\u53EA\u8BFB\uFF0C\u4E0D\u80FD\u4FDD\u5B58\u4FEE\u6539\u3002",rtSettingsConflict:"\u8BBE\u7F6E\u672A\u4FDD\u5B58\uFF0C\u5BBF\u4E3B\u914D\u7F6E\u53EF\u80FD\u5DF2\u53D8\u5316\u3002\u8BF7\u6062\u590D\u5DF2\u4FDD\u5B58\u8BBE\u7F6E\u540E\u91CD\u8BD5\u3002",rtSettingsFailed:"\u8BED\u97F3\u8BBE\u7F6E\u672A\u4FDD\u5B58\uFF0C\u8BF7\u68C0\u67E5 DSH \u8FDE\u63A5\u540E\u91CD\u8BD5\u3002",rtCredentialTitle:"\u4E13\u7528\u97F3\u9891\u51ED\u636E",rtCredentialNote:"\u53EA\u586B\u5199\u6240\u9009\u767E\u70BC\u97F3\u9891\u670D\u52A1\u7684 API Key\u3002\u5BC6\u94A5\u4FDD\u5B58\u5230 DSH \u5B98\u65B9\u51ED\u636E\u4E2D\uFF0C\u4E0D\u663E\u793A\u5DF2\u6709\u5BC6\u94A5\u3002",rtCredentialKey:"\u97F3\u9891\u670D\u52A1 API Key",rtCredentialSave:"\u4FDD\u5B58\u97F3\u9891\u51ED\u636E",rtCredentialSaved:"\u97F3\u9891\u51ED\u636E\u5DF2\u4FDD\u5B58\u5230 DSH\u3002",rtCredentialConfigured:"DSH \u4E2D\u5DF2\u6709\u8BE5\u97F3\u9891\u51ED\u636E\u3002",rtCredentialMissing:"DSH \u4E2D\u5C1A\u672A\u914D\u7F6E\u8BE5\u97F3\u9891\u51ED\u636E\u3002",rtCredentialSaveSettingsFirst:"\u51ED\u636E\u540D\u79F0\u5DF2\u4FEE\u6539\uFF0C\u8BF7\u5148\u4FDD\u5B58\u8BED\u97F3\u8BBE\u7F6E\uFF0C\u518D\u586B\u5199\u5BF9\u5E94\u5BC6\u94A5\u3002",rtCredentialInvalid:"\u8BF7\u5148\u4FDD\u5B58\u6709\u6548\u7684\u8BED\u97F3\u8BBE\u7F6E\uFF0C\u5E76\u586B\u5199\u97F3\u9891\u670D\u52A1\u5BC6\u94A5\u3002",rtCredentialReadonly:"\u5F53\u524D\u51ED\u636E\u7531\u5BBF\u4E3B\u7BA1\u7406\uFF0C\u4E0D\u80FD\u5728\u6B64\u4FEE\u6539\u3002",rtCredentialFailed:"\u65E0\u6CD5\u786E\u8BA4\u6216\u4FDD\u5B58\u97F3\u9891\u51ED\u636E\uFF0C\u8BF7\u68C0\u67E5 DSH \u8FDE\u63A5\u548C\u6743\u9650\u540E\u91CD\u8BD5\u3002",rtCredentialUntested:"\u4FDD\u5B58\u51ED\u636E\u540E\uFF0C\u53EF\u4EE5\u6D4B\u8BD5\u97F3\u9891 API \u662F\u5426\u8FDE\u63A5\u5E76\u8FD4\u56DE\u8BED\u97F3\u3002",rtProbeTest:"\u6D4B\u8BD5\u97F3\u9891 API",rtProbeRunning:"\u6B63\u5728\u6D4B\u8BD5",rtProbeCancel:"\u53D6\u6D88\u6D4B\u8BD5",rtProbePlay:"\u64AD\u653E\u6D4B\u8BD5\u8BED\u97F3",rtProbeStop:"\u505C\u6B62\u64AD\u653E",rtProbeClear:"\u6E05\u9664\u6D4B\u8BD5\u7ED3\u679C",rtProbeNote:"\u6D4B\u8BD5\u4F1A\u5411\u5DF2\u914D\u7F6E\u7684\u97F3\u9891\u670D\u52A1\u53D1\u9001\u56FA\u5B9A\u77ED\u53E5\uFF0C\u53EF\u80FD\u4EA7\u751F\u5C11\u91CF\u8D39\u7528\u3002\u4E0D\u4F1A\u5F00\u542F\u9EA6\u514B\u98CE\u6216\u53D1\u9001\u4E2A\u4EBA\u8D44\u6599\uFF0C\u4E5F\u4E0D\u4F1A\u81EA\u52A8\u64AD\u653E\u3002",rtProbeSaveFirst:"\u8BF7\u5148\u4FDD\u5B58\u4FEE\u6539\u540E\u7684\u8BED\u97F3\u8BBE\u7F6E\u548C\u97F3\u9891\u51ED\u636E\uFF0C\u518D\u6D4B\u8BD5\u3002",rtProbeEnableFirst:"\u8BF7\u5148\u542F\u7528\u5E76\u4FDD\u5B58\u5B9E\u65F6\u8BED\u97F3\u8BBE\u7F6E\uFF0C\u518D\u6D4B\u8BD5\u3002",rtProbeWaiting:"\u6B63\u5728\u8FDE\u63A5\u97F3\u9891\u670D\u52A1\u5E76\u7B49\u5F85\u6D4B\u8BD5\u8BED\u97F3\uFF0C\u6700\u591A\u7B49\u5F85 30 \u79D2\u3002",rtProbeSuccess:"\u6D4B\u8BD5\u901A\u8FC7\u3002\u8FDE\u63A5\u8017\u65F6 {ready} \u6BEB\u79D2\uFF0C\u9996\u6B21\u8BED\u97F3\u8017\u65F6 {firstAudio} \u6BEB\u79D2\uFF0C\u603B\u8017\u65F6 {total} \u6BEB\u79D2\u3002",rtProbeScope:"\u672C\u6B21\u6D4B\u8BD5\u786E\u8BA4\u63A5\u53E3\u8FDE\u63A5\u5E76\u8FD4\u56DE\u4E86\u8BED\u97F3\u548C\u6587\u5B57\u3002\u9EA6\u514B\u98CE\u8BC6\u522B\u3001\u6253\u65AD\u548C\u6574\u573A\u9762\u8BD5\u6548\u679C\u4ECD\u9700\u5728\u5B9E\u9645\u901A\u8BDD\u4E2D\u9A8C\u8BC1\u3002",rtProbeCancelled:"\u5DF2\u53D6\u6D88\u6D4B\u8BD5\u3002",rtProbeTimeout:"\u6D4B\u8BD5\u8D85\u8FC7\u7B49\u5F85\u65F6\u95F4\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u6216\u97F3\u9891\u670D\u52A1\u540E\u91CD\u8BD5\u3002",rtProbeBusy:"\u53E6\u4E00\u4E2A\u97F3\u9891\u6D4B\u8BD5\u6B63\u5728\u8FDB\u884C\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002",rtProbeConfigure:"\u97F3\u9891\u8BBE\u7F6E\u4E0D\u53EF\u7528\uFF0C\u8BF7\u68C0\u67E5\u5DF2\u4FDD\u5B58\u7684\u5730\u57DF\u3001\u4E1A\u52A1\u7A7A\u95F4\u548C\u6A21\u578B\u3002",rtProbeCredential:"\u97F3\u9891\u51ED\u636E\u4E0D\u53EF\u7528\uFF0C\u8BF7\u5728 DSH \u4E2D\u4FDD\u5B58\u6709\u6548\u7684\u97F3\u9891\u670D\u52A1\u5BC6\u94A5\u3002",rtProbeNoAudio:"\u63A5\u53E3\u672A\u8FD4\u56DE\u53EF\u64AD\u653E\u7684\u8BED\u97F3\uFF0C\u8BF7\u68C0\u67E5\u97F3\u9891\u6A21\u578B\u540E\u91CD\u8BD5\u3002",rtProbeNoTranscript:"\u63A5\u53E3\u672A\u8FD4\u56DE\u6D4B\u8BD5\u8BED\u97F3\u7684\u6587\u5B57\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002",rtProbeFailed:"\u97F3\u9891\u6D4B\u8BD5\u672A\u901A\u8FC7\uFF0C\u8BF7\u68C0\u67E5 DSH \u8FDE\u63A5\u3001\u97F3\u9891\u8BBE\u7F6E\u548C\u670D\u52A1\u6743\u9650\u540E\u91CD\u8BD5\u3002",rtProbePlaybackFailed:"\u6D4B\u8BD5\u8BED\u97F3\u6682\u65F6\u65E0\u6CD5\u64AD\u653E\uFF0C\u8BF7\u68C0\u67E5\u58F0\u97F3\u8BBE\u5907\u540E\u91CD\u8BD5\u3002",rtProbeAuthentication:"\u97F3\u9891\u670D\u52A1\u672A\u63A5\u53D7\u8BE5\u5BC6\u94A5\uFF0C\u8BF7\u68C0\u67E5\u5E76\u91CD\u65B0\u4FDD\u5B58\u97F3\u9891\u51ED\u636E\u3002",rtProbeAccess:"\u97F3\u9891\u670D\u52A1\u62D2\u7EDD\u8BBF\u95EE\uFF0C\u8BF7\u68C0\u67E5\u6A21\u578B\u6743\u9650\u548C\u4E1A\u52A1\u7A7A\u95F4\u3002",rtProbeEndpoint:"\u97F3\u9891\u670D\u52A1\u5730\u5740\u4E0D\u53EF\u7528\uFF0C\u8BF7\u68C0\u67E5\u6240\u9009\u5730\u57DF\u548C\u6A21\u578B\u3002",rtProbeRateLimit:"\u97F3\u9891\u670D\u52A1\u8BF7\u6C42\u8FC7\u591A\u6216\u989D\u5EA6\u4E0D\u8DB3\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u5E76\u68C0\u67E5\u670D\u52A1\u989D\u5EA6\u3002",rtProbeProvider:"\u97F3\u9891\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002",rtProbeNetwork:"\u65E0\u6CD5\u8FDE\u63A5\u97F3\u9891\u670D\u52A1\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u548C DNS \u540E\u91CD\u8BD5\u3002",rtProbeTls:"\u65E0\u6CD5\u9A8C\u8BC1\u97F3\u9891\u670D\u52A1\u7684\u5B89\u5168\u8FDE\u63A5\uFF0C\u8BF7\u68C0\u67E5\u7CFB\u7EDF\u65F6\u95F4\u548C\u7F51\u7EDC\u8BBE\u7F6E\u3002",analysisContext:"\u76EE\u6807\u5C97\u4F4D {goal} \xB7 {material} \xB7 {version}",rewriteSource:"\u9009\u62E9\u539F\u6587\u8BA9\u52A9\u624B\u4FEE\u6539",rewriteSourceHelp:"\u9009\u4E2D\u9700\u8981\u4FEE\u6539\u7684\u6587\u5B57\uFF0C\u518D\u628A\u5B83\u52A0\u5165\u4FEE\u6539\u8981\u6C42\u3002\u751F\u6210\u524D\u4ECD\u53EF\u7F16\u8F91\u8981\u6C42\u3002",rewriteUseSelection:"\u4FEE\u6539\u9009\u4E2D\u6587\u5B57",rewriteSelectionAdded:"\u9009\u4E2D\u539F\u6587\u5DF2\u52A0\u5165\u4FEE\u6539\u8981\u6C42\u3002",rewriteSelectionTooLong:"\u9009\u6BB5\u548C\u4FEE\u6539\u8981\u6C42\u8D85\u8FC7\u957F\u5EA6\u9650\u5236\uFF0C\u8BF7\u7F29\u77ED\u9009\u6BB5\u6216\u6574\u7406\u8981\u6C42\u3002",rewriteSelectionPrompt:`\u8BF7\u91CD\u70B9\u4FEE\u6539{version}\u4E2D\u7684\u4EE5\u4E0B\u539F\u6587\uFF0C\u4FDD\u7559\u5176\u4ED6\u5DF2\u786E\u8BA4\u4E8B\u5B9E\uFF1A
{passage}`,rewriteSavedVersion:"\u5DF2\u4FDD\u5B58\u4E3A{version}",rewriteViewNewVersion:"\u67E5\u770B\u65B0\u7248\u672C",rewriteReturnOriginalVersion:"\u8FD4\u56DE\u4FEE\u6539\u524D\u7248\u672C",rewriteVersionSwitchNote:"\u5207\u6362\u53EA\u6539\u53D8\u5F53\u524D\u67E5\u770B\u7684\u7248\u672C\uFF0C\u5DF2\u4FDD\u5B58\u7248\u672C\u548C\u5386\u53F2\u62A5\u544A\u90FD\u4F1A\u4FDD\u7559\u3002",rewriteSourceVersion:"\u539F\u6587 \xB7 {version}",taskStatus:"\u5F53\u524D\u4EFB\u52A1",cancelTask:"\u53D6\u6D88\u4EFB\u52A1",taskRunning:"\u6B63\u5728\u5904\u7406",taskRefreshing:"\u6B63\u5728\u6838\u5BF9\u4FDD\u5B58\u7ED3\u679C",taskSucceeded:"\u7ED3\u679C\u5DF2\u4FDD\u5B58",taskFailed:"\u4EFB\u52A1\u672A\u5B8C\u6210\uFF0C\u4E4B\u524D\u7684\u7ED3\u679C\u5DF2\u4FDD\u7559\u3002",taskCancelled:"\u5DF2\u505C\u6B62\u7B49\u5F85\uFF0C\u53EF\u67E5\u770B\u5B9E\u9645\u4FDD\u5B58\u7ED3\u679C\u3002",taskAssessment:"\u5206\u6790\u7B80\u5386\u4E0E\u5C97\u4F4D",taskRewrite:"\u751F\u6210\u7B80\u5386\u4FEE\u6539",taskAccept:"\u4FDD\u5B58\u65B0\u7248\u672C",taskImport:"\u5BFC\u5165\u5E76\u89E3\u6790\u8D44\u6599",taskSaveMaterial:"\u4FDD\u5B58\u4E2A\u4EBA\u8D44\u6599",taskConfirmMaterial:"\u786E\u8BA4\u8D44\u6599\u7248\u672C",taskSaveGoal:"\u4FDD\u5B58\u76EE\u6807\u5C97\u4F4D",taskLinkMaterial:"\u5173\u8054\u8D44\u6599",taskPrepareInterview:"\u51C6\u5907\u8BED\u97F3\u9762\u8BD5",taskReviewTranscript:"\u4FDD\u5B58\u786E\u8BA4\u540E\u7684\u56DE\u7B54",taskReport:"\u751F\u6210\u9762\u8BD5\u62A5\u544A",taskSaveConversation:"\u4FDD\u5B58\u5BF9\u8BDD\u8D44\u6599",realtimeUnassigned:"\u672A\u5BF9\u5E94\u9898\u76EE\u7684\u8F6C\u5199",realtimeUnassignedNote:"\u8FD9\u4E9B\u8BDD\u5DF2\u4FDD\u7559\u5728\u539F\u751F\u4F1A\u8BDD\u4E2D\uFF0C\u6CA1\u6709\u7528\u4E8E\u62A5\u544A\u8BC4\u5206\u3002",interviewMode:"\u9762\u8BD5\u65B9\u5F0F",textInterview:"\u6587\u5B57\u9762\u8BD5",realtimeSettings:"\u8BED\u97F3\u9762\u8BD5\u8BBE\u7F6E",compatibleVoiceInput:"\u6587\u5B57\u9762\u8BD5\u7684\u8BED\u97F3\u8F93\u5165",realtimeReview:"\u6838\u5BF9\u8FD9\u6B21\u9762\u8BD5",realtimeReviewNote:"\u786E\u8BA4\u8BC6\u522B\u7ED3\u679C\u51C6\u786E\u540E\u751F\u6210\u62A5\u544A\u3002\u4FEE\u6539\u4F1A\u4FDD\u7559\u539F\u59CB\u8F6C\u5199\uFF0C\u62A5\u544A\u53EA\u4F7F\u7528\u4F60\u786E\u8BA4\u7684\u56DE\u7B54\u3002",realtimePartialQuestion:"\u8FD9\u6BB5\u63D0\u95EE\u88AB\u6253\u65AD\uFF0C\u8BB0\u5F55\u7684\u662F\u5DF2\u6536\u5230\u7684\u5B57\u5E55\u3002",realtimeConfirmReport:"\u786E\u8BA4\u56DE\u7B54\u5E76\u751F\u6210\u62A5\u544A",realtimeCall:"\u8BED\u97F3\u9762\u8BD5",realtimeStart:"\u5F00\u59CB\u901A\u8BDD",realtimeReconnect:"\u91CD\u65B0\u8FDE\u63A5",realtimeAudioNotice:"\u97F3\u9891\u4F1A\u53D1\u9001\u7ED9\u5DF2\u914D\u7F6E\u7684\u8BED\u97F3\u670D\u52A1\u3002\u505C\u987F\u540E\u81EA\u52A8\u53D1\u9001\u8FD9\u4E00\u8F6E\u56DE\u7B54\uFF0C\u4F60\u53EF\u4EE5\u968F\u65F6\u8BF4\u8BDD\u6253\u65AD\u3002",realtimeRequesting:"\u6B63\u5728\u5F00\u542F\u9EA6\u514B\u98CE",realtimeConnecting:"\u6B63\u5728\u8FDE\u63A5\u9762\u8BD5\u5B98",realtimeListening:"\u6B63\u5728\u8046\u542C",realtimeSpeaking:"\u9762\u8BD5\u5B98\u6B63\u5728\u8BF4\u8BDD",realtimeThinking:"\u9762\u8BD5\u5B98\u6B63\u5728\u601D\u8003",realtimePaused:"\u901A\u8BDD\u5DF2\u6682\u505C",realtimeEnded:"\u901A\u8BDD\u5DF2\u7ED3\u675F",realtimeIdle:"\u51C6\u5907\u597D\u540E\u5F00\u59CB",realtimeMute:"\u9759\u97F3",realtimeUnmute:"\u53D6\u6D88\u9759\u97F3",realtimeInterrupt:"\u6253\u65AD",realtimeEnd:"\u7ED3\u675F\u901A\u8BDD",realtimeInterviewer:"\u9762\u8BD5\u5B98",realtimeYou:"\u4F60",realtimeTranscriptNote:"\u5B9E\u65F6\u5B57\u5E55\u53EF\u80FD\u6709\u8BEF\uFF0C\u53EF\u5728\u901A\u8BDD\u7ED3\u675F\u540E\u6838\u5BF9\u539F\u59CB\u8F6C\u5199\u3002",realtimeConfigure:"\u8BF7\u5148\u5728 DSH \u63D2\u4EF6\u8BBE\u7F6E\u4E2D\u914D\u7F6E\u5B9E\u65F6\u8BED\u97F3\u670D\u52A1\u3002",realtimeMicrophoneError:"\u9EA6\u514B\u98CE\u4E0D\u53EF\u7528\uFF0C\u8BF7\u68C0\u67E5\u8BBE\u5907\u4E0E\u6743\u9650\u540E\u91CD\u65B0\u8FDE\u63A5\u3002",realtimeAudioError:"\u97F3\u9891\u5DF2\u4E2D\u65AD\uFF0C\u8BF7\u68C0\u67E5\u8BBE\u5907\u6216\u7F51\u7EDC\u540E\u91CD\u65B0\u8FDE\u63A5\u3002",realtimeTranscriptError:"\u672C\u8F6E\u8BED\u97F3\u8F6C\u5199\u5931\u8D25\uFF0C\u901A\u8BDD\u5DF2\u505C\u6B62\uFF0C\u8BF7\u91CD\u65B0\u8FDE\u63A5\u3002",realtimeConnectionError:"\u901A\u8BDD\u8FDE\u63A5\u5DF2\u65AD\u5F00\uFF0C\u5DF2\u505C\u6B62\u91C7\u96C6\u3002\u8BF7\u68C0\u67E5\u670D\u52A1\u540E\u91CD\u65B0\u8FDE\u63A5\u3002",panel:"\u804C\u955C",tagline:"\u628A\u7ECF\u5386\u8BB2\u6E05\u695A\uFF0C\u628A\u4E0B\u4E00\u6B65\u51C6\u5907\u597D\u3002",home:"\u5F00\u59CB\u804A\u5929",personal:"\u4E2A\u4EBA\u8D44\u6599",goals:"\u76EE\u6807\u5C97\u4F4D",newGoal:"\u65B0\u5EFA\u5C97\u4F4D",newChat:"\u65B0\u5EFA\u5BF9\u8BDD",chat:"\u5BF9\u8BDD",interview:"\u6A21\u62DF\u9762\u8BD5",newInterview:"\u5F00\u59CB\u6A21\u62DF\u9762\u8BD5",settings:"\u8BED\u97F3\u8BBE\u7F6E",refresh:"\u5237\u65B0",loading:"\u6B63\u5728\u8BFB\u53D6",retry:"\u91CD\u8BD5",save:"\u4FDD\u5B58",cancel:"\u53D6\u6D88",close:"\u5173\u95ED",title:"\u540D\u79F0",company:"\u516C\u53F8",description:"\u8865\u5145\u8BF4\u660E",create:"\u521B\u5EFA",untitledChat:"\u65B0\u5BF9\u8BDD",goalEmpty:"\u6DFB\u52A0\u76EE\u6807\u5C97\u4F4D\uFF0C\u96C6\u4E2D\u51C6\u5907\u6BCF\u4E00\u6B21\u7533\u8BF7\u3002",noGoals:"\u8FD8\u6CA1\u6709\u76EE\u6807\u5C97\u4F4D",noConversations:"\u8FD8\u6CA1\u6709\u5BF9\u8BDD",homeTitle:"\u4ECE\u4F60\u7684\u4E0B\u4E00\u4EFD\u5DE5\u4F5C\u5F00\u59CB",homeNote:"\u804A\u804A\u7B80\u5386\u3001\u5C97\u4F4D\u9009\u62E9\uFF0C\u6216\u51C6\u5907\u4E00\u573A\u9762\u8BD5\u3002\u6A21\u578B\u6CBF\u7528 DSH \u7684\u8BBE\u7F6E\u3002",personalNote:"\u8D44\u6599\u53EF\u7528\u4E8E\u591A\u4E2A\u5C97\u4F4D\u3002\u6BCF\u6B21\u4FEE\u6539\u90FD\u4F1A\u4FDD\u7559\u4E00\u4E2A\u7248\u672C\u3002",addMaterial:"\u6DFB\u52A0\u8D44\u6599",noMaterials:"\u6DFB\u52A0\u4F60\u7684\u7B2C\u4E00\u4EFD\u7B80\u5386",noMaterialsNote:"\u5BFC\u5165\u6587\u4EF6\u6216\u7C98\u8D34\u6B63\u6587\uFF0C\u6838\u5BF9\u540E\u5C31\u80FD\u7528\u4E8E\u5206\u6790\u548C\u9762\u8BD5\u3002",resume:"\u7B80\u5386",job:"\u5C97\u4F4D\u8981\u6C42",experience:"\u7ECF\u5386\u8865\u5145",companyMaterial:"\u516C\u53F8\u8D44\u6599",kind:"\u8D44\u6599\u7C7B\u578B",paste:"\u7C98\u8D34\u6B63\u6587",file:"\u5BFC\u5165\u6587\u4EF6",url:"\u8BFB\u53D6\u94FE\u63A5",content:"\u6B63\u6587",sourceUrl:"\u516C\u5F00\u9875\u9762\u94FE\u63A5",fileHelp:"\u652F\u6301 PDF\u3001Word \u548C\u56FE\u7247\uFF0C\u6700\u5927 25 MB\u3002\u8BC6\u522B\u540E\u8BF7\u6838\u5BF9\u6B63\u6587\u3002",chooseFile:"\u9009\u62E9\u6587\u4EF6",fetch:"\u8BFB\u53D6\u5E76\u4FDD\u5B58",import:"\u5BFC\u5165",newVersion:"\u4FDD\u5B58\u4E3A\u65B0\u7248\u672C",version:"\u7248\u672C {number}",confirmed:"\u5DF2\u786E\u8BA4",unconfirmed:"\u5F85\u6838\u5BF9",confirm:"\u786E\u8BA4\u6B63\u6587",reviewNote:"\u8BF7\u6838\u5BF9\u59D3\u540D\u3001\u6570\u5B57\u3001\u65F6\u95F4\u548C\u7ECF\u5386\u3002\u786E\u8BA4\u540E\u624D\u80FD\u7528\u4E8E\u5206\u6790\u3002",edit:"\u4FEE\u6539\u6B63\u6587",link:"\u7528\u4E8E\u6B64\u5C97\u4F4D",linked:"\u5DF2\u5173\u8054",linkExisting:"\u9009\u7528\u5DF2\u6709\u8D44\u6599",selectMaterial:"\u9009\u62E9\u5DF2\u786E\u8BA4\u7684\u8D44\u6599\u7248\u672C",noConfirmed:"\u8FD8\u6CA1\u6709\u5DF2\u786E\u8BA4\u7684\u8D44\u6599\u7248\u672C\u3002\u5148\u5728\u4E2A\u4EBA\u8D44\u6599\u4E2D\u6DFB\u52A0\u5E76\u6838\u5BF9\u3002",goalMaterials:"\u5C97\u4F4D\u8D44\u6599",overview:"\u5C97\u4F4D\u51C6\u5907",review:"\u7B80\u5386\u5206\u6790",fit:"\u5C97\u4F4D\u9002\u914D",rewrite:"\u4FEE\u6539\u7B80\u5386",selectResume:"\u9009\u7528\u7B80\u5386\u7248\u672C",selectPlaceholder:"\u8BF7\u9009\u62E9",assessResume:"\u5206\u6790\u8FD9\u4EFD\u7B80\u5386",assessFit:"\u5206\u6790\u5C97\u4F4D\u9002\u914D",assessNote:"\u7ED3\u679C\u57FA\u4E8E\u6240\u9009\u7248\u672C\u548C\u53EF\u6838\u5BF9\u7684\u7ECF\u5386\uFF0C\u4E0D\u4EE3\u8868\u62DB\u8058\u7ED3\u679C\u3002",noAssessment:"\u8FD9\u4E2A\u7248\u672C\u8FD8\u6CA1\u6709\u5206\u6790\u7ED3\u679C\u3002",insufficient:"\u8BC1\u636E\u4E0D\u8DB3\uFF0C\u6682\u4E0D\u7ED9\u603B\u5206",score:"\u8BC4\u5206",evidence:"\u4F9D\u636E",suggestions:"\u5EFA\u8BAE",jobRequired:"\u8BF7\u5148\u6DFB\u52A0\u3001\u786E\u8BA4\u5E76\u5173\u8054\u4E00\u4EFD\u5C97\u4F4D\u8981\u6C42\u3002",resumeRequired:"\u8BF7\u5148\u9009\u7528\u4E00\u4EFD\u5DF2\u786E\u8BA4\u7684\u7B80\u5386\u3002",rewriteInstructions:"\u4F60\u5E0C\u671B\u600E\u6837\u4FEE\u6539",rewritePlaceholder:"\u4F8B\u5982\u7A81\u51FA\u9879\u76EE\u8D21\u732E\uFF0C\u8BA9\u8868\u8FBE\u66F4\u7B80\u6D01",generateRewrite:"\u751F\u6210\u4FEE\u6539\u5EFA\u8BAE",original:"\u539F\u6587",revised:"\u5EFA\u8BAE\u5199\u6CD5",reason:"\u4FEE\u6539\u539F\u56E0",selectChanges:"\u9009\u4E2D\u9700\u8981\u91C7\u7EB3\u7684\u4FEE\u6539",acceptChanges:"\u91C7\u7EB3\u9009\u4E2D\u4FEE\u6539",accepted:"\u5DF2\u4FDD\u5B58\u4E3A\u65B0\u7248\u672C\uFF0C\u8BF7\u6838\u5BF9\u540E\u786E\u8BA4\u3002",fullResume:"\u5B8C\u6574\u4FEE\u6539\u7A3F",exportDocx:"\u4E0B\u8F7D Word",exportPdf:"\u4E0B\u8F7D PDF",start:"\u5F00\u59CB",language:"\u9762\u8BD5\u8BED\u8A00",zhLanguage:"\u4E2D\u6587",enLanguage:"\u82F1\u6587",questions:"\u4E3B\u8981\u95EE\u9898\u6570",interviewIntro:"\u56F4\u7ED5\u76EE\u6807\u5C97\u4F4D\u63D0\u95EE\uFF0C\u4FDD\u7559\u4F60\u7684\u539F\u59CB\u56DE\u7B54\u3002\u7ED3\u675F\u540E\u751F\u6210\u6709\u4F9D\u636E\u7684\u53CD\u9988\u3002",interviewStartPrompt:"\u8BF7\u5F00\u59CB{language}\u6A21\u62DF\u9762\u8BD5\uFF0C\u5171 {number} \u4E2A\u4E3B\u8981\u95EE\u9898\u3002",interviewAnswerPrompt:"\u63D0\u4EA4\u7B2C {number} \u9898\u56DE\u7B54",interviewPausePrompt:"\u8BF7\u6682\u505C\u8FD9\u573A\u6A21\u62DF\u9762\u8BD5\u3002",interviewResumePrompt:"\u8BF7\u7EE7\u7EED\u8FD9\u573A\u6A21\u62DF\u9762\u8BD5\u3002",interviewFinishPrompt:"\u8BF7\u7ED3\u675F\u8FD9\u573A\u6A21\u62DF\u9762\u8BD5\u5E76\u751F\u6210\u62A5\u544A\u3002",interviewNativeHint:"\u4F7F\u7528\u8FD9\u91CC\u7684\u6309\u94AE\u63D0\u4EA4\u9762\u8BD5\u8BF7\u6C42\u3002\u539F\u59CB\u56DE\u7B54\u548C\u7ED3\u679C\u4FDD\u5B58\u5728\u53F3\u4FA7 DSH \u5BF9\u8BDD\u4E2D\uFF0C\u5904\u7406\u8FC7\u7A0B\u4F7F\u7528 DSH \u5F53\u524D\u6A21\u578B\u3002",answer:"\u4F60\u7684\u56DE\u7B54",answerPlaceholder:"\u5199\u4E0B\u4F60\u4F1A\u5728\u9762\u8BD5\u4E2D\u771F\u5B9E\u8868\u8FBE\u7684\u5185\u5BB9",submitAnswer:"\u63D0\u4EA4\u56DE\u7B54",pause:"\u6682\u505C",resumeInterview:"\u7EE7\u7EED\u9762\u8BD5",finish:"\u7ED3\u675F\u5E76\u751F\u6210\u62A5\u544A",paused:"\u9762\u8BD5\u5DF2\u6682\u505C",completed:"\u9762\u8BD5\u5DF2\u7ED3\u675F",question:"\u7B2C {number} \u4E2A\u95EE\u9898",followup:"\u8FFD\u95EE",report:"\u9762\u8BD5\u62A5\u544A",noReport:"\u62A5\u544A\u5C1A\u672A\u751F\u6210",strengths:"\u505A\u5F97\u597D\u7684\u5730\u65B9",improvements:"\u53EF\u4EE5\u6539\u8FDB\u7684\u5730\u65B9",nextSteps:"\u63A5\u4E0B\u6765\u7EC3\u4E60",record:"\u5F55\u97F3\u56DE\u7B54",stopRecord:"\u505C\u6B62\u5F55\u97F3",discardRecord:"\u53D6\u6D88\u5F55\u97F3",listen:"\u6717\u8BFB\u95EE\u9898",stopListen:"\u505C\u6B62\u64AD\u653E",voiceDraft:"\u6838\u5BF9\u8F6C\u5199\u5185\u5BB9",useTranscript:"\u653E\u5165\u56DE\u7B54\u8349\u7A3F",voiceHint:"\u8F6C\u5199\u4E0D\u4F1A\u81EA\u52A8\u63D0\u4EA4\u3002\u6838\u5BF9\u540E\u518D\u63D0\u4EA4\u56DE\u7B54\u3002",voiceOriginalTranscript:"\u539F\u59CB\u8F6C\u5199",voiceEditedTranscript:"\u4FEE\u8BA2\u8F6C\u5199",voiceEvidence:"\u8BED\u97F3\u8BB0\u5F55",hostSettingsNote:"\u6A21\u578B\u4E0E\u8BED\u97F3\u7531 DSH \u8BBE\u7F6E\u7BA1\u7406\u3002",refreshVoice:"\u5237\u65B0\u8BED\u97F3\u80FD\u529B",systemSpeechUnavailable:"\u8BBE\u5907\u5C1A\u65E0\u5F53\u524D\u8BED\u8A00\u7684\u672C\u5730\u6717\u8BFB\u58F0\u97F3",systemSpeechBusy:"\u5176\u4ED6\u6717\u8BFB\u6B63\u5728\u8FDB\u884C\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5",hostAsrUnavailable:"\u8BF7\u5728 DSH \u8BED\u97F3\u8F93\u5165\u4E2D\u542F\u7528\u5E76\u51C6\u5907\u8BC6\u522B\u670D\u52A1",voiceManagedByHost:"\u6A21\u578B\u4E0E\u8BED\u97F3\u8BC6\u522B\u7531 DSH \u8BBE\u7F6E\u7BA1\u7406\uFF0C\u6717\u8BFB\u4F7F\u7528\u8BBE\u5907\u672C\u5730\u58F0\u97F3\u3002",hostVoiceSettings:"DSH \u8BED\u97F3\u8F93\u5165",enableHostVoice:"\u542F\u7528 DSH \u8BED\u97F3\u8F93\u5165",voiceEnabling:"\u6B63\u5728\u542F\u7528\u8BED\u97F3\u8F93\u5165",voiceEnableNote:"\u542F\u7528\u540E\u5728 DSH \u9875\u9762\u4E0B\u8F7D\u5E76\u51C6\u5907\u8BED\u97F3\u6A21\u578B\u3002",voiceEnabled:"\u5DF2\u542F\u7528\uFF0C\u8BF7\u5728 DSH \u9875\u9762\u68C0\u67E5\u5E76\u51C6\u5907\u8BED\u97F3\u6A21\u578B\u3002",voiceEnabledNoNavigation:"\u5DF2\u542F\u7528\uFF0C\u8BF7\u5230 DSH \u63D2\u4EF6\u7BA1\u7406\u7684\u8BED\u97F3\u8F93\u5165\u9875\u9762\u51C6\u5907\u6A21\u578B\u3002",voiceEnableRestart:"\u542F\u7528\u8BBE\u7F6E\u5DF2\u4FDD\u5B58\u3002\u8BF7\u91CD\u542F DSH\uFF0C\u518D\u5230\u8BED\u97F3\u8F93\u5165\u9875\u9762\u51C6\u5907\u6A21\u578B\u3002",voiceEnableOverridden:"\u5F53\u524D DSH \u914D\u7F6E\u963B\u6B62\u4E86\u542F\u7528\uFF0C\u8BF7\u5728 DSH \u63D2\u4EF6\u7BA1\u7406\u4E2D\u68C0\u67E5\u3002",voiceBundleMissing:"\u5F53\u524D DSH \u5B89\u88C5\u4E2D\u6CA1\u6709\u8BED\u97F3\u8F93\u5165\uFF0C\u8BF7\u5728 DSH \u63D2\u4EF6\u7BA1\u7406\u4E2D\u68C0\u67E5\u3002",voiceManagerUnavailable:"\u5F53\u524D\u65E0\u6CD5\u8BBF\u95EE DSH \u63D2\u4EF6\u7BA1\u7406\uFF0C\u8BF7\u5728 DSH \u4E2D\u6253\u5F00\u8BED\u97F3\u8F93\u5165\u8BBE\u7F6E\u3002",voiceEnableFailed:"\u672A\u80FD\u542F\u7528\u8BED\u97F3\u8F93\u5165\uFF0C\u8BF7\u5728 DSH \u63D2\u4EF6\u7BA1\u7406\u4E2D\u68C0\u67E5\u540E\u91CD\u8BD5\u3002",dshWorkspace:"DSH \u5DE5\u4F5C\u533A",selectWorkspace:"\u9009\u62E9\u5DE5\u4F5C\u533A",workspaceRequired:"\u8BF7\u9009\u62E9\u5DE5\u4F5C\u533A\u3002\u9700\u8981\u6DFB\u52A0\u65F6\uFF0C\u8BF7\u4F7F\u7528 DSH \u5DE6\u680F\u7684\u5DE5\u4F5C\u533A\u5165\u53E3\u3002",manageWorkspaces:"\u7BA1\u7406 DSH \u5DE5\u4F5C\u533A",floatingConversation:"\u6B64\u65E7\u5BF9\u8BDD\u6CA1\u6709\u5173\u8054 DSH \u5DE5\u4F5C\u533A\u3002\u5DF2\u4FDD\u5B58\u5185\u5BB9\u4ECD\u53EF\u67E5\u770B\uFF0C\u8BF7\u9009\u62E9\u5DE5\u4F5C\u533A\u540E\u65B0\u5EFA\u5BF9\u8BDD\u3002",error_WORKSPACE_REQUIRED:"\u8BF7\u5148\u9009\u62E9\u4E00\u4E2A\u4ECD\u53EF\u7528\u7684 DSH \u5DE5\u4F5C\u533A\u3002",voiceUnavailable:"\u8BED\u97F3\u6682\u4E0D\u53EF\u7528\uFF0C\u53EF\u4EE5\u7EE7\u7EED\u8F93\u5165\u6587\u5B57\u3002",voiceIdle:"\u51C6\u5907\u5C31\u7EEA",voiceRequesting:"\u6B63\u5728\u7533\u8BF7\u9EA6\u514B\u98CE",voiceRecording:"\u6B63\u5728\u5F55\u97F3",voiceTranscribing:"\u6B63\u5728\u8F6C\u5199",voicePlaying:"\u6B63\u5728\u64AD\u653E",asr:"\u8BED\u97F3\u8F6C\u6587\u5B57",tts:"\u6587\u5B57\u8F6C\u8BED\u97F3",disabled:"\u5173\u95ED",hostAsr:"\u4F7F\u7528 DSH \u8BED\u97F3\u670D\u52A1",compatible:"\u517C\u5BB9 OpenAI \u7684\u63A5\u53E3",endpoint:"\u63A5\u53E3\u5730\u5740",model:"\u6A21\u578B",apiKey:"API \u5BC6\u94A5",keyPlaceholder:"\u7559\u7A7A\u4FDD\u7559\u5DF2\u4FDD\u5B58\u7684\u5BC6\u94A5",voice:"\u58F0\u97F3\u540D\u79F0",voiceSettingsNote:"\u6587\u5B57\u6A21\u578B\u7531 DSH \u7BA1\u7406\u3002\u8FD9\u91CC\u4EC5\u914D\u7F6E\u53EF\u9009\u7684\u8BED\u97F3\u670D\u52A1\uFF0C\u4FDD\u5B58\u4E0D\u4F1A\u8C03\u7528\u6A21\u578B\u3002",settingsSaved:"\u8BBE\u7F6E\u5DF2\u4FDD\u5B58",processing:"\u6B63\u5728\u5904\u7406",errorTitle:"\u8FD9\u6B21\u64CD\u4F5C\u6CA1\u6709\u5B8C\u6210",bindConversation:"\u5F52\u5165\u76EE\u6807\u5C97\u4F4D",ungrouped:"\u65E5\u5E38\u6C42\u804C\u5BF9\u8BDD",source:"\u6765\u6E90",savedVersion:"\u5DF2\u4FDD\u5B58\u7248\u672C",unavailable:"\u5F53\u524D\u5BBF\u4E3B\u6682\u4E0D\u63D0\u4F9B\u6B64\u80FD\u529B",noSelection:"\u9009\u62E9\u5DE6\u4FA7\u8D44\u6599\u67E5\u770B\u6B63\u6587\u4E0E\u7248\u672C\u3002",error_NETWORK:"\u65E0\u6CD5\u8FDE\u63A5 DSH\uFF0C\u8BF7\u68C0\u67E5\u670D\u52A1\u662F\u5426\u4ECD\u5728\u8FD0\u884C\u3002",error_FILE_TOO_LARGE:"\u6587\u4EF6\u4E0D\u80FD\u8D85\u8FC7 25 MB\u3002",error_JOB_MATERIAL_REQUIRED:"\u8BF7\u5148\u5173\u8054\u4E00\u4EFD\u5DF2\u786E\u8BA4\u7684\u5C97\u4F4D\u8981\u6C42\u3002",error_INVALID_RESPONSE:"DSH \u8FD4\u56DE\u7684\u5185\u5BB9\u65E0\u6CD5\u8BFB\u53D6\uFF0C\u8BF7\u91CD\u8BD5\u3002",error_REQUEST_FAILED:"\u8BF7\u6C42\u672A\u5B8C\u6210\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002",error_EXPORT_FAILED:"\u5BFC\u51FA\u672A\u5B8C\u6210\uFF0C\u8BF7\u91CD\u8BD5\u3002",viewSource:"\u6838\u5BF9\u6765\u6E90",downloadOriginal:"\u4E0B\u8F7D\u539F\u6587\u4EF6",sourceReview:"\u5BF9\u7167\u539F\u6587\u4EF6\u6838\u5BF9\u63D0\u53D6\u5185\u5BB9\u3002\u9009\u62E9\u4E00\u4E2A\u533A\u5757\uFF0C\u53EF\u67E5\u770B\u5B83\u5728\u6B63\u6587\u4E2D\u7684\u4F4D\u7F6E\u3002",sourceDetails:"\u89E3\u6790\u4F4D\u7F6E\u8BE6\u60C5",page:"\u7B2C {number} \u9875",block:"\u533A\u5757 {number}",loadMore:"\u663E\u793A\u66F4\u591A\u533A\u5757",originalImage:"\u539F\u59CB\u56FE\u7247",sourceUnavailable:"\u6B64\u7248\u672C\u7684\u539F\u59CB\u8D44\u6599\u6682\u4E0D\u53EF\u8BFB\u53D6\u3002",chatSnapshot:"\u65B0\u5BF9\u8BDD\u4F1A\u4FDD\u5B58\u6240\u9009\u7B80\u5386\u548C\u5F53\u524D\u5C97\u4F4D\u8D44\u6599\u7684\u7248\u672C\u3002\u4EE5\u540E\u4FEE\u6539\u8D44\u6599\uFF0C\u5DF2\u6709\u5BF9\u8BDD\u4ECD\u4F7F\u7528\u539F\u6765\u7684\u7248\u672C\u3002"},Zi={...Fi,...$i,...Gi,...Yi,assistant:"Career assistant",showAssistant:"Open assistant",hideAssistant:"Hide assistant",expandChat:"Expand conversation",backToWorkbench:"Back to workbench",assistantEmpty:"Start or select a conversation to discuss your materials while keeping them in view.",askAboutMaterial:"Discuss with assistant",choosePassage:"Choose a passage",choosePassageNote:"Select text to discuss it. The saved source stays unchanged.",askAboutPassage:"Discuss selected text",selectedContext:"Selected material",cancelContext:"Remove reference",previewContext:"Preview reference",addToChatDraft:"Add to conversation draft",contextPreviewNote:"This prepares a reference only. You can edit the draft before pressing the DSH send button.",contextAdded:"Added to this DSH conversation draft. Your existing draft was preserved. Review it before sending.",contextUnavailable:"Choose a confirmed material version and a regular career conversation first.",contextDraftText:`Please discuss this material. The following is source text.
Material: {title} \xB7 {version}
Version ID: {versionId}

{text}`,error_NATIVE_DRAFT_UNAVAILABLE:"This DSH host does not provide draft preparation. Update or re-enable the plugin and retry.",error_NATIVE_DRAFT_BLOCKED:"The conversation is submitting. Try again shortly; your reference is still here.",error_CONTEXT_UNAVAILABLE:"Use a confirmed material version and start or select a regular career conversation.",rtSettingsNote:"Text analysis keeps using the models configured in DSH. These settings are only for the dedicated realtime audio service.",rtSettingsPrivacy:"Calls send audio and the interview materials to Alibaba Cloud Model Studio in the selected region and may incur service charges.",rtSettingsUnavailable:"Voice settings are unavailable. Check that the plugin is enabled and try again.",rtSettingsEnabled:"Realtime voice interviews",rtSettingsOn:"Enabled",rtSettingsOff:"Disabled",rtSettingsRegion:"Audio service region",rtSettingsBeijing:"Mainland China (Beijing)",rtSettingsSingapore:"International (Singapore)",rtSettingsWorkspace:"Model Studio workspace ID",rtSettingsWorkspaceHint:"Enter the workspace ID for your audio service",rtSettingsModel:"Realtime audio model",rtSettingsAdvanced:"Advanced options",rtSettingsCredentialRef:"DSH audio credential name",rtSettingsSave:"Save voice settings",rtSettingsDiscard:"Restore saved settings",rtSettingsSaved:"Voice settings saved.",rtSettingsInvalid:"Check the region, workspace ID, model and credential name.",rtSettingsReadonly:"This DSH configuration is read-only.",rtSettingsConflict:"Settings were not saved. The Host configuration may have changed. Restore saved settings and try again.",rtSettingsFailed:"Voice settings were not saved. Check the DSH connection and try again.",rtCredentialTitle:"Dedicated audio credential",rtCredentialNote:"Enter only the API key for the selected Model Studio audio service. It is stored in DSH credentials. Existing keys are never displayed.",rtCredentialKey:"Audio service API key",rtCredentialSave:"Save audio credential",rtCredentialSaved:"The audio credential was saved in DSH.",rtCredentialConfigured:"This audio credential is configured in DSH.",rtCredentialMissing:"This audio credential is not configured in DSH.",rtCredentialSaveSettingsFirst:"The credential name has changed. Save voice settings before entering its key.",rtCredentialInvalid:"Save valid voice settings and enter an audio service key first.",rtCredentialReadonly:"This credential is managed by the Host and cannot be changed here.",rtCredentialFailed:"The audio credential could not be checked or saved. Check the DSH connection and permissions, then try again.",rtCredentialUntested:"After saving the credential, test whether the audio API connects and returns speech.",rtProbeTest:"Test audio API",rtProbeRunning:"Testing",rtProbeCancel:"Cancel test",rtProbePlay:"Play test audio",rtProbeStop:"Stop playback",rtProbeClear:"Clear test result",rtProbeNote:"The test sends a fixed short phrase to the configured audio service and may incur a small charge. It does not open the microphone, send personal materials, or play audio automatically.",rtProbeSaveFirst:"Save your changed voice settings and audio credential before testing.",rtProbeEnableFirst:"Enable and save realtime voice settings before testing.",rtProbeWaiting:"Connecting to the audio service and waiting for test speech, for up to 30 seconds.",rtProbeSuccess:"Test passed. Connected in {ready} ms, first audio in {firstAudio} ms, total {total} ms.",rtProbeScope:"This test confirms the connection and returned speech and text. Microphone recognition, interruption, and full interview quality still need to be checked in a call.",rtProbeCancelled:"Test cancelled.",rtProbeTimeout:"The audio test timed out. Check your network or audio service and try again.",rtProbeBusy:"Another audio test is running. Try again shortly.",rtProbeConfigure:"Audio settings are unavailable. Check the saved region, workspace, and model.",rtProbeCredential:"The audio credential is unavailable. Save a valid audio service key in DSH.",rtProbeNoAudio:"The service did not return playable speech. Check the audio model and try again.",rtProbeNoTranscript:"The service did not return text for the test speech. Try again shortly.",rtProbeFailed:"The audio test failed. Check the DSH connection, audio settings, and service permissions, then try again.",rtProbePlaybackFailed:"Test audio could not be played. Check your audio device and try again.",rtProbeAuthentication:"The audio service did not accept this key. Check and save the audio credential again.",rtProbeAccess:"The audio service denied access. Check model permissions and the workspace.",rtProbeEndpoint:"The audio service endpoint is unavailable. Check the selected region and model.",rtProbeRateLimit:"The audio service is rate limited or out of quota. Try again later and check your service quota.",rtProbeProvider:"The audio service is temporarily unavailable. Try again later.",rtProbeNetwork:"The audio service could not be reached. Check your network and DNS, then try again.",rtProbeTls:"The secure connection to the audio service could not be verified. Check the system clock and network settings.",analysisContext:"Target job {goal} \xB7 {material} \xB7 {version}",rewriteSource:"Select text for the assistant to revise",rewriteSourceHelp:"Select a passage and add it to your instructions. You can edit the instructions before generating.",rewriteUseSelection:"Revise selected text",rewriteSelectionAdded:"The selected passage was added to your instructions.",rewriteSelectionTooLong:"The selection and instructions exceed the limit. Shorten the passage or instructions.",rewriteSelectionPrompt:`Focus on this exact passage from {version}, keeping other confirmed facts:
{passage}`,rewriteSavedVersion:"Saved as {version}",rewriteViewNewVersion:"View new version",rewriteReturnOriginalVersion:"Return to original version",rewriteVersionSwitchNote:"Switching changes the version you are viewing. Saved versions and historical reports are retained.",rewriteSourceVersion:"Original \xB7 {version}",taskStatus:"Current task",cancelTask:"Cancel task",taskRunning:"Working",taskRefreshing:"Checking saved results",taskSucceeded:"Result saved",taskFailed:"The task did not finish. Previous results are kept.",taskCancelled:"Stopped waiting. Check the saved results below.",taskAssessment:"Assessing resume and job fit",taskRewrite:"Revising resume",taskAccept:"Saving new version",taskImport:"Importing and reading material",taskSaveMaterial:"Saving personal material",taskConfirmMaterial:"Confirming material version",taskSaveGoal:"Saving target job",taskLinkMaterial:"Linking material",taskPrepareInterview:"Preparing voice interview",taskReviewTranscript:"Saving confirmed answers",taskReport:"Creating interview report",taskSaveConversation:"Saving conversation context",realtimeUnassigned:"Unassigned transcripts",realtimeUnassignedNote:"These words are kept in native history and excluded from report scoring.",interviewMode:"Interview mode",textInterview:"Text interview",realtimeSettings:"Voice interview settings",compatibleVoiceInput:"Dictation for text interviews",realtimeReview:"Review this interview",realtimeReviewNote:"Check the transcript before creating your report. Edits keep the original transcript. Only confirmed answers are used in the report.",realtimePartialQuestion:"This question was interrupted. This is the transcript received so far.",realtimeConfirmReport:"Confirm answers and create report",realtimeCall:"Voice interview",realtimeStart:"Start call",realtimeReconnect:"Reconnect",realtimeAudioNotice:"Audio is sent to your configured voice service. Pausing submits your turn automatically. You can speak to interrupt at any time.",realtimeRequesting:"Opening microphone",realtimeConnecting:"Connecting to interviewer",realtimeListening:"Listening",realtimeSpeaking:"Interviewer speaking",realtimeThinking:"Interviewer thinking",realtimePaused:"Call paused",realtimeEnded:"Call ended",realtimeIdle:"Start when you are ready",realtimeMute:"Mute",realtimeUnmute:"Unmute",realtimeInterrupt:"Interrupt",realtimeEnd:"End call",realtimeInterviewer:"Interviewer",realtimeYou:"You",realtimeTranscriptNote:"Live captions may contain errors. Review the original transcript after the call.",realtimeConfigure:"Configure realtime audio in DSH plugin settings first.",realtimeMicrophoneError:"Microphone unavailable. Check your device and permissions before reconnecting.",realtimeAudioError:"Audio stopped. Check your device or network before reconnecting.",realtimeTranscriptError:"Transcription failed for this turn. The call has stopped. Please reconnect.",realtimeConnectionError:"The call disconnected and recording stopped. Check your service before reconnecting.",panel:"Zhijing",tagline:"Tell your story clearly. Prepare your next move.",home:"Start a chat",personal:"Personal materials",goals:"Target roles",newGoal:"Add role",newChat:"New conversation",chat:"Conversation",interview:"Practice interview",newInterview:"Start an interview",settings:"Voice settings",refresh:"Refresh",loading:"Loading",retry:"Retry",save:"Save",cancel:"Cancel",close:"Close",title:"Name",company:"Company",description:"Notes",create:"Create",untitledChat:"New conversation",goalEmpty:"Add a target role to prepare for each application.",noGoals:"No target roles yet",noConversations:"No conversations yet",homeTitle:"Start with your next role",homeNote:"Work on your resume, explore a role, or prepare for an interview. Your DSH model settings apply.",personalNote:"Reuse materials across roles. Every edit creates a separate version.",addMaterial:"Add material",noMaterials:"Add your first resume",noMaterialsNote:"Import a file or paste text, then review it before analysis or practice.",resume:"Resume",job:"Job requirements",experience:"Experience notes",companyMaterial:"Company material",kind:"Material type",paste:"Paste text",file:"Import file",url:"Read a link",content:"Text",sourceUrl:"Public page URL",fileHelp:"PDF, Word and images, up to 25 MB. Review the extracted text.",chooseFile:"Choose file",fetch:"Read and save",import:"Import",newVersion:"Save a new version",version:"Version {number}",confirmed:"Confirmed",unconfirmed:"Needs review",confirm:"Confirm text",reviewNote:"Check names, numbers, dates and experience before using this version for analysis.",edit:"Edit text",link:"Use for this role",linked:"Linked",linkExisting:"Use existing material",selectMaterial:"Choose a confirmed material version",noConfirmed:"No confirmed versions yet. Add and review your personal materials first.",goalMaterials:"Role materials",overview:"Role preparation",review:"Resume analysis",fit:"Role fit",rewrite:"Resume revision",selectResume:"Resume version",selectPlaceholder:"Choose",assessResume:"Analyze this resume",assessFit:"Analyze role fit",assessNote:"Results use this version and documented experience. They do not predict hiring decisions.",noAssessment:"This version has no analysis yet.",insufficient:"Not enough evidence for an overall score",score:"Score",evidence:"Evidence",suggestions:"Suggestions",jobRequired:"Add, confirm and link job requirements first.",resumeRequired:"Choose a confirmed resume first.",rewriteInstructions:"What would you like to improve?",rewritePlaceholder:"For example, highlight project contributions and make it more concise",generateRewrite:"Suggest revisions",original:"Original",revised:"Suggested text",reason:"Reason",selectChanges:"Select changes to accept",acceptChanges:"Accept selected changes",accepted:"Saved as a new version. Review and confirm it.",fullResume:"Full revised resume",exportDocx:"Download Word",exportPdf:"Download PDF",start:"Start",language:"Interview language",zhLanguage:"Chinese",enLanguage:"English",questions:"Main questions",interviewIntro:"Practice questions for this role. Your original answers are saved and used for feedback.",interviewStartPrompt:"Please start a mock interview in {language} with {number} main questions.",interviewAnswerPrompt:"Submit my answer to question {number}",interviewPausePrompt:"Please pause this mock interview.",interviewResumePrompt:"Please resume this mock interview.",interviewFinishPrompt:"Please finish this mock interview and create the report.",interviewNativeHint:"Use these controls to submit interview requests. Your original answers and results stay in the DSH conversation on the right. Processing uses your current DSH model.",answer:"Your answer",answerPlaceholder:"Write what you would say in a real interview",submitAnswer:"Submit answer",pause:"Pause",resumeInterview:"Resume interview",finish:"Finish and create report",paused:"Interview paused",completed:"Interview complete",question:"Question {number}",followup:"Follow-up",report:"Interview report",noReport:"Report not generated yet",strengths:"What went well",improvements:"What to improve",nextSteps:"Practice next",record:"Record an answer",stopRecord:"Stop recording",discardRecord:"Cancel recording",listen:"Read question",stopListen:"Stop playback",voiceDraft:"Review transcription",useTranscript:"Use as answer draft",voiceHint:"Transcriptions are never submitted automatically. Review your draft first.",voiceOriginalTranscript:"Original transcript",voiceEditedTranscript:"Edited transcript",voiceEvidence:"Voice record",hostSettingsNote:"DSH settings manage models and voice.",refreshVoice:"Refresh voice availability",systemSpeechUnavailable:"No local voice is installed for this language",systemSpeechBusy:"Another speech playback is in progress",hostAsrUnavailable:"Enable and prepare speech recognition in DSH Voice Input",voiceManagedByHost:"Models and recognition use DSH settings; playback uses a local device voice.",hostVoiceSettings:"DSH Voice Input",enableHostVoice:"Enable DSH Voice Input",voiceEnabling:"Enabling voice input",voiceEnableNote:"After enabling, download and prepare speech models on the DSH page.",voiceEnabled:"Enabled. Check and prepare speech models on the DSH page.",voiceEnabledNoNavigation:"Enabled. Open Voice Input in DSH Plugins to prepare the models.",voiceEnableRestart:"Enablement saved. Restart DSH, then open Voice Input to prepare the models.",voiceEnableOverridden:"The current DSH configuration prevents activation. Check DSH Plugins.",voiceBundleMissing:"This DSH installation has no Voice Input bundle. Check DSH Plugins.",voiceManagerUnavailable:"DSH plugin management is unavailable. Open Voice Input settings in DSH.",voiceEnableFailed:"Voice Input could not be enabled. Check DSH Plugins and try again.",dshWorkspace:"DSH workspace",selectWorkspace:"Choose workspace",workspaceRequired:"Choose a workspace. Add new ones through the DSH workspace sidebar.",manageWorkspaces:"Manage DSH workspaces",floatingConversation:"This older conversation has no DSH workspace. Saved content remains available. Choose a workspace and start a new conversation.",error_WORKSPACE_REQUIRED:"Choose an available DSH workspace first.",voiceUnavailable:"Voice is unavailable. You can continue typing.",voiceIdle:"Ready",voiceRequesting:"Requesting microphone",voiceRecording:"Recording",voiceTranscribing:"Transcribing",voicePlaying:"Playing",asr:"Speech to text",tts:"Text to speech",disabled:"Off",hostAsr:"Use DSH speech service",compatible:"OpenAI-compatible API",endpoint:"API URL",model:"Model",apiKey:"API key",keyPlaceholder:"Leave blank to keep the saved key",voice:"Voice name",voiceSettingsNote:"DSH manages your text models. These optional voice settings make no model calls when saved.",settingsSaved:"Settings saved",processing:"Working",errorTitle:"This action did not finish",bindConversation:"Assign to a target role",ungrouped:"Career conversations",source:"Source",savedVersion:"Saved version",unavailable:"This capability is unavailable in the current host",noSelection:"Select a material to view its text and versions.",error_NETWORK:"Cannot connect to DSH. Check that the service is running.",error_FILE_TOO_LARGE:"Files must be 25 MB or smaller.",error_JOB_MATERIAL_REQUIRED:"Link confirmed job requirements first.",error_INVALID_RESPONSE:"Could not read the DSH response. Please retry.",error_REQUEST_FAILED:"The request did not finish. Please retry.",error_EXPORT_FAILED:"The export did not finish. Please retry.",viewSource:"Review source",downloadOriginal:"Download original",sourceReview:"Compare the extracted text with the original. Select a block to locate it in the text.",sourceDetails:"Extraction location details",page:"Page {number}",block:"Block {number}",loadMore:"Show more blocks",originalImage:"Original image",sourceUnavailable:"The original material for this version is unavailable.",chatSnapshot:"New conversations keep the selected resume and current role materials. Later edits do not change the versions used by existing conversations."};var Io=["slots","locale","sessions","resources","workspaces","configForms","remote","remote.credentials"];function Eo(e){let t="zhijing",r=zt(),i=jr(r);e.effect(()=>()=>i.dispose(),"zhijing: career data owner"),e.effect(()=>e.locale.register(t,{zh:Qi,en:Zi}),"zhijing: dictionaries");let n=e.locale.bind(t);_i(e,n),e.effect(()=>ki(e,t),"zhijing: official realtime settings"),e.effect(()=>e.resources.register(zr(e.sessions)),"zhijing: native session resources");let o={hooks:{career:i.source,nativeSessions:e.sessions.list,workspaceChoices:e.workspaces.list},refresh:i.refresh,cancelCurrent:i.cancelCurrent,retryCurrent:i.retryCurrent,action:i.action,prepareChatDraft:(s,c)=>ji(e.sessions,e.get("conversation"),s,c),upload:i.upload,voiceApi:r.voice,realtimeApi:r.realtime,openRealtimeSettings:()=>{let s=e.get("pluginNavigation");return s?.openBundle("dsh-interview-desk"),!!s},readSource:s=>r.request("material.source",{versionId:s}),loadOriginal:r.original,async downloadOriginal(s){_t(await r.original(s))},openVoiceSettings:()=>{let s=e.get("pluginNavigation");return s?.openBundle(at),!!s},enableVoiceInput:({signal:s}={})=>wr({getManager:()=>e.get("remote.pluginManager"),openSettings:()=>o.openVoiceSettings(),signal:s}),openWorkspaceManager:()=>{let s=e.get("layout");return s?.selectPanel(null),!!s},async createConversation(s,c,u,x,k){if(!e.workspaces.list.getSnapshot().items.some(w=>w.workspaceId===x))throw Object.assign(new Error(n("workspaceRequired")),{code:"WORKSPACE_REQUIRED"});let h=await e.sessions.create({workspaceId:x}),v=await i.action("conversation.link",{goalId:s||null,sessionId:h,title:c,kind:"chat",...u?k?.kind==="material"?{contextVersionId:u}:{versionId:u}:{}});return k&&u?await i.action("conversation.bindObject",{kind:k.kind,id:k.id,sessionId:h}):k?.kind==="goal"&&await i.action("conversation.bindObject",{kind:"goal",id:k.id,sessionId:h}),v},async startInterview(s){if(!e.workspaces.list.getSnapshot().items.some(u=>u.workspaceId===s.workspaceId))throw Object.assign(new Error(n("workspaceRequired")),{code:"WORKSPACE_REQUIRED"});if(s.mode==="realtime")return i.action("realtime.create",s);let c=await e.sessions.create({workspaceId:s.workspaceId});return await i.action("conversation.link",{goalId:s.goalId,versionId:s.versionId,sessionId:c,title:n("interview"),kind:"interview"}),i.perform(u=>St(e.sessions,c,yt("interview.start",s,n),u))},async interviewAction(s,c){let u=i.source.getSnapshot().data.interviews.find(x=>x.id===c.interviewId);if(!u)throw new Error(n("unavailable"));return u.mode==="realtime"?i.action(s,c):i.perform(x=>s==="interview.answer"?kr({api:r,submit:(k,h)=>St(e.sessions,u.sessionId,yt(s,{...c,text:k},n),h)},{...c,interviewId:u.id},x):St(e.sessions,u.sessionId,yt(s,c,n),x))},async download(s,c,u){_t(await r.exportDocument(s,c,u))}},a,l=()=>{let s=e.get?.("configForms")?.get?.("dsh-interview-desk"),c=e.get?.("remote.credentials")??e.get?.("remote")?.credentials;if(!a||a.form!==s||a.credentials!==c){let{hooks:u,saveSettings:x,describeCredential:k,storeCredential:h,testAudio:v,cancelAudio:w}=tr(s,c,r);a={form:s,credentials:c,value:{...o,hooks:{...o.hooks,...u},settingsActions:{saveSettings:x,describeCredential:k,storeCredential:h,testAudio:v,cancelAudio:w}}}}return a.value};e.effect(()=>e.slots.inject("main",()=>e.slots.register({name:"main",key:"zhijing",locale:t,children:{"zhijing.conversation":{kind:"single",scope:"session"}},inject:l},qi)),"zhijing: workbench"),e.effect(()=>e.slots.inject("zhijing.conversation",()=>e.slots.register({name:"zhijing.conversation",locale:t},Sr)),"zhijing: shared conversation"),e.effect(()=>e.slots.inject("sidebar.panellist",()=>e.slots.register({name:"sidebar.panellist",id:"zhijing",order:8,label:()=>n("panel"),locale:t},It)),"zhijing: sidebar")}
return module.exports}})
