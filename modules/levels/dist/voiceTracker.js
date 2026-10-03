/**
 * Members who earn voice XP: people in a channel with at least one other
 * person (bots don't count), who are not muted or deafened.
 */
export function eligibleVoiceMembers(participants) {
    const people = participants.filter((participant) => !participant.bot);
    if (people.length < 2)
        return [];
    return people.filter((participant) => !participant.muted && !participant.deafened);
}
/**
 * Tracks eligible voice time per member from voice state updates. Call
 * `syncChannel` whenever someone joins, leaves, or changes state in a
 * channel, and `flush` periodically to collect whole minutes.
 */
export class VoiceTracker {
    sessions = new Map();
    /** Replaces what is known about one channel with its current participants. */
    syncChannel(guildId, channelId, participants, now) {
        const eligible = new Set(eligibleVoiceMembers(participants).map((participant) => participant.userId));
        const present = new Set(participants.filter((participant) => !participant.bot).map((participant) => participant.userId));
        for (const [key, session] of this.sessions) {
            if (session.guildId !== guildId || session.channelId !== channelId || present.has(key.split(":")[1] ?? ""))
                continue;
            this.stop(session, now);
        }
        for (const participant of participants) {
            if (participant.bot)
                continue;
            const key = `${guildId}:${participant.userId}`;
            const session = this.sessions.get(key) ?? { guildId, channelId, displayName: participant.displayName, roleIds: participant.roleIds, accruedMs: 0 };
            if (session.channelId !== channelId)
                this.stop(session, now);
            session.channelId = channelId;
            session.displayName = participant.displayName;
            session.roleIds = participant.roleIds;
            if (eligible.has(participant.userId))
                session.eligibleSince ??= now;
            else
                this.stop(session, now);
            this.sessions.set(key, session);
        }
    }
    /** Returns whole minutes earned since the last flush and keeps the remainder. */
    flush(now) {
        const result = [];
        for (const [key, session] of this.sessions) {
            if (session.eligibleSince !== undefined) {
                session.accruedMs += now - session.eligibleSince;
                session.eligibleSince = now;
            }
            const minutes = Math.floor(session.accruedMs / 60_000);
            if (minutes > 0) {
                session.accruedMs -= minutes * 60_000;
                const userId = key.slice(key.indexOf(":") + 1);
                result.push({ guildId: session.guildId, channelId: session.channelId, userId, displayName: session.displayName, roleIds: session.roleIds, minutes });
            }
            if (session.eligibleSince === undefined)
                this.sessions.delete(key);
        }
        return result;
    }
    /** Number of members being tracked. */
    get size() {
        return this.sessions.size;
    }
    stop(session, now) {
        if (session.eligibleSince === undefined)
            return;
        session.accruedMs += now - session.eligibleSince;
        session.eligibleSince = undefined;
    }
}
//# sourceMappingURL=voiceTracker.js.map