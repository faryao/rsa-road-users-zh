let all=[],lang=localStorage.getItem('lang')||((navigator.language||'').startsWith('zh')?'zh':'en');
const $=s=>document.querySelector(s), norm=s=>(s||'').toLowerCase();
function current(){return decodeURIComponent(location.hash.slice(1))||''}
function render(){
  document.documentElement.lang=lang==='zh'?'zh-CN':'en'; $('#lang').textContent=lang==='en'?'中文':'English';
  const q=norm($('#search').value); const list=all.filter(x=>x.lang===lang&&(!q||norm(x.title+' '+x.text).includes(q)));
  $('#nav').innerHTML=list.map(x=>`<a href="#${encodeURIComponent(x.slug)}" class="${x.slug===current()?'active':''}"><span>${x.title}</span><small>${x.slug||'overview'}</small></a>`).join('')||'<p class="empty">No results / 无结果</p>';
  const page=all.find(x=>x.lang===lang&&x.slug===current())||all.find(x=>x.lang===lang&&x.slug==='');
  if(page){document.title=page.title+' · RSA Road Users';$('#main').innerHTML=`<div class="notice">${lang==='zh'?'非官方中文参考译本。法律及安全信息请以 RSA 原网页为准。':'Unofficial reference mirror. Check the RSA source for current legal and safety guidance.'}</div><article>${page.html}</article>`;window.scrollTo(0,0)}
}
fetch('./data.json').then(r=>r.json()).then(x=>{all=x;render()});
$('#lang').onclick=()=>{lang=lang==='en'?'zh':'en';localStorage.setItem('lang',lang);render()};
$('#search').oninput=render; addEventListener('hashchange',render);
