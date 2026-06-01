import type { HookCard as HookCardType, AnswerResult } from '@/data/types';
import StatementScreen from '../StatementScreen';

interface Props {
  card: HookCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function HookCard({ card, onComplete }: Props) {
  const text = card.subtext ? `${card.headline}. ${card.subtext}` : card.headline;
  return (
    <StatementScreen
      text={text}
      size={32}
      kicker="A QUESTION TO BEGIN"
      hint="BEGIN THE LESSON"
      button="BEGIN →"
      onContinue={() => onComplete()}
    />
  );
}
