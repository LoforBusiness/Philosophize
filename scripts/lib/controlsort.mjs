// ─────────────────────────────────────────────────────────────────────────────
// THE FIFTY LEVER QUESTIONS, AS THE CLASSIFICATIONS THEY ALWAYS WERE.
//
// Not one of them was a quantity. Every single one names a subject and offers
// three or four candidate answers about it — which is a sort, and reads as one
// the moment it is asked that way: "Where does instrumental music belong?" beats
// "Set the lever to what most instrumental music does" without changing a word of
// what is being taught.
//
// Each entry gives the CHIP (the thing being classified, in two or three words),
// a LABEL for each bin (a category, short enough to sit on a bin lip at 10px),
// and a PROMPT that is a question. Every `reads` string is carried over verbatim
// by the codemod and is not restated here.
// ─────────────────────────────────────────────────────────────────────────────

export const SORT_COPY = {
  'aesthetics11#nothing, the surfaces are identical': {
    chip: 'the human maker', prompt: 'What does a human maker add that the surface does not show?',
    labels: { nothing: 'nothing', toil: 'hours spent', feeling: 'a feeling' },
  },
  'aesthetics17#the fear is faked': {
    chip: 'a horror film', prompt: 'At a horror film, what is actually going on?',
    labels: { nofear: 'the fear is fake', nofun: 'the fun is fake', real: 'the fear is real' },
  },
  'aesthetics20#the last one is proved': {
    chip: 'crossing three out', prompt: 'You cross out three of the four. What has that done?',
    labels: { proved: 'proves the last', nothing: 'changes nothing', narrow: 'narrows the field' },
  },
  'aesthetics23#no mood, no object, only shape': {
    chip: 'instrumental music', prompt: 'Where does most instrumental music belong?',
    labels: { nothing: 'no mood', mood: 'mood, no object', objects: 'names things' },
  },
  'aesthetics35#people laugh with nobody there to look down on': {
    chip: 'laughter needs a victim', prompt: 'Which case breaks the idea that laughter needs a victim?',
    labels: { alone: 'laughing alone', kind: 'people who never mock', pun: 'a pun' },
  },
  'aesthetics4#anything, if you say the word': {
    chip: 'a chosen object', prompt: 'What turns a chosen object into art?',
    labels: { label: 'saying so', skill: 'real skill', world: 'the art world' },
  },
  'aesthetics8#formalism is right and expression is wrong': {
    chip: 'formalism and expression', prompt: 'So what should be said about the two theories?',
    labels: { form: 'formalism wins', expr: 'expression wins', both: 'different questions' },
  },
  'aesthetics9#a work must be beautiful to count': {
    chip: 'beauty', prompt: 'So where does beauty stand now?',
    labels: { must: 'required', may: 'optional', never: 'discarded' },
  },
  'epistemology11#belief: you did not really believe it': {
    chip: 'the stopped clock', prompt: 'Which of the three conditions does the stopped clock actually break?',
    labels: { belief: 'belief', truth: 'truth', reason: 'the reason', none: 'none of them' },
  },
  'epistemology12#the world, then you': {
    chip: 'a wall you were told about', prompt: 'Rain felt, toast remembered, a wall you were told about. Which route is least direct?',
    labels: { senses: 'one step', memory: 'two steps', told: 'through another mind' },
  },
  'epistemology19#nobody knows, pick either': {
    chip: 'two experts disagree', prompt: 'Two experts disagree. What should you actually do?',
    labels: { guess: 'pick either', loud: 'the confident one', weight: 'weigh the sides' },
  },
  'epistemology24#at least one premise has to go': {
    chip: 'a false conclusion', prompt: 'Valid reasoning, and the conclusion is false. What follows?',
    labels: { premise: 'a premise goes', valid: 'the logic failed', accept: 'accept it' },
  },
  'epistemology2#nothing at all is safe': {
    chip: 'the demon', prompt: 'With the demon deceiving you about everything, what is still safe?',
    labels: { all: 'nothing at all', sums: 'arithmetic', doubter: 'the doubter' },
  },
  'epistemology31#prove it first, against something outside memory': {
    chip: 'your own memory', prompt: 'How should you treat your own memory?',
    labels: { prove: 'prove it first', trust: 'trust it', doubt: 'suspect it' },
  },
  'epistemology6#nothing, the claim is fine': {
    chip: '"nothing is certain"', prompt: 'What is wrong with saying nothing is certain?',
    labels: { fine: 'nothing', bold: 'too strong', eats: 'it eats itself' },
  },
  'epistemology9#the land itself, with nothing in between': {
    chip: 'checking your map', prompt: 'When you check a map against the world, what do you actually reach?',
    labels: { land: 'the land', seeing: 'your own seeing', other: 'a second map' },
  },
  'ethics12#never use another person merely as a means': {
    chip: 'breaking a promise', prompt: 'Which principle would let you break the promise?',
    labels: { means: 'never a means', law: 'a universal rule', happy: 'more people happy' },
  },
  'ethics15#a claim about the world, true or false': {
    chip: '"stealing is wrong"', prompt: 'What kind of thing is "stealing is wrong"?',
    labels: { fact: 'a fact', report: 'a report of feeling', boo: 'a boo' },
  },
  'ethics18#whether it can reason': {
    chip: 'moral standing', prompt: 'What decides whether something counts morally?',
    labels: { reason: 'can it reason', speak: 'can it talk', suffer: 'can it suffer' },
  },
  'ethics24#deterrence alone would allow it': {
    chip: 'punishing an innocent', prompt: 'Which theory would allow punishing someone innocent?',
    labels: { deter: 'deterrence', desert: 'desert', neither: 'neither' },
  },
  'ethics2#common, so it must be fine': {
    chip: 'common and legal', prompt: 'Does being common or being legal settle whether it is right?',
    labels: { common: 'common settles it', legal: 'legal settles it', neither: 'neither does' },
  },
  'ethics36#feelings can never be duties': {
    chip: 'a duty to forgive', prompt: 'What is the strongest objection to a duty to forgive?',
    labels: { feel: 'feelings are not duties', time: 'it takes time', take: 'he could demand it' },
  },
  'ethics9#nothing, he chose rightly': {
    chip: 'the tragic choice', prompt: 'He chose the better option. Was anything still lost?',
    labels: { nothing: 'nothing', third: 'a third way', duty: 'a real duty' },
  },
  'logic10#always, whatever is left unsaid': {
    chip: 'a hidden premise', prompt: 'When does a missing premise actually break an argument?',
    labels: { always: 'always', false: 'only when false', never: 'never' },
  },
  'logic12#fair when the two doors are the only doors': {
    chip: 'an either-or', prompt: 'When is an either-or fair rather than false?',
    labels: { exhaustive: 'only two doors', popular: 'most accept it', never: 'always a trick' },
  },
  'logic13#the ending is too far-fetched to take seriously': {
    chip: 'the slippery slope', prompt: 'What is actually wrong with a slippery-slope argument?',
    labels: { ending: 'too far-fetched', length: 'too many steps', joins: 'an unargued step' },
  },
  'logic20#you beat a view nobody holds': {
    chip: 'the strong version', prompt: 'What does it mean to take on the strongest version?',
    labels: { weak: 'a view nobody holds', said: 'what they said', strong: 'the best case' },
  },
  'logic22#one cat that is not black': {
    chip: '"all cats are black"', prompt: 'What does it take to refute "all cats are black"?',
    labels: { one: 'one exception', many: 'a good many', all: 'prove the negative' },
  },
  'logic26#nothing, the argument collapsed': {
    chip: 'a false conclusion', prompt: 'The reasoning held and the end is absurd. What has been shown?',
    labels: { nothing: 'nothing', step: 'a step was wrong', assume: 'the start was false' },
  },
  'logic32#answer yes, and admit the whole thing': {
    chip: 'a loaded question', prompt: 'How do you answer a question with a claim buried in it?',
    labels: { yes: 'answer yes', no: 'answer no', split: 'split it apart' },
  },
  'logic37#sets are simply harder to think about than barbers': {
    chip: "Russell's set", prompt: 'Why is the set paradox worse than the barber?',
    labels: { hard: 'harder to picture', words: 'a trick of language', axioms: 'the rules required it' },
  },
  'logic7#nothing yet, look at the sky': {
    chip: 'a dry pavement', prompt: 'The pavement is dry. What does that tell you about the rain?',
    labels: { nothing: 'nothing yet', likely: 'probably not', certain: 'certainly not' },
  },
  'metaphysics16#free means the choice had no cause at all': {
    chip: 'a free choice', prompt: 'What does calling a choice free actually mean?',
    labels: { uncaused: 'no cause at all', unforced: 'nobody forced you', endorsed: 'wanting your own want' },
  },
  'metaphysics19#one thing, counted twice': {
    chip: 'the two spheres', prompt: 'Two things exactly alike. What is the case?',
    labels: { one: 'one, counted twice', two: 'two, identical', never: 'impossible' },
  },
  'metaphysics22#could not have done otherwise': {
    chip: '"could have done otherwise"', prompt: 'What does "could have done otherwise" have to mean?',
    labels: { never: 'never could', wanted: 'if you had wanted', full: 'same past, other choice' },
  },
  'metaphysics2#nothing was never possible': {
    chip: 'nothing at all', prompt: 'Why is there something rather than nothing?',
    labels: { never: 'never possible', lost: 'possible, and lost', must: 'something had to be' },
  },
  'metaphysics5#doubt: can I trust anything I see?': {
    chip: "Leibniz's question", prompt: 'What kind of question is "why is there anything at all"?',
    labels: { doubt: 'doubt', wonder: 'wonder', measure: 'measurement' },
  },
  'metaphysics9#the mind is the brain: one kind of stuff': {
    chip: 'the mind', prompt: 'What is the dualist actually claiming about the mind?',
    labels: { same: 'it is the brain', does: 'what the brain does', two: 'a second kind of thing' },
  },
  'political12#negative liberty: nobody standing in your way': {
    chip: 'the addict', prompt: 'Nobody is stopping him, and he cannot stop. Which freedom is missing?',
    labels: { neg: 'negative liberty', none: 'no freedom at all', pos: 'positive liberty' },
  },
  'political14#that sportsmen are paid far too much': {
    chip: "Nozick's point", prompt: 'What is Nozick actually arguing with the footballer?',
    labels: { pay: 'they are overpaid', equal: 'only equal is fair', pattern: 'patterns stop exchange' },
  },
  'political17#nowhere, nobody ever signed': {
    chip: 'your obligation', prompt: 'Nobody signed anything. Where could the obligation come from?',
    labels: { sign: 'a signature', quiet: 'staying put', benefit: 'taking the benefit' },
  },
  'political20#do not reach for the law against it': {
    chip: 'a view you detest', prompt: 'What does tolerating a view actually require of you?',
    labels: { power: 'no law against it', quiet: 'say nothing', agree: 'admit it might be right' },
  },
  'political21#knowing that the law exists': {
    chip: 'consent to the state', prompt: 'What would real consent to the state have to involve?',
    labels: { know: 'knowing the law', stay: 'staying put', refuse: 'a refusal you could take' },
  },
  'political24#treat everyone identically, ignore it': {
    chip: 'a minority culture', prompt: 'Which policy would have kept those bars full?',
    labels: { same: 'treat all alike', tolerate: 'tolerate privately', public: 'a place in public' },
  },
  'political2#the person, who is magnetic': {
    chip: 'the mayor', prompt: 'Where does the mayor’s authority actually come from?',
    labels: { person: 'the person', custom: 'tradition', office: 'the office' },
  },
  'political31#ask each herder to take less': {
    chip: 'the common pasture', prompt: 'What actually stops the pasture being stripped?',
    labels: { ask: 'ask them', shame: 'shame them', rules: 'change the cost' },
  },
  'political5#to make everybody come out equal': {
    chip: 'the difference principle', prompt: 'What is the difference principle for?',
    labels: { equal: 'equal outcomes', rich: 'a richer society', fair: 'fair rules' },
  },
  'political7#nothing awkward, the law is everything': {
    chip: 'law is everything', prompt: 'If law is all there is, what follows?',
    labels: { clean: 'nothing awkward', custom: 'custom corrects it', nothing: 'no law is unjust' },
  },
  'strong4#invalid: it did not guarantee the conclusion': {
    chip: 'a strong inductive argument', prompt: 'What is the right verdict on a strong inductive argument?',
    labels: { invalid: 'invalid', weak: 'weak', wrong: 'wrong test entirely' },
  },
  'political9#one ruler pressing down on everybody': {
    chip: 'the danger Mill fears', prompt: 'Which danger is Mill actually warning about?',
    labels: { one: 'one ruler', outside: 'an outside power', many: 'the many' },
  },
};
