import { loadHealth, loadMe } from "./api.js";

/** Live connection and sign-in state shared by every page. */
export const session = {
  health: { available: false },
  account: undefined,
  error: undefined,
};

export async function refreshSession({ refreshAccount = false } = {}) {
  session.health = await loadHealth();
  try {
    session.account = await loadMe(refreshAccount);
    session.error = undefined;
  } catch (error) {
    session.account = undefined;
    session.error = error;
  }
  return session;
}

export function signedIn() {
  return Boolean(session.account?.account);
}
