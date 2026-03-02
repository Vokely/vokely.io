import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const logoutAll = searchParams.get("all") === "true";

  const host = request.headers.get("host");
  const isLocalhost = host?.includes("localhost");

  const cookieOptions = {
    name: "access_token",
    value: "",
    httpOnly: true,
    secure: true,
    expires: new Date(0),
    path: "/",
  };

  if (!isLocalhost && host) {
    cookieOptions["domain"] = `.${host}`;
  }

  try {
    // Forward the cookies from the incoming request to the backend
    const cookieHeader = request.headers.get("cookie");

    const endpoint = logoutAll ? "logout-all" : "logout";

    const res = await fetch(`${process.env.API_URL}/api/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { success: false, message: error.detail || "Logout failed" },
        { status: res.status }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: logoutAll
        ? "Logged out from all devices successfully"
        : "Logged out successfully",
    });

    response.cookies.set(cookieOptions);
    return response;
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json(
      { success: false, message: "Logout call failed", error: err.message },
      { status: 500 }
    );
  }
}
