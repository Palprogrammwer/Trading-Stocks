import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, validateRegistration, validateTicker, verifyPassword } from "../backend/src/auth.js";

test("passwords are hashed and verifiable", () => {
  const hash = hashPassword("secret-passphrase");
  assert.notEqual(hash, "secret-passphrase");
  assert.equal(verifyPassword("secret-passphrase", hash), true);
  assert.equal(verifyPassword("wrong-passphrase", hash), false);
});

test("registration and ticker validation reject invalid input", () => {
  assert.equal(validateRegistration({ name: "P", email: "bad", password: "123" }), "Der Name muss mindestens 2 Zeichen haben.");
  assert.deepEqual(validateTicker("aapl"), { ticker: "AAPL" });
  assert.ok(validateTicker("AAPL123").error);
});
