import type { Path } from '@/data/types';
import first from './lessons/the-flower-that-broke';

// This road's SECOND unit (LESSON_RULES AW): one true story, told in costume, the plain one
// playing its protagonist.
const units: Path[] = [
  {
    id: 'economics-tulips',
    slug: 'tulips',
    name: 'Tulip Mania',
    description: 'How a flower from the Ottoman Empire became the Dutch Republic\'s famous bubble.',
    lessons: [first],
  },
];

export default units;
