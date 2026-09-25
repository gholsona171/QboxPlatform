# Knowledge Base

Write help articles once and let members find them in the portal
(`/knowledge`) and in Discord (`/faq`, `/ask`). Guildhall can also answer common
questions automatically in chosen channels.

## Where the code lives

| Part | Location |
| --- | --- |
| Rules, search, OpenAI answers, Discord REST adapter | `modules/knowledge-base` (`@qbox/knowledge-base`) |
| Database models | `KnowledgeSettings`, `KnowledgeCategory`, `KnowledgeArticle` in `prisma/schema/knowledge.prisma` |
| PostgreSQL repository | `packages/database/src/knowledge/PrismaKnowledgeRepository.ts` |
| `/faq`, `/kb`, `/ask` | `packages/discord/src/commands/Faq.command.ts`, `Kb.command.ts`, `Ask.command.ts` |
| Autocomplete and automatic answers | `packages/discord/src/knowledge/KnowledgeFeature.ts` |
| API | `apps/api/src/knowledge/KnowledgeRoutes.ts` |
| Portal | `apps/web/public/js/knowledge.js`, `apps/web/public/js/markdown.js` |

## Permissions

| Permission | Allows |
| --- | --- |
| `knowledge.manage` | Write, edit, publish, pin, and delete articles; manage categories and settings; post articles with `/kb post` |

Any signed-in server member can read published articles in the portal and use
`/faq`, `/ask`, and `/kb list`. Drafts are only visible to `knowledge.manage`.
Discord administrators can do everything.

## Discord commands

- `/faq query [private]` — shows an article. Titles autocomplete while you type; free text picks the best match. `private` makes the reply visible only to you.
- `/ask question [private]` — answers a question from the knowledge base (see AI answers below).
- `/kb list` — lists published articles by category.
- `/kb post article [channel]` — posts an article publicly (needs `knowledge.manage`).

## Articles

Each article has a title, a slug (generated from the title and kept unique), a
Markdown body, tags, an optional category, a published or draft state, a pin
flag, a view count, the author, and who last edited it. Views count when an
article is opened with `/faq`, suggested automatically, or opened by a member
in the portal. Categories have a name, an optional emoji, and an order number.

The portal editor shows a live preview. The preview escapes all HTML first and
then formats headings, bold, italic, `http(s)` links, lists, and code.
Discord renders the same Markdown natively.

## Search

Search is keyword based and runs in `@qbox/knowledge-base` (`search.ts`):

1. Stop words ("how", "the", "is", ...) are removed from the query.
2. PostgreSQL narrows the candidates with case-insensitive `ILIKE` matches on the title and body, plus tag matches.
3. Each candidate is scored: a word in the **title** is worth 10, in a **tag** 6, in the **body** 3 (plus a little per extra body hit). Longer words also match their forms ("restart" finds "restarts"). The whole query appearing in the title adds a bonus; pinned articles get a small boost.
4. The **match** value (0-100) is how much of the query is covered, weighted the same way. 100 means every word is in the title.

## Automatic answers

In **Knowledge Base > Settings**, turn on automatic answers and choose
channels. When a message there has at least two search words and its best
article's match is at or above the threshold (default 70), Guildhall replies with
the article. Each channel then waits for the cooldown (default 5 minutes)
before answering again.

This needs the privileged **Message Content** intent: enable it in the Discord
Developer Portal (Bot > Privileged Gateway Intents) and set
`DISCORD_MESSAGE_CONTENT_INTENT=true`. Without it the bot receives empty message
text and never suggests anything.

## AI answers

Set `OPENAI_API_KEY` on the bot to let `/ask` write answers. Guildhall sends the
question and the top 3 matching articles to the OpenAI chat completions API
(model `OPENAI_MODEL`, default `gpt-4o-mini`) and tells it to answer only from
those articles. The reply lists the articles it used. Without a key, or if the
call fails or times out (20 seconds), `/ask` shows the best matching article
instead. Only article text is sent; member names and messages are not.

## Setup

1. Grant `knowledge.manage` to the staff who write articles.
2. In the portal, open **Knowledge Base**, add categories, and write articles. Publish them when ready.
3. Optionally turn on automatic answers and AI answers as described above.

## Known limitations

- Search is keyword based, so synonyms ("car" vs "vehicle") only match if you add them as tags.
- Up to 1000 articles and 50 categories per server.
- Discord embeds show the first 4000 characters of an article.
