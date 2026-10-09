import type { Path } from '@/data/types';
import first from './lessons/proceed';

// This road's SECOND unit (LESSON_RULES AW): one true story, told in costume, the plain one
// playing its protagonist.
const units: Path[] = [
  {
    id: 'personal-growth-endurance',
    slug: 'endurance',
    name: 'Shackleton\'s Endurance',
    description: 'Shackleton\'s Antarctic expedition, 1914–1917: leadership, morale and changing the plan.',
    lessons: [first],
  },
];

export default units;
