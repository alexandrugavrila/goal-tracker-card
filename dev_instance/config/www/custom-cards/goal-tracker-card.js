/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,e$2=t$1.ShadowRoot&&(void 0===t$1.ShadyCSS||t$1.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$3=new WeakMap;let n$2 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$3.set(s,t));}return t}toString(){return this.cssText}};const r$2=t=>new n$2("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$2(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$1.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$2(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$1,getOwnPropertySymbols:o$2,getPrototypeOf:n$1}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$1(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$1(t),...o$2(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i$1=t=>t,s$1=t.trustedTypes,e=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$1=`lit$${Math.random().toFixed(9).slice(2)}$`,n="?"+o$1,r=`<${n}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e?e.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$1+x):s+o$1+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$1),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$1)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$1),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$1,t+1));)d.push({type:7,index:l}),t+=o$1.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$1(t).nextSibling;i$1(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t.litHtmlPolyfillSupport;B?.(S,k),(t.litHtmlVersions??=[]).push("3.3.2");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o=s.litElementPolyfillSupport;o?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.2");

const DEFAULT_STORAGE_KEY = "goal-tracker-card:goals";
const STORAGE_VERSION = 3;
const PRACTICE_MODES = ["checkbox", "number"];
const PRACTICE_COMPARISONS = [
  "greater_than",
  "greater_than_or_equal",
  "less_than",
  "less_than_or_equal",
  "equal",
];
const PRACTICE_DAY_COLORS = {
  complete: "#2ecc71",
  partial: "#f1c40f",
  missed: "#e74c3c",
  future: "#eee",
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  const randomPart = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .padStart(8, "0")
  ).join("");
  return `goal-${Date.now().toString(36)}-${randomPart}`;
}

function todayIso() {
  return toIsoDate(new Date());
}

function toIsoDate(value) {
  const date = value instanceof Date ? value : parseDate(value);
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

function parseDate(value) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function addDaysIso(startIso, index) {
  const start = parseDate(startIso);
  if (!start) return "";
  return toIsoDate(new Date(start.getTime() + index * MS_PER_DAY));
}

function countDaysBetween(startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end || end < start) return 0;
  return Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}

function generateDailyArray(startDate, endDate, existing = []) {
  const length = countDaysBetween(startDate, endDate);
  return Array.from({ length }, (_, index) => sanitizeNumber(existing[index], 0, 0));
}

function sanitizeNumber(value, fallback = 0, min = Number.NEGATIVE_INFINITY) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, number);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeGoal(raw = {}, fallback = {}) {
  const start = parseDate(raw.start) ? raw.start : fallback.start ?? todayIso();
  const rawEnd = parseDate(raw.end) ? raw.end : fallback.end ?? start;
  const end = countDaysBetween(start, rawEnd) > 0 ? rawEnd : start;
  const startValue = sanitizeNumber(raw.startValue, fallback.startValue ?? 0);
  const target = sanitizeNumber(raw.target, fallback.target ?? 1);
  const daily = generateDailyArray(start, end, Array.isArray(raw.daily) ? raw.daily : []);
  const progress = clamp(
    sanitizeNumber(raw.progress, fallback.progress ?? startValue),
    Math.min(startValue, target),
    Math.max(startValue, target)
  );

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : createId(),
    name: typeof raw.name === "string" ? raw.name : fallback.name ?? "",
    unit: typeof raw.unit === "string" ? raw.unit : fallback.unit ?? "",
    startValue,
    target,
    progress,
    start,
    end,
    daily,
  };
}

function normalizePractice(raw = {}, fallback = {}) {
  const mode = PRACTICE_MODES.includes(raw.mode) ? raw.mode : fallback.mode ?? "number";
  const comparison = PRACTICE_COMPARISONS.includes(raw.comparison)
    ? raw.comparison
    : PRACTICE_COMPARISONS.includes(fallback.comparison)
      ? fallback.comparison
      : "greater_than_or_equal";
  const rawGoalIds = Array.isArray(raw.goalIds) ? raw.goalIds : fallback.goalIds ?? [];
  const goalIds = [...new Set(rawGoalIds.filter((goalId) => typeof goalId === "string" && goalId))];
  const target = sanitizeNumber(raw.targetPerDay, fallback.targetPerDay ?? 1, 0);
  const targetPerDay = target > 0 ? target : 1;
  const requestedPartialProgress = typeof raw.partialProgressEnabled === "boolean"
    ? raw.partialProgressEnabled
    : typeof fallback.partialProgressEnabled === "boolean"
      ? fallback.partialProgressEnabled
      : true;
  const partialProgressEnabled = comparison !== "equal" && requestedPartialProgress;
  const rawPartialMin = sanitizeNumber(
    raw.partialProgressMin,
    fallback.partialProgressMin ?? 0,
    0
  );
  const rawPartialMax = sanitizeNumber(
    raw.partialProgressMax,
    fallback.partialProgressMax ?? targetPerDay,
    0
  );
  const isGreaterComparison = comparison === "greater_than" || comparison === "greater_than_or_equal";
  const isLessComparison = comparison === "less_than" || comparison === "less_than_or_equal";
  const partialProgressMin = isGreaterComparison
    ? Math.min(rawPartialMin, targetPerDay)
    : targetPerDay;
  const partialProgressMax = isLessComparison
    ? Math.max(rawPartialMax, targetPerDay)
    : targetPerDay;
  const sourceEntries = raw.entries && typeof raw.entries === "object" ? raw.entries : fallback.entries ?? {};
  const entries = {};

  Object.entries(sourceEntries).forEach(([dateKey, value]) => {
    if (!parseDate(dateKey)) return;
    const entryValue = sanitizeNumber(value, 0, 0);
    entries[dateKey] = mode === "checkbox" && entryValue > 0 ? 1 : entryValue;
  });

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : createId(),
    name: typeof raw.name === "string" ? raw.name : fallback.name ?? "",
    mode,
    unit: typeof raw.unit === "string" ? raw.unit : fallback.unit ?? "",
    targetPerDay,
    comparison,
    partialProgressEnabled,
    partialProgressMin,
    partialProgressMax,
    daysPerWeek: clamp(
      Math.round(sanitizeNumber(raw.daysPerWeek, fallback.daysPerWeek ?? 5, 1)),
      1,
      7
    ),
    goalIds,
    entries,
  };
}

function createPracticeFromGoalDaily(goal) {
  const normalizedGoal = normalizeGoal(goal);
  if (!Array.isArray(goal?.daily) || goal.daily.length === 0) return null;
  const daily = generateDailyArray(normalizedGoal.start, normalizedGoal.end, goal.daily);
  if (!daily.length) return null;
  const entries = {};
  daily.forEach((value, index) => {
    const dateKey = addDaysIso(normalizedGoal.start, index);
    if (dateKey) entries[dateKey] = value;
  });
  return normalizePractice({
    name: normalizedGoal.name,
    mode: "number",
    unit: normalizedGoal.unit,
    targetPerDay: Math.max(1, Math.abs(normalizedGoal.target - normalizedGoal.startValue) / daily.length),
    daysPerWeek: goal.daysPerWeek,
    goalIds: [normalizedGoal.id],
    entries,
  });
}

function parseStoredGoals(state) {
  if (!state || state === "unknown" || state === "unavailable") {
    return createStorageEnvelope();
  }

  try {
    const parsed = JSON.parse(state);
    if (Array.isArray(parsed)) {
      return {
        ...createStorageEnvelope(parsed, parsed.map(createPracticeFromGoalDaily).filter(Boolean)),
        needsSave: true,
      };
    }

    if (parsed && typeof parsed === "object" && Array.isArray(parsed.goals)) {
      const goals = parsed.goals.map((goal) => normalizeGoal(goal));
      const legacyDaysByGoalId = new Map(
        parsed.goals.map((goal, index) => [
          goals[index].id,
          clamp(Math.round(sanitizeNumber(goal?.daysPerWeek, 5, 1)), 1, 7),
        ])
      );
      const practices = Array.isArray(parsed.practices)
        ? parsed.practices.map((practice) =>
            normalizePractice(
              practice,
              {
                daysPerWeek: practice.goalIds
                  ?.map((goalId) => legacyDaysByGoalId.get(goalId))
                  .find((value) => value !== undefined) ?? 5,
              }
            )
          )
        : parsed.goals.map(createPracticeFromGoalDaily).filter(Boolean);
      return {
        version: STORAGE_VERSION,
        goals,
        practices,
        seededConfigKeys: Array.isArray(parsed.seededConfigKeys)
          ? parsed.seededConfigKeys.filter((key) => typeof key === "string")
          : [],
        needsSave: parsed.version !== STORAGE_VERSION,
      };
    }
  } catch {
    return {
      ...createStorageEnvelope(),
      error: "Stored goal data is not valid JSON.",
    };
  }

  return {
    ...createStorageEnvelope(),
    error: "Stored goal data has an unsupported format.",
  };
}

function createStorageEnvelope(goals = [], practices = [], seededConfigKeys = []) {
  return {
    version: STORAGE_VERSION,
    goals: goals.map((goal) => normalizeGoal(goal)),
    practices: practices.map((practice) => normalizePractice(practice)),
    seededConfigKeys: seededConfigKeys.filter((key) => typeof key === "string"),
    needsSave: false,
  };
}

function getProgressPercent(goal) {
  const startValue = sanitizeNumber(goal?.startValue, 0);
  const target = sanitizeNumber(goal?.target, 1);
  const progress = sanitizeNumber(goal?.progress, startValue);
  const distance = target - startValue;
  if (distance === 0) return progress === target ? 100 : 0;
  return clamp(((progress - startValue) / distance) * 100, 0, 100);
}

function getExpectedProgressPercent(goal, nowValue = new Date()) {
  if (!goal?.start || !goal?.end) return 0;
  const now = parseDate(toIsoDate(nowValue));
  const start = parseDate(goal.start);
  const end = parseDate(goal.end);
  if (!now || !start || !end || end < start) return 0;
  if (now < start) return 0;
  if (now > end) return 100;
  if (start.getTime() === end.getTime()) return 100;
  return Math.round(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100);
}

function getPracticeValueForDate(practice, dateKey) {
  if (!practice?.entries || !dateKey) return 0;
  return sanitizeNumber(practice.entries[dateKey], 0, 0);
}

function isPracticeCompleteForDate(practice, dateKey) {
  if (!practice?.entries || !Object.prototype.hasOwnProperty.call(practice.entries, dateKey)) {
    return false;
  }
  const value = getPracticeValueForDate(practice, dateKey);
  if (practice?.mode === "checkbox") return value > 0;
  const target = sanitizeNumber(practice?.targetPerDay, 1, 0);
  switch (practice?.comparison) {
    case "greater_than":
      return value > target;
    case "less_than":
      return value < target;
    case "less_than_or_equal":
      return value <= target;
    case "equal":
      return value === target;
    case "greater_than_or_equal":
    default:
      return value >= target;
  }
}

function isPracticePartialForDate(practice, dateKey) {
  if (
    practice?.mode !== "number" ||
    !practice?.partialProgressEnabled ||
    !practice?.entries ||
    !Object.prototype.hasOwnProperty.call(practice.entries, dateKey) ||
    isPracticeCompleteForDate(practice, dateKey)
  ) {
    return false;
  }

  const value = getPracticeValueForDate(practice, dateKey);
  if (value === 0) return false;
  const minimum = sanitizeNumber(practice.partialProgressMin, 0, 0);
  const maximum = sanitizeNumber(practice.partialProgressMax, practice.targetPerDay, 0);
  return value >= Math.min(minimum, maximum) && value <= Math.max(minimum, maximum);
}

function getPracticeDayStatus(practice, dateKey, nowValue = new Date()) {
  if (!dateKey || dateKey > toIsoDate(nowValue)) return "future";
  if (isPracticeCompleteForDate(practice, dateKey)) return "complete";
  if (isPracticePartialForDate(practice, dateKey)) return "partial";
  return "missed";
}

const PRACTICE_BLOCK_MIN_WIDTH = 10;
const PRACTICE_BLOCK_GAP = 3;
const PRACTICE_BLOCK_MAX_HEIGHT = 24;
const PRACTICE_BLOCK_MIN_HEIGHT = 12;
const PRACTICE_BLOCK_HEIGHT_STEP = 4;
const PRACTICE_EXPANSION_GROUP_PADDING = 3;
const PRACTICE_TIMELINE_UNITS = ["day", "week", "month", "year"];

const UNIT_RANK = Object.fromEntries(PRACTICE_TIMELINE_UNITS.map((unit, index) => [unit, index]));
const STATUS_ORDER = ["complete", "partial", "missed", "future"];
const MONTH_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function clampDateToRange(dateKey, start, end) {
  if (!dateKey || dateKey < start) return start;
  if (dateKey > end) return end;
  return dateKey;
}

function periodBounds(dateKey, unit) {
  const date = parseDate(dateKey);
  if (!date) return null;

  if (unit === "day") return { start: dateKey, end: dateKey };

  if (unit === "week") {
    const dayFromMonday = (date.getUTCDay() + 6) % 7;
    const start = new Date(date);
    start.setUTCDate(start.getUTCDate() - dayFromMonday);
    return {
      start: toIsoDate(start),
      end: addDaysIso(toIsoDate(start), 6),
    };
  }

  if (unit === "month") {
    return {
      start: toIsoDate(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))),
      end: toIsoDate(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0))),
    };
  }

  return {
    start: `${date.getUTCFullYear()}-01-01`,
    end: `${date.getUTCFullYear()}-12-31`,
  };
}

function createBlock(unit, start, end) {
  return {
    unit,
    start,
    end,
    key: `${unit}:${start}:${end}`,
    days: countDaysBetween(start, end),
  };
}

function splitTimelineRange(start, end, unit) {
  if (
    !parseDate(start) ||
    !parseDate(end) ||
    end < start ||
    !Object.prototype.hasOwnProperty.call(UNIT_RANK, unit)
  ) {
    return [];
  }

  const blocks = [];
  let cursor = start;
  while (cursor && cursor <= end) {
    const bounds = periodBounds(cursor, unit);
    if (!bounds) break;
    const blockEnd = bounds.end < end ? bounds.end : end;
    blocks.push(createBlock(unit, cursor, blockEnd));
    cursor = addDaysIso(blockEnd, 1);
  }
  return blocks;
}

function getNextFinerTimelineUnit(unit) {
  const rank = UNIT_RANK[unit];
  return rank > 0 ? PRACTICE_TIMELINE_UNITS[rank - 1] : null;
}

function getTimelineBlockHeight(unit, largestUnit) {
  const unitRank = UNIT_RANK[unit] ?? 0;
  const largestRank = UNIT_RANK[largestUnit] ?? unitRank;
  const rankDifference = Math.max(0, largestRank - unitRank);
  return Math.max(
    PRACTICE_BLOCK_MIN_HEIGHT,
    PRACTICE_BLOCK_MAX_HEIGHT - rankDifference * PRACTICE_BLOCK_HEIGHT_STEP
  );
}

function buildVisibleBlocks(start, end, baseUnit, focusDate, deepestUnit) {
  const deepestRank = UNIT_RANK[deepestUnit] ?? 0;
  const expandedBlocks = [];

  const expand = (block) => {
    const containsFocus = block.start <= focusDate && focusDate <= block.end;
    const finerUnit = getNextFinerTimelineUnit(block.unit);
    if (!containsFocus || !finerUnit || UNIT_RANK[block.unit] <= deepestRank) {
      return [{ ...block, selected: containsFocus }];
    }

    expandedBlocks.push(block);
    return splitTimelineRange(block.start, block.end, finerUnit).flatMap(expand);
  };

  return {
    blocks: splitTimelineRange(start, end, baseUnit).flatMap(expand),
    expandedBlocks,
  };
}

function getTimelineExpansionGroups(timeline) {
  const blocks = Array.isArray(timeline?.blocks) ? timeline.blocks : [];
  const expandedBlocks = Array.isArray(timeline?.expandedBlocks) ? timeline.expandedBlocks : [];
  if (!blocks.length || !expandedBlocks.length) return [];

  return expandedBlocks.map((expandedBlock, depth) => {
    const startIndex = blocks.findIndex(
      (block) => block.start >= expandedBlock.start && block.end <= expandedBlock.end
    );
    let endIndex = startIndex;
    while (
      endIndex + 1 < blocks.length &&
      blocks[endIndex + 1].start >= expandedBlock.start &&
      blocks[endIndex + 1].end <= expandedBlock.end
    ) {
      endIndex += 1;
    }

    const descendants = startIndex >= 0 ? blocks.slice(startIndex, endIndex + 1) : [];
    const tallestDescendant = descendants.reduce(
      (height, block) => Math.max(height, getTimelineBlockHeight(block.unit, timeline.largestUnit)),
      0
    );

    return {
      key: `expanded:${expandedBlock.key}`,
      block: expandedBlock,
      depth,
      columnStart: startIndex + 1,
      columnSpan: descendants.length,
      height: tallestDescendant + PRACTICE_EXPANSION_GROUP_PADDING * 3,
    };
  }).filter((group) => group.columnStart > 0 && group.columnSpan > 0);
}

function chooseBaseUnit(start, end, focusDate, capacity) {
  for (const unit of PRACTICE_TIMELINE_UNITS) {
    const fullyExpanded = buildVisibleBlocks(start, end, unit, focusDate, "day").blocks;
    if (fullyExpanded.length <= capacity) return unit;
  }
  return "year";
}

function createPracticeTimeline({
  start,
  end,
  availableWidth = 600,
  minBlockWidth = PRACTICE_BLOCK_MIN_WIDTH,
  gap = PRACTICE_BLOCK_GAP,
  selection,
  nowValue = new Date(),
} = {}) {
  if (!parseDate(start) || !parseDate(end) || end < start) {
    return {
      baseUnit: "day",
      capacity: 0,
      focusDate: "",
      deepestUnit: "day",
      largestUnit: "day",
      blocks: [],
      expandedBlocks: [],
    };
  }

  const safeWidth = Number.isFinite(availableWidth) && availableWidth > 0 ? availableWidth : 600;
  const safeMinimum = Number.isFinite(minBlockWidth) && minBlockWidth > 0
    ? minBlockWidth
    : PRACTICE_BLOCK_MIN_WIDTH;
  const safeGap = Number.isFinite(gap) && gap >= 0 ? gap : PRACTICE_BLOCK_GAP;
  const capacity = Math.max(1, Math.floor((safeWidth + safeGap) / (safeMinimum + safeGap)));
  const currentDate = toIsoDate(nowValue);
  const focusDate = clampDateToRange(selection?.focusDate || currentDate, start, end);
  const baseUnit = chooseBaseUnit(start, end, focusDate, capacity);
  const requestedDeepestUnit = PRACTICE_TIMELINE_UNITS.includes(selection?.deepestUnit)
    ? selection.deepestUnit
    : "day";
  const deepestUnit = UNIT_RANK[requestedDeepestUnit] < UNIT_RANK[baseUnit]
    ? requestedDeepestUnit
    : baseUnit;
  const visibleTimeline = buildVisibleBlocks(start, end, baseUnit, focusDate, deepestUnit);
  const blocks = visibleTimeline.blocks.map((block) => ({
    ...block,
    current: block.start <= currentDate && currentDate <= block.end,
  }));
  const largestUnit = blocks.reduce(
    (largest, block) => UNIT_RANK[block.unit] > UNIT_RANK[largest] ? block.unit : largest,
    "day"
  );

  return {
    baseUnit,
    capacity,
    focusDate,
    deepestUnit,
    largestUnit,
    blocks,
    expandedBlocks: visibleTimeline.expandedBlocks,
  };
}

function getPracticeBlockAppearance(practice, block, nowValue = new Date()) {
  const counts = Object.fromEntries(STATUS_ORDER.map((status) => [status, 0]));
  const total = countDaysBetween(block?.start, block?.end);

  for (let index = 0; index < total; index += 1) {
    const status = getPracticeDayStatus(practice, addDaysIso(block.start, index), nowValue);
    counts[status] += 1;
  }

  const populated = STATUS_ORDER.filter((status) => counts[status] > 0);
  if (populated.length <= 1) {
    return {
      counts,
      background: PRACTICE_DAY_COLORS[populated[0] || "future"],
    };
  }

  let consumed = 0;
  const stops = [];
  for (const status of populated) {
    const startPercent = (consumed / total) * 100;
    consumed += counts[status];
    const endPercent = (consumed / total) * 100;
    stops.push(
      `${PRACTICE_DAY_COLORS[status]} ${startPercent.toFixed(2)}%`,
      `${PRACTICE_DAY_COLORS[status]} ${endPercent.toFixed(2)}%`
    );
  }

  return {
    counts,
    background: `linear-gradient(to right, ${stops.join(", ")})`,
  };
}

function formatPracticeBlockLabel(block) {
  if (!block) return "";
  if (block.unit === "day") return block.start;
  if (block.unit === "month") return MONTH_FORMATTER.format(parseDate(block.start));
  if (block.unit === "year") return block.start.slice(0, 4);
  return `${DATE_FORMATTER.format(parseDate(block.start))} – ${DATE_FORMATTER.format(parseDate(block.end))}`;
}

function formatPracticeBlockSummary(block, counts) {
  const details = STATUS_ORDER
    .filter((status) => counts?.[status])
    .map((status) => `${counts[status]} ${status}`)
    .join(" · ");
  const range = block.start === block.end ? block.start : `${block.start} – ${block.end}`;
  const label = formatPracticeBlockLabel(block);
  return block.unit === "week" || label === range
    ? `${label}: ${details}`
    : `${label} (${range}): ${details}`;
}

const PRACTICE_COMPARISON_LABELS = {
  greater_than: "Greater than (>)",
  greater_than_or_equal: "Greater than or equal to (≥)",
  less_than: "Less than (<)",
  less_than_or_equal: "Less than or equal to (≤)",
  equal: "Equal to (=)",
};

const PRACTICE_COMPARISON_SYMBOLS = {
  greater_than: ">",
  greater_than_or_equal: "≥",
  less_than: "<",
  less_than_or_equal: "≤",
  equal: "=",
};

class GoalTrackerCard extends i {
  static properties = {
    hass: {},
    config: {},
    goals: { state: true },
    practices: { state: true },
    showModal: { state: true },
    newGoal: { state: true },
    confirmingDeleteId: { state: true },
    confirmingPracticeDeleteId: { state: true },
    progressEditingGoal: { state: true },
    practiceEditing: { state: true },
    practiceDayEdit: { state: true },
    showPracticeDayModal: { state: true },
    storageError: { state: true },
    storageNotice: { state: true },
    timelineWidths: { state: true },
    timelineSelections: { state: true },
  };

  static styles = i$3`
    ha-card {
      display: block;
      padding: 16px;
    }

    .goal-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .goal-row {
      border: 1px solid var(--divider-color, #ccc);
      padding: 12px;
      border-radius: 8px;
      background: var(--card-background-color, #fff);
    }

    .goal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 6px;
    }

    .goal-title {
      font-weight: 700;
      flex: 1;
      min-width: 0;
    }

    .goal-values {
      color: var(--secondary-text-color, #666);
      font-size: 13px;
      font-weight: 400;
      margin-top: 2px;
    }

    .goal-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: flex-end;
    }

    .goal-bar {
      position: relative;
      height: 20px;
      background: #ddd;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(to right, #2ecc71, #27ae60);
    }

    .progress-marker {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: #000;
      z-index: 2;
    }

    .practice-timeline {
      overflow-x: auto;
      padding: ${PRACTICE_EXPANSION_GROUP_PADDING}px;
      scrollbar-width: thin;
    }

    .timeline-context {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 8px;
      margin-top: 6px;
      color: var(--secondary-text-color, #666);
      font-size: 11px;
      line-height: 1.4;
    }

    .timeline-overview {
      flex: 0 0 auto;
      padding: 1px 6px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 999px;
      color: var(--primary-text-color, #222);
      font-weight: 600;
    }

    .timeline-expanded {
      min-width: 0;
    }

    .timeline-grid {
      display: grid;
      align-items: end;
      gap: ${PRACTICE_BLOCK_GAP}px;
      margin-top: 8px;
    }

    .timeline-block {
      box-sizing: border-box;
      grid-row: 1;
      min-width: ${PRACTICE_BLOCK_MIN_WIDTH}px;
      padding: 0;
      border: 0;
      border-radius: 4px;
      cursor: pointer;
      position: relative;
      z-index: 1;
    }

    .timeline-expansion-outline {
      align-self: end;
      box-sizing: border-box;
      grid-row: 1;
      margin: 0 -${PRACTICE_EXPANSION_GROUP_PADDING - 1}px -${PRACTICE_EXPANSION_GROUP_PADDING}px;
      pointer-events: none;
      border: 1px solid rgba(127, 127, 127, 0.5);
      border-color: color-mix(in srgb, var(--primary-text-color, #000) 38%, transparent);
      border-radius: 6px;
      z-index: 2;
    }

    .timeline-block.current {
      outline: 2px solid var(--primary-text-color, #000);
      outline-offset: 1px;
      z-index: 3;
    }

    .timeline-block.selected:not(.current) {
      outline: 2px solid var(--primary-color, #3498db);
      outline-offset: 1px;
    }

    .practice-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 10px;
    }

    .practice-row {
      border-top: 1px solid var(--divider-color, #ddd);
      padding-top: 8px;
    }

    .practice-header {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      align-items: center;
      margin-bottom: 4px;
      font-size: 13px;
    }

    .practice-title {
      font-weight: 600;
      min-width: 0;
    }

    .practice-actions {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .practice-empty {
      color: var(--secondary-text-color, #666);
      font-size: 13px;
      margin-top: 8px;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      background-color: var(--primary-color, #3498db);
      color: var(--text-primary-color, #fff);
      cursor: pointer;
    }

    button:hover {
      filter: brightness(0.92);
    }

    .set-button,
    .adjust-button {
      font-size: 14px;
      color: #333;
      padding: 4px 8px;
      background-color: #e6e6e6;
    }

    .delete-button {
      color: #b00;
      padding: 4px 8px;
      background-color: #f3d6d6;
    }

    .secondary-button {
      background-color: #777;
    }

    .danger-button {
      background-color: #c0392b;
    }

    .error {
      border: 1px solid #c0392b;
      background: #fdecea;
      color: #7b1d14;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .notice {
      border: 1px solid #b7791f;
      background: #fff8e1;
      color: #6b4e00;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .empty {
      color: var(--secondary-text-color, #666);
      margin: 0 0 12px;
    }

    .modal {
      position: fixed;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.3);
      z-index: 10;
      padding: 16px;
      box-sizing: border-box;
    }

    .modal-content {
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #000);
      padding: 20px;
      border-radius: 8px;
      max-height: calc(100vh - 32px);
      max-width: 520px;
      overflow-y: auto;
      width: 100%;
      box-sizing: border-box;
    }

    .modal-content h2 {
      margin-top: 0;
    }

    .modal-content label {
      display: block;
      margin: 10px 0 4px;
    }

    .modal-content input {
      width: 100%;
      padding: 6px;
      box-sizing: border-box;
    }

    .modal-content input[type="checkbox"] {
      width: auto;
    }

    .modal-content select {
      width: 100%;
      padding: 6px;
      box-sizing: border-box;
    }

    .toggle-label {
      display: flex !important;
      align-items: center;
      gap: 8px;
    }

    .toggle-label.disabled {
      color: var(--disabled-text-color, #999);
      opacity: 0.7;
    }

    .field-label-with-help {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 10px 0 4px;
    }

    .field-label-with-help label {
      margin: 0;
    }

    .help-tooltip {
      align-items: center;
      background: var(--secondary-background-color, #eee);
      border: 1px solid var(--divider-color, #bbb);
      border-radius: 50%;
      color: var(--primary-text-color, #333);
      cursor: help;
      display: inline-flex;
      font-size: 11px;
      font-weight: 700;
      height: 17px;
      justify-content: center;
      position: relative;
      width: 17px;
    }

    .help-tooltip-content {
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, #bbb);
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      color: var(--primary-text-color, #222);
      display: none;
      font-size: 12px;
      font-weight: 400;
      left: -8px;
      line-height: 1.4;
      padding: 10px;
      position: absolute;
      top: calc(100% + 6px);
      width: min(300px, calc(100vw - 72px));
      z-index: 20;
    }

    .help-tooltip:hover .help-tooltip-content,
    .help-tooltip:focus .help-tooltip-content,
    .help-tooltip:focus-within .help-tooltip-content {
      display: block;
    }

    .field-hint {
      color: var(--secondary-text-color, #666);
      font-size: 12px;
      margin: 4px 0 0;
    }

    .goal-checkboxes {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 6px;
    }

    .goal-checkboxes label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .goal-checkboxes input {
      width: auto;
    }

    .modal-actions,
    .day-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }

  `;

  constructor() {
    super();
    this.config = {};
    this.goals = [];
    this.practices = [];
    this.showModal = false;
    this.newGoal = {};
    this.confirmingDeleteId = null;
    this.confirmingPracticeDeleteId = null;
    this.progressEditingGoal = null;
    this.practiceEditing = null;
    this.practiceDayEdit = {
      practiceId: null,
      goalId: null,
      date: "",
      value: 0,
    };
    this.showPracticeDayModal = false;
    this.storageError = "";
    this.storageNotice = "";
    this.timelineWidths = {};
    this.timelineSelections = {};
    this._loaded = false;
    this._loadingGoals = false;
    this._seededConfig = false;
    this._migratedLocalStorage = false;
    this._timelineResizeObserver = null;
    this._observedTimelines = new Set();
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this._timelineResizeObserver && globalThis.ResizeObserver) {
      this._timelineResizeObserver = new ResizeObserver((entries) => {
        let nextWidths = this.timelineWidths;
        for (const entry of entries) {
          const timelineKey = entry.target.dataset.timelineKey;
          const width = Math.floor(entry.contentRect.width);
          if (!timelineKey || width <= 0 || this.timelineWidths[timelineKey] === width) continue;
          if (nextWidths === this.timelineWidths) nextWidths = { ...this.timelineWidths };
          nextWidths[timelineKey] = width;
        }
        if (nextWidths !== this.timelineWidths) this.timelineWidths = nextWidths;
      });
    }
  }

  disconnectedCallback() {
    this._timelineResizeObserver?.disconnect();
    this._observedTimelines.clear();
    super.disconnectedCallback();
  }

  setConfig(config) {
    this.config = {
      storage_key: DEFAULT_STORAGE_KEY,
      debug: false,
      goals: [],
      ...(config || {}),
    };
    this._loaded = false;
    this._seededConfig = false;
    this._loadGoals();
  }

  updated(changed) {
    if ((changed.has("hass") || changed.has("config")) && !this._loaded) {
      this._loadGoals();
    }
    this._syncTimelineObservers();
  }

  render() {
    return b`
      <ha-card>
        ${this.storageError ? b`<div class="error">${this.storageError}</div>` : ""}
        ${this.storageNotice ? b`<div class="notice">${this.storageNotice}</div>` : ""}
        ${this.goals.length
          ? b`<div class="goal-list">${this.goals.map((goal) => this._renderGoal(goal))}</div>`
          : b`<p class="empty">No goals yet.</p>`}
        <div class="actions">
          <button @click=${this._openAddModal}>Add Goal</button>
          <button @click=${this._openAddPracticeModal}>Add Practice</button>
          ${this.config.debug
            ? b`
                <button @click=${this._addTestGoals}>Add Test Data</button>
                <button @click=${this._removeTestGoals}>Remove Test Data</button>
              `
            : ""}
        </div>
        ${this.showModal ? this._renderAddModal() : ""}
        ${this.confirmingDeleteId ? this._renderDeleteModal() : ""}
        ${this.confirmingPracticeDeleteId ? this._renderPracticeDeleteModal() : ""}
        ${this.progressEditingGoal ? this._renderSetProgressModal() : ""}
        ${this.practiceEditing ? this._renderPracticeModal() : ""}
        ${this.showPracticeDayModal ? this._renderPracticeDayModal() : ""}
      </ha-card>
    `;
  }

  _renderGoal(goal) {
    const linkedPractices = this.practices.filter((practice) => practice.goalIds.includes(goal.id));

    return b`
      <div class="goal-row">
        <div class="goal-header">
          <div class="goal-title">
            ${goal.name}
            <div class="goal-values">
              Start ${goal.startValue} · Current ${goal.progress} · Target ${goal.target}
              ${goal.unit}
            </div>
          </div>
          <div class="goal-actions">
            <button class="adjust-button" @click=${() => this._incrementProgress(goal.id, -1)}>-1</button>
            <button class="adjust-button" @click=${() => this._incrementProgress(goal.id, 1)}>+1</button>
            <button class="set-button" @click=${() => this._openSetProgressModal(goal)}>Set</button>
            <button class="delete-button" @click=${() => this._confirmRemove(goal.id)}>Delete</button>
          </div>
        </div>

        <div class="goal-bar">
          <div class="progress-fill" style="width: ${getProgressPercent(goal)}%;"></div>
          <div
            class="progress-marker"
            style="left: ${getExpectedProgressPercent(goal)}%;"
            title="Expected progress by today"
          ></div>
        </div>

        ${linkedPractices.length
          ? b`
              <div class="practice-list">
                ${linkedPractices.map((practice) => this._renderPracticeForGoal(goal, practice))}
              </div>
            `
          : b`<div class="practice-empty">No linked practices.</div>`}
      </div>
    `;
  }

  _renderPracticeForGoal(goal, practice) {
    const targetLabel = practice.mode === "checkbox"
      ? "done / missed"
      : `${PRACTICE_COMPARISON_SYMBOLS[practice.comparison] || "≥"} ${practice.targetPerDay} ${practice.unit || "units"}/day`;
    const partialLabel = practice.mode === "number" && practice.partialProgressEnabled
      ? `, partial ${practice.partialProgressMin}–${practice.partialProgressMax}`
      : "";
    const timelineKey = `${goal.id}::${practice.id}`;
    const timelineWidth = this.timelineWidths[timelineKey] || 600;
    const now = new Date();
    const timeline = createPracticeTimeline({
      start: goal.start,
      end: goal.end,
      availableWidth: timelineWidth,
      selection: this.timelineSelections[timelineKey],
      nowValue: now,
    });
    const minimumGridWidth = Math.max(
      0,
      timeline.blocks.length * (PRACTICE_BLOCK_MIN_WIDTH + PRACTICE_BLOCK_GAP) - PRACTICE_BLOCK_GAP
    );
    const overviewUnit = `${timeline.baseUnit[0].toUpperCase()}${timeline.baseUnit.slice(1)}`;
    const expandedPath = timeline.expandedBlocks.map(formatPracticeBlockLabel).join(" › ");
    const expandedUnit = `${timeline.deepestUnit}s`;
    const expansionGroups = getTimelineExpansionGroups(timeline);

    return b`
      <div class="practice-row">
        <div class="practice-header">
          <div class="practice-title">
            ${practice.name || "Practice"} (${targetLabel}${partialLabel}, ${practice.daysPerWeek} days/week)
          </div>
          <div class="practice-actions">
            <button class="set-button" @click=${() => this._openEditPracticeModal(practice)}>Edit</button>
            <button class="delete-button" @click=${() => this._confirmRemovePractice(practice.id)}>Delete</button>
          </div>
        </div>
        <div class="timeline-context" aria-live="polite">
          <span class="timeline-overview">${overviewUnit} overview</span>
          <span class="timeline-expanded">
            ${expandedPath
              ? b`Expanded: ${expandedPath} → ${expandedUnit}`
              : "All days shown"}
          </span>
        </div>
        <div
          class="practice-timeline"
          data-timeline-key=${timelineKey}
          aria-label="${practice.name || "Practice"} progress timeline"
        >
          <div
            class="timeline-grid"
            style="
              grid-template-columns: repeat(${Math.max(timeline.blocks.length, 1)}, minmax(${PRACTICE_BLOCK_MIN_WIDTH}px, 1fr));
              min-width: ${minimumGridWidth}px;
            "
          >
            ${timeline.blocks.map((block, index) =>
              this._renderPracticeTimelineBlock(
                goal,
                practice,
                timelineKey,
                block,
                timeline.largestUnit,
                index + 1,
                now
              )
            )}
            ${expansionGroups.map((group) => b`
              <div
                class="timeline-expansion-outline"
                style="
                  grid-column: ${group.columnStart} / span ${group.columnSpan};
                  height: ${group.height}px;
                "
                aria-hidden="true"
              ></div>
            `)}
          </div>
        </div>
      </div>
    `;
  }

  _renderPracticeTimelineBlock(goal, practice, timelineKey, block, largestUnit, column, now) {
    const appearance = getPracticeBlockAppearance(practice, block, now);
    const isDay = block.unit === "day";
    const finerUnit = getNextFinerTimelineUnit(block.unit);
    const value = isDay ? getPracticeValueForDate(practice, block.start) : 0;
    const dayValue = appearance.counts.future === 1
      ? "future"
      : practice.mode === "checkbox"
        ? (value > 0 ? "done" : "missed")
        : `${value} ${practice.unit}`;
    const summary = isDay
      ? `${block.start}: ${dayValue}`
      : formatPracticeBlockSummary(block, appearance.counts);
    const tooltip = finerUnit ? `${summary}. Click to expand to ${finerUnit}s.` : summary;
    const blockHeight = getTimelineBlockHeight(block.unit, largestUnit);

    return b`
      <button
        type="button"
        class="timeline-block ${block.current ? "current" : ""} ${block.selected ? "selected" : ""}"
        style="
          background: ${appearance.background};
          grid-column: ${column};
          height: ${blockHeight}px;
        "
        title=${tooltip}
        aria-label=${tooltip}
        @click=${() =>
          isDay
            ? this._openPracticeDayModal(practice.id, goal.id, block.start)
            : this._expandPracticeTimelineBlock(timelineKey, block)}
      ></button>
    `;
  }

  _expandPracticeTimelineBlock(timelineKey, block) {
    const deepestUnit = getNextFinerTimelineUnit(block.unit);
    if (!deepestUnit) return;
    this.timelineSelections = {
      ...this.timelineSelections,
      [timelineKey]: {
        focusDate: block.start,
        deepestUnit,
      },
    };
  }

  _syncTimelineObservers() {
    if (!this._timelineResizeObserver) return;
    const currentTimelines = new Set(this.renderRoot.querySelectorAll(".practice-timeline"));

    for (const timeline of this._observedTimelines) {
      if (!currentTimelines.has(timeline)) this._timelineResizeObserver.unobserve(timeline);
    }
    for (const timeline of currentTimelines) {
      if (!this._observedTimelines.has(timeline)) this._timelineResizeObserver.observe(timeline);
    }
    this._observedTimelines = currentTimelines;
  }

  _renderAddModal() {
    return b`
      <div class="modal" @click=${this._closeAddModal}>
        <div class="modal-content" @click=${(event) => event.stopPropagation()}>
          <h2>New Goal</h2>
          <label>Name</label>
          <input
            type="text"
            inputmode="text"
            .value=${this.newGoal.name}
            @input=${(event) => this._updateNewGoal("name", event.target.value)}
          />
          <label>Unit</label>
          <input
            type="text"
            inputmode="text"
            .value=${this.newGoal.unit}
            @input=${(event) => this._updateNewGoal("unit", event.target.value)}
          />
          <label>Starting Value</label>
          <input
            type="number"
            inputmode="decimal"
            step="any"
            .value=${this.newGoal.startValue}
            @input=${(event) => this._updateNewGoal("startValue", this._numberInputValue(event.target.value))}
          />
          <label>Current Value</label>
          <input
            type="number"
            inputmode="decimal"
            step="any"
            .value=${this.newGoal.progress}
            @input=${(event) => this._updateNewGoal("progress", this._numberInputValue(event.target.value))}
          />
          <label>Target Value</label>
          <input
            type="number"
            inputmode="decimal"
            step="any"
            .value=${this.newGoal.target}
            @input=${(event) => this._updateNewGoal("target", this._numberInputValue(event.target.value))}
          />
          <label>Start Date</label>
          <input type="date" .value=${this.newGoal.start} @input=${(event) => this._updateNewGoal("start", event.target.value)} />
          <label>End Date</label>
          <input type="date" .value=${this.newGoal.end} @input=${(event) => this._updateNewGoal("end", event.target.value)} />
          <div class="modal-actions">
            <button @click=${this._saveGoal}>Save</button>
            <button class="secondary-button" @click=${this._closeAddModal}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderDeleteModal() {
    const goal = this.goals.find((item) => item.id === this.confirmingDeleteId);
    if (!goal) {
      this.confirmingDeleteId = null;
      return "";
    }

    return b`
      <div class="modal" @click=${this._cancelRemove}>
        <div class="modal-content" @click=${(event) => event.stopPropagation()}>
          <h2>Delete Goal</h2>
          <p>Are you sure you want to delete "${goal.name}"?</p>
          <div class="modal-actions">
            <button class="danger-button" @click=${() => this._removeGoalImmediately(goal.id)}>Delete</button>
            <button class="secondary-button" @click=${this._cancelRemove}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderSetProgressModal() {
    return b`
      <div class="modal" @click=${this._closeSetProgressModal}>
        <div class="modal-content" @click=${(event) => event.stopPropagation()}>
          <h2>Set Progress</h2>
          <p>${this.progressEditingGoal.name}</p>
          <label>Progress (${this.progressEditingGoal.unit})</label>
          <input
            type="number"
            inputmode="decimal"
            step="any"
            min=${Math.min(this.progressEditingGoal.startValue, this.progressEditingGoal.target)}
            max=${Math.max(this.progressEditingGoal.startValue, this.progressEditingGoal.target)}
            .value=${this.progressEditingGoal.progress}
            @input=${(event) =>
              (this.progressEditingGoal = {
                ...this.progressEditingGoal,
                progress: this._numberInputValue(event.target.value),
              })}
          />
          <div class="modal-actions">
            <button @click=${this._saveProgress}>Save</button>
            <button class="secondary-button" @click=${this._closeSetProgressModal}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderPracticeModal() {
    const practice = this.practiceEditing;
    const isEqualComparison = practice.comparison === "equal";
    const isGreaterComparison =
      practice.comparison === "greater_than" || practice.comparison === "greater_than_or_equal";
    const isLessComparison =
      practice.comparison === "less_than" || practice.comparison === "less_than_or_equal";

    return b`
      <div class="modal" @click=${this._closePracticeModal}>
        <div class="modal-content" @click=${(event) => event.stopPropagation()}>
          <h2>${practice.id && this.practices.some((item) => item.id === practice.id) ? "Edit Practice" : "New Practice"}</h2>
          <label>Name</label>
          <input
            type="text"
            inputmode="text"
            .value=${practice.name}
            @input=${(event) => this._updatePractice("name", event.target.value)}
          />
          <label>Mode</label>
          <select .value=${practice.mode} @change=${(event) => this._updatePractice("mode", event.target.value)}>
            <option value="number">Number</option>
            <option value="checkbox">Checkbox</option>
          </select>
          ${practice.mode === "number"
            ? b`
                <label>Unit</label>
                <input
                  type="text"
                  inputmode="text"
                  .value=${practice.unit}
                  @input=${(event) => this._updatePractice("unit", event.target.value)}
                />
                <label>Daily Target</label>
                <input
                  type="number"
                  inputmode="decimal"
                  step="any"
                  min="1"
                  .value=${practice.targetPerDay}
                  @input=${(event) => this._updatePractice("targetPerDay", this._numberInputValue(event.target.value))}
                />
                <div class="field-label-with-help">
                  <label>Target Comparison</label>
                  <span class="help-tooltip" tabindex="0" aria-label="Target comparison help">
                    ?
                    <span class="help-tooltip-content" role="tooltip">
                      Target Comparison defines what counts as successful. Greater than means you
                      want to exceed the stated target value. Less than means you want to stay below
                      the stated target value. The inclusive options also count the target itself as
                      successful, while Equal to requires the logged value to match the target.
                    </span>
                  </span>
                </div>
                <select
                  .value=${practice.comparison}
                  @change=${(event) => this._updatePractice("comparison", event.target.value)}
                >
                  ${PRACTICE_COMPARISONS.map((comparison) => b`
                    <option value=${comparison}>${PRACTICE_COMPARISON_LABELS[comparison]}</option>
                  `)}
                </select>
                <label class="toggle-label ${isEqualComparison ? "disabled" : ""}">
                  <input
                    type="checkbox"
                    .checked=${!isEqualComparison && practice.partialProgressEnabled}
                    .disabled=${isEqualComparison}
                    @change=${(event) => this._updatePractice("partialProgressEnabled", event.target.checked)}
                  />
                  Enable partial progress
                </label>
                ${!isEqualComparison && practice.partialProgressEnabled
                  ? b`
                      ${isGreaterComparison
                        ? b`
                            <label>Partial Minimum</label>
                            <input
                              class="partial-bound"
                              type="number"
                              inputmode="decimal"
                              step="any"
                              min="0"
                              max=${practice.targetPerDay}
                              required
                              .value=${practice.partialProgressMin}
                              @input=${(event) => this._updatePractice("partialProgressMin", this._numberInputValue(event.target.value))}
                            />
                            <p class="field-hint">
                              Required. Partial progress runs from this minimum up to the target.
                            </p>
                          `
                        : ""}
                      ${isLessComparison
                        ? b`
                            <label>Partial Maximum</label>
                            <input
                              class="partial-bound"
                              type="number"
                              inputmode="decimal"
                              step="any"
                              min=${practice.targetPerDay}
                              required
                              .value=${practice.partialProgressMax}
                              @input=${(event) => this._updatePractice("partialProgressMax", this._numberInputValue(event.target.value))}
                            />
                            <p class="field-hint">
                              Required. Partial progress runs from the target up to this maximum.
                            </p>
                          `
                        : ""}
                    `
                  : ""}
              `
            : ""}
          <label>Days/Week</label>
          <input
            type="number"
            inputmode="numeric"
            step="1"
            min="1"
            max="7"
            .value=${practice.daysPerWeek}
            @input=${(event) => this._updatePractice("daysPerWeek", this._numberInputValue(event.target.value))}
          />
          <label>Linked Goals</label>
          <div class="goal-checkboxes">
            ${this.goals.map((goal) => b`
              <label>
                <input
                  type="checkbox"
                  .checked=${practice.goalIds.includes(goal.id)}
                  @change=${(event) => this._togglePracticeGoal(goal.id, event.target.checked)}
                />
                ${goal.name || "Untitled goal"}
              </label>
            `)}
          </div>
          <div class="modal-actions">
            <button @click=${this._savePractice}>Save</button>
            <button class="secondary-button" @click=${this._closePracticeModal}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderPracticeDeleteModal() {
    const practice = this.practices.find((item) => item.id === this.confirmingPracticeDeleteId);
    if (!practice) {
      this.confirmingPracticeDeleteId = null;
      return "";
    }

    return b`
      <div class="modal" @click=${this._cancelRemovePractice}>
        <div class="modal-content" @click=${(event) => event.stopPropagation()}>
          <h2>Delete Practice</h2>
          <p>Are you sure you want to delete "${practice.name}"?</p>
          <div class="modal-actions">
            <button class="danger-button" @click=${() => this._removePracticeImmediately(practice.id)}>Delete</button>
            <button class="secondary-button" @click=${this._cancelRemovePractice}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderPracticeDayModal() {
    const practice = this.practices.find((item) => item.id === this.practiceDayEdit.practiceId);
    const goal = this.goals.find((item) => item.id === this.practiceDayEdit.goalId);
    if (!practice || !goal) return "";

    return b`
      <div class="modal" @click=${this._closePracticeDayModal}>
        <div class="modal-content" @click=${(event) => event.stopPropagation()}>
          <h2>Edit Practice</h2>
          <p>${practice.name} <strong>${this.practiceDayEdit.date}</strong></p>
          ${practice.mode === "checkbox"
            ? b`
                <label>
                  <input
                    type="checkbox"
                    .checked=${this.practiceDayEdit.value > 0}
                    @change=${(event) =>
                      (this.practiceDayEdit = {
                        ...this.practiceDayEdit,
                        value: event.target.checked ? 1 : 0,
                      })}
                  />
                  Done
                </label>
              `
            : b`
                <label>Value (${practice.unit})</label>
                <input
                  type="number"
                  inputmode="decimal"
                  step="any"
                  min="0"
                  .value=${this.practiceDayEdit.value}
                  @input=${(event) =>
                    (this.practiceDayEdit = {
                      ...this.practiceDayEdit,
                      value: this._numberInputValue(event.target.value),
                    })}
                />
              `}
          <div class="day-nav">
            <button @click=${this._prevPracticeDay}>Previous</button>
            <button @click=${this._setPracticeToday}>Today</button>
            <button @click=${this._nextPracticeDay}>Next</button>
          </div>
          <div class="modal-actions">
            <button @click=${this._savePracticeValue}>Save</button>
            <button class="secondary-button" @click=${this._closePracticeDayModal}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _openAddModal() {
    const start = todayIso();
    this.newGoal = {
      id: createId(),
      name: "",
      unit: "",
      startValue: 0,
      target: 1,
      progress: 0,
      start,
      end: start,
    };
    this.showModal = true;
  }

  _closeAddModal() {
    this.showModal = false;
  }

  _updateNewGoal(key, value) {
    const shouldSyncProgress =
      key === "startValue" &&
      (this.newGoal.progress === this.newGoal.startValue || this.newGoal.progress === "");
    this.newGoal = {
      ...this.newGoal,
      [key]: value,
      ...(shouldSyncProgress ? { progress: value } : {}),
      ...(key === "start" && this.newGoal.end < value ? { end: value } : {}),
    };
  }

  _openSetProgressModal(goal) {
    this.progressEditingGoal = { ...goal };
  }

  _closeSetProgressModal() {
    this.progressEditingGoal = null;
  }

  _openAddPracticeModal() {
    this.practiceEditing = normalizePractice({
      id: createId(),
      name: "",
      mode: "number",
      unit: "",
      targetPerDay: 1,
      comparison: "greater_than_or_equal",
      partialProgressEnabled: true,
      partialProgressMin: 0,
      partialProgressMax: 1,
      daysPerWeek: 5,
      goalIds: this.goals[0] ? [this.goals[0].id] : [],
      entries: {},
    });
  }

  _openEditPracticeModal(practice) {
    this.practiceEditing = normalizePractice(practice);
  }

  _closePracticeModal() {
    this.practiceEditing = null;
  }

  _updatePractice(key, value) {
    const updatedPractice = {
      ...this.practiceEditing,
      [key]: value,
    };

    if (key === "comparison") {
      if (value === "equal") {
        updatedPractice.partialProgressEnabled = false;
        updatedPractice.partialProgressMin = updatedPractice.targetPerDay;
        updatedPractice.partialProgressMax = updatedPractice.targetPerDay;
      } else if (value === "greater_than" || value === "greater_than_or_equal") {
        updatedPractice.partialProgressMax = updatedPractice.targetPerDay;
      } else {
        updatedPractice.partialProgressMin = updatedPractice.targetPerDay;
      }
    }

    if (key === "targetPerDay") {
      const target = Number(value);
      if (Number.isFinite(target)) {
        if (
          updatedPractice.comparison === "greater_than" ||
          updatedPractice.comparison === "greater_than_or_equal"
        ) {
          updatedPractice.partialProgressMax = value;
          if (Number(updatedPractice.partialProgressMin) > target) {
            updatedPractice.partialProgressMin = value;
          }
        } else if (
          updatedPractice.comparison === "less_than" ||
          updatedPractice.comparison === "less_than_or_equal"
        ) {
          updatedPractice.partialProgressMin = value;
          if (Number(updatedPractice.partialProgressMax) < target) {
            updatedPractice.partialProgressMax = value;
          }
        } else {
          updatedPractice.partialProgressMin = value;
          updatedPractice.partialProgressMax = value;
        }
      }
    }

    this.practiceEditing = updatedPractice;
  }

  _numberInputValue(value) {
    return String(value);
  }

  _togglePracticeGoal(goalId, checked) {
    const goalIds = checked
      ? [...this.practiceEditing.goalIds, goalId]
      : this.practiceEditing.goalIds.filter((item) => item !== goalId);
    this._updatePractice("goalIds", goalIds);
  }

  _openPracticeDayModal(practiceId, goalId, date) {
    const practice = this.practices.find((item) => item.id === practiceId);
    if (!practice) return;

    this.practiceDayEdit = {
      practiceId,
      goalId,
      date,
      value: getPracticeValueForDate(practice, date),
    };
    this.showPracticeDayModal = true;
  }

  _closePracticeDayModal() {
    this.showPracticeDayModal = false;
  }

  async _saveGoal() {
    const goal = normalizeGoal({
      ...this.newGoal,
      daily: generateDailyArray(this.newGoal.start, this.newGoal.end),
    });
    this._closeAddModal();
    await this._saveGoalToBackend(goal);
  }

  _confirmRemove(goalId) {
    this.confirmingDeleteId = goalId;
  }

  _cancelRemove() {
    this.confirmingDeleteId = null;
  }

  async _removeGoalImmediately(goalId) {
    this.confirmingDeleteId = null;
    try {
      const result = await this._callGoalTracker("delete_goal", { goal_id: goalId });
      this.goals = result.goals || [];
      this.practices = result.practices || this.practices;
      this._clearStorageMessages();
    } catch (error) {
      this._handleBackendError(error);
    }
  }

  async _saveProgress() {
    const updatedGoal = normalizeGoal(this.progressEditingGoal);
    this._closeSetProgressModal();
    await this._setProgress(updatedGoal.id, updatedGoal.progress);
  }

  async _incrementProgress(goalId, delta) {
    const goal = this.goals.find((item) => item.id === goalId);
    if (!goal) return;
    await this._setProgress(goalId, goal.progress + delta);
  }

  async _savePractice() {
    const partialBound = this.shadowRoot?.querySelector(".partial-bound");
    if (partialBound && !partialBound.checkValidity()) {
      partialBound.reportValidity();
      return;
    }
    const practice = normalizePractice(this.practiceEditing);
    this._closePracticeModal();
    await this._savePracticeToBackend(practice);
  }

  _confirmRemovePractice(practiceId) {
    this.confirmingPracticeDeleteId = practiceId;
  }

  _cancelRemovePractice() {
    this.confirmingPracticeDeleteId = null;
  }

  async _removePracticeImmediately(practiceId) {
    this.confirmingPracticeDeleteId = null;
    try {
      const result = await this._callGoalTracker("delete_practice", { practice_id: practiceId });
      this.goals = result.goals || this.goals;
      this.practices = result.practices || [];
      this._clearStorageMessages();
    } catch (error) {
      this._handleBackendError(error);
    }
  }

  async _savePracticeValue() {
    const { practiceId, date, value } = this.practiceDayEdit;
    this._closePracticeDayModal();
    try {
      const result = await this._callGoalTracker("set_practice_value", {
        practice_id: practiceId,
        date,
        value,
      });
      this.goals = result.goals || this.goals;
      this.practices = result.practices || [];
      this._clearStorageMessages();
    } catch (error) {
      this._handleBackendError(error);
    }
  }

  _movePracticeDay(delta) {
    const goal = this.goals.find((item) => item.id === this.practiceDayEdit.goalId);
    const practice = this.practices.find((item) => item.id === this.practiceDayEdit.practiceId);
    if (!goal || !practice) return;
    const currentIndex = countDaysBetween(goal.start, this.practiceDayEdit.date) - 1;
    const totalDays = countDaysBetween(goal.start, goal.end);
    const index = Math.min(Math.max(currentIndex + delta, 0), totalDays - 1);
    const date = addDaysIso(goal.start, index);
    this.practiceDayEdit = {
      practiceId: practice.id,
      goalId: goal.id,
      date,
      value: getPracticeValueForDate(practice, date),
    };
  }

  _nextPracticeDay() {
    this._movePracticeDay(1);
  }

  _prevPracticeDay() {
    this._movePracticeDay(-1);
  }

  _setPracticeToday() {
    const goal = this.goals.find((item) => item.id === this.practiceDayEdit.goalId);
    const practice = this.practices.find((item) => item.id === this.practiceDayEdit.practiceId);
    if (!goal || !practice) return;
    const today = todayIso();
    if (today < goal.start || today > goal.end) return;
    this.practiceDayEdit = {
      practiceId: practice.id,
      goalId: goal.id,
      date: today,
      value: getPracticeValueForDate(practice, today),
    };
  }

  async _loadGoals() {
    if (!this.hass || !this.config || this._loadingGoals) return;
    this._loadingGoals = true;
    try {
      if (!this._seededConfig && Array.isArray(this.config.goals) && this.config.goals.length) {
        await this._callGoalTracker("seed_goals", { goals: this.config.goals });
        this._seededConfig = true;
      }

      let result = await this._callGoalTracker("get_data");
      if (!this._migratedLocalStorage && (!result.goals || result.goals.length === 0)) {
        const migrated = this._readLegacyBrowserData();
        if (migrated.goals.length) {
          await this._callGoalTracker("seed_goals", { goals: migrated.goals });
          for (const practice of migrated.practices) {
            await this._callGoalTracker("save_practice", { practice });
          }
          result = await this._callGoalTracker("get_data");
          this.storageNotice = "Imported existing browser-stored goals into Home Assistant storage.";
        }
        this._migratedLocalStorage = true;
      }

      this.goals = result.goals || [];
      this.practices = result.practices || [];
      this._loaded = true;
      this.storageError = "";
    } catch (error) {
      this._handleBackendError(error);
    } finally {
      this._loadingGoals = false;
    }
  }

  async _saveGoalToBackend(goal) {
    try {
      const result = await this._callGoalTracker("save_goal", { goal });
      this.goals = result.goals || [];
      this.practices = result.practices || this.practices;
      this._clearStorageMessages();
    } catch (error) {
      this._handleBackendError(error);
    }
  }

  async _setProgress(goalId, progress) {
    try {
      const result = await this._callGoalTracker("set_progress", {
        goal_id: goalId,
        progress,
      });
      this.goals = result.goals || [];
      this.practices = result.practices || this.practices;
      this._clearStorageMessages();
    } catch (error) {
      this._handleBackendError(error);
    }
  }

  _callGoalTracker(command, payload = {}) {
    if (!this.hass?.callWS) {
      return Promise.reject(new Error("Home Assistant WebSocket API is not available."));
    }
    return this.hass.callWS({
      type: `goal_tracker/${command}`,
      ...payload,
    });
  }

  async _savePracticeToBackend(practice) {
    try {
      const result = await this._callGoalTracker("save_practice", { practice });
      this.goals = result.goals || this.goals;
      this.practices = result.practices || [];
      this._clearStorageMessages();
    } catch (error) {
      this._handleBackendError(error);
    }
  }

  _readLegacyBrowserData() {
    try {
      const value = window.localStorage.getItem(this.config.storage_key || DEFAULT_STORAGE_KEY);
      const parsed = value ? parseStoredGoals(value) : null;
      return {
        goals: parsed?.goals || [],
        practices: parsed?.practices || [],
      };
    } catch (error) {
      console.warn("Failed to read legacy browser storage:", error);
      return { goals: [], practices: [] };
    }
  }

  _handleBackendError(error) {
    this.storageError = "Goal Tracker integration is not loaded. Add the Goal Tracker integration or restart Home Assistant after installing it.";
    this.storageNotice = "";
    console.warn("Goal Tracker backend call failed:", error);
  }

  _clearStorageMessages() {
    this.storageError = "";
    this.storageNotice = "";
  }

  _getCardSize() {
    return 3 + this.goals.length + this.practices.length;
  }

  async _addTestGoals() {
    const today = new Date();
    const todayStr = toIsoDate(today);

    const runStart = new Date(today);
    runStart.setUTCDate(runStart.getUTCDate() - 15);
    const runStartStr = toIsoDate(runStart);

    const runEnd = new Date(today);
    runEnd.setUTCDate(runEnd.getUTCDate() + 15);
    const runEndStr = toIsoDate(runEnd);

    const readEnd = new Date(today);
    readEnd.setUTCDate(readEnd.getUTCDate() + 30);
    const readEndStr = toIsoDate(readEnd);

    const runDaily = this._generateMockDaily(
      [
        [0, 0],
        [1, 1],
        [2, 3],
        [3, 0],
        [4, 2],
      ],
      countDaysBetween(runStartStr, runEndStr)
    );

    const readDaily = this._generateMockDaily(
      [
        [0, 10],
        [1, 10],
        [2, 0],
        [3, 10],
        [4, 5],
      ],
      countDaysBetween(todayStr, readEndStr)
    );

    const testGoals = [
      normalizeGoal({
        id: createId(),
        name: "_TEST_ Run",
        unit: "km",
        target: 50,
        start: runStartStr,
        end: runEndStr,
        daily: runDaily,
        progress: runDaily.reduce((sum, value) => sum + value, 0),
      }),
      normalizeGoal({
        id: createId(),
        name: "_TEST_ Read",
        unit: "pages",
        target: 300,
        start: todayStr,
        end: readEndStr,
        daily: readDaily,
        progress: readDaily.reduce((sum, value) => sum + value, 0),
      }),
    ];

    const testPractices = testGoals.map(createPracticeFromGoalDaily).filter(Boolean);

    for (const goal of testGoals) {
      await this._saveGoalToBackend(goal);
    }
    for (const practice of testPractices) {
      await this._savePracticeToBackend({
        ...practice,
        name: `_TEST_ ${practice.name.replace(/^_TEST_ /, "")} Practice`,
      });
    }
  }

  async _removeTestGoals() {
    try {
      const result = await this._callGoalTracker("remove_test_goals");
      this.goals = result.goals || [];
      this._clearStorageMessages();
    } catch (error) {
      this._handleBackendError(error);
    }
  }

  _generateMockDaily(values, totalLength) {
    const arr = new Array(totalLength).fill(0);
    values.forEach(([index, value]) => {
      if (index >= 0 && index < totalLength) arr[index] = value;
    });
    return arr;
  }
}

customElements.define("goal-tracker-card", GoalTrackerCard);
