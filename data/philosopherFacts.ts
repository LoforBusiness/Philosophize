// "Did you know?" facts shown on each philosopher's profile.
// Exactly 3 short, surprising, well-attested facts per philosopher.
import { ANCIENT_FACTS } from './extra-philosophers/ancient-facts';
import { EASTERN_FACTS } from './extra-philosophers/eastern-facts';
import { MEDIEVAL_FACTS } from './extra-philosophers/medieval-facts';
import { MODERN_FACTS } from './extra-philosophers/modern-facts';
import { CONTEMPORARY_FACTS } from './extra-philosophers/contemporary-facts';
import { EXPANSION_FACTS } from './extra-philosophers/expansion-facts';

const BASE_FACTS: Record<string, string[]> = {
  'socrates': [
    'Socrates never wrote a single word — everything we know comes from his students.',
    'He was sentenced to death and drank poison hemlock rather than flee into exile.',
    'He served as a soldier and was famous for staying calm and barefoot in freezing battle.',
  ],
  'plato': [
    "Plato founded the Academy, the Western world's first university, which ran for nearly 900 years.",
    "His real name may have been Aristocles; 'Plato' was a nickname meaning 'broad-shouldered'.",
    'Legend says he was once sold into slavery before a friend bought his freedom.',
  ],
  'aristotle': [
    'Aristotle personally tutored a teenage Alexander the Great, who later conquered much of the known world.',
    'He dissected animals and basically invented biology by classifying hundreds of species.',
    'He liked to teach while strolling, so his followers were nicknamed the "walkers".',
  ],
  'confucius': [
    'Confucius wandered for years looking for a ruler who would actually follow his advice, and mostly failed.',
    'His descendants form one of the longest recorded family trees on Earth, spanning over 80 generations.',
    'He worked as a manager of granaries and livestock before becoming a famous teacher.',
  ],
  'epicurus': [
    'Epicurus welcomed women and enslaved people as equals in his school, the Garden — shocking for his time.',
    'Despite his name inspiring "epicurean" feasts, he taught that simple bread and water bring happiness.',
    'He died in agony from kidney stones yet wrote that he was perfectly happy that day.',
  ],
  'marcus-aurelius': [
    'Marcus Aurelius ruled the Roman Empire while privately writing self-help notes never meant for publication.',
    'His famous "Meditations" was basically a personal diary he wrote to coach himself through stress.',
    'He led armies on the freezing frontier and likely died of plague during a military campaign.',
  ],
  'thomas-aquinas': [
    'Classmates nicknamed Aquinas the "Dumb Ox" — then he became one of history\'s greatest thinkers.',
    'His family locked him up for a year to stop him joining the friars; he refused to budge.',
    'Near the end he had a vision and called all his vast writings "straw", leaving his masterwork unfinished.',
  ],
  'rene-descartes': [
    'Descartes liked to think in bed and reportedly stayed there until noon most mornings.',
    'He famously concluded "I think, therefore I am" by doubting absolutely everything else.',
    'Forced into early sunrise lessons for a queen, he caught pneumonia and died within months.',
  ],
  'baruch-spinoza': [
    'Spinoza was excommunicated by his Jewish community at 23 with one of its harshest curses ever.',
    'He turned down a prestigious professorship to protect his freedom to think.',
    'He ground glass lenses for a living, and the fine dust likely contributed to his early death.',
  ],
  'john-locke': [
    "Locke's ideas about life, liberty and property were quietly echoed in America's Declaration of Independence.",
    'He trained as a doctor and once helped save his patron by draining a dangerous abscess.',
    'He fled to Holland for years, suspected of plotting against the English king.',
  ],
  'david-hume': [
    'Hume was so cheerful about dying that a famous economist visited just to witness it.',
    'He was twice rejected for university jobs for being suspected of atheism.',
    'His writing was so clear and witty that even people who disagreed loved reading him.',
  ],
  'immanuel-kant': [
    "Kant's daily walk was so punctual that neighbours set their clocks by him.",
    'He never travelled more than a few miles from his hometown his entire life.',
    'He often worked the same favourite topics into conversation and ate one big meal a day with guests.',
  ],
  'jean-jacques-rousseau': [
    'Rousseau wrote glowing theories on raising children while handing all five of his own to an orphanage.',
    'His ideas helped spark the French Revolution years after he died.',
    'He grew so paranoid in later life that he believed nearly everyone was conspiring against him.',
  ],
  'georg-hegel': [
    'Hegel finished his masterpiece as Napoleon\'s army stormed his city, calling Napoleon "the world-spirit on horseback".',
    'His handwriting and lectures were so dense that students argued for centuries about what he meant.',
    'He died suddenly during a cholera outbreak at the height of his fame.',
  ],
  'john-stuart-mill': [
    'Mill was taught ancient Greek at age three and Latin by eight in an intense home experiment.',
    'The pressure caused a breakdown at 20, and poetry helped pull him out of it.',
    'As a lawmaker he was the first in Britain to formally call for women to get the vote.',
  ],
  'karl-marx': [
    'Marx wrote much of his world-changing economics while broke and reading in the British Museum library.',
    'He worked as a newspaper journalist and was kicked out of several countries for his politics.',
    'Only about a dozen people attended his funeral, yet his ideas later reshaped the planet.',
  ],
  'friedrich-nietzsche': [
    'Nietzsche had a mental collapse after seeing a horse being whipped, and never recovered.',
    'He became a university professor at just 24, before he had even finished his doctorate.',
    'His sister twisted his writings after his death to fit ideas he would have hated.',
  ],
  'ludwig-wittgenstein': [
    'Wittgenstein gave away a massive family fortune to live simply.',
    'He thought he had solved all of philosophy, quit, taught schoolkids, then returned to prove himself wrong.',
    'He volunteered for the front lines in World War I and wrote philosophy in the trenches.',
  ],
  'jean-paul-sartre': [
    'Sartre turned down the Nobel Prize in Literature, refusing to be turned into an institution.',
    'He reportedly took speed to write faster, sometimes producing thousands of words a day.',
    'His funeral drew a crowd of around 50,000 people through the streets of Paris.',
  ],
  'simone-de-beauvoir': [
    'De Beauvoir was the youngest person ever to pass France\'s brutal philosophy exam at the time.',
    'Her book "The Second Sex" was banned by the Vatican yet helped launch modern feminism.',
    'She and Sartre were lifelong partners who never married and never lived in the same home.',
  ],
};

// The full canon — original 20 plus all extended thinkers.
export const PHILOSOPHER_FACTS: Record<string, string[]> = {
  ...BASE_FACTS,
  ...ANCIENT_FACTS,
  ...EASTERN_FACTS,
  ...MEDIEVAL_FACTS,
  ...MODERN_FACTS,
  ...CONTEMPORARY_FACTS,
  ...EXPANSION_FACTS,
};
