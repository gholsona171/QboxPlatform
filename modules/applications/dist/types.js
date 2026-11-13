export const QUESTION_TYPES = ["SHORT", "PARAGRAPH", "YES_NO", "CHOICE"];
export const APPLICATION_STATUSES = ["PENDING", "ACCEPTED", "DENIED", "WITHDRAWN"];
export const BUTTON_STYLES = ["PRIMARY", "SECONDARY", "SUCCESS", "DANGER"];
/** Most questions a form can have. */
export const MAX_QUESTIONS = 25;
/** Questions shown per Discord form page (a Discord limit). */
export const QUESTIONS_PER_PAGE = 5;
/** Custom ID prefixes for Discord components. */
export const APPLICATION_CUSTOM_ID = {
    prefix: "qbox:applications:",
    open: "qbox:applications:open:",
    pick: "qbox:applications:pick",
    page: "qbox:applications:page:",
    next: "qbox:applications:next:",
    accept: "qbox:applications:accept:",
    deny: "qbox:applications:deny:",
    up: "qbox:applications:up:",
    down: "qbox:applications:down:",
    reason: "qbox:applications:reason:",
};
//# sourceMappingURL=types.js.map