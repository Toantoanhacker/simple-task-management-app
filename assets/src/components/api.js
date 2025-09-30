// src/components/api.js

import { supabase } from '../DBClient.js';

/**
 * Fetches all image records from the database, ordered by creation time.
 * @returns {Promise<Array>} A promise that resolves to an array of image objects.
 */
export async function fetchImages() {
  const { data, error } = await supabase.from('images').select('*').order('created_at');
  if (error) {
    console.error('Error fetching images:', error);
    return []; // Return an empty array on error to prevent crashes
  }
  return data;
}

/**
 * Fetches all people records from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of people objects.
 */
export async function fetchPeople() {
    const { data, error } = await supabase.from('people').select('*');
    if (error) {
        console.error('Error fetching people:', error);
        return [];
    }
    return data;
}

/**
 * Fetches all assignment records from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of assignment objects.
 */
export async function fetchAssignments() {
    const { data, error } = await supabase.from('assignments').select('image_id, person_id');
    if (error) {
        console.error('Error fetching assignments:', error);
        return [];
    }
    return data;
}