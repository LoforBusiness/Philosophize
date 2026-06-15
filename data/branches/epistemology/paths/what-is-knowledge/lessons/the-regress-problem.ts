import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-21',
  slug: 'the-regress-problem',
  title: 'What Holds Your Beliefs Up?',
  description: 'Every reason needs a reason. So where does the chain finally stop?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Ask "why?" enough times and the floor drops out.',
      subtext: 'Every reason leans on another reason. What holds up the very first one?',
      emoji: '🪜',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you learned a belief needs justification.',
      body: 'Lesson 8 said knowledge is not just a true belief but a justified one. Fair enough. But justification means having a reason. And that reason needs its own reason. Pull the thread and the whole sweater starts to unravel.',
      emoji: '🧶',
    },
    {
      type: 'example',
      title: 'The Toddler Strategy',
      scenario:
        'A child keeps asking "why?". The streets are wet. Why? It rained. Why? Clouds dropped water. Why? They got too heavy. Why? At some point you either keep going forever, circle back to something you already said, or just stop: "Because that is how it is." Each ending feels uncomfortable.',
      emoji: '🧒',
    },
    {
      type: 'concept',
      title: 'The Regress Trilemma',
      body: 'A reason needs a reason needs a reason. Only three escapes exist. The chain goes on infinitely. Or it loops back on itself in a circle. Or it halts on a belief that needs no further support. Philosophers call this the regress problem, and you must pick a door.',
      visual: '🔱',
      highlight: 'the regress problem',
    },
    {
      type: 'concept',
      title: 'Foundations or Webs',
      body: 'Foundationalists pick the third door: some basic beliefs are self-supporting bedrock, and everything else rests on them. Coherentists reject the ladder image entirely. Beliefs are not a tower but a web—each one is justified by how well it hangs together with all the others.',
      visual: '🕸️',
      highlight: 'foundationalism vs coherentism',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-21-1',
      quote: 'I had to remove all the opinions which I had hitherto accepted, and begin afresh from the foundations.',
      author: 'René Descartes',
      era: '1641',
      work: 'Meditations on First Philosophy',
      philosopherId: 'rene-descartes',
    },
    {
      type: 'dilemma',
      scenario:
        'You believe the bridge is safe. Why? An engineer signed off. Why trust her? She is certified. Why trust the certificate? Sooner or later your reasons must end somewhere. A friend insists every belief still needs a further reason behind it, with no exceptions.',
      prompt: 'How should the chain of reasons end?',
      choices: [
        { id: 'a', label: 'It never ends—reasons go back infinitely' },
        { id: 'b', label: 'It rests on basic beliefs needing no further reason' },
        { id: 'c', label: 'Beliefs support each other in a coherent web' },
      ],
      views: [
        {
          thinker: 'Foundationalist',
          stance: 'Stop on self-evident bedrock.',
          why: 'Some beliefs—like simple perceptions or "1+1=2"—are basic. They support others without needing support themselves. The regress must terminate, or no belief is ever truly justified.',
        },
        {
          thinker: 'Coherentist',
          stance: 'Drop the ladder; build a web.',
          why: 'There is no privileged bedrock. A belief is justified by fitting the whole system. The web hangs together by mutual support, not by hanging from a single foundation.',
        },
        {
          thinker: 'Skeptic',
          stance: 'Each escape has a cost.',
          why: 'Infinite chains seem impossible, circles look like cheating, and stopping arbitrarily looks dogmatic. The skeptic uses the trilemma to argue justification may never fully succeed.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Every reason seems to demand another reason',
        'Three escapes: infinite, circular, or a stopping point',
        'Foundationalists rest on basic, self-supporting beliefs',
        'Coherentists replace the tower with a web',
      ],
      closingThought: 'Before you defend any belief, notice the question underneath it: what is holding this up—a foundation, or the whole web?',
    },
  ],
};

export default lesson;
