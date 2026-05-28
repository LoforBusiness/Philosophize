import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ALL_BRANCHES } from '@/data';

export default function DashboardScreen() {
  const firstLesson = ALL_BRANCHES[0]?.paths[0]?.lessons[0];

  return (
    <SafeAreaView className="flex-1 bg-midnight">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center py-4">
          <View>
            <Text style={{ fontFamily: 'Inter_400Regular' }} className="text-gray-300 text-sm">
              Good thinking,
            </Text>
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold' }} className="text-parchment text-2xl">
              Philosopher
            </Text>
          </View>
          <View className="flex-row items-center gap-2 bg-navy rounded-2xl px-4 py-2">
            <Text className="text-xl">🔥</Text>
            <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-gold text-lg">
              0
            </Text>
          </View>
        </View>

        {/* Continue Learning */}
        {firstLesson && (
          <View className="bg-navy rounded-2xl p-5 mb-6">
            <Text style={{ fontFamily: 'Inter_500Medium' }} className="text-gold text-xs uppercase tracking-widest mb-2">
              Continue Learning
            </Text>
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold' }} className="text-parchment text-xl mb-1">
              {firstLesson.title}
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular' }} className="text-gray-300 text-sm mb-4">
              {firstLesson.description}
            </Text>
            <Pressable
              onPress={() =>
                router.push(`/(app)/branches/logic/arguments/lesson/${firstLesson.id}`)
              }
              className="bg-gold rounded-xl py-3 items-center active:opacity-80"
            >
              <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-midnight text-base">
                Start Lesson
              </Text>
            </Pressable>
          </View>
        )}

        {/* Branches Grid */}
        <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-parchment text-lg mb-4">
          Philosophy Branches
        </Text>
        <View className="flex-row flex-wrap gap-3 mb-8">
          {ALL_BRANCHES.map((branch) => (
            <Pressable
              key={branch.id}
              onPress={() => router.push(`/(app)/branches/${branch.slug}`)}
              className="rounded-2xl p-4 active:opacity-80"
              style={{ backgroundColor: Colors.navy, width: '47%' }}
            >
              <Text className="text-3xl mb-2">{branch.icon}</Text>
              <Text
                style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
                className="text-parchment text-base mb-1"
              >
                {branch.name}
              </Text>
              <Text
                style={{ fontFamily: 'Inter_400Regular' }}
                className="text-gray-300 text-xs"
                numberOfLines={2}
              >
                {branch.description}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
