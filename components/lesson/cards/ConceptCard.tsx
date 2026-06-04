import type { ConceptCard as ConceptCardType, AnswerResult } from '@/data/types';
import StatementScreen from '../StatementScreen';
import type { SceneKey } from '../scenes/LessonScene';

interface Props {
  card: ConceptCardType;
  onComplete: (result?: AnswerResult) => void;
  scene?: SceneKey;
}

export default function ConceptCard({ card, onComplete, scene }: Props) {
  const text = `${card.title}. ${card.body}`;
  return (
    <StatementScreen
      text={text}
      size={25}
      kicker="THE IDEA"
      hint="KEEP GOING"
      button="GOT IT →"
      scene={scene}
      onContinue={() => onComplete()}
    />
  );
}
