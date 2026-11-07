import { useState } from 'react';
import * as authService from '../services/authService';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function run(fn) {
    setLoading(true);
    setError(null);
    try {
      await fn();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    login: (email, password) => run(() => authService.signIn(email, password)),
    register: (email, password) => run(() => authService.signUp(email, password)),
    logout: () => run(() => authService.signOut()),
  };
}