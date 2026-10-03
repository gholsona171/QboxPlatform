import { type Interaction } from "discord.js";
import { type VerificationService } from "@qbox/verification";
/** Handles the panel button, the captcha code button, and the verification forms. */
export declare class VerificationInteractionHandler {
    private readonly verification;
    constructor(verification: VerificationService);
    handle(interaction: Interaction): Promise<void>;
    private button;
    private modal;
    private fail;
}
//# sourceMappingURL=VerificationInteractionHandler.d.ts.map