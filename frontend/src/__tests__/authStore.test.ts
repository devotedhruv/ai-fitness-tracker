import { useAuthStore } from '../stores/authStore';

describe('Auth Store (Zustand)', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('initial state should be unauthenticated and not onboarded', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.tokens).toBeNull();
    expect(state.isOnboarded).toBe(false);
  });

  it('setSession updates authenticated state and checks onboarding', () => {
    const mockUser = {
      id: 'usr-123',
      email: 'test@fittrack.app',
      profile: {
        displayName: 'Test User',
        units: 'METRIC' as const,
        experienceLevel: 'INTERMEDIATE' as const,
        fitnessGoal: 'Muscle Gain',
        daysPerWeek: 4,
        equipment: ['Dumbbells'],
      },
    };

    const mockTokens = {
      accessToken: 'access-abc',
      refreshToken: 'refresh-xyz',
      expiresIn: 900,
    };

    useAuthStore.getState().setSession(mockUser, mockTokens);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isOnboarded).toBe(true);
    expect(state.user?.email).toBe('test@fittrack.app');
    expect(state.tokens?.accessToken).toBe('access-abc');
  });

  it('updateProfile merges changes into current user profile', () => {
    useAuthStore.getState().setSession(
      {
        id: 'usr-123',
        email: 'test@fittrack.app',
        profile: {
          displayName: 'Initial Name',
          units: 'METRIC',
          experienceLevel: 'BEGINNER',
          daysPerWeek: 3,
          equipment: [],
        },
      },
      { accessToken: 'a', refreshToken: 'r', expiresIn: 900 }
    );

    useAuthStore.getState().updateProfile({ displayName: 'Updated Name', units: 'IMPERIAL' });

    const state = useAuthStore.getState();
    expect(state.user?.profile?.displayName).toBe('Updated Name');
    expect(state.user?.profile?.units).toBe('IMPERIAL');
    expect(state.user?.profile?.daysPerWeek).toBe(3);
  });

  it('logout resets all auth state back to null', () => {
    useAuthStore.getState().setSession(
      { id: 'usr-1', email: 'test@test.com' },
      { accessToken: 'a', refreshToken: 'r', expiresIn: 900 }
    );

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.tokens).toBeNull();
  });
});
