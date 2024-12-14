import { NextRequest, NextResponse } from "next/server";
import { validateAccessTokenDI } from "@/utils/auth/validateAccessToken";
import serviceContainer from "@/di/containers/serviceContainer";
import { DatabaseService } from "@/di/services/databaseService";

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

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

  const userId = user.id


  if (!tripId || !userId) {
    return NextResponse.json({ error: "Trip ID and User ID are required." }, { status: 400 });
  }

  try {
    // Fetch checklists associated with the trip
    const { data: checklists } = await databaseService.getTripChecklistsAndItems(tripId)

    // Transform the data to include progress and total counts
    const transformedChecklists = checklists.map((tripChecklist) => {
      // Handle checklists array safely
      const checklistArray = Array.isArray(tripChecklist.checklists)
        ? tripChecklist.checklists
        : [tripChecklist.checklists]; // Ensure it's an array

      if (!checklistArray.length) {
        return {
          id: tripChecklist.checklist_id,
          title: "Untitled Checklist",
          totalItems: 0,
          completedItems: 0,
        };
      }

      // Calculate totals from the first checklist (if multiple exist, decide logic)
      const checklist = checklistArray[0];
      const totalItems = checklist?.checklist_items?.length || 0;
      const completedItems =
        checklist?.checklist_items?.filter((item) => item.completed).length || 0;

      return {
        id: tripChecklist.checklist_id,
        title: checklist?.title || "Untitled Checklist",
        totalItems,
        completedItems,
      };
    });

    return NextResponse.json(transformedChecklists, { status: 200 });
  } catch (err) {
    console.error("Error fetching checklists for trip:", err);
    return NextResponse.json({ error: "Failed to fetch checklists for trip." }, { status: 500 });
  }
}
