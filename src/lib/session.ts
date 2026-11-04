// Dùng được cả trong proxy.ts lẫn route handler (không phụ thuộc next/headers)
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "hcn_session";
export const SESSION_DAYS = 60;

function secretKey(): Uint8Array {
  const s =
    process.env.AUTH_SECRET ||
    // Dự phòng: nếu quên đặt AUTH_SECRET thì khoá được suy ra từ 2 mật khẩu
    `hcn-fallback:${process.env.USER1_PASSWORD ?? ""}:${process.env.USER2_PASSWORD ?? ""}`;
  return new TextEncoder().encode(s);
}

export async function signSession(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return payload.sub === "u1" || payload.sub === "u2" ? payload.sub : null;
  } catch {
    return null;
  }
}
