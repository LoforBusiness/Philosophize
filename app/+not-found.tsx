import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#F5F0E8' }}>
          This screen doesn't exist.
        </Text>
        <Link href="/" style={{ marginTop: 15 }}>
          <Text style={{ fontSize: 14, color: '#1A1A1A', textDecorationLine: 'underline' }}>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}
