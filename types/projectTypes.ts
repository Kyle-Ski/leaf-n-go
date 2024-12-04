export interface Item {
    id: string;
    checklist_id: string;
    item_id: string;
    completed: boolean;
    quantity: number;
    name: string;
    weight: number;
    notes?: string;
}

export interface AppState {
  trips: FrontendTrip[];
  checklists: Checklist[];
  items: (Item | ItemDetails)[]; // Allow both Item and ItemDetails
  userSettings: UserSettings | null;
}

export type Action =
| { type: 'SET_TRIPS'; payload: FrontendTrip[] }
| { type: 'ADD_TRIP'; payload: FrontendTrip }
| { type: 'UPDATE_TRIP'; payload: FrontendTrip }
| { type: 'SET_CHECKLISTS'; payload: Checklist[] }
| { type: 'ADD_CHECKLIST'; payload: Checklist }
| { type: 'SET_ITEMS'; payload: (Item | ItemDetails)[] }
| { type: 'ADD_ITEM'; payload: (Item | ItemDetails) }
| { type: 'SET_CHECKLIST_DETAILS'; payload: (ChecklistWithItems)}
| { type: 'REMOVE_CHECKLIST'; payload: (string | string[])}
// | { type: 'UPDATE_CHECKLIST_ITEMS'; payload: { checklistId: string | string[] | undefined, newItem: ChecklistItem }}
// | { type: 'REMOVE_CHECKLIST_ITEM'; payload: { checklistId: string | string[] | undefined, itemId: string | string[] | undefined }}
| { type: 'SET_USER_SETTINGS'; payload: UserSettings };

export interface CreateTripPayload {
  title: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  notes: string | null;
}

export interface FrontendTrip {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  trip_checklists: {
    checklist_id: string;
    checklists: {
      title: string;
      checklist_items: {
        id: string;
        completed: boolean;
      }[];
    }[];
    totalItems: number;
    completedItems: number;
  }[];
  trip_participants: {
    user_id: string;
    role: string;
  }[];
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
  trip_checklists: Array<{
    checklist_id: string;
    title: string;
  }>;
  trip_participants: Array<{
    user_id: string;
    role: string;
  }>;
}

export interface ChecklistWithItems extends Checklist {
  items: ChecklistItem[]; // Use a new type for items with the nested structure
}

export interface Checklist {
  id: string;
  created_at: string;
  title: string;
  category: string;
  favorite?: boolean;
  completion?: {
    completed: number,
    total: number
  }
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  item_id: string;
  completed: boolean;
  quantity: number;
  items: ItemDetails; // Refer to the nested "items" object in the response
}

export interface ItemDetails {
  id: string;
  name: string;
  notes: string;
  weight: number;
  user_id: string;
  quantity: number;
}

export interface UserSettings {
    user_id: string;
    dark_mode: boolean;
    email_notifications: boolean;
    push_notifications: boolean;
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
