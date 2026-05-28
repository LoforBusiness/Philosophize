import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getBranchBySlug } from '@/data';
import { Colors } from '@/constants/Colors';

export default function BranchDetailScreen() {
  const { branchSlug } = useLocalSearchParams<{ branchSlug: string }>();
  const branch = getBranchBySlug(branchSlug);

  if (!branch) {
    return (
      <SafeAreaView className="flex-1 bg-midnight items-center justify-center">
        <Text className="text-parchment text-lg">Branch not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-midnight">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          className="px-5 pt-4 pb-8"
          style={{ backgroundColor: branch.color + '22' }}
        >
          <Pressable onPress={() => router.back()} className="mb-4">
            <Ionicons name="arrow-back" size={24} color={Colors.parchment} />
          </Pressable>
          <Text className="text-5xl mb-3">{branch.icon}</Text>
          <Text
            style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
            className="text-parchment text-3xl mb-2"
          >
            {branch.name}
          </Text>
          <Text
            style={{ fontFamily: 'Inter_400Regular' }}
            className="text-gray-300 text-base"
          >
            {branch.description}
          </Text>
        </View>

        {/* Paths */}
        <View className="px-5 pt-6">
          <Text
            style={{ fontFamily: 'Inter_700Bold' }}
            className="text-parchment text-lg mb-4"
          >
            Learning Paths
          </Text>
          {branch.paths.length === 0 ? (
            <View className="bg-navy rounded-2xl p-6 items-center">
              <Text className="text-4xl mb-3">🔮</Text>
              <Text
                style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
                className="text-parchment text-lg mb-2"
              >
                Coming Soon
              </Text>
              <Text
                style={{ fontFamily: 'Inter_400Regular' }}
                className="text-gray-300 text-sm text-center"
              >
                This branch is being built. Check back soon.
              </Text>
            </View>
          ) : (
            branch.paths.map((path, i) => (
              <Pressable
                key={path.id}
                onPress={() =>
                  router.push(`/(app)/branches/${branch.slug}/${path.slug}`)
                }
                className="bg-navy rounded-2xl p-5 mb-4 active:opacity-80"
              >
                <View className="flex-row items-center gap-2 mb-2">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: branch.color }}
                  >
                    <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-white text-sm">
                      {i + 1}
                    </Text>
                  </View>
                  <Text
                    style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
                    className="text-parchment text-lg flex-1"
                  >
                    {path.name}
                  </Text>
                </View>
                <Text
                  style={{ fontFamily: 'Inter_400Regular' }}
                  className="text-gray-300 text-sm mb-3"
                >
                  {path.description}
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium' }} className="text-gold text-xs">
                  {path.lessons.length} lesson{path.lessons.length !== 1 ? 's' : ''}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
