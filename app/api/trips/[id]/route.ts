import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supbaseClient";

// GET: Fetch details for a specific trip
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const tripId = await params.id;

  if (!tripId) {
    return NextResponse.json({ error: "Trip ID is required." }, { status: 400 });
  }

  try {
    const { data: trip, error } = await supabaseServer
      .from("trips")
      .select(`
        id,
        title,
        start_date,
        end_date,
        location,
        notes,
        created_at,
        updated_at,
        trip_checklists (
          checklist_id,
          checklists (
            title
          )
        ),
        trip_participants (
          user_id,
          role
        )
      `)
      .eq("id", tripId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(trip, { status: 200 });
  } catch (err) {
    console.error("Error fetching trip:", err);
    return NextResponse.json({ error: "Failed to fetch trip details." }, { status: 500 });
  }
}

// DELETE: Delete a trip by ID
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const tripId = params.id;
  const userId = req.headers.get("x-user-id");

  if (!tripId || !userId) {
    return NextResponse.json({ error: "Trip ID and User ID are required" }, { status: 400 });
  }

  try {
    // Verify the user is the owner of the trip
    const { data: ownerCheck, error: ownerError } = await supabaseServer
      .from("trip_participants")
      .select("role")
      .eq("trip_id", tripId)
      .eq("user_id", userId)
      .single();

    if (ownerError || ownerCheck?.role !== "owner") {
      return NextResponse.json({ error: "You do not have permission to delete this trip" }, { status: 403 });
    }

    // Delete the trip
    const { error: tripError } = await supabaseServer.from("trips").delete().eq("id", tripId);

    if (tripError) throw tripError;

    return NextResponse.json({ message: "Trip deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("Error deleting trip:", err);
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}

// PATCH: Update a trip by ID
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const tripId = params.id;
  const userId = req.headers.get("x-user-id");
  const { title, start_date, end_date } = await req.json();

  if (!tripId || !userId) {
    return NextResponse.json({ error: "Trip ID and User ID are required" }, { status: 400 });
  }

  try {
    // Verify the user is the owner of the trip
    const { data: ownerCheck, error: ownerError } = await supabaseServer
      .from("trip_participants")
      .select("role")
      .eq("trip_id", tripId)
      .eq("user_id", userId)
      .single();

    if (ownerError || ownerCheck?.role !== "owner") {
      return NextResponse.json({ error: "You do not have permission to update this trip" }, { status: 403 });
    }

    // Update the trip details
    const { data: updatedTrip, error: updateError } = await supabaseServer
      .from("trips")
      .update({ title, start_date, end_date })
      .eq("id", tripId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(updatedTrip, { status: 200 });
  } catch (err) {
    console.error("Error updating trip:", err);
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}

// PUT: Update a trip by ID
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const tripId = await params.id;
  const userId = req.headers.get("x-user-id");
  const { title, start_date, end_date, location, notes, trip_checklists } = await req.json();

  if (!tripId || !userId) {
    return NextResponse.json({ error: "Trip ID and User ID are required" }, { status: 400 });
  }

  try {
    // Verify the user is the owner of the trip
    const { data: ownerCheck, error: ownerError } = await supabaseServer
      .from("trip_participants")
      .select("role")
      .eq("trip_id", tripId)
      .eq("user_id", userId)
      .single();

    if (ownerError || ownerCheck?.role !== "owner") {
      return NextResponse.json({ error: "You do not have permission to update this trip" }, { status: 403 });
    }

    // Update the trip details
    const { data: updatedTrip, error: updateError } = await supabaseServer
      .from("trips")
      .update({ title, start_date, end_date, location, notes })
      .eq("id", tripId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update trip checklists
    if (trip_checklists) {
      // Remove existing trip checklists
      const { error: deleteError } = await supabaseServer
        .from("trip_checklists")
        .delete()
        .eq("trip_id", tripId);

      if (deleteError) throw deleteError;

      // Add updated trip checklists
      const newTripChecklists = trip_checklists.map((checklist: { checklist_id: string }) => ({
        trip_id: tripId,
        checklist_id: checklist.checklist_id,
      }));

      const { error: insertError } = await supabaseServer
        .from("trip_checklists")
        .insert(newTripChecklists);

      if (insertError) throw insertError;
    }

    // Fetch the updated trip with its related data
    const { data: fullTrip, error: fetchError } = await supabaseServer
      .from("trips")
      .select(`
        id,
        title,
        start_date,
        end_date,
        location,
        notes,
        created_at,
        updated_at,
        trip_checklists (
          checklist_id,
          checklists (
            title
          )
        )
      `)
      .eq("id", tripId)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(fullTrip, { status: 200 });
  } catch (err) {
    console.error("Error updating trip:", err);
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}
