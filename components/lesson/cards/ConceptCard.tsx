import type { ConceptCard as ConceptCardType } from '@/data/types';
import StatementScreen from '../StatementScreen';

interface Props {
  card: ConceptCardType;
}

export default function ConceptCard({ card }: Props) {
  const text = `${card.title}. ${card.body}`;
  return <StatementScreen text={text} size={23} kicker="THE IDEA" />;
}
