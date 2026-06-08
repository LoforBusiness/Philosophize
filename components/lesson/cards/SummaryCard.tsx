import type { SummaryCard as SummaryCardType } from '@/data/types';
import StatementScreen from '../StatementScreen';

interface Props {
  card: SummaryCardType;
}

export default function SummaryCard({ card }: Props) {
  const parts = [card.title, ...card.keyPoints];
  if (card.closingThought) parts.push(card.closingThought);
  const text = parts.join('. ');
  return <StatementScreen text={text} size={24} kicker="LESSON COMPLETE" />;
}
