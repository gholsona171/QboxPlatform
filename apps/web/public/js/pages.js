import { renderApplicationsPage } from "./applications.js";
import { renderBirthdaysPage } from "./birthdays.js";
import { renderBuilderPage } from "./builder.js";
import { renderDiscordPage } from "./discord.js";
import { renderGiveawaysPage } from "./giveaways.js";
import { renderLevelsPage } from "./levels.js";
import { renderFivemPage } from "./fivem.js";
import { renderKnowledgePage } from "./knowledge.js";
import { renderMessagesPage } from "./messages.js";
import { renderModerationPage } from "./moderation.js";
import { renderStaffPage } from "./staff.js";
import { renderStreamsPage } from "./streams.js";
import { renderPollsPage } from "./polls.js";
import { renderScheduledPage } from "./scheduled.js";
import { renderTicketsPage } from "./tickets.js";
import { renderVerificationPage } from "./verification.js";
import { renderVoicePage } from "./voice.js";
import { renderOverviewPage, renderSettingsPage } from "./views.js";
import { BRAND } from "./brand.js";

/**
 * Portal pages in menu order. Each page renders into the content element.
 * Add one entry per feature with its menu group; "settings" (Account) stays last.
 */
export const icon = (path) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

export const pages = [
  { id: "overview", label: "Overview", description: "Your server at a glance.", icon: icon('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'), render: renderOverviewPage },
  { id: "tickets", group: "Support", label: "Tickets", description: "Answer tickets and set up how members open them.", icon: icon('<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4Z"/><path d="M9 6v12" stroke-dasharray="2 2"/>'), render: renderTicketsPage },
  { id: "applications", group: "Support", label: "Applications", description: "Apply for positions, and review and set up application forms.", icon: icon('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>'), render: renderApplicationsPage },
  { id: "knowledge", group: "Support", label: "Knowledge Base", description: "Help articles members can search here and with /faq.", icon: icon('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z"/><path d="M4 19V5"/><path d="M9 7h6M9 11h6"/>'), render: renderKnowledgePage },
  { id: "moderation", group: "Safety", label: "Moderation", description: "Cases, automod, and actions against rule breakers.", icon: icon('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/><path d="m9 12 2 2 4-4"/>'), render: renderModerationPage },
  { id: "verification", group: "Safety", label: "Verification", description: "How new members prove they are real before joining in.", icon: icon('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 12.5-6.6"/><path d="m15 19 2 2 4-4"/>'), render: renderVerificationPage },
  { id: "staff", group: "Team", label: "Staff", description: "Staff roster, ranks, leave, and shifts.", icon: icon('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>'), render: renderStaffPage },
  { id: "levels", group: "Community", label: "Levels", description: "XP, the leaderboard, and reward roles.", icon: icon('<path d="M4 20V14"/><path d="M10 20V9"/><path d="M16 20V4"/><path d="M3 20h18"/>'), render: renderLevelsPage },
  { id: "giveaways", group: "Community", label: "Giveaways", description: "Run giveaways and pick winners fairly.", icon: icon('<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8"/><path d="M12 8v12"/><path d="M12 8c-2-3-6-3-6-1s3 1 6 1c3 0 6 1 6-1s-4-2-6 1Z"/>'), render: renderGiveawaysPage },
  { id: "polls", group: "Community", label: "Polls", description: "Ask the server a question and see the results.", icon: icon('<path d="M4 20h16"/><rect x="5" y="11" width="3" height="6" rx="1"/><rect x="10.5" y="5" width="3" height="12" rx="1"/><rect x="16" y="8" width="3" height="9" rx="1"/>'), render: renderPollsPage },
  { id: "birthdays", group: "Community", label: "Birthdays", description: "Birthday messages, roles, and the member calendar.", icon: icon('<path d="M4 21h16"/><path d="M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7"/><path d="M5 16c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 5 0"/><path d="M12 12V8"/><path d="M12 5.5c.8-.8.8-1.7 0-2.5-.8.8-.8 1.7 0 2.5Z"/>'), render: renderBirthdaysPage },
  { id: "voice", group: "Community", label: "Voice Rooms", description: "Join-to-create voice channels members control.", icon: icon('<path d="M4 10v4"/><path d="M8 7v10"/><path d="M12 4v16"/><path d="M16 7v10"/><path d="M20 10v4"/>'), render: renderVoicePage },
  { id: "streams", group: "Community", label: "Streams", description: "Announce when your creators go live.", icon: icon('<rect x="3" y="5" width="18" height="12" rx="2"/><path d="m10 9 5 3-5 3Z"/><path d="M8 21h8"/>'), render: renderStreamsPage },
  { id: "scheduled", group: "Community", label: "Scheduled", description: "Messages that post on a schedule.", icon: icon('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 2h6"/>'), render: renderScheduledPage },
  { id: "builder", group: "Server", label: "Server Builder", description: `Plan your channels and roles, then let ${BRAND.name} build them.`, icon: icon('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M17.5 14v7M14 17.5h7"/>'), render: renderBuilderPage },
  { id: "fivem", group: "Server", label: "FiveM Server", description: "Live server status, players, alerts, and restarts.", icon: icon('<rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01"/>'), render: renderFivemPage },
  { id: "messages", group: "Server", label: "Look & Messages", description: "How the bot's messages and embeds look.", icon: icon('<path d="M4 5h16v11H9l-5 4Z"/><path d="M8 9h8M8 12h5"/>'), render: renderMessagesPage },
  { id: "discord", group: "Server", label: "Discord Bot", description: "Welcome messages, roles, logs and other bot features.", icon: icon('<rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 7V4"/><circle cx="9" cy="13" r="1.2"/><circle cx="15" cy="13" r="1.2"/>'), render: renderDiscordPage },
  { id: "settings", label: "Account", description: "Your Discord sign-in and service status.", icon: icon('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'), render: renderSettingsPage },
];
