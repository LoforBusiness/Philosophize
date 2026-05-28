import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_BRANCHES } from '@/data';
import { Colors } from '@/constants/Colors';

export default function BranchesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-midnight">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text
          style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          className="text-parchment text-3xl mt-4 mb-2"
        >
          Philosophy
        </Text>
        <Text
          style={{ fontFamily: 'Inter_400Regular' }}
          className="text-gray-300 text-base mb-6"
        >
          Six branches. Thousands of ideas. One curious mind.
        </Text>

        {ALL_BRANCHES.map((branch) => (
          <Pressable
            key={branch.id}
            onPress={() => router.push(`/(app)/branches/${branch.slug}`)}
            className="bg-navy rounded-2xl p-5 mb-4 active:opacity-80"
            style={{ borderLeftWidth: 4, borderLeftColor: branch.color }}
          >
            <View className="flex-row items-center gap-3 mb-2">
              <Text className="text-3xl">{branch.icon}</Text>
              <Text
                style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
                className="text-parchment text-xl"
              >
                {branch.name}
              </Text>
            </View>
            <Text
              style={{ fontFamily: 'Inter_400Regular' }}
              className="text-gray-300 text-sm mb-3"
            >
              {branch.description}
            </Text>
            <View className="flex-row items-center justify-between">
              <Text style={{ fontFamily: 'Inter_500Medium' }} className="text-gold text-xs">
                {branch.paths.length} path{branch.paths.length !== 1 ? 's' : ''}
                {branch.paths.length === 0 ? ' · Coming soon' : ''}
              </Text>
              {branch.paths.length > 0 && (
                <View className="bg-gold px-3 py-1 rounded-full">
                  <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-midnight text-xs">
                    START
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
