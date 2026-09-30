import type { Path } from '@/data/types';
import whatIsEconomics from './lessons/what-is-economics';

const units: Path[] = [
  {
    id: "economics-foundations",
    slug: "foundations",
    name: "Foundations",
    description: "What economics is, and the choice at the heart of it.",
    lessons: [whatIsEconomics],
  },
];

export default units;
