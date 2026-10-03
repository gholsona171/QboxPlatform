import { z } from "zod";
import type { BuilderAnswers, BuilderBlueprint } from "./types.js";
declare const designedCategorySchema: z.ZodObject<{
    name: z.ZodString;
    emoji: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    access: z.ZodEnum<{
        staff: "staff";
        everyone: "everyone";
        roles: "roles";
    }>;
    roles: z.ZodOptional<z.ZodArray<z.ZodString>>;
    channels: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        emoji: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
        type: z.ZodEnum<{
            TEXT: "TEXT";
            ANNOUNCEMENT: "ANNOUNCEMENT";
            FORUM: "FORUM";
            MEDIA: "MEDIA";
            VOICE: "VOICE";
            STAGE: "STAGE";
        }>;
        topic: z.ZodOptional<z.ZodString>;
        readOnly: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const designedRoleSchema: z.ZodObject<{
    name: z.ZodString;
    color: z.ZodString;
    purpose: z.ZodOptional<z.ZodEnum<{
        staff: "staff";
        department: "department";
        ping: "ping";
    }>>;
}, z.core.$strip>;
/** What the AI designer may return. Everything is checked here; the model never produces a raw blueprint. */
export declare const designedBlueprintSchema: z.ZodObject<{
    serverType: z.ZodEnum<{
        FIVEM_RP: "FIVEM_RP";
        GAMING: "GAMING";
        COMMUNITY: "COMMUNITY";
        BUSINESS: "BUSINESS";
    }>;
    serverName: z.ZodOptional<z.ZodString>;
    staffRanks: z.ZodOptional<z.ZodArray<z.ZodString>>;
    departments: z.ZodOptional<z.ZodArray<z.ZodString>>;
    include: z.ZodOptional<z.ZodRecord<z.ZodEnum<{
        birthdays: "birthdays";
        giveaways: "giveaways";
        polls: "polls";
        suggestions: "suggestions";
        starboard: "starboard";
        tickets: "tickets";
        information: "information";
        verification: "verification";
        applications: "applications";
        levels: "levels";
        media: "media";
        forums: "forums";
        joinToCreate: "joinToCreate";
        fivemStatus: "fivemStatus";
        events: "events";
        staffArea: "staffArea";
        ageRestricted: "ageRestricted";
    }> & z.core.$partial, z.ZodBoolean>>;
    voiceLounges: z.ZodOptional<z.ZodNumber>;
    channelEmojis: z.ZodOptional<z.ZodEnum<{
        ALL: "ALL";
        NONE: "NONE";
        KEY: "KEY";
    }>>;
    removeChannels: z.ZodOptional<z.ZodArray<z.ZodString>>;
    extraRoles: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        color: z.ZodString;
        purpose: z.ZodOptional<z.ZodEnum<{
            staff: "staff";
            department: "department";
            ping: "ping";
        }>>;
    }, z.core.$strip>>>;
    extraCategories: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        emoji: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
        access: z.ZodEnum<{
            staff: "staff";
            everyone: "everyone";
            roles: "roles";
        }>;
        roles: z.ZodOptional<z.ZodArray<z.ZodString>>;
        channels: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            emoji: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
            type: z.ZodEnum<{
                TEXT: "TEXT";
                ANNOUNCEMENT: "ANNOUNCEMENT";
                FORUM: "FORUM";
                MEDIA: "MEDIA";
                VOICE: "VOICE";
                STAGE: "STAGE";
            }>;
            topic: z.ZodOptional<z.ZodString>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
    }, z.core.$strip>>>;
    summary: z.ZodString;
}, z.core.$strip>;
export type DesignedBlueprint = z.infer<typeof designedBlueprintSchema>;
export type DesignedCategory = z.infer<typeof designedCategorySchema>;
export type DesignedRole = z.infer<typeof designedRoleSchema>;
export declare const UNEXPECTED_DESIGN = "The AI designer returned something unexpected. Try again.";
export declare const NO_DESIGN_ANSWER = "The AI designer did not answer. Try again.";
export declare const NO_DESIGNER = "Describe-your-server needs an OpenAI API key on the host (OPENAI_API_KEY).";
/** Checks the model's JSON. Throws a plain DEPENDENCY_UNAVAILABLE error when it is not what was asked for. */
export declare function parseDesignedBlueprint(value: unknown): DesignedBlueprint;
/** Turns an owner's description of their server into answers and extras. */
export interface BlueprintDesigner {
    design(prompt: string, base: BuilderAnswers): Promise<DesignedBlueprint>;
}
/** Questionnaire answers from a design, falling back field by field to the template for the chosen server type. */
export declare function answersFromDesign(design: DesignedBlueprint, prompt: string): BuilderAnswers;
export interface AppliedDesign {
    readonly blueprint: BuilderBlueprint;
    /** Plain notes about extras that could not be used. */
    readonly dropped: readonly string[];
}
/**
 * Applies the design's extras to a generated blueprint: removes channels,
 * adds roles, and adds categories. Each extra is checked on its own, and one
 * that would make the blueprint invalid is dropped rather than failing the
 * whole design.
 */
export declare function applyDesign(blueprint: BuilderBlueprint, design: DesignedBlueprint, answers: BuilderAnswers): AppliedDesign;
/**
 * The instructions for the model: the server types, every section with what
 * it creates for this base server type, the rules, and the JSON shape.
 */
export declare function designerSystemPrompt(base: BuilderAnswers): string;
/** The owner's description plus the answers they start from. */
export declare function designerUserPrompt(prompt: string, base: BuilderAnswers): string;
export declare const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
type Fetch = typeof fetch;
/** Designs blueprints with the OpenAI chat completions API, asking for a JSON object. */
export declare class OpenAiBlueprintDesigner implements BlueprintDesigner {
    private readonly apiKey;
    private readonly model;
    private readonly fetchImpl;
    private readonly timeoutMs;
    constructor(apiKey: string, model?: string, fetchImpl?: Fetch, timeoutMs?: number);
    design(prompt: string, base: BuilderAnswers): Promise<DesignedBlueprint>;
}
export {};
//# sourceMappingURL=BlueprintDesigner.d.ts.map