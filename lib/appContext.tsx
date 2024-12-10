import React, { createContext, useReducer, useContext, useEffect } from "react";
import { AppState, Action, ChecklistWithItems, ChecklistItem } from "@/types/projectTypes";

const initialState: AppState = {
    trips: [],
    checklists: [],
    items: [],
    userSettings: null,
    isNew: false,
    noTrips: false,
    noChecklists: false,
    noItems: false,
    item_categories: [],
    user_settings: {
        user_id: "",
        dark_mode: false,
        email_notifications: false,
        push_notifications: false,
        weight_unit: "lbs"
    }
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case "SET_ITEMS":
            return { ...state, items: action.payload };

        case "ADD_ITEM":
            return { ...state, items: [...state.items, action.payload] };

        case "UPDATE_ITEM": {
            // Update the items array in the global state
            const updatedItems = state.items.map((item) =>
                item.id === action.payload.id ? action.payload : item
            );

            // Initialize an array to hold updated checklists
            const updatedChecklists = state.checklists.map((checklist) => {
                // Check if this checklist contains the updated item
                const isItemInChecklist = checklist.items.some((ci) => ci.item_id === action.payload.id);

                if (!isItemInChecklist) {
                    // If the checklist does not contain the updated item, return it unchanged
                    return checklist;
                }

                // Update the ChecklistItem within the checklist
                const updatedChecklistItems = checklist.items.map((ci) => {
                    if (ci.item_id === action.payload.id) {
                        return {
                            ...ci,
                            items: {
                                ...ci.items,
                                // Update all relevant fields of the item. Adjust as necessary.
                                name: action.payload.name,
                                weight: action.payload?.weight,
                                notes: action.payload.notes,
                                quantity: action.payload.quantity,
                                // Add other fields if necessary
                            },
                        };
                    }
                    return ci;
                });

                // Recalculate totalWeight and currentWeight based on updated items
                const totalWeight = updatedChecklistItems.reduce(
                    (sum, ci) => sum + (ci.items?.weight || 0),
                    0
                );

                const currentWeight = updatedChecklistItems
                    .filter((ci) => ci.completed)
                    .reduce((sum, ci) => sum + (ci.items?.weight || 0), 0);

                // Optionally, recalculate 'completed' count if it depends on specific logic
                const completedCount = updatedChecklistItems.filter((ci) => ci.completed).length;

                return {
                    ...checklist,
                    items: updatedChecklistItems,
                    completion: {
                        completed: completedCount,
                        total: checklist.completion?.total ?? updatedChecklistItems.length,
                        totalWeight: totalWeight,
                        currentWeight: currentWeight,
                    },
                };
            });

            return { ...state, items: updatedItems, checklists: updatedChecklists };
        }

        case "SET_NO_ITEMS_FOR_USER":
            return { ...state, noItems: action.payload };

        case "SET_TRIPS":
            return { ...state, trips: action.payload };

        case "ADD_TRIP":
            return { ...state, trips: [...state.trips, action.payload] };

        case "UPDATE_TRIP": {
            const updatedTrip = { ...action.payload };
            // Ensure trip_checklists always have checklists as an array
            updatedTrip.trip_checklists = updatedTrip.trip_checklists.map(tc => {
                let checklistsAsArray = tc.checklists;
                if (checklistsAsArray && !Array.isArray(checklistsAsArray)) {
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
        }

        case "REMOVE_TRIP":
            return { ...state, trips: state.trips.filter((t) => t.id !== action.payload) };

        case "SET_NO_TRIPS_FOR_USER":
            return { ...state, noTrips: action.payload };

        case "SET_CHECKLISTS": {
            // Initialize currentWeight and totalWeight for each checklist
            const updatedChecklists = action.payload.map((checklist: ChecklistWithItems) => {
                const totalWeight = checklist.items.reduce((sum, item) => sum + (item.items?.weight || 0), 0);
                const currentWeight = checklist.items
                    .filter((item) => item.completed)
                    .reduce((sum, item) => sum + (item.items?.weight || 0), 0);

                return {
                    ...checklist,
                    completion: {
                        completed: checklist.completion?.completed ?? 0,
                        total: checklist.completion?.total ?? checklist.items.length,
                        currentWeight: currentWeight,
                        totalWeight: totalWeight
                    }
                };
            });

            return { ...state, checklists: updatedChecklists };
        }

        case "ADD_CHECKLIST":
            // When a new checklist is added, initialize the weights
            if (action.payload.items) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const totalWeight = action.payload.items.reduce((sum: number, item: any) => {
                    return sum + (item.items?.weight || 0)
                }, 0);
                const currentWeight = action.payload.items
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .filter((item: any) => item.completed)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .reduce((sum: number, item: any) => sum + (item.items?.weight || 0), 0);

                action.payload = {
                    ...action.payload,
                    completion: {
                        completed: action.payload.completion?.completed ?? 0,
                        total: action.payload.completion?.total ?? action.payload.items.length,
                        currentWeight,
                        totalWeight
                    }
                };
            }
            return { ...state, checklists: [...state.checklists, action.payload] };

        case "REMOVE_CHECKLIST":
            return { ...state, checklists: state.checklists.filter((c) => c.id !== action.payload) };

        case "CHECK_ITEM_IN_CHECKLIST": {
            const { checklistId, checkedState, itemId } = action.payload;
            if (Array.isArray(checklistId)) {
                console.error("Checklist ID must be a string.");
                return { ...state };
            }

            const checklistIndex = state.checklists.findIndex((c) => c.id === checklistId);
            const checklist = state.checklists[checklistIndex];
            if (!checklist) return state;

            // Update the checklist items
            const updatedItems = checklist.items.map((item) => {
                if (item.id === itemId) {
                    return { ...item, completed: Boolean(checkedState) };
                }
                return item;
            });

            // Find the updated item
            const item = updatedItems.find(i => i.id === itemId);
            if (!item) return state;

            const wasCompleted = checklist.items.find(i => i.id === itemId)?.completed ?? false;
            const nowCompleted = item.completed;
            const itemWeight = item.items?.weight || 0;

            let completedCount = checklist.completion?.completed ?? 0;
            let currentWeight = checklist.completion?.currentWeight ?? 0;

            // Update completed count and currentWeight
            if (!wasCompleted && nowCompleted) {
                completedCount += 1;
                currentWeight += itemWeight;
            } else if (wasCompleted && !nowCompleted) {
                completedCount -= 1;
                currentWeight -= itemWeight;
            }

            const updatedChecklist: ChecklistWithItems = {
                ...checklist,
                items: updatedItems,
                completion: {
                    completed: completedCount,
                    total: checklist.completion?.total ?? checklist.items.length,
                    totalWeight: checklist.completion?.totalWeight ?? 0,
                    currentWeight: currentWeight
                },
            };

            const updatedChecklists = state.checklists.map((c, i) => i === checklistIndex ? updatedChecklist : c);

            // Update trips as well
            const updatedTrips = state.trips.map((trip) => ({
                ...trip,
                trip_checklists: trip.trip_checklists.map((tc) => {
                    if (tc.checklist_id === checklistId) {
                        // Update the trip's checklist completion info
                        const matchingChecklist = updatedChecklists.find((cl) => cl.id === checklistId);
                        const updatedCompletedItems = matchingChecklist?.completion?.completed ?? 0;
                        const updatedCurrentWeight = matchingChecklist?.completion?.currentWeight ?? 0;

                        return {
                            ...tc,
                            completedItems: updatedCompletedItems,
                            currentWeight: updatedCurrentWeight,
                        };
                    }
                    return tc;
                }),
            }));

            return { ...state, checklists: updatedChecklists, trips: updatedTrips };
        }

        case "ADD_ITEM_TO_CHECKLIST": {
            const newItems: ChecklistItem[] = action.payload; // Array of ChecklistItem objects

            // Create a map of total quantities and weights to update completion
            const totalsMap = newItems.reduce<Record<string, { totalQuantity: number; totalWeight: number }>>(
                (acc, item) => {
                    if (!acc[item.checklist_id]) {
                        acc[item.checklist_id] = { totalQuantity: 0, totalWeight: 0 };
                    }
                    acc[item.checklist_id].totalQuantity += item.quantity || 1;
                    acc[item.checklist_id].totalWeight += (item.items?.weight || 0) * item.quantity;
                    return acc;
                },
                {}
            );

            // Update checklists
            const updatedChecklists = state.checklists.map((checklist) => {
                if (totalsMap[checklist.id]) {
                    const { totalQuantity, totalWeight } = totalsMap[checklist.id];

                    // Append all new items related to this checklist
                    const newChecklistItems = newItems.filter((item) => item.checklist_id === checklist.id);

                    return {
                        ...checklist,
                        completion: {
                            completed: checklist.completion?.completed ?? 0,
                            total: (checklist.completion?.total ?? 0) + totalQuantity,
                            totalWeight: (checklist.completion?.totalWeight ?? 0) + totalWeight,
                            currentWeight: checklist.completion?.currentWeight ?? 0, // No change for current weight
                        },
                        items: [...checklist.items, ...newChecklistItems], // Add new items without merging
                    };
                }
                return checklist;
            });

            // Update trips
            const updatedTrips = state.trips.map((trip) => ({
                ...trip,
                trip_checklists: trip.trip_checklists.map((tc) => {
                    if (totalsMap[tc.checklist_id]) {
                        const { totalQuantity, totalWeight } = totalsMap[tc.checklist_id];
                        return {
                            ...tc,
                            totalItems: tc.totalItems + totalQuantity,
                            totalWeight: (tc.totalWeight ?? 0) + totalWeight,
                            currentWeight: tc.currentWeight ?? 0, // No change for current weight
                        };
                    }
                    return tc;
                }),
            }));

            return { ...state, checklists: updatedChecklists, trips: updatedTrips };
        }

        case "REMOVE_ITEM_FROM_CHECKLIST": {
            const { checklistId, itemId } = action.payload;

            const updatedChecklists = state.checklists.map((checklist) => {
                if (checklist.id === checklistId) {
                    const removedItem = checklist.items.find((i) => i.id === itemId);
                    if (!removedItem) return checklist;

                    const wasCompleted = removedItem.completed;
                    const itemWeight = removedItem.items?.weight || 0;

                    const updatedItems = checklist.items.filter((i) => i.id !== itemId);

                    const total = (checklist.completion?.total ?? 0) - 1;
                    let completed = checklist.completion?.completed ?? 0;
                    let totalWeight = checklist.completion?.totalWeight ?? 0;
                    let currentWeight = checklist.completion?.currentWeight ?? 0;

                    totalWeight -= itemWeight;
                    if (wasCompleted) {
                        completed -= 1;
                        currentWeight -= itemWeight;
                    }

                    return {
                        ...checklist,
                        completion: {
                            completed,
                            total,
                            totalWeight,
                            currentWeight
                        },
                        items: updatedItems,
                    };
                }
                return checklist;
            });

            const updatedTrips = state.trips.map((trip) => ({
                ...trip,
                trip_checklists: trip.trip_checklists.map((tc) => {
                    if (tc.checklist_id === checklistId) {
                        // Recalculate trip-level values based on the updated checklist
                        const matchingChecklist = updatedChecklists.find((cl) => cl.id === checklistId);
                        const updatedTotalItems = matchingChecklist?.completion?.total ?? 0;
                        const updatedCompletedItems = matchingChecklist?.completion?.completed ?? 0;
                        const updatedTotalWeight = matchingChecklist?.completion?.totalWeight ?? 0;
                        const updatedCurrentWeight = matchingChecklist?.completion?.currentWeight ?? 0;

                        return {
                            ...tc,
                            totalItems: updatedTotalItems,
                            completedItems: updatedCompletedItems,
                            totalWeight: updatedTotalWeight,
                            currentWeight: updatedCurrentWeight,
                        };
                    }
                    return tc;
                }),
            }));

            return { ...state, checklists: updatedChecklists, trips: updatedTrips };
        }

        case "SET_NO_CHECKLISTS_FOR_USER":
            return { ...state, noChecklists: action.payload };

        case "SET_IS_NEW":
            return { ...state, isNew: action.payload };

        case "SET_CATEGORIES":
            return { ...state, item_categories: action.payload };

        case "SET_USER_SETTINGS": {
            return {
                ...state,
                user_settings: { ...state.user_settings, ...action.payload },
            };
        }

        case "UPDATE_USER_SETTING": {
            console.log("UPDATING:", action.payload)
            const { key, value } = action.payload;
            return {
                ...state,
                user_settings: {
                    ...state.user_settings,
                    [key]: value,
                },
            };
        }

        default:
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
                // Ensure all checklists have completion fields
                const checklistsWithCompletion = parsedState.checklists.map((checklist) => ({
                    ...checklist,
                    completion: {
                        completed: checklist.completion?.completed ?? 0,
                        total: checklist.completion?.total ?? checklist.items.length,
                        currentWeight: checklist.completion?.currentWeight ?? 0,
                        totalWeight: checklist.completion?.totalWeight ?? 0,
                    },
                }));
                dispatch({ type: "SET_ITEMS", payload: parsedState.items });
                dispatch({ type: "SET_TRIPS", payload: parsedState.trips });
                dispatch({ type: "SET_CHECKLISTS", payload: checklistsWithCompletion });
                dispatch({ type: "SET_CATEGORIES", payload: parsedState.item_categories });
                dispatch({ type: "SET_USER_SETTINGS", payload: parsedState.user_settings });
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
