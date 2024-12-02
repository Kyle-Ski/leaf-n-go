import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supbaseClient";

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
