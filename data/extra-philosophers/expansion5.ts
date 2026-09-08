import type { Philosopher } from '../philosophers';

// THE ARC FROM BOOLE TO TURING, which the roster did not have.
//
// Logic carried 66 thinkers and every one of the classical names — Aristotle,
// Chrysippus, Ockham, Buridan, Abelard, the Nyaya logicians, al-Farabi — plus
// the twentieth-century philosophers of logic: Frege, Russell, Wittgenstein,
// Gödel, Tarski, Quine, Kripke. What was missing was the century in between, in
// which logic stopped being a part of philosophy and became a mathematics.
//
// Russell was here and his PRINCIPIA CO-AUTHOR was not. Gödel was here and the
// programme he broke was not. Cantor's paradise was quoted by nobody who built
// it. These six are that gap: the algebra of thought, the arithmetisation of
// the infinite, the formalist programme, the theory of truth as a linguistic
// muddle, and the machine that ended the Entscheidungsproblem.
//
// Every quotation here was looked up rather than recalled. Two commits ago the
// roster was found crediting Bentham's sentence to Singer and Kant's to Berlin,
// and §13 makes authenticity the whole pitch of this content — so the standard
// for a new entry is the same as the standard for a correction.
export const EXPANSION5_EXTRA: Philosopher[] = [
  {
    id: 'george-boole',
    name: 'George Boole',
    lifespan: '1815–1864',
    era: 'Victorian England',
    symbol: '🔣',
    oneLiner: 'Turned the laws of thought into algebra.',
    bio: 'George Boole was a largely self-taught English mathematician who asked whether reasoning itself could be written down as calculation. His answer was an algebra in which the symbols stand for classes of things and the operations stand for and, or and not — so that an argument could be checked the way a sum is checked. He believed he was not inventing a tool but uncovering the actual laws by which the mind works. The algebra sat almost unused for seventy years, until it turned out to describe exactly what an electrical switch does.',
    areas: ['Logic', 'Mathematics', 'Philosophy of Mind'],
    branchSlugs: ['logic', 'epistemology'],
    category: 'MODERN',
    country: 'England',
    quotes: [
      { id: 'george-boole-1', text: 'The design of the following treatise is to investigate the fundamental laws of those operations of the mind by which reasoning is performed.' },
      { id: 'george-boole-2', text: 'It is not of the essence of mathematics to be conversant with the ideas of number and quantity.' },
      { id: 'george-boole-3', text: 'That which renders Logic possible, is the existence in our minds of general notions — our ability to conceive of a class, and to designate its individual members by a common name.' },
      { id: 'george-boole-4', text: 'No general method for the solution of questions in the theory of probabilities can be established which does not explicitly recognise those universal laws of thought which are the basis of all reasoning.' },
    ],
  },
  {
    id: 'alfred-north-whitehead',
    name: 'Alfred North Whitehead',
    lifespan: '1861–1947',
    era: 'England & USA, 19th–20th c.',
    symbol: '🌌',
    oneLiner: 'Reality is made of processes, not things.',
    bio: 'Alfred North Whitehead spent ten years with his former student Bertrand Russell writing the Principia Mathematica, an attempt to derive the whole of arithmetic from logic alone. Then, in his sixties, he moved to America and began a second career in philosophy from almost nothing. His late work argues that the basic furniture of the world is not objects sitting still but events happening — that becoming is more fundamental than being. He wrote about education and civilisation with the same conviction that thinking well is a practical matter.',
    areas: ['Logic', 'Metaphysics', 'Philosophy of Education'],
    branchSlugs: ['logic', 'metaphysics', 'epistemology'],
    category: 'MODERN',
    country: 'England',
    quotes: [
      { id: 'alfred-north-whitehead-1', text: 'The safest general characterization of the European philosophical tradition is that it consists of a series of footnotes to Plato.' },
      { id: 'alfred-north-whitehead-2', text: 'Civilization advances by extending the number of important operations which we can perform without thinking about them.' },
      { id: 'alfred-north-whitehead-3', text: 'It is a profoundly erroneous truism, repeated by all copy-books and by eminent people when they are making speeches, that we should cultivate the habit of thinking of what we are doing. The precise opposite is the case.' },
      { id: 'alfred-north-whitehead-4', text: 'We think in generalities, but we live in detail.' },
      { id: 'alfred-north-whitehead-5', text: 'Seek simplicity and distrust it.' },
    ],
  },
  {
    id: 'georg-cantor',
    name: 'Georg Cantor',
    lifespan: '1845–1918',
    era: 'Imperial Germany',
    symbol: '♾️',
    oneLiner: 'Proved some infinities are bigger than others.',
    bio: 'Georg Cantor discovered that infinity comes in sizes. By pairing off the members of one endless collection against another, he showed that the decimals cannot be matched one-for-one with the counting numbers — so there are strictly more of them, and no way to list them all. The result was so unwelcome that his old teacher Kronecker campaigned against it for years, and Cantor spent much of his later life ill and embattled. The set theory he built underneath it became the foundation on which most of modern mathematics is written.',
    areas: ['Logic', 'Mathematics', 'Metaphysics'],
    branchSlugs: ['logic', 'metaphysics'],
    category: 'MODERN',
    country: 'Germany',
    quotes: [
      { id: 'georg-cantor-1', text: 'The essence of mathematics lies in its freedom.' },
      { id: 'georg-cantor-2', text: 'In mathematics the art of proposing a question must be held of higher value than solving it.' },
      { id: 'georg-cantor-3', text: 'I see it, but I don’t believe it.' },
      { id: 'georg-cantor-4', text: 'A set is a Many that allows itself to be thought of as a One.' },
    ],
  },
  {
    id: 'david-hilbert',
    name: 'David Hilbert',
    lifespan: '1862–1943',
    era: 'Göttingen, Germany',
    symbol: '🏛️',
    oneLiner: 'Wanted every mathematical truth provable from axioms.',
    bio: 'David Hilbert opened the twentieth century by naming twenty-three unsolved problems and daring mathematicians to finish them. His larger ambition was a programme: put all of mathematics on a finite set of axioms and prove, once and for all, that no contradiction could ever be derived from them. He insisted the symbols themselves carry no meaning — what matters is the rules for moving them — which is why he said the words could as well be tables, chairs and beer mugs. Gödel showed the programme could not succeed, and the failure turned out to be one of the most productive results in the history of logic.',
    areas: ['Logic', 'Mathematics', 'Foundations'],
    branchSlugs: ['logic', 'epistemology'],
    category: 'MODERN',
    country: 'Germany',
    quotes: [
      { id: 'david-hilbert-1', text: 'We must know. We will know.' },
      { id: 'david-hilbert-2', text: 'No one shall expel us from the paradise that Cantor has created.' },
      { id: 'david-hilbert-3', text: 'One must be able to say at all times — instead of points, straight lines and planes — tables, chairs and beer mugs.' },
      { id: 'david-hilbert-4', text: 'Mathematics knows no races or geographic boundaries; for mathematics, the cultural world is one country.' },
    ],
  },
  {
    id: 'frank-ramsey',
    name: 'Frank Ramsey',
    lifespan: '1903–1930',
    era: 'Cambridge, England',
    symbol: '🎲',
    oneLiner: 'Belief is how much you would bet on it.',
    bio: 'Frank Ramsey did the work of a long career in about eight years and died at twenty-six. He argued that calling a statement true adds nothing to simply asserting it — that “it is true that the door is shut” says no more than “the door is shut”. He treated belief as a matter of degree, measurable by the odds you would actually accept, which is the root of how probability is understood today. He also translated Wittgenstein into English while still a teenager, and left behind results that founded whole fields in mathematics and economics.',
    areas: ['Logic', 'Probability', 'Philosophy of Language'],
    branchSlugs: ['logic', 'epistemology', 'metaphysics'],
    category: 'MODERN',
    country: 'England',
    quotes: [
      { id: 'frank-ramsey-1', text: 'The chief danger to our philosophy, apart from laziness and woolliness, is scholasticism, the essence of which is treating what is vague as if it were precise and trying to fit it into an exact logical category.' },
      { id: 'frank-ramsey-2', text: 'There is no separate problem of truth but merely a linguistic muddle.' },
      { id: 'frank-ramsey-3', text: 'My picture of the world is drawn in perspective, and not like a model to scale. The foreground is occupied by human beings and the stars are all as small as threepenny bits.' },
      { id: 'frank-ramsey-4', text: 'Philosophy must be of some use and we must take it seriously; it must clear our thoughts and so our actions.' },
    ],
  },
  {
    id: 'alan-turing',
    name: 'Alan Turing',
    lifespan: '1912–1954',
    era: 'Britain, 20th c.',
    symbol: '🤖',
    oneLiner: 'Asked whether a machine could be said to think.',
    bio: 'Alan Turing settled a question in logic by imagining a machine. To show that some problems cannot be decided by any mechanical procedure, he first had to say exactly what a mechanical procedure is — and his answer, a strip of tape and a set of rules, describes every computer since. During the war he broke German naval ciphers at Bletchley Park. Afterwards he asked whether a machine could think, and replaced that question with one that can actually be tested: whether it could hold a conversation you could not tell from a person’s.',
    areas: ['Logic', 'Philosophy of Mind', 'Computation'],
    branchSlugs: ['logic', 'epistemology', 'metaphysics'],
    category: 'CONTEMPORARY',
    country: 'England',
    quotes: [
      { id: 'alan-turing-1', text: 'I propose to consider the question, “Can machines think?”' },
      { id: 'alan-turing-2', text: 'We can only see a short distance ahead, but we can see plenty there that needs to be done.' },
      { id: 'alan-turing-3', text: 'Instead of trying to produce a programme to simulate the adult mind, why not rather try to produce one which simulates the child’s?' },
      { id: 'alan-turing-4', text: 'Science is a differential equation. Religion is a boundary condition.' },
    ],
  },
];
