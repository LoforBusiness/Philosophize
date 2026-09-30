import type { Branch } from '@/data/types';
import units from './paths/foundations';

// History & Politics's one road (data/subjects.ts, 2026-09-30). One unit, one lesson so far;
// `more` puts a MORE COMING SOON sign at the end of it.
const historyBranch: Branch = {
  id: 'history',
  slug: 'history',
  name: 'History & Politics',
  description: 'Power, people and how we got here.',
  icon: '🏛️',
  color: '#905748',
  paths: units,
  more: true,
};

export default historyBranch;
