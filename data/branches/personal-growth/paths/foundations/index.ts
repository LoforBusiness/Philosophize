import type { Path } from '@/data/types';
import first from './lessons/how-do-people-change';
import second from './lessons/how-habits-work';
import third from './lessons/how-to-set-a-goal-that-works';

const units: Path[] = [
  {
    id: "personal-growth-foundations",
    slug: "foundations",
    name: "Foundations",
    description: "How people actually change: a little, and often.",
    lessons: [first, second, third],
  },
];

export default units;
