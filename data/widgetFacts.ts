// What the home-screen widget teaches: a fact or an insight from each of the seven
// subjects, one every few hours, round the subjects in turn (lib/widget/mood.ts).
//
// ZERO IMPORTS, so `npm run check:widget` can load it in plain Node and hold every
// line to the box it is drawn in.
//
// THE RULES FOR A LINE HERE (2026-10-02):
//   · TRUE, and checkable. A home-screen fact is read hundreds of times by people
//     who did not ask for it; one wrong one is what they will remember. Where the
//     evidence is one study, the line says "in one study". Where it is a story
//     told about someone, it says so ("the story goes").
//   · SHORT. It is drawn at about 13sp in a panel two thirds of a 4×2 widget wide,
//     so 100 characters at most — `check:widget` measures each one against the
//     panel at the smallest size the split layout is drawn at.
//   · SURPRISING OR USEFUL. The test is whether someone would say it out loud to
//     a friend. A definition is not a fact.
//   · Plain words, a full stop at the end, no exclamation marks.

export const WIDGET_FACTS: Record<string, string[]> = {
  philosophy: [
    'Socrates never wrote anything down. Most of what we know of him comes from his student Plato.',
    'Confucius died about ten years before Socrates was born.',
    'Aristotle was the private tutor of a teenage Alexander the Great.',
    'Marcus Aurelius wrote his Meditations as private notes. He never meant anyone else to read them.',
    'The trolley problem was first posed by the philosopher Philippa Foot, in 1967.',
    '“I think, therefore I am” first appeared in French, in 1637: “Je pense, donc je suis.”',
    'Plato’s Academy in Athens kept teaching for about three hundred years.',
    'Kant’s daily walk was so punctual, the story goes, that his neighbours set their clocks by it.',
    'Hypatia taught philosophy and mathematics in Alexandria around the year 400.',
    'The word “philosophy” comes from the Greek for “love of wisdom”.',
    'Diogenes, the story goes, lived in a large clay jar in the middle of Athens.',
    'Descartes liked to do his thinking in bed, and often stayed there until late morning.',
  ],
  psychology: [
    'You can hold about four things in your head at once. Not seven, as the old rule says.',
    'Your brain is about 2% of your body’s weight but uses about a fifth of its energy.',
    'Most drivers rate themselves above average. They cannot all be right.',
    'A memory is rebuilt each time you recall it, which is why memories can quietly change.',
    'Testing yourself helps you remember far more than reading the same notes again.',
    'Seeing a face in a cloud or a plug socket has a name: pareidolia.',
    'In Milgram’s 1961 study, about two thirds of people obeyed all the way to the highest shock.',
    'Losing £10 feels about twice as bad as finding £10 feels good.',
    'Short reviews spread over several days beat one long cram. It is called the spacing effect.',
    'When you read, your eyes jump along the line three or four times a second.',
    'People in a crowd are slower to help in an emergency. It is called the bystander effect.',
    'Without a review, most of what you learn today will be hard to recall within a few days.',
  ],
  'personal-growth': [
    'In one study a new habit took about 66 days to stick. Not 21.',
    'In the same study, missing a single day barely set the habit back at all.',
    'Deciding exactly when and where you will do something makes you far more likely to do it.',
    'People start new goals more often on Mondays, birthdays and New Year. It is the fresh-start effect.',
    'In one study, saying “I don’t” rather than “I can’t” helped people turn temptation down.',
    'In one study, announcing a goal made people work on it less. It felt half done already.',
    'Just having your phone on the desk, even face down, lowered test scores in one study.',
    'Sleep is when the brain files away much of what you learned that day.',
    'People who listed what they were grateful for each week felt more optimistic in one study.',
    'A habit is easier to start if its first step takes less than two minutes.',
    'A short brisk walk reliably lifts people’s mood in studies, often within ten minutes.',
    'Most people overrate what they can do in a day and underrate what they can do in a year.',
  ],
  business: [
    'Ford’s moving line cut the time to build a car chassis from about 12 hours to 90 minutes.',
    'Amazon started in 1994 as an online bookshop, run out of a garage.',
    'Kongō Gumi, a Japanese temple builder, ran as a company for over 1,400 years.',
    'Nokia began in 1865 as a paper mill.',
    'Post-it Notes came from a glue that failed. It was too weak to hold anything for long.',
    'The first barcode ever scanned in a shop, in 1974, was on a pack of chewing gum.',
    'Netflix began by posting DVDs to people in red envelopes.',
    'In its first year, 1886, Coca-Cola sold about nine drinks a day.',
    'At Toyota, any worker on the line can stop the whole production line if they spot a problem.',
    'LEGO nearly went bust in 2003. It recovered by making far fewer kinds of product.',
    'The word “company” comes from Latin for sharing bread: “com”, with, and “panis”, bread.',
    'Often about 80% of the results come from about 20% of the effort. It is called the 80/20 rule.',
  ],
  economics: [
    'A price is a message. It tells sellers what people want, and buyers what it costs to make.',
    'In 2009 Zimbabwe printed a single banknote worth 100 trillion dollars.',
    'Adam Smith’s The Wealth of Nations came out in 1776, the year of American independence.',
    'The real cost of anything is what you gave up to get it. Economists call it opportunity cost.',
    'The Economist compares Big Mac prices around the world to see which currencies are too dear.',
    'At 2% inflation a year, money loses half its value in about 35 years.',
    'Money growing at 7% a year doubles in about ten years.',
    'The first known coins were made in Lydia, in what is now Turkey, around 600 BC.',
    'Paper money was first used widely in China, about a thousand years ago.',
    'Diamonds cost more than water, though only water keeps you alive. It is the paradox of value.',
    'When a price goes up, people usually buy less of it. That is the law of demand.',
    'A trade can leave both sides better off. That is why people trade at all.',
  ],
  science: [
    'The sunlight on your face left the Sun about eight minutes ago.',
    'An octopus has three hearts and blue blood.',
    'A day on Venus is longer than its year.',
    'Bananas are very slightly radioactive, because of the potassium in them.',
    'Ice floats because water expands as it freezes.',
    'There are more possible games of chess than atoms in the observable universe.',
    'The DNA in one of your cells, stretched out, would be about two metres long.',
    'Sound travels about four times faster through water than through air.',
    'In 1947 engineers found a real moth stuck in a computer at Harvard, and taped it in the log.',
    'A bolt of lightning is about five times hotter than the surface of the Sun.',
    'A teaspoon of a neutron star would weigh billions of tonnes.',
    'Light takes about 1.3 seconds to travel from the Moon to the Earth.',
  ],
  history: [
    'Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid.',
    'Oxford University was teaching students before the Aztec Empire was founded.',
    'The shortest war on record, Britain against Zanzibar in 1896, lasted under 45 minutes.',
    'Woolly mammoths were still alive on one Arctic island while the pyramids were being built.',
    'Napoleon was about 5 foot 7, an ordinary height for a Frenchman of his time.',
    'The Great Fire of London in 1666 destroyed most of the city, but only six deaths were recorded.',
    'The Hundred Years’ War lasted 116 years.',
    'The Berlin Wall stood for 28 years, from 1961 to 1989.',
    'In 1893 New Zealand became the first self-governing country to give women the vote.',
    'The Pope declared Magna Carta void within ten weeks of it being sealed in 1215.',
    'The Ottoman Empire lasted more than 600 years, from about 1299 to 1922.',
    'Within 50 years of Gutenberg’s press, Europe had printed millions of books.',
  ],
};
