import { CheckedState } from "@radix-ui/react-checkbox";

export interface ItemCategory {
  id: string;
  name: string;
  description?: string;
  user_id?: string;
  created_at?: string;
}

export interface ItemDetails {
  id: string;
  name: string;
  notes?: string;
  weight: number;
  user_id: string;
  quantity: number;
  item_categories?: ItemCategory;
  category_id: string | null | "";
}

export interface Item {
  id: string;
  checklist_id: string;
  item_id: string;
  completed: boolean;
  quantity: number;
  name: string;
  weight: number;
  notes?: string;
  item_categories?: ItemCategory;
  category_id: string | null | "";
}

export interface Checklist {
  id: string;
  created_at: string;
  title: string;
  category: string;
  favorite?: boolean;
  completion?: {
    completed: number;
    total: number;
    currentWeight: number;
    totalWeight: number;
  };
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  item_id: string;
  completed: boolean;
  quantity: number;
  items: ItemDetails;
  item_categories?: ItemCategory
}

export interface ChecklistWithItems extends Omit<Checklist, 'completion'> {
  items: ChecklistItem[];
  completion: {
    completed: number;
    total: number;
    currentWeight: number;
    totalWeight: number;
  };
}

export interface FrontendTrip {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  notes: string | null;
  ai_recommendation: Record<string, string[]>;
  created_at: string;
  updated_at: string;
  trip_category?: TripCategory | null;
  trip_checklists: {
    checklist_id: string;
    checklists: {
      title: string;
      checklist_items: {
        id: string;
        completed: boolean;
        item_id: string;
      }[];
    }[];
    totalItems: number;
    completedItems: number;
    totalWeight: number;
    currentWeight: number;
  }[];
  trip_participants: {
    user_id: string;
    role: string;
  }[];
}

export interface TripCategory {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  trip_category?: TripCategory | null;
  trip_checklists: Array<{
    checklist_id: string;
    title: string;
    // Optionally add currentWeight and totalWeight here if needed
  }>;
  trip_participants: Array<{
    user_id: string;
    role: string;
  }>;
}

export interface UserSettings {
  user_id: string;
  dark_mode: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  weight_unit: "kg" | "lbs"
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
}

export interface AuthResponse {
  message?: string;
  error?: string;
}

export interface ChecklistTemplate {
  id: string;
  title: string;
  description: string;
  items: Item[];
}

export interface GeneralApiError {
  message: string;
  code: number;
  details?: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          dark_mode: boolean;
          email_notifications: boolean;
          push_notifications: boolean;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          dark_mode?: boolean;
          email_notifications?: boolean;
          push_notifications?: boolean;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          dark_mode?: boolean;
          email_notifications?: boolean;
          push_notifications?: boolean;
          updated_at?: string;
          created_at?: string;
        };
      };
      checklists: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          category: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          category: string;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          category?: string;
          user_id?: string;
        };
      };
      items: {
        Row: {
          id: string;
          name: string;
          quantity: number;
          weight: number;
          notes: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          quantity?: number;
          weight?: number;
          notes?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          quantity?: number;
          weight?: number;
          notes?: string;
          user_id?: string;
        };
      };
      checklist_items: {
        Row: {
          id: string;
          checklist_id: string;
          item_id: string;
          completed: boolean;
          quantity: number;
        };
        Insert: {
          id?: string;
          checklist_id: string;
          item_id: string;
          completed?: boolean;
          quantity?: number;
        };
        Update: {
          id?: string;
          checklist_id?: string;
          item_id?: string;
          completed?: boolean;
          quantity?: number;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

export interface CreateTripPayload {
  title: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  notes: string | null;
  checklists?: string[];
  trip_category: string;
  new_trip_category?: string;
}

export interface UpdatedAiRecommendedItem {
  checklists: Record<string, ChecklistWithCompletion>;
  items: ItemDetails[];
  trips: {
    trip_checklists: {
      checklist_id: string;
      completedItems: number;
      totalItems: number;
      totalWeight: number;
    };
  };
}

export interface ChecklistWithCompletion {
  items: ChecklistItem[];
  completion: {
    completed: number;
    total: number;
  };
}

export interface TripFilters {
  id?: string;
  user_id?: string;
}

export interface ChecklistItemInsert {
  checklist_id: string;
  item_id: string;
  quantity?: number;
  completed: boolean;
  id?: string;
}

export interface ChecklistFilters {
  user_id?: string;
  id?: string;
}

export interface ChecklistItemFilters {
  checklist_id?: string;
  id?: string;
}

export interface AppState {
  trips: FrontendTrip[];
  checklists: ChecklistWithItems[];
  items: (Item | ItemDetails)[];
  isNew: boolean;
  noTrips: boolean;
  noChecklists: boolean;
  noItems: boolean;
  trip_categories: TripCategory[];
  item_categories: ItemCategory[];
  user_settings: UserSettings
}

export type Action =
  | { type: 'SET_TRIPS'; payload: FrontendTrip[] }
  | { type: 'ADD_TRIP'; payload: FrontendTrip }
  | { type: 'UPDATE_TRIP'; payload: FrontendTrip }
  | { type: 'REMOVE_TRIP'; payload: (string | string[]) }
  | { type: 'SET_TRIP_CATEGORIES'; payload: TripCategory[] }
  | { type: 'UPDATE_TRIP_CATEGORY'; payload: { tripId: string, tripCategoryId: string } }
  | { type: 'ADD_TRIP_CATEGORY'; payload: TripCategory }
  | { type: 'REMOVE_TRIP_CATEGORY'; payload: string }
  | { type: 'SET_NO_TRIPS_FOR_USER'; payload: boolean }
  | { type: 'SET_CHECKLISTS'; payload: ChecklistWithItems[] }
  | { type: 'SET_NO_CHECKLISTS_FOR_USER'; payload: boolean }
  | { type: 'ADD_CHECKLIST'; payload: ChecklistWithItems }
  | { type: 'REMOVE_CHECKLIST'; payload: (string | string[]) }
  | { type: 'CHECK_ITEM_IN_CHECKLIST'; payload: { checkedState: CheckedState, checklistId: string | string[], itemId: string | string[] } }
  | { type: 'ADD_ITEM_TO_CHECKLIST'; payload: ChecklistItem[] }
  | { type: 'REMOVE_ITEM_FROM_CHECKLIST'; payload: { checklistId: (string | string[]), itemId: string } }
  | { type: 'REMOVE_ITEMS_FROM_CHECKLIST'; payload: { checklistId: string, itemIds: string[] } }
  | { type: 'SET_ITEMS'; payload: (Item | ItemDetails)[] }
  | { type: 'ADD_ITEM'; payload: (Item | ItemDetails) }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'ADD_BULK_ITEMS'; payload: (Item | ItemDetails)[] }
  | { type: 'UPDATE_ITEM'; payload: (Item | ItemDetails) }
  | { type: 'DELETE_BULK_ITEMS'; payload: string[] }
  | { type: 'SET_NO_ITEMS_FOR_USER'; payload: boolean }
  | { type: 'SET_CHECKLIST_DETAILS'; payload: (ChecklistWithItems) }
  | { type: "SET_USER_SETTINGS"; payload: Partial<AppState["user_settings"]> }
  | { type: "UPDATE_USER_SETTING"; payload: { key: keyof AppState["user_settings"]; value: any } }
  | { type: 'SET_IS_NEW'; payload: boolean }
  | { type: 'SET_CATEGORIES'; payload: ItemCategory[] };
