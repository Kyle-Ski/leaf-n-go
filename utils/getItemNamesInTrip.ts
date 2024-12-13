import { AppState } from "@/types/projectTypes";

/**
 * The getExistingItems function retrieves a list of items associated with a 
 * specific trip from the application's state. It identifies the trip by its 
 * tripId, gathers the associated checklists, and extracts the items from those 
 * checklists. For each item, it includes its id and name. If an item's details 
 * cannot be found, it assigns a default name of "Unknown Item".
 * @param tripId the specific trip id
 * @param state our app state
 * @returns Array<{ id: string; name: string }> || "Unknown Item"
 */
const getExistingItems = (tripId: string, state: AppState) => {
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip) {
        console.error("Trip not found");
        return [];
    }

    const checklistIds = trip.trip_checklists.map((tc) => tc.checklist_id);
    const relatedChecklists = state.checklists.filter((checklist) =>
        checklistIds.includes(checklist.id)
    );

    return relatedChecklists.flatMap((checklist) =>
        checklist.items.map((item) => {
            const itemDetails = state.items.find((i) => i.id === item.item_id);
            return {
                id: item.item_id,
                name: itemDetails?.name || "Unknown Item",
            };
        })
    );
};

export default getExistingItems