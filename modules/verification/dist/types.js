export const VERIFICATION_MODES = ["BUTTON", "CAPTCHA", "QUESTION"];
export const VERIFICATION_AGE_ACTIONS = ["DENY", "KICK", "FLAG"];
export const VERIFICATION_RESULTS = ["PASSED", "FAILED", "DENIED_AGE", "KICKED", "MANUAL", "REVOKED"];
/** Custom IDs for the panel button, the captcha code button, and the modals. */
export const VERIFICATION_CUSTOM_ID = {
    start: "qbox:verification:start",
    enterCode: "qbox:verification:enter-code",
    captchaForm: "qbox:verification:captcha-form",
    questionForm: "qbox:verification:question-form",
};
/** Discord modals hold at most five text inputs. */
export const MAX_VERIFICATION_QUESTIONS = 5;
//# sourceMappingURL=types.js.map