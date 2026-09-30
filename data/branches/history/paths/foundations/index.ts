import type { Path } from '@/data/types';
import first from './lessons/what-is-history';

const units: Path[] = [
  {
    id: "history-foundations",
    slug: "foundations",
    name: "Foundations",
    description: "How we know the past, and how a group decides.",
    lessons: [first],
  },
];

export default units;
