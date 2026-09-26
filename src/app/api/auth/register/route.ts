import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, girlProfiles } from "@/db/schema";
import { hashPassword, createToken } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName, role } = await req.json();

    if (!email || !password || !displayName || !["client", "girl"].includes(role)) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少6位" }, { status: 400 });
    }

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "该邮箱已注册" }, { status: 400 });
    }

    const id = uuidv4();
    const passwordHash = await hashPassword(password);

    await db.insert(users).values({
      id,
      email,
      passwordHash,
      role,
      displayName,
    });

    if (role === "girl") {
      await db.insert(girlProfiles).values({
        id: uuidv4(),
        userId: id,
        bio: "新来的，还在学怎么被用得更舒服。",
        tags: JSON.stringify(["新人", "可调教", "听话"]),
        price: 200,
        status: "idle",
        avatarEmoji: "🖤",
      });
    }

    const token = await createToken(id, role);
    const res = NextResponse.json({ ok: true, role });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
