import { ItemDetails } from '@/types/projectTypes';
import { Session, SupabaseClient, User } from '@supabase/supabase-js';

export class DatabaseService {
  public databaseClient: SupabaseClient;

  constructor(databaseClient: SupabaseClient) {
    this.databaseClient = databaseClient;
  }

  /**
   * 
   * @param token the access token for our user
   * @returns user object with user.id
   */
  async getUserByToken(token: string): Promise<{ user: User | null; error: string | null }> {
    const { data, error } = await this.databaseClient.auth.getUser(token);

    if (error) {
      console.error('Error fetching user by token:', error.message);
      return { user: null, error: error.message };
    }

    return { user: data?.user || null, error: null };
  }

  /* ITEM METHODS */
  /**
   * Get all items for a user and their associated category names and ids
   * @param userId current user's id
   * @returns array of items and their nested item_categories
   */
  async fetchItemsByUser(userId: string): Promise<ItemDetails[]> {
    const { data: items, error } = await this.databaseClient
      .from('items')
      .select('*, item_categories(name)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching items:', error);
      throw new Error('Failed to fetch items');
    }

    return items || [];
  }

  /**
   * Used to validate the front end request, making sure the id they send is valid
   * @param categoryId item category id
   * @returns 
   */
  async fetchCategoryById(categoryId: string) {
    const { data, error } = await this.databaseClient
      .from('item_categories')
      .select('id')
      .eq('id', categoryId)
      .single();

    if (error || !data) {
      throw new Error('Category not found');
    }

    return data;
  }

  /**
   * Create an item for a user
   * @param item 
   * @returns the new item and it's id
   */
  async createItem(item: {
    user_id: string;
    name: string;
    quantity: number;
    weight: number;
    notes: string | null;
    category_id: string | null;
  }) {
    const { data, error } = await this.databaseClient
      .from('items')
      .insert(item)
      .select('*, item_categories(name)')
      .single();

    if (error) {
      throw new Error('Failed to create item');
    }

    return data;
  }

  /**
   * 
   * @param itemId item's id
   * @returns item with item_categories
   */
  async fetchItemWithCategoryById(itemId: string) {
    const { data: item, error } = await this.databaseClient
      .from('items')
      .select('*, item_categories(name)')
      .eq('id', itemId)
      .single();

    if (error || !item) {
      throw new Error('Item not found.');
    }

    return item;
  }

  /**
   * Update's a user's item
   * @param itemId item's id
   * @param updateData new data to update
   * @returns 
   */
  async updateItem(itemId: string, updateData: Record<string, unknown>) {
    const { data, error } = await this.databaseClient
      .from('items')
      .update(updateData)
      .eq('id', itemId)
      .select('*, item_categories(name)')
      .single();

    if (error) {
      console.error('Error updating item:', error.message);
      throw new Error('Failed to update item.');
    }

    if (!data) {
      throw new Error('Item not found.');
    }

    return data;
  }

  /**
   * Delete's a user's item
   * @param itemId item's id
   * @returns 
   */
  async deleteItem(itemId: string) {
    const { data, error } = await this.databaseClient
      .from('items')
      .delete()
      .eq('id', itemId)
      .select('*')
      .single();

    if (error) {
      console.error('Error deleting item:', error.message);
      throw new Error('Failed to delete item.');
    }

    if (!data) {
      throw new Error('Item not found.');
    }

    return data;
  }

  /**
   * insert an array of items.
   * @param userId User's id
   * @param items array of items to add
   * @returns 
   */
  async bulkInsertItems(userId: string, items: any[]): Promise<any[]> {
    // Extract unique category IDs from items
    const categoryIds = Array.from(
      new Set(items.map((item) => item.category_id).filter(Boolean))
    );

    let validCategoryIds = new Set();
    if (categoryIds.length > 0) {
      const { data: validCategories, error } = await this.databaseClient
        .from("item_categories")
        .select("id")
        .in("id", categoryIds);

      if (error) {
        throw new Error("Failed to validate category IDs.");
      }

      validCategoryIds = new Set(validCategories.map((category) => category.id));
    }

    // Sanitize items
    const sanitizedItems = items.map((item) => ({
      user_id: userId,
      name: item.name,
      quantity: item.quantity,
      weight: item.weight,
      notes: item.notes || null,
      category_id: validCategoryIds.has(item.category_id) ? item.category_id : null,
    }));

    // Insert items in bulk
    const { data: insertedItems, error: insertError } = await this.databaseClient
      .from("items")
      .insert(sanitizedItems)
      .select("*, item_categories(name)");

    if (insertError) {
      throw new Error("Failed to insert items into the database.");
    }

    return insertedItems || [];
  }

  /**
   * Deletes many items at once
   * @param userId user's id
   * @param itemIds array of item ids
   */
  async bulkDeleteItems(userId: string, itemIds: string[]): Promise<void> {
    const { error } = await this.databaseClient
      .from("items")
      .delete()
      .in("id", itemIds)
      .eq("user_id", userId);

    if (error) {
      throw new Error("Failed to delete items.");
    }
  }

  /* AI METHODS */
  /**
   * Updates the recommendation our AI made for the users trip in the database for use later.
   * @param tripId user's trip id
   * @param userId user's id
   * @param updateData AI recommendation data to update our database with
   */
  async validateAndUpdateTrip(
    tripId: string,
    userId: string,
    updateData: { ai_recommendation: string }
  ): Promise<void> {
    // Check if the trip belongs to the user
    const { data: trip, error: tripError } = await this.databaseClient
      .from("trips")
      .select("id, user_id")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      throw { message: "Trip not found or you don't have access to it", status: 404 };
    }

    if (trip.user_id !== userId) {
      throw { message: "Unauthorized", status: 403 };
    }

    // Update the AI recommendation
    const { error: updateError } = await this.databaseClient
      .from("trips")
      .update(updateData)
      .eq("id", tripId);

    if (updateError) {
      throw { message: "Failed to update trip", status: 500 };
    }
  }

  /* AUTH METHODS */
  /**
   * Signs in with email and password
   * @param email user email
   * @param password user password
   * @returns session data
   */
  async signInWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<{ session: Session | null; error: Error | null }> {
    const { data, error } = await this.databaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { session: null, error };
    }

    return { session: data.session, error: null };
  }

  /**
   * Let's a user sign up
   * @param email 
   * @param password 
   * @returns error if there is one
   */
  async signUp(
    email: string,
    password: string
  ): Promise<{ error: Error | null }> {
    const { error } = await this.databaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    return { error };
  }

  /* CHECKLIST METHODS */
  /**
   * Get all checklists for user
   * @param userId 
   * @returns 
   */
  async fetchChecklistsByUser(userId: string) {
    const { data, error } = await this.databaseClient
      .from('checklists')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error("Error fetching checklists:", error);
      throw new Error(error.message || "Failed to fetch checklists.");
    }

    return data || [];
  }

  /**
   * Get all items in a checklist using our join table
   * @param checklistIds 
   * @returns 
   */
  async fetchChecklistItemsByChecklistIds(checklistIds: string[]) {
    const { data, error } = await this.databaseClient
      .from('checklist_items')
      .select('*, items(*)')
      .in('checklist_id', checklistIds);

    if (error) {
      console.error("Error fetching checklist items:", error);
      throw new Error(error.message || "Failed to fetch checklist items.");
    }

    return data || [];
  }

  /**
   * Create a new checklist
   * @param checklist 
   * @returns 
   */
  async createChecklist(checklist: { title: string; category: string; user_id: string }) {
    const { data, error } = await this.databaseClient
      .from("checklists")
      .insert([checklist])
      .select()
      .single();

    if (error) {
      console.error("Error creating checklist:", error);
      throw new Error(error.message || "Failed to create checklist.");
    }

    return data;
  }

  /**
   * Gets items and category names for those items
   * @param userId 
   * @param itemIds 
   * @returns 
   */
  async fetchInventoryItemsByIds(userId: string, itemIds: string[]) {
    const { data, error } = await this.databaseClient
      .from("items")
      .select("*, item_categories(name)")
      .in("id", itemIds)
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching inventory items:", error);
      throw new Error(error.message || "Failed to fetch inventory items.");
    }

    return data || [];
  }

  /**
   * Adds an item to a checklist using the join table
   * @param checklistItems 
   * @returns 
   */
  async insertChecklistItems(checklistItems: { checklist_id: string; item_id: string; completed: boolean }[]) {
    const { error, data } = await this.databaseClient
      .from("checklist_items")
      .insert(checklistItems)
      .select("*");

    if (error) {
      console.error("Error inserting checklist items:", error);
      throw new Error(error.message || "Failed to insert checklist items.");
    }
    return data
  }

  /**
   * Get single checklist from a user
   * @param checklistId 
   * @param userId 
   * @returns 
   */
  async getChecklistByIdAndUserId(checklistId: string, userId: string) {
    const { data, error } = await this.databaseClient
      .from("checklists")
      .select("id")
      .eq("id", checklistId)
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching checklist:", error);
      return null;
    }

    return data;
  }

  /**
   * Remove item from checklist
   * @param checklistId 
   * @returns 
   */
  async deleteChecklistItemsByChecklistId(checklistId: string) {
    const { error } = await this.databaseClient
      .from("checklist_items")
      .delete()
      .eq("checklist_id", checklistId);

    if (error) {
      console.error("Error deleting checklist items:", error);
      return false;
    }

    return true;
  }

  /**
   * Deletes checklist by id
   * @param checklistId 
   * @returns 
   */
  async deleteChecklistById(checklistId: string) {
    const { error } = await this.databaseClient
      .from("checklists")
      .delete()
      .eq("id", checklistId);

    if (error) {
      console.error("Error deleting checklist:", error);
      return false;
    }

    return true;
  }

  /**
   * Get single checklist by id for user
   * @param checklistId 
   * @param userId 
   * @returns 
   */
  async getChecklistByIdForUser(checklistId: string, userId: string) {
    const { data, error } = await this.databaseClient
      .from('checklists')
      .select('*')
      .eq('id', checklistId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.error("Permission denied error fetching checklist:", error);
        return null;
      }
      console.error("Error fetching checklist:", error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Get checklist items with all details for checklist
   * @param checklistId 
   * @returns 
   */
  async getChecklistItemsWithDetails(checklistId: string) {
    const { data, error } = await this.databaseClient
      .from('checklist_items')
      .select('*, items(*, item_categories(name))')
      .eq('checklist_id', checklistId);

    if (error) {
      if (error.code === 'PGRST116') {
        console.error("Permission denied error fetching checklist items:", error);
        return null;
      }
      console.error("Error fetching checklist items:", error);
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Adds items to checklist and returns item details
   * @param expandedItems 
   * @returns 
   */
  async insertChecklistItemsAndReturn(expandedItems: any[]) {
    const { data, error } = await this.databaseClient
      .from('checklist_items')
      .insert(expandedItems)
      .select(
        `
            id,
            checklist_id,
            item_id,
            completed,
            quantity,
            items (
                id,
                name,
                notes,
                weight,
                user_id,
                quantity,
                category_id,
                item_categories (
                    name
                )
            )
        `
      );

    if (error) {
      console.error("Error inserting checklist items:", error);
      throw new Error(error.message);
    }

    return data;
  }


}
