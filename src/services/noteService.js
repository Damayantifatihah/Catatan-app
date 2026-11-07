import { supabase } from './supabase';
import { getCurrentUser } from './authService';

export async function fetchNotes() {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createNote({ title, content }) {
  const user = await getCurrentUser();
  const { error } = await supabase
    .from('notes')
    .insert({ title, content, user_id: user.id });
  if (error) throw error;
}

export async function updateNote(id, { title, content }) {
  const { error } = await supabase
    .from('notes')
    .update({ title, content })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteNote(id) {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}