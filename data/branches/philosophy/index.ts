import type { Branch } from '@/data/types';
import units from './paths/foundations';

// Philosophy's one road (data/subjects.ts, 2026-09-30). One unit, one lesson so far;
// `more` puts a MORE COMING SOON sign at the end of it.
const philosophyBranch: Branch = {
  id: 'philosophy',
  slug: 'philosophy',
  name: 'Philosophy',
  description: 'The questions underneath everything else.',
  icon: '🦉',
  color: '#36515D',
  paths: units,
  more: true,
};

export default philosophyBranch;
