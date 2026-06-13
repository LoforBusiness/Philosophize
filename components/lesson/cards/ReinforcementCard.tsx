import type { ReinforcementCard as ReinforcementCardType } from '@/data/types';
import StatementScreen from '../StatementScreen';
import { joinSentences } from '../joinSentences';

interface Props {
  card: ReinforcementCardType;
}

export default function ReinforcementCard({ card }: Props) {
  const text = joinSentences(card.callout, card.body);
  return <StatementScreen text={text} size={24} kicker="REMEMBER" />;
}
