import type { Path } from '@/data/types';
import whatIsEconomics from './lessons/what-is-economics';
import second from './lessons/supply-and-demand';
import third from './lessons/what-does-it-really-cost';
import fourth from './lessons/why-do-people-trade';
import fifth from './lessons/the-rat-tail-reward';

const units: Path[] = [
  {
    id: "economics-foundations",
    slug: "foundations",
    name: "Foundations",
    description: "What economics is, and the choice at the heart of it.",
    lessons: [whatIsEconomics, second, third, fourth, fifth],
  },
];

export default units;
