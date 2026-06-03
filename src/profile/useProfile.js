import { useCallback, useState } from 'react';
import { resolveInitialProfile, persistProfile } from './profiles';

// Single source of truth for the visitor's chosen profile.
// `profile` is null until they pick (so the chooser gate shows).
export function useProfile() {
  const [profile, setProfileState] = useState(() => resolveInitialProfile());

  const setProfile = useCallback((key) => {
    persistProfile(key);
    setProfileState(key);
    try {
      const u = new URL(window.location.href);
      u.searchParams.set('as', key);
      window.history.replaceState({}, '', u);
    } catch (_) {}
  }, []);

  const clearProfile = useCallback(() => setProfileState(null), []);

  return { profile, setProfile, clearProfile };
}
