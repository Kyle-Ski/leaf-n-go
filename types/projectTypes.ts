export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

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

export interface Checklist {
  id: string;
  created_at: string;
  title: string;
  category: string;
  favorite?: boolean;
  items?: Item[];
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  item_id: string;
  completed: boolean;
  quantity: number;
}

export interface ChecklistWithItems extends Checklist {
  items: Item[];
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

export interface Database {
  public: {
    Tables: {
      checklists: {
        Row: Checklist;
        Insert: Omit<Checklist, 'id' | 'created_at'>;
        Update: Partial<Omit<Checklist, 'id' | 'created_at'>>;
      };
      checklist_items: {
        Row: ChecklistItem;
        Insert: Omit<ChecklistItem, 'id'>;
        Update: Partial<Omit<ChecklistItem, 'id'>>;
      };
      items: {
        Row: Item;
        Insert: Omit<Item, 'id'>;
        Update: Partial<Omit<Item, 'id'>>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Omit<UserSettings, 'user_id'>;
        Update: Partial<UserSettings>;
      };
    };
  };
}
