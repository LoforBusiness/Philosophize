import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-34',
  slug: 'how-sure-are-you-really',
  title: 'How Sure Are You, Really?',
  description: 'People who say they are certain are wrong about one time in five.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Say "I am certain" a hundred times. How many hold?',
      subtext: 'Not a hundred. Not close to a hundred.',
      emoji: '🎯',
    },
    {
      type: 'concept',
      title: 'Calibration',
      body: 'Being well calibrated is not being right a lot. It is having your confidence match your hit rate. If everything you call ninety per cent likely happens about nine times in ten, you are calibrated — even if you are wrong constantly about hard things.',
      visual: '📊',
      highlight: 'Match, not accuracy',
    },
    {
      type: 'example',
      title: 'The Gap Opens At The Top',
      scenario: 'At low confidence people are close to honest. The gap opens as they climb: things called almost certain come off far less often than almost always. Confidence keeps rising after the evidence has stopped.',
      source: 'The overconfidence effect',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-34',
      quote: 'The whole problem with the world is that fools and fanatics are always so certain of themselves, and wiser people so full of doubts.',
      author: 'Bertrand Russell',
      era: '1933',
    },
    {
      type: 'question',
      prompt: 'What does being well calibrated actually require?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'That your confidence matches how often you turn out right', isCorrect: true },
          { id: 'b', text: 'That you are right more often than other people', isCorrect: false },
          { id: 'c', text: 'That you never claim to be certain about anything', isCorrect: false },
          { id: 'd', text: 'That you gather more evidence before judging', isCorrect: false },
        ],
        explanation: 'Calibration is about the match, not the score. Someone who is right half the time and says so is perfectly calibrated; someone right ninety times in a hundred who claims certainty is not.',
      },
    },
    {
      type: 'question',
      prompt: 'You could improve your calibration tomorrow. How?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'By claiming less confidence, without knowing anything more', isCorrect: true },
          { id: 'b', text: 'By studying harder so more of your beliefs come out true', isCorrect: false },
          { id: 'c', text: 'By refusing to make predictions at all', isCorrect: false },
          { id: 'd', text: 'You cannot — calibration is fixed by how good your evidence is', isCorrect: false },
        ],
        explanation: 'This is the strange and useful part. Because calibration is a match, you can fix it from either side — and the side you control today is what you claim. Lowering an inflated confidence closes the gap without a single new fact.',
      },
    },
    {
      type: 'summary',
      title: 'The Gap At The Top',
      keyPoints: [
        'Calibration is confidence matching hit rate',
        'It is not the same as being right often',
        'The gap opens most at high confidence',
        'You can close it by claiming less',
      ],
      closingThought: 'Certainty is a feeling with a track record. It is worth knowing what yours is.',
    },
  ],
};

export default lesson;
