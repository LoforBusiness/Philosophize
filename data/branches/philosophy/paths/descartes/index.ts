import type { Path } from '@/data/types';
import first from './lessons/the-stove-heated-room';

// This road's SECOND unit (LESSON_RULES AW): one true story, told in costume, the plain one
// playing its protagonist.
const units: Path[] = [
  {
    id: 'philosophy-descartes',
    slug: 'descartes',
    name: 'Descartes Doubts Everything',
    description: 'René Descartes tears down everything he believes and rebuilds it from one certain thing.',
    lessons: [first],
  },
];

export default units;
