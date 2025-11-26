import { NextResponse } from "next/server";
import { addMockUser } from "@/app/lib/mockUsers";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const email = payload?.email?.toString().trim();
  const password = payload?.password?.toString();
  const name = payload?.name?.toString().trim() || "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  try {
    addMockUser({ email, password, name: name || email.split("@")[0] });
    return NextResponse.json({ message: "Account created" }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Unable to register" }, { status: 409 });
  }
}
