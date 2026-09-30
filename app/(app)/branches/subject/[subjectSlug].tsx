import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, ImageBackground, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenTransition from '@/components/shared/ScreenTransition';
import Card from '@/components/ui/Card';
import SubjectMasthead from '@/components/subjects/SubjectMasthead';
import BranchCard from '@/components/subjects/BranchCard';
import ComingSoonRoad from '@/components/subjects/ComingSoonRoad';
import { PAGE_PAD } from '@/components/subjects/tileLayout';
import { openIntro } from '@/components/professor/openIntro';
import { getSubject, COURSE_LINE } from '@/data/subjects';
import { getBranchBySlug, branchCountsFromUnits } from '@/data';
import { useUserDataStore } from '@/stores/userDataStore';
import { C } from '@/constants/design';
import DoodleGround from '@/components/shared/DoodleGround';
import { WALL } from '@/components/shared/tone';
import { SCRIM_TOP, SCRIM_MID, SCRIM_DEEP, ArtCream, ArtSoft, ArtFaint } from '@/constants/branchArt';

// ─────────────────────────────────────────────────────────────────────────────
// A SUBJECT'S PAGE (2026-09-29) — its drawing, its name, and then its courses.
//
// Philosophy's courses are its six branches, each opening the walked road it always
// had. The six subjects still to come open onto a road of their own that ends at a
// COMING SOON signpost, so every subject is a place in the same app rather than a
// dead tile.
//
// THE PROFESSOR'S INTRO LIVES HERE NOW. It used to stand in for the Learn tab's six
// branches until it had been watched; the Learn tab is a grid of subjects, so the
// gate moved with the branches it guards. Same card, same door (`openIntro('learn')`),
// same rule: nothing plays it but the reader (§14).
//
// A static `subject` segment, so it outranks `[branchSlug]` beside it — `subject` is
// not a branch, and a branch is never called that.
// ─────────────────────────────────────────────────────────────────────────────


/** The library, for the intro card: a lecture belongs in one. Already in the bundle. */
const INTRO_ART = require('../../../../assets/images/quickstart/03-library.jpg');

export default function SubjectScreen() {
  const { subjectSlug, from } = useLocalSearchParams<{ subjectSlug: string; from?: string }>();
  const subject = getSubject(subjectSlug ?? '');
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  const introSeen = useUserDataStore((s) => s.seenProfessorIntro);
  const done = useMemo(() => branchCountsFromUnits(lessonsByUnit), [lessonsByUnit]);
  const { width } = useWindowDimensions();

  // BACK GOES WHERE THE READER CAME FROM. Opened from Home's carousel, the page sits
  // on the Learn grid (it was pushed anchored, so the Learn tab is never stranded),
  // but the reader came from Home and expects Home: so the page is popped off the
  // Learn stack FIRST — leaving the grid for the next visit to Learn — and then Home
  // is brought forward.
  const back = () => {
    if (from === 'home') {
      router.dismiss();
      router.navigate('/(app)');
      return;
    }
    router.back();
  };

  if (!subject) {
    return (
      <ScreenTransition bg={WALL}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.pad}>
            <Text style={styles.missing} onPress={() => router.back()}>This subject was not found. Go back</Text>
          </View>
        </SafeAreaView>
      </ScreenTransition>
    );
  }

  return (
    <ScreenTransition bg={WALL}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <DoodleGround />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.pad}>
            <SubjectMasthead subject={subject} width={width - 2 * PAGE_PAD} onBack={back} />
          </View>

          {subject.status === 'soon' ? (
            <View nativeID="coming-soon">
              <View style={styles.roadWrap}>
                <ComingSoonRoad subject={subject} />
              </View>
              <View style={styles.pad}>
                <Text style={styles.soonLine}>
                  Courses for {subject.name} are on the way. Philosophy is open now.
                </Text>
              </View>
            </View>
          ) : !introSeen && subject.slug === 'philosophy' ? (
            <View style={styles.pad}>
              <Text style={styles.section}>START HERE</Text>
              <Card
                tone="ink"
                pad={0}
                onPress={() => openIntro('learn')}
                style={styles.introCard}
                accessibilityLabel="Start the introduction"
              >
                <View nativeID="learn-intro">
                  <ImageBackground source={INTRO_ART} style={styles.introBg} imageStyle={styles.introImg} resizeMode="cover">
                    <LinearGradient colors={[SCRIM_TOP, SCRIM_MID, SCRIM_DEEP]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
                    <View style={styles.introBody}>
                      <Text style={styles.introKicker}>BEFORE THE FIRST COURSE</Text>
                      <Text style={styles.introName}>Your first lecture</Text>
                      <Text style={styles.introDesc} numberOfLines={3}>
                        A one-minute introduction from the professor. The courses open after it.
                      </Text>
                      <View style={styles.introCta}>
                        <Text style={styles.introCtaText}>▶   START THE INTRO</Text>
                      </View>
                    </View>
                  </ImageBackground>
                </View>
              </Card>
            </View>
          ) : (
            <View style={styles.pad} nativeID="subject-courses">
              <Text style={styles.section}>{subject.courses.length} {subject.courses.length === 1 ? 'COURSE' : 'COURSES'}</Text>
              <View style={styles.list}>
                {subject.courses.map((slug) => {
                  const branch = getBranchBySlug(slug);
                  if (!branch) return null;
                  return (
                    <BranchCard
                      key={slug}
                      slug={slug}
                      name={branch.name}
                      desc={COURSE_LINE[slug]}
                      units={branch.paths.length}
                      done={done[slug] ?? 0}
                      onPress={() => router.push(`/(app)/branches/${slug}` as never)}
                    />
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WALL },
  scroll: { paddingBottom: 40 },
  pad: { paddingHorizontal: PAGE_PAD },
  section: {
    fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 2, color: C.inkSoft,
    marginTop: 26, marginBottom: 12,
  },
  list: { gap: 14 },
  roadWrap: { marginTop: 22 },
  soonLine: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 15, lineHeight: 22,
    color: C.inkSoft, textAlign: 'center', marginTop: 18,
  },
  missing: { fontFamily: 'Inter_500Medium', fontSize: 14, color: C.inkSoft, marginTop: 40 },
  introCard: { overflow: 'hidden' },
  introBg: { width: '100%', height: 232, justifyContent: 'flex-end' },
  introImg: { borderRadius: 14 },
  introBody: { paddingHorizontal: 16, paddingBottom: 14 },
  introKicker: { fontFamily: 'Inter_500Medium', fontSize: 9, color: ArtFaint, letterSpacing: 2 },
  introName: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: ArtCream, marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 7,
  },
  introDesc: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 12.5, color: ArtSoft,
    marginTop: 3, lineHeight: 17, textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 6,
  },
  introCta: {
    alignSelf: 'flex-start', marginTop: 12, backgroundColor: ArtCream, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  introCtaText: { fontFamily: 'Inter_700Bold', fontSize: 12.5, color: C.ink, letterSpacing: 1.4 },
});
