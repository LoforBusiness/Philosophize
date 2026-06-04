import type { ReinforcementCard as ReinforcementCardType, AnswerResult } from '@/data/types';
import StatementScreen from '../StatementScreen';
import type { SceneKey } from '../scenes/LessonScene';

interface Props {
  card: ReinforcementCardType;
  onComplete: (result?: AnswerResult) => void;
  scene?: SceneKey;
}

export default function ReinforcementCard({ card, onComplete, scene }: Props) {
  const text = card.callout ? `${card.callout}. ${card.body}` : card.body;
  return (
    <StatementScreen
      text={text}
      size={26}
      kicker="REMEMBER"
      hint="CONTINUE"
      button="CONTINUE →"
      scene={scene}
      onContinue={() => onComplete()}
    />
  );
}
