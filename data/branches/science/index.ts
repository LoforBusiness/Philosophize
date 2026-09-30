import type { Branch } from '@/data/types';
import units from './paths/foundations';

// Science & Technology's one road (data/subjects.ts, 2026-09-30). One unit, one lesson so far;
// `more` puts a MORE COMING SOON sign at the end of it.
const scienceBranch: Branch = {
  id: 'science',
  slug: 'science',
  name: 'Science & Technology',
  description: 'How the world works, and what we built.',
  icon: '🔬',
  color: '#306F72',
  paths: units,
  more: true,
};

export default scienceBranch;
