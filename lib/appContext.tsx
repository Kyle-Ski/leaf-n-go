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
    item_categories: []
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
                                weight: action.payload.weight,
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
                    (sum, ci) => sum + (ci.items.weight || 0),
                    0
                );

                const currentWeight = updatedChecklistItems
                    .filter((ci) => ci.completed)
                    .reduce((sum, ci) => sum + (ci.items.weight || 0), 0);

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

            // Additional Logging for State After Update
            console.log("State After UPDATE_ITEM:");
            console.log("Updated Items:", updatedItems);
            console.log("Updated Checklists:", updatedChecklists);

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
                const totalWeight = checklist.items.reduce((sum, item) => sum + (item.items.weight || 0), 0);
                const currentWeight = checklist.items
                    .filter((item) => item.completed)
                    .reduce((sum, item) => sum + (item.items.weight || 0), 0);

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
                const totalWeight = action.payload.items.reduce((sum: number, item: any) => sum + (item.items.weight || 0), 0);
                const currentWeight = action.payload.items
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .filter((item: any) => item.completed)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .reduce((sum: number, item: any) => sum + (item.items.weight || 0), 0);

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
            const itemWeight = item.items.weight || 0;

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
                        const tripItem = tc.checklists[0].checklist_items.find((ci) => ci.id === itemId);
                        const itemWasCompleted = tripItem?.completed ?? false;

                        let newCompletedItems = tc.completedItems;
                        let newCurrentWeight = tc.currentWeight ?? 0;

                        if (!itemWasCompleted && nowCompleted) {
                            newCompletedItems += 1;
                            newCurrentWeight += itemWeight;
                        } else if (itemWasCompleted && !nowCompleted) {
                            newCompletedItems -= 1;
                            newCurrentWeight -= itemWeight;
                        }

                        return {
                            ...tc,
                            completedItems: newCompletedItems,
                            currentWeight: newCurrentWeight
                        };
                    }
                    return tc;
                })
            }));

            return { ...state, checklists: updatedChecklists, trips: updatedTrips };
        }

        case "ADD_ITEM_TO_CHECKLIST": {
            const newItem = action.payload;
            const { checklist_id } = newItem;

            const itemWeight = newItem.items.weight || 0;

            const updatedChecklists = state.checklists.map((checklist) => {
                if (checklist.id === checklist_id) {
                    const total = (checklist.completion?.total ?? 0) + 1;
                    const totalWeight = (checklist.completion?.totalWeight ?? 0) + itemWeight;
                    const currentWeight = checklist.completion?.currentWeight ?? 0; // Not completed initially

                    return {
                        ...checklist,
                        completion: {
                            completed: checklist.completion?.completed ?? 0,
                            total: total,
                            totalWeight: totalWeight,
                            currentWeight: currentWeight
                        },
                        items: [...checklist.items, newItem],
                    };
                }
                return checklist;
            });

            const updatedTrips = state.trips.map((trip) => ({
                ...trip,
                trip_checklists: trip.trip_checklists.map((tc) => {
                    if (tc.checklist_id === checklist_id) {
                        const totalItems = tc.totalItems + 1;
                        const totalWeight = (tc.totalWeight ?? 0) + itemWeight;
                        const currentWeight = tc.currentWeight ?? 0; // No change since not completed

                        return {
                            ...tc,
                            totalItems,
                            totalWeight,
                            currentWeight
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
                    const itemWeight = removedItem.items.weight || 0;

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
                        const tripItem = tc.checklists[0].checklist_items.find((ci) => ci.id === itemId);
                        if (!tripItem) return tc;

                        const wasCompleted = tripItem.completed;
                        const itemWeight = state.items.find((itm) => itm.id === tripItem.item_id)?.weight || 0;

                        const totalItems = tc.totalItems - 1;
                        let completedItems = tc.completedItems;
                        let totalWeight = tc.totalWeight ?? 0;
                        let currentWeight = tc.currentWeight ?? 0;

                        totalWeight -= itemWeight;
                        if (wasCompleted) {
                            completedItems -= 1;
                            currentWeight -= itemWeight;
                        }

                        return {
                            ...tc,
                            totalItems,
                            completedItems,
                            totalWeight,
                            currentWeight
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
