import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#818cf8" />
    </View>
  );
}
