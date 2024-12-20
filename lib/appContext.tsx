import React, { createContext, useReducer, useContext, useEffect } from "react";
import { AppState, Action, ChecklistWithItems, ChecklistItem } from "@/types/projectTypes";

const initialState: AppState = {
    trips: [],
    checklists: [],
    items: [],
    isNew: false,
    noTrips: false,
    noChecklists: false,
    noItems: false,
    item_categories: [],
    trip_categories: [],
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
        case "ADD_CATEGORY":
            return { ...state, item_categories: [...state.item_categories, action.payload] }
        case "ADD_ITEM":
            // Check if the item ID already exists in state
            const itemExists = state.items.some(item => item.id === action.payload.id);

            // If it exists, return the current state without changes
            if (itemExists) {
                return state;
            }

            // If it doesn't exist, add the new item to the state
            return { ...state, items: [...state.items, action.payload] };

        case 'ADD_BULK_ITEMS': {
            return {
                ...state,
                items: [...state.items, ...action.payload],
            };
        }
        case "DELETE_ITEM": {
            const itemIdToDelete = action.payload; // The ID of the item to delete

            const updatedState = {
                ...state,
                // Remove the item from the global items array
                items: state.items.filter(item => item.id !== itemIdToDelete),

                // Update checklists by removing the item and recalculating completed/total items
                checklists: state.checklists.map(checklist => {
                    const filteredChecklistItems = checklist.items.filter(
                        checklistItem => checklistItem.item_id !== itemIdToDelete
                    );

                    // Recalculate completed and total items
                    const completedItems = filteredChecklistItems.filter(item => item.completed).length;
                    const totalItems = filteredChecklistItems.length;

                    return {
                        ...checklist,
                        items: filteredChecklistItems,
                        completion: {
                            completed: completedItems,
                            total: totalItems,
                            totalWeight: checklist.completion?.totalWeight ?? 0, // Keep total weight if available
                            currentWeight: filteredChecklistItems.reduce(
                                (sum, item) => (item.completed ? sum + (item.items?.weight || 0) : sum),
                                0
                            ), // Recalculate weight
                        },
                    };
                }),

                // Update trips by removing the item from trip_checklists and recalculating their totals
                trips: state.trips.map(trip => {
                    const updatedTripChecklists = trip.trip_checklists.map(tripChecklist => {
                        const updatedChecklists = tripChecklist.checklists.map(checklist => {
                            const filteredChecklistItems = checklist.checklist_items.filter(
                                checklistItem => checklistItem.item_id !== itemIdToDelete
                            );

                            // Recalculate completed and total items at the checklist level
                            const completedItems = filteredChecklistItems.filter(item => item.completed).length;
                            const totalItems = filteredChecklistItems.length;

                            return {
                                ...checklist,
                                checklist_items: filteredChecklistItems,
                                completedItems,
                                totalItems,
                            };
                        });

                        // Recalculate total items and completed items at the trip level
                        const tripTotalItems = updatedChecklists.reduce(
                            (sum, checklist) => sum + checklist.totalItems,
                            0
                        );
                        const tripCompletedItems = updatedChecklists.reduce(
                            (sum, checklist) => sum + checklist.completedItems,
                            0
                        );

                        return {
                            ...tripChecklist,
                            checklists: updatedChecklists,
                            totalItems: tripTotalItems,
                            completedItems: tripCompletedItems,
                        };
                    });

                    return {
                        ...trip,
                        trip_checklists: updatedTripChecklists,
                    };
                }),
            };

            return updatedState;
        }

        case "DELETE_BULK_ITEMS":
            const updatedState = {
                ...state,
                items: state.items.filter(item => !action.payload.includes(item.id)),
                checklists: state.checklists.map(checklist => ({
                    ...checklist,
                    items: checklist.items.filter(
                        checklistItem => !action.payload.includes(checklistItem.item_id)
                    ),
                })),
                trips: state.trips.map(trip => {
                    const updatedTripChecklists = trip.trip_checklists.map(tripChecklist => {
                        const updatedChecklists = tripChecklist.checklists.map(checklist => {
                            // Filter out deleted checklist items
                            const filteredChecklistItems = checklist.checklist_items.filter(
                                checklistItem => !action.payload.includes(checklistItem.id)
                            );

                            // Recalculate completedItems and totalItems at the checklist level
                            const completedItems = filteredChecklistItems.filter(item => item.completed).length;
                            const totalItems = filteredChecklistItems.length;

                            return {
                                ...checklist,
                                checklist_items: filteredChecklistItems,
                                completedItems,
                                totalItems,
                            };
                        });

                        // Recalculate totalItems at the trip checklist level
                        const tripTotalItems = updatedChecklists.reduce(
                            (sum, checklist) => sum + checklist.totalItems,
                            0
                        );

                        // Recalculate completedItems at the trip checklist level
                        const tripCompletedItems = updatedChecklists.reduce(
                            (sum, checklist) => sum + checklist.completedItems,
                            0
                        );

                        return {
                            ...tripChecklist,
                            checklists: updatedChecklists,
                            totalItems: tripTotalItems,
                            completedItems: tripCompletedItems,
                        };
                    });

                    return {
                        ...trip,
                        trip_checklists: updatedTripChecklists,
                    };
                }),
            };
            return updatedState;


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

        case "SET_TRIP_CATEGORIES": {
            return {
                ...state,
                trip_categories: action.payload,
            };
        }

        case "ADD_TRIP_CATEGORY": {
            return {
                ...state,
                trip_categories: [...state.trip_categories, action.payload],
            };
        }

        case "UPDATE_TRIP_CATEGORY": {
            const { tripId, tripCategoryId } = action.payload;

            return {
                ...state,
                trips: state.trips.map((trip) =>
                    trip.id === tripId
                        ? {
                            ...trip,
                            trip_category: state.trip_categories.find(
                                (category) => category.id === tripCategoryId
                            ), // Update the `trip_category` relationship
                        }
                        : trip
                ),
            };
        }

        case "REMOVE_TRIP_CATEGORY": {
            const categoryIdToRemove = action.payload;

            return {
                ...state,
                trip_categories: state.trip_categories.filter(
                    (category) => category.id !== categoryIdToRemove
                ),
                trips: state.trips.map((trip) =>
                    trip.trip_category?.id === categoryIdToRemove
                        ? { ...trip, trip_category: null } // Remove the association if it matches
                        : trip
                ),
            };
        }

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

        case "UPDATE_CHECKLIST": {
            const updatedChecklist = action.payload;

            // Update the checklists in state
            const updatedChecklists = state.checklists.map((checklist) => {
                if (checklist.id === updatedChecklist.id) {
                    // Recalculate the weights and completion stats
                    const totalWeight = updatedChecklist.items.reduce(
                        (sum, item) => sum + (item.items?.weight || 0) * item.quantity,
                        0
                    );
                    const currentWeight = updatedChecklist.items
                        .filter((item) => item.completed)
                        .reduce((sum, item) => sum + (item.items?.weight || 0) * item.quantity, 0);

                    return {
                        ...updatedChecklist,
                        completion: {
                            completed: updatedChecklist.items.filter((item) => item.completed).length,
                            total: updatedChecklist.items.length,
                            totalWeight,
                            currentWeight,
                        },
                    };
                }
                return checklist;
            });

            // Update the trips that are associated with the checklist
            const updatedTrips = state.trips.map((trip) => {
                const updatedTripChecklists = trip.trip_checklists.map((tripChecklist) => {
                    if (tripChecklist.checklist_id === updatedChecklist.id) {
                        const matchingChecklist = updatedChecklists.find(
                            (cl) => cl.id === updatedChecklist.id
                        );

                        // Update the trip-level stats based on the checklist
                        return {
                            ...tripChecklist,
                            completedItems: matchingChecklist?.completion?.completed ?? 0,
                            totalItems: matchingChecklist?.completion?.total ?? 0,
                            currentWeight: matchingChecklist?.completion?.currentWeight ?? 0,
                        };
                    }
                    return tripChecklist;
                });

                return {
                    ...trip,
                    trip_checklists: updatedTripChecklists,
                };
            });

            // Return the updated state
            return {
                ...state,
                checklists: updatedChecklists,
                trips: updatedTrips,
            };
        }

        case "REMOVE_CHECKLIST":
            return { ...state, checklists: state.checklists.filter((c) => c.id !== action.payload) };

        case "CHECK_ITEM_IN_CHECKLIST": {
            const { checklistId, checkedState, itemId } = action.payload;

            if (Array.isArray(checklistId)) {
                console.error("Checklist ID must be a string.");
                return { ...state };
            }

            // Find the target checklist
            const checklistIndex = state.checklists.findIndex((c) => c.id === checklistId);
            const checklist = state.checklists[checklistIndex];
            if (!checklist) return state;

            // Update the checklist items
            const updatedItems = checklist.items.map((item) => {
                if (item.id === itemId && item.checklist_id === checklistId) {
                    return { ...item, completed: Boolean(checkedState) };
                }
                return item;
            });

            // Ensure the item was updated
            const updatedItem = updatedItems.find((i) => i.id === itemId && i.checklist_id === checklistId);
            if (!updatedItem) return state;

            const wasCompleted = checklist.items.find(
                (i) => i.id === itemId && i.checklist_id === checklistId
            )?.completed ?? false;
            const nowCompleted = updatedItem.completed;
            const itemWeight = updatedItem.items?.weight || 0;

            // Update completed count and weight
            let completedCount = checklist.completion?.completed ?? 0;
            let currentWeight = checklist.completion?.currentWeight ?? 0;

            if (!wasCompleted && nowCompleted) {
                completedCount += 1;
                currentWeight += itemWeight;
            } else if (wasCompleted && !nowCompleted) {
                completedCount -= 1;
                currentWeight -= itemWeight;
            }

            // Update the checklist
            const updatedChecklist: ChecklistWithItems = {
                ...checklist,
                items: updatedItems,
                completion: {
                    completed: completedCount,
                    total: checklist.completion?.total ?? checklist.items.length,
                    totalWeight: checklist.completion?.totalWeight ?? 0,
                    currentWeight,
                },
            };

            const updatedChecklists = state.checklists.map((c, i) =>
                i === checklistIndex ? updatedChecklist : c
            );

            // Update trips related to this checklist
            const updatedTrips = state.trips.map((trip) => ({
                ...trip,
                trip_checklists: trip.trip_checklists.map((tc) => {
                    if (tc.checklist_id === checklistId) {
                        const matchingChecklist = updatedChecklists.find((cl) => cl.id === checklistId);
                        return {
                            ...tc,
                            completedItems: matchingChecklist?.completion?.completed ?? 0,
                            currentWeight: matchingChecklist?.completion?.currentWeight ?? 0,
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

        case "REMOVE_ITEMS_FROM_CHECKLIST": {
            const { checklistId, itemIds } = action.payload;

            // Update the checklists
            const updatedChecklists = state.checklists.map((checklist) => {
                if (checklist.id === checklistId) {
                    // Filter out the removed items
                    const updatedItems = checklist.items.filter(
                        (item) => !itemIds.includes(item.id)
                    );

                    // Recalculate completed and total counts
                    const completedItems = updatedItems.filter((item) => item.completed).length;
                    const totalItems = updatedItems.length;

                    // Recalculate weights
                    const totalWeight = updatedItems.reduce(
                        (sum, item) => sum + (item.items?.weight || 0),
                        0
                    );
                    const currentWeight = updatedItems
                        .filter((item) => item.completed)
                        .reduce((sum, item) => sum + (item.items?.weight || 0), 0);

                    return {
                        ...checklist,
                        items: updatedItems,
                        completion: {
                            completed: completedItems,
                            total: totalItems,
                            totalWeight,
                            currentWeight,
                        },
                    };
                }
                return checklist;
            });

            // Update the trips related to this checklist
            const updatedTrips = state.trips.map((trip) => {
                const updatedTripChecklists = trip.trip_checklists.map((tripChecklist) => {
                    if (tripChecklist.checklist_id === checklistId) {
                        const matchingChecklist = updatedChecklists.find(
                            (cl) => cl.id === checklistId
                        );

                        return {
                            ...tripChecklist,
                            completedItems: matchingChecklist?.completion?.completed ?? 0,
                            totalItems: matchingChecklist?.completion?.total ?? 0,
                            currentWeight: matchingChecklist?.completion?.currentWeight ?? 0,
                        };
                    }
                    return tripChecklist;
                });

                return {
                    ...trip,
                    trip_checklists: updatedTripChecklists,
                };
            });

            // Remove the items globally from the `items` array if applicable
            const updatedItems = state.items.filter(
                (item) => !itemIds.includes(item.id)
            );

            return {
                ...state,
                checklists: updatedChecklists,
                trips: updatedTrips,
                items: updatedItems,
            };
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
                dispatch({ type: "SET_TRIP_CATEGORIES", payload: parsedState.trip_categories })
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
