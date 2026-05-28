import type { Branch } from '@/data/types';
import argumentsPath from './paths/arguments';

const logicBranch: Branch = {
  id: 'logic',
  slug: 'logic',
  name: 'Logic',
  description: 'Study of reasoning, arguments, and valid thinking.',
  icon: '⚙️',
  color: '#4A7B9D',
  paths: [argumentsPath],
};

export default logicBranch;
