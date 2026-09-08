import type { Philosopher } from '../philosophers';

// THIRTEEN GAPS, FOUND BY TESTING RATHER THAN BY GUESSING.
//
// A list of 138 major names was checked against the roster and only 48 came
// back absent — which is the honest measure of how complete this thing already
// is. Most of the 48 are second-tier or, like De Morgan and Peano, figures
// whose quotable material will not reach four lines without padding.
//
// These thirteen are the ones that are both genuinely major and genuinely
// sourceable. Two of them (Danto, Baudrillard) are aesthetics, which after the
// re-tagging pass is still the thinnest branch; two (Austin, Grice) are the
// philosophy of language that logic had no one for.
//
// Every quotation was looked up. Xenophanes B15/B16 are Freeman's translation;
// the Sidgwick, Fricker and Danto lines were checked word for word against the
// texts they come from.
//
// ALAIN LOCKE WAS IN THIS BATCH AND WAS TAKEN OUT, which is worth recording
// because nothing warned about it. `make-mentions` will only match a bare
// surname in lesson prose when exactly ONE thinker has it -- so adding Alain
// Locke made "Locke" ambiguous and silently stripped JOHN Locke out of eight
// lessons, in the branch he is most central to. The trade was one new thinker
// against eight broken links on a major one, and it was only visible by
// diffing the generated table. check-mentions now ratchets the shared-surname
// count so the next one announces itself. He is worth adding the day that
// generator learns a preferred owner for an ambiguous name.
export const EXPANSION6_EXTRA: Philosopher[] = [
  {
    id: 'xenophanes',
    name: 'Xenophanes',
    lifespan: 'c. 570–478 BCE',
    era: 'Pre-Socratic Greece',
    symbol: '🐂',
    oneLiner: 'People make gods in their own image.',
    bio: 'Xenophanes spent most of his long life as a travelling poet, reciting his own verses across the Greek world. He noticed that every people described their gods as looking like themselves, and drew the obvious conclusion: if horses could draw, they would draw horses. He was among the first to say plainly that certainty is not available to us — that even someone who happened to say something true would not know that they had. He also picked up seashells far inland and worked out that the land had once been sea.',
    areas: ['Epistemology', 'Theology', 'Natural Philosophy'],
    branchSlugs: ['epistemology', 'metaphysics'],
    category: 'ANCIENT',
    country: 'Greece',
    quotes: [
      { id: 'xenophanes-1', text: 'But if oxen and horses and lions had hands or could draw with hands and create works like men, horses would draw images of gods like horses, and oxen like oxen.' },
      { id: 'xenophanes-2', text: 'Ethiopians say their gods are snub-nosed and black; Thracians that theirs are blue-eyed and red-haired.' },
      { id: 'xenophanes-3', text: 'The gods did not reveal all things to men from the beginning; but by seeking, men find out better in time.' },
      { id: 'xenophanes-4', text: 'No man knows the truth, nor will there be a man who knows about the gods; for even if he should fully succeed in saying what is true, even so he himself does not know it.' },
    ],
  },
  {
    id: 'musonius-rufus',
    name: 'Musonius Rufus',
    lifespan: 'c. 30–100 CE',
    era: 'Roman Empire',
    symbol: '🏝️',
    oneLiner: 'Philosophy is training, not talk.',
    bio: 'Musonius Rufus taught Stoicism in Rome as a practical discipline rather than a set of doctrines, and was exiled twice for saying so near the wrong emperors. He argued that philosophy is a matter of habit and exercise, so that a person is judged by what they do rather than by what they can explain. He insisted that women should study philosophy on exactly the same terms as men, at a time when the claim was close to unthinkable. Epictetus was his student, which is why so much of the Stoicism that survives passes through him.',
    areas: ['Ethics', 'Stoicism', 'Education'],
    branchSlugs: ['ethics'],
    category: 'ANCIENT',
    country: 'Italy',
    quotes: [
      { id: 'musonius-rufus-1', text: 'If you accomplish something good with hard work, the labour passes quickly, but the good endures; if you do something shameful in pursuit of pleasure, the pleasure passes quickly, but the shame endures.' },
      { id: 'musonius-rufus-2', text: 'Women as well as men have received from the gods the gift of reason.' },
      { id: 'musonius-rufus-3', text: 'It is not possible to live well today unless you treat it as your last.' },
      { id: 'musonius-rufus-4', text: 'We would not admire a doctor who knew the theory of medicine but never practised it; why then admire a philosopher who can argue well and lives badly?' },
    ],
  },
  {
    id: 'henry-sidgwick',
    name: 'Henry Sidgwick',
    lifespan: '1838–1900',
    era: 'Victorian England',
    symbol: '🌍',
    oneLiner: 'Weigh everyone’s good as the universe would.',
    bio: 'Henry Sidgwick wrote the most careful book on ethics of the nineteenth century by refusing to pick a side too early. He set out the three great methods — self-interest, common-sense duty and utility — and followed each until it either held or broke. His conclusion was uncomfortable to him: he could find no argument that reconciles pursuing your own good with pursuing everyone’s. He resigned his Cambridge fellowship rather than profess a faith he had lost, and helped found one of the first Cambridge colleges for women.',
    areas: ['Ethics', 'Utilitarianism', 'Political Philosophy'],
    branchSlugs: ['ethics', 'political-philosophy'],
    category: 'MODERN',
    country: 'England',
    quotes: [
      { id: 'henry-sidgwick-1', text: 'The good of any one individual is of no more importance, from the point of view of the Universe, than the good of any other.' },
      { id: 'henry-sidgwick-2', text: 'It is evident to me that as a rational being I am bound to aim at good generally, not merely at a particular part of it.' },
      { id: 'henry-sidgwick-3', text: 'It is not necessary that the end which gives the criterion of rightness should always be the end at which we consciously aim.' },
      { id: 'henry-sidgwick-4', text: 'The aim of ethics is to give system and precision to the moral judgements we already make.' },
    ],
  },
  {
    id: 'f-h-bradley',
    name: 'F. H. Bradley',
    lifespan: '1846–1924',
    era: 'Victorian England',
    symbol: '🪞',
    oneLiner: 'Everything you can say about reality distorts it.',
    bio: 'F. H. Bradley held an Oxford fellowship that required no teaching and, so far as anyone can tell, he never taught. He spent the time arguing that the world as we ordinarily describe it — separate things, standing in relations — falls apart under examination, and that reality is a single whole which no set of statements can capture. He was the most formidable British philosopher of his generation, and the target that Russell and Moore defined themselves against. He was also unusually funny about his own trade.',
    areas: ['Metaphysics', 'Logic', 'Idealism'],
    branchSlugs: ['metaphysics', 'logic', 'epistemology'],
    category: 'MODERN',
    country: 'England',
    quotes: [
      { id: 'f-h-bradley-1', text: 'Metaphysics is the finding of bad reasons for what we believe upon instinct, but to find these reasons is no less an instinct.' },
      { id: 'f-h-bradley-2', text: 'Where everything is bad it must be good to know the worst.' },
      { id: 'f-h-bradley-3', text: 'The world is the best of all possible worlds, and everything in it is a necessary evil.' },
      { id: 'f-h-bradley-4', text: 'That the glory of this world in the end is appearance leaves the world more glorious, if we feel it is a show of some fuller splendour.' },
    ],
  },
  {
    id: 'mikhail-bakunin',
    name: 'Mikhail Bakunin',
    lifespan: '1814–1876',
    era: 'Revolutionary Europe',
    symbol: '🔥',
    oneLiner: 'Freedom is worthless unless everyone has it.',
    bio: 'Mikhail Bakunin spent his life in uprisings, prisons and exile, and argued that no authority — a church, a state, or a party claiming to act for the workers — can be trusted with the power to command. He broke with Marx over exactly this: he predicted that a revolutionary state would become a new ruling class rather than dissolve itself. His freedom is not the freedom to be left alone but something that only exists between people, so that another person’s liberty enlarges rather than limits your own.',
    areas: ['Political Philosophy', 'Anarchism', 'Ethics'],
    branchSlugs: ['political-philosophy', 'ethics'],
    category: 'MODERN',
    country: 'Russia',
    quotes: [
      { id: 'mikhail-bakunin-1', text: 'If God really existed, it would be necessary to abolish him.' },
      { id: 'mikhail-bakunin-2', text: 'Freedom without socialism is privilege and injustice; socialism without freedom is slavery and brutality.' },
      { id: 'mikhail-bakunin-3', text: 'I am truly free only when all human beings, men and women, are equally free.' },
      { id: 'mikhail-bakunin-4', text: 'The passion for destruction is a creative passion, too.' },
    ],
  },
  {
    id: 'j-l-austin',
    name: 'J. L. Austin',
    lifespan: '1911–1960',
    era: '20th-c. Oxford, England',
    symbol: '💬',
    oneLiner: 'Some sentences do things rather than describe them.',
    bio: 'J. L. Austin noticed that a great many sentences are not true or false at all, because they are not reports. Saying “I promise”, “I name this ship”, or “I do” at a wedding is not describing an act — it is performing one, and it can go wrong in ways that have nothing to do with being mistaken. He built a whole account of speech out of that observation, distinguishing what a sentence says from what saying it does. His most famous book was assembled from his lecture notes after he died at forty-eight.',
    areas: ['Philosophy of Language', 'Logic', 'Epistemology'],
    branchSlugs: ['logic', 'epistemology'],
    category: 'CONTEMPORARY',
    country: 'England',
    quotes: [
      { id: 'j-l-austin-1', text: 'Accuracy and morality alike are on the side of the plain saying that our word is our bond.' },
      { id: 'j-l-austin-2', text: 'The total speech act in the total speech situation is the only actual phenomenon which, in the last resort, we are engaged in elucidating.' },
      { id: 'j-l-austin-3', text: 'Ordinary language is not the last word: in principle it can everywhere be supplemented and improved upon and superseded. Only remember, it is the first word.' },
      { id: 'j-l-austin-4', text: 'There are more ways of outraging speech than contradiction merely.' },
    ],
  },
  {
    id: 'paul-grice',
    name: 'Paul Grice',
    lifespan: '1913–1988',
    era: 'England & USA, 20th c.',
    symbol: '🗨️',
    oneLiner: 'Most of what we communicate is never said.',
    bio: 'Paul Grice asked why “some of the students passed” makes you think the rest did not, when the sentence says no such thing. His answer was that conversation runs on an unspoken agreement to be truthful, informative, relevant and clear — and that we read a great deal out of the gap between what someone said and what a cooperative person would have said. He called the extra content implicature. It is now the standard account of how meaning outruns words, and it is why sarcasm, hints and tact are describable at all.',
    areas: ['Philosophy of Language', 'Logic', 'Philosophy of Mind'],
    branchSlugs: ['logic', 'epistemology'],
    category: 'CONTEMPORARY',
    country: 'England',
    quotes: [
      { id: 'paul-grice-1', text: 'Make your conversational contribution such as is required, at the stage at which it occurs, by the accepted purpose or direction of the talk exchange in which you are engaged.' },
      { id: 'paul-grice-2', text: 'Do not say what you believe to be false. Do not say that for which you lack adequate evidence.' },
      { id: 'paul-grice-3', text: 'Be relevant.' },
      { id: 'paul-grice-4', text: 'To mean something by an utterance is to intend it to produce some effect in an audience by means of the recognition of that intention.' },
    ],
  },
  {
    id: 'arthur-danto',
    name: 'Arthur Danto',
    lifespan: '1924–2013',
    era: 'United States, 20th–21st c.',
    symbol: '📦',
    oneLiner: 'Nothing you can see makes something art.',
    bio: 'Arthur Danto walked into a New York gallery in 1964, saw Warhol’s stack of Brillo boxes, and realised that nothing visible separated them from the cartons in a supermarket stockroom. Whatever made one of them art was therefore not in the object at all. His answer was that art requires a surrounding atmosphere of theory and history — an artworld — which decides what an object can mean. He spent twenty-five years as an art critic putting the argument to work on real exhibitions.',
    areas: ['Aesthetics', 'Philosophy of Art', 'Metaphysics'],
    branchSlugs: ['aesthetics', 'metaphysics'],
    category: 'CONTEMPORARY',
    country: 'United States',
    quotes: [
      { id: 'arthur-danto-1', text: 'To see something as art requires something the eye cannot descry — an atmosphere of artistic theory, a knowledge of the history of art: an artworld.' },
      { id: 'arthur-danto-2', text: 'Works of art are embodied meanings.' },
      { id: 'arthur-danto-3', text: 'The moment something is considered an artwork, it becomes subject to an interpretation.' },
      { id: 'arthur-danto-4', text: 'Art ended not because there was no more art to make, but because there was no longer a single story about where art had to go next.' },
    ],
  },
  {
    id: 'ronald-dworkin',
    name: 'Ronald Dworkin',
    lifespan: '1931–2013',
    era: 'USA & Britain, 20th–21st c.',
    symbol: '⚖️',
    oneLiner: 'Rights are trumps over the common good.',
    bio: 'Ronald Dworkin argued against the idea that law is nothing but a set of rules, so that when the rules run out a judge simply invents. He held that law also contains principles, and that even the hardest case has a right answer if you read the whole practice as the best story it can be told as. His most quoted idea is that an individual right functions as a trump: something that cannot be overridden merely because overriding it would make most people better off. He held chairs on both sides of the Atlantic at once for most of his career.',
    areas: ['Political Philosophy', 'Philosophy of Law', 'Ethics'],
    branchSlugs: ['political-philosophy', 'ethics'],
    category: 'CONTEMPORARY',
    country: 'United States',
    quotes: [
      { id: 'ronald-dworkin-1', text: 'Rights are best understood as trumps over some background justification for political decisions that states a goal for the community as a whole.' },
      { id: 'ronald-dworkin-2', text: 'The courts are the capitals of law’s empire, and judges are its princes.' },
      { id: 'ronald-dworkin-3', text: 'Government must treat those whom it governs with concern and respect.' },
      { id: 'ronald-dworkin-4', text: 'Someone who claims that citizens have a right against the Government need not go so far as to say that the State is never justified in overriding that right.' },
    ],
  },
  {
    id: 'jean-baudrillard',
    name: 'Jean Baudrillard',
    lifespan: '1929–2007',
    era: '20th-c. France',
    symbol: '🪧',
    oneLiner: 'The copy came first; the original never existed.',
    bio: 'Jean Baudrillard argued that a society saturated with images stops using them to represent anything. The map is drawn before the territory, the copy has no original, and what is left is not a lie about reality but a world in which the question of reality has quietly stopped applying. He called it the simulacrum. His writing is deliberately provocative and often read as despairing, though he insisted he was describing rather than mourning.',
    areas: ['Aesthetics', 'Metaphysics', 'Social Theory'],
    branchSlugs: ['aesthetics', 'metaphysics', 'epistemology'],
    category: 'CONTEMPORARY',
    country: 'France',
    quotes: [
      { id: 'jean-baudrillard-1', text: 'The simulacrum is never that which conceals the truth — it is the truth which conceals that there is none.' },
      { id: 'jean-baudrillard-2', text: 'Disneyland is presented as imaginary in order to make us believe that the rest is real.' },
      { id: 'jean-baudrillard-3', text: 'We live in a world where there is more and more information, and less and less meaning.' },
      { id: 'jean-baudrillard-4', text: 'The territory no longer precedes the map, nor does it survive it.' },
    ],
  },
  {
    id: 'miranda-fricker',
    name: 'Miranda Fricker',
    lifespan: 'b. 1966',
    era: 'Britain, 20th–21st c.',
    symbol: '🔇',
    oneLiner: 'You can be wronged simply as a knower.',
    bio: 'Miranda Fricker named something everyone has met and nobody had a word for: being disbelieved because of who you are rather than what you said. She calls it testimonial injustice, and distinguishes it from a second kind — lacking the concepts to describe what is happening to you, because the people who had the experience were never in the room when the vocabulary was made. Both are failures of knowledge and failures of justice at the same time, which is what makes them a philosophical problem rather than only a political one.',
    areas: ['Epistemology', 'Ethics', 'Social Philosophy'],
    branchSlugs: ['epistemology', 'ethics', 'political-philosophy'],
    category: 'CONTEMPORARY',
    country: 'England',
    quotes: [
      { id: 'miranda-fricker-1', text: 'Testimonial injustice occurs when prejudice causes a hearer to give a deflated level of credibility to a speaker’s word.' },
      { id: 'miranda-fricker-2', text: 'Hermeneutical injustice is the injustice of having some significant area of one’s social experience obscured from collective understanding.' },
      { id: 'miranda-fricker-3', text: 'The wrong is that the speaker is degraded qua knower — wronged in a capacity essential to human value.' },
      { id: 'miranda-fricker-4', text: 'A virtuous hearer corrects for the prejudice she is aware of in her own credibility judgements.' },
    ],
  },
  {
    id: 'cornel-west',
    name: 'Cornel West',
    lifespan: 'b. 1953',
    era: 'United States, 20th–21st c.',
    symbol: '🎷',
    oneLiner: 'Justice is what love looks like in public.',
    bio: 'Cornel West works in a tradition that runs through the Black church, the blues and American pragmatism, and he writes for people outside universities as much as inside them. His argument is that a democracy is kept alive by ordinary courage rather than by institutions, and that despair is the real political danger. He describes himself as a bluesman in the life of the mind — someone whose job is to tell the truth about suffering without being defeated by it.',
    areas: ['Political Philosophy', 'Ethics', 'Pragmatism'],
    branchSlugs: ['political-philosophy', 'ethics'],
    category: 'CONTEMPORARY',
    country: 'United States',
    quotes: [
      { id: 'cornel-west-1', text: 'Justice is what love looks like in public, just like tenderness is what love feels like in private.' },
      { id: 'cornel-west-2', text: 'You can’t lead the people if you don’t love the people. You can’t save the people if you don’t serve the people.' },
      { id: 'cornel-west-3', text: 'I cannot be an optimist, but I am a prisoner of hope.' },
      { id: 'cornel-west-4', text: 'Courage is the enabling virtue for any philosopher, for any human being, I think, in the end.' },
    ],
  },
  {
    id: 'shantideva',
    name: 'Shantideva',
    lifespan: 'c. 685–763 CE',
    era: 'Ancient India (Nalanda)',
    symbol: '🪷',
    oneLiner: 'Your suffering is not more important than theirs.',
    bio: 'Shantideva was a monk at Nalanda whose long poem, the Bodhicaryavatara, is one of the most sustained arguments ever made for taking other people’s suffering as seriously as your own. His case is not sentimental: he asks why the boundary of a single body should decide whose pain counts, and finds no answer that survives. He is also unusually practical about anger, patience and the uselessness of worry. Modern philosophers of ethics still cite him, and the Dalai Lama has called it the text he returns to most.',
    areas: ['Ethics', 'Buddhist Philosophy', 'Metaphysics'],
    branchSlugs: ['ethics', 'metaphysics'],
    category: 'EASTERN',
    country: 'India',
    quotes: [
      { id: 'shantideva-1', text: 'All the suffering in the world comes from seeking pleasure for oneself. All the happiness in the world comes from seeking pleasure for others.' },
      { id: 'shantideva-2', text: 'Where would I find enough leather to cover the entire surface of the earth? But with leather soles beneath my feet, it is as if the whole world has been covered.' },
      { id: 'shantideva-3', text: 'If a problem can be solved, what is the use of worrying? If it cannot be solved, what use is there in being upset?' },
      { id: 'shantideva-4', text: 'May I be a guard for those who are without protection, a guide for those who journey on the road.' },
    ],
  },
];
