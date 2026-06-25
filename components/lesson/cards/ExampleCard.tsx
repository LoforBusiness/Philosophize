import type { ExampleCard as ExampleCardType } from '@/data/types';
import StatementScreen from '../StatementScreen';
import { joinSentences } from '../joinSentences';

interface Props {
  card: ExampleCardType;
  onRevealed?: () => void;
}

export default function ExampleCard({ card, onRevealed }: Props) {
  const text = joinSentences(card.title, card.scenario);
  return (
    <StatementScreen
      text={text}
      size={22}
      kicker="A CLOSER LOOK"
      source={card.source}
      onRevealed={onRevealed}
    />
  );
}
