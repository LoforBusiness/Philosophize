import type { Path } from '@/data/types';
import first from './lessons/what-is-history';
import second from './lessons/how-historians-know';
import third from './lessons/why-did-it-happen';
import fourth from './lessons/what-changed-and-what-stayed';
import fifth from './lessons/on-trial-in-athens';
import sixth from './lessons/who-really-won';

const units: Path[] = [
  {
    id: "history-foundations",
    slug: "foundations",
    name: "Foundations",
    description: "How we know the past, and how a group decides.",
    lessons: [first, second, third, fourth, fifth, sixth],
  },
];

export default units;
