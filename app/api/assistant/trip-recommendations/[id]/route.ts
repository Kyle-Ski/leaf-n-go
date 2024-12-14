import { NextRequest, NextResponse } from "next/server";
import { validateAccessTokenDI } from "@/utils/auth/validateAccessToken";
import serviceContainer from "@/di/containers/serviceContainer";
import { DatabaseService } from "@/di/services/databaseService";

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    // Extract tripId from the route parameters
    const { id: tripId } = await props.params;

    const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

    if (validateError) {
      return NextResponse.json({ validateError }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ validateError: "Unauthorized: User not found" }, { status: 401 });
    }

    const userId = user.id;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Parse the request body
    const { ai_recommendation } = await req.json();
    if (!ai_recommendation) {
      return NextResponse.json({ error: "AI recommendation is required" }, { status: 400 });
    }

    // Validate the trip ownership and update the AI recommendation
    try {
      await databaseService.validateAndUpdateTrip(tripId, userId, { ai_recommendation });
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }

    return NextResponse.json(
      { message: "AI recommendation updated successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Handle unknown error types gracefully
    if (error instanceof Error) {
      console.error("Error updating AI recommendation:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error("Unexpected error during AI recommendation update:", error);
      return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
  }
}
