import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { signOut } from '@/lib/supabase/auth';
import { ALL_BRANCHES } from '@/data';

export default function ProfileScreen() {
  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try { await signOut(); } catch {}
        },
      },
    ]);
  }

  const totalLessons = ALL_BRANCHES.reduce(
    (acc, b) => acc + b.paths.reduce((pa, p) => pa + p.lessons.length, 0),
    0
  );

  return (
    <SafeAreaView className="flex-1 bg-midnight">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Avatar + name */}
        <View className="items-center pt-6 pb-8">
          <View className="w-20 h-20 rounded-full bg-navy items-center justify-center mb-4">
            <Text className="text-4xl">🦉</Text>
          </View>
          <Text
            style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
            className="text-parchment text-2xl mb-1"
          >
            Philosopher
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular' }} className="text-gray-500 text-sm">
            Level 1 · 0 XP
          </Text>
        </View>

        {/* Stats row */}
        <View className="flex-row gap-3 mb-6">
          {[
            { label: 'Streak', value: '0 🔥', color: Colors.gold },
            { label: 'Lessons', value: '0 / ' + totalLessons, color: Colors.sage },
            { label: 'Level', value: '1', color: Colors.gold },
          ].map((stat) => (
            <View key={stat.label} className="flex-1 bg-navy rounded-2xl p-4 items-center">
              <Text
                style={{ fontFamily: 'Inter_700Bold', color: stat.color }}
                className="text-xl mb-1"
              >
                {stat.value}
              </Text>
              <Text style={{ fontFamily: 'Inter_400Regular' }} className="text-gray-500 text-xs">
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Branches progress */}
        <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-parchment text-lg mb-4">
          Progress
        </Text>
        {ALL_BRANCHES.map((branch) => (
          <View key={branch.id} className="bg-navy rounded-2xl p-4 mb-3">
            <View className="flex-row items-center gap-3">
              <Text className="text-2xl">{branch.icon}</Text>
              <View className="flex-1">
                <Text style={{ fontFamily: 'Inter_500Medium' }} className="text-parchment text-base">
                  {branch.name}
                </Text>
                <Text style={{ fontFamily: 'Inter_400Regular' }} className="text-gray-500 text-xs">
                  {branch.paths.length > 0 ? `${branch.paths.length} paths available` : 'Coming soon'}
                </Text>
              </View>
              {branch.paths.length === 0 && (
                <Ionicons name="lock-closed" size={18} color={Colors.gray500} />
              )}
            </View>
          </View>
        ))}

        {/* Sign out */}
        <Pressable
          onPress={handleSignOut}
          className="border border-crimson rounded-2xl py-4 items-center mt-6 mb-8 active:opacity-80"
        >
          <Text style={{ fontFamily: 'Inter_500Medium' }} className="text-crimson text-base">
            Sign Out
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
