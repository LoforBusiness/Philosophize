// ─────────────────────────────────────────────────────────────────────────────
// WHAT THE FIGURE IS ALLOWED TO DO, AND WHERE
//
// Shared by `check-life` and by `liven-lessons`, so the rule and the codemod
// cannot disagree — the same mistake `check-answers` was carrying when it built
// its own copy of the shuffle seed.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { DIR } from './gestures.mjs';

/** actStance code → the code a beat writes to PLAY it once as the beat opens. */
export const play = (act) => 299 + act;
/** actStance code → the code a beat writes to HOLD it. Only useful for 29–40, 59–78. */
export const hold = (act) => 99 + act;

// ── THE COMIC SHELF ──────────────────────────────────────────────────────────
// The twenty-four actions written to be funny, plus the eight already in the
// library that carry a joke. Every one is reached through the PLAYED band: held,
// a one-shot shows the pose it ENDS in, which for all of these is a person
// standing there.
// EVERY ENTRY CARRIES THE CUES THAT MAKE IT APT, AND THAT IS NOT OPTIONAL.
//
// The first version of this placed a joke by POSITION — the middle eligible beat
// of every lesson — and the very first file it touched put a pratfall on
// "They drained the cask, and a key was lying at the bottom on a leather thong."
// The action was correct, the timing was correct, and it was about nothing. A1
// is not literally broken by it (the sentence does not say he stays upright) but
// it is the same failure one level down: the picture is doing something the words
// have no idea about, and a reader reads that as the app being broken rather than
// as a joke.
//
// So a comic beat has to EARN its place: the action must be about something the
// beat actually says, or the lesson gets no joke at all. Fewer and apt beats a
// full set of random ones — a gag that does not land is not neutral, it is worse
// than the held pose it replaced.
export const COMIC = [
  { act: 97, name: 'double take', fits: /\b(suddenly|wait a|notices?|noticed|spots?|catch(es)? sight|look again|second look|realis(e|es|ed)|it dawns)/i, turn: /^(but|yet|however|except|then again|only)\b/i },
  { act: 98, name: 'jaw drop', fits: /\b(astonish|astounded|shock|shocking|amaz|stunn|staggering|unbelievab|cannot believe|can't believe|incredib|extraordinar)/i },
  { act: 99, name: 'trip over nothing', fits: /\b(trip|trips|stumbl|slip|slips|slipped|misstep|mistake|blunder|goes wrong|went wrong|fell over)/i },
  { act: 100, name: 'peek over', fits: /\b(behind|beyond|other side|hidden|conceal|peek|peer|over the (wall|fence|edge)|out of sight|underneath)/i },
  { act: 101, name: 'check the coast', fits: /\b(secret|secretly|nobody|no one|unseen|unobserved|alone|private|privately|watching|watched|careful)/i },
  { act: 102, name: 'the little shimmy', fits: /\b(it works|that works|pays off|paid off|got it right|solved it|victory|triumph|nailed it|comes off|vindicat)/i },
  { act: 103, name: 'slow clap', fits: /\b(obvious|obviously|of course|congratulat|well done|brilliant|impressive|bravo|naturally)/i },
  { act: 104, name: 'who, me?', fits: /\b(yourself|blame|blamed|blaming|accus|responsib|whose fault|at you\b|singled out|point the finger)/i },
  { act: 105, name: 'full-body shrug', fits: /\b(who knows|no idea|unclear|cannot say|can't say|do(n't| not) know|uncertain|either way|hard to say|no answer|nobody can tell)/i, turn: /\?\s*$/ },
  { act: 106, name: 'nodding off', fits: /\b(boring|dull|tedious|endless|forever|again and again|over and over|drag(s|ged)? on|monotonous|the same thing)/i },
  // `perfectly` is gone: it is an INTENSIFIER at least as often as it is praise
  // ("knowing perfectly well that you cannot"), and the two readings are opposite.
  { act: 107, name: 'chef\'s kiss', fits: /\b(beautiful|exquisite|masterpiece|sublime|elegant|lovely|delicious|a perfect|the perfect|perfection)/i },
  { act: 108, name: 'brush the shoulder', fits: /\b(easy|easily|is simple|quite simple|trivial|no trouble|effortless|smug|pleased with (him|it)self|nothing to it)/i },
  { act: 109, name: 'blown back by it', fits: /\b(force|forceful|powerful|overwhelm|hits|struck|strikes|radical|upend|overturn|devastat|blow)/i },
  { act: 110, name: 'lean on nothing', fits: /\b(assum|assumption|foundation|rests? on|depends? on|support|prop(s|ped)? up|collapse|gives way|nothing (underneath|holding)|no ground|unsupported|circular)/i },
  { act: 111, name: 'tiptoe away', fits: /\b(walks? away|backs? away|slips? out|slips? away|escape|escapes|quietly|withdraw|retreat|tiptoe|sneak|creep(s)? off)/i },
  { act: 112, name: 'both hands to the head', fits: /\b(confus|puzzl|baffl|paradox|contradict|makes no sense|no sense|how can|impossible|tangle|muddle)/i },
  { act: 113, name: 'this big?', fits: /\b(how much|how many|how big|the size|how large|how small|amount|quantity|larger|smaller|bigger|by how)/i, turn: /\b(\d+|one|two|three|four|five|ten|hundred|thousand) (of them|people|rooms|planks|copies|steps|coins|grains)\b/i },
  { act: 114, name: 'this one, that one', fits: /\b(either .{2,30} or |one or the other|which one|side by side|compare(s|d)? (it|them|the two)|the two of them|versus|back and forth)/i, turn: /\b\w+ or \w+\?/i },
  { act: 115, name: 'the flex', fits: /\b(strong|strength|power|powerful|might|mighty|capable|able|force of|muscle|robust)/i },
  { act: 116, name: 'deflate', fits: /\b(disappoint|deflat|nothing left|empty|hollow|lose|lost|defeat|give(s)? up|gave up|falls flat|anticlimax|for nothing)/i },
  { act: 117, name: 'heel click', fits: /\b(delight|joy|joyful|happy|happiness|celebrat|free|freedom|wonderful|at last|finally|flourish)/i },
  { act: 118, name: 'fan the air', fits: /\b(rotten|stinks?|stinking|disgust|foul|repuls|revolt|distaste|sour|spoiled|reek|putrid)/i },
  { act: 119, name: 'thumb over the shoulder', fits: /\b(everyone else|someone else|other people|the others|neighbour|neighbor|the crowd|they all|everybody)/i, turn: /\b[A-Z][a-z]{3,} (says|said|thinks|thought|argues|argued|holds|held|claims|claimed|wrote|calls|called|replies|replied|answers|answered|insists|objects)\b/ },
  { act: 120, name: 'teeter', fits: /\b(balanc|edge|precarious|unstable|tip(s|ping)? over|risk|fragile|borderline|knife-edge|wobbl|teeter)/i },
  // The eight that were already here and already funny. They are in the shelf
  // because the rotation rule has to count them: a lesson that trips over
  // nothing and a lesson that stumbles are doing the same joke, and "we only
  // rotate the NEW ones" is how a rotation quietly stops rotating.
  { act: 10, name: 'stumble and recover', fits: /\b(recover|corrects?|adjust|caught (himself|itself)|back on track|steadies|regain)/i },
  { act: 13, name: 'stretch', fits: /\b(wake|woke|waking|morning|yawn|at last|after (all|years|hours)|long wait|finally)/i },
  { act: 17, name: 'facepalm', fits: /\b(absurd|ridiculous|silly|should have|obvious(ly)? wrong|of course not|nonsense|hopeless)/i },
  { act: 26, name: 'shiver', fits: /\b(cold|chill|freezing|frozen|winter|shiver|ice|icy|snow)/i },
  { act: 27, name: 'wobble for balance', fits: /\b(steady|unsteady|wobbl|totter|off balance|tilt|lean(s|ing)? too far)/i },
  { act: 28, name: 'dust off hands', fits: /\b(settled|that is that|case closed|done with|over with|job done|nothing more to say|and there it ends|problem solved)/i },
  { act: 95, name: 'check the time', fits: /\b(waits?|waiting|still not|not yet|eventually|takes (years|ages|centuries|forever)|for hours|two thousand years)/i, turn: /\b(\d{3,4}|centur(y|ies)|years later|ever since|to this day|still arguing)\b/i },
  { act: 96, name: 'rub the neck', fits: /\b(awkward|embarrass|uncomfortable|admit|admits|hard to say|difficult to|reluctant|sheepish)/i },
];
// ── A CUE INSIDE A NEGATION MEANS THE OPPOSITE ───────────────────────────────
//
// Found by READING the ninety placements rather than by counting them, which is
// the only way it could have been found: every one of these matched its cue
// exactly, and `check-life` was perfectly happy.
//
//   "None of that makes forgiveness EASY"        → brush the shoulder (smug)
//   "knowing PERFECTly well that you cannot"     → chef's kiss (delight)
//
// The first is a negation the regex cannot see; the second is an intensifier
// wearing the same letters as the adjective. Both put the figure's body in
// contradiction with the sentence it stands under, which is A1 — and the fix for
// the second is to delete the ambiguous cue rather than to weight it.
const NEGATOR = /\b(not|no|none|never|nothing|nobody|neither|nor|hardly|rarely|seldom|cannot|can't|won't|isn't|aren't|wasn't|doesn't|don't|didn't|without|far from|fails? to|refuses? to)\b/i;

/**
 * How many times a gag's cue really fires in this text.
 *
 * A match is discarded when a negator sits within the six words before it —
 * six because "None of that makes forgiveness easy" puts five between them, and
 * a whole-sentence test would throw away every cue in any sentence containing
 * the word "not", which is most of philosophy.
 */
export function cueHits(gag, text) {
  const rx = new RegExp(gag.fits.source, 'gi');
  let n = 0;
  for (const m of text.matchAll(rx)) {
    const before = text.slice(0, m.index).split(/\s+/).slice(-6).join(' ');
    if (NEGATOR.test(before)) continue;
    n++;
  }
  return n;
}

/** Does this gag fit this beat at all — by vocabulary or by sentence shape? */
export function cueFits(gag, text) {
  return cueHits(gag, text) > 0 || !!(gag.turn && gag.turn.test(text.trim()));
}

export const COMIC_ACTS = new Set(COMIC.map((c) => c.act));
export const COMIC_CODES = new Set(COMIC.map((c) => play(c.act)));
export const comicName = (code) =>
  (COMIC.find((c) => play(c.act) === code) || {}).name || null;

// ── SAYING THE SAME THING A SECOND TIME ──────────────────────────────────────
//
// THIS IS THE TABLE THE WHOLE EXERCISE TURNS ON, and it comes straight out of
// the complaint: the figure "will just repeat movements over and over again in
// lessons". Measured, that is true and it is concentrated — ten codes are 68% of
// every gesture call in the app, `think` alone is 208 of them, and a quarter of
// all beats strike the pose the beat before them was already holding.
//
// Each row is ONE MEANING with several bodies for it. The variants are not
// near-misses: `think` is a hand at the chin, and 160 is a hand at the chin that
// shifts its weight, 176 is the same consideration weighed slowly, 159 is
// listening, 165 is fidgeting with it. A script that said "he considers" still
// says it. **That is what makes this safe to apply in bulk** — A1 is about the
// text agreeing with the picture, and none of these changes what is being
// claimed, so there is no sentence anywhere that a swap can falsify.
//
// Where a variant is in the 100 band it is a LIVING HOLD (acts 59–78): it reads
// `t`, ignores `u`, and runs for ever on non-commensurate frequencies, so it
// never visibly loops. Where it is in the 300 band it is an action PLAYED once as
// the beat opens and then settled. Between them, a pose repeated four times in a
// lesson is four different pictures of one idea.
// EVERY NON-RIG CODE HERE IS COMPUTED, NEVER TYPED. Written out by hand the first
// time, six of the thirty rows were off by one — `play(80)` is 379 and 380 is
// `weigh it up`, so `the idea` silently became a different gesture. Nothing would
// have failed: a wrong code in this range is still a valid pose, so the swap
// would have shipped a lesson gesturing at something it was not thinking about.
const L = hold;     // a LIVING hold, acts 59–78 — loops on `t`, never repeats
const A = play;     // an action PLAYED once as the beat opens, then settled

export const VARIANTS = {
  // rig code                   what it means      the other bodies for it
  1: [L(68), L(69), A(84)],     // explain         talking with the hands · counting · make the point
  2: [30, A(85), L(65)],        // present up      offer up · offer it · gazing up
  3: [L(69), L(68), A(84)],       // count           counting the points · talking with the hands · make the point
  4: [L(61), L(77), L(60), L(66), A(81)], // think    chin in hand · weighing slowly · listening · fidgeting · weigh it up
  5: [33, L(68), A(85)],           // sweep           release-open · talking with the hands · offer it
  6: [35, A(84)],               // point up        proclaim · make the point
  8: [L(74), A(79)],            // shrug           slouched on one hip · shrug
  9: [L(64), L(74), A(79)],        // hand on hip     hands on the hips · slouched on one hip · shrug
  10: [L(62), L(70), A(90)],       // arms crossed    arms folded · hands clasped · refuse
  13: [6, A(84), L(69)],        // point forward   point up · make the point · counting the points
  14: [31, A(85)],              // reach out       receive · offer it
  15: [A(88), A(89)],           // recoil          flinch · cringe
  16: [A(91), hold(34)],           // celebrate       celebrate · hands up (the overhead dance loop)
  20: [30, A(85)],              // hold up         offer up · offer it
  21: [L(77), A(81), L(78)],    // weigh           weighing slowly · weigh it up · leaning in close
  22: [L(71), L(70)],              // clutch chest    deep breathing · hands clasped
  25: [L(65), L(73), A(80)],       // gaze up         gazing up · up on the toes · the idea
  26: [A(82), L(67)],           // stamp           hesitate · impatient
  28: [L(64), L(75)],           // power pose      hands on the hips · at attention
  32: [L(68), L(72)],           // conduct         talking with the hands · stepping in place
  33: [A(86), L(70)],           // release open    split it in two · hands clasped
  35: [A(84), L(68)],           // proclaim        make the point · talking with the hands
  36: [40, L(69), A(84)],          // sign / write    write on a board · counting the points · make the point
  38: [L(78), L(77), A(84)],       // gesture down    leaning in close · weighing slowly · make the point
  41: [40, A(84)],              // tap high        write on a board · make the point
  44: [L(63), L(70), A(94)],       // hands behind    hands behind the back · hands clasped · turn on the spot
  45: [A(80), L(60)],              // double take     the idea · listening
  46: [L(74), L(59)],              // slump           slouched on one hip · weight shift
  47: [A(87), A(86)],              // frame it up     show the size · split it in two
  // 137 is held act 38 — HEAD NOD, "listening to something with a pulse" — and
  // it is what every quote beat in the app reaches for. Its siblings here are
  // the other loops that ignore `u` and read `t`, so a lesson that rests twice
  // does not rest identically twice. Deliberately the CALM end of that set:
  // arms loose, rock on the heels, roll the shoulders. The same shelf holds
  // HANDS UP and SHIMMY, and a figure dancing over a line of Epictetus is the
  // A1 failure this whole table is written to avoid.
  // Poses that had no row at all, added because 35 lessons could not be given
  // anything PERFORMED for want of one. Each is the same meaning in another body:
  // arms wide IS a shrug, pressing outward IS refusing, holding something up IS
  // offering it.
  7: [A(79), L(68)],                // both wide       shrug · talking with the hands
  11: [L(61), L(66)],               // hand to forehead chin in hand · fidgeting
  12: [L(66), L(61)],               // scratch head    fidgeting · chin in hand
  19: [A(85), L(65)],               // adore           offer it · gazing up
  24: [A(80), L(73)],               // reach up high   the idea · up on the toes
  29: [A(90), L(67)],               // press outward   refuse · impatient
  30: [A(85), L(70)],               // offer up        offer it · hands clasped
  37: [A(22), L(69)],               // grasp and pull  take something · counting the points
  39: [A(21), L(70)],               // clasp forward   hand something over · hands clasped
  40: [A(84), L(69)],               // write on board  make the point · counting the points
  42: [A(5), L(59)],                // carry a load    put something down · weight shift
  137: [hold(29), hold(45), hold(40)],
};
/** Every code the variant table can produce. */
export const VARIANT_CODES = new Set(Object.values(VARIANTS).flat());

// A VARIANT MAY NEVER BE A GAG, AND THIS IS ENFORCED RATHER THAN REMEMBERED.
//
// The first version of this table reached for the comic shelf for six of its rows
// — `double take` as a variant of rig's 45, `deflate` for 46, `peek over` for 25 —
// which is a perfectly good pose and completely the wrong route. The variant pass
// runs on EVERY repeated pose and asks none of the questions a gag has to answer:
// it does not check that the beat is about anything (N9), it does not know the
// branch has told that joke already (N10), and it does not look at whether the
// lesson is about slavery (N11). `check-life` duly reported gags in three grave
// lessons, ten about nothing, and six told twice within three lessons — all of
// them placed by a pass that was never supposed to be placing gags at all.
{
  const clash = [...VARIANT_CODES].filter((c) => COMIC_CODES.has(c));
  if (clash.length) {
    throw new Error(
      `VARIANTS reaches the comic shelf (${clash.join(', ')}). A gag goes through the `
      + 'joke pass, which checks fit, gravity and rotation; a variant goes through none '
      + 'of them. Pick a non-comic body for that meaning.',
    );
  }
}


// ── A RUN OF BEATS THAT ARE ONE SENTENCE ─────────────────────────────────────
//
// THIS IS WHERE MOST OF THE REPETITION ACTUALLY LIVES, and it was self-inflicted.
// J12 cut 466 over-packed beats into pieces and copied every channel verbatim so
// the picture would hold still while the words advanced. Measured afterwards, 445
// of the 499 repeated poses in the app are those pieces.
//
// Holding still was the right instinct for the SCENE and the wrong one for the
// FIGURE, and rig's own accents are why. `emoteLive` re-reads `bt`, which resets
// at every beat — so a pose with a `lift` (2, 3, 5, 6, 15, 16, 18, 19, 20, 23,
// 24, 25, 26, 33, 35, 47) RE-RAISES ITS ARM on every piece of the sentence. Four
// pieces, four identical arm lifts, one sentence. That is not a picture holding
// still, it is a tic, and it is precisely "they'll just repeat movements over and
// over again".
//
// A living hold fixes it exactly, because it reads `t` — absolute scene time —
// and ignores `bt` entirely. Put one across a whole run and the figure keeps
// moving smoothly straight through the beat changes without ever restarting;
// `carryFrom` blends between two identical values, so there is not even a seam.
// The words advance, the scene holds, and the person stays alive.
//
// Only EXACT re-statements are listed. `think` and `chin in hand` are the same
// gesture, one frozen and one alive; `point forward` has no living twin and is
// deliberately absent rather than approximated, because a run is several beats
// long and a wrong pose is wrong for all of them.
export const LIVING_RUN = {
  0: hold(59),    // neutral stand      → weight shift: standing, but not a photograph
  1: hold(68),    // explain            → talking with the hands
  3: hold(69),    // count              → counting the points
  4: hold(61),    // think              → chin in hand
  9: hold(64),    // hand on hip        → hands on the hips
  10: hold(62),   // arms crossed       → arms folded
  21: hold(77),   // weigh              → weighing it slowly
  25: hold(65),   // gaze up            → gazing up
  28: hold(64),   // power pose         → hands on the hips
  32: hold(31),   // conduct / sway     → sway
  35: hold(68),   // proclaim           → talking with the hands
  44: hold(63),   // hands behind back  → hands behind the back
  45: hold(60),   // double take        → listening (what he does AFTER the snap)
  46: hold(74),   // slump              → slouched on one hip
};

// ── WHERE A JOKE MAY NOT GO ──────────────────────────────────────────────────
//
// This is the rule that keeps the whole exercise from being a disaster. A
// stickman doing a little shimmy over a line about slavery is not a lively app,
// it is an app nobody will forgive — and philosophy spends a great deal of its
// time on death, harm and tyranny, so the collision is not hypothetical.
//
// Applied at TWO levels on purpose. A grave WORD anywhere in a lesson takes the
// whole lesson out of the comic rotation, because tone is a property of the
// piece rather than of the sentence: a lesson about the trolley problem has
// light beats in it, and a pratfall on one of them is worse for being
// well-timed. A grave word in the BEAT takes that beat out even in a lesson that
// is otherwise cheerful.
export const GRAVE = new RegExp(
  '\\b(' + [
    'death', 'deaths', 'die', 'dies', 'died', 'dying', 'dead', 'deadly',
    'kill', 'kills', 'killed', 'killing', 'murder', 'murdered', 'murderer',
    'suffer', 'suffers', 'suffered', 'suffering', 'torture', 'tortured',
    'slave', 'slaves', 'slavery', 'enslaved', 'cruel', 'cruelty',
    'grief', 'grieve', 'grieving', 'mourn', 'mourning', 'funeral', 'corpse',
    'war', 'wars', 'warfare', 'battlefield', 'genocide', 'massacre', 'atrocity',
    'starve', 'starving', 'starvation', 'famine', 'plague', 'disease',
    'execute', 'executed', 'execution', 'hanged', 'drown', 'drowned', 'drowning',
    'victim', 'victims', 'abuse', 'abused', 'rape', 'assault',
    'agony', 'anguish', 'despair', 'suicide', 'euthanasia',
    'tyrant', 'tyranny', 'tyrannical', 'oppress', 'oppressed', 'oppression',
    'prison', 'imprisoned', 'prisoner', 'captive', 'hostage',
    'harm', 'harmed', 'harmful', 'wound', 'wounded', 'bleeding', 'blood',
    'violence', 'violent', 'betray', 'betrayed', 'betrayal', 'cancer',
    'orphan', 'widow', 'poverty', 'destitute', 'refugee', 'exile', 'exiled',
    'hemlock', 'crucified', 'martyr', 'holocaust', 'auschwitz',
  ].join('|') + ')\\b',
  'i',
);

/** Does this text carry a weight a pratfall would insult? */
export const grave = (s) => GRAVE.test(s || '');

// ── SPLIT SIBLINGS ───────────────────────────────────────────────────────────
// J12 cut long beats into short ones and copied EVERY channel value verbatim, so
// that the picture holds still and only the words advance. A comic action landing
// on the second piece of a split therefore moves the picture in the middle of a
// sentence, which is the one thing the split was written not to do. A beat is a
// continuation when it declares exactly the same channels, to the same values, as
// the beat before it.
const IGNORE = new Set(['text', 'dur', 'cite']);
export function channels(chunk) {
  const out = [];
  for (const m of chunk.matchAll(/(?:^|[\s{,])([A-Za-z_$][\w$]*)\s*:\s*(-?[\d.]+)\s*(?=[,\n}])/g)) {
    if (!IGNORE.has(m[1])) out.push(`${m[1]}=${m[2]}`);
  }
  return out.sort().join(' ');
}

/**
 * The scene file for a route component, or null.
 *
 * THREE NAMES FOR ONE LESSON, and this cost two runs. The route says
 * `Ethics2Lesson`, the beats live in `ethics2Script.ts`, and the stage is
 * `ethics2Scene.tsx` — so the scene is the component minus `Lesson`, first letter
 * lowered, plus `Scene`. Guessing either of the other two forms returns 0 of 178,
 * which is a filter that should be loose matching nothing: the one shape §21 says
 * to distrust on sight rather than report as a finding.
 */
export function sceneFile(comp) {
  const base = comp.replace(/Lesson$/, '');
  const low = `${base[0].toLowerCase()}${base.slice(1)}`;
  for (const cand of [`${low}Scene.tsx`, `${low}.tsx`, `${comp}.tsx`]) {
    const p = path.join(DIR, cand);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/** The scenes that can reach the catalogue at all. */
export function reachesCatalogue(comp) {
  const p = sceneFile(comp);
  return !!p && /emoteAny/.test(fs.readFileSync(p, 'utf8'));
}

/** Branch slug from a lesson id: `ethics-ethics-13` → `ethics`. */
export const branchOf = (id) => id.split('-')[0];
