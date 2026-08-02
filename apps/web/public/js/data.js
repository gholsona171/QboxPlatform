import { featureRegistry } from "./featureRegistry.js";

export const appVersion = "0.4.0-role-parity";

export const navItems = [
  ["overview", "OV", "Overview"],
  ["discord", "DB", "Discord Bot"],
  ["applications", "AP", "Applications"],
  ["tickets", "TK", "Tickets"],
  ["staff", "ST", "Staff"],
  ["moderation", "MD", "Moderation"],
  ["verification", "VF", "Verification"],
  ["polls", "PL", "Polls"],
  ["birthdays", "BD", "Birthdays"],
  ["knowledge", "KB", "Knowledge Base"],
  ["fivem", "5M", "FiveM Server"],
  ["settings", "SE", "Settings"],
];

export function seedDemoData() {
  const now = "2026-08-02T12:00:00.000Z";
  return {
    seededAt: now,
    settings: { theme: "dark", notifications: true },
    activity: [
      event("EVT-1", "Application status changed to Under Review", "Applications", "10 minutes ago"),
      event("EVT-2", "Ticket #104 claimed by Aria", "Tickets", "25 minutes ago"),
      event("EVT-3", "Verification approved for DemoMember42", "Verification", "1 hour ago"),
      event("EVT-4", "Role Menus moved to LIVE in the Discord catalog", "Discord Bot", "2 hours ago"),
    ],
    applications: [
      application("APP-1001", "Nova Hart", "Civilian", "Submitted", "Mason", "Reliable schedule, wants to join weekend patrols."),
      application("APP-1002", "Echo Vale", "Staff", "Under Review", "Aria", "Strong moderation history on another server."),
      application("APP-1003", "Jules North", "Mechanic", "Interview", "Riley", "Interview scheduled for Friday."),
    ],
    tickets: [
      ticket("TCK-104", "Donation package question", "Support", "Medium", "Claimed", "Aria"),
      ticket("TCK-105", "Lost inventory after restart", "FiveM", "High", "Open", "Unassigned"),
      ticket("TCK-106", "Discord role missing", "Discord", "Low", "Waiting", "Mason"),
    ],
    staff: [
      staff("Aria Stone", "Senior Admin", "Operations", "Available", "2025-11-14", 96),
      staff("Mason Reed", "Moderator", "Community", "Busy", "2026-01-22", 84),
      staff("Riley Knox", "Trial Staff", "Applications", "Away", "2026-06-05", 72),
      staff("Kai Mercer", "Developer", "FiveM", "Available", "2025-08-30", 91),
    ],
    moderation: [
      moderationCase("MOD-220", "discord:804859666655739996", "Warning", "Staff disrespect in public chat", "Aria", "Active"),
      moderationCase("MOD-221", "license:demo-player-18", "Note", "Helpful context from ticket escalation", "Mason", "Active"),
    ],
    verification: [
      verification("VER-310", "DemoMember42", "Low", "Pending", ["Qbox Citizen", "Verified"]),
      verification("VER-311", "RoadRunner", "Medium", "More Info Requested", ["Qbox Citizen"]),
      verification("VER-312", "Mira", "Low", "Pending", ["Qbox Citizen", "Streamer"]),
    ],
    polls: [
      poll("POL-410", "Which event should run this weekend?", ["Street meet", "Treasure hunt", "Community patrol"], true),
      poll("POL-411", "Preferred staff Q&A time?", ["Friday evening", "Saturday afternoon", "Sunday morning"], false),
    ],
    birthdays: [
      birthday("BD-501", "Nova", "08-07", false),
      birthday("BD-502", "Aria", "08-12", true),
      birthday("BD-503", "Kai", "09-02", false),
    ],
    articles: [
      article("KB-700", "Getting Started", "How to join the Qbox community", "Published", ["onboarding", "discord"]),
      article("KB-701", "FiveM Connection Help", "Common connection fixes and cache steps", "Published", ["fivem", "support"]),
      article("KB-702", "Staff Review Checklist", "Internal review draft for applications", "Draft", ["staff"]),
    ],
    discord: {
      features: featureRegistry.map(featureFromRegistry),
      roles: [
        discordRole("1257928923048837201", "@everyone", "#000000", 0, false, false, false, 2418, false, false, 0),
        discordRole("1262656532902842423", "Platform Admin", "#f97316", 8, true, false, false, 5, false, false, 3, "Role is above the demo bot role."),
        discordRole("1262656532902842424", "Member", "#22c55e", 4, false, false, false, 2390, true, true, 1),
        discordRole("1262656532902842425", "Pending Rules", "#94a3b8", 2, false, false, false, 28, true, true, 1),
      ],
      channels: [
        discordChannel("1262656532902842423", "admin", "TEXT", true, true, true, false),
        discordChannel("1262656532902842424", "rules", "TEXT", true, true, true, false),
        discordChannel("1262656532902842425", "role-menus", "TEXT", true, true, true, false),
        discordChannel("1262656532902842426", "member-count", "VOICE", true, false, false, true),
      ],
      roleMenus: [
        roleMenu("RM-100", "Community Roles", "PUBLISHED", "1257928923048837201", "1262656532902842423", "BUTTONS", "TOGGLE", [
          roleOption("RM-OPT-1", "1262656532902842423", "Staff Alerts", "Bell"),
          roleOption("RM-OPT-2", "1262656532902842424", "Event Pings", "Party"),
        ], "1432100000000000000"),
        roleMenu("RM-101", "Civilian Departments", "DRAFT", "1257928923048837201", "1262656532902842425", "SELECT_MENU", "EXCLUSIVE", [
          roleOption("RM-OPT-3", "1262656532902842426", "EMS", "Ambulance"),
          roleOption("RM-OPT-4", "1262656532902842427", "Mechanic", "Wrench"),
          roleOption("RM-OPT-5", "1262656532902842428", "Business", "Office"),
        ]),
      ],
      welcomeGoodbye: {
        welcome: { enabled: false, channelId: "1262656532902842423", messageText: "Welcome {user} to {server}!", embedEnabled: false },
        goodbye: { enabled: false, channelId: "1262656532902842423", messageText: "{displayName} left {server}.", embedEnabled: false },
      },
      autoroles: { enabled: false, delaySeconds: 0, includeBots: false, roles: [] },
      rules: { enabled: false, channelId: "1262656532902842423", messageText: "Read and accept the rules.", buttonLabel: "Accept Rules", acceptedRoleId: "1262656532902842423" },
      counters: [],
      logs: { enabled: false, events: ["member.joined"], destinations: {}, ignoredChannels: [], ignoredRoles: [], ignoredUsers: [] },
      embeds: [],
      customCommands: [],
      suggestions: [],
      starboard: { enabled: false, destinationChannelId: "1262656532902842423", emoji: "⭐", threshold: 3, channels: [] },
    },
    fivem: {
      online: true,
      players: [
        { id: "P-01", name: "Nova", ping: 44, job: "EMS" },
        { id: "P-02", name: "Echo", ping: 52, job: "Mechanic" },
        { id: "P-03", name: "Jules", ping: 61, job: "Civilian" },
      ],
      capacity: 64,
      resources: [
        { name: "qbx_core", status: "Running" },
        { name: "qbx_vehicles", status: "Running" },
        { name: "demo_event_tools", status: "Stopped" },
      ],
      recentJoins: ["Nova joined 4 minutes ago", "Echo joined 18 minutes ago", "Jules joined 31 minutes ago"],
      whitelist: [
        { subject: "discord:804859666655739996", status: "Approved" },
        { subject: "license:demo-player-18", status: "Pending" },
      ],
      announcements: ["Welcome to Demo Mode. No FiveM server commands are executed."],
    },
  };
}

function event(id, title, area, time) {
  return { id, title, area, time };
}

function history(action) {
  return [{ at: "Seeded demo data", action }];
}

function featureFromRegistry(feature) {
  const surfaces = [
    feature.discordCommands.length ? "Discord command" : "",
    feature.discordInteractions.length ? "Discord component" : "",
    feature.automaticHandlers.length ? "automatic event" : "",
    feature.apiRoutes.length ? "API" : "",
    feature.portalAvailable ? "portal" : "",
  ].filter(Boolean);
  return discordFeature(
    feature.displayName,
    feature.status,
    surfaces,
    `${feature.discordFallbackAvailable ? "Discord fallback available." : "Discord fallback unavailable."} ${feature.portalAvailable ? "Portal surface available." : "Portal surface unavailable."}`,
  );
}

function application(id, applicant, type, status, reviewer, notes) {
  return { id, applicant, type, status, reviewer, notes, submitted: "2026-08-01", history: history(`Created ${status} application`) };
}

function ticket(id, subject, category, priority, status, assignee) {
  return {
    id,
    subject,
    category,
    priority,
    status,
    assignee,
    messages: [{ author: "System", body: "Demo ticket opened for interface testing." }],
    history: history(`Ticket status is ${status}`),
  };
}

function staff(name, role, department, availability, joined, score) {
  return {
    id: `STF-${name.split(" ")[0].toUpperCase()}`,
    name,
    role,
    department,
    availability,
    joined,
    score,
    warnings: role === "Trial Staff" ? 1 : 0,
    notes: "Demo staff profile. Changes stay in this browser.",
    permissions: role.includes("Admin") ? ["platform.admin", "tickets.close", "moderation.warn"] : ["tickets.view", "verification.review"],
  };
}

function moderationCase(id, subject, action, reason, moderator, status) {
  return { id, subject, action, reason, moderator, status, evidence: [], expiration: "", history: history(`${action} recorded`) };
}

function verification(id, member, risk, status, roles) {
  return {
    id,
    member,
    risk,
    status,
    roles,
    answers: ["I read the rules.", "I want to join for roleplay and community events."],
    history: history("Verification submitted"),
  };
}

function poll(id, question, options, open) {
  return {
    id,
    question,
    options: options.map((label, index) => ({ id: `${id}-${index}`, label, votes: 2 + index })),
    anonymous: true,
    endsAt: "2026-08-09T20:00",
    open,
  };
}

function birthday(id, name, date, showYear) {
  return { id, name, date, showYear, announcement: `Happy birthday, ${name}!` };
}

function article(id, title, summary, status, tags) {
  return {
    id,
    title,
    category: title.includes("Staff") ? "Internal" : "Public",
    summary,
    status,
    tags,
    body: `${summary}\n\nThis demo article is editable locally and is not published to a live knowledge base.`,
    edited: "2026-08-02",
  };
}

function discordFeature(name, status, surfaces, summary) {
  return { name, status, surfaces, summary };
}

function roleMenu(id, title, status, guildId, channelId, presentationType, assignmentMode, options, messageId = "") {
  return {
    id,
    title,
    description: "Demo role menu configuration. Live menus use the same persistent service through Discord commands and API routes.",
    status,
    guildId,
    channelId,
    messageId,
    presentationType,
    assignmentMode,
    options,
    revision: 1,
    lastOperationSource: "SYSTEM",
    history: history(`${title} ${status.toLowerCase()}`),
  };
}

function roleOption(id, roleId, label, emoji) {
  return { id, roleId, label, emoji, description: `${label} demo option.` };
}

function discordRole(id, name, color, position, hoisted, mentionable, managed, memberCount, assignable, editable, dependencyCount, unavailableReason = "") {
  return { id, guildId: "1257928923048837201", name, color, position, hoisted, mentionable, managed, memberCount, assignable, editable, deletable: editable, dependencyCount, unavailableReason };
}

function discordChannel(id, name, type, canView, canSendMessages, canEmbedLinks, canManage) {
  return { id, guildId: "1257928923048837201", name, type, parentId: "", position: 0, nsfw: false, canView, canSendMessages, canEmbedLinks, canManage };
}
