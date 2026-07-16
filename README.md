# RSA Road Users — English / 中文

A bilingual, Markdown-based reference mirror of the Road Safety Authority's Road Users section, rendered with Material for MkDocs.

## Local development

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
mkdocs serve

# Refresh source pages and Chinese translations when needed
npm run sync
```

Content is stored under `content/en` and `content/zh`. Material for MkDocs provides navigation, full-text search, dark mode, responsive layouts, and a page-aware language switch.

> Unofficial reference project. Source content belongs to Ireland's Road Safety Authority. Always check the linked RSA page for current official guidance.
