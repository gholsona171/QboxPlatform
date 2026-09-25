import type { VoiceMinutes } from "./types.js";

/** One member in a voice channel, as seen by the bot. */
export interface VoiceParticipant {
  readonly userId: string;
  readonly displayName: string;
  readonly roleIds: readonly string[];
  readonly bot: boolean;
  /** Self or server muted. */
  readonly muted: boolean;
  /** Self or server deafened. */
  readonly deafened: boolean;
}

/**
 * Members who earn voice XP: people in a channel with at least one other
 * person (bots don't count), who are not muted or deafened.
 */
export function eligibleVoiceMembers(participants: readonly VoiceParticipant[]): readonly VoiceParticipant[] {
  const people = participants.filter((participant) => !participant.bot);
  if (people.length < 2) return [];
  return people.filter((participant) => !participant.muted && !participant.deafened);
}

interface Session {
  readonly guildId: string;
  channelId: string;
  displayName: string;
  roleIds: readonly string[];
  /** When the member started earning, while eligible. */
  eligibleSince?: number | undefined;
  /** Earned time not yet flushed. */
  accruedMs: number;
}

/**
 * Tracks eligible voice time per member from voice state updates. Call
 * `syncChannel` whenever someone joins, leaves, or changes state in a
 * channel, and `flush` periodically to collect whole minutes.
 */
export class VoiceTracker {
  private readonly sessions = new Map<string, Session>();

  /** Replaces what is known about one channel with its current participants. */
  public syncChannel(guildId: string, channelId: string, participants: readonly VoiceParticipant[], now: number): void {
    const eligible = new Set(eligibleVoiceMembers(participants).map((participant) => participant.userId));
    const present = new Set(participants.filter((participant) => !participant.bot).map((participant) => participant.userId));
    for (const [key, session] of this.sessions) {
      if (session.guildId !== guildId || session.channelId !== channelId || present.has(key.split(":")[1] ?? "")) continue;
      this.stop(session, now);
    }
    for (const participant of participants) {
      if (participant.bot) continue;
      const key = `${guildId}:${participant.userId}`;
      const session = this.sessions.get(key) ?? { guildId, channelId, displayName: participant.displayName, roleIds: participant.roleIds, accruedMs: 0 };
      if (session.channelId !== channelId) this.stop(session, now);
      session.channelId = channelId;
      session.displayName = participant.displayName;
      session.roleIds = participant.roleIds;
      if (eligible.has(participant.userId)) session.eligibleSince ??= now;
      else this.stop(session, now);
      this.sessions.set(key, session);
    }
  }

  /** Returns whole minutes earned since the last flush and keeps the remainder. */
  public flush(now: number): readonly VoiceMinutes[] {
    const result: VoiceMinutes[] = [];
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
      if (session.eligibleSince === undefined) this.sessions.delete(key);
    }
    return result;
  }

  /** Number of members being tracked. */
  public get size(): number {
    return this.sessions.size;
  }

  private stop(session: Session, now: number): void {
    if (session.eligibleSince === undefined) return;
    session.accruedMs += now - session.eligibleSince;
    session.eligibleSince = undefined;
  }
}
