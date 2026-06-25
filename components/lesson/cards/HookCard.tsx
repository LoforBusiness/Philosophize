import type { HookCard as HookCardType } from '@/data/types';
import StatementScreen from '../StatementScreen';
import { joinSentences } from '../joinSentences';

interface Props {
  card: HookCardType;
  onRevealed?: () => void;
}

export default function HookCard({ card, onRevealed }: Props) {
  const text = joinSentences(card.headline, card.subtext);
  return <StatementScreen text={text} size={30} kicker="A QUESTION TO BEGIN" onRevealed={onRevealed} />;
}
