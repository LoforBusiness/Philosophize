import type { ReinforcementCard as ReinforcementCardType, AnswerResult } from '@/data/types';
import StatementScreen from '../StatementScreen';

interface Props {
  card: ReinforcementCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function ReinforcementCard({ card, onComplete }: Props) {
  const text = card.callout ? `${card.callout}. ${card.body}` : card.body;
  return (
    <StatementScreen
      text={text}
      size={26}
      kicker="REMEMBER"
      hint="CONTINUE"
      button="CONTINUE →"
      onContinue={() => onComplete()}
    />
  );
}
