import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createRandomPasswordHash() {
  const random = randomUUID() + randomUUID();
  return bcrypt.hash(random, SALT_ROUNDS);
}