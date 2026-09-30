import type { Path } from '@/data/types';
import first from './lessons/what-is-philosophy';

const units: Path[] = [
  {
    id: "philosophy-foundations",
    slug: "foundations",
    name: "Foundations",
    description: "What philosophy is, and the kind of question it asks.",
    lessons: [first],
  },
];

export default units;
