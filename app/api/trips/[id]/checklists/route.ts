import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

  export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const tripId = await params.id;
    const userId = req.headers.get("x-user-id");
  
    if (!tripId || !userId) {
      return NextResponse.json({ error: "Trip ID and User ID are required." }, { status: 400 });
    }
  
    try {
      // Fetch checklists associated with the trip
      const { data: checklists, error } = await supabaseServer
        .from("trip_checklists")
        .select(`
          checklist_id,
          checklists (
            title,
            checklist_items (
              id,
              completed
            )
          )
        `)
        .eq("trip_id", tripId);
    
      if (error) throw error;
  
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
  