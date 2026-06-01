import type { ExampleCard as ExampleCardType, AnswerResult } from '@/data/types';
import StatementScreen from '../StatementScreen';

interface Props {
  card: ExampleCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function ExampleCard({ card, onComplete }: Props) {
  const text = `${card.title}. ${card.scenario}`;
  return (
    <StatementScreen
      text={text}
      size={25}
      kicker="A CLOSER LOOK"
      hint="CONTINUE"
      button="CONTINUE →"
      source={card.source}
      onContinue={() => onComplete()}
    />
  );
}
