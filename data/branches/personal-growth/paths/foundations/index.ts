import type { Path } from '@/data/types';
import first from './lessons/how-do-people-change';
import second from './lessons/how-habits-work';
import third from './lessons/how-to-set-a-goal-that-works';
import fourth from './lessons/how-to-learn-from-a-mistake';
import fifth from './lessons/practise-at-the-edge';
import sixth from './lessons/why-cramming-fades';
import recap from './lessons/personal-growth-recap';

const units: Path[] = [
  {
    id: "personal-growth-foundations",
    slug: "foundations",
    name: "Foundations",
    description: "How people actually change: a little, and often.",
    lessons: [first, second, third, fourth, fifth, sixth, recap],
  },
];

export default units;
