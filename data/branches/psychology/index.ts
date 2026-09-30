import type { Branch } from '@/data/types';
import units from './paths/foundations';

// Psychology's one road (data/subjects.ts, 2026-09-30). One unit, one lesson so far;
// `more` puts a MORE COMING SOON sign at the end of it.
const psychologyBranch: Branch = {
  id: 'psychology',
  slug: 'psychology',
  name: 'Psychology',
  description: 'How minds think, feel and decide.',
  icon: '🧠',
  color: '#5A5A7E',
  paths: units,
  more: true,
};

export default psychologyBranch;
