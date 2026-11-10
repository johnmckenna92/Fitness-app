import React from 'react';
import { Redirect } from 'expo-router';

export default function TrainerIndex() {
  return <Redirect href="/(trainer-tabs)/roster" />;
}
