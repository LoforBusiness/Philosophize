import type { Branch } from '@/data/types';
import foundations from './paths/foundations';
import descartes from './paths/descartes';

// Philosophy's one road (data/subjects.ts, 2026-09-30). One unit, one lesson so far;
// `more` puts a MORE COMING SOON sign at the end of it.
const philosophyBranch: Branch = {
  id: 'philosophy',
  slug: 'philosophy',
  name: 'Philosophy',
  description: 'The questions underneath everything else.',
  icon: '🦉',
  color: '#36515D',
  paths: [...foundations, ...descartes],
  more: true,
};

export default philosophyBranch;
