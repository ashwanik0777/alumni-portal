import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEY_LENGTH = 64;

export function hashPassword(plainText: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plainText, salt, SCRYPT_KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(plainText: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;

  const hashedInput = scryptSync(plainText, salt, SCRYPT_KEY_LENGTH);
  const storedBuffer = Buffer.from(hash, "hex");

  if (storedBuffer.length !== hashedInput.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, hashedInput);
}
