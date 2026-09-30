import type { Branch } from '@/data/types';
import units from './paths/foundations';

// Economics & Finance's first course (data/subjects.ts). One unit, one lesson so far;
// `more` puts a MORE COMING SOON sign at the end of its road.
const economicsBranch: Branch = {
  id: 'economics',
  slug: 'economics',
  name: 'Foundations of Economics',
  description: 'Scarcity, choice, and why prices move.',
  icon: '💷',
  color: '#335172',
  paths: units,
  more: true,
};

export default economicsBranch;
