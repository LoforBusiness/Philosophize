import type { Path } from '@/data/types';
import first from './lessons/cadabra-in-the-garage';

// This road's SECOND unit (LESSON_RULES AW): one true story, told in costume, the plain one
// playing its protagonist.
const units: Path[] = [
  {
    id: 'business-amazon',
    slug: 'amazon',
    name: 'The Story of Amazon',
    description: 'How a bookshop in a garage became Amazon: the idea, the luck, the rivals and the warehouses.',
    lessons: [first],
  },
];

export default units;
