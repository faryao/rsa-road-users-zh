import fs from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';
import { pages } from './pages.mjs';

const out = 'dist';
await fs.rm(out,{recursive:true,force:true}); await fs.mkdir(out,{recursive:true});
const escape = s => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function parse(md){ const m=md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/); const meta={}; m[1].split('\n').forEach(l=>{const i=l.indexOf(':');meta[l.slice(0,i)]=l.slice(i+1).trim().replace(/^"|"$/g,'')}); return {meta,body:m[2]}; }
const records=[];
for(const [slug] of pages) for(const lang of ['en','zh']){
  try { const md=await fs.readFile(path.join('content',lang,`${slug||'index'}.md`),'utf8'); const {meta,body}=parse(md); records.push({lang,slug,title:meta.title,source:meta.source,text:body.replace(/[#*_[\]()`>-]/g,' ').replace(/\s+/g,' ').slice(0,12000),html:marked.parse(body)}); } catch {}
}
await fs.writeFile(path.join(out,'data.json'),JSON.stringify(records));
await fs.cp('public',out,{recursive:true});
const shell=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Bilingual RSA road-user guidance in English and Chinese"><title>RSA Road Users · English / 中文</title><link rel="stylesheet" href="./style.css"></head><body><header><a class="brand" href="./">Road Users <span>道路使用者</span></a><div class="tools"><input id="search" type="search" placeholder="Search / 搜索" aria-label="Search"><button id="lang" aria-label="Switch language">中文</button></div></header><div class="layout"><aside><nav id="nav"></nav></aside><main id="main"><p>Loading…</p></main></div><script src="./app.js"></script></body></html>`;
await fs.writeFile(path.join(out,'index.html'),shell);
