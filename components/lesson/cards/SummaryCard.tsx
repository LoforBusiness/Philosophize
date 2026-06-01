import type { SummaryCard as SummaryCardType, AnswerResult } from '@/data/types';
import StatementScreen from '../StatementScreen';

interface Props {
  card: SummaryCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function SummaryCard({ card, onComplete }: Props) {
  const parts = [card.title, ...card.keyPoints];
  if (card.closingThought) parts.push(card.closingThought);
  const text = parts.join('. ');

  return (
    <StatementScreen
      text={text}
      size={26}
      kicker="LESSON COMPLETE"
      hint="YOU MADE IT"
      button="FINISH LESSON →"
      onContinue={() => onComplete()}
    />
  );
}
