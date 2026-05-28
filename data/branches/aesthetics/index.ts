import type { Branch } from '@/data/types';
import whatIsAestheticsPath from './paths/what-is-aesthetics';

const aestheticsBranch: Branch = {
  id: 'aesthetics',
  slug: 'aesthetics',
  name: 'Aesthetics',
  description: 'Study of beauty, art, and the nature of aesthetic experience.',
  icon: '🎨',
  color: '#9D4A6B',
  paths: [whatIsAestheticsPath],
};

export default aestheticsBranch;
