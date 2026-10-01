import type { Path } from '@/data/types';
import first from './lessons/what-is-history';
import second from './lessons/how-historians-know';

const units: Path[] = [
  {
    id: "history-foundations",
    slug: "foundations",
    name: "Foundations",
    description: "How we know the past, and how a group decides.",
    lessons: [first, second],
  },
];

export default units;
