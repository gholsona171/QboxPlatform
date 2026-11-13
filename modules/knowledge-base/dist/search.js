const STOP_WORDS = new Set([
    "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "do", "does", "for", "from", "get", "has", "have", "how", "i", "if",
    "in", "is", "it", "me", "my", "of", "on", "or", "so", "that", "the", "there", "this", "to", "was", "we", "what", "when", "where",
    "which", "who", "why", "will", "with", "you", "your", "hi", "hey", "hello", "please", "pls", "thanks", "anyone", "someone",
]);
/** Points for the best place a query word appears. */
const WEIGHT = { title: 10, tag: 6, body: 3 };
/** Lowercase search words from free text, without stop words and duplicates. */
export function searchTerms(query) {
    const words = query
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length >= 2 && !STOP_WORDS.has(word));
    return [...new Set(words)].slice(0, 12);
}
function words(text) {
    return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}
/** A query word matches a text word exactly or as a prefix of 4+ letters ("restart" matches "restarts"). */
function wordMatches(term, word) {
    return word === term || (term.length >= 4 && word.startsWith(term)) || (word.length >= 4 && term.startsWith(word) && term.length - word.length <= 2);
}
/**
 * Ranks one article for the query words. Title matches count most, then tags,
 * then the body. Returns undefined when nothing matches.
 */
export function scoreArticle(article, terms, phrase = "") {
    if (terms.length === 0)
        return undefined;
    const titleWords = words(article.title);
    const tagWords = article.tags.flatMap(words);
    const bodyWords = words(article.body);
    let score = 0;
    let best = 0;
    for (const term of terms) {
        const inTitle = titleWords.some((word) => wordMatches(term, word));
        const inTags = tagWords.some((word) => wordMatches(term, word));
        const bodyHits = bodyWords.filter((word) => wordMatches(term, word)).length;
        const weight = inTitle ? WEIGHT.title : inTags ? WEIGHT.tag : bodyHits > 0 ? WEIGHT.body : 0;
        best += weight;
        score += (inTitle ? WEIGHT.title : 0) + (inTags ? WEIGHT.tag : 0) + Math.min(bodyHits, 5);
    }
    if (best === 0)
        return undefined;
    const normalizedPhrase = phrase.trim().toLowerCase();
    if (normalizedPhrase.length >= 4 && article.title.toLowerCase().includes(normalizedPhrase))
        score += 15;
    if (article.pinned)
        score += 1;
    return { article, score, match: Math.min(100, Math.round((best / (terms.length * WEIGHT.title)) * 100)) };
}
/** Scores and sorts articles for a free-text query, best first. */
export function rankArticles(articles, query) {
    const terms = searchTerms(query);
    return articles
        .map((article) => scoreArticle(article, terms, query))
        .filter((result) => result !== undefined)
        .sort((left, right) => right.score - left.score || right.match - left.match || right.article.views - left.article.views);
}
//# sourceMappingURL=search.js.map