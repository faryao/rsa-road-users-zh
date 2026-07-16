# RSA 道路使用者指南（中文）

爱尔兰道路安全局（RSA）“道路使用者”栏目中文参考译本，使用 Markdown 编写并通过 Material for MkDocs 发布。

## Local development

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
mkdocs serve

# 按需更新原始页面和中文翻译
npm run sync
```

中文内容存放在 `content/zh`。Material for MkDocs 提供导航、全文搜索、深色模式和响应式布局。

> 本项目是非官方中文参考译本。原始内容属于爱尔兰道路安全局。有关最新法律和安全信息，请始终查阅页面中链接的 RSA 官方网页。
