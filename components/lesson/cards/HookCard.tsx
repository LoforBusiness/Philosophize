import type { HookCard as HookCardType } from '@/data/types';
import StatementScreen from '../StatementScreen';

interface Props {
  card: HookCardType;
}

export default function HookCard({ card }: Props) {
  const text = card.subtext ? `${card.headline}. ${card.subtext}` : card.headline;
  return <StatementScreen text={text} size={30} kicker="A QUESTION TO BEGIN" />;
}
