const LINKS = [
    { link: "moderation", label: "Moderation", description: "Log channel = #mod-log. Staff ranks become protected roles.", needs: ["mod-log"], needsRole: "staff" },
    { link: "verification", label: "Verification", description: "Panel in #verify, Verified and Unverified roles, log to #mod-log. Turns verification on and posts the panel.", needs: ["verify"], needsRole: "verified" },
    { link: "tickets", label: "Tickets", description: "Transcripts to #ticket-transcripts, tickets open in the support category, staff can answer. Adds a Support ticket type and panel if you have none.", needs: ["ticket-transcripts", "tickets-panel"] },
    { link: "applications", label: "Applications", description: "Forms without a review channel use #applications-review. Staff review forms with no reviewer roles.", needs: ["applications-review"] },
    { link: "staff", label: "Staff", description: "Log channel = #staff-log. Creates staff ranks from the staff roles if you have none.", needs: ["staff-log"], needsRole: "staff" },
    { link: "levels", label: "Levels", description: "Level-up messages go to #level-ups and levels are turned on.", needs: ["level-up"] },
    { link: "birthdays", label: "Birthdays", description: "Birthday messages go to #birthdays and birthdays are turned on.", needs: ["birthdays"] },
    { link: "fivem", label: "FiveM Server", description: "Status message in #server-status, alerts in #server-alerts.", needs: ["fivem-status", "fivem-alerts"] },
    { link: "voice-rooms", label: "Voice Rooms", description: "The join-to-create channel becomes a voice room hub.", needs: ["voice-hub"] },
    { link: "welcome", label: "Welcome messages", description: "Welcome messages go to #welcome.", needs: ["welcome"] },
    { link: "server-logs", label: "Server logs", description: "Server logs go to #server-log.", needs: ["server-log"] },
    { link: "starboard", label: "Starboard", description: "Starred messages go to #starboard.", needs: ["starboard"] },
    { link: "rules", label: "Rules", description: "The rules message lives in #rules.", needs: ["rules"] },
];
/** Every feature link, with whether this blueprint can use it. */
export function linkOptions(blueprint) {
    const purposes = new Set(blueprint.categories.flatMap((category) => category.channels.map((channel) => channel.purpose)));
    const rolePurposes = new Set(blueprint.roles.map((role) => role.purpose));
    return LINKS.map((definition) => ({
        link: definition.link,
        label: definition.label,
        description: definition.description,
        available: definition.needs.some((purpose) => purposes.has(purpose)) || (definition.needsRole !== undefined && rolePurposes.has(definition.needsRole)),
    }));
}
export function linkLabel(link) {
    return LINKS.find((definition) => definition.link === link)?.label ?? link;
}
//# sourceMappingURL=links.js.map