import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import User from "@/models/User";
import dbConnection from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    await dbConnection();
    const fullUser = await User.findById(user.userId)
      .populate("bolsa")
      .select("-password");

    if (!fullUser) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: fullUser,
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
