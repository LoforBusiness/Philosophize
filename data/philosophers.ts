import { ANCIENT_EXTRA } from './extra-philosophers/ancient';
import { EASTERN_EXTRA } from './extra-philosophers/eastern';
import { MEDIEVAL_EXTRA } from './extra-philosophers/medieval';
import { MODERN_EXTRA } from './extra-philosophers/modern';
import { CONTEMPORARY_EXTRA } from './extra-philosophers/contemporary';
import { EXPANSION_EXTRA } from './extra-philosophers/expansion';
import { EXPANSION2A_EXTRA } from './extra-philosophers/expansion2a';
import { EXPANSION2B_EXTRA } from './extra-philosophers/expansion2b';
import { EXPANSION3_EXTRA } from './extra-philosophers/expansion3';
import { EXPANSION4_EXTRA } from './extra-philosophers/expansion4';
import { PHILOSOPHER_QUOTES_EXTRA } from './philosopherQuotesExtra';

export interface PhilosopherQuote {
  id: string; // unique, kebab style like 'socrates-1', 'socrates-2'
  text: string; // the quote, no surrounding quotation marks
}

export interface Philosopher {
  id: string; // kebab-case unique id, e.g. 'socrates', 'simone-de-beauvoir'
  name: string; // display name, e.g. 'Socrates'
  lifespan: string; // e.g. '470–399 BCE' or '1724–1804'
  era: string; // short era/place, e.g. 'Classical Athens', 'Enlightenment Germany'
  symbol: string; // ONE emoji that evokes the thinker
  oneLiner: string; // their core idea in <= 10 words
  bio: string; // 3–5 sentences, warm and accessible to a curious beginner
  areas: string[]; // 2–4 human-readable areas of thought
  branchSlugs: string[]; // subset of the 6 allowed slugs
  quotes: PhilosopherQuote[]; // 4–6 well-known, reliably attributed quotes
  // Optional grouping metadata used by the Thinkers list. Existing entries fall
  // back to the maps in the screen; all newer entries set these directly.
  category?: 'ANCIENT' | 'MEDIEVAL' | 'MODERN' | 'CONTEMPORARY' | 'EASTERN';
  country?: string; // short modern/historical place, e.g. 'Greece', 'Persia'
}

const BASE_PHILOSOPHERS: Philosopher[] = [
  {
    id: 'socrates',
    name: 'Socrates',
    lifespan: '470–399 BCE',
    era: 'Classical Athens',
    symbol: '🏛️',
    oneLiner: 'Question everything; admit how little you know.',
    bio: "Socrates was an Athenian thinker who wrote nothing down, choosing instead to wander the marketplace and quiz his fellow citizens about courage, justice, and the good life. By relentlessly asking questions, he exposed how often people only think they understand big ideas. His method of probing assumptions, now called the Socratic method, still shapes how we teach and argue today. He was eventually put on trial and sentenced to death for supposedly corrupting the youth, becoming history's most famous martyr for free inquiry.",
    areas: ['Ethics', 'Epistemology'],
    branchSlugs: ['epistemology', 'ethics'],
    quotes: [
      { id: 'socrates-1', text: 'The unexamined life is not worth living.' },
      { id: 'socrates-2', text: 'I know that I know nothing.' },
      { id: 'socrates-3', text: 'There is only one good, knowledge, and one evil, ignorance.' },
      { id: 'socrates-4', text: 'The only true wisdom is in knowing you know nothing.' },
      { id: 'socrates-5', text: 'I cannot teach anybody anything. I can only make them think.' },
    ],
  },
  {
    id: 'plato',
    name: 'Plato',
    lifespan: '428–348 BCE',
    era: 'Classical Athens',
    symbol: '🕳️',
    oneLiner: 'Reality hides behind the world we see.',
    bio: "Plato was a student of Socrates who turned his teacher's conversations into written dialogues, preserving them for all time. He founded the Academy in Athens, often called the first university in the Western world. His famous Allegory of the Cave argues that the everyday world is just a shadow of deeper, perfect truths he called the Forms. From politics to love to knowledge, almost every later Western philosopher has been responding to ideas Plato raised first.",
    areas: ['Metaphysics', 'Epistemology', 'Political Philosophy'],
    branchSlugs: ['metaphysics', 'epistemology', 'political-philosophy'],
    quotes: [
      { id: 'plato-1', text: 'Wise men speak because they have something to say; fools because they have to say something.' },
      { id: 'plato-2', text: 'The measure of a man is what he does with power.' },
      { id: 'plato-3', text: 'Necessity is the mother of invention.' },
      { id: 'plato-4', text: 'Human behavior flows from three main sources: desire, emotion, and knowledge.' },
      { id: 'plato-5', text: 'The beginning is the most important part of the work.' },
    ],
  },
  {
    id: 'aristotle',
    name: 'Aristotle',
    lifespan: '384–322 BCE',
    era: 'Classical Greece',
    symbol: '📐',
    oneLiner: 'Virtue is a habit; excellence is practice.',
    bio: "Aristotle studied under Plato but broke away to build his own sweeping system of thought, covering everything from biology and physics to ethics and drama. He invented formal logic, giving us the first rules for valid reasoning that lasted over two thousand years. His ethics centered on the idea that a good life means cultivating good habits and finding the balanced middle path between extremes. He also tutored a young Alexander the Great, linking one of history's greatest minds to one of its greatest conquerors.",
    areas: ['Logic', 'Ethics', 'Metaphysics'],
    branchSlugs: ['logic', 'ethics', 'metaphysics'],
    quotes: [
      { id: 'aristotle-1', text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.' },
      { id: 'aristotle-2', text: 'Knowing yourself is the beginning of all wisdom.' },
      { id: 'aristotle-3', text: 'It is the mark of an educated mind to be able to entertain a thought without accepting it.' },
      { id: 'aristotle-4', text: 'The whole is greater than the sum of its parts.' },
      { id: 'aristotle-5', text: 'Happiness depends upon ourselves.' },
    ],
  },
  {
    id: 'confucius',
    name: 'Confucius',
    lifespan: '551–479 BCE',
    era: 'Ancient China',
    symbol: '☯️',
    oneLiner: 'Treat others well; harmony begins at home.',
    bio: "Confucius was a Chinese teacher whose ideas about respect, family, and good conduct have shaped East Asian culture for over two thousand years. He lived in a time of social chaos and taught that a stable society depends on people behaving virtuously in their relationships and roles. His sayings, collected by students in a book called the Analects, stress sincerity, learning, and treating others as you wish to be treated. His influence reached far beyond philosophy into government, education, and everyday manners across much of Asia.",
    areas: ['Ethics', 'Political Philosophy'],
    branchSlugs: ['ethics', 'political-philosophy'],
    quotes: [
      { id: 'confucius-1', text: 'Do not impose on others what you do not wish for yourself.' },
      { id: 'confucius-2', text: 'It does not matter how slowly you go as long as you do not stop.' },
      { id: 'confucius-3', text: 'Real knowledge is to know the extent of one’s ignorance.' },
      { id: 'confucius-4', text: 'When you see a good person, think of becoming like them. When you see someone not so good, reflect on your own weak points.' },
      { id: 'confucius-5', text: 'The man who moves a mountain begins by carrying away small stones.' },
    ],
  },
  {
    id: 'epicurus',
    name: 'Epicurus',
    lifespan: '341–270 BCE',
    era: 'Hellenistic Greece',
    symbol: '🌿',
    oneLiner: 'Seek simple pleasures; avoid needless fear and pain.',
    bio: "Epicurus founded a school in Athens, called the Garden, where friends gathered to pursue a calm and contented life. Despite the modern meaning of epicurean, he taught that true pleasure comes not from luxury but from simple joys, good friendships, and freedom from anxiety. He argued that we should not fear death, since when we exist death is not here, and when death is here we no longer exist. His gentle, down-to-earth philosophy offered ancient people a practical recipe for peace of mind.",
    areas: ['Ethics'],
    branchSlugs: ['ethics'],
    quotes: [
      { id: 'epicurus-1', text: 'Death is nothing to us, since when we exist, death is not present, and when death is present, we do not exist.' },
      { id: 'epicurus-2', text: 'Do not spoil what you have by desiring what you have not.' },
      { id: 'epicurus-3', text: 'Not what we have but what we enjoy constitutes our abundance.' },
      { id: 'epicurus-4', text: 'He who is not satisfied with a little is satisfied with nothing.' },
      { id: 'epicurus-5', text: 'Of all the means to ensure happiness throughout the whole of life, by far the most important is friendship.' },
    ],
  },
  {
    id: 'marcus-aurelius',
    name: 'Marcus Aurelius',
    lifespan: '121–180 CE',
    era: 'Roman Empire',
    symbol: '🛡️',
    oneLiner: 'Control your mind; accept what you cannot change.',
    bio: "Marcus Aurelius was a Roman emperor who ruled one of the largest empires in history, yet he is remembered most for a private journal he never meant to publish. That journal, now called the Meditations, records his daily efforts to stay calm, fair, and humble while carrying enormous responsibility. He was a follower of Stoicism, the philosophy that teaches us to focus only on what is within our control and to accept the rest with grace. His honest, self-critical reflections make him one of the most relatable thinkers of the ancient world.",
    areas: ['Ethics', 'Stoicism'],
    branchSlugs: ['ethics'],
    quotes: [
      { id: 'marcus-aurelius-1', text: 'You have power over your mind, not outside events. Realize this, and you will find strength.' },
      { id: 'marcus-aurelius-2', text: 'The happiness of your life depends upon the quality of your thoughts.' },
      { id: 'marcus-aurelius-3', text: 'Waste no more time arguing about what a good man should be. Be one.' },
      { id: 'marcus-aurelius-4', text: 'The best revenge is to be unlike him who performed the injury.' },
      { id: 'marcus-aurelius-5', text: 'When you arise in the morning, think of what a precious privilege it is to be alive.' },
    ],
  },
  {
    id: 'thomas-aquinas',
    name: 'Thomas Aquinas',
    lifespan: '1225–1274',
    era: 'Medieval Europe',
    symbol: '✝️',
    oneLiner: 'Faith and reason can work in harmony.',
    bio: "Thomas Aquinas was a medieval Italian monk and scholar who set out to show that religious faith and rational thought need not be enemies. Drawing heavily on Aristotle, whose works were newly rediscovered in his era, he built a vast system connecting philosophy with Christian theology. His masterwork, the Summa Theologica, tackled enormous questions about God, morality, and the natural world with careful step-by-step reasoning. His ideas remain central to Catholic thought and influenced how the West thinks about law, ethics, and the existence of God.",
    areas: ['Metaphysics', 'Ethics'],
    branchSlugs: ['metaphysics', 'ethics'],
    quotes: [
      { id: 'thomas-aquinas-1', text: 'To one who has faith, no explanation is necessary. To one without faith, no explanation is possible.' },
      { id: 'thomas-aquinas-2', text: 'There is nothing on this earth more to be prized than true friendship.' },
      { id: 'thomas-aquinas-3', text: 'Wonder is the desire for knowledge.' },
      { id: 'thomas-aquinas-4', text: 'Better to illuminate than merely to shine, to deliver to others contemplated truths than merely to contemplate.' },
      { id: 'thomas-aquinas-5', text: 'The things that we love tell us what we are.' },
    ],
  },
  {
    id: 'rene-descartes',
    name: 'René Descartes',
    lifespan: '1596–1650',
    era: 'Scientific Revolution France',
    symbol: '🧠',
    oneLiner: 'I think, therefore I am.',
    bio: "René Descartes was a French thinker often called the father of modern philosophy for daring to doubt everything he had ever been taught. He wanted to find at least one belief so certain it could not be questioned, and concluded that the very act of doubting proved his own existence as a thinking being. This led to his famous line, I think, therefore I am. A brilliant mathematician too, he also invented the coordinate system that links algebra and geometry, which students still use today.",
    areas: ['Epistemology', 'Metaphysics'],
    branchSlugs: ['epistemology', 'metaphysics'],
    quotes: [
      { id: 'rene-descartes-1', text: 'I think, therefore I am.' },
      { id: 'rene-descartes-2', text: 'It is not enough to have a good mind; the main thing is to use it well.' },
      { id: 'rene-descartes-3', text: 'If you would be a real seeker after truth, it is necessary that at least once in your life you doubt, as far as possible, all things.' },
      { id: 'rene-descartes-4', text: 'The reading of all good books is like a conversation with the finest minds of past centuries.' },
      { id: 'rene-descartes-5', text: 'Doubt is the origin of wisdom.' },
    ],
  },
  {
    id: 'baruch-spinoza',
    name: 'Baruch Spinoza',
    lifespan: '1632–1677',
    era: 'Dutch Golden Age',
    symbol: '🔷',
    oneLiner: 'God and nature are one and the same.',
    bio: "Baruch Spinoza was a Dutch philosopher who ground lenses for a living while quietly developing some of the boldest ideas of his age. He argued that God and the universe are not separate, but a single infinite substance, a view so radical that his own community expelled him for it. He believed that understanding the world clearly is the path to inner freedom and lasting peace. Once controversial and shunned, he is now celebrated as a pioneer of free thought and a hero to later scientists and philosophers.",
    areas: ['Metaphysics', 'Ethics'],
    branchSlugs: ['metaphysics', 'ethics'],
    quotes: [
      { id: 'baruch-spinoza-1', text: 'I have striven not to laugh at human actions, not to weep at them, nor to hate them, but to understand them.' },
      { id: 'baruch-spinoza-2', text: 'Peace is not an absence of war, it is a virtue, a state of mind, a disposition for benevolence, confidence, justice.' },
      { id: 'baruch-spinoza-3', text: 'The highest activity a human being can attain is learning for understanding, because to understand is to be free.' },
      { id: 'baruch-spinoza-4', text: 'Fear cannot be without hope nor hope without fear.' },
      { id: 'baruch-spinoza-5', text: 'Those who are governed by reason desire nothing for themselves which they do not also desire for the rest of humankind.' },
    ],
  },
  {
    id: 'john-locke',
    name: 'John Locke',
    lifespan: '1632–1704',
    era: 'Enlightenment England',
    symbol: '🪶',
    oneLiner: 'The mind starts as a blank slate.',
    bio: "John Locke was an English thinker whose ideas helped shape modern democracy and the way we understand the human mind. He argued that we are born without built-in ideas, like a blank slate, and that all knowledge comes from experience. In politics, he insisted that governments exist to protect people's natural rights to life, liberty, and property, and that citizens may resist rulers who fail them. These ideas deeply influenced the American Declaration of Independence and the broader spread of liberal democracy.",
    areas: ['Epistemology', 'Political Philosophy'],
    branchSlugs: ['epistemology', 'political-philosophy'],
    quotes: [
      { id: 'john-locke-1', text: 'No man’s knowledge here can go beyond his experience.' },
      { id: 'john-locke-2', text: 'The only fence against the world is a thorough knowledge of it.' },
      { id: 'john-locke-3', text: 'Reading furnishes the mind only with materials of knowledge; it is thinking that makes what we read ours.' },
      { id: 'john-locke-4', text: 'All mankind, being all equal and independent, no one ought to harm another in his life, health, liberty, or possessions.' },
      { id: 'john-locke-5', text: 'New opinions are always suspected, and usually opposed, without any other reason but because they are not already common.' },
    ],
  },
  {
    id: 'david-hume',
    name: 'David Hume',
    lifespan: '1711–1776',
    era: 'Scottish Enlightenment',
    symbol: '🔥',
    oneLiner: 'Trust experience, and question every easy certainty.',
    bio: "David Hume was a Scottish philosopher famous for his sharp skepticism and his insistence that we base our beliefs on experience rather than wishful thinking. He pointed out that just because the sun has risen every day, we cannot logically prove it will rise tomorrow, shaking confidence in cause and effect. He also argued that reason alone cannot motivate us to act, since our choices are ultimately driven by feelings and desires. Calm, witty, and good-humored, he influenced nearly every philosopher who came after him, including Kant.",
    areas: ['Epistemology'],
    branchSlugs: ['epistemology'],
    quotes: [
      { id: 'david-hume-1', text: 'A wise man proportions his belief to the evidence.' },
      { id: 'david-hume-2', text: 'Reason is, and ought only to be, the slave of the passions.' },
      { id: 'david-hume-3', text: 'Beauty in things exists in the mind which contemplates them.' },
      { id: 'david-hume-4', text: 'Custom is the great guide of human life.' },
      { id: 'david-hume-5', text: 'Truth springs from argument amongst friends.' },
    ],
  },
  {
    id: 'immanuel-kant',
    name: 'Immanuel Kant',
    lifespan: '1724–1804',
    era: 'Enlightenment Germany',
    symbol: '⚖️',
    oneLiner: 'Act only as you would want everyone to.',
    bio: "Immanuel Kant was a German philosopher who lived such a regular routine that neighbors reportedly set their clocks by his daily walk. He revolutionized philosophy by arguing that the mind actively shapes our experience of reality, rather than simply receiving it. In ethics, he proposed the categorical imperative: act only on rules you could wish everyone to follow. His demanding, carefully argued books are difficult, but his ideas about duty, dignity, and reason still anchor much of modern moral and political thought.",
    areas: ['Ethics', 'Epistemology', 'Aesthetics'],
    branchSlugs: ['ethics', 'epistemology', 'aesthetics'],
    quotes: [
      { id: 'immanuel-kant-1', text: 'Act only according to that maxim whereby you can at the same time will that it should become a universal law.' },
      { id: 'immanuel-kant-2', text: 'Two things fill the mind with ever new and increasing admiration and awe: the starry heavens above me and the moral law within me.' },
      { id: 'immanuel-kant-3', text: 'Science is organized knowledge. Wisdom is organized life.' },
      { id: 'immanuel-kant-4', text: 'We are not rich by what we possess but by what we can do without.' },
      { id: 'immanuel-kant-5', text: 'Out of the crooked timber of humanity, no straight thing was ever made.' },
    ],
  },
  {
    id: 'jean-jacques-rousseau',
    name: 'Jean-Jacques Rousseau',
    lifespan: '1712–1778',
    era: 'Enlightenment France',
    symbol: '🌳',
    oneLiner: 'Society corrupts a naturally good humanity.',
    bio: "Jean-Jacques Rousseau was a Swiss-French writer whose ideas helped spark the French Revolution and reshaped how we think about freedom and society. He famously argued that people are born good and free but are corrupted by the inequalities of civilization. In his book The Social Contract, he proposed that legitimate government rests on the collective will of the people. His passionate, personal writing also pioneered modern ideas about childhood, education, and the value of authentic feeling.",
    areas: ['Political Philosophy'],
    branchSlugs: ['political-philosophy'],
    quotes: [
      { id: 'jean-jacques-rousseau-1', text: 'Man is born free, and everywhere he is in chains.' },
      { id: 'jean-jacques-rousseau-2', text: 'The world of reality has its limits; the world of imagination is boundless.' },
      { id: 'jean-jacques-rousseau-3', text: 'People who know little are usually great talkers, while men who know much say little.' },
      { id: 'jean-jacques-rousseau-4', text: 'I prefer liberty with danger than peace with slavery.' },
      { id: 'jean-jacques-rousseau-5', text: 'Patience is bitter, but its fruit is sweet.' },
    ],
  },
  {
    id: 'georg-hegel',
    name: 'Georg Hegel',
    lifespan: '1770–1831',
    era: 'German Idealism',
    symbol: '🌀',
    oneLiner: 'History advances through clashing ideas resolving forward.',
    bio: "Georg Wilhelm Friedrich Hegel was a German philosopher who saw all of reality and history as a single unfolding process moving toward greater freedom and self-understanding. He believed progress happens through conflict, as ideas clash and combine into richer new ideas, a pattern later summarized as thesis, antithesis, and synthesis. His dense, ambitious writing tried to capture the whole sweep of human thought and culture. Though notoriously difficult, he deeply influenced later thinkers, most famously Karl Marx, who borrowed and reworked his method.",
    areas: ['Metaphysics'],
    branchSlugs: ['metaphysics'],
    quotes: [
      { id: 'georg-hegel-1', text: 'We learn from history that we do not learn from history.' },
      { id: 'georg-hegel-2', text: 'Nothing great in the world has ever been accomplished without passion.' },
      { id: 'georg-hegel-3', text: 'To be independent of public opinion is the first formal condition of achieving anything great.' },
      { id: 'georg-hegel-4', text: 'The owl of Minerva spreads its wings only with the falling of the dusk.' },
      { id: 'georg-hegel-5', text: 'Education is the art of making man ethical.' },
    ],
  },
  {
    id: 'john-stuart-mill',
    name: 'John Stuart Mill',
    lifespan: '1806–1873',
    era: 'Victorian Britain',
    symbol: '🗽',
    oneLiner: 'Maximize happiness; protect each person’s liberty.',
    bio: "John Stuart Mill was an English philosopher and reformer who championed individual freedom and the greatest happiness for the greatest number. Raised by a demanding father to be a thinker from childhood, he became a leading voice for liberty, free speech, and the rights of the individual. In his book On Liberty, he argued that people should be free to do as they wish so long as they harm no one else. He was also an early and forceful supporter of women's rights and democratic reform.",
    areas: ['Ethics', 'Political Philosophy'],
    branchSlugs: ['ethics', 'political-philosophy'],
    quotes: [
      { id: 'john-stuart-mill-1', text: 'Over himself, over his own body and mind, the individual is sovereign.' },
      { id: 'john-stuart-mill-2', text: 'It is better to be a human being dissatisfied than a pig satisfied; better to be Socrates dissatisfied than a fool satisfied.' },
      { id: 'john-stuart-mill-3', text: 'The only freedom which deserves the name is that of pursuing our own good in our own way.' },
      { id: 'john-stuart-mill-4', text: 'A person may cause evil to others not only by his actions but by his inaction, and in either case he is justly accountable to them for the injury.' },
      { id: 'john-stuart-mill-5', text: 'He who knows only his own side of the case knows little of that.' },
    ],
  },
  {
    id: 'karl-marx',
    name: 'Karl Marx',
    lifespan: '1818–1883',
    era: 'Industrial Europe',
    symbol: '⚒️',
    oneLiner: 'History is a struggle between economic classes.',
    bio: "Karl Marx was a German philosopher, economist, and revolutionary whose ideas shaped politics across the entire twentieth century. He argued that history is driven by struggles between economic classes, and that capitalism would eventually be overturned by the workers it exploited. With his collaborator Friedrich Engels, he wrote The Communist Manifesto, a fiery call for the working class to unite. Whether admired or opposed, his analysis of work, money, and power still influences debates about inequality and the economy today.",
    areas: ['Political Philosophy'],
    branchSlugs: ['political-philosophy'],
    quotes: [
      { id: 'karl-marx-1', text: 'The philosophers have only interpreted the world in various ways; the point is to change it.' },
      { id: 'karl-marx-2', text: 'Workers of the world, unite! You have nothing to lose but your chains.' },
      { id: 'karl-marx-3', text: 'Religion is the opium of the people.' },
      { id: 'karl-marx-4', text: 'From each according to his ability, to each according to his needs.' },
      { id: 'karl-marx-5', text: 'The history of all hitherto existing society is the history of class struggles.' },
    ],
  },
  {
    id: 'friedrich-nietzsche',
    name: 'Friedrich Nietzsche',
    lifespan: '1844–1900',
    era: '19th-Century Germany',
    symbol: '⚡',
    oneLiner: 'Create your own values; embrace life fully.',
    bio: "Friedrich Nietzsche was a German philosopher known for his bold, provocative challenges to traditional morality and religion. He famously declared that God is dead, meaning that old certainties had lost their grip and people must now create their own meaning and values. He urged individuals to embrace life passionately and to become who they truly are rather than follow the herd. Written in vivid, poetic bursts, his ideas have inspired and unsettled artists, writers, and thinkers ever since.",
    areas: ['Ethics', 'Aesthetics', 'Existentialism'],
    branchSlugs: ['ethics', 'aesthetics'],
    quotes: [
      { id: 'friedrich-nietzsche-1', text: 'That which does not kill us makes us stronger.' },
      { id: 'friedrich-nietzsche-2', text: 'He who has a why to live can bear almost any how.' },
      { id: 'friedrich-nietzsche-3', text: 'Without music, life would be a mistake.' },
      { id: 'friedrich-nietzsche-4', text: 'And those who were seen dancing were thought to be insane by those who could not hear the music.' },
      { id: 'friedrich-nietzsche-5', text: 'He who fights with monsters should be careful lest he thereby become a monster.' },
    ],
  },
  {
    id: 'ludwig-wittgenstein',
    name: 'Ludwig Wittgenstein',
    lifespan: '1889–1951',
    era: '20th-Century Britain & Austria',
    symbol: '🗣️',
    oneLiner: 'The limits of language are the limits of thought.',
    bio: "Ludwig Wittgenstein was an Austrian-British philosopher who believed that many deep philosophical puzzles are really confusions about language. In his early work, he argued that the limits of our language mark the limits of our world. Later he changed his mind, suggesting that words get their meaning from how they are actually used in everyday life, like moves in a game. Intense and uncompromising, he gave away a family fortune and is widely regarded as one of the most influential thinkers of the twentieth century.",
    areas: ['Logic', 'Epistemology'],
    branchSlugs: ['logic', 'epistemology'],
    quotes: [
      { id: 'ludwig-wittgenstein-1', text: 'The limits of my language mean the limits of my world.' },
      { id: 'ludwig-wittgenstein-2', text: 'Whereof one cannot speak, thereof one must be silent.' },
      { id: 'ludwig-wittgenstein-3', text: 'A picture held us captive. And we could not get outside it, for it lay in our language.' },
      { id: 'ludwig-wittgenstein-4', text: 'Philosophy is a battle against the bewitchment of our intelligence by means of language.' },
      { id: 'ludwig-wittgenstein-5', text: 'If people never did silly things nothing intelligent would ever get done.' },
    ],
  },
  {
    id: 'jean-paul-sartre',
    name: 'Jean-Paul Sartre',
    lifespan: '1905–1980',
    era: '20th-Century France',
    symbol: '🚬',
    oneLiner: 'You are free, and condemned to choose.',
    bio: "Jean-Paul Sartre was a French philosopher and writer who became the public face of existentialism in the mid-twentieth century. He argued that humans have no fixed nature or preset purpose; instead, we exist first and then define ourselves through our choices. This radical freedom, he said, comes with heavy responsibility, since we cannot blame anyone else for who we become. A novelist and playwright as well as a philosopher, he turned down the Nobel Prize in Literature and remained a fierce political voice throughout his life.",
    areas: ['Existentialism', 'Metaphysics', 'Ethics'],
    branchSlugs: ['metaphysics', 'ethics'],
    quotes: [
      { id: 'jean-paul-sartre-1', text: 'Man is condemned to be free.' },
      { id: 'jean-paul-sartre-2', text: 'Existence precedes essence.' },
      { id: 'jean-paul-sartre-3', text: 'We are our choices.' },
      { id: 'jean-paul-sartre-4', text: 'Hell is other people.' },
      { id: 'jean-paul-sartre-5', text: 'Freedom is what you do with what has been done to you.' },
    ],
  },
  {
    id: 'simone-de-beauvoir',
    name: 'Simone de Beauvoir',
    lifespan: '1908–1986',
    era: '20th-Century France',
    symbol: '♀️',
    oneLiner: 'One is not born, but becomes, a woman.',
    bio: "Simone de Beauvoir was a French philosopher and writer who helped lay the foundations of modern feminism. In her landmark book The Second Sex, she argued that womanhood is not a fixed biological destiny but a role shaped by society, captured in her famous line that one is not born, but rather becomes, a woman. Drawing on existentialism, she insisted that women, like all people, are free to define themselves through their own choices. A celebrated novelist and essayist, she remains a powerful inspiration for thinking about freedom, equality, and identity.",
    areas: ['Existentialism', 'Ethics', 'Political Philosophy'],
    branchSlugs: ['ethics', 'political-philosophy'],
    quotes: [
      { id: 'simone-de-beauvoir-1', text: 'One is not born, but rather becomes, a woman.' },
      { id: 'simone-de-beauvoir-2', text: 'Change your life today. Don’t gamble on the future, act now, without delay.' },
      { id: 'simone-de-beauvoir-3', text: 'I am too intelligent, too demanding, and too resourceful for anyone to be able to take charge of me entirely.' },
      { id: 'simone-de-beauvoir-4', text: 'One’s life has value so long as one attributes value to the life of others, by means of love, friendship, indignation, and compassion.' },
      { id: 'simone-de-beauvoir-5', text: 'To will oneself free is also to will others free.' },
    ],
  },
];

// Base thinkers plus the broader canon (ancient, eastern, medieval, modern,
// contemporary) and the expansions — ~320 philosophers in total.
const RAW_PHILOSOPHERS: Philosopher[] = [
  ...BASE_PHILOSOPHERS,
  ...ANCIENT_EXTRA,
  ...EASTERN_EXTRA,
  ...MEDIEVAL_EXTRA,
  ...MODERN_EXTRA,
  ...CONTEMPORARY_EXTRA,
  ...EXPANSION_EXTRA,
  ...EXPANSION2A_EXTRA,
  ...EXPANSION2B_EXTRA,
  ...EXPANSION3_EXTRA,
  ...EXPANSION4_EXTRA,
];

// Merge in the verified extra quotes (see philosopherQuotesExtra.ts). Appended
// after each thinker's base quotes, so the first few stay their signature lines.
export const ALL_PHILOSOPHERS: Philosopher[] = RAW_PHILOSOPHERS.map((p) => {
  const extra = PHILOSOPHER_QUOTES_EXTRA[p.id];
  return extra && extra.length ? { ...p, quotes: [...p.quotes, ...extra] } : p;
});

export function getPhilosopherById(id: string): Philosopher | undefined {
  return ALL_PHILOSOPHERS.find((p) => p.id === id);
}

// ─── Era grouping ────────────────────────────────────────────────────────────
//
// The twenty original thinkers predate the optional `category` field, so they
// need this fallback map. It used to live inside the Thinkers screen, which was
// fine while the screen was the only reader — but the badge that asks "have you
// met someone from all five eras" has to group them exactly the way the screen
// does, and a second copy of a lookup is a second copy that can drift. One map,
// one function, both callers.

export const ERA_GROUPS = ['ANCIENT', 'MEDIEVAL', 'MODERN', 'CONTEMPORARY', 'EASTERN'] as const;
export type EraGroup = (typeof ERA_GROUPS)[number];

const LEGACY_GROUP: Record<string, EraGroup> = {
  socrates: 'ANCIENT',
  plato: 'ANCIENT',
  aristotle: 'ANCIENT',
  epicurus: 'ANCIENT',
  'marcus-aurelius': 'ANCIENT',
  confucius: 'EASTERN',
  'thomas-aquinas': 'MEDIEVAL',
  'rene-descartes': 'MODERN',
  'baruch-spinoza': 'MODERN',
  'john-locke': 'MODERN',
  'david-hume': 'MODERN',
  'immanuel-kant': 'MODERN',
  'jean-jacques-rousseau': 'MODERN',
  'georg-hegel': 'MODERN',
  'john-stuart-mill': 'MODERN',
  'karl-marx': 'MODERN',
  'friedrich-nietzsche': 'MODERN',
  'ludwig-wittgenstein': 'CONTEMPORARY',
  'jean-paul-sartre': 'CONTEMPORARY',
  'simone-de-beauvoir': 'CONTEMPORARY',
};

/** Prefer the thinker's own `category`; fall back to the legacy map. */
export const eraGroupOf = (p: Philosopher): EraGroup =>
  (p.category as EraGroup | undefined) ?? LEGACY_GROUP[p.id] ?? 'MODERN';

/** Same answer, by id — for callers that only hold the id (the badge stats). */
export function eraGroupOfId(id: string): EraGroup | null {
  const p = getPhilosopherById(id);
  return p ? eraGroupOf(p) : null;
}
