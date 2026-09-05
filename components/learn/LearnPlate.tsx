import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Frame, Guilloche, Rosette } from '@/components/paywall/Certificate';
import { PANEL_BASE, PANEL_LIP, PANEL_RULE, glow, mix } from '@/components/shared/tone';
import { useUserDataStore } from '@/stores/userDataStore';
import { BRANCH, type BranchKey, C, SPACE } from '@/constants/design';

// -----------------------------------------------------------------------------
// THE FRONTISPIECE.
//
//   "at the very top where it has your learning path and then learn in large
//    caps. This whole box is pretty boring and doesn't look very visually
//    pleasing ... I want you to redesign this to be more visually pleasing to
//    look premium ... not be as stale as it currently is."
//
// It was a flat black rectangle with three centred lines of type -- the one
// object on a screen full of photographs that had no light on it, no edge, no
// texture and no depth, in an app where the rank pins, the badges, the quote
// plates, the streak grid and the Pass certificate are ALL struck.
//
// == WHAT IT IS NOW, AND WHY THAT AND NOT SOMETHING ELSE =====================
//
// The six cards below this are the branches of philosophy. That makes this
// screen a table of contents, so the thing at the top of it is a TITLE PAGE --
// and the app already has a complete vocabulary for an engraved document,
// solved on the Scholar's Pass: a cut-corner double rule, a guilloche ground,
// corner rosettes, and inscriptional capitals. Those three parts are imported
// from Certificate.tsx rather than redrawn here, so there is one engraving
// vocabulary in the app instead of two that drift.
//
// == THE MATERIAL IS WHAT KEEPS IT FROM BEING THE PASS =======================
//
// A masthead that looked like the certificate would cost the certificate its
// specialness -- the same argument that keeps `rankup` the only fanfare in the
// app. So the GEOMETRY is shared and the MATERIAL is not: the Pass is paper and
// gold, this is ink and the six branch hues. That is exactly the split the rank
// pins already use, where one build is struck in eight metals.
//
// == THE SPINE, WHICH IS THE PART THAT IS NOT DECORATION =====================
//
// The old box said YOUR LEARNING PATH and then said nothing whatsoever about
// your path -- a kicker promising something personal above a generic subtitle,
// which is most of why it read as stale. Rule A1 is that what the text says, the
// picture must do. So the kicker is gone and the six branch hues run along the
// foot as a shelf, lit for a branch you have opened and left as a groove for one
// you have not. The words underneath count them.
//
// BINARY, NOT A PERCENTAGE, and that is a rule rather than a simplification.
// Section 19: no target may come from a total, because the curriculum has gone
// 60 -> 192 -> 222 lessons and a proportion-of-branch would slide backwards
// under a reader who had done nothing wrong every time content shipped. "Opened
// or not" is a fact about them that no future lesson can take away.
//
// == AND IT DOES NOT MOVE ====================================================
//
// Deliberately. Every ceremony in this app animates because it happens once; a
// masthead is met several times a day, and a header that replays an entrance on
// every visit to a tab is the opposite of premium. Stale is not the same as
// still -- a struck object is perfectly still and reads as expensive because of
// the light on it, not because it moves.
// -----------------------------------------------------------------------------

/** Small numbers, spelled. Tracked capitals read badly with digits in them. */
const WORDS = ['NO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT'];
const spell = (n: number) => WORDS[n] ?? String(n);

/** The rules and the weave, lifted off ink rather than laid onto paper. */
const RULE_OUTER = mix(PANEL_BASE, C.paper, 0.36);
const RULE_INNER = mix(PANEL_BASE, C.paper, 0.19);
const WEAVE = mix(PANEL_BASE, C.paper, 0.20);
const TITLE = C.paper;
const SUB = mix(C.paper, PANEL_BASE, 0.40);
const FOOT = mix(C.paper, PANEL_BASE, 0.45);

/**
 * THE ORDER COMES FROM THE CALLER, and that is not a style preference.
 *
 * The shelf is supposed to BE the six cards below it, so its order has to be
 * their order. `ALL_BRANCHES` is not that: it runs logic, ethics, epistemology,
 * metaphysics, aesthetics, political -- while the screen displays metaphysics
 * first. Reading the data's order here drew a shelf whose third segment lit for
 * a branch sitting sixth on the page, which no amount of looking at it would
 * have flagged as wrong, because three lit marks look correct either way.
 */
export default function LearnPlate({ width, slugs }: { width: number; slugs: readonly string[] }) {
  // The ONE store read on this screen, and it is a shallow one: six integers.
  // Section 19's Profile lesson is about a 890-node page re-rendering for a flag
  // that belonged to a child; this is a six-card list that genuinely displays
  // this number, which is the case that rule exists to permit.
  const lessonsByBranch = useUserDataStore((s) => s.lessonsByBranch);

  const shelf = useMemo(
    () =>
      slugs.map((slug) => ({
        slug,
        hue: BRANCH[slug as BranchKey],
        begun: (lessonsByBranch?.[slug] ?? 0) > 0,
      })),
    [lessonsByBranch, slugs],
  );
  const begun = shelf.filter((s) => s.begun).length;
  const total = shelf.length;

  // MEASURED AT 320dp, WHICH IS WHERE THE FIRST DRAFT BROKE. The zero state read
  // "SIX BRANCHES - BEGIN WHERE YOU LIKE", and at 9px with 1.8 of tracking that
  // is about 252pt into the 248 the plate has inside its padding on the narrowest
  // phone -- so it wrapped, hung its second line left, and crowded the frame. The
  // longest line here now is "THREE OF SIX BRANCHES BEGUN", which fits.
  const foot =
    begun === 0
      ? `${spell(total)} BRANCHES TO BEGIN`
      : begun === total
        ? `ALL ${spell(total)} BRANCHES BEGUN`
        : `${spell(begun)} OF ${spell(total)} BRANCHES BEGUN`;

  // The frame is drawn at the plate's real pixel size, so it needs the height.
  // Unlike the certificate -- which has to MEASURE its own, because its head
  // grows with a wrapping title -- everything in here is fixed, so the height is
  // arithmetic and no layout pass is needed. See PLATE_H.
  return (
    <View style={[st.wrap, { width, height: PLATE_H }]}>
      <LinearGradient
        // The house dark panel, same two stops and the same 0.42 as Instrument:
        // a lit top edge falling into the ground, along the one light.
        colors={[PANEL_LIP, PANEL_BASE]}
        locations={[0, 0.42]}
        style={st.face}
      >
        {/* A WEAVE, NOT WAVES. The first pass ran four cycles at full amplitude
            across a band nearly as tall as the plate, which put 23pt of swing
            into each line -- at that wavelength it reads as bunting rather than
            as an engraved ground. A guilloche is fine, dense and shallow: the
            certificate's own is only shallow because its head is short. */}
        <Guilloche
          w={width}
          h={PLATE_H}
          stroke={WEAVE}
          band={0.94}
          cycles={11}
          amp={0.30}
          opacity={0.8}
        />

        {/* The lit rim along the top edge. One pixel, and it is what stops a
            large dark face reading as a flat rectangle -- Certificate's note. */}
        <View pointerEvents="none" style={[st.rim, { backgroundColor: mix(PANEL_LIP, C.paper, 0.22) }]} />

        <View style={st.corners} pointerEvents="none">
          <Rosette size={13} color={RULE_INNER} />
          <Rosette size={13} color={RULE_INNER} />
        </View>

        <View style={st.body}>
          <Text style={st.title}>LEARN</Text>

          <View style={st.ruleRow}>
            <View style={[st.ruleLine, { backgroundColor: RULE_OUTER }]} />
            <View style={[st.ruleDot, { backgroundColor: RULE_OUTER }]} />
            <View style={[st.ruleLine, { backgroundColor: RULE_OUTER }]} />
          </View>

          <Text style={st.sub} numberOfLines={2}>
            The branches of philosophy · start anywhere
          </Text>

          {/* -- the shelf ------------------------------------------------- */}
          <View style={st.shelf}>
            {shelf.map((b) => (
              <View
                key={b.slug}
                style={[
                  st.seg,
                  // A GROOVE for a branch not yet opened, not a dimmer copy of a
                  // lit one: section 19 records that "the same thing, dimmer" is
                  // indistinguishable from a rendering fault, which is why a
                  // locked rank pin goes flat and cool rather than faint.
                  { backgroundColor: b.begun ? glow(b.hue).mark : PANEL_RULE },
                ]}
              />
            ))}
          </View>
          <Text style={st.foot}>{foot}</Text>
        </View>
      </LinearGradient>

      <Frame w={width} h={PLATE_H} outer={RULE_OUTER} inner={RULE_INNER} />
    </View>
  );
}

/**
 * The plate's height, stated rather than measured.
 *
 * Every row in it is a fixed size, so this is the sum of them and it can be
 * handed to the frame on the first frame. The certificate measures itself
 * because its head grows with a title that wraps on a narrow phone; nothing
 * here wraps except the subtitle, which is given its two lines up front.
 */
const PLATE_H =
  20 +   // padding top
  44 +   // LEARN, at 34px on a 1.28 line
  14 +   // the rule row and its margin
  38 +   // the subtitle, two lines' worth
  16 +   // gap before the shelf
  4 +    // the shelf
  8 +    // gap
  12 +   // the foot line
  20;    // padding bottom

const st = StyleSheet.create({
  wrap: { borderRadius: 4, overflow: 'hidden' },
  face: { flex: 1 },
  rim: { position: 'absolute', left: 0, right: 0, top: 0, height: 1 },

  corners: {
    position: 'absolute', left: 12, right: 12, top: 10,
    flexDirection: 'row', justifyContent: 'space-between',
  },

  body: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: SPACE[4],
  },

  title: {
    // Cinzel -- Roman inscriptional capitals, the face a title is actually CUT
    // in, and the one the Pass certificate already uses. Playfair at 44px was a
    // magazine headline: handsome, and saying "article" where this wants to say
    // "title page".
    fontFamily: 'Cinzel_700Bold',
    fontSize: 34,
    lineHeight: 44,
    letterSpacing: 4.6,
    color: TITLE,
    includeFontPadding: false,
    // Tracking adds the space AFTER the last letter too, so a centred tracked
    // word sits half a space left of true centre. Nudged back by half.
    marginLeft: 4.6,
  },

  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  ruleLine: { width: 36, height: 1 },
  ruleDot: { width: 4, height: 4, borderRadius: 2, transform: [{ rotate: '45deg' }] },

  sub: {
    fontFamily: 'EBGaramond_400Regular_Italic',
    fontSize: 14,
    lineHeight: 19,
    color: SUB,
    textAlign: 'center',
    marginTop: 9,
  },

  // FOUR POINTS, NOT SIX. Section 19's finding about Insights is that what made
  // it read cheap was never the palette, it was the AREA -- six saturated fills
  // on one screen is a rainbow. The same six hues work on the dark panel as "a
  // 14px arc and an 8px swatch", which is to say as MARKS. At six points tall
  // these were six coloured bars and the eye read them as a progress meter.
  shelf: { flexDirection: 'row', gap: 6, alignSelf: 'stretch', marginTop: 16 },
  seg: { flex: 1, height: 4, borderRadius: 2 },

  foot: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    letterSpacing: 1.8,
    color: FOOT,
    marginTop: 8,
    // Centred so that if a future count or a longer locale does wrap, the second
    // line sits under the first rather than hanging off to the left.
    textAlign: 'center',
  },
});
