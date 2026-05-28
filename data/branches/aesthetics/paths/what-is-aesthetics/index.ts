import type { Path } from '@/data/types';
import lesson1 from './lessons/why-things-feel-beautiful';
import lesson2 from './lessons/art-beauty-and-emotion';
import lesson3 from './lessons/why-humans-love-music-and-stories';
import lesson4 from './lessons/can-anything-be-art';
import lesson5 from './lessons/seeing-the-world-differently';

const whatIsAestheticsPath: Path = {
  id: 'aesthetics-aesthetics',
  slug: 'what-is-aesthetics',
  name: 'What Is Aesthetics?',
  description: 'Explore beauty, art, and why humans are moved by what they experience.',
  lessons: [lesson1, lesson2, lesson3, lesson4, lesson5],
};

export default whatIsAestheticsPath;
