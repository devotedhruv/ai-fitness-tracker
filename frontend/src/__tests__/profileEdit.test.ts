import { useAuthStore, UserProfile } from '../stores/authStore';

describe('Profile Editing & Social Handles', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: 'user-123',
        email: 'athlete@fittrack.app',
        profile: {
          displayName: 'Default Athlete',
          units: 'METRIC',
          experienceLevel: 'BEGINNER',
          daysPerWeek: 3,
          equipment: [],
        },
      },
      tokens: {
        accessToken: 'mock-access',
        refreshToken: 'mock-refresh',
        expiresIn: 900,
      },
      isAuthenticated: true,
      isOnboarded: true,
    });
  });

  it('updates display name, username, bio, and avatarUrl in authStore', () => {
    const { updateProfile } = useAuthStore.getState();

    const updates: Partial<UserProfile> = {
      displayName: 'Dhruv Pro',
      username: 'dhruv_lifts',
      avatarUrl: '🦁',
      bio: 'Lifting heavy and running fast 🏃‍♂️🏋️',
      location: 'Kathmandu, NP',
      instagramHandle: 'dhruv_lifts',
      xHandle: 'dhruv_x',
      stravaUrl: 'https://strava.com/athletes/12345',
    };

    updateProfile(updates);

    const updatedUser = useAuthStore.getState().user;
    expect(updatedUser?.profile?.displayName).toBe('Dhruv Pro');
    expect(updatedUser?.profile?.username).toBe('dhruv_lifts');
    expect(updatedUser?.profile?.avatarUrl).toBe('🦁');
    expect(updatedUser?.profile?.bio).toBe('Lifting heavy and running fast 🏃‍♂️🏋️');
    expect(updatedUser?.profile?.location).toBe('Kathmandu, NP');
    expect(updatedUser?.profile?.instagramHandle).toBe('dhruv_lifts');
    expect(updatedUser?.profile?.xHandle).toBe('dhruv_x');
    expect(updatedUser?.profile?.stravaUrl).toBe('https://strava.com/athletes/12345');
    // Original properties should be preserved
    expect(updatedUser?.profile?.units).toBe('METRIC');
  });

  it('validates username formatting regex', () => {
    const isValidUsername = (u: string) => /^[a-z0-9_.-]{3,30}$/.test(u);

    expect(isValidUsername('dhruv')).toBe(true);
    expect(isValidUsername('dhruv_lifts')).toBe(true);
    expect(isValidUsername('athlete.99')).toBe(true);
    expect(isValidUsername('alex-runner')).toBe(true);

    // Invalid cases
    expect(isValidUsername('ab')).toBe(false); // too short
    expect(isValidUsername('a'.repeat(31))).toBe(false); // too long
    expect(isValidUsername('dhruv lifts')).toBe(false); // spaces
    expect(isValidUsername('dhruv@lifts')).toBe(false); // @ character in username body
    expect(isValidUsername('Dhruv')).toBe(false); // uppercase
    expect(isValidUsername('dhruv!#$')).toBe(false); // special characters
  });

  it('safely initializes and updates profile even if user was initially null', () => {
    useAuthStore.setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isOnboarded: false,
    });

    const { updateProfile } = useAuthStore.getState();
    updateProfile({
      displayName: 'Alex Power',
      username: 'alex_power',
      avatarUrl: 'preset:runner',
      bio: 'Consistency is everything',
      experienceLevel: 'ADVANCED',
    });

    const updatedUser = useAuthStore.getState().user;
    expect(updatedUser).not.toBeNull();
    expect(updatedUser?.profile?.displayName).toBe('Alex Power');
    expect(updatedUser?.profile?.username).toBe('alex_power');
    expect(updatedUser?.profile?.avatarUrl).toBe('preset:runner');
    expect(updatedUser?.profile?.bio).toBe('Consistency is everything');
    expect(updatedUser?.profile?.experienceLevel).toBe('ADVANCED');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
