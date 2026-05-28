import type { Branch } from '@/data/types';
import whatIsPoliticalPhilosophyPath from './paths/what-is-political-philosophy';

const politicalBranch: Branch = {
  id: 'political-philosophy',
  slug: 'political-philosophy',
  name: 'Political Philosophy',
  description: 'Study of justice, power, rights, and how societies should be organized.',
  icon: '🏛️',
  color: '#4A6B9D',
  paths: [whatIsPoliticalPhilosophyPath],
};

export default politicalBranch;
