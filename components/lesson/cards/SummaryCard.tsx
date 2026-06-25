import type { SummaryCard as SummaryCardType } from '@/data/types';
import StatementScreen from '../StatementScreen';
import { joinSentences } from '../joinSentences';

interface Props {
  card: SummaryCardType;
  onRevealed?: () => void;
}

export default function SummaryCard({ card, onRevealed }: Props) {
  const text = joinSentences(card.title, ...card.keyPoints, card.closingThought);
  return <StatementScreen text={text} size={24} kicker="LESSON COMPLETE" onRevealed={onRevealed} />;
}
