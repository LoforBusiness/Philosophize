import type { Branch } from '@/data/types';
import foundations from './paths/foundations';
import milgram from './paths/milgram';

// Psychology's one road (data/subjects.ts, 2026-09-30). One unit, one lesson so far;
// `more` puts a MORE COMING SOON sign at the end of it.
const psychologyBranch: Branch = {
  id: 'psychology',
  slug: 'psychology',
  name: 'Psychology',
  description: 'How minds think, feel and decide.',
  icon: '🧠',
  color: '#5A5A7E',
  paths: [...foundations, ...milgram],
  more: true,
};

export default psychologyBranch;
