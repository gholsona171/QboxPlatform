import { renderApplicationsPage } from "./applications.js";
import { renderDiscordPage } from "./discord.js";
import { renderGiveawaysPage } from "./giveaways.js";
import { renderModerationPage } from "./moderation.js";
import { renderStaffPage } from "./staff.js";
import { renderPollsPage } from "./polls.js";
import { renderTicketsPage } from "./tickets.js";
import { renderVerificationPage } from "./verification.js";
import { renderOverviewPage, renderSettingsPage } from "./views.js";

/**
 * Portal pages in menu order. Each page renders into the content element.
 * Add one entry per feature; "settings" (Account) stays last.
 */
export const icon = (path) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

export const pages = [
  { id: "overview", label: "Overview", description: "Your server at a glance.", icon: icon('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'), render: renderOverviewPage },
  { id: "tickets", label: "Tickets", description: "Answer tickets and set up how members open them.", icon: icon('<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4Z"/><path d="M9 6v12" stroke-dasharray="2 2"/>'), render: renderTicketsPage },
  { id: "moderation", label: "Moderation", description: "Cases, automod, and actions against rule breakers.", icon: icon('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/><path d="m9 12 2 2 4-4"/>'), render: renderModerationPage },
  { id: "verification", label: "Verification", description: "How new members prove they are real before joining in.", icon: icon('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 12.5-6.6"/><path d="m15 19 2 2 4-4"/>'), render: renderVerificationPage },
  { id: "applications", label: "Applications", description: "Apply for positions, and review and set up application forms.", icon: icon('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>'), render: renderApplicationsPage },
  { id: "staff", label: "Staff", description: "Staff roster, ranks, leave, and shifts.", icon: icon('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>'), render: renderStaffPage },
  { id: "polls", label: "Polls", description: "Ask the server a question and see the results.", icon: icon('<path d="M4 20h16"/><rect x="5" y="11" width="3" height="6" rx="1"/><rect x="10.5" y="5" width="3" height="12" rx="1"/><rect x="16" y="8" width="3" height="9" rx="1"/>'), render: renderPollsPage },
  { id: "giveaways", label: "Giveaways", description: "Run giveaways and pick winners fairly.", icon: icon('<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8"/><path d="M12 8v12"/><path d="M12 8c-2-3-6-3-6-1s3 1 6 1c3 0 6 1 6-1s-4-2-6 1Z"/>'), render: renderGiveawaysPage },
  { id: "discord", label: "Discord Bot", description: "Welcome messages, roles, logs and other bot features.", icon: icon('<rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 7V4"/><circle cx="9" cy="13" r="1.2"/><circle cx="15" cy="13" r="1.2"/>'), render: renderDiscordPage },
  { id: "settings", label: "Account", description: "Your Discord sign-in and service status.", icon: icon('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'), render: renderSettingsPage },
];
