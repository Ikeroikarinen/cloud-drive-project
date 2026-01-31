import jwt, { type SignOptions } from "jsonwebtoken";

export type JwtPayload = { userId: string };

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET in .env");
  return secret;
}

export function signToken(payload: JwtPayload, expiresIn: SignOptions["expiresIn"] = "7d") {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, getSecret(), options);
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, getSecret());
  if (typeof decoded !== "object" || decoded === null || !("userId" in decoded)) {
    throw new Error("Invalid token payload");
  }
  return decoded as JwtPayload;
}
