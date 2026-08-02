export const appVersion = "0.2.0-demo-showcase";

export const navItems = [
  ["overview", "◈", "Overview"],
  ["applications", "▣", "Applications"],
  ["tickets", "◇", "Tickets"],
  ["staff", "◎", "Staff"],
  ["moderation", "⚖", "Moderation"],
  ["verification", "✓", "Verification"],
  ["polls", "◍", "Polls"],
  ["birthdays", "✦", "Birthdays"],
  ["knowledge", "▤", "Knowledge Base"],
  ["fivem", "⌁", "FiveM Server"],
  ["settings", "⚙", "Settings"],
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
      event("EVT-4", "Knowledge article moved to Published", "Knowledge Base", "2 hours ago"),
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
