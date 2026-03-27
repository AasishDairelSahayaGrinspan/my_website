# Inkline Blog

Simple static blog setup using HTML, CSS, JavaScript, and Markdown files.

## Run locally

Use any local web server from this folder:

```bash
python3 -m http.server 8000
```

Then open:

- http://localhost:8000/index.html

## How to publish a new post

1. Create a markdown file inside `posts/`, for example `my-second-post.md`.
2. Add a new object to `posts/index.json`.
3. Refresh `index.html` and open the post card.

## Post metadata format

```json
{
  "slug": "my-second-post",
  "title": "My Second Post",
  "date": "2026-03-28",
  "excerpt": "One sentence summary for the card.",
  "readingTime": "6 min read",
  "file": "my-second-post.md"
}
```

Fields:

- `slug`: URL slug used in `post.html?slug=...`
- `title`: Display title
- `date`: ISO date (`YYYY-MM-DD`)
- `excerpt`: Short card preview text
- `readingTime`: Optional label shown on cards
- `file`: Markdown filename inside `posts/`
