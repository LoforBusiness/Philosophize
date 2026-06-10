import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-8',
  slug: 'form-versus-expression',
  title: 'Form Versus Expression',
  description: 'Is art the shape on the canvas, or the feeling behind it?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Strip away the story. What is left in art?',
      subtext: 'Some say the lines and colors alone carry everything.',
      emoji: '🎨',
    },
    {
      type: 'concept',
      title: 'Significant Form',
      body: 'Earlier you met expression theory: art transmits feeling. Clive Bell disagreed. What moves us, he said, is "significant form" — arrangements of line and color, not the subject they depict.',
      visual: '🔷',
      highlight: 'significant form',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-8-1',
      quote: 'These relations and combinations of lines and colours, these aesthetically moving forms, I call Significant Form.',
      author: 'Clive Bell',
      era: '1914',
      work: 'Art',
    },
    {
      type: 'example',
      title: 'Ignore What It Shows',
      scenario: 'Bell stares at a Byzantine mosaic. He cannot read its religious story, nor does he care. The pattern of forms alone stirs a special aesthetic emotion. The subject, he insists, is irrelevant.',
      source: 'Clive Bell, Art (1914)',
      emoji: '🟦',
    },
    {
      type: 'question',
      prompt: 'For Bell, what is the one quality shared by every genuine work of visual art?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Significant form — moving arrangements of line and colour', isCorrect: true },
          { id: 'b', text: 'A sincere emotion the artist lived through', isCorrect: false },
          { id: 'c', text: 'A faithful imitation of the real world', isCorrect: false },
          { id: 'd', text: 'A clear moral or religious message', isCorrect: false },
        ],
        explanation: 'Bell\'s formalism locates art\'s essence in significant form — combinations of line and colour — not in subject matter, transmitted emotion, or imitation.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Two rival answers to one question.',
      body: 'Expression theory says art carries feeling; formalism says art is shape and structure. Both try to name art\'s essence — and a moving painting may simply have both at once.',
      emoji: '⚔️',
    },
    {
      type: 'question',
      prompt: 'A friend says Bell\'s formalism just means "art should be pretty to look at." Best reply?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Correct — significant form is the same as decorative prettiness', isCorrect: false },
          { id: 'b', text: 'No — significant form is about structure stirring aesthetic emotion, not mere prettiness', isCorrect: true },
          { id: 'c', text: 'No — Bell actually cared most about the painting\'s story', isCorrect: false },
          { id: 'd', text: 'Correct — he judged art only by how realistic it looked', isCorrect: false },
        ],
        explanation: 'The trap: "form, so just pretty surface." Bell meant deep structural relations of line and colour that provoke a distinct aesthetic emotion — not decoration or realism.',
      },
    },
    {
      type: 'summary',
      title: 'Shape Against Feeling',
      keyPoints: [
        'Formalism: art is significant form',
        'Expression: art transmits the artist\'s feeling',
        'Bell: the subject does not matter',
      ],
      closingThought: 'What is essential to art? Still a live, unsettled fight.',
    },
  ],
};

export default lesson;
