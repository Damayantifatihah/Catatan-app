import { create } from 'zustand';

export type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

type TodoStore = {
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
  addTodo: (todo: Todo) => void;
  patchTodo: (id: number, fields: Partial<Todo>) => void;
  removeTodo: (id: number) => void;
};

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  setTodos: (todos) => set({ todos }),
  addTodo: (todo) => set((s) => ({ todos: [...s.todos, todo] })),
  patchTodo: (id, fields) =>
    set((s) => ({
      todos: s.todos.map((t) => (t.id === id ? { ...t, ...fields } : t)),
    })),
  removeTodo: (id) =>
    set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),
}));