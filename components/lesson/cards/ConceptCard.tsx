import type { ConceptCard as ConceptCardType, AnswerResult } from '@/data/types';
import StatementScreen from '../StatementScreen';

interface Props {
  card: ConceptCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function ConceptCard({ card, onComplete }: Props) {
  const text = `${card.title}. ${card.body}`;
  return (
    <StatementScreen
      text={text}
      size={25}
      kicker="THE IDEA"
      hint="KEEP GOING"
      button="GOT IT →"
      onContinue={() => onComplete()}
    />
  );
}
