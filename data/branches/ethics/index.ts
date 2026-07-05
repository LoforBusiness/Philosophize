import type { Branch } from '@/data/types';
import units from './paths/what-is-ethics';

const ethicsBranch: Branch = {
  id: 'ethics',
  slug: 'ethics',
  name: 'Ethics',
  description: 'Study of morality, right action, and how humans should live.',
  icon: '⚖️',
  color: '#7B4A9D',
  paths: units,
};

export default ethicsBranch;
