import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-27',
  slug: 'epistemic-injustice',
  title: 'Wronged As A Knower',
  description: 'There is a way to harm someone precisely in their capacity to know and be believed.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You can wrong someone simply by not believing them.',
      subtext: 'Not by lying to them—by failing to credit what they say. Philosophy gave it a name.',
      emoji: '🗣️',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you asked whom to trust.',
      body: 'You learned that knowledge depends on testimony—on whose word we accept. But trust can go wrong in a quieter way: not by trusting a liar, but by under-trusting an honest speaker because of who they are. That bias is the subject here.',
      emoji: '🤝',
    },
    {
      type: 'example',
      title: 'The Discounted Witness',
      scenario:
        'A patient describes her own symptoms accurately, but the doctor waves them off as anxiety because she is young and a woman. Her testimony is true and well-reported. Yet a prejudice about her group leads him to grant it less credibility than it deserves. She is failed not as a patient only, but as a knower.',
      emoji: '🩺',
    },
    {
      type: 'concept',
      title: 'Testimonial Injustice',
      body: 'Philosopher Miranda Fricker named this testimonial injustice: when prejudice causes a hearer to give a speaker’s word less credibility than it merits. The harm is distinctive—the person is wronged specifically in their capacity as a knower, a giver of knowledge. The truth they hold gets discounted because of who they are.',
      visual: '🔇',
      highlight: 'testimonial injustice',
    },
    {
      type: 'concept',
      title: 'Hermeneutical Injustice',
      body: 'There is a second, deeper kind. Sometimes a group lacks the very concepts to make sense of their own experience. Before the term "sexual harassment" existed, victims could feel the wrong but not name it—so they struggled to be understood, even by themselves. Fricker calls this hermeneutical injustice: a gap in shared understanding.',
      visual: '🕳️',
      highlight: 'hermeneutical injustice',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-27-1',
      quote: 'A speaker suffers a testimonial injustice when prejudice causes a hearer to give a deflated level of credibility to their word.',
      author: 'Miranda Fricker (paraphrase)',
      era: '2007',
      work: 'Epistemic Injustice',
    },
    {
      type: 'question',
      prompt: 'A juror trusts a witness less purely because of his accent. Which kind of epistemic injustice is this?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Testimonial injustice—prejudice deflates the credibility of his word', isCorrect: true },
          { id: 'b', text: 'Hermeneutical injustice—he lacks the concepts to be understood', isCorrect: false },
          { id: 'c', text: 'No injustice—jurors may weigh witnesses however they like', isCorrect: false },
          { id: 'd', text: 'A simple factual error with no ethical dimension at all', isCorrect: false },
        ],
        explanation:
          'Option (b) is the tempting trap, because both are Fricker’s categories. But hermeneutical injustice is about missing shared concepts to interpret an experience. Here the witness is perfectly able to speak and be understood; prejudice about his accent simply lowers how much the juror believes him. That credibility deflation is the signature of testimonial injustice.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'You can wrong someone as a knower',
        'Testimonial injustice: prejudice deflates a speaker’s credibility',
        'Hermeneutical injustice: missing concepts to be understood',
        'Fricker put ethics inside epistemology',
      ],
      closingThought: 'Whom you believe—and how much—is not only a question of truth. It is also a question of justice.',
    },
  ],
};

export default lesson;
