import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-31',
  slug: 'the-gamblers-fallacy',
  title: 'The Coin Has No Memory',
  description: 'Why a long run of heads tells you nothing about the next flip.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Seven heads in a row. Tails is due, surely.',
      subtext: 'It is not. And the reason is stranger than it sounds.',
      emoji: '🪙',
    },
    {
      type: 'concept',
      title: 'Independence',
      body: 'A fair coin has no memory and no obligations. Each flip is independent: the odds reset to even every single time, no matter what came before. Nothing about the coin records the run you just watched.',
      visual: '🎲',
      highlight: 'Every flip starts fresh',
    },
    {
      type: 'example',
      title: 'Monte Carlo, 1913',
      scenario: 'A roulette wheel at the Monte Carlo Casino landed on black twenty-six times in a row. Players lost millions betting ever larger sums on red, certain it was overdue. The wheel had no idea what it had been doing.',
      source: 'The event that named the fallacy',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-31',
      quote: 'The theory of probabilities is at bottom nothing but common sense reduced to calculus.',
      author: 'Pierre-Simon Laplace',
      era: '1814',
      work: 'A Philosophical Essay on Probabilities',
    },
    {
      type: 'question',
      prompt: 'Seven heads have just landed. What is the chance the eighth flip is heads?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Fifty-fifty, exactly as it was on the first flip', isCorrect: true },
          { id: 'b', text: 'Well under half — tails is overdue by now', isCorrect: false },
          { id: 'c', text: 'Well over half — the coin is clearly biased to heads', isCorrect: false },
          { id: 'd', text: 'Impossible to say without more flips', isCorrect: false },
        ],
        explanation: 'The run is real and the odds are still even. Option C is the smarter-sounding trap: a run CAN be evidence of a biased coin, but seven is nowhere near enough to suspect one, and the question stipulates the coin is fair.',
      },
    },
    {
      type: 'question',
      prompt: 'What exactly does the gambler\'s fallacy get wrong?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It treats independent events as if they balanced each other out', isCorrect: true },
          { id: 'b', text: 'It underestimates how rare long runs actually are', isCorrect: false },
          { id: 'c', text: 'It assumes coins are fair when most are slightly weighted', isCorrect: false },
          { id: 'd', text: 'It confuses probability with certainty', isCorrect: false },
        ],
        explanation: 'The trap is that the law of large numbers is real: over millions of flips the ratio does settle near half. It settles by swamping the run, never by correcting it. The coin owes the average nothing.',
      },
    },
    {
      type: 'summary',
      title: 'The Coin Has No Memory',
      keyPoints: [
        'Independent events do not correct each other',
        'A run changes nothing about the next trial',
        'Long-run averages swamp runs, never cancel them',
        'Monte Carlo, 1913: twenty-six blacks in a row',
      ],
      closingThought: 'The wheel is not keeping score. Only you are.',
    },
  ],
};

export default lesson;
