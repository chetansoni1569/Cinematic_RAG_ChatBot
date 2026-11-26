# NEXUS AI

Cinematic scroll-driven landing page plus a working in-browser RAG chat workspace.

## Run
```bash
npm start        # or: npx serve .   /   python3 -m http.server 8000
```
Open the printed URL. Needs internet for Google Fonts, pdf.js and mammoth (CDN).

## Structure
```
index.html        page markup (landing, tech strip, chat workspace)
css/styles.css    all styling (dark theme tokens, nav, story, chat)
js/story.js       pinned canvas visualization + scroll-linked copy panels
js/rag.js         extraction, cleaning, recursive chunking, TF-IDF index, search, answer generation
js/chat.js        chat UI, upload UI, conversations, streaming, citations
```

## What works
- PDF / DOCX / TXT / MD ingestion in the browser with per-stage status
- Recursive chunking with configurable size and overlap
- Cosine search over local TF-IDF vectors; cited, extractive answers
- Says "I couldn't find sufficient information..." when nothing relevant is retrieved

## Not configured (integration points)
- `embed()` in `js/rag.js`: replace with a dense embedding API + vector database
- `generate()` in `js/rag.js`: replace with an LLM call that receives the retrieved chunks as context (needs a backend to keep API keys private)
- Persistence: documents and chats are in memory only
- OCR for scanned PDFs, reranking
