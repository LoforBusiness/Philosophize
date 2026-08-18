import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-36',
  slug: 'does-a-photograph-tell-the-truth',
  title: 'Does a Photograph Tell the Truth?',
  description: 'Nothing in the frame is false. The photograph still lies.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Two photographs of the same square, one minute apart.',
      subtext: 'One shows a crowd. One shows a man alone.',
      emoji: '📷',
    },
    {
      type: 'concept',
      title: 'Transparency',
      body: 'Photographs feel different from paintings because the light really did come off the thing. Bazin and Walton called this transparency: you are not seeing a record of the square, you are seeing the square. That is what makes the trust so easy to abuse.',
      visual: '🖼️',
      highlight: 'the light really did come off the thing',
    },
    {
      type: 'example',
      title: 'The Frame Is the Argument',
      scenario: 'Every photograph is a choice about edges. Nothing inside a tight crop is fabricated and the crop still decides whether a protest looks like thousands or like a dozen. No pixel had to be altered for the picture to mislead.',
      source: 'Walton, "Transparent Pictures" (1984)',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-36',
      quote: 'The photograph is literally an emanation of the referent.',
      author: 'Roland Barthes',
      era: '1980',
    },
    {
      type: 'question',
      prompt: 'How can a photograph mislead without anything in it being false?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'By what it excludes — the frame is a claim about what mattered', isCorrect: true },
          { id: 'b', text: 'Because cameras distort colour and perspective', isCorrect: false },
          { id: 'c', text: 'Because viewers bring their own biases to any image', isCorrect: false },
          { id: 'd', text: 'It cannot — an unedited photograph is always truthful', isCorrect: false },
        ],
        explanation: 'Distortion and bias are real and separate issues. The interesting case is a perfectly accurate image whose edges do the misleading, because everything shown is exactly as it was.',
      },
    },
    {
      type: 'question',
      prompt: 'Does heavy editing turn a photograph into something else?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'There is no sharp line, and the interesting question is what the viewer was promised', isCorrect: true },
          { id: 'b', text: 'Yes — any adjustment at all makes it a painting', isCorrect: false },
          { id: 'c', text: 'No — the original light was captured, so it stays a photograph', isCorrect: false },
          { id: 'd', text: 'Only if the editing changes the subject\'s identity', isCorrect: false },
        ],
        explanation: 'Every photograph is processed — exposure, contrast, crop. What shifts is the implicit promise: a news picture and an advertisement make different claims about their relationship to the light, and breaking that promise is what counts as a lie.',
      },
    },
    {
      type: 'summary',
      title: 'Everything Here Is True',
      keyPoints: [
        'Photographs feel transparent — you see the thing itself',
        'That trust is what makes the frame powerful',
        'A crop can mislead with nothing fabricated',
        'The line is the promise made, not the pixels',
      ],
      closingThought: 'Ask not whether the photograph is accurate. Ask what it was cropped away from, and who chose the edges.',
    },
  ],
};

export default lesson;
