import type { Branch } from '@/data/types';
import units from './paths/being-and-non-being';

const metaphysicsBranch: Branch = {
  id: 'metaphysics',
  slug: 'metaphysics',
  name: 'Metaphysics',
  description: 'Study of existence, reality, and the fundamental nature of being.',
  icon: '🌌',
  color: '#6B4A9D',
  paths: units,
};

export default metaphysicsBranch;
