import { Stack } from 'expo-router';
import { colors } from '@/theme/colors';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="profile" />
      <Stack.Screen name="task-selection" />
      <Stack.Screen name="create-task" />
      <Stack.Screen name="task-detail" />
      <Stack.Screen name="account" />
      <Stack.Screen name="home" />
    </Stack>
  );
}

