import type { Path } from '@/data/types';
import first from './lessons/the-mould-on-the-plate';

// This road's SECOND unit (LESSON_RULES AW): one true story, told in costume, the plain one
// playing its protagonist.
const units: Path[] = [
  {
    id: 'science-penicillin',
    slug: 'penicillin',
    name: 'The Discovery of Penicillin',
    description: 'A mould on a forgotten dish, and how it became the first antibiotic.',
    lessons: [first],
  },
];

export default units;
