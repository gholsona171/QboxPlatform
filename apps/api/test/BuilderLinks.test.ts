import { describe, expect, it } from "vitest";
import { ApplicationService, InMemoryApplicationRepository } from "@qbox/applications";
import { BirthdayService, InMemoryBirthdayRepository } from "@qbox/birthdays";
import { DiscordCommunityService, type CommunityRepository, type CommunitySettings, type RulesConfig, type ServerLogConfig, type StarboardConfig, type WelcomeGoodbyeConfig } from "@qbox/discord-community";
import { FivemService, InMemoryFivemRepository } from "@qbox/fivem";
import { InMemoryLevelRepository, LevelService } from "@qbox/levels";
import { InMemoryModerationRepository, ModerationService } from "@qbox/moderation";
import type { BuilderResolvedIds } from "@qbox/server-builder";
import { InMemoryStaffRepository, StaffService } from "@qbox/staff";
import { InMemoryTicketRepository, TicketService } from "@qbox/tickets";
import { InMemoryVerificationRepository, VerificationService } from "@qbox/verification";
import { InMemoryVoiceRepository, VoiceRoomService } from "@qbox/voice-rooms";

import { ServiceBuilderLinks } from "../src/builder/builderLinks.js";

const GUILD = "100000000000000001";
const ID = {
  modLog: "500000000000000001",
  serverLog: "500000000000000002",
  verify: "500000000000000003",
  transcripts: "500000000000000004",
  panel: "500000000000000005",
  review: "500000000000000006",
  staffLog: "500000000000000007",
  levelUp: "500000000000000008",
  birthdays: "500000000000000009",
  status: "500000000000000010",
  alerts: "500000000000000011",
  hub: "500000000000000012",
  welcome: "500000000000000013",
  starboard: "500000000000000014",
  rules: "500000000000000015",
  ticketsCategory: "500000000000000020",
  voiceCategory: "500000000000000021",
  owner: "400000000000000001",
  mod: "400000000000000002",
  verified: "400000000000000003",
  unverified: "400000000000000004",
  existingRole: "400000000000000009",
};

const ids: BuilderResolvedIds = {
  guildId: GUILD,
  channels: {
    "mod-log": ID.modLog, "server-log": ID.serverLog, verify: ID.verify, "ticket-transcripts": ID.transcripts, "tickets-panel": ID.panel, "applications-review": ID.review,
    "staff-log": ID.staffLog, "level-up": ID.levelUp, birthdays: ID.birthdays, "fivem-status": ID.status, "fivem-alerts": ID.alerts, "voice-hub": ID.hub,
    welcome: ID.welcome, starboard: ID.starboard, rules: ID.rules,
  },
  categories: { tickets: ID.ticketsCategory },
  channelParents: { "voice-hub": ID.voiceCategory },
  staffRoles: [{ id: ID.owner, name: "Owner", color: "#E74C3C" }, { id: ID.mod, name: "Moderator", color: "#2ECC71" }],
  verifiedRoleId: ID.verified,
  unverifiedRoleId: ID.unverified,
  names: { [ID.modLog]: "mod-log", [ID.verify]: "verify", [ID.verified]: "Verified", [ID.welcome]: "welcome", [ID.ticketsCategory]: "SUPPORT" },
};

/** Community settings kept in memory; only the parts the builder touches. */
class MemoryCommunity implements Pick<CommunityRepository, "getSettings" | "saveWelcomeGoodbye" | "saveLogs" | "saveStarboard" | "saveRules"> {
  public settings: CommunitySettings = { guildId: GUILD, autoroles: { guildId: GUILD, enabled: false, delaySeconds: 0, includeBots: false, roles: [] }, counters: [], embedTemplates: [], customCommands: [], suggestions: [], starboardEntries: [] };
  public async getSettings() { return this.settings; }
  public async saveWelcomeGoodbye(input: WelcomeGoodbyeConfig) { this.settings = { ...this.settings, welcome: input }; return input; }
  public async saveLogs(input: ServerLogConfig) { this.settings = { ...this.settings, logs: input }; return input; }
  public async saveStarboard(input: StarboardConfig) { this.settings = { ...this.settings, starboard: input }; return input; }
  public async saveRules(input: RulesConfig) { this.settings = { ...this.settings, rules: input }; return input; }
}

function setup() {
  const repositories = {
    moderation: new InMemoryModerationRepository(),
    verification: new InMemoryVerificationRepository(),
    tickets: new InMemoryTicketRepository(),
    applications: new InMemoryApplicationRepository(),
    staff: new InMemoryStaffRepository(),
    levels: new InMemoryLevelRepository(),
    birthdays: new InMemoryBirthdayRepository(),
    fivem: new InMemoryFivemRepository(),
    voice: new InMemoryVoiceRepository(),
    community: new MemoryCommunity(),
  };
  const services = {
    moderation: new ModerationService(repositories.moderation),
    verification: new VerificationService(repositories.verification),
    tickets: new TicketService(repositories.tickets),
    applications: new ApplicationService(repositories.applications),
    staff: new StaffService(repositories.staff),
    levels: new LevelService(repositories.levels),
    birthdays: new BirthdayService(repositories.birthdays),
    fivem: new FivemService(repositories.fivem, { query: async () => ({ online: false, players: [], playerCount: 0, maxPlayers: 0 }) }),
    voice: new VoiceRoomService(repositories.voice),
    community: new DiscordCommunityService(repositories.community as unknown as CommunityRepository),
  };
  return { services, repositories, links: new ServiceBuilderLinks(services) };
}

describe("ServiceBuilderLinks", () => {
  it("sets moderation log channel and protected roles, keeping other settings", async () => {
    const { services, links } = setup();
    const { revision: _revision, ...defaults } = await services.moderation.settings(GUILD);
    await services.moderation.saveSettings({ ...defaults, requireReason: true, protectedRoleIds: [ID.existingRole], expectedRevision: 0 });
    expect(await links.apply("moderation", ids)).toBe("Moderation: log channel set to #mod-log, 2 staff roles protected.");
    const saved = await services.moderation.settings(GUILD);
    expect(saved).toMatchObject({ logChannelId: ID.modLog, requireReason: true, protectedRoleIds: [ID.existingRole, ID.owner, ID.mod], revision: 2 });
  });

  it("turns verification on with the new roles and reports when the panel cannot be posted", async () => {
    const { services, links } = setup();
    const summary = await links.apply("verification", ids);
    expect(summary).toContain("Verification turned on with the @Verified role, but the panel was not posted");
    expect(await services.verification.settings(GUILD)).toMatchObject({ enabled: true, verifiedRoleIds: [ID.verified], unverifiedRoleId: ID.unverified, channelId: ID.verify, logChannelId: ID.modLog });
  });

  it("sets up tickets without removing existing configuration", async () => {
    const { services, links } = setup();
    const summary = await links.apply("tickets", ids);
    expect(summary).toContain("transcripts go to");
    expect(summary).toContain("a Support ticket type was added");
    expect(summary).toContain("not posted");
    expect(await services.tickets.settings(GUILD)).toMatchObject({ enabled: true, transcriptChannelId: ID.transcripts, logChannelId: ID.transcripts, openCategoryChannelId: ID.ticketsCategory, supportRoleIds: [ID.owner, ID.mod] });
    const [category] = await services.tickets.categories(GUILD);
    expect(category).toMatchObject({ name: "Support", parentChannelId: ID.ticketsCategory });
    const [panel] = await services.tickets.panels(GUILD);
    expect(panel).toMatchObject({ channelId: ID.panel });
    await links.apply("tickets", ids);
    expect(await services.tickets.categories(GUILD)).toHaveLength(1);
    expect(await services.tickets.panels(GUILD)).toHaveLength(1);
  });

  it("fills in application review channels and reviewers only where missing", async () => {
    const { services, links } = setup();
    expect(await links.apply("applications", ids)).toContain("no forms yet");
    const base = { guildId: GUILD, enabled: true, questions: [{ id: "why", label: "Why?", type: "PARAGRAPH" as const, required: true, choices: [] }], cooldownDays: 0, onePending: true, requiredRoleIds: [], blockedRoleIds: [], pingMemberIds: [], acceptRoleIds: [], removeRoleIds: [], buttonStyle: "PRIMARY" as const, position: 0 };
    await services.applications.saveForm({ ...base, name: "Staff", reviewerRoleIds: [] });
    await services.applications.saveForm({ ...base, name: "Police", reviewChannelId: "500000000000000099", reviewerRoleIds: [ID.existingRole] });
    expect(await links.apply("applications", ids)).toBe("Applications: 1 form now reviewed in #500000000000000006 by staff.");
    const forms = await services.applications.forms(GUILD);
    expect(forms.find((form) => form.name === "Staff")).toMatchObject({ reviewChannelId: ID.review, reviewerRoleIds: [ID.owner, ID.mod] });
    expect(forms.find((form) => form.name === "Police")).toMatchObject({ reviewChannelId: "500000000000000099", reviewerRoleIds: [ID.existingRole] });
  });

  it("creates staff ranks only when none exist", async () => {
    const { services, links } = setup();
    expect(await links.apply("staff", ids)).toContain("2 ranks created");
    expect((await services.staff.ranks(GUILD)).map((rank) => [rank.name, rank.roleId])).toEqual([["Owner", ID.owner], ["Moderator", ID.mod]]);
    expect((await services.staff.settings(GUILD)).logChannelId).toBe(ID.staffLog);
    expect(await links.apply("staff", ids)).not.toContain("ranks created");
  });

  it("links levels, birthdays, FiveM, and voice rooms", async () => {
    const { services, links } = setup();
    await links.apply("levels", ids);
    expect(await services.levels.settings(GUILD)).toMatchObject({ enabled: true, levelUpMode: "CHANNEL", levelUpChannelId: ID.levelUp });
    await links.apply("birthdays", ids);
    expect(await services.birthdays.settings(GUILD)).toMatchObject({ enabled: true, channelId: ID.birthdays });
    expect(await links.apply("fivem", ids)).toContain("add your server address");
    expect(await services.fivem.settings(GUILD)).toMatchObject({ statusChannelId: ID.status, alertChannelId: ID.alerts });
    await links.apply("voice-rooms", ids);
    expect(await services.voice.hubs(GUILD)).toMatchObject([{ channelId: ID.hub, categoryId: ID.voiceCategory, name: "Join to Create" }]);
    expect(await links.apply("voice-rooms", ids)).toContain("already a hub");
  });

  it("links welcome, server logs, starboard, and existing rules", async () => {
    const { repositories, links } = setup();
    expect(await links.apply("rules", ids)).toContain("not set up yet");
    await links.apply("welcome", ids);
    await links.apply("server-logs", ids);
    await links.apply("starboard", ids);
    repositories.community.settings = { ...repositories.community.settings, rules: { guildId: GUILD, enabled: true, channelId: "500000000000000098", messageText: "Be nice", buttonLabel: "Accept", acceptedRoleId: ID.verified, messageId: "600000000000000001", revision: 3 } };
    expect(await links.apply("rules", ids)).toContain("Post it again with /rules");
    const settings = repositories.community.settings;
    expect(settings.welcome).toMatchObject({ enabled: true, channelId: ID.welcome, kind: "WELCOME" });
    expect(settings.logs).toMatchObject({ enabled: true, destinations: { all: ID.serverLog } });
    expect(settings.starboard).toMatchObject({ destinationChannelId: ID.starboard, threshold: 3 });
    expect(settings.rules).toMatchObject({ channelId: ID.rules, messageText: "Be nice", expectedRevision: 3 });
    expect(settings.rules?.messageId).toBeUndefined();
  });
});
