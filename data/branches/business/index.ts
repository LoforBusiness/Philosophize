import type { Branch } from '@/data/types';
import foundations from './paths/foundations';
import amazon from './paths/amazon';

// Business & Leadership's one road (data/subjects.ts, 2026-09-30). One unit, one lesson so far;
// `more` puts a MORE COMING SOON sign at the end of it.
const businessBranch: Branch = {
  id: 'business',
  slug: 'business',
  name: 'Business & Leadership',
  description: 'Leading people and building things.',
  icon: '🍋',
  color: '#785A30',
  paths: [...foundations, ...amazon],
  more: true,
};

export default businessBranch;
