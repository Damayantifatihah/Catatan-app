import { useState, useEffect } from 'react';
import * as todoService from '../services/todoService';
import { useTodoStore } from '../store/useTodoStore';

export function useTodos() {
  const todos = useTodoStore((s) => s.todos);
  const setTodos = useTodoStore((s) => s.setTodos);
  const addTodo = useTodoStore((s) => s.addTodo);
  const patchTodo = useTodoStore((s) => s.patchTodo);
  const removeTodo = useTodoStore((s) => s.removeTodo);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // load todo dari Supabase saat screen dibuka, dengan cleanup
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await todoService.fetchTodos();
        if (!cancelled) setTodos(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [setTodos]);

  async function safe(fn) {
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    }
  }

  return {
    todos,
    loading,
    error,
    remaining: todos.filter((t) => !t.completed).length,

    add: (title) =>
      safe(async () => {
        const created = await todoService.createTodo(title);
        addTodo(created);
      }),

    edit: (id, title) =>
      safe(async () => {
        await todoService.updateTodo(id, { title });
        patchTodo(id, { title });
      }),

    toggle: (todo) =>
      safe(async () => {
        await todoService.updateTodo(todo.id, { completed: !todo.completed });
        patchTodo(todo.id, { completed: !todo.completed });
      }),

    remove: (id) =>
      safe(async () => {
        await todoService.deleteTodo(id);
        removeTodo(id);
      }),
  };
}