import type { ExampleCard as ExampleCardType, AnswerResult } from '@/data/types';
import StatementScreen from '../StatementScreen';
import type { SceneKey } from '../scenes/LessonScene';

interface Props {
  card: ExampleCardType;
  onComplete: (result?: AnswerResult) => void;
  scene?: SceneKey;
}

export default function ExampleCard({ card, onComplete, scene }: Props) {
  const text = `${card.title}. ${card.scenario}`;
  return (
    <StatementScreen
      text={text}
      size={25}
      kicker="A CLOSER LOOK"
      hint="CONTINUE"
      button="CONTINUE →"
      source={card.source}
      scene={scene}
      onContinue={() => onComplete()}
    />
  );
}
