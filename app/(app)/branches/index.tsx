import { useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { ALL_BRANCHES } from '@/data';
import type { Branch } from '@/data/types';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const { width: SW } = Dimensions.get('window');
// 2 columns, 12px gap, 20px horizontal padding on each side
const BOX_W = (SW - 52) / 2;

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';

export default function BranchesScreen() {
  const titleRef = useRef<View>(null);
  const boxRefs = useRef<(View | null)[]>([]);

  const [animating, setAnimating] = useState(false);
  const [svgPath, setSvgPath] = useState('');
  const [svgLen, setSvgLen] = useState(300);
  const dashOffset = useSharedValue(300);

  const animProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  function doNavigate(slug: string) {
    setAnimating(false);
    router.push(`/(app)/branches/${slug}`);
  }

  function handleSelect(branch: Branch, index: number) {
    titleRef.current?.measure((_fx, _fy, tw, th, tpx, tpy) => {
      boxRefs.current[index]?.measure((_bfx, _bfy, bw, bh, bpx, bpy) => {
        const startX = tpx + tw / 2;
        const startY = tpy + th;
        const endX = bpx + bw / 2;
        const endY = bpy + bh / 2;
        const cpY = (startY + endY) / 2;
        const path = `M ${startX} ${startY} C ${startX} ${cpY}, ${endX} ${cpY}, ${endX} ${endY}`;
        const dx = endX - startX;
        const dy = endY - startY;
        const len = Math.sqrt(dx * dx + dy * dy) * 1.3;

        setSvgPath(path);
        setSvgLen(len);
        dashOffset.value = len;
        setAnimating(true);

        dashOffset.value = withTiming(0, { duration: 450 }, (finished) => {
          if (finished) runOnJS(doNavigate)(branch.slug);
        });
      });
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title block — measured as the animation start point */}
        <View ref={titleRef} collapsable={false} style={styles.titleBlock}>
          <Text style={styles.title}>Philosophy</Text>
          <Text style={styles.subtitle}>Six branches. Thousands of ideas.</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Branch grid */}
        <View style={styles.grid}>
          {ALL_BRANCHES.map((branch, i) => (
            <Pressable
              key={branch.id}
              ref={(r) => {
                boxRefs.current[i] = r;
              }}
              collapsable={false}
              onPress={() => !animating && handleSelect(branch, i)}
              style={({ pressed }) => [
                styles.branchBox,
                pressed && styles.branchBoxPressed,
              ]}
            >
              <Text style={styles.branchIcon}>{branch.icon}</Text>
              <Text style={styles.branchName}>{branch.name}</Text>
              <Text style={styles.branchMeta}>
                {branch.paths.length} path{branch.paths.length !== 1 ? 's' : ''}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* SVG ink-line overlay — covers full screen, pointer events none */}
      {animating && (
        <Svg
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <AnimatedPath
            d={svgPath}
            fill="none"
            stroke={Ink}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray={svgLen}
            animatedProps={animProps}
          />
        </Svg>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Paper,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleBlock: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 44,
    color: Ink,
    lineHeight: 50,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: InkSoft,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: InkFaint,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  branchBox: {
    width: BOX_W,
    height: 120,
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 14,
    backgroundColor: Paper,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  branchBoxPressed: {
    backgroundColor: '#F0EFEA',
  },
  branchIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  branchName: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 22,
    color: Ink,
    textAlign: 'center',
    lineHeight: 26,
  },
  branchMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: InkSoft,
    marginTop: 2,
  },
});
