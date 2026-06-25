import type { ConceptCard as ConceptCardType } from '@/data/types';
import StatementScreen from '../StatementScreen';
import { joinSentences } from '../joinSentences';

interface Props {
  card: ConceptCardType;
  onRevealed?: () => void;
}

export default function ConceptCard({ card, onRevealed }: Props) {
  const text = joinSentences(card.title, card.body);
  return <StatementScreen text={text} size={23} kicker="THE IDEA" onRevealed={onRevealed} />;
}
