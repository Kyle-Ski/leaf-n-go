import React, { createContext, useReducer, useContext, useEffect } from "react";
import { AppState, Action } from "@/types/projectTypes";

const initialState: AppState = {
    trips: [],
    checklists: [],
    items: [],
    userSettings: null,
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
        case "SET_TRIPS":
            return { ...state, trips: action.payload };
        case "ADD_TRIP":
            return { ...state, trips: [...state.trips, action.payload] };
        case "UPDATE_TRIP":
            return {
                ...state,
                trips: state.trips.map((trip) =>
                    trip.id === action.payload.id
                        ? action.payload
                        : trip
                ),
            };
        case "SET_CHECKLISTS":
            return { ...state, checklists: action.payload };
        case "ADD_CHECKLIST":
            return { ...state, checklists: [...state.checklists, action.payload] };
        case "REMOVE_CHECKLIST":
            return { ...state, checklists: state.checklists.filter((c) => c.id !== action.payload) };
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
