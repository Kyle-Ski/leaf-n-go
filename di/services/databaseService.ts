import { ItemDetails, UserSettings } from '@/types/projectTypes';
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
   * validates checklist ownership from the current user
   * @param checklistId 
   * @param userId 
   * @returns 
   */
  async validateChecklistOwnership(checklistId: string, userId: string) {
    const { data, error } = await this.databaseClient
      .from('checklists')
      .select('id')
      .eq('id', checklistId)
      .eq('user_id', userId)
      .single();

    return { data, error }
  }

  async updateCompletedChecklistItem(completed: boolean, itemId: string, checklistId: string) {
    const { data, error } = await this.databaseClient
      .from('checklist_items')
      .update({ completed })
      .eq('id', itemId)
      .eq('checklist_id', checklistId)
      .select('*')
      .single();

    return { data, error }
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
   * Remove single item from checklist
   * @param checklistId 
   * @param itemId 
   */
  async removeChecklistItem(checklistId: string, itemId: string) {
    const { error } = await this.databaseClient
      .from("checklist_items")
      .delete()
      .eq("checklist_id", checklistId)
      .eq("id", itemId);

    if (error) {
      console.error("Error removing item from checklist:", error);
      throw new Error("Failed to remove item from checklist");
    }
  }

  /**
   * Remove all items from checklist
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

  /* CONSENT METHODS */

  /**
   * Gets the user's consent from our database if any.
   * @param userId 
   * @returns 
   */
  async getUserConsent(userId: string) {
    const { data, error } = await this.databaseClient
      .from('user_consent')
      .select('consent, privacy_policy_version')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Supabase error code for no data
        return null;
      }
      console.error('Error fetching user consent:', error);
      throw new Error('Failed to fetch consent preferences');
    }

    return {
      consent: data.consent,
      privacyPolicyVersion: data.privacy_policy_version,
    };
  }

  /**
   * Update user Consent
   * @param userId 
   * @param consent 
   * @param privacyPolicyVersion 
   * @returns 
   */
  async updateUserConsent(userId: string, consent: boolean, privacyPolicyVersion: string) {
    const { data, error } = await this.databaseClient
      .from('user_consent')
      .upsert(
        [
          {
            user_id: userId,
            consent,
            privacy_policy_version: privacyPolicyVersion,
          },
        ],
        { onConflict: 'user_id' } // Specify the conflict target
      )
      .select('consent, privacy_policy_version')
      .single();

    if (error) {
      console.error('Error upserting user consent:', error);
      throw new Error('Failed to upsert consent preferences');
    }

    return {
      data: data.consent,
      privacyPolicyVersion: data.privacy_policy_version,
    };
  }

  /* ITEM CATEGORIES METHODS */
  /**
   * Gets all item categories for user
   * @param userId 
   * @returns 
   */
  async fetchItemCategories(userId: string) {
    const { data: categories, error } = await this.databaseClient
      .from('item_categories')
      .select('id, name, description, user_id, created_at')
      .or(`user_id.eq.${userId},user_id.is.null`); // Get categories owned by user or global (null)

    if (error) {
      console.error('Error fetching item categories:', error);
      throw new Error('Failed to fetch item categories');
    }

    return categories || [];
  }


  /* TRIPS METHODS */
  /**
   * Get user Trips
   * @param userId 
   * @returns 
   */
  async fetchUserTrips(userId: string) {
    const { data: trips, error } = await this.databaseClient
      .from("trips")
      .select(`
            id,
            title,
            start_date,
            end_date,
            location,
            notes,
            ai_recommendation,
            created_at,
            updated_at,
            trip_checklists (
                checklist_id,
                checklists (
                    title,
                    checklist_items (
                        id,
                        completed
                    )
                )
            ),
            trip_participants (
                user_id,
                role
            )
        `)
      .eq("user_id", userId);

    if (error) {
      console.error('Error fetching trips:', error);
      throw new Error('Failed to fetch trips');
    }

    return trips || [];
  }

  /**
   * Creates a new trip for a user
   * @param data 
   * @returns 
   */
  async createTrip(data: { title: string; start_date: string; end_date: string; location: string; notes: string; user_id: string }) {
    const { data: newTrip, error } = await this.databaseClient
      .from("trips")
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error("Error creating trip:", error);
      throw new Error("Failed to create trip");
    }

    return newTrip;
  }

  /**
   * Adds a checklist to a trip with our join table
   * @param checklists 
   */
  async addTripChecklists(checklists: { trip_id: string; checklist_id: string }[]) {
    const { error } = await this.databaseClient.from("trip_checklists").insert(checklists);

    if (error) {
      console.error("Error adding trip checklists:", error);
      throw new Error("Failed to add trip checklists");
    }
  }

  /**
   * Add participants to a trip
   * @param participants 
   */
  async addTripParticipants(participants: { trip_id: string; user_id: string; role: string }[]) {
    const { error } = await this.databaseClient.from("trip_participants").insert(participants);

    if (error) {
      console.error("Error adding trip participants:", error);
      throw new Error("Failed to add trip participants");
    }
  }

  /**
   * Get trip details
   * @param tripId 
   * @returns 
   */
  async getTripDetails(tripId: string) {
    const { data, error } = await this.databaseClient
      .from("trips")
      .select(`
            id,
            title,
            start_date,
            end_date,
            location,
            notes,
            created_at,
            updated_at,
            trip_checklists (
                checklist_id,
                checklists (
                    title,
                    checklist_items (
                        id,
                        completed
                    )
                )
            ),
            trip_participants (
                user_id,
                role
            )
        `)
      .eq("id", tripId)
      .single();

    if (error) {
      console.error("Error fetching trip details:", error);
      throw new Error("Failed to fetch trip details");
    }

    return data;
  }

  /**
   * Delete trip by id
   * @param tripId 
   */
  async deleteTrip(tripId: string) {
    const { error } = await this.databaseClient.from("trips").delete().eq("id", tripId)

    if (error) {
      console.error("Error deleting Trip:", error);
      throw new Error("Failed to delete trip.")
    }
  }

  /**
   * Update trip details
   * @param tripId 
   * @param title 
   * @param start_date 
   * @param end_date 
   * @param location 
   * @param notes 
   */
  async updateTripDetails(tripId: string, title: string, start_date: string, end_date: string, location: string, notes: string) {
    const { error } = await this.databaseClient
      .from("trips")
      .update({ title, start_date, end_date, location, notes })
      .eq("id", tripId)
      .select()
      .single();

    if (error) {
      console.error("Error updating Trip:", error)
      throw new Error("Failed to update trip.")
    }
  }

  /**
   * Delete trip checklist
   * @param tripId 
   */
  async deleteTripChecklist(tripId: string) {
    const { error } = await this.databaseClient
      .from("trip_checklists")
      .delete()
      .eq("trip_id", tripId);

    if (error) {
      console.error("Error removing trip_checklist:", error)
      throw new Error("Failed to remove trip checklist.")
    }
  }

  /**
   * Add checklists to a trip
   * @param newTripChecklists 
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async addChecklistsToTrip(newTripChecklists: any) {
    const { error } = await this.databaseClient
      .from("trip_checklists")
      .insert(newTripChecklists);

    if (error) {
      console.error("Error adding checklists to trip_checklists:", error)
      throw new Error("Failed to update trip_checklists")
    }
  }

  /**
   * Get trip checklists and items
   * @param tripId 
   * @returns 
   */
  async getTripChecklistsAndItems(tripId: string) {
    const { error, data } = await this.databaseClient
      .from("trip_checklists")
      .select(`
          checklist_id,
          checklists (
            title,
            checklist_items (
              id,
              completed
            )
          )
        `)
      .eq("trip_id", tripId);

    if (error) {
      console.error("Error getting trip checklists:", error)
      throw new Error("Failed to get Trip Checklists")
    }

    return { data }
  }

  /* USER SETTINGS METHODS */

  /**
   * Get settings for the user
   * @param userId 
   * @returns 
   */
  async getUserSettingsForUser(userId: string) {
    const { data, error } = await this.databaseClient
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error("Error getting user settings:", error)
    }

    return { data, error }
  }

  /**
   * Update user's settings
   * @param userId 
   * @param updatedFields 
   * @returns 
   */
  async updateUserSettings(userId: string, updatedFields: Partial<UserSettings>) {
    const { error } = await this.databaseClient
      .from('user_settings')
      .update(updatedFields)
      .eq('user_id', userId);

    return { error }
  }

  /**
   * Tracks the user's AI usage
   * @param userId 
   * @returns 
   */
  async trackAiUsage(userId: string) {
    const { data, error } = await this.databaseClient
      .rpc('increment_usage_count', {
        user_id: userId,
        increment_by: 1, // Optional, defaults to 1
      });
    return { data, error }
  }

}
