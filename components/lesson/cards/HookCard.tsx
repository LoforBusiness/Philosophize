import type { HookCard as HookCardType, AnswerResult } from '@/data/types';
import StatementScreen from '../StatementScreen';
import type { SceneKey } from '../scenes/LessonScene';

interface Props {
  card: HookCardType;
  onComplete: (result?: AnswerResult) => void;
  scene?: SceneKey;
}

export default function HookCard({ card, onComplete, scene }: Props) {
  const text = card.subtext ? `${card.headline}. ${card.subtext}` : card.headline;
  return (
    <StatementScreen
      text={text}
      size={32}
      kicker="A QUESTION TO BEGIN"
      hint="BEGIN THE LESSON"
      button="BEGIN →"
      scene={scene}
      onContinue={() => onComplete()}
    />
  );
}
