import React from 'react';
import { AppBottomSheet, AppBottomSheetProps } from './ui/AppBottomSheet';

export interface BottomSheetProps extends AppBottomSheetProps {}

export function BottomSheet(props: BottomSheetProps) {
  return <AppBottomSheet {...props} />;
}
