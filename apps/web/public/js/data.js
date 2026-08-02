export const appVersion = "0.3.0-discord-essentials";

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
      features: [
        discordFeature("Command Center", "LIVE", ["Discord command", "portal", "API"], "Command deployment, validation, and diagnostics are implemented."),
        discordFeature("Role Menus", "LIVE", ["Discord command", "Discord component", "automatic event", "portal", "API"], "Persistent role menus and reaction roles are the first live Discord feature."),
        discordFeature("Welcome and Goodbye", "DEMO", ["automatic event", "portal", "API"], "Message template and channel routing preview."),
        discordFeature("Autoroles", "DEMO", ["automatic event", "portal", "API"], "Default role assignment configuration preview."),
        discordFeature("AutoMod and Filters", "DEMO", ["automatic event", "portal", "API"], "Filter-rule concept. No live moderation action is sent."),
        discordFeature("Server Logs", "DEMO", ["automatic event", "portal"], "Audit channel routing preview."),
        discordFeature("Embeds and Announcements", "DEMO", ["Discord command", "portal", "API"], "Announcement composer concept."),
        discordFeature("Scheduled Messages and Reminders", "PLANNED", ["automatic event", "portal", "API"], "Blocked by scheduler execution."),
        discordFeature("Giveaways", "PLANNED", ["Discord component", "automatic event", "portal", "API"], "Blocked by scheduler and persistence workflow."),
        discordFeature("Levels and Rewards", "PLANNED", ["automatic event", "portal"], "Blocked by activity/event ingestion."),
        discordFeature("Starboard", "PLANNED", ["automatic event", "portal"], "Blocked by reaction/message event design."),
        discordFeature("Voice Rooms", "PLANNED", ["Discord component", "automatic event", "portal"], "Blocked by voice state workflow."),
        discordFeature("Custom Commands", "PLANNED", ["Discord command", "portal", "API"], "Blocked by command content policy."),
        discordFeature("Server Utilities", "DEMO", ["Discord command", "portal"], "Operational utility concept."),
        discordFeature("Bot Settings", "DEMO", ["portal", "API"], "Configuration preview."),
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
    history: history(`${title} ${status.toLowerCase()}`),
  };
}

function roleOption(id, roleId, label, emoji) {
  return { id, roleId, label, emoji, description: `${label} demo option.` };
}
