import { seedDemoData } from "./data.js";

const DATA_KEY = "qbox.demo.data.v1";
const VOTES_KEY = "qbox.demo.pollVotes.v1";

export function loadDemoState() {
  const stored = safeJson(localStorage.getItem(DATA_KEY));
  if (stored && stored.seededAt) return stored;
  const seeded = seedDemoData();
  saveDemoState(seeded);
  return seeded;
}

export function saveDemoState(state) {
  localStorage.setItem(DATA_KEY, JSON.stringify(state));
}

export function resetDemoState() {
  localStorage.removeItem(DATA_KEY);
  localStorage.removeItem(VOTES_KEY);
  return loadDemoState();
}

export function loadVotes() {
  return safeJson(localStorage.getItem(VOTES_KEY)) ?? {};
}

export function saveVotes(votes) {
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

export function mutateDemoState(mutator) {
  const state = loadDemoState();
  mutator(state);
  saveDemoState(state);
  return state;
}

export function recordActivity(state, title, area) {
  state.activity.unshift({
    id: `EVT-${Date.now()}`,
    title,
    area,
    time: "Just now",
  });
  state.activity = state.activity.slice(0, 12);
}

export function safeLocalStorageSnapshot() {
  return Object.keys(localStorage).filter((key) => key.startsWith("qbox.demo."));
}

function safeJson(value) {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}
