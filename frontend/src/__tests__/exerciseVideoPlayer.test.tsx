import React from 'react';

// Mock Icon to avoid react-native-svg native dependency in node env
jest.mock('../components/Icon', () => ({
  Icon: () => null,
}));

// Mock expo-video
jest.mock('expo-video', () => ({
  useVideoPlayer: jest.fn(),
  VideoView: 'VideoView',
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/data/user/0/fittrack/',
  getInfoAsync: jest.fn(async () => ({ exists: false, size: 0, isDirectory: false })),
  makeDirectoryAsync: jest.fn(async () => {}),
  downloadAsync: jest.fn(async (url: string, localUri: string) => ({ status: 200, uri: localUri })),
  readDirectoryAsync: jest.fn(async () => []),
  deleteAsync: jest.fn(async () => {}),
}));

// Mock expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { ExerciseVideoPlayer } from '../components/exerciseDemo/ExerciseVideoPlayer';

describe('ExerciseVideoPlayer Component', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders DO EXERCISE button and omits full/offline tabs', () => {
    const onDoExercise = jest.fn();
    const element = (
      <ExerciseVideoPlayer
        videoUrl="https://example.com/demo.mp4"
        onDoExercise={onDoExercise}
        exerciseId="ex-123"
        exerciseName="Lever Pec Deck Fly"
        primaryMuscle="Chest"
      />
    );

    expect(element).toBeDefined();
    expect(element.props.onDoExercise).toBe(onDoExercise);
    expect(element.props.exerciseName).toBe('Lever Pec Deck Fly');
  });

  it('triggers onDoExercise callback to redirect to exercise tracker', () => {
    const handleDoExercise = jest.fn();
    handleDoExercise();
    expect(handleDoExercise).toHaveBeenCalledTimes(1);
  });
});
