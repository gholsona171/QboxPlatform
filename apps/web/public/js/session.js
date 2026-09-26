import { loadHealth, loadMe } from "./api.js";

/** Live connection and sign-in state shared by every page. */
export const session = {
  health: { available: false },
  account: undefined,
  error: undefined,
};

/** Loads health and the signed-in account at the same time (one /me per page load). */
export async function refreshSession({ refreshAccount = false } = {}) {
  const [health, account] = await Promise.all([
    loadHealth(),
    loadMe(refreshAccount).then((value) => ({ value }), (error) => ({ error })),
  ]);
  session.health = health;
  session.account = account.value;
  session.error = account.error;
  return session;
}

export function signedIn() {
  return Boolean(session.account?.account);
}

/** The server this browser manages, or undefined when none is chosen. */
export function currentGuild() {
  return session.account?.guild ?? undefined;
}

/** Servers the member and the bot share, sorted by name. */
export function knownGuilds() {
  return [...(session.account?.guilds ?? [])].sort((a, b) => a.name.localeCompare(b.name));
}
