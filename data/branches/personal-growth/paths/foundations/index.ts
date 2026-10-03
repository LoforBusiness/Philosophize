import type { Path } from '@/data/types';
import first from './lessons/how-do-people-change';
import second from './lessons/how-habits-work';
import third from './lessons/how-to-set-a-goal-that-works';
import fourth from './lessons/how-to-learn-from-a-mistake';

const units: Path[] = [
  {
    id: "personal-growth-foundations",
    slug: "foundations",
    name: "Foundations",
    description: "How people actually change: a little, and often.",
    lessons: [first, second, third, fourth],
  },
];

export default units;
