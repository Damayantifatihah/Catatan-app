import { useState, useEffect, useCallback } from 'react';
import * as noteService from '../services/noteService';

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (isCancelled = () => false) => {
    setLoading(true);
    try {
      const data = await noteService.fetchNotes();
      if (!isCancelled()) setNotes(data);
    } catch (e) {
      if (!isCancelled()) setError(e.message);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, []);

  // cleanup: cegah setState setelah unmount (warning memory leak)
  useEffect(() => {
    let cancelled = false;
    load(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function mutate(fn) {
    setError(null);
    try {
      await fn();
      await load();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  }

  return {
    notes,
    loading,
    error,
    addNote: (note) => mutate(() => noteService.createNote(note)),
    editNote: (id, note) => mutate(() => noteService.updateNote(id, note)),
    removeNote: (id) => mutate(() => noteService.deleteNote(id)),
  };
}