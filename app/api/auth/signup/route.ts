import { NextRequest, NextResponse } from "next/server";
import serviceContainer from "@/di/containers/serviceContainer";
import { DatabaseService } from "@/di/services/databaseService";

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Use the database service to sign up the user
    const { error } = await databaseService.signUp(email, password);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message:
          "A confirmation email has been sent. Please check your inbox to verify your account.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error during signup:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error("Unexpected error during signup:", error);
      return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
  }
}
