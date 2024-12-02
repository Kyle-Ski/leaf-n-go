import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supbaseClient";

// GET all trips for the current user
export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const { data: trips, error } = await supabaseServer
      .from("trips")
      .select(`
        *,
        trip_checklists(*),
        trip_participants(*)
      `)
      .eq("user_id", userId);

    if (error) throw error;

    return NextResponse.json(trips, { status: 200 });
  } catch (err) {
    console.error("Error fetching trips:", err);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

// POST: Create a new trip
export async function POST(req: NextRequest) {
  const { userId, title, start_date, end_date, checklists, participants } = await req.json();

  if (!userId || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Create the trip
    const { data: newTrip, error: tripError } = await supabaseServer
      .from("trips")
      .insert([{ title, start_date, end_date, user_id: userId }])
      .select()
      .single();

    if (tripError) throw tripError;

    // Add checklists to the trip (if provided)
    if (checklists?.length) {
      const tripChecklists = checklists.map((checklistId: string) => ({
        trip_id: newTrip.id,
        checklist_id: checklistId,
      }));
      const { error: checklistError } = await supabaseServer
        .from("trip_checklists")
        .insert(tripChecklists);

      if (checklistError) throw checklistError;
    }

    // Add participants to the trip (if provided)
    if (participants?.length) {
      const tripParticipants = participants.map((participant: { user_id: string; role: string }) => ({
        trip_id: newTrip.id,
        user_id: participant.user_id,
        role: participant.role,
      }));
      const { error: participantsError } = await supabaseServer
        .from("trip_participants")
        .insert(tripParticipants);

      if (participantsError) throw participantsError;
    }

    return NextResponse.json(newTrip, { status: 201 });
  } catch (err) {
    console.error("Error creating trip:", err);
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
  }
}
