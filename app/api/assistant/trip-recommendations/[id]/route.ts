import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { validateAccessToken } from "@/utils/auth/validateAccessToken";

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        // Extract tripId from the route parameters
        const { id } = await props.params;

        const { error: validateError, user } = await validateAccessToken(req, supabaseServer);

        if (validateError) {
            return NextResponse.json({ validateError }, { status: 401 });
        }

        if (!user) {
            return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
        }

        const userId = user.id

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Parse the request body
        const { ai_recommendation } = await req.json();
        if (!ai_recommendation) {
            return NextResponse.json({ error: "AI recommendation is required" }, { status: 400 });
        }

        // Check if the trip belongs to the user
        const { data: trip, error: tripError } = await supabaseServer
            .from("trips")
            .select("id, user_id")
            .eq("id", id)
            .single();

        if (tripError || !trip) {
            return NextResponse.json({ error: "Trip not found or you don't have access to it" }, { status: 404 });
        }

        if (trip.user_id !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Update the AI recommendation in the trips table
        const { error: updateError } = await supabaseServer
            .from("trips")
            .update({ ai_recommendation })
            .eq("id", id);

        if (updateError) {
            console.error("Error updating trip:", updateError);
            return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
        }

        return NextResponse.json({ message: "AI recommendation updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error updating AI recommendation:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}
