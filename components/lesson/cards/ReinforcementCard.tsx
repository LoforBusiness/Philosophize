import type { ReinforcementCard as ReinforcementCardType } from '@/data/types';
import StatementScreen from '../StatementScreen';

interface Props {
  card: ReinforcementCardType;
}

export default function ReinforcementCard({ card }: Props) {
  const text = card.callout ? `${card.callout}. ${card.body}` : card.body;
  return <StatementScreen text={text} size={24} kicker="REMEMBER" />;
}
