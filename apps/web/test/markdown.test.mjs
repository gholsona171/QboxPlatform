import assert from "node:assert/strict";
import test from "node:test";

import { renderMarkdown } from "../public/js/markdown.js";

test("markdown escapes HTML before formatting", () => {
  assert.equal(renderMarkdown('<script>alert("x")</script>'), "<p>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;</p>");
  assert.equal(renderMarkdown("[x](javascript:alert(1))"), "<p>[x](javascript:alert(1))</p>");
  assert.equal(renderMarkdown('[x](https://a.test/" onmouseover="y)'), '<p>[x](https://a.test/&quot; onmouseover=&quot;y)</p>');
});

test("markdown formats headings, emphasis, links, lists, and code", () => {
  assert.equal(renderMarkdown("# Title"), "<h3>Title</h3>");
  assert.equal(renderMarkdown("**bold** and *italic* and _also_"), "<p><strong>bold</strong> and <em>italic</em> and <em>also</em></p>");
  assert.equal(renderMarkdown("See [docs](https://example.com/a_b_c)"), '<p>See <a href="https://example.com/a_b_c" target="_blank" rel="noopener noreferrer">docs</a></p>');
  assert.equal(renderMarkdown("- one\n- two\n1. first"), "<ul><li>one</li><li>two</li></ul><ol><li>first</li></ol>");
  assert.equal(renderMarkdown("Use `**not bold**`"), "<p>Use <code>**not bold**</code></p>");
  assert.equal(renderMarkdown("```\n<b>x</b>\n```"), "<pre><code>&lt;b&gt;x&lt;/b&gt;</code></pre>");
});
