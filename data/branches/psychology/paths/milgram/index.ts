import type { Path } from '@/data/types';
import first from './lessons/the-memory-study-that-wasnt';

// This road's SECOND unit (LESSON_RULES AW): one true story, told in costume, the plain one
// playing its protagonist.
const units: Path[] = [
  {
    id: 'psychology-milgram',
    slug: 'milgram',
    name: 'Milgram\'s Obedience Experiment',
    description: 'Yale, 1961: how far ordinary people went when a man in a lab coat said continue.',
    lessons: [first],
  },
];

export default units;
