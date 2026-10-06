import React from 'react';
import { AppInput, AppInputProps } from './ui/AppInput';

export interface InputProps extends AppInputProps {}

export function Input(props: InputProps) {
  return <AppInput {...props} />;
}
