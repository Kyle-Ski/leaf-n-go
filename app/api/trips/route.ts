import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { FrontendTrip } from "@/types/projectTypes";
import { validateAccessToken } from "@/utils/auth/validateAccessToken";

// GET all trips for the current user
export async function GET(req: NextRequest) {
  // Validate the access token
  const { error: validateError, user } = await validateAccessToken(req, supabaseServer);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
  }

  const userId = user.id

  try {
    const { data: trips, error } = await supabaseServer
      .from("trips")
      .select(`
        id,
        title,
        start_date,
        end_date,
        location,
        notes,
        ai_recommendation,
        created_at,
        updated_at,
        trip_checklists (
          checklist_id,
          checklists (
            title,
            checklist_items (
              id,
              completed
            )
          )
        ),
        trip_participants (
          user_id,
          role
        )
      `)
      .eq("user_id", userId);

    if (error) throw error;

    // Format each trip's trip_checklists
    const formattedTrips = trips.map((trip) => {
      if (trip.trip_checklists) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        trip.trip_checklists = trip.trip_checklists.map((tripChecklist: any) => {
          const checklist = tripChecklist.checklists; // Not an array based on the log
          const totalItems = checklist?.checklist_items?.length || 0;
          const completedItems =
            checklist?.checklist_items?.filter((item: { completed: boolean }) => item.completed).length || 0;

          return {
            checklist_id: tripChecklist.checklist_id,
            checklists: [
              {
                title: checklist?.title || "Untitled Checklist",
                checklist_items: checklist?.checklist_items || [],
              },
            ],
            totalItems,
            completedItems,
          };
        });
      }

      // Parse ai_recommendation to ensure it is a Record<string, string>
      const parsedAiRecommendation = trip.ai_recommendation
        ? JSON.parse(trip.ai_recommendation)
        : {};

      // Cast the trip to the new type if needed (optional for TypeScript)
      return { ...trip, ai_recommendation: parsedAiRecommendation } as FrontendTrip;
    });

    return NextResponse.json(formattedTrips, { status: 200 });
  } catch (err) {
    console.error("Error fetching trips:", err);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  // Validate the access token
  const { error: validateError, user } = await validateAccessToken(req, supabaseServer);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
  }

  const userId = user.id

  const { title, start_date, end_date, location, notes, checklists = [], participants = [] } = await req.json();

  if (!userId || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Create the trip
    const { data: newTrip, error: tripError } = await supabaseServer
      .from("trips")
      .insert([{ title, start_date, end_date, location, notes, user_id: userId }])
      .select()
      .single();

    if (tripError) throw tripError;

    // Add checklists to the trip
    if (checklists.length) {
      const tripChecklists = checklists.map((checklistId: string) => ({
        trip_id: newTrip.id,
        checklist_id: checklistId,
      }));
      const { error: checklistError } = await supabaseServer
        .from("trip_checklists")
        .insert(tripChecklists);

      if (checklistError) throw checklistError;
    }

    // Add participants to the trip
    if (participants.length) {
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
