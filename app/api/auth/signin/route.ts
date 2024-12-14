import { NextRequest, NextResponse } from "next/server";
import serviceContainer from "@/di/containers/serviceContainer";
import { DatabaseService } from "@/di/services/databaseService";

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Use the database service to sign in the user
    const { session, error } = await databaseService.signInWithEmailAndPassword(email, password);

    if (error || !session) {
      return NextResponse.json(
        { error: error?.message || "Invalid login" },
        { status: 400 }
      );
    }

    const { access_token, expires_in, user } = session;

    // Set a secure, HTTP-only cookie with the access token
    const response = NextResponse.json({ message: "Signed in successfully", user });
    response.cookies.set({
      name: "sb-access-token",
      value: access_token,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: expires_in,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error during sign-in:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error("Unexpected error during sign-in:", error);
      return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
  }
}
