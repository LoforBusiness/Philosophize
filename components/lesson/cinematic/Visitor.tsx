import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import Stickman from './Stickman';
import { K_FIG, GROUND } from './cinematicKit';
import { pose, travelStance, moveTr, ease01, WALK, type Bundle } from './rig';
import { emoteAny, emoteAnyLive } from './moves';
import type { VisitorCue } from '../../../data/lessonVisitor';

// ─────────────────────────────────────────────────────────────────────────────
// THE SECOND FIGURE, WHO WALKS IN BECAUSE THE ARGUMENT HAS TWO SIDES.
//
// A reader asked for another stickman to "come into a lesson dressed funny or
// dressed differently", and chose the version that keeps A1 true: he is the
// person who holds the OTHER position. So he arrives on the beat before a `poll`
// or a `split` — the two controls that are two-sided by construction — and is
// standing there when the question is asked.
//
// ── WHY THE PLAYER DRAWS HIM AND NOT THE SCENE ──────────────────────────────
//
// 32 lessons qualify. Staging him by hand in 32 scene files is 32 edits to files
// whose every byte is inside `muststamp`, which is 32 chances to nudge a prop and
// force a re-measure of everything — and it is the kind of list that gets
// half-finished, leaving a corpus where a visitor turns up in some lessons and
// not others for no reason a reader can see.
//
// Everything he needs is already measured. `mustBoxes` records every item every
// beat draws, so `make:visitor` can find the widest clear floor that exists on
// BOTH the entrance beat and the question beat, and put him there. He is one
// component, mounted once by the player, driven off a generated cue.
//
// ── AND HE MUST NOT TELEPORT (group L) ──────────────────────────────────────
//
// He is parked OFF-STAGE rather than faded in, because a figure who materialises
// is the teleport group L exists to forbid, and because `mustprobe` drops any
// item whose centre is off the stage — so an off-stage visitor costs the camera
// nothing until the frame he steps on.
//
// His walk uses `rig.moveTr` for the same reason every other walk in the app
// does: a fixed duration sprints a long journey and strands the footfalls (§17,
// "the walk was too fast in 54 scenes"). `travelStance` handles the gait; below
// its one-unit threshold it blends a standing hold instead, so the beats after
// his arrival are a living stand rather than a frozen frame.
// ─────────────────────────────────────────────────────────────────────────────

/** A neutral, open stance — he is listening, not performing. */
const STAND = 25;
/** What the walk-in costs, as a fraction of the beat. Matches the house base. */
const BASE_TR = 0.85;

interface Props {
  cue: VisitorCue;
  clock: SharedValue<number>;
  bt: SharedValue<number>;
  bi: SharedValue<number>;
}

export default function Visitor({ cue, clock, bt, bi }: Props) {
  const D = useDerivedValue<Bundle>(() => {
    const n = bi.value;
    const t = clock.value;

    // Before his beat he is off-stage; on it he walks; after it he stands.
    const x0 = n <= cue.enter ? cue.from : cue.x;
    const x1 = n < cue.enter ? cue.from : cue.x;
    const tr = n === cue.enter
      ? ease01(bt.value / moveTr(cue.from, cue.x, BASE_TR))
      : 1;

    const hold = emoteAny(STAND, t);
    const live = emoteAnyLive(STAND, t, bt.value);
    const s = travelStance(x0, x1, hold, hold, live, tr, WALK);

    // He faces the way he is TRAVELLING while he walks, and turns to the lead once
    // he has arrived — two figures facing the same way are two bystanders, two
    // facing each other are an argument. The turn rides `tr`, so it is continuous.
    const walking = Math.abs(x1 - x0) > 1;
    const travelDir = cue.from < cue.x ? 1 : -1;
    const dir = walking ? (tr < 0.86 ? travelDir : cue.dir) : cue.dir;

    const x = x0 + (x1 - x0) * tr;
    return pose(s, x, GROUND, K_FIG, dir, 1);
  }, [cue.enter, cue.x, cue.from, cue.dir]);

  return <Stickman D={D} k={K_FIG} role="second" />;
}
