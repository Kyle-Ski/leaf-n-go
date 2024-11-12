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
