import assert from "node:assert/strict";
import test from "node:test";

class FakeElement {
  constructor(id) {
    this.id = id;
    this.hidden = false;
    this.textContent = "";
    this.listeners = new Map();
    this.focusCount = 0;
    this.children = [];
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    this.listeners.set(type, listeners.filter((candidate) => candidate !== listener));
  }

  dispatch(type, event = {}) {
    for (const listener of [...(this.listeners.get(type) ?? [])]) listener({ target: this, ...event });
  }

  focus() {
    this.focusCount += 1;
    globalThis.document.activeElement = this;
  }

  contains(target) {
    return target === this || this.children.includes(target);
  }

  querySelector(selector) {
    if (selector === ".modal") return this.children[0];
    return undefined;
  }
}

function createDocument() {
  const modalBackdrop = new FakeElement("modalBackdrop");
  const modal = new FakeElement("modal");
  const modalTitle = new FakeElement("modalTitle");
  const modalBody = new FakeElement("modalBody");
  const modalCancel = new FakeElement("modalCancel");
  const modalConfirm = new FakeElement("modalConfirm");
  const opener = new FakeElement("opener");
  modal.children = [modalTitle, modalBody, modalCancel, modalConfirm];
  modalBackdrop.children = [modal];
  const elements = new Map([
    ["modalBackdrop", modalBackdrop],
    ["modalTitle", modalTitle],
    ["modalBody", modalBody],
    ["modalCancel", modalCancel],
    ["modalConfirm", modalConfirm],
  ]);
  return {
    activeElement: opener,
    opener,
    modalBackdrop,
    modal,
    modalCancel,
    modalConfirm,
    listeners: new Map(),
    getElementById(id) {
      return elements.get(id);
    },
    addEventListener(type, listener) {
      const listeners = this.listeners.get(type) ?? [];
      listeners.push(listener);
      this.listeners.set(type, listeners);
    },
    removeEventListener(type, listener) {
      const listeners = this.listeners.get(type) ?? [];
      this.listeners.set(type, listeners.filter((candidate) => candidate !== listener));
    },
    dispatch(type, event = {}) {
      for (const listener of [...(this.listeners.get(type) ?? [])]) listener(event);
    },
  };
}

async function loadUi(document) {
  globalThis.HTMLElement = FakeElement;
  globalThis.document = document;
  return import(`../public/js/ui.js?case=${crypto.randomUUID()}`);
}

test("modal is hidden on initialization", async () => {
  const document = createDocument();
  const { initializeModal } = await loadUi(document);
  initializeModal();
  assert.equal(document.modalBackdrop.hidden, true);
});

test("cancel closes the confirmation and resolves false", async () => {
  const document = createDocument();
  const { confirmAction } = await loadUi(document);
  const result = confirmAction({ title: "Delete", body: "Cancel test" });
  document.modalCancel.dispatch("click");
  assert.equal(await result, false);
  assert.equal(document.modalBackdrop.hidden, true);
  assert.equal(document.opener.focusCount, 1);
});

test("confirm executes exactly once and stale listeners are removed", async () => {
  const document = createDocument();
  const { confirmAction } = await loadUi(document);
  const result = confirmAction({ title: "Delete", body: "Confirm test" });
  document.modalConfirm.dispatch("click");
  document.modalConfirm.dispatch("click");
  assert.equal(await result, true);
  assert.equal(document.modalConfirm.listeners.get("click").length, 0);
});

test("escape closes without confirming", async () => {
  const document = createDocument();
  const { confirmAction } = await loadUi(document);
  const result = confirmAction({ title: "Delete", body: "Escape test" });
  document.dispatch("keydown", { key: "Escape" });
  assert.equal(await result, false);
  assert.equal(document.modalBackdrop.hidden, true);
});

test("inactive modal cannot execute a stale action", async () => {
  const document = createDocument();
  const { confirmAction } = await loadUi(document);
  const first = confirmAction({ title: "First", body: "First" });
  const second = confirmAction({ title: "Second", body: "Second" });
  assert.equal(await first, false);
  document.modalConfirm.dispatch("click");
  assert.equal(await second, true);
});
