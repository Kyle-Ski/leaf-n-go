import React, { createContext, useReducer, useContext, useEffect } from "react";
import { AppState, Action } from "@/types/projectTypes"; // Adjust imports as needed

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
    // Add other cases as needed
    default:
      return state;
  }
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Rehydrate state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("appState");
    if (savedState) {
      dispatch({ type: "SET_ITEMS", payload: JSON.parse(savedState).items });
    }
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem("appState", JSON.stringify(state));
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider");
  return context;
};
