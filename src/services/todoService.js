import { supabase } from './supabase';

export async function fetchTodos() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createTodo(title) {
  const { data, error } = await supabase
    .from('todos')
    .insert({ title })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTodo(id, fields) {
  const { error } = await supabase.from('todos').update(fields).eq('id', id);
  if (error) throw error;
}

export async function deleteTodo(id) {
  const { error } = await supabase.from('todos').delete().eq('id', id);
  if (error) throw error;
}