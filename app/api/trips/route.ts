import { NextRequest, NextResponse } from "next/server";
import { FrontendTrip } from "@/types/projectTypes";
import { validateAccessTokenDI } from "@/utils/auth/validateAccessToken";
import serviceContainer from "@/di/containers/serviceContainer";
import { DatabaseService } from "@/di/services/databaseService";

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

// GET all trips for the current user
export async function GET(req: NextRequest) {
  // Validate the access token
  const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
  }

  const userId = user.id

  try {
    const trips = await databaseService.fetchUserTrips(userId);

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
  const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

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
    const newTrip = await databaseService.createTrip({
      title,
      start_date,
      end_date,
      location,
      notes,
      user_id: userId,
    });

    // Add checklists to the trip
    if (checklists.length) {
      const tripChecklists = checklists.map((checklistId: string) => ({
        trip_id: newTrip.id,
        checklist_id: checklistId,
      }));
      await databaseService.addTripChecklists(tripChecklists);
    }

    // Add participants to the trip
    if (participants.length) {
      const tripParticipants = participants.map((participant: { user_id: string; role: string }) => ({
        trip_id: newTrip.id,
        user_id: participant.user_id,
        role: participant.role,
      }));
      await databaseService.addTripParticipants(tripParticipants);
    }

    return NextResponse.json(newTrip, { status: 201 });
  } catch (err) {
    console.error("Error creating trip:", err);
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
  }

}
