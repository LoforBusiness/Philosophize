import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-26',
  slug: 'peer-disagreement',
  title: 'When Your Equal Disagrees',
  description: 'Someone just as smart and informed reaches the opposite conclusion. Now what?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Someone just as smart as you concluded the opposite.',
      subtext: 'Not a fool—an equal. Should that shake your confidence, or not at all?',
      emoji: '⚖️',
    },
    {
      type: 'example',
      title: 'Splitting the Bill',
      scenario:
        'You and a friend split a dinner bill in your heads. You both know arithmetic equally well and have no reason to doubt the other. You get $43 each; she gets $45. You are equally careful, equally sober, equally good at sums. One of you is simply wrong. Should you stay confident in your $43?',
      emoji: '🧾',
    },
    {
      type: 'concept',
      title: 'Epistemic Peers',
      body: 'An epistemic peer is someone roughly your equal on a question—same evidence, same competence, same care. When a true peer disagrees, you cannot just assume they blundered. By definition they are as likely to be right as you. Their disagreement is itself a piece of evidence.',
      visual: '👥',
      highlight: 'epistemic peer',
    },
    {
      type: 'concept',
      title: 'Conciliate or Stand Firm',
      body: 'Two responses compete. Conciliationists say: meet a genuine peer in disagreement and you should lose confidence, often splitting the difference. Steadfasters reply: if you have actually weighed the evidence well, you may rationally keep your view—otherwise every contrarian could bully you out of true beliefs.',
      visual: '🤝',
      highlight: 'conciliationism vs steadfastness',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-26-1',
      quote: 'When we are confronted with a disagreeing peer, we are required to give that disagreement weight, even if we cannot locate any error.',
      author: 'David Christensen (paraphrase)',
      era: '2007',
    },
    {
      type: 'reinforcement',
      callout: 'This is updating, person-to-person.',
      body: 'Lesson 18 taught you to update beliefs when evidence arrives. A disagreeing peer is evidence—evidence that a mind as good as yours read the same facts and went the other way. Ignoring it is just refusing to update because the data came from a person, not a chart.',
      emoji: '🔁',
    },
    {
      type: 'question',
      prompt: 'You feel sure you’re right, so you dismiss your disagreeing peer. Why is "I just feel certain" a weak reason here?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Your peer feels equally certain, so confidence alone can’t break the tie', isCorrect: true },
          { id: 'b', text: 'Feelings are never relevant to whether a belief is true', isCorrect: false },
          { id: 'c', text: 'You should always defer to whoever spoke last', isCorrect: false },
          { id: 'd', text: 'Certainty proves you must be the one who is right', isCorrect: false },
        ],
        explanation:
          'Option (d) is the tempting trap: it treats your strong feeling of certainty as evidence you are correct. But a genuine peer feels exactly as certain on the other side. If feeling sure settled it, you would each "win" by your own lights—which settles nothing. That symmetry is precisely why mere confidence can’t break a peer standoff.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'A peer matches your evidence and competence',
        'Peer disagreement is itself evidence',
        'Conciliationists lower confidence after disagreement',
        'Steadfasters may hold a well-examined view',
      ],
      closingThought: 'The hardest disagreements aren’t with fools. They’re with the people you most respect—who looked at the same world and saw it differently.',
    },
  ],
};

export default lesson;
