import type { Path } from '@/data/types';
import first from './lessons/what-is-psychology';
import second from './lessons/why-memory-gets-things-wrong';
import third from './lessons/why-we-see-what-we-expect';
import fourth from './lessons/why-we-follow-the-crowd';
import fifth from './lessons/when-the-saucer-doesnt-come';
import sixth from './lessons/why-one-more-go';

const units: Path[] = [
  {
    id: "psychology-foundations",
    slug: "foundations",
    name: "Foundations",
    description: "What psychology is, and why it tests instead of asking.",
    lessons: [first, second, third, fourth, fifth, sixth],
  },
];

export default units;
