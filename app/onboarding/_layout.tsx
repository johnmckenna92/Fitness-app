import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#020617" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="pt-plan" />
    </Stack>
  );
}

