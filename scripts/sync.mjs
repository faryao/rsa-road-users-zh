import fs from 'node:fs/promises';
import path from 'node:path';
import { pages } from './pages.mjs';

const root = 'https://www.rsa.ie/road-safety/road-users';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function retry(url, options, tries = 4) {
  let error;
  for (let i = 0; i < tries; i++) try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response;
  } catch (e) { error = e; await sleep(700 * (i + 1)); }
  throw error;
}

function clean(raw, source, title) {
  let body = raw.replace(/^Title:.*?Markdown Content:\s*/s, '').trim();
  body = body.replace(/!\[[^\]]*\]\(blob:[^)]+\)\s*/g, '');
  const lines = body.split('\n');
  const articleHeading = lines.findLastIndex(line => /^#\s+\S/.test(line));
  if (articleHeading >= 0) body = lines.slice(articleHeading + 1).join('\n').trim();
  const service = body.indexOf('\n## RSA online services');
  if (service > 0) body = body.slice(0, service);
  body = body.replace(/^1\.\s+\[Services\][\s\S]*?^3\.\s+.*?\n/m, '');
  return `---\ntitle: "${title.replaceAll('"','\\"')}"\nsource: "${source}"\nupdated: "${new Date().toISOString().slice(0,10)}"\n---\n\n# ${title}\n\n${body}\n\n---\n\n[View the current official RSA page](${source})\n`;
}

async function translateText(text) {
  const protectedItems = [];
  let safe = text.replace(/(```[\s\S]*?```|`[^`]*`|https?:\/\/[^\s)>]+|\{[^}]+\})/g, m => `ZXQ${protectedItems.push(m)-1}QXZ`);
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  Object.entries({client:'gtx',sl:'en',tl:'zh-CN',dt:'t',q:safe}).forEach(([k,v]) => url.searchParams.set(k,v));
  const data = await (await retry(url)).json();
  let out = data[0].map(x => x[0]).join('');
  protectedItems.forEach((v,i) => out = out.replace(new RegExp(`ZXQ\\s*${i}\\s*QXZ`,'g'), v));
  return out;
}

async function translateMarkdown(md) {
  const [front, ...rest] = md.split('---\n').slice(1);
  const source = front.match(/source: "([^"]+)/)?.[1] || root;
  const title = front.match(/title: "([^"]+)/)?.[1] || '道路使用者';
  const body = rest.join('---\n').replace(/\[View the current official RSA page\]\([^)]+\)\s*$/,'');
  const chunks = body.match(/[\s\S]{1,3500}(?:\n\n|$)/g) || [body];
  const translated = [];
  for (const chunk of chunks) { translated.push(await translateText(chunk)); await sleep(120); }
  const zhTitle = await translateText(title);
  const normalized = translated.join('')
    .replace(/^(#{1,6})(?=\S)/gm, '$1 ')
    .replace(/^【([^\n]+)\]\(/gm, '[$1](')
    .replace(/^【([^\n]+)】\(/gm, '[$1](')
    .replace(/^\*\* \*\*$/gm, '---');
  return `---\ntitle: "${zhTitle}"\nsource: "${source}"\nupdated: "${new Date().toISOString().slice(0,10)}"\n---\n\n${normalized}\n\n---\n\n[查看 RSA 当前官方页面](${source})\n`;
}

await fs.mkdir('content/en', {recursive:true});
await fs.mkdir('content/zh', {recursive:true});
const filter = process.argv[2];
const selectedPages = filter ? pages.filter(([slug]) => slug === filter || slug.startsWith(`${filter}/`)) : pages;
for (let i=0; i<selectedPages.length; i++) {
  const [slug,title,sourceSlug = slug] = selectedPages[i];
  const source = `${root}${sourceSlug ? '/'+sourceSlug : ''}`;
  const file = slug || 'index';
  const target = path.join('content/en', `${file}.md`);
  const zhTarget = path.join('content/zh', `${file}.md`);
  await fs.mkdir(path.dirname(target), {recursive:true});
  await fs.mkdir(path.dirname(zhTarget), {recursive:true});
  try {
    const raw = await (await retry(`https://r.jina.ai/http://${source.replace('https://','')}`)).text();
    const en = clean(raw, source, title);
    await fs.writeFile(target, en);
    await fs.writeFile(zhTarget, await translateMarkdown(en));
    console.log(`${i+1}/${selectedPages.length} ${slug || 'index'}`);
  } catch (e) { console.error(`FAILED ${slug}: ${e.message}`); }
}
