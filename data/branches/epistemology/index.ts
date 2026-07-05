import type { Branch } from '@/data/types';
import units from './paths/what-is-knowledge';

const epistemologyBranch: Branch = {
  id: 'epistemology',
  slug: 'epistemology',
  name: 'Epistemology',
  description: 'Study of knowledge, belief, and how we can know anything at all.',
  icon: '💡',
  color: '#4A7B6F',
  paths: units,
};

export default epistemologyBranch;
