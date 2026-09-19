// ─────────────────────────────────────────────────────────────────────────────
// THE REVIEW AT THE END OF A UNIT.
//
// The owner: *"at the end of each unit there is a lesson review … it goes through
// some of the information that was talked about or questions or different kinds of
// questions that are asked inside the unit that the user just completed. This
// operates just like another lesson but it's strictly for a lesson review. I want
// all the animations, all the things a lesson has into this review. And at the end …
// a certificate or a celebration."*
//
// ── WHY THE QUESTIONS ARE NEW AND THE STAGE IS SHARED ───────────────────────
//
// Two decisions, both the owner's, and they pull in opposite directions on cost.
// The QUESTIONS are written per unit rather than recycled from the lessons: a
// review that re-asks the lesson's own question is a lesson played twice, and the
// interesting question at the end of a unit is the one that only makes sense once
// all of it has been read — which of these three theories the trolley case splits,
// which of four fallacies this argument is. The STAGE is shared, because a
// hand-drawn scene per unit is the same build as twenty-eight new lessons.
//
// So a review declares WHAT IS ON THE TABLE — up to four ideas the unit covered, as
// labelled plates — and the shared scene stages them, walks the figure between them,
// lights the one under discussion and hands the question to the player's own
// controls. Every animation a lesson has, because it IS the lesson player.
//
// ── IT IS NOT A LESSON, AND THREE THINGS FOLLOW ─────────────────────────────
//
//   · it is not in `ALL_BRANCHES`, so it never moves `lessonsByUnit` and cannot
//     disturb the per-unit progress model or the free-tier gate;
//   · it is not in the `CINEMATIC` map, so `check:cinematic`'s house shape — 7–11
//     beats, exactly two graded questions, one quote, the summary last — does not
//     apply, and a review is free to be four questions and no quote;
//   · it has no narration, no must-boxes and no generated tables. The tables are all
//     keyed by lesson id and a review's id is absent from every one of them, which
//     every reader of them already handles.
//
// `XP_PER_PATH_MASTERY` has been defined and unused since the beginning; a finished
// review is what pays it, once.
// ─────────────────────────────────────────────────────────────────────────────
import type { InteractBlock } from '@/components/lesson/cinematic/cinematicKit';

/** One step of a review: a line to read, and sometimes a question to answer. */
export interface ReviewStep {
  /**
   * The line, in the deck, exactly as a lesson's narration sits there.
   *
   * Optional, and absent on a question step: a graded beat's words are its PROMPT,
   * and a lesson that also narrated over its own question would be talking across it
   * (group O — the reveal owns that moment).
   */
  text?: string;
  /**
   * Which of the unit's plates this step is about, or −1 for none.
   *
   * The figure walks to it and it lights. That is the whole of the staging language:
   * a review is a tour of the things the unit put on the table.
   */
  at?: number;
  /** How many plates have arrived by now. Latched — a review builds its table up. */
  upto?: number;
  /** A graded question, in exactly the shape a lesson beat carries one. */
  ask?: InteractBlock;
}

export interface UnitReview {
  /** Up to four ideas the unit covered, in the words the lessons used for them. */
  plates: string[];
  /** The steps, in order. */
  steps: ReviewStep[];
}

/**
 * Keyed by UNIT id — the `Path.id` in `data/branches/<branch>/paths/<unit>/index.ts`.
 * A unit with no entry simply has no review, which is what every unit had before.
 */
export const UNIT_REVIEWS: Record<string, UnitReview> = {
  // ── EPISTEMOLOGY 1 · What Is Knowledge? ─────────────────────────────────────
  'epistemology-what-is-knowledge': {
    plates: ['TRUE', 'BELIEVED', 'JUSTIFIED', 'CERTAIN'],
    steps: [
      {
        text: 'Ten lessons on knowing. Three of these were offered as the parts of knowledge, and one was not.',
        upto: 4,
        at: 0,
      },
      {
        at: 3,
        ask: {
          prompt: 'Which of the four is NOT one of the three classic conditions?',
          sort: {
            chip: 'certainty',
            bins: [
              { id: 'in', label: 'a condition', reads: 'you must be certain to know' },
              { id: 'out', label: 'not one', reads: 'you can know and still be fallible', correct: true },
            ],
          },
          explain: 'Not one. The classic account asks for a belief that is true and justified; certainty is a feeling, and the lessons kept the two apart. Science is the standing example: it knows a great deal and revises it.',
          xp: 5,
        },
      },
      {
        text: 'Justification was the part that did the work, and one lesson asked where a chain of reasons can stop.',
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'A reason rests on a reason, which rests on another. How many ways can that end?',
          drag: {
            lo: 'one way',
            hi: 'four ways',
            start: 0.95,
            zones: [
              { id: 'one', upto: 0.3, reads: 'one: it must stop somewhere solid' },
              { id: 'two', upto: 0.52, reads: 'two: stop, or go round' },
              { id: 'three', upto: 0.78, reads: 'three: stop, go round, or run on for ever', correct: true },
              { id: 'four', upto: 1, reads: 'four or more' },
            ],
          },
          explain: 'Three. It stops at something that needs no further reason, it circles back on itself, or it runs on without end. Each of the three has a school defending it, and nothing else is left for a chain to do.',
          xp: 5,
        },
      },
      {
        text: 'Another asked whether any of it gets off the ground at all.',
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'Someone says nothing can be known. What is wrong with saying it?',
          cards: [
            { text: 'It refutes itself \u2014 they claim to know that', correct: true },
            { text: 'Nothing; it is simply modest', correct: false },
          ],
          explain: 'It refutes itself. Stated as something they know, the claim is one of the things it rules out. The careful sceptic therefore asks a question rather than making an announcement.',
          xp: 5,
        },
      },
      {
        text: 'And the unit separated two things people call knowing.',
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'Which does riding a bicycle belong to?',
          poll: {
            options: [
              { id: 'how', reads: 'Knowing HOW: a skill, not a set of facts', holders: ['Gilbert Ryle'] },
              { id: 'that', reads: 'Knowing THAT: facts about balance you have learned' },
              { id: 'neither', reads: 'Neither; it is not knowledge at all' },
            ],
          },
          explain: 'Knowing how. Ryle argued that a person can ride perfectly and state no fact about it, and can recite the physics and still fall off. The skill is not a store of facts being applied.',
          xp: 5,
        },
      },
    ],
  },

  // ── EPISTEMOLOGY 2 · The Classic Puzzles ────────────────────────────────────
  'epistemology-the-classic-puzzles': {
    plates: ['GETTIER', 'TESTIMONY', 'THE DEMON', 'A PRIORI'],
    steps: [
      {
        text: 'Five puzzles, and the first broke the definition the last unit built.',
        upto: 1,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'A Gettier case gives you a belief that is true and justified. What is missing?',
          cards: [
            { text: 'Any link between your reason and what made it true', correct: true },
            { text: 'Enough evidence to be sure', correct: false },
          ],
          explain: 'The link. The reason is good and the belief is true, but the two meet by accident, and that is why the case does not feel like knowing however much evidence is piled on it.',
          xp: 5,
        },
      },
      {
        text: 'Then the unit asked where most of what you know actually comes from.',
        upto: 4,
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'Most of what you know reached you how?',
          drag: {
            lo: 'you saw it yourself',
            hi: 'somebody told you',
            start: 0.06,
            zones: [
              { id: 'seen', upto: 0.3, reads: 'mostly first hand' },
              { id: 'mixed', upto: 0.62, reads: 'about half and half' },
              { id: 'told', upto: 1, reads: 'almost all of it by testimony', correct: true },
            ],
          },
          explain: 'Almost all of it. Your date of birth, the shape of the continents, every date in history: you were told. Treating testimony as a second-class source would empty out most of what anybody knows.',
          xp: 5,
        },
      },
      {
        text: 'Two lessons tested the ground itself.',
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'What is the demon argument for?',
          poll: {
            options: [
              { id: 'doubt', reads: 'Showing how much could be false without your noticing', holders: ['Ren\u00e9 Descartes'] },
              { id: 'real', reads: 'Showing that a demon probably exists' },
              { id: 'give', reads: 'Showing that enquiry is pointless' },
            ],
          },
          explain: 'Showing how much could be false. It is a tool for finding what survives doubt rather than a theory about demons, and Descartes used it to look for the one thing doubt could not reach.',
          xp: 5,
        },
      },
      {
        text: 'And the last asked what you can know before looking.',
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'If a claim is true by what its words mean, what does checking teach you?',
          sort: {
            chip: 'all bachelors are unmarried',
            bins: [
              { id: 'new', label: 'something new', reads: 'checking taught you a fact' },
              { id: 'none', label: 'nothing new', reads: 'the meaning already settled it', correct: true },
              { id: 'maybe', label: 'it depends', reads: 'it depends who you ask' },
            ],
          },
          explain: 'Nothing new. Being unmarried is already part of what the word bachelor means, so no bachelor had to be found. That is the mark the unit used to separate what you know in advance from what the world has to tell you.',
          xp: 5,
        },
      },
    ],
  },

  // ── ETHICS 1 · What Is Ethics? ──────────────────────────────────────────────
  // Five lessons: why humans care, the three lenses, what makes an action good,
  // universal or relative, and where ethical thinking began. The three lenses are
  // the spine, and the table the app itself draws them on is OUTCOMES · DUTY ·
  // CHARACTER — the words the scene uses, not the textbook ones (J-group: read the
  // stage before naming anything).
  'ethics-what-is-ethics': {
    plates: ['CONSCIENCE', 'OUTCOMES', 'DUTY', 'CHARACTER'],
    steps: [
      {
        text: 'Five lessons on what ethics is. It began with a feeling you already had.',
        upto: 1,
        at: 0,
      },
      {
        text: 'Then three ways of judging the same act arrived, and each asks its own question.',
        upto: 4,
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'Which lens asks this?',
          sort: {
            chip: 'Would everyone be better off?',
            bins: [
              { id: 'outcomes', label: 'outcomes', reads: 'judge it by what happens', correct: true },
              { id: 'duty', label: 'duty', reads: 'judge it by the rule it follows' },
              { id: 'character', label: 'character', reads: 'judge it by the person it makes you' },
            ],
          },
          explain: 'Outcomes. That lens weighs results and nothing else — whose life goes better, whose goes worse. Duty asks whether the rule could be universal; character asks what doing it repeatedly turns you into.',
          xp: 5,
        },
      },
      {
        text: 'A town of five thousand gains a little by ruining one person. All three lenses object — but not for the same reason.',
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'Which objection is the duty lens making?',
          poll: {
            options: [
              {
                id: 'means',
                reads: 'You would be using that person merely as a means',
                holders: ['Immanuel Kant'],
              },
              {
                id: 'sum',
                reads: 'The town does not gain enough to be worth it',
                holders: ['John Stuart Mill'],
              },
              {
                id: 'person',
                reads: 'Nobody who did that could still be called decent',
                holders: ['Aristotle'],
              },
            ],
          },
          explain: 'Using them merely as a means. Kant’s objection does not depend on the sums at all — it says the one person has a worth no arithmetic can outweigh. The first answer is the outcomes lens haggling over the total, and the third is the character lens.',
          xp: 5,
        },
      },
      {
        text: 'The last two lessons asked whether any of this holds once you leave home.',
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'Cultures disagree about what is right. What follows from that alone?',
          cards: [
            { text: 'Nothing yet — disagreement is not proof', correct: true },
            { text: 'Every code is equally true', correct: false },
          ],
          explain: 'Nothing yet. People disagreed about the shape of the earth too, and that did not make every answer equally true. Cultures differing is a fact about people; whether any code is correct is a separate question, and it needs its own argument.',
          xp: 5,
        },
      },
      {
        text: 'One more thing this unit said about how ordinary people actually judge.',
        at: -1,
      },
      {
        at: -1,
        ask: {
          prompt: 'How many of the three lenses does an ordinary moral judgement use?',
          drag: {
            lo: 'one, consistently',
            hi: 'all three at once',
            start: 0.08,
            zones: [
              { id: 'one', upto: 0.34, reads: 'one lens, applied consistently' },
              { id: 'two', upto: 0.62, reads: 'mostly one, with a second in reserve' },
              { id: 'all', upto: 1, reads: 'all three, usually without noticing', correct: true },
            ],
          },
          explain: 'All three, usually without noticing. People reach for outcomes for one case, a rule for the next and a sense of character for the third, and rarely notice they have changed instrument. Naming the three is what lets you see which one you are holding.',
          xp: 5,
        },
      },
    ],
  },
  // ── ETHICS 2 · When Intuitions Collide ──────────────────────────────────────
  'ethics-when-intuitions-collide': {
    plates: ['THE SWITCH', 'THE BRIDGE', 'LUCK', 'CARE'],
    steps: [
      {
        text: 'Five lessons where two firm intuitions pulled against each other.',
        upto: 2,
        at: 0,
      },
      {
        at: 1,
        ask: {
          prompt: 'Five saved and one lost either way. What changes between the switch and the bridge?',
          cards: [
            { text: 'Nothing in the numbers \u2014 only how the death is brought about', correct: true },
            { text: 'The number of people who die', correct: false },
          ],
          explain: 'Nothing in the numbers. Both cases trade one life for five, and most people accept the switch and refuse the bridge. That gap is the whole finding: something other than the total is doing the work.',
          xp: 5,
        },
      },
      {
        text: 'Then two drivers, identical in every way, and one of them very unlucky.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'Two drivers are equally careless. A child steps out in front of one of them. How much does that change what is inside them?',
          drag: {
            lo: 'nothing at all',
            hi: 'everything',
            start: 0.92,
            zones: [
              { id: 'none', upto: 0.3, reads: 'nothing inside them differs', correct: true },
              { id: 'some', upto: 0.66, reads: 'one of them is somewhat worse' },
              { id: 'all', upto: 1, reads: 'one of them is a different person' },
            ],
          },
          explain: 'Nothing. Their carelessness, their intentions and their skill are the same; only the road differed. And yet one is a killer and one drove home \u2014 which is why moral luck is a problem rather than a curiosity.',
          xp: 5,
        },
      },
      {
        text: 'One lesson objected that all of this was the wrong shape.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'What does the ethics of care say the rule-based cases keep leaving out?',
          poll: {
            options: [
              { id: 'person', reads: 'The particular person in front of you, and what you owe them', holders: ['Carol Gilligan', 'Nel Noddings'] },
              { id: 'sums', reads: 'A more accurate way of adding up the harm' },
              { id: 'law', reads: 'A firmer rule to settle the case' },
            ],
          },
          explain: 'The particular person. Care starts from a relationship rather than from a principle, and its complaint is that a trolley case describes six strangers and then asks you to do arithmetic on them.',
          xp: 5,
        },
      },
      {
        text: 'And one case had no right answer at all.',
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'In a genuine moral dilemma, why can no amount of care settle it?',
          sort: {
            chip: 'a genuine dilemma',
            bins: [
              { id: 'scale', label: 'no common scale', reads: 'the two claims cannot be weighed against each other', correct: true },
              { id: 'info', label: 'too little information', reads: 'more facts would settle it' },
              { id: 'nerve', label: 'a failure of nerve', reads: 'you simply have to choose' },
            ],
          },
          explain: 'No common scale. Both options break a real obligation, and there is no third measure the two can be converted into. Calling for more facts assumes a scale that is not there.',
          xp: 5,
        },
      },
    ],
  },

  // ── ETHICS 3 · The Great Theories ───────────────────────────────────────────
  'ethics-the-great-theories': {
    plates: ['MILL', 'KANT', 'ARISTOTLE', 'THE CONTRACT'],
    steps: [
      {
        text: 'Six lessons, and four complete answers to the same question.',
        upto: 4,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'Mill said some pleasures are better than others. What did that cost him?',
          cards: [
            { text: 'Quantity alone can no longer decide it', correct: true },
            { text: 'Nothing; it is a simple extension', correct: false },
          ],
          explain: 'Quantity alone can no longer decide it. Once poetry can beat pushpin on quality, the theory needs a judge of quality \u2014 and the calculation it promised to replace argument with is not doing the work by itself.',
          xp: 5,
        },
      },
      {
        text: 'Kant asked something that has nothing to do with results.',
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'What is the test Kant applies to the rule you are acting on?',
          poll: {
            options: [
              { id: 'law', reads: 'Could it be a law that everyone followed?', holders: ['Immanuel Kant'] },
              { id: 'best', reads: 'Does it produce the best result on balance?', holders: ['John Stuart Mill'] },
              { id: 'kind', reads: 'Is it what a person of good character would do?', holders: ['Aristotle'] },
            ],
          },
          explain: 'Could it be a universal law. The test is whether the rule survives everybody adopting it at once, and a lying promise fails because universal lying would destroy promising itself.',
          xp: 5,
        },
      },
      {
        text: 'Aristotle asked about the person rather than the act, and put the virtue in an unexpected place.',
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'Where does a virtue sit between too little and too much?',
          drag: {
            lo: 'as little as possible',
            hi: 'as much as possible',
            start: 0.95,
            zones: [
              { id: 'def', upto: 0.26, reads: 'deficiency, which is a vice' },
              { id: 'mean', upto: 0.68, reads: 'the mean between the two, which is the virtue', correct: true },
              { id: 'exc', upto: 1, reads: 'excess, which is also a vice' },
            ],
          },
          explain: 'The mean. Courage is not the greatest possible boldness \u2014 that is recklessness. Excess is a vice exactly as deficiency is, which is what makes the doctrine a claim rather than an encouragement.',
          xp: 5,
        },
      },
      {
        text: 'And one lesson asked why you should keep any of these rules at all.',
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'What is the contract theory\u2019s reason for accepting limits on your freedom?',
          sort: {
            chip: 'why obey?',
            bins: [
              { id: 'others', label: 'everyone else', reads: 'because everyone else has freedom too', correct: true },
              { id: 'force', label: 'the penalty', reads: 'because you would be punished' },
              { id: 'habit', label: 'habit', reads: 'because it is what people do' },
            ],
          },
          explain: 'Because everyone else has freedom too. The limits are the terms on which many free people can live in one place, which is why the theory is a contract rather than a threat. Fear of penalty is a reason to hide, not to agree.',
          xp: 5,
        },
      },
    ],
  },

  // ── ETHICS 4 · Ethics in the Wild ───────────────────────────────────────────
  'ethics-ethics-in-the-wild': {
    plates: ['WHO COUNTS', 'DISTANCE', 'INTENDED', 'THE FUTURE'],
    steps: [
      {
        text: 'Ten lessons taking the theories outdoors, starting with who is owed anything at all.',
        upto: 1,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'Which property does the unit say decides moral status?',
          sort: {
            chip: 'moral status',
            bins: [
              { id: 'person', label: 'being a person', reads: 'the capacities, whoever has them', correct: true },
              { id: 'human', label: 'being human', reads: 'membership of our species' },
              { id: 'both', label: 'always both', reads: 'the two cannot come apart' },
            ],
          },
          explain: 'Being a person. The two usually go together and the lessons kept finding cases where they do not, which is why naming the species does no work on its own.',
          xp: 5,
        },
      },
      {
        text: 'Then the pond, and how much a few thousand miles ought to matter.',
        upto: 2,
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'How much does distance change what you owe?',
          drag: {
            lo: 'not at all',
            hi: 'it decides everything',
            start: 0.9,
            zones: [
              { id: 'none', upto: 0.34, reads: 'distance is not a moral property', correct: true },
              { id: 'some', upto: 0.68, reads: 'it discounts the duty a little' },
              { id: 'all', upto: 1, reads: 'only what is near you counts' },
            ],
          },
          explain: 'Not at all. Singer\u2019s case is that the only thing the pond adds is that you can see it, and being seen is a fact about you rather than about the child. The ruined shoes were the whole cost.',
          xp: 5,
        },
      },
      {
        text: 'One lesson split a harm you aim at from one you merely see coming.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'On the doctrine of double effect, what may you never do?',
          cards: [
            { text: 'Use the harm as your means to the good', correct: true },
            { text: 'Act at all where harm is foreseen', correct: false },
          ],
          explain: 'Use the harm as your means. Foreseeing a bad side effect can be permitted; intending the harm as the route to your aim is not. The second card would forbid almost every serious action.',
          xp: 5,
        },
      },
      {
        text: 'And one asked how much people two centuries away are worth.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'A discount rate applied over two hundred years does what to a future harm?',
          poll: {
            options: [
              { id: 'nothing', reads: 'Shrinks it to almost nothing, however large it is', holders: ['Derek Parfit'] },
              { id: 'half', reads: 'Roughly halves it' },
              { id: 'same', reads: 'Leaves it where it was' },
            ],
          },
          explain: 'Almost nothing. Compounding is what does it: a rate that looks modest a year at a time makes a catastrophe two centuries out barely register, which is Parfit\u2019s reason for doubting the rate rather than the conclusion.',
          xp: 5,
        },
      },
    ],
  },

  // ── ETHICS 5 · Stepping Back ────────────────────────────────────────────────
  'ethics-stepping-back': {
    plates: ['WHAT IT MEANS', 'THE WEB', 'BEYOND DUTY', 'NO FORMULA'],
    steps: [
      {
        text: 'Fifteen lessons turning round to look at the machinery itself.',
        upto: 2,
        at: 0,
      },
      {
        at: 1,
        ask: {
          prompt: 'A principle and a firm intuition disagree. What does reflective equilibrium allow you to revise?',
          sort: {
            chip: 'which one gives way?',
            bins: [
              { id: 'either', label: 'either of them', reads: 'nothing in the web is fixed beyond revision', correct: true },
              { id: 'gut', label: 'the intuition', reads: 'the principle always wins' },
              { id: 'rule', label: 'the principle', reads: 'the intuition always wins' },
            ],
          },
          explain: 'Either. The method works by adjusting both until they sit together, and no belief in the system is a foundation that cannot be given up. A rule that always wins would make the intuitions decorative.',
          xp: 5,
        },
      },
      {
        text: 'One lesson found a whole class of acts the theories had no room for.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'What is a supererogatory act?',
          cards: [
            { text: 'Good, and not required of you', correct: true },
            { text: 'Required, and hard to do', correct: false },
          ],
          explain: 'Good and not required. Running into a burning building is admirable and nobody is blamed for not doing it, and a theory with only permitted and forbidden has nowhere to put that.',
          xp: 5,
        },
      },
      {
        text: 'Another asked what you are even doing when you call something wrong.',
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'Two cultures disagree about whether an act is wrong. What does that cost each reading of the word?',
          poll: {
            options: [
              { id: 'cost', reads: 'Each reading has a price, and the disagreement is where it shows', holders: ['J. L. Mackie'] },
              { id: 'none', reads: 'Neither reading pays anything; they simply differ' },
              { id: 'settled', reads: 'It settles the question in favour of one of them' },
            ],
          },
          explain: 'Each reading has a price. Read as a report of feeling, the two are not disagreeing at all; read as a claim about a fact, one of them has to be wrong. The disagreement is the test case that makes the cost visible.',
          xp: 5,
        },
      },
      {
        text: 'And after all four theories, the unit refused to pick one.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'When two of the great theories conflict, what decides?',
          drag: {
            lo: 'a formula does',
            hi: 'judgement does',
            start: 0.05,
            zones: [
              { id: 'formula', upto: 0.3, reads: 'a ranking settles it every time' },
              { id: 'mostly', upto: 0.58, reads: 'a ranking settles most of it' },
              { id: 'judge', upto: 1, reads: 'no formula decides; you have to judge', correct: true },
            ],
          },
          explain: 'No formula. Each theory is strongest where the others are weakest, and nothing above them ranks them. Knowing which instrument you are holding is what the unit offers instead of a rule for choosing.',
          xp: 5,
        },
      },
    ],
  },
  // ── LOGIC 1 · The Anatomy of an Argument ────────────────────────────────────
  'logic-the-anatomy-of-an-argument': {
    plates: ['PREMISES', 'FORM', 'VALID', 'SOUND'],
    steps: [
      {
        text: 'Eight lessons taking an argument apart. Two words did most of the work.',
        upto: 4,
        at: 2,
      },
      {
        at: 3,
        ask: {
          prompt: 'An argument has perfect form and a false premise. What is it?',
          sort: {
            chip: 'good form, false premise',
            bins: [
              { id: 'valid', label: 'valid only', reads: 'the form holds; the premise does not', correct: true },
              { id: 'sound', label: 'sound', reads: 'both the form and the premises hold' },
              { id: 'neither', label: 'neither', reads: 'the form fails as well' },
            ],
          },
          explain: 'Valid only. Validity is about the shape: if the premises were true the conclusion would have to follow. Soundness asks for that AND true premises, which is why a valid argument can still tell you nothing.',
          xp: 5,
        },
      },
      {
        text: 'Then a conditional, which is a claim about a link rather than about either half.',
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'The street is wet, so it rained. What has gone wrong?',
          cards: [
            { text: 'The wet street is the consequent, and it does not prove the antecedent', correct: true },
            { text: 'Nothing; rain does make streets wet', correct: false },
          ],
          explain: 'The consequent does not prove the antecedent. Rain would make the street wet, and so would a burst pipe. Affirming the consequent looks valid because the conditional is true, which is what makes it a trap.',
          xp: 5,
        },
      },
      {
        text: 'Two moves in the unit always work, and two only look as though they do.',
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'What do the two reliable moves guarantee?',
          poll: {
            options: [
              { id: 'guar', reads: 'True premises make the conclusion true, with no exceptions' },
              { id: 'likely', reads: 'True premises make the conclusion very likely' },
              { id: 'usual', reads: 'They work in most ordinary cases' },
            ],
          },
          explain: 'No exceptions. That is the whole difference between a deductive move and a strong inductive one: the first leaves no room at all, and the second leaves a little however good the evidence is.',
          xp: 5,
        },
      },
      {
        text: 'And one lesson was about arguments with many steps.',
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'A proof has nine good steps and one bad one. How much of it survives?',
          drag: {
            lo: 'none of it',
            hi: 'nearly all of it',
            start: 0.95,
            zones: [
              { id: 'none', upto: 0.34, reads: 'the proof fails; a chain is only as good as its worst link', correct: true },
              { id: 'most', upto: 0.68, reads: 'most of it stands' },
              { id: 'all', upto: 1, reads: 'one step hardly matters' },
            ],
          },
          explain: 'The proof fails. A chain of reasoning is not a vote among its steps: if any single one does not hold, the conclusion is no longer carried, however respectable the rest look.',
          xp: 5,
        },
      },
    ],
  },

  // ── LOGIC 2 · Where Arguments Cheat ─────────────────────────────────────────
  'logic-where-arguments-cheat': {
    plates: ['DISTRACTION', 'UNSAID', 'CIRCULAR', 'ONLY TWO'],
    steps: [
      {
        text: 'Seven lessons on arguments that cheat, and most of them cheat quietly.',
        upto: 4,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'Why can a circular argument never establish anything?',
          cards: [
            { text: 'Its support comes from the thing it is meant to support', correct: true },
            { text: 'Its premises are false', correct: false },
          ],
          explain: 'Its support comes from inside. Every premise may be perfectly true; the problem is that a proof has to rest on something the conclusion is not already assuming, and this one does not.',
          xp: 5,
        },
      },
      {
        text: 'One lesson was about the premise nobody says out loud.',
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'An argument that leans on a premise it never states is called what?',
          sort: {
            chip: 'the missing premise',
            bins: [
              { id: 'enth', label: 'an enthymeme', reads: 'a premise left unsaid', correct: true },
              { id: 'fall', label: 'a fallacy', reads: 'an invalid form' },
              { id: 'analogy', label: 'an analogy', reads: 'a comparison between cases' },
            ],
          },
          explain: 'An enthymeme. It is not automatically a fault \u2014 most everyday reasoning leaves something obvious unsaid \u2014 but naming the missing premise is how you find out whether it is one anybody would grant.',
          xp: 5,
        },
      },
      {
        text: 'And one on the argument that offers you a choice of two.',
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'Where exactly is the fallacy in a false dilemma?',
          poll: {
            options: [
              { id: 'third', reads: 'In the unargued claim that there is no third option' },
              { id: 'two', reads: 'In offering two options at all' },
              { id: 'pref', reads: 'In preferring one of the two' },
            ],
          },
          explain: 'In the unargued claim. Some choices really are between two things, so offering a pair is not the fault; presenting the pair as exhaustive without showing it is.',
          xp: 5,
        },
      },
      {
        text: 'The last of them was a slope, and the unit said when a slope is fair.',
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'What makes a slippery-slope argument legitimate rather than a fallacy?',
          drag: {
            lo: 'nothing; it always fails',
            hi: 'each step is evidenced',
            start: 0.06,
            zones: [
              { id: 'never', upto: 0.3, reads: 'a slope is always a fallacy' },
              { id: 'end', upto: 0.6, reads: 'the far end has to be bad enough' },
              { id: 'steps', upto: 1, reads: 'every step on the way has evidence for it', correct: true },
            ],
          },
          explain: 'Every step. The form is perfectly respectable when each link is supported \u2014 that is how a real risk is argued. It fails when the steps are asserted rather than shown, and the far end does the persuading.',
          xp: 5,
        },
      },
    ],
  },

  // ── LOGIC 3 · Evidence, Bias & the Fair Fight ───────────────────────────────
  'logic-evidence-bias-and-the-fair-fight': {
    plates: ['THE SAMPLE', 'AFTER', 'THE SOURCE', 'THE STRAW MAN'],
    steps: [
      {
        text: 'Seven lessons on evidence and the ways a mind mishandles it.',
        upto: 2,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'What does a sample need before it supports a claim about everybody?',
          sort: {
            chip: 'a good sample',
            bins: [
              { id: 'both', label: 'big and fair', reads: 'large enough, and not picked to suit', correct: true },
              { id: 'big', label: 'big', reads: 'size is what matters' },
              { id: 'fair', label: 'fair', reads: 'fairness is what matters' },
            ],
          },
          explain: 'Both. A huge sample drawn from one sort of person is still a portrait of that sort, and a perfectly fair sample of two people is still two people. Either failure on its own sinks it.',
          xp: 5,
        },
      },
      {
        text: 'One lesson was about a sequence mistaken for a cause.',
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'Every cause comes before its effect. What else does?',
          cards: [
            { text: 'Every coincidence', correct: true },
            { text: 'Nothing else does', correct: false },
          ],
          explain: 'Every coincidence. Coming first is something causes and accidents have in common, so the order of events narrows nothing down by itself. That is the whole of post hoc in one line.',
          xp: 5,
        },
      },
      {
        text: 'Another was about the cards you would need to turn over.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'Which card can actually test a rule?',
          poll: {
            options: [
              { id: 'refute', reads: 'The one that could show the rule false', holders: ['Peter Wason'] },
              { id: 'confirm', reads: 'The one that could show the rule true' },
              { id: 'either', reads: 'Either does the same work' },
            ],
          },
          explain: 'The one that could refute it. Turning a card that can only agree with you adds nothing, and Wason\u2019s finding was that this is the card almost everybody reaches for.',
          xp: 5,
        },
      },
      {
        text: 'And the unit asked which version of an opponent you should argue with.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'A straw man is usually not a lie. What is it?',
          drag: {
            lo: 'a deliberate lie',
            hi: 'the version you happened to hear',
            start: 0.05,
            zones: [
              { id: 'lie', upto: 0.3, reads: 'a knowing misrepresentation' },
              { id: 'lazy', upto: 0.58, reads: 'carelessness about the details' },
              { id: 'weak', upto: 1, reads: 'the weakest version, argued against in good faith', correct: true },
            ],
          },
          explain: 'The weakest version. People generally answer the form of a view they actually met, which is why the remedy is to build the strongest version first rather than to accuse anybody of dishonesty.',
          xp: 5,
        },
      },
    ],
  },

  // ── LOGIC 4 · The Logician's Toolkit ────────────────────────────────────────
  'logic-the-logician-s-toolkit': {
    plates: ['NECESSARY', 'SUFFICIENT', 'ALL AND SOME', 'BASE RATE'],
    steps: [
      {
        text: 'Five lessons of equipment. The first two words are the ones people run together.',
        upto: 2,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'Oxygen for fire: which is it?',
          sort: {
            chip: 'oxygen',
            bins: [
              { id: 'nec', label: 'necessary', reads: 'no fire without it, but it is not enough', correct: true },
              { id: 'suf', label: 'sufficient', reads: 'having it guarantees fire' },
              { id: 'both', label: 'both', reads: 'it is the whole story' },
            ],
          },
          explain: 'Necessary. There is no fire without oxygen and a room full of it need not be burning, which is exactly the pair of facts the two words keep apart. Necessity and sufficiency are separate questions about the same condition.',
          xp: 5,
        },
      },
      {
        text: 'Then the quantifiers, where a single word changes what is being claimed.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'What does it take to refute a universal claim?',
          cards: [
            { text: 'One counter-example', correct: true },
            { text: 'A majority of cases against it', correct: false },
          ],
          explain: 'One. A universal claim says something of every member, so a single member that does not fit is enough to sink it. That asymmetry is why universal claims are strong and easy to attack at once.',
          xp: 5,
        },
      },
      {
        text: 'One lesson sorted reasoning into three kinds.',
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'Which kind adds no fact the premises did not already contain?',
          poll: {
            options: [
              { id: 'ded', reads: 'Deduction, which unpacks what is already there' },
              { id: 'ind', reads: 'Induction, which generalises from cases' },
              { id: 'abd', reads: 'Abduction, which reaches for the best explanation' },
            ],
          },
          explain: 'Deduction. It rearranges what the premises already hold, which is why it can guarantee its conclusion. The other two add something, and that is both what makes them useful and why they can go wrong.',
          xp: 5,
        },
      },
      {
        text: 'And one on the number people forget when a test comes back positive.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'A very accurate test, a very rare condition, a positive result. How likely is it that you have it?',
          drag: {
            lo: 'much lower than the accuracy',
            hi: 'about the accuracy',
            start: 0.95,
            zones: [
              { id: 'low', upto: 0.4, reads: 'much lower, because almost nobody has it', correct: true },
              { id: 'mid', upto: 0.7, reads: 'somewhat lower' },
              { id: 'high', upto: 1, reads: 'roughly the accuracy of the test' },
            ],
          },
          explain: 'Much lower. When the condition is rare, the few false positives drawn from the enormous healthy group outnumber the true ones, so the base rate can matter more than the accuracy does.',
          xp: 5,
        },
      },
    ],
  },

  // ── LOGIC 5 · Advanced Moves & Mastery ──────────────────────────────────────
  'logic-advanced-moves-and-mastery': {
    plates: ['THE OPPOSITE', 'ANALOGY', 'THE BURDEN', 'SIMPLICITY'],
    steps: [
      {
        text: 'Fourteen lessons of sharper instruments. One of them proves a thing by assuming the opposite.',
        upto: 1,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'How does a proof by contradiction begin?',
          cards: [
            { text: 'By assuming the claim is false', correct: true },
            { text: 'By assuming the claim is true', correct: false },
          ],
          explain: 'By assuming it is false. You take the denial, follow it until it collides with itself, and the collision is what leaves the original standing. Assuming what you want is the circular argument from the second unit.',
          xp: 5,
        },
      },
      {
        text: 'One lesson was about arguing from one case to another.',
        upto: 2,
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'How much does it take to defeat an argument from analogy?',
          drag: {
            lo: 'one relevant difference',
            hi: 'most of the similarities',
            start: 0.92,
            zones: [
              { id: 'one', upto: 0.34, reads: 'a single relevant difference can do it', correct: true },
              { id: 'few', upto: 0.66, reads: 'several differences are needed' },
              { id: 'most', upto: 1, reads: 'the cases must be mostly unalike' },
            ],
          },
          explain: 'One, if it is the relevant one. The analogy rests on the two cases sharing the feature that does the work, so a difference at exactly that point breaks it however alike they are otherwise.',
          xp: 5,
        },
      },
      {
        text: 'Another settled who has to do the proving.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'Where does the burden of proof fall?',
          sort: {
            chip: 'the burden',
            bins: [
              { id: 'assert', label: 'on whoever asserts', reads: 'the one making the claim owes the reason', correct: true },
              { id: 'doubt', label: 'on the doubter', reads: 'the sceptic must disprove it' },
              { id: 'split', label: 'always shared', reads: 'both sides owe the same' },
            ],
          },
          explain: 'On whoever asserts. Putting it on the doubter would let any claim at all stand until somebody disproved it, which is the move the unit kept finding underneath arguments that seemed to win too easily.',
          xp: 5,
        },
      },
      {
        text: 'And one asked how simple an explanation ought to be.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'Why prefer the explanation with fewer parts?',
          poll: {
            options: [
              { id: 'risk', reads: 'Every extra part is one more thing that could be false' },
              { id: 'nice', reads: 'Simple explanations are more elegant' },
              { id: 'true', reads: 'Nature is simple, so simpler is more likely true' },
            ],
          },
          explain: 'Every extra part is a further assumption. The preference is about exposure rather than taste: a story with six moving parts has six ways to be wrong, and nothing guarantees nature is tidy.',
          xp: 5,
        },
      },
    ],
  },
  // ── METAPHYSICS 1 · Being & Non-Being ───────────────────────────────────────
  'metaphysics-being-and-non-being': {
    plates: ['WHY ANYTHING', 'THE FORMS', 'NO NOTHING', 'BEING HERE'],
    steps: [
      {
        text: 'Five lessons on the oldest question there is.',
        upto: 1,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'Why can physics not answer why there is anything at all?',
          cards: [
            { text: 'Every physical explanation already assumes states and laws exist', correct: true },
            { text: 'Because the question is meaningless', correct: false },
          ],
          explain: 'It already assumes them. A physical explanation says how one state follows from another under some law, so it takes states and laws as given \u2014 which are exactly what the question is asking about.',
          xp: 5,
        },
      },
      {
        text: 'One answer said the ordinary world is a copy of something steadier.',
        upto: 2,
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'On Plato\u2019s account, what is a particular circle drawn on paper?',
          sort: {
            chip: 'a drawn circle',
            bins: [
              { id: 'copy', label: 'an imperfect copy', reads: 'it falls short of the Form it imitates', correct: true },
              { id: 'real', label: 'the real thing', reads: 'circles are just the drawn ones' },
              { id: 'name', label: 'only a name', reads: 'circle is a word we use' },
            ],
          },
          explain: 'An imperfect copy. No drawn circle is perfectly round, yet everyone can tell it is failing at something \u2014 and the Form is what Plato says it is failing at.',
          xp: 5,
        },
      },
      {
        text: 'Another denied that there is any such thing as nothing.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'Parmenides argued that nothing cannot exist. What did he conclude from it?',
          poll: {
            options: [
              { id: 'motion', reads: 'Motion is an illusion, since there is no empty space to move into', holders: ['Parmenides'] },
              { id: 'atoms', reads: 'The world is made of atoms moving in a void', holders: ['Democritus'] },
              { id: 'forms', reads: 'The everyday world copies a set of perfect Forms', holders: ['Plato'] },
            ],
          },
          explain: 'Motion is an illusion. If there is no nothing then there is no void, and with nowhere empty to move into, change becomes a show the senses put on. The atomists took the same premise and denied it instead.',
          xp: 5,
        },
      },
      {
        text: 'And the last one turned the question round to the one asking it.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'What is unusual about the kind of being a person has?',
          drag: {
            lo: 'nothing at all',
            hi: 'its own being is a question for it',
            start: 0.06,
            zones: [
              { id: 'same', upto: 0.3, reads: 'the same kind a stone has' },
              { id: 'complex', upto: 0.6, reads: 'the same kind, more complicated' },
              { id: 'issue', upto: 1, reads: 'a being for whom its own being is an issue', correct: true },
            ],
          },
          explain: 'Its own being is an issue for it. A stone is; a person has to decide what to be, and can ask the question at all. That reflexive turn is what the lesson used to separate the two.',
          xp: 5,
        },
      },
    ],
  },

  // ── METAPHYSICS 2 · Change, Identity & the Self ─────────────────────────────
  'metaphysics-change-identity-and-the-self': {
    plates: ['THE SHIP', 'MEMORY', 'THE BUNDLE', 'TWO COPIES'],
    steps: [
      {
        text: 'Eight lessons on staying the same thing while everything about you changes.',
        upto: 1,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'What does numerical identity ask?',
          cards: [
            { text: 'Whether this is one and the same thing over time', correct: true },
            { text: 'Whether two things are exactly alike', correct: false },
          ],
          explain: 'One and the same thing. Two new pins off a production line are exactly alike and are two; the ship with every plank replaced is the puzzle because the question is whether it is one.',
          xp: 5,
        },
      },
      {
        text: 'Locke put the person somewhere other than the body.',
        upto: 2,
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'On Locke\u2019s account, if the prince\u2019s consciousness wakes in the cobbler\u2019s body, who is it?',
          poll: {
            options: [
              { id: 'prince', reads: 'The prince, because the memories went with him', holders: ['John Locke'] },
              { id: 'cobbler', reads: 'The cobbler, because the body did not move' },
              { id: 'neither', reads: 'Neither; a new person begins' },
            ],
          },
          explain: 'The prince. Locke puts the person where the continuous consciousness is rather than where the matter is, which is why the case is a test of the theory rather than a curiosity about bodies.',
          xp: 5,
        },
      },
      {
        text: 'Hume looked for the self and reported what he found.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'Looking inward, Hume found perceptions. What did he never find?',
          sort: {
            chip: 'the self that has them',
            bins: [
              { id: 'never', label: 'never found', reads: 'only a bundle of perceptions, one after another', correct: true },
              { id: 'found', label: 'found it', reads: 'a self standing behind them' },
              { id: 'once', label: 'found it once', reads: 'occasionally, under the right conditions' },
            ],
          },
          explain: 'He never found it. Every time he looked he caught a perception and never the thing having it, which is his reason for saying a self is nothing but the bundle.',
          xp: 5,
        },
      },
      {
        text: 'And the teleporter made a copy, which broke something.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'Two identical people step out. How many of them can be identical to the original?',
          drag: {
            lo: 'neither',
            hi: 'both',
            start: 0.95,
            zones: [
              { id: 'none', upto: 0.3, reads: 'neither, if identity cannot branch' },
              { id: 'one', upto: 0.66, reads: 'at most one, and nothing picks which', correct: true },
              { id: 'two', upto: 1, reads: 'both of them' },
            ],
          },
          explain: 'At most one, and nothing picks which. Identity cannot branch: one person cannot be identical with two people who are not identical with each other. That is what pushed Parfit to say identity is not what matters.',
          xp: 5,
        },
      },
    ],
  },

  // ── METAPHYSICS 3 · The Fabric of Reality ───────────────────────────────────
  'metaphysics-the-fabric-of-reality': {
    plates: ['NECESSARY', 'CAUSE', 'THE HARD PROBLEM', 'NUMBERS'],
    steps: [
      {
        text: 'Seven lessons on what the world is made of, starting with what could have been otherwise.',
        upto: 1,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'What is a necessary truth?',
          cards: [
            { text: 'One that holds in every possible world', correct: true },
            { text: 'One nobody has ever found an exception to', correct: false },
          ],
          explain: 'Every possible world. Never having met an exception is a fact about our record; necessity says there is no way the world could have gone in which it fails, which is a much stronger claim.',
          xp: 5,
        },
      },
      {
        text: 'Hume went looking for the connection between a cause and its effect.',
        upto: 2,
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'Watching one ball strike another, what did Hume say you never observe?',
          poll: {
            options: [
              { id: 'link', reads: 'The necessary connection itself, only one thing then the other', holders: ['David Hume'] },
              { id: 'motion', reads: 'The motion of the second ball' },
              { id: 'contact', reads: 'The moment of contact' },
            ],
          },
          explain: 'The connection itself. You see contact and you see motion; the making, the part that would turn a sequence into a cause, is never in the picture. Hume put it in the habit of the observer instead.',
          xp: 5,
        },
      },
      {
        text: 'One lesson named the part of the mind nobody can explain.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'Which question is the hard problem of consciousness?',
          sort: {
            chip: 'the hard problem',
            bins: [
              { id: 'why', label: 'why it is felt', reads: 'why any of the processing is experienced at all', correct: true },
              { id: 'how', label: 'how it works', reads: 'how the brain processes information' },
              { id: 'where', label: 'where it is', reads: 'which region is responsible' },
            ],
          },
          explain: 'Why any of it is felt. How the brain discriminates, reports and reacts are hard problems in the ordinary sense and progress is being made on them; why there is something it is like to undergo it is the one that does not yield to the same method.',
          xp: 5,
        },
      },
      {
        text: 'And one asked where a number is.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'If numbers are abstract objects, where are they?',
          drag: {
            lo: 'in our heads',
            hi: 'outside space and time',
            start: 0.06,
            zones: [
              { id: 'mind', upto: 0.3, reads: 'in the minds that think them' },
              { id: 'marks', upto: 0.58, reads: 'in the marks we write down' },
              { id: 'abstract', upto: 1, reads: 'nowhere in space or time, and real all the same', correct: true },
            ],
          },
          explain: 'Nowhere in space or time. That is what abstract means here, and the case for it is that seven would still have been prime with nobody about to think so. The cost is explaining how we come to know about such things.',
          xp: 5,
        },
      },
    ],
  },

  // ── METAPHYSICS 4 · Puzzles at the Edge of the Real ─────────────────────────
  'metaphysics-puzzles-at-the-edge-of-the-real': {
    plates: ['THE SIMULATION', 'NOW ONLY', 'THE PARTS', 'THE HEAP'],
    steps: [
      {
        text: 'Six puzzles that push on the edges of what is real.',
        upto: 1,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'What makes the simulation argument bite?',
          cards: [
            { text: 'If such simulations are ever run, simulated minds would far outnumber the rest', correct: true },
            { text: 'That computers are getting faster', correct: false },
          ],
          explain: 'The counting. The argument is not that a simulation is likely on its own; it is that if any civilisation ever runs many, then most minds of your kind are in one, and you have no way to tell which sort you are.',
          xp: 5,
        },
      },
      {
        text: 'One lesson asked whether last Tuesday is still out there.',
        upto: 2,
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'On presentism, what exists?',
          sort: {
            chip: 'the past and the future',
            bins: [
              { id: 'no', label: 'do not exist', reads: 'only this instant is real', correct: true },
              { id: 'yes', label: 'exist', reads: 'all times are equally real' },
              { id: 'past', label: 'only the past', reads: 'what has happened is fixed and real' },
            ],
          },
          explain: 'Only this instant. Presentism takes the passing of time at face value and pays for it by having to say what a true claim about the past is true OF. The rival takes all times as real and has to explain why now feels special.',
          xp: 5,
        },
      },
      {
        text: 'Another asked when a pile of things becomes one thing.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'A pile of planks and a ship contain the same planks. What separates them?',
          poll: {
            options: [
              { id: 'arr', reads: 'How the parts are arranged, and what that lets the whole do' },
              { id: 'count', reads: 'The number of planks' },
              { id: 'nothing', reads: 'Nothing; they are the same thing' },
            ],
          },
          explain: 'The arrangement. A pile of planks is not a ship and nothing was added, so composition is asking when parts make a further thing rather than merely sitting together.',
          xp: 5,
        },
      },
      {
        text: 'And one where every step looked fine and the end did not.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'Removing one grain never turns a heap into a non-heap. Where is the fault?',
          drag: {
            lo: 'in the logic',
            hi: 'in the vagueness of the word',
            start: 0.05,
            zones: [
              { id: 'logic', upto: 0.3, reads: 'the reasoning is invalid' },
              { id: 'facts', upto: 0.56, reads: 'the facts about grains are wrong' },
              { id: 'word', upto: 1, reads: 'the word has no sharp boundary, and the argument needs one', correct: true },
            ],
          },
          explain: 'In the word. Each step is valid and each premise looks true, which is exactly why the sorites is a problem: it shows that a vague term cannot bear a chain of reasoning that assumes a sharp line.',
          xp: 5,
        },
      },
    ],
  },

  // ── METAPHYSICS 5 · Frontiers of Reality ────────────────────────────────────
  'metaphysics-frontiers-of-reality': {
    plates: ['EMERGENCE', 'THE LAWS', 'PERCEIVED', 'THE BOTTOM'],
    steps: [
      {
        text: 'Fifteen lessons at the far edge. One asked whether a whole can have what its parts lack.',
        upto: 1,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'Wetness belongs to the water and not to hydrogen or oxygen. What is that an example of?',
          sort: {
            chip: 'wetness',
            bins: [
              { id: 'emerge', label: 'a property of the whole', reads: 'the arrangement has it and no part does', correct: true },
              { id: 'illusion', label: 'an illusion', reads: 'there is no such property' },
              { id: 'sum', label: 'the sum of the parts', reads: 'each part is a little bit wet' },
            ],
          },
          explain: 'A property of the whole. Neither gas is wet and the arrangement is, which is the pattern the lesson used \u2014 and the live question is whether that is merely how we describe it or something genuinely new.',
          xp: 5,
        },
      },
      {
        text: 'One asked whether a law of nature makes anything happen.',
        upto: 2,
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'A regularity has never failed. Does that make it a law that must hold?',
          cards: [
            { text: 'No \u2014 never failing is not the same as having to hold', correct: true },
            { text: 'Yes \u2014 that is what a law is', correct: false },
          ],
          explain: 'No. Every sphere of gold is under a mile wide and nothing forbids a larger one; the difference between an accident that always holds and a law that compels is the whole question, and regularity alone does not supply it.',
          xp: 5,
        },
      },
      {
        text: 'Berkeley took the shortest route of all.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'What does Berkeley say it is for a thing to exist?',
          poll: {
            options: [
              { id: 'perceived', reads: 'To be perceived', holders: ['George Berkeley'] },
              { id: 'matter', reads: 'To be made of matter' },
              { id: 'caused', reads: 'To have a cause' },
            ],
          },
          explain: 'To be perceived. His argument is that nobody can so much as describe an unperceived thing without perceiving it in thought, so matter beyond all perception is an idea with no content.',
          xp: 5,
        },
      },
      {
        text: 'And one asked whether the levels ever stop.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'What would make a level fundamental?',
          drag: {
            lo: 'being the smallest',
            hi: 'resting on nothing further',
            start: 0.05,
            zones: [
              { id: 'small', upto: 0.34, reads: 'it is the smallest thing we have found' },
              { id: 'known', upto: 0.6, reads: 'nothing below it is known yet' },
              { id: 'nothing', upto: 1, reads: 'there is nothing below it for it to rest on', correct: true },
            ],
          },
          explain: 'Resting on nothing further. Smallest-so-far is a fact about the instruments; fundamental is a claim about the world, and the open possibility is that the levels go down for ever.',
          xp: 5,
        },
      },
    ],
  },
  // ── POLITICAL 1 · Order & the Right to Rule ─────────────────────────────────
  'political-philosophy-order-and-the-right-to-rule': {
    plates: ['THE CONTRACT', 'LEGITIMACY', 'FREEDOM FROM', 'FREEDOM TO'],
    steps: [
      {
        text: 'Five lessons on why anybody gets to make rules for anybody else.',
        upto: 2,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'Nobody ever signed the social contract. What is it, then?',
          cards: [
            { text: 'A test of legitimacy: could free people have agreed to this?', correct: true },
            { text: 'A document that has been lost', correct: false },
          ],
          explain: 'A test. The question it asks is whether the arrangement is one free and equal people could accept, and that can be applied to a state today whatever its history. Read as a document it would be simply false.',
          xp: 5,
        },
      },
      {
        text: 'One lesson put a state and a robber side by side.',
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'A state and a robber both take your money under threat. What tells them apart?',
          sort: {
            chip: 'the difference',
            bins: [
              { id: 'legit', label: 'legitimacy', reads: 'a right to rule, which the robber has not', correct: true },
              { id: 'amount', label: 'the amount', reads: 'the state takes less' },
              { id: 'force', label: 'the force', reads: 'the state is stronger' },
            ],
          },
          explain: 'Legitimacy. Both take by threat, and being stronger or more moderate is not a difference in kind. That is why so much of the unit is spent on where a right to rule could come from.',
          xp: 5,
        },
      },
      {
        text: 'Then two ideas of freedom, which argue for very different politics.',
        upto: 4,
        at: 2,
      },
      {
        at: 3,
        ask: {
          prompt: 'Which idea of freedom is Rousseau reaching for with living under rules you give yourself?',
          poll: {
            options: [
              { id: 'pos', reads: 'Freedom TO: being the author of the rules you live under', holders: ['Jean-Jacques Rousseau'] },
              { id: 'neg', reads: 'Freedom FROM: nobody interfering with you', holders: ['Isaiah Berlin'] },
              { id: 'dom', reads: 'Freedom from anyone holding arbitrary power over you', holders: ['Philip Pettit'] },
            ],
          },
          explain: 'Freedom to. Being left alone is not enough for him \u2014 a person obeying rules they had no hand in is unfree even if nobody touches them. Berlin\u2019s worry was what can be done to people in the name of the freedom they supposedly want.',
          xp: 5,
        },
      },
      {
        text: 'And the unit set out what the rest of the branch would argue about.',
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'How much of politics does the choice between those two freedoms settle?',
          drag: {
            lo: 'nothing',
            hi: 'a great deal',
            start: 0.05,
            zones: [
              { id: 'none', upto: 0.28, reads: 'it is a difference in words only' },
              { id: 'some', upto: 0.56, reads: 'it changes the emphasis' },
              { id: 'lots', upto: 1, reads: 'the two support very different politics', correct: true },
            ],
          },
          explain: 'A great deal. Start from being left alone and the state is a necessary danger; start from authorship and the state is how a people acts at all. Most later disagreements in the branch trace back to it.',
          xp: 5,
        },
      },
    ],
  },

  // ── POLITICAL 2 · The Goods We Argue Over ───────────────────────────────────
  'political-philosophy-the-goods-we-argue-over': {
    plates: ['THE WORST OFF', 'RIGHTS', 'EQUAL WHAT', 'THE COMMONS'],
    steps: [
      {
        text: 'Six lessons on the things politics actually fights about.',
        upto: 1,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'Rawls judges an arrangement by how which group fares?',
          poll: {
            options: [
              { id: 'worst', reads: 'The worst off', holders: ['John Rawls'] },
              { id: 'most', reads: 'The greatest number' },
              { id: 'best', reads: 'The most productive' },
            ],
          },
          explain: 'The worst off. Inequality is allowed only where it makes the bottom position better than it would otherwise be, which is what stops the theory trading a few people away for a larger total.',
          xp: 5,
        },
      },
      {
        text: 'One lesson asked where a right comes from when no law grants it.',
        upto: 2,
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'A human right holds even where the local law denies it. What is it grounded in?',
          cards: [
            { text: 'Something about being a person, prior to any law', correct: true },
            { text: 'International agreement between states', correct: false },
          ],
          explain: 'Something prior to law. If agreement were the ground, a state that had signed nothing would owe nothing \u2014 and the whole force of the idea is that it can be used against a law rather than only within one.',
          xp: 5,
        },
      },
      {
        text: 'Another said a demand for equality is unfinished until it says what.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'Somebody says people should be equal. What is missing?',
          sort: {
            chip: 'equal \u2014 in what?',
            bins: [
              { id: 'what', label: 'the currency', reads: 'equal in what: money, opportunity, capability?', correct: true },
              { id: 'who', label: 'the people', reads: 'which people are meant' },
              { id: 'when', label: 'the timing', reads: 'by when it should hold' },
            ],
          },
          explain: 'The currency. Equal resources, equal opportunity and equal capability pull apart at once for anyone with a disability or an expensive illness, so the demand does not say anything definite until it is named.',
          xp: 5,
        },
      },
      {
        text: 'And one where everybody acting sensibly ruins it for all of them.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'Why does each herder add one more animal to the common field?',
          drag: {
            lo: 'they are careless',
            hi: 'they take the gain and share the cost',
            start: 0.06,
            zones: [
              { id: 'care', upto: 0.3, reads: 'they have not thought it through' },
              { id: 'greed', upto: 0.56, reads: 'they want more than their share' },
              { id: 'split', upto: 1, reads: 'the whole gain is theirs and the cost is split among everyone', correct: true },
            ],
          },
          explain: 'The gain is theirs and the cost is shared. Each herder is reasoning correctly about their own position, which is what makes it a tragedy rather than a failure of character \u2014 and why the remedy has to change the arithmetic.',
          xp: 5,
        },
      },
    ],
  },

  // ── POLITICAL 3 · Liberty, Justice & Dissent ────────────────────────────────
  'political-philosophy-liberty-justice-and-dissent': {
    plates: ['NEGATIVE', 'POSITIVE', 'THE HARM LINE', 'DISOBEDIENCE'],
    steps: [
      {
        text: 'Five lessons on where one person\u2019s liberty stops.',
        upto: 2,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'Negative liberty is entirely about what?',
          sort: {
            chip: 'negative liberty',
            bins: [
              { id: 'others', label: 'other people', reads: 'whether anybody is interfering with you', correct: true },
              { id: 'means', label: 'your means', reads: 'whether you can afford to act' },
              { id: 'will', label: 'your will', reads: 'whether you really want it' },
            ],
          },
          explain: 'Other people. On this reading you are free to do a thing if nobody is stopping you, whether or not you could possibly manage it \u2014 which is precisely the gap the positive idea says is doing the work.',
          xp: 5,
        },
      },
      {
        text: 'Mill drew the line in one place and one place only.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'On the harm principle, what is the only ground for interfering?',
          poll: {
            options: [
              { id: 'harm', reads: 'Preventing harm to other people', holders: ['John Stuart Mill'] },
              { id: 'good', reads: 'The person\u2019s own good' },
              { id: 'offend', reads: 'That others find it offensive' },
            ],
          },
          explain: 'Harm to others. Mill rules out the person\u2019s own good explicitly, which is the part that makes the principle bite \u2014 and offence, on his account, is not harm however widely it is felt.',
          xp: 5,
        },
      },
      {
        text: 'Rawls and Nozick disagreed about a distribution that arose from free choices.',
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'Nozick\u2019s case is that every single transfer was free. What follows?',
          cards: [
            { text: 'The result is just, however unequal it turns out', correct: true },
            { text: 'The result is just only if the pattern is acceptable', correct: false },
          ],
          explain: 'However unequal. On his account justice is a matter of how a holding came about, not what the distribution looks like at the end \u2014 and that is exactly what Rawls denies by judging the pattern.',
          xp: 5,
        },
      },
      {
        text: 'And one lesson said that breaking a law can respect it.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'What makes an act civil disobedience rather than ordinary lawbreaking?',
          drag: {
            lo: 'nothing; it is the same',
            hi: 'it is done openly and accepts the penalty',
            start: 0.05,
            zones: [
              { id: 'same', upto: 0.28, reads: 'no real difference' },
              { id: 'cause', upto: 0.56, reads: 'the cause is a good one' },
              { id: 'open', upto: 1, reads: 'done openly, appealing to the law, and taking the penalty', correct: true },
            ],
          },
          explain: 'Openly, and taking the penalty. That is what makes it an appeal to the community\u2019s own principles rather than an evasion of them, and why it can be the most law-respecting thing a person does.',
          xp: 5,
        },
      },
    ],
  },

  // ── POLITICAL 4 · Cracks in the Consensus ───────────────────────────────────
  'political-philosophy-cracks-in-the-consensus': {
    plates: ['ALIENATION', 'FAIR PLAY', 'STRANGERS', 'DOMINATION'],
    steps: [
      {
        text: 'Seven lessons pressing on the agreement the branch had reached.',
        upto: 1,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'Marx\u2019s complaint about the production line is about what?',
          cards: [
            { text: 'The worker is separated from what their work is for', correct: true },
            { text: 'The wage is too low', correct: false },
          ],
          explain: 'Separated from what it is for. The line sets the pace, the product belongs to somebody else and the work expresses nothing of the person doing it. Raising the wage leaves all three exactly as they are.',
          xp: 5,
        },
      },
      {
        text: 'One lesson found a reason to obey that needs no signature.',
        upto: 2,
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'What does the fair-play argument say you owe?',
          poll: {
            options: [
              { id: 'fair', reads: 'Your share, because you take the benefits others are paying for', holders: ['H. L. A. Hart', 'John Rawls'] },
              { id: 'sign', reads: 'Nothing, unless you agreed to it' },
              { id: 'force', reads: 'Whatever is demanded, since the state can compel you' },
            ],
          },
          explain: 'Your share of the burden. It stops asking about signatures altogether: taking the benefit of a scheme other people are shouldering is what generates the obligation, whether or not anybody consented.',
          xp: 5,
        },
      },
      {
        text: 'Another asked how far an obligation to strangers can reach.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'The principle says help when you can at little cost. What is the trouble with it?',
          sort: {
            chip: 'the trouble',
            bins: [
              { id: 'stop', label: 'where it stops', reads: 'nothing in it says when you have done enough', correct: true },
              { id: 'false', label: 'it is false', reads: 'you owe strangers nothing' },
              { id: 'vague', label: 'it is vague', reads: 'the words are unclear' },
            ],
          },
          explain: 'Where it stops. Almost everybody accepts the principle in the small case, and applied consistently it keeps demanding more until you are as badly off as those you are helping. Finding the stopping point is the work.',
          xp: 5,
        },
      },
      {
        text: 'And one offered a third kind of freedom.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'A kind master never interferes with you. On the republican view, are you free?',
          drag: {
            lo: 'yes, nobody interferes',
            hi: 'no, somebody could at any time',
            start: 0.05,
            zones: [
              { id: 'yes', upto: 0.3, reads: 'free, since nothing is being done to you' },
              { id: 'mostly', upto: 0.56, reads: 'mostly free' },
              { id: 'no', upto: 1, reads: 'unfree, because you live at another\u2019s discretion', correct: true },
            ],
          },
          explain: 'Unfree. Non-domination asks who could interfere without having to answer for it, not who is doing so today \u2014 which is why it argues for laws and courts rather than merely for being left alone.',
          xp: 5,
        },
      },
    ],
  },

  // ── POLITICAL 5 · Identity & the Hard Cases ─────────────────────────────────
  'political-philosophy-identity-and-the-hard-cases': {
    plates: ['TRADITION', 'RECOGNITION', 'THE BORDER', 'NOT FOR SALE'],
    steps: [
      {
        text: 'Eighteen lessons of hard cases, starting with a challenge to the whole method.',
        upto: 1,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'What is the communitarian objection to reasoning from behind a veil of ignorance?',
          cards: [
            { text: 'A person stripped of every attachment has nothing to reason from', correct: true },
            { text: 'The veil is too thin to work', correct: false },
          ],
          explain: 'Nothing to reason from. The objection is that morality only makes sense inside a tradition, so a chooser with no history, no ties and no idea of the good is not a neutral judge but an empty one.',
          xp: 5,
        },
      },
      {
        text: 'One lesson set two ways of treating people against each other.',
        upto: 2,
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'Which pair does the politics of recognition put in tension?',
          poll: {
            options: [
              { id: 'both', reads: 'Treating everyone alike, and recognising each group\u2019s own way of life', holders: ['Charles Taylor'] },
              { id: 'rich', reads: 'The rich and the poor' },
              { id: 'state', reads: 'The state and the market' },
            ],
          },
          explain: 'Alike, against recognised. Identical treatment can flatten what makes a group what it is, and recognising difference can mean not treating people the same. Taylor\u2019s point is that both are demands of dignity.',
          xp: 5,
        },
      },
      {
        text: 'Another asked whether a state may shut its border.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'Why is citizenship a hard case for a theory of justice?',
          sort: {
            chip: 'citizenship',
            bins: [
              { id: 'birth', label: 'inherited', reads: 'it is handed down at birth and shapes a whole life', correct: true },
              { id: 'earned', label: 'earned', reads: 'people acquire it by their own effort' },
              { id: 'minor', label: 'a formality', reads: 'it makes little difference to a life' },
            ],
          },
          explain: 'Inherited. A theory that objects to unearned advantage has to say something about the largest unearned advantage most people have, and nobody chose where they were born.',
          xp: 5,
        },
      },
      {
        text: 'And one on the things that change when they are priced.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'A market in a good can do more than allocate it. What else?',
          drag: {
            lo: 'nothing else',
            hi: 'it changes what the good is',
            start: 0.05,
            zones: [
              { id: 'none', upto: 0.3, reads: 'a price is only a price' },
              { id: 'some', upto: 0.56, reads: 'it changes who gets it' },
              { id: 'corr', upto: 1, reads: 'some goods are changed by being bought and sold', correct: true },
            ],
          },
          explain: 'It can change the good. A paid apology and a paid friendship are not the same things more efficiently distributed, which is why the argument is about corruption rather than only about fairness.',
          xp: 5,
        },
      },
    ],
  },
  // ── AESTHETICS 1 · What Is Aesthetics? ──────────────────────────────────────
  'aesthetics-what-is-aesthetics': {
    plates: ['NO STAKE', 'THE ARTWORLD', 'THE SUBLIME', 'FORM'],
    steps: [
      {
        text: 'Ten lessons on beauty and art, beginning with a strange condition on looking.',
        upto: 1,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'Kant says the judgement of beauty is disinterested. What does that rule out?',
          cards: [
            { text: 'Wanting anything from the thing you are looking at', correct: true },
            { text: 'Having any feeling about it', correct: false },
          ],
          explain: 'Wanting anything from it. Disinterest is not indifference \u2014 the pleasure is real and strong \u2014 but it does not depend on owning, eating or using the thing, and that is what separates beauty from appetite.',
          xp: 5,
        },
      },
      {
        text: 'One lesson answered why an ordinary object in a gallery becomes art.',
        upto: 2,
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'On the institutional theory, what makes the readymade art?',
          poll: {
            options: [
              { id: 'world', reads: 'The practices of the artworld confer the status', holders: ['George Dickie'] },
              { id: 'looks', reads: 'Something visible in the object itself' },
              { id: 'intent', reads: 'The maker having felt something while making it' },
            ],
          },
          explain: 'The artworld confers it. An identical object in a plumbing showroom is not art, so whatever does the work is not in the object \u2014 which is exactly the case the theory was built to handle.',
          xp: 5,
        },
      },
      {
        text: 'Another was about standing in front of something far too big.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'Where is the sublime, on Kant\u2019s account?',
          sort: {
            chip: 'the sublime',
            bins: [
              { id: 'mind', label: 'in the mind', reads: 'in the mind that finds it can still think the whole', correct: true },
              { id: 'mountain', label: 'in the mountain', reads: 'the mountain is the sublime thing' },
              { id: 'fear', label: 'in the fear', reads: 'it is simply being frightened' },
            ],
          },
          explain: 'In the mind. The mountain overwhelms the senses and reason takes it in anyway, and the feeling is of that discovery about yourself. The mountain is only the occasion for it.',
          xp: 5,
        },
      },
      {
        text: 'And one asked whether what a work invites you to feel is part of the work.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'A beautifully made work invites cruelty. How much does that bear on it as art?',
          drag: {
            lo: 'nothing at all',
            hi: 'it is part of the work',
            start: 0.05,
            zones: [
              { id: 'none', upto: 0.3, reads: 'the craft is the whole of it' },
              { id: 'some', upto: 0.56, reads: 'it matters morally but not aesthetically' },
              { id: 'part', upto: 1, reads: 'what it invites you to feel is part of the work itself', correct: true },
            ],
          },
          explain: 'Part of the work. If a work asks for a response and the response is not worth having, the failure is in the work rather than only in the viewer \u2014 which is the position the lesson reached after trying the alternatives.',
          xp: 5,
        },
      },
    ],
  },

  // ── AESTHETICS 2 · Theories & Hard Cases ────────────────────────────────────
  'aesthetics-theories-and-hard-cases': {
    plates: ['PROVENANCE', 'TRUE JUDGES', 'THE MACHINE', 'THE PLAQUE'],
    steps: [
      {
        text: 'Eleven hard cases, and the first one you cannot see your way out of.',
        upto: 1,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'A perfect forgery is indistinguishable from the original. What is it missing?',
          cards: [
            { text: 'Its history \u2014 where it has been since it was made', correct: true },
            { text: 'Some detail an expert can eventually see', correct: false },
          ],
          explain: 'Its history. Stipulate that no examination could tell them apart and the difference is still there, which shows the thing you were valuing was never only what is on the canvas.',
          xp: 5,
        },
      },
      {
        text: 'Hume tried to settle taste without making it a matter of fact.',
        upto: 2,
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'What does Hume offer as the standard of taste?',
          poll: {
            options: [
              { id: 'judges', reads: 'The joint verdict of experienced, unprejudiced judges', holders: ['David Hume'] },
              { id: 'vote', reads: 'Whatever most people prefer' },
              { id: 'fact', reads: 'A property of the object anyone can measure' },
            ],
          },
          explain: 'The joint verdict of true judges. Not a vote, because most people have not looked at very much, and not a measurable property, because he does not think beauty is in the object at all.',
          xp: 5,
        },
      },
      {
        text: 'Then a machine made something, and the two were hung side by side.',
        upto: 4,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'Two indistinguishable pictures, one by a person and one by a machine. What tells them apart?',
          sort: {
            chip: 'the difference',
            bins: [
              { id: 'plaque', label: 'only the plaque', reads: 'nothing visible; only what you are told', correct: true },
              { id: 'style', label: 'the style', reads: 'the human one looks different' },
              { id: 'quality', label: 'the quality', reads: 'the human one is better made' },
            ],
          },
          explain: 'Only the plaque. That is what makes the case hard: if the difference cannot be seen, then anything it changes about the work is something other than how it looks \u2014 the same move the forgery made.',
          xp: 5,
        },
      },
      {
        text: 'And one asked what survives when a work is replaceable.',
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'A thing can be perfectly replaceable and still be worth having. How far does that go?',
          drag: {
            lo: 'only for cheap things',
            hi: 'it holds generally',
            start: 0.06,
            zones: [
              { id: 'cheap', upto: 0.32, reads: 'only where nothing is at stake' },
              { id: 'some', upto: 0.6, reads: 'for some works and not others' },
              { id: 'all', upto: 1, reads: 'replaceability and worth are separate questions', correct: true },
            ],
          },
          explain: 'They are separate questions. Being irreplaceable is one reason a thing can matter and it is not the only one, which is what lets the unit keep the value of art without resting all of it on rarity.',
          xp: 5,
        },
      },
    ],
  },

  // ── AESTHETICS 3 · Puzzles at the Edge ──────────────────────────────────────
  'aesthetics-puzzles-at-the-edge': {
    plates: ['FICTION', 'THE SCORE', 'THE FRAME', 'THE JOKE'],
    steps: [
      {
        text: 'Twenty puzzles at the edge. The first is why you cry over somebody who never lived.',
        upto: 1,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'You know the character is invented. Why does it still move you?',
          cards: [
            { text: 'Vividly imagining a thing is enough to move you', correct: true },
            { text: 'You briefly forget it is fiction', correct: false },
          ],
          explain: 'Imagining it is enough. Nobody in the cinema is confused about what is on the screen, so an account that needs them to forget is explaining a mistake they are not making.',
          xp: 5,
        },
      },
      {
        text: 'One lesson asked where a symphony actually is.',
        upto: 2,
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'Burn every copy of the score and every recording. Has the symphony gone?',
          sort: {
            chip: 'the symphony',
            bins: [
              { id: 'type', label: 'no', reads: 'the work is a type; the copies were instances of it', correct: true },
              { id: 'yes', label: 'yes', reads: 'the work was the copies' },
              { id: 'part', label: 'partly', reads: 'some of it survives' },
            ],
          },
          explain: 'No. That is the reason for saying a musical work is a type rather than any physical thing: a painting can be destroyed and a symphony survives the loss of every copy of itself.',
          xp: 5,
        },
      },
      {
        text: 'Another asked where a work stops.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'Is the frame part of the painting?',
          poll: {
            options: [
              { id: 'hard', reads: 'It is the difficult case, and the answer varies by work' },
              { id: 'yes', reads: 'Always \u2014 anything attached is part of it' },
              { id: 'no', reads: 'Never \u2014 the work stops at the canvas' },
            ],
          },
          explain: 'It is the difficult case. Some frames were chosen by the painter and some were fitted by a dealer a century later, so no general rule about attachment settles it \u2014 which is why the frame is the example the lesson uses.',
          xp: 5,
        },
      },
      {
        text: 'And one on why explaining a joke destroys it.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'What does explaining a joke take away?',
          drag: {
            lo: 'nothing; it still works',
            hi: 'the moment of finding the second reading',
            start: 0.05,
            zones: [
              { id: 'none', upto: 0.28, reads: 'the joke is unaffected' },
              { id: 'some', upto: 0.56, reads: 'some of the pleasure' },
              { id: 'all', upto: 1, reads: 'the discovery, which was the whole of it', correct: true },
            ],
          },
          explain: 'The discovery. The pleasure is in finding the second reading yourself, so handing it over in advance leaves the structure intact and nothing for the listener to do.',
          xp: 5,
        },
      },
    ],
  },

  // ── EPISTEMOLOGY 3 · Evidence, Science & the Crowd ──────────────────────────
  'epistemology-evidence-science-and-the-crowd': {
    plates: ['FALSIFIABLE', 'THE FRAME', 'THE PRIOR', 'THE CROWD'],
    steps: [
      {
        text: 'Five lessons on evidence and the people who handle it.',
        upto: 1,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'What does a scientific claim have to be able to do?',
          cards: [
            { text: 'Rule something out, so an observation could count against it', correct: true },
            { text: 'Fit every observation made so far', correct: false },
          ],
          explain: 'Rule something out. A theory that fits everything forbids nothing and so is never at risk, which is the mark Popper used to separate science from a story that merely accommodates the facts.',
          xp: 5,
        },
      },
      {
        text: 'Kuhn said most science is not doing that at all.',
        upto: 2,
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'What is normal science mostly doing?',
          poll: {
            options: [
              { id: 'puzzle', reads: 'Solving puzzles inside a frame nobody is testing', holders: ['Thomas Kuhn'] },
              { id: 'test', reads: 'Trying to refute the reigning theory', holders: ['Karl Popper'] },
              { id: 'collect', reads: 'Collecting observations with no theory in mind' },
            ],
          },
          explain: 'Solving puzzles inside the frame. Kuhn\u2019s observation is that the frame itself is almost never on trial, and that is not a failing: it is what lets detailed work get done until the anomalies pile up.',
          xp: 5,
        },
      },
      {
        text: 'One lesson was about how far a single fact should move you.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'The same piece of evidence arrives. Whose belief does it move more?',
          sort: {
            chip: 'one new fact',
            bins: [
              { id: 'unsure', label: 'the undecided one', reads: 'it moves a belief that was near the middle', correct: true },
              { id: 'sure', label: 'the near-certain one', reads: 'it moves a belief that was already settled' },
              { id: 'same', label: 'both alike', reads: 'the starting point makes no difference' },
            ],
          },
          explain: 'The undecided one. What you already believed sets how much a new fact can shift you, which is why two honest people can read the same study and end up no closer together.',
          xp: 5,
        },
      },
      {
        text: 'And one on why a crowd agreeing is weaker evidence than it looks.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'A hundred accounts in a feed say the same thing. How many independent sources is that?',
          drag: {
            lo: 'possibly one',
            hi: 'a hundred',
            start: 0.95,
            zones: [
              { id: 'one', upto: 0.34, reads: 'possibly one, repeated', correct: true },
              { id: 'few', upto: 0.66, reads: 'a handful' },
              { id: 'hundred', upto: 1, reads: 'a hundred' },
            ],
          },
          explain: 'Possibly one. Agreement is strong evidence only when the sources are independent, and a feed is built to spread one claim \u2014 so the thing that makes agreement worth anything is exactly what it removes.',
          xp: 5,
        },
      },
    ],
  },

  // ── EPISTEMOLOGY 4 · What Holds Belief Up ───────────────────────────────────
  'epistemology-what-holds-belief-up': {
    plates: ['LUCK', 'CHARACTER', 'HERE IS ONE HAND', 'MEMORY'],
    steps: [
      {
        text: 'Six lessons on what a belief is resting on.',
        upto: 1,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'A true belief and knowledge both get today right. Where is the extra value?',
          cards: [
            { text: 'Not in today at all \u2014 in what happens next time', correct: true },
            { text: 'In today being more certain', correct: false },
          ],
          explain: 'Not in today. Both have the right answer now; the one that is connected to the truth will go on being right, and the lucky one has nothing to make that so. That is why the value question is about reliability.',
          xp: 5,
        },
      },
      {
        text: 'Moore answered the sceptic by holding up a hand.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'What is the shape of Moore\u2019s reply?',
          poll: {
            options: [
              { id: 'certain', reads: 'I am more sure of this hand than of any premise against it', holders: ['G. E. Moore'] },
              { id: 'proof', reads: 'Here is a proof that the sceptical hypothesis is false' },
              { id: 'useless', reads: 'The sceptical question cannot be understood' },
            ],
          },
          explain: 'More sure of the hand. He does not refute the argument; he turns it round, because an argument is only as good as its least certain premise, and none of them is as certain as the hand.',
          xp: 5,
        },
      },
      {
        text: 'One lesson asked whether you can believe something at will.',
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'Try to believe it is raining when you can see that it is not. What happens?',
          sort: {
            chip: 'believing at will',
            bins: [
              { id: 'cant', label: 'you cannot', reads: 'belief aims at truth and will not be chosen', correct: true },
              { id: 'can', label: 'you can', reads: 'with enough effort you could' },
              { id: 'some', label: 'sometimes', reads: 'it depends on the belief' },
            ],
          },
          explain: 'You cannot. You can decide to look into it, or to act as if, and the belief itself does not answer to the decision. That is why belief is said to aim at truth rather than at usefulness.',
          xp: 5,
        },
      },
      {
        text: 'And one asked how you could ever check your own memory.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'Every check you could run on your memory depends on what?',
          drag: {
            lo: 'something independent',
            hi: 'memory again',
            start: 0.05,
            zones: [
              { id: 'indep', upto: 0.3, reads: 'an independent record settles it' },
              { id: 'partly', upto: 0.58, reads: 'partly on memory' },
              { id: 'mem', upto: 1, reads: 'on memory itself, all the way down', correct: true },
            ],
          },
          explain: 'On memory itself. Checking a diary requires remembering what the diary is and that you wrote it, so no test gets outside the faculty it is testing \u2014 which is why the case is a problem rather than a chore.',
          xp: 5,
        },
      },
    ],
  },

  // ── EPISTEMOLOGY 5 · The Wise Knower ────────────────────────────────────────
  'epistemology-the-wise-knower': {
    plates: ['YOUR EQUAL', 'THE LAWYER', 'KNOWING WHY', 'CALIBRATION'],
    steps: [
      {
        text: 'Fifteen lessons on being a good thinker rather than merely a correct one.',
        upto: 1,
        at: 0,
      },
      {
        at: 0,
        ask: {
          prompt: 'Somebody as careful and as informed as you disagrees. What is that?',
          cards: [
            { text: 'Evidence, which your view has to account for', correct: true },
            { text: 'Their problem to sort out', correct: false },
          ],
          explain: 'Evidence. If you grant they are your equal at this, their reaching the opposite conclusion is itself a fact about the question \u2014 and carrying on unmoved means quietly withdrawing the concession.',
          xp: 5,
        },
      },
      {
        text: 'One lesson described what reasoning usually is.',
        upto: 2,
        at: 1,
      },
      {
        at: 1,
        ask: {
          prompt: 'Most of the time, what is your reasoning doing?',
          poll: {
            options: [
              { id: 'lawyer', reads: 'Defending a verdict it has already reached', holders: ['Jonathan Haidt'] },
              { id: 'judge', reads: 'Weighing the evidence and then deciding' },
              { id: 'random', reads: 'Nothing in particular' },
            ],
          },
          explain: 'Defending a verdict already reached. The finding is that the conclusion usually arrives first and the argument is assembled afterwards, which is why noticing how quickly you were sure is worth more than trusting the reasons.',
          xp: 5,
        },
      },
      {
        text: 'Another separated knowing a thing from grasping it.',
        upto: 3,
        at: 2,
      },
      {
        at: 2,
        ask: {
          prompt: 'What does understanding add to knowing that something is so?',
          sort: {
            chip: 'understanding',
            bins: [
              { id: 'why', label: 'knowing why', reads: 'how it hangs together with everything else', correct: true },
              { id: 'more', label: 'more facts', reads: 'a larger number of true beliefs' },
              { id: 'sure', label: 'more certainty', reads: 'being more confident of the same thing' },
            ],
          },
          explain: 'Knowing why. A person can hold every true statement about a mechanism and be unable to say what would happen if one part were changed, and that is the difference \u2014 understanding is about the connections.',
          xp: 5,
        },
      },
      {
        text: 'And one asked what it would be to be well calibrated.',
        upto: 4,
        at: 3,
      },
      {
        at: 3,
        ask: {
          prompt: 'You say you are ninety per cent sure, many times over. What should happen?',
          drag: {
            lo: 'you are right every time',
            hi: 'you are right about nine times in ten',
            start: 0.06,
            zones: [
              { id: 'all', upto: 0.3, reads: 'you should be right every time' },
              { id: 'most', upto: 0.6, reads: 'you should be right nearly every time' },
              { id: 'nine', upto: 1, reads: 'right about nine times in ten, and wrong the tenth', correct: true },
            ],
          },
          explain: 'Right about nine times in ten. Being wrong the tenth time is what ninety per cent means \u2014 a person who is never wrong at that confidence was understating, and calibration is the two bars matching rather than one being high.',
          xp: 5,
        },
      },
    ],
  },
};
