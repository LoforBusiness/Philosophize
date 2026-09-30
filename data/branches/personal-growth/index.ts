import type { Branch } from '@/data/types';
import units from './paths/foundations';

// Personal Growth's one road (data/subjects.ts, 2026-09-30). One unit, one lesson so far;
// `more` puts a MORE COMING SOON sign at the end of it.
const personalGrowthBranch: Branch = {
  id: 'personal-growth',
  slug: 'personal-growth',
  name: 'Personal Growth',
  description: 'Habits, focus and a better you.',
  icon: '🌱',
  color: '#636C3C',
  paths: units,
  more: true,
};

export default personalGrowthBranch;
