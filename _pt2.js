const fs = require('fs');
const html = fs.readFileSync('论文工作台_试水版.html', 'utf-8');
function fakeEl(){return{style:{},classList:{add(){},remove(){},toggle(){}},textContent:'',innerHTML:'',value:'',checked:false,disabled:false,onclick:null,dataset:{},addEventListener(){},appendChild(){},removeChild(){},querySelector(){return null},querySelectorAll(){return[]},setAttribute(){},getAttribute(){return null},closest(){return fakeEl()},focus(){},select(){},click(){},remove(){},files:[]};}
global.$ = () => fakeEl();
global.$$ = () => [];
global.document = { createElement: () => fakeEl(), body: fakeEl(), querySelector: () => fakeEl(), querySelectorAll: () => [], execCommand: () => true, addEventListener(){} };
global.window = global;
global.window.addEventListener = () => {};
global.addEventListener = () => {};
global.navigator = { clipboard: { writeText: async () => {} } };
global.localStorage = (() => { const d = {}; return { getItem: k => (k in d ? d[k] : null), setItem: (k,v) => { d[k]=String(v); }, removeItem: k => { delete d[k]; } }; })();
global.toast = () => {}; global.modalBox = () => {}; global.confirm2 = () => {}; global.copyText = async () => {};
global.download = () => {}; global.closeModal = () => {}; global.openDrawer = () => {}; global.closeDrawer = () => {}; global.applyTheme = () => {};
global.location = { hash: '' };
global.Blob = class { constructor(){ this.size=0; } };
global.URL = { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} };
global.FileReader = class { readAsText(){ this.onload && this.onload(); } };
global.Response = class { constructor(){} };
global.DecompressionStream = class { constructor(){} };
global.fetch = async () => ({ json: async () => ({}), text: async () => '' });
global.setTimeout = (fn) => { try{fn&&fn();}catch(e){} return 0; };
global.clearTimeout = () => {};
const m = html.match(/<script>([\s\S]*?)<\/script>/);
let code = m[1].replace(/^init\(\);$/m, '');
const runner = new Function(code + ';return {scanAI,localReview,checkCitations,formatCheck};');
const api = runner();
const dir = '../_papers_test/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt'));
console.log('=== 5 篇论文实测（平台真实本地代码）===');
for (const f of files) {
  const text = fs.readFileSync(dir + f, 'utf-8');
  console.log('='.repeat(58));
  console.log('PDF ', f.replace('.txt',''));
  console.log('字符数:', text.length);
  try { const ai = api.scanAI(text); console.log('1 检查AI味 命中:', ai.count, '处'); }
  catch(e) { console.log('1 检查AI味 ERR:', e.message.slice(0,80)); }
  try {
    const doc = { title: f, type: 'research', chapters: [{name:'全文', content:text}] };
    const r = api.localReview(doc, 'research');
    const dims = r.dims || {};
    console.log('2 本地审稿 总分:', r.total, '| 维度:', JSON.stringify(dims));
  } catch(e) { console.log('2 本地审稿 ERR:', e.message.slice(0,80)); }
  try {
    const cit = api.checkCitations({ chapters: [{name:'正文', content:text}] });
    console.log('3 引用核验:', cit ? ('ok=' + !!cit.ok + ' missing=' + ((cit.missingRefs||[]).length) + ' uncited=' + ((cit.uncitedRefs||[]).length)) : 'null');
  } catch(e) { console.log('3 引用核验 ERR:', e.message.slice(0,80)); }
  try {
    const fmt = api.formatCheck({ title: f, chapters: [{name:'全文', content:text}] }, { maxWord: 8000, minWord: 1000, blind: false });
    console.log('4 格式自查:', Array.isArray(fmt) ? fmt.length + ' 条意见' : '异常');
  } catch(e) { console.log('4 格式自查 ERR:', e.message.slice(0,80)); }
}
