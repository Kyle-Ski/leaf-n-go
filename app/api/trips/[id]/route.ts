import { NextRequest, NextResponse } from "next/server";
import { FrontendTrip } from "@/types/projectTypes";
import { validateAccessTokenDI } from "@/utils/auth/validateAccessToken";
import serviceContainer from "@/di/containers/serviceContainer";
import { DatabaseService } from "@/di/services/databaseService";

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

// GET: Fetch details for a specific trip
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const tripId = await params.id;
  // Validate the access token
  const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
  }

  if (!tripId) {
    return NextResponse.json({ error: "Trip ID is required." }, { status: 400 });
  }

  try {
    const trip = await databaseService.getTripDetails(tripId);

    // Transform the trip_checklists to include totalItems and completedItems
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
      }) as FrontendTrip["trip_checklists"];
    }

    // Cast the trip to the new type
    const frontendTrip = trip as FrontendTrip;

    return NextResponse.json(frontendTrip, { status: 200 });
  } catch (err) {
    console.error("Error fetching trip:", err);
    return NextResponse.json({ error: "Failed to fetch trip details." }, { status: 500 });
  }
}


// DELETE: Delete a trip by ID
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const tripId = await params.id;
  // Validate the access token
  const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
  }

  // const userId = user.id

  if (!tripId) {
    return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
  }

  try {
    // Verify the user is the owner of the trip
    // const { data: ownerCheck, error: ownerError } = await supabaseServer
    //   .from("trip_participants")
    //   .select("role")
    //   .eq("trip_id", tripId)
    //   .eq("user_id", userId)
    //   .single();

    // if (ownerError || ownerCheck?.role !== "owner") {
    //   return NextResponse.json({ error: "You do not have permission to delete this trip" }, { status: 403 });
    // }

    // Delete the trip
    await databaseService.deleteTrip(tripId)

    return NextResponse.json({ message: "Trip deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("Error deleting trip:", err);
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}

// PUT: Update a trip by ID
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const tripId = await params.id;
  // Validate the access token
  const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
  }

  const userId = user.id

  const { title, start_date, end_date, location, notes, trip_checklists } = await req.json();

  if (!tripId || !userId) {
    return NextResponse.json({ error: "Trip ID and User ID are required" }, { status: 400 });
  }

  try {
    // Verify the user is the owner of the trip
    // const { data: ownerCheck, error: ownerError } = await supabaseServer
    //   .from("trip_participants")
    //   .select("role")
    //   .eq("trip_id", tripId)
    //   .eq("user_id", userId)
    //   .single();

    // if (ownerError || ownerCheck?.role !== "owner") {
    //   return NextResponse.json({ error: "You do not have permission to update this trip" }, { status: 403 });
    // }

    // Update the trip details
    await databaseService.updateTripDetails(tripId, title, start_date, end_date, location, notes)

    // Update trip checklists
    if (trip_checklists) {
      // Remove existing trip checklists
      await databaseService.deleteTripChecklist(tripId);

      // Add updated trip checklists
      const newTripChecklists = trip_checklists.map((checklist: { checklist_id: string }) => ({
        trip_id: tripId,
        checklist_id: checklist.checklist_id,
      }));

      await databaseService.addChecklistsToTrip(newTripChecklists)
    }

    // Fetch the updated trip with its related data, including totalItems and completedItems
    const fullTrip = await databaseService.getTripDetails(tripId)

    // Add totalItems and completedItems to the checklists
    if (fullTrip.trip_checklists) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fullTrip.trip_checklists = fullTrip.trip_checklists.map((tripChecklist: any) => {
        const checklist = tripChecklist.checklists;
        const totalItems = checklist?.checklist_items?.length || 0;
        const completedItems = checklist?.checklist_items?.filter((item: { completed: boolean }) => item.completed).length || 0;

        return {
          ...tripChecklist,
          totalItems,
          completedItems,
        };
      });
    }

    return NextResponse.json(fullTrip, { status: 200 });
  } catch (err) {
    console.error("Error updating trip:", err);
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}
