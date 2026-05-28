import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getBranchBySlug } from '@/data';
import { Colors } from '@/constants/Colors';

export default function PathDetailScreen() {
  const { branchSlug, pathSlug } = useLocalSearchParams<{ branchSlug: string; pathSlug: string }>();
  const branch = getBranchBySlug(branchSlug);
  const path = branch?.paths.find((p) => p.slug === pathSlug);

  if (!branch || !path) {
    return (
      <SafeAreaView className="flex-1 bg-midnight items-center justify-center">
        <Text className="text-parchment">Path not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-midnight">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="pt-4 pb-6">
          <Pressable onPress={() => router.back()} className="mb-4">
            <Ionicons name="arrow-back" size={24} color={Colors.parchment} />
          </Pressable>
          <Text
            style={{ fontFamily: 'Inter_500Medium' }}
            className="text-gold text-xs uppercase tracking-widest mb-1"
          >
            {branch.name}
          </Text>
          <Text
            style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
            className="text-parchment text-2xl mb-2"
          >
            {path.name}
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular' }} className="text-gray-300 text-base">
            {path.description}
          </Text>
        </View>

        {/* Lessons */}
        <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-parchment text-lg mb-4">
          Lessons
        </Text>
        {path.lessons.map((lesson, i) => (
          <Pressable
            key={lesson.id}
            onPress={() =>
              router.push(`/(app)/branches/${branchSlug}/${pathSlug}/lesson/${lesson.id}`)
            }
            className="bg-navy rounded-2xl p-5 mb-4 active:opacity-80"
          >
            <View className="flex-row items-start gap-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mt-0.5"
                style={{ backgroundColor: branch.color }}
              >
                <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-white">
                  {i + 1}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
                  className="text-parchment text-lg mb-1"
                >
                  {lesson.title}
                </Text>
                <Text
                  style={{ fontFamily: 'Inter_400Regular' }}
                  className="text-gray-300 text-sm mb-3"
                >
                  {lesson.description}
                </Text>
                <View className="flex-row gap-3">
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="time-outline" size={12} color={Colors.gray500} />
                    <Text style={{ fontFamily: 'Inter_400Regular' }} className="text-gray-500 text-xs">
                      {lesson.estimatedMinutes} min
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Text className="text-xs">⚡</Text>
                    <Text style={{ fontFamily: 'Inter_400Regular' }} className="text-gold text-xs">
                      {lesson.xpReward} XP
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
