import type { Path } from '@/data/types';
import first from './lessons/caesar-and-the-pirates';

// History's SECOND unit (LESSON_RULES AW): the life of Julius Caesar, told as a story in
// up to six lessons, the plain one in the toga.
const units: Path[] = [
  {
    id: 'history-caesar',
    slug: 'caesar',
    name: 'Julius Caesar',
    description: 'One life, from a pirate ship to the Ides of March.',
    lessons: [first],
  },
];

export default units;
