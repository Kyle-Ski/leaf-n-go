import React, { createContext, useReducer, useContext, useEffect } from "react";
import { AppState, Action, ChecklistWithItems } from "@/types/projectTypes";

const initialState: AppState = {
    trips: [],
    checklists: [],
    items: [],
    userSettings: null,
    isNew: false,
    noTrips: false,
    noChecklists: false,
    noItems: false,
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case "SET_ITEMS":
            return { ...state, items: action.payload };
        case "ADD_ITEM":
            return { ...state, items: [...state.items, action.payload] };
        case "UPDATE_ITEM":
            return {
                ...state,
                items: state.items.map((item) =>
                    item.id === action.payload.id
                        ? action.payload
                        : item
                ),
            };
        case "SET_NO_ITEMS_FOR_USER":
            return { ...state, noItems: action.payload };
        case "SET_TRIPS":
            return { ...state, trips: action.payload };
        case "ADD_TRIP":
            return { ...state, trips: [...state.trips, action.payload] };
        case "UPDATE_TRIP":
            const updatedTrip = { ...action.payload };

            // Ensure trip_checklists always have checklists as an array
            updatedTrip.trip_checklists = updatedTrip.trip_checklists.map(tc => {
                let checklistsAsArray = tc.checklists;
                if (checklistsAsArray && !Array.isArray(checklistsAsArray)) {
                    // If it's a single object, wrap it in an array
                    checklistsAsArray = [checklistsAsArray];
                }

                return {
                    ...tc,
                    checklists: checklistsAsArray
                };
            });

            return {
                ...state,
                trips: state.trips.map((trip) =>
                    trip.id === updatedTrip.id ? updatedTrip : trip
                ),
            };
        case "REMOVE_TRIP":
            return { ...state, trips: state.trips.filter((t) => t.id !== action.payload) };
        case "SET_NO_TRIPS_FOR_USER":
            return { ...state, noTrips: action.payload };
        case "SET_CHECKLISTS":
            return { ...state, checklists: action.payload };
        case "ADD_CHECKLIST":
            return { ...state, checklists: [...state.checklists, action.payload] };
        case "REMOVE_CHECKLIST":
            return { ...state, checklists: state.checklists.filter((c) => c.id !== action.payload) };
        case "CHECK_ITEM_IN_CHECKLIST": {
            const { checklistId, checkedState, itemId } = action.payload;

            // Ensure `checklistId` is a string (if it could be a string array)
            if (Array.isArray(checklistId)) {
                console.error("Checklist ID must be a string.");
                return { ...state };
            }

            // Find the checklist to update immutably
            const checklistToUpdateIndex = state.checklists.findIndex((c) => c.id === checklistId);
            const checklistToUpdate = state.checklists[checklistToUpdateIndex];

            if (!checklistToUpdate) {
                console.error("Cannot find checklist to check item.");
                return { ...state };
            }

            // Update the `completed` count immutably
            const updatedCompletedTotal = checkedState
                ? (checklistToUpdate.completion?.completed ?? 0) + 1
                : (checklistToUpdate.completion?.completed ?? 0) - 1;

            // Update the checklist items immutably
            const updatedItems = checklistToUpdate.items.map((item) =>
                item.id === itemId
                    ? { ...item, completed: Boolean(checkedState) } // Ensure `completed` is a boolean
                    : item
            );

            // Create a fully updated checklist
            const updatedChecklist: ChecklistWithItems = {
                ...checklistToUpdate,
                items: updatedItems, // Update the items array
                completion: {
                    completed: updatedCompletedTotal,
                    total: checklistToUpdate.completion?.total ?? 0, // Ensure total is always a number
                },
            };

            // Replace the updated checklist in the array immutably
            const updatedChecklists: ChecklistWithItems[] = state.checklists.map((checklist, index) =>
                index === checklistToUpdateIndex ? updatedChecklist : checklist
            );

            // Update trips data to reflect changes in trip_checklists
            const updatedTrips = state.trips.map((trip) => ({
                ...trip,
                trip_checklists: trip.trip_checklists.map((tripChecklist) => {
                    if (tripChecklist.checklist_id === checklistId) {
                        const wasCompleted = tripChecklist.checklists[0].checklist_items.find(
                            (item) => item.id === itemId
                        )?.completed;

                        const updatedCompletedItems = checkedState
                            ? tripChecklist.completedItems + 1
                            : wasCompleted
                                ? tripChecklist.completedItems - 1
                                : tripChecklist.completedItems;

                        return {
                            ...tripChecklist,
                            completedItems: updatedCompletedItems,
                        };
                    }
                    return tripChecklist;
                }),
            }));

            // Return the updated state
            return {
                ...state,
                checklists: updatedChecklists,
                trips: updatedTrips,
            };
        }
        case "ADD_ITEM_TO_CHECKLIST": {
            const { checklist_id } = action.payload;
            return {
                ...state,
                checklists: state.checklists.map((checklist) => {
                    if (checklist.id === checklist_id) {
                        const completedProperty = checklist.completion?.completed ?? 0;
                        const completedTotal = (checklist.completion?.total ?? 0) + 1;
                        return {
                            ...checklist,
                            completion: { completed: completedProperty, total: completedTotal },
                            items: [...checklist.items, action.payload], // Add the new item to the checklist's items array
                        };
                    }
                    return checklist;
                }),
                trips: state.trips.map((trip) => ({
                    ...trip,
                    trip_checklists: trip.trip_checklists.map((tripChecklist) => {
                        if (tripChecklist.checklist_id === checklist_id) {
                            return {
                                ...tripChecklist,
                                totalItems: tripChecklist.totalItems + 1,
                            };
                        }
                        return tripChecklist;
                    }),
                })),
            };
        }

        case "REMOVE_ITEM_FROM_CHECKLIST": {
            return {
                ...state,
                checklists: state.checklists.map((checklist) => {
                    if (checklist.id === action.payload.checklistId) {
                        // Filter out the removed item
                        const updatedItems = checklist.items.filter(
                            (item) => item.id !== action.payload.itemId
                        );
                        // Determine if the removed item was completed
                        const wasCompleted = checklist.items.find(
                            (item) => item.id === action.payload.itemId
                        )?.completed;

                        // Update totals
                        const completedTotal = (checklist.completion?.total ?? 0) - 1;
                        const completedProperty = wasCompleted
                            ? (checklist.completion?.completed ?? 0) - 1
                            : checklist.completion?.completed ?? 0;

                        return {
                            ...checklist,
                            completion: { completed: completedProperty, total: completedTotal },
                            items: updatedItems,
                        };
                    }
                    return checklist;
                }),
                trips: state.trips.map((trip) => ({
                    ...trip,
                    trip_checklists: trip.trip_checklists.map((tripChecklist) => {
                        if (tripChecklist.checklist_id === action.payload.checklistId) {
                            const wasCompleted = tripChecklist.checklists[0].checklist_items.find(
                                (item) => item.id === action.payload.itemId
                            )?.completed;

                            return {
                                ...tripChecklist,
                                totalItems: tripChecklist.totalItems - 1,
                                completedItems: wasCompleted
                                    ? tripChecklist.completedItems - 1
                                    : tripChecklist.completedItems,
                            };
                        }
                        return tripChecklist;
                    }),
                })),
            };
        }
        case "SET_NO_CHECKLISTS_FOR_USER":
            return { ...state, noChecklists: action.payload };
        case "SET_IS_NEW":
            return { ...state, isNew: action.payload };
        default:
            // Add other cases..
            return state;
    }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // Load state from local storage on mount
    useEffect(() => {
        const storedState = localStorage.getItem("appState");
        if (storedState) {
            try {
                const parsedState = JSON.parse(storedState) as AppState;
                dispatch({ type: "SET_ITEMS", payload: parsedState.items });
                dispatch({ type: "SET_TRIPS", payload: parsedState.trips });
                dispatch({ type: "SET_CHECKLISTS", payload: parsedState.checklists });
                // Add other state restoration as needed
            } catch (error) {
                console.error("Failed to parse stored app state:", error);
            }
        }
    }, []);

    // Save state to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem("appState", JSON.stringify(state));
    }, [state]);

    return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};
