// ─────────────────────────────────────────────────────────────────────────────
// A COMING-SOON SUBJECT'S ROAD — the stickman walks up to a signpost and waits.
//
// The owner chose this over a plain "Coming soon" card: every subject should feel
// like part of the same app, with the same walked road philosophy's branches have.
// So it IS that road — `BranchWorld`, with two stops: a hidden one he starts from,
// and a signpost reading COMING SOON. On arrival he walks the span between them, at
// the road's own pace and on the road's own gait, and stands there.
//
// Nothing here draws a figure or moves one; BranchWorld does, so everything the road
// already guarantees — feet that plant, no vertical wobble (group AL), a frame clock
// that stops when the screen is not in front of the reader — holds here for free.
// ─────────────────────────────────────────────────────────────────────────────
import { useMemo, useState } from 'react';
import BranchWorld, { type WorldLesson } from '@/components/branch/BranchWorld';
import type { Subject } from '@/data/subjects';

/**
 * Which of the road's six places a subject's road runs through — the nearest in
 * mood, so no two neighbours in the grid walk the same country.
 */
const PLACE: Record<string, string> = {
  psychology: 'epistemology',
  'personal-growth': 'aesthetics',
  business: 'political-philosophy',
  economics: 'logic',
  science: 'metaphysics',
  history: 'ethics',
};

export default function ComingSoonRoad({ subject }: { subject: Subject }) {
  const stops = useMemo<WorldLesson[]>(() => {
    const base = { unitId: `${subject.slug}-soon`, unitSlug: 'soon', unitTitle: subject.name, done: false, accessible: false };
    return [
      { ...base, id: `${subject.slug}-start`, title: '', hidden: true },
      { ...base, id: `${subject.slug}-soon`, title: 'COMING SOON', signpost: true },
    ];
  }, [subject]);
  // He starts at the hidden stop and walks to the sign once, when the page opens.
  const [at, setAt] = useState(0);
  const [walk, setWalk] = useState<{ from: number; to: number; done: () => void } | null>(
    () => ({ from: 0, to: 1, done: () => { setAt(1); setWalk(null); } }),
  );
  return (
    <BranchWorld
      lessons={stops}
      current={at}
      onOpen={() => {}}
      advanceTo={walk}
      place={PLACE[subject.slug] ?? ''}
    />
  );
}
