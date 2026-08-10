import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import { Easing } from 'react-native-reanimated';
import { getPhilosopherById, type Philosopher } from '@/data/philosophers';
import { PHILOSOPHER_FACTS } from '@/data/philosopherFacts';
import { hasQuiz, getQuizPronoun } from '@/data/philosopherQuizzes';
import { lessonAccessibility } from '@/data';
import { lessonsFeaturing } from '@/lib/utils/philosopherLessons';
import { useUIStore } from '@/stores/uiStore';
import { useUserDataStore } from '@/stores/userDataStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import SketchIcon from './SketchIcon';
import PhilosopherQuiz from './PhilosopherQuiz';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';
// Muted type ON the ink masthead. The same greys that read as "soft" on paper
// fall under 4.5:1 reversed out, so the dark block gets its own pair.
const PaperMute = '#B9B7AE';

/**
 * Split a bio into its opening sentence and the rest.
 *
 * The bio is a single 4–5 sentence block, and set as one paragraph at one size
 * it is the flattest thing on the page. Running the first sentence larger is the
 * standfirst every magazine uses to get a reader INTO a piece of prose, and it
 * costs no new content. A real drop cap was the other option and React Native
 * has no float, so a hanging initial cannot reflow the lines beside it.
 */
function splitBio(bio: string): [string, string] {
  const m = bio.match(/^(.*?[.!?])\s+(.*)$/s);
  if (!m || m[1].length > 180) return [bio, ''];
  return [m[1], m[2]];
}

// A bottom sheet that slides up to ~4/5 of the screen, showing a philosopher's
// masthead, the lessons they appear in, their bio, facts and saveable quotes.
export default function PhilosopherSheet() {
  const id = useUIStore((s) => s.philosopherSheetId);
  const openSeq = useUIStore((s) => s.philosopherSheetSeq);
  const close = useUIStore((s) => s.closePhilosopher);

  const recordView = useUserDataStore((s) => s.recordPhilosopherView);
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const toggleQuote = useUserDataStore((s) => s.toggleQuote);
  const profileQuote = useUserDataStore((s) => s.profileQuote);
  const setProfileQuote = useUserDataStore((s) => s.setProfileQuote);
  const quizScores = useUserDataStore((s) => s.quizScores);
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  const isPro = useSubscriptionStore((s) => s.isPro);

  const router = useRouter();
  const { height } = useWindowDimensions();
  const H = Math.round(height * 0.8);

  const [visible, setVisible] = useState(false);
  const [phil, setPhil] = useState<Philosopher | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  // Which "Did you know" cards have been turned over. Reset per open, so the
  // same thinker is a fresh set of three the next time you visit them.
  const [revealed, setRevealed] = useState<number[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (id) {
      const p = getPhilosopherById(id);
      if (p) {
        setPhil(p);
        setVisible(true);
        recordView(id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Snap to the top every time the sheet is raised. `openSeq` bumps on each
  // openPhilosopher call (even for the same thinker, so tapping a saved quote
  // for the philosopher you just viewed still resets). Keying the scroll view
  // on it remounts a fresh instance, and the imperative scrollTo guards against
  // the browser focus-scrolling down to a tappable quote. Without this the sheet
  // can reuse a previous instance left scrolled to the Quotes section and open
  // at the bottom instead of the bio.
  useEffect(() => {
    if (!id) return;
    setRevealed([]);
    const raf = requestAnimationFrame(() =>
      scrollRef.current?.scrollTo({ y: 0, animated: false })
    );
    const t = setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: false }), 120);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSeq]);

  // Lessons that quote this thinker, filtered to the ones actually reachable.
  // It goes through `lessonAccessibility` for the same reason auto-advance does:
  // a link straight into a locked or unpaid lesson would be a side door around
  // the gate, and offering one that bounces is worse than not offering it.
  //
  // ABOVE the `if (!visible)` early return — every hook on this component has to
  // be, or the render that unmounts the sheet counts fewer hooks than the last
  // one and React throws.
  const lessons = useMemo(() => {
    if (!phil) return [];
    return lessonsFeaturing(phil.id)
      .filter((l) => lessonAccessibility(l.lessonId, lessonsByUnit, isPro).accessible)
      .slice(0, 4);
  }, [phil, lessonsByUnit, isPro]);

  if (!visible) return null;

  const savedIds = new Set(savedQuotes.map((q) => q.id));
  const facts = phil ? PHILOSOPHER_FACTS[phil.id] ?? [] : [];
  const quizAvailable = phil ? hasQuiz(phil.id) : false;
  const score = phil ? quizScores[phil.id] : undefined;
  const mastered = !!score && score.total > 0 && score.best >= score.total;
  const [standfirst, restOfBio] = phil ? splitBio(phil.bio) : ['', ''];

  const openLesson = (l: (typeof lessons)[number]) => {
    close();
    router.push(`/(app)/branches/${l.branchSlug}/${l.pathSlug}/lesson/${l.lessonId}` as never);
  };

  return (
    <>
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={close}>
      <MotiView
        animate={{ opacity: id ? 1 : 0 }}
        transition={{ type: 'timing', duration: 240 }}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </MotiView>

      <AnimatePresence
        onExitComplete={() => {
          setVisible(false);
          setPhil(null);
        }}
      >
        {id && phil && (
          <MotiView
            key="sheet"
            from={{ translateY: H }}
            animate={{ translateY: 0 }}
            exit={{ translateY: H }}
            transition={{ type: 'timing', duration: 500, easing: Easing.out(Easing.cubic) }}
            style={[styles.sheet, { height: H }]}
          >
            {/* The grab handle sits ON the masthead rather than above it — the
                dark block runs to the very top of the sheet, so a paper-coloured
                strip over it would read as a seam. */}
            <View style={styles.handle} pointerEvents="none" />

            <ScrollView
              key={openSeq}
              ref={scrollRef}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* ── MASTHEAD ───────────────────────────────────────────────
                  Was a centred letter-in-a-circle, a name, a grey meta line and
                  an italic sentence, all on paper: the page opened on its own
                  quietest moment. Reversed out, the name and the idea are the
                  first thing the eye lands on, and the initial becomes a
                  watermark behind them rather than the loudest element. */}
              <View style={styles.masthead}>
                <Text style={styles.watermark} pointerEvents="none">
                  {phil.name.charAt(0)}
                </Text>
                <Text style={styles.mastheadKicker}>{phil.era.toUpperCase()}</Text>
                <Text style={styles.mastheadName}>{phil.name}</Text>
                <Text style={styles.mastheadLife}>{phil.lifespan}</Text>
                <Text style={styles.mastheadIdea}>“{phil.oneLiner}”</Text>
                <View style={styles.chipRow}>
                  {phil.areas.map((a) => (
                    <View key={a} style={styles.chip}>
                      <Text style={styles.chipText}>{a}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.body}>
                {/* Straight back into the curriculum. */}
                {lessons.length > 0 && (
                  <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 320, delay: 120 }}
                  >
                    <SectionHeading label={lessons.length === 1 ? 'Appears in a lesson' : 'Appears in these lessons'} />
                    {lessons.map((l) => (
                      <Pressable
                        key={l.lessonId}
                        onPress={() => openLesson(l)}
                        style={({ pressed }) => [styles.lessonRow, pressed && { opacity: 0.6 }]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.lessonTitle} numberOfLines={1}>{l.title}</Text>
                          <Text style={styles.lessonBranch}>{l.branchName}</Text>
                        </View>
                        <View style={styles.lessonChev}>
                          <SketchIcon name="back" size={13} color={InkSoft} />
                        </View>
                      </Pressable>
                    ))}
                  </MotiView>
                )}

                {/* Quiz CTA — only for thinkers with an authored quiz */}
                {quizAvailable && (
                  <Pressable
                    onPress={() => setQuizOpen(true)}
                    style={({ pressed }) => [styles.quizCta, pressed && { opacity: 0.9 }]}
                  >
                    <View style={styles.quizIcon}>
                      <SketchIcon name={mastered ? 'star-filled' : 'grad'} size={20} color={Paper} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.quizTitle}>{mastered ? 'Quiz mastered' : 'Test yourself'}</Text>
                      <Text style={styles.quizSub}>
                        {mastered
                          ? `Best ${score!.best}/${score!.total} · play again`
                          : `A 30-second quiz on ${phil.name.split(' ')[0]}`}
                      </Text>
                    </View>
                    <View style={styles.quizChev}>
                      <SketchIcon name="back" size={14} color={Paper} />
                    </View>
                  </Pressable>
                )}

                {/* Bio, opening sentence set as a standfirst. */}
                <SectionHeading label="Biography" />
                <Text style={styles.standfirst}>{standfirst}</Text>
                {restOfBio ? <Text style={styles.bio}>{restOfBio}</Text> : null}

                {/* ── DID YOU KNOW, face down ────────────────────────────────
                    Three identical bulleted rows were the most surprising
                    content on the page delivered in its dullest possible form.
                    Face down they are a question instead of a statement, and
                    turning one over is the smallest possible piece of play. */}
                {facts.length > 0 && (
                  <>
                    <SectionHeading label="Did You Know?" />
                    {facts.map((f, i) => {
                      const open = revealed.includes(i);
                      return (
                        <Pressable
                          key={i}
                          onPress={() => setRevealed((r) => (r.includes(i) ? r : [...r, i]))}
                          disabled={open}
                          style={({ pressed }) => [
                            styles.factCard,
                            open && styles.factCardOpen,
                            pressed && !open && { opacity: 0.75 },
                          ]}
                        >
                          <Text style={[styles.factNum, open && { color: InkSoft }]}>
                            {String(i + 1).padStart(2, '0')}
                          </Text>
                          {open ? (
                            <MotiView
                              from={{ opacity: 0, translateY: 6 }}
                              animate={{ opacity: 1, translateY: 0 }}
                              transition={{ type: 'timing', duration: 260 }}
                              style={{ flex: 1 }}
                            >
                              <Text style={styles.factText}>{f}</Text>
                            </MotiView>
                          ) : (
                            <Text style={styles.factPrompt}>Tap to reveal</Text>
                          )}
                        </Pressable>
                      );
                    })}
                  </>
                )}

                {/* ── QUOTES, as pull quotes ─────────────────────────────────
                    ALL of them, not the first three. The cap existed to give the
                    page-turning quote book something to be for; with the book
                    gone it only hid content, and every thinker has four or five.
                    The actions moved to a footer rule: crammed beside the text
                    they squeezed the quote into a narrow column and made the two
                    icons compete with the words for the same line. */}
                <SectionHeading label="Quotes" />
                <Text style={styles.quotesHint}>Bookmark to save · star to feature it on your profile.</Text>
                {phil.quotes.map((q) => {
                  const saved = savedIds.has(q.id);
                  const featured = profileQuote?.id === q.id;
                  return (
                    <View key={q.id} style={styles.quoteBox}>
                      <Text style={styles.quoteMark} pointerEvents="none">“</Text>
                      <Text style={styles.quoteText}>{q.text}</Text>
                      <View style={styles.quoteFoot}>
                        <Text style={styles.quoteWho}>{phil.name}</Text>
                        <View style={styles.quoteActions}>
                          <Pressable
                            hitSlop={10}
                            onPress={() =>
                              toggleQuote({
                                id: q.id,
                                text: q.text,
                                author: phil.name,
                                philosopherId: phil.id,
                                branchSlugs: phil.branchSlugs,
                                savedAt: Date.now(),
                              })
                            }
                          >
                            <SketchIcon
                              name={saved ? 'bookmark-filled' : 'bookmark'}
                              size={21}
                              color={saved ? Ink : InkSoft}
                            />
                          </Pressable>
                          <Pressable
                            hitSlop={10}
                            onPress={() =>
                              setProfileQuote(
                                featured
                                  ? null
                                  : { id: q.id, text: q.text, author: phil.name, philosopherId: phil.id }
                              )
                            }
                          >
                            <SketchIcon
                              name={featured ? 'star-filled' : 'star'}
                              size={21}
                              color={featured ? Ink : InkSoft}
                            />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </MotiView>
        )}
      </AnimatePresence>
    </Modal>
    {phil && (
      <PhilosopherQuiz
        open={quizOpen}
        philosopherId={phil.id}
        philosopherName={phil.name}
        pronoun={getQuizPronoun(phil.id)}
        onClose={() => setQuizOpen(false)}
      />
    )}
    </>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionHeading}>{label}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 2,
    borderColor: Ink,
    overflow: 'hidden',
  },
  handle: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    zIndex: 3,
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(250,250,247,0.38)',
  },
  // No horizontal padding — the masthead runs edge to edge and the body carries
  // its own 24.
  content: { paddingBottom: 48 },

  // ── masthead ───────────────────────────────────────────────────────────────
  masthead: {
    backgroundColor: Ink,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 22,
    overflow: 'hidden',
  },
  // The initial, demoted to texture. Big enough to be a shape rather than a
  // letter you read, and low enough in contrast that it never competes with the
  // name sitting on top of it.
  watermark: {
    position: 'absolute',
    right: 6,
    top: -18,
    fontFamily: 'Caveat_700Bold',
    fontSize: 150,
    lineHeight: 170,
    color: 'rgba(250,250,247,0.07)',
    includeFontPadding: false,
  },
  mastheadKicker: { fontFamily: 'Inter_500Medium', fontSize: 9.5, color: PaperMute, letterSpacing: 2.5 },
  mastheadName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    color: Paper,
    lineHeight: 39,
    marginTop: 6,
  },
  mastheadLife: { fontFamily: 'Inter_400Regular', fontSize: 12.5, color: PaperMute, marginTop: 2 },
  mastheadIdea: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 17,
    color: '#EDEBE3',
    lineHeight: 26,
    marginTop: 14,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 16 },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(250,250,247,0.35)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  chipText: { fontFamily: 'Inter_500Medium', fontSize: 11.5, color: '#DAD8D0' },

  body: { paddingHorizontal: 24, paddingTop: 4 },

  // ── lessons ────────────────────────────────────────────────────────────────
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: InkFaint,
  },
  lessonTitle: { fontFamily: 'Inter_500Medium', fontSize: 14.5, color: Ink },
  lessonBranch: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: InkSoft, marginTop: 2 },
  lessonChev: { transform: [{ scaleX: -1 }] },

  quizCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Ink,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  quizIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, color: Paper, letterSpacing: 0.3 },
  quizSub: { fontFamily: 'Inter_400Regular', fontSize: 12.5, color: 'rgba(250,250,247,0.7)', marginTop: 2 },
  quizChev: { transform: [{ scaleX: -1 }], opacity: 0.85 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 26, marginBottom: 12 },
  sectionHeading: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Ink, marginRight: 12 },
  sectionLine: { flex: 1, height: 1, backgroundColor: InkFaint },

  standfirst: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 19,
    color: Ink,
    lineHeight: 30,
    marginBottom: 12,
  },
  bio: { fontFamily: 'Inter_400Regular', fontSize: 15.5, color: Ink, lineHeight: 25 },

  // ── facts, face down ───────────────────────────────────────────────────────
  factCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginBottom: 10,
    minHeight: 58,
  },
  // Turned over, the card stops advertising itself: the border softens and the
  // number steps back so the fact is the only thing with weight.
  factCardOpen: { borderColor: InkFaint, borderWidth: 1 },
  factNum: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 19,
    color: Ink,
    width: 26,
    includeFontPadding: false,
  },
  factPrompt: {
    flex: 1,
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 14.5,
    color: InkSoft,
  },
  factText: { fontFamily: 'Inter_400Regular', fontSize: 14.5, color: Ink, lineHeight: 22 },

  quotesHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: InkSoft,
    marginTop: -4,
    marginBottom: 14,
  },
  // ── quotes, as pull quotes ─────────────────────────────────────────────────
  quoteBox: {
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 14,
    paddingTop: 30,
    paddingHorizontal: 18,
    paddingBottom: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  // A real opening mark, set big and pale, behind the first line. Playfair's
  // quote glyph has a lot of ink, so it reads as a printer's mark rather than
  // as punctuation someone forgot to delete.
  quoteMark: {
    position: 'absolute',
    left: 12,
    top: -14,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 82,
    lineHeight: 96,
    color: InkFaint,
    includeFontPadding: false,
  },
  quoteText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 17.5,
    color: Ink,
    lineHeight: 27,
  },
  quoteFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: InkFaint,
  },
  quoteWho: { fontFamily: 'Inter_500Medium', fontSize: 12, color: InkSoft },
  quoteActions: { flexDirection: 'row', alignItems: 'center', gap: 18 },
});
