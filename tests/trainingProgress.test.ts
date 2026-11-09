import test from "node:test";
import assert from "node:assert/strict";
import { progressStorageKey, setStaffStorageIdentity, userProgressStorageKey } from "../lib/trainingProgress";

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

test("legacy ATLAS progress migrates to the first signed-in staff user and user keys are isolated", () => {
  const original = globalThis.window;
  const localStorage = new MemoryStorage();
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage } });
  try {
    localStorage.setItem(progressStorageKey, JSON.stringify({ pronunciation: { attempts: 3 } }));
    setStaffStorageIdentity("staff-a");
    assert.equal(localStorage.getItem(userProgressStorageKey("staff-a")), JSON.stringify({ pronunciation: { attempts: 3 } }));
    assert.equal(localStorage.getItem(progressStorageKey), null);
    assert.notEqual(userProgressStorageKey("staff-a"), userProgressStorageKey("staff-b"));
  } finally {
    if (original === undefined) Reflect.deleteProperty(globalThis, "window");
    else Object.defineProperty(globalThis, "window", { configurable: true, value: original });
  }
});

test("blocked localStorage does not interrupt staff initialization", () => {
  const original = globalThis.window;
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } } } });
  try { assert.doesNotThrow(() => setStaffStorageIdentity("staff-storage-disabled")); }
  finally { Object.defineProperty(globalThis, "window", { configurable: true, value: original }); }
});
