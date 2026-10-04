import type { Path } from '@/data/types';
import first from './lessons/what-is-philosophy';
import second from './lessons/what-makes-an-argument-good';
import third from './lessons/how-do-we-decide-whats-right';
import fourth from './lessons/how-do-you-know';
import fifth from './lessons/what-makes-you-you';

const units: Path[] = [
  {
    id: "philosophy-foundations",
    slug: "foundations",
    name: "Foundations",
    description: "What philosophy is, and the kind of question it asks.",
    lessons: [first, second, third, fourth, fifth],
  },
];

export default units;
