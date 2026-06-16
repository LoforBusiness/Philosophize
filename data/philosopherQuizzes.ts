// Short, fun, fact-checked quizzes for the most iconic thinkers — surfaced from a
// philosopher's profile. Each is ~5 questions, sized to finish in 30–45 seconds,
// mixing three kinds:
//   • attribution — "Did X say this?" (the quote is verbatim; decoys are real
//     lines by a DIFFERENT thinker, named in `realAuthor`)
//   • mc          — a niche-but-true fact, exactly one correct option
//   • fill        — complete a famous verbatim line (tap the right word)
// Content was authored and adversarially fact-checked; explanations name the
// correct answer and its source.

export type QuizDifficulty = 'easy' | 'medium' | 'niche';

interface BaseQuestion {
  prompt: string;
  explain: string;
  difficulty: QuizDifficulty;
}

export interface AttributionQuestion extends BaseQuestion {
  kind: 'attribution';
  quote: string;
  isReal: boolean;
  realAuthor: string; // who actually said it (this philosopher, if isReal)
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  kind: 'mc';
  options: string[];
  correctIndex: number;
}

export interface FillQuestion extends BaseQuestion {
  kind: 'fill';
  quote: string; // contains "___" for the blank
  options: string[];
  correctIndex: number;
}

export type QuizQuestion = AttributionQuestion | MultipleChoiceQuestion | FillQuestion;

export const PHILOSOPHER_QUIZZES: Record<string, QuizQuestion[]> = {
  socrates: [
    {
      kind: 'attribution',
      prompt: 'Did Socrates say this?',
      quote: 'I know that I know nothing.',
      isReal: true,
      realAuthor: 'Socrates',
      difficulty: 'easy',
      explain: `This is Socrates' central claim about wisdom, found in Plato's Apology — true knowledge begins with recognizing the limits of your own understanding.`,
    },
    {
      kind: 'attribution',
      prompt: 'Did Socrates say this?',
      quote: `Real knowledge is to know the extent of one's ignorance.`,
      isReal: false,
      realAuthor: 'Confucius',
      difficulty: 'medium',
      explain: `This is actually Confucius, not Socrates; while it echoes similar themes about wisdom and ignorance, Confucius stated it as a distinct maxim in the Analects.`,
    },
    {
      kind: 'mc',
      prompt: `What ancient Greek practice was central to Socrates' method of teaching?`,
      options: [
        'Relentless questioning of assumptions and beliefs',
        'Lecturing on prepared manuscripts',
        'Training students in combat and athletics',
        'Teaching through sacred temple rituals',
      ],
      correctIndex: 0,
      difficulty: 'easy',
      explain: `The Socratic method relies on probing questions to expose contradictions in thinking, rather than delivering prepared lectures or answers.`,
    },
    {
      kind: 'mc',
      prompt: `Who was Socrates' most celebrated student?`,
      options: ['Plato', 'Aristotle', 'Xenophon', 'Alcibiades'],
      correctIndex: 0,
      difficulty: 'easy',
      explain: `Plato was Socrates' most famous student; he preserved his teacher's ideas in written dialogues that remain central to Western philosophy.`,
    },
    {
      kind: 'mc',
      prompt: `What was Socrates' interpretation of the Oracle at Delphi's pronouncement that he was the wisest man in Greece?`,
      options: [
        'He alone was wisest because he knew he knew nothing, while others thought they knew',
        'He rejected the Oracle as false and a threat to free thought',
        'He saw it as proof that wisdom comes from the gods, not reason',
        'He took it as a sign he should leave Athens and teach elsewhere',
      ],
      correctIndex: 0,
      difficulty: 'niche',
      explain: `According to Plato's Apology, Socrates realized the Oracle meant his wisdom lay in his awareness of his own ignorance, which distinguished him from those with false certainty.`,
    },
  ],

  plato: [
    {
      kind: 'mc',
      prompt: `Plato's most famous work, the Republic, uses which extended metaphor to explain how people perceive reality?`,
      options: [
        'The Ship of State sailing through treacherous waters',
        'The Allegory of the Cave with prisoners watching shadows',
        'The Divided Line separating the sensible from the intelligible',
        'The Myth of the Metals assigning people to social classes',
      ],
      correctIndex: 1,
      difficulty: 'easy',
      explain: `The Allegory of the Cave is Plato's most celebrated metaphor: prisoners chained in a cave see only shadows and mistake them for reality — symbolizing how most people mistake sensory perception for true knowledge.`,
    },
    {
      kind: 'fill',
      prompt: 'Complete the line:',
      quote: 'The beginning is the most important part of ___.',
      options: ['the work', 'the dialogue', 'the soul', 'the academy'],
      correctIndex: 0,
      difficulty: 'easy',
      explain: `Plato wrote that "The beginning is the most important part of the work," often cited when discussing first principles.`,
    },
    {
      kind: 'attribution',
      prompt: 'Did Plato say this?',
      quote: 'The unexamined life is not worth living.',
      isReal: false,
      realAuthor: 'Socrates',
      difficulty: 'easy',
      explain: `This is Socrates' famous declaration, quoted in Plato's Apology — the original speaker (and Plato's teacher) is Socrates, not Plato.`,
    },
    {
      kind: 'mc',
      prompt: `Which subject did Plato make central to his Academy, viewing it as the key to understanding reality?`,
      options: [
        'Rhetoric and persuasion',
        'Military strategy and governance',
        'Mathematics and geometry',
        'Natural history and biology',
      ],
      correctIndex: 2,
      difficulty: 'medium',
      explain: `Plato made geometry central to the Academy — tradition holds "Let no one untrained in geometry enter" was inscribed at its door — because he believed mathematical truths revealed the eternal Forms.`,
    },
    {
      kind: 'mc',
      prompt: `According to Plato's theory of the Forms, how does the physical world relate to the realm of perfect, eternal Forms?`,
      options: [
        'The physical world is the only reality; the Forms are abstractions we create',
        'The physical world is a mere shadow or imperfect copy of the true, eternal Forms',
        'The Forms and the physical world are identical; there is no distinction',
        'The Forms are inside matter and can only be discovered through observation',
      ],
      correctIndex: 1,
      difficulty: 'niche',
      explain: `Plato taught that the physical world is an imperfect, changing copy of the timeless, perfect Forms, which alone are truly real — a cornerstone of Western metaphysics.`,
    },
  ],

  aristotle: [
    {
      kind: 'fill',
      prompt: 'Complete the line:',
      quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a ___.',
      options: ['habit', 'choice', 'practice', 'virtue'],
      correctIndex: 0,
      difficulty: 'easy',
      explain: `The answer is "habit" — the idea, drawn from Aristotle's ethics, that excellence is built through repeated action, not a single act.`,
    },
    {
      kind: 'attribution',
      prompt: 'Did Aristotle say this?',
      quote: 'Man is by nature a political animal.',
      isReal: true,
      realAuthor: 'Aristotle',
      difficulty: 'easy',
      explain: `Yes — from Aristotle's Politics, expressing his view that humans are naturally suited to living in communities.`,
    },
    {
      kind: 'mc',
      prompt: `Which of these was NOT a major systematic focus of Aristotle's philosophy?`,
      options: ['Logic', 'Aesthetics', 'Ethics', 'Metaphysics'],
      correctIndex: 1,
      difficulty: 'medium',
      explain: `Aristotle systematized logic, ethics, metaphysics, biology and politics; aesthetics was not a major systematic area, though he wrote on tragedy in the Poetics.`,
    },
    {
      kind: 'attribution',
      prompt: 'Did Aristotle say this?',
      quote: 'Wonder is the desire for knowledge.',
      isReal: false,
      realAuthor: 'Thomas Aquinas',
      difficulty: 'medium',
      explain: `This line is from Thomas Aquinas, the medieval thinker who built heavily on Aristotle but authored this phrasing himself.`,
    },
    {
      kind: 'mc',
      prompt: `What were Aristotle's followers nicknamed, because of his teaching style?`,
      options: ['The Logicians', 'The Peripatetics', 'The Dialecticians', 'The Syllogists'],
      correctIndex: 1,
      difficulty: 'niche',
      explain: `The Peripatetics — Aristotle taught while strolling through the Lyceum, so his school took its name from the Greek peripatein, "to walk about."`,
    },
  ],

  'marcus-aurelius': [
    {
      kind: 'mc',
      prompt: `What was Marcus Aurelius's role in Rome?`,
      options: [
        'A wealthy merchant who became a philosopher',
        'Roman Emperor',
        'A schoolteacher and rhetor',
        'A general without imperial power',
      ],
      correctIndex: 1,
      difficulty: 'easy',
      explain: `Marcus Aurelius was Roman Emperor (ruled 161–180 CE), famous for writing the Meditations as a private journal while carrying the burden of ruling the empire.`,
    },
    {
      kind: 'fill',
      prompt: 'Complete the line:',
      quote: 'You have power over your mind, not outside events. Realize this, and you will find ___.',
      options: ['strength', 'wisdom', 'peace', 'virtue'],
      correctIndex: 0,
      difficulty: 'easy',
      explain: `The answer is "strength" — from the Meditations, emphasizing mastery of one's mind over external circumstances.`,
    },
    {
      kind: 'attribution',
      prompt: 'Did Marcus Aurelius say this?',
      quote: 'Waste no more time arguing about what a good man should be. Be one.',
      isReal: true,
      realAuthor: 'Marcus Aurelius',
      difficulty: 'medium',
      explain: `Yes — from the Meditations; it captures his practical ethics: stop philosophizing and start acting virtuously.`,
    },
    {
      kind: 'fill',
      prompt: 'Complete the line:',
      quote: 'The happiness of your life depends upon the ___ of your thoughts.',
      options: ['number', 'quality', 'direction', 'depth'],
      correctIndex: 1,
      difficulty: 'medium',
      explain: `The answer is "quality" — a core Stoic insight from Marcus Aurelius that contentment flows from the caliber of our mental habits.`,
    },
    {
      kind: 'attribution',
      prompt: 'Did Marcus Aurelius say this?',
      quote: 'That which does not kill us makes us stronger.',
      isReal: false,
      realAuthor: 'Friedrich Nietzsche',
      difficulty: 'niche',
      explain: `This is Friedrich Nietzsche, writing over 1,600 years after Marcus Aurelius — though it echoes a Stoic principle about resilience.`,
    },
  ],

  confucius: [
    {
      kind: 'attribution',
      prompt: 'Did Confucius say this?',
      quote: 'Do not impose on others what you do not wish for yourself.',
      isReal: true,
      realAuthor: 'Confucius',
      difficulty: 'easy',
      explain: `Yes — Confucius's foundational teaching on reciprocity (the "negative Golden Rule"), preserved in the Analects.`,
    },
    {
      kind: 'fill',
      prompt: 'Complete the line:',
      quote:
        'When you see a good person, think of becoming like them. When you see someone not so good, reflect on ___.',
      options: ['your own weak points', "society's corrupting influence", 'their spiritual blindness', 'the chaos within them'],
      correctIndex: 0,
      difficulty: 'easy',
      explain: `The answer is "your own weak points" — Confucius taught that self-reflection on your own faults is the ethical path forward.`,
    },
    {
      kind: 'attribution',
      prompt: 'Did Confucius say this?',
      quote: `Real knowledge is to know the extent of one's ignorance.`,
      isReal: true,
      realAuthor: 'Confucius',
      difficulty: 'medium',
      explain: `Yes — this reflects the Confucian humility about learning and self-awareness found in the Analects.`,
    },
    {
      kind: 'mc',
      prompt: `Which best describes Confucius's view on social harmony?`,
      options: [
        'It arises from enforced laws and punishment alone',
        'It depends on virtue and proper conduct in relationships and roles',
        'It is impossible in a corrupt world and should be abandoned',
        'It requires rejecting all family bonds and traditional hierarchy',
      ],
      correctIndex: 1,
      difficulty: 'medium',
      explain: `Confucius taught that a stable society depends on people behaving virtuously in their relationships and roles — the core of his ethical vision.`,
    },
    {
      kind: 'mc',
      prompt: 'What kind of work did Confucius do before becoming a renowned teacher?',
      options: [
        'General commanding imperial armies',
        'Manager of granaries and livestock',
        'Court astrologer advising the emperor',
        'Merchant trading along the Silk Road',
      ],
      correctIndex: 1,
      difficulty: 'niche',
      explain: `Confucius held minor posts managing granaries and livestock before teaching — practical experience that grounded his wisdom.`,
    },
  ],

  'rene-descartes': [
    {
      kind: 'fill',
      prompt: 'Complete the line:',
      quote: 'I ___, therefore I am.',
      options: ['think', 'doubt', 'exist', 'reason'],
      correctIndex: 0,
      difficulty: 'easy',
      explain: `The answer is "think" — Descartes' foundational certainty: the very act of thinking proves the thinker exists.`,
    },
    {
      kind: 'attribution',
      prompt: 'Did René Descartes say this?',
      quote: 'The unexamined life is not worth living.',
      isReal: false,
      realAuthor: 'Socrates',
      difficulty: 'medium',
      explain: `Socrates said this in Plato's Apology — not Descartes, though both prized self-examination.`,
    },
    {
      kind: 'attribution',
      prompt: 'Did René Descartes say this?',
      quote:
        'If you would be a real seeker after truth, it is necessary that at least once in your life you doubt, as far as possible, all things.',
      isReal: true,
      realAuthor: 'René Descartes',
      difficulty: 'medium',
      explain: `Yes — this captures Descartes' method of systematic doubt as the path to certain knowledge.`,
    },
    {
      kind: 'mc',
      prompt: 'What mathematical innovation is René Descartes famous for?',
      options: ['Calculus', 'The Cartesian coordinate system', 'Non-Euclidean geometry', 'Set theory'],
      correctIndex: 1,
      difficulty: 'medium',
      explain: `Descartes devised the Cartesian coordinate system, linking algebra and geometry — named after his Latinized name, Cartesius.`,
    },
    {
      kind: 'mc',
      prompt: 'How did René Descartes die?',
      options: [
        'In a philosophical debate that exhausted him',
        'From pneumonia after tutoring Queen Christina in early-morning lessons in Sweden',
        'During a shipwreck while traveling to Holland',
        'From a stroke while working on his mathematics',
      ],
      correctIndex: 1,
      difficulty: 'niche',
      explain: `Descartes died of pneumonia after Queen Christina of Sweden required early-morning lessons, disrupting his lifelong habit of thinking in bed until noon.`,
    },
  ],

  'david-hume': [
    {
      kind: 'fill',
      prompt: 'Complete the line:',
      quote: 'Reason is, and ought only to be, the ___ of the passions.',
      options: ['master', 'slave', 'servant', 'enemy'],
      correctIndex: 1,
      difficulty: 'easy',
      explain: `The answer is "slave" — Hume's striking claim that reason is subordinate to our passions, which set our ends.`,
    },
    {
      kind: 'attribution',
      prompt: 'Did David Hume say this?',
      quote: 'The unexamined life is not worth living.',
      isReal: false,
      realAuthor: 'Socrates',
      difficulty: 'easy',
      explain: `This is Socrates' line; Hume, though a skeptic, did not frame his philosophy around this maxim.`,
    },
    {
      kind: 'mc',
      prompt: 'Which famous philosophical problem did Hume identify?',
      options: ['The problem of other minds', 'The problem of induction', 'The problem of universals', 'The mind-body problem'],
      correctIndex: 1,
      difficulty: 'medium',
      explain: `Hume identified the problem of induction — that past patterns (like the sun rising daily) cannot logically guarantee future outcomes.`,
    },
    {
      kind: 'attribution',
      prompt: 'Did David Hume say this?',
      quote: 'Beauty in things exists in the mind which contemplates them.',
      isReal: true,
      realAuthor: 'David Hume',
      difficulty: 'medium',
      explain: `Yes — Hume argued beauty is not an objective property of objects but depends on the mind perceiving them.`,
    },
    {
      kind: 'mc',
      prompt: `What setback marked Hume's academic career?`,
      options: [
        'He was made a professor at Edinburgh at age 30',
        'He was twice rejected for university posts on suspicion of atheism',
        'He received a prestigious fellowship at Oxford',
        'He founded his own private philosophical academy',
      ],
      correctIndex: 1,
      difficulty: 'niche',
      explain: `Hume was twice passed over for university chairs amid suspicions of atheism, despite his towering philosophical and literary talent.`,
    },
  ],

  'immanuel-kant': [
    {
      kind: 'mc',
      prompt: 'What was Kant’s hometown, which he famously never left?',
      options: ['Berlin', 'Königsberg', 'Frankfurt am Main', 'Tübingen'],
      correctIndex: 1,
      difficulty: 'easy',
      explain: `Kant lived his whole life in Königsberg (now Kaliningrad), so punctual on his daily walk that neighbors reportedly set their clocks by him.`,
    },
    {
      kind: 'attribution',
      prompt: 'Did Immanuel Kant say this?',
      quote:
        'Two things fill the mind with ever new and increasing admiration and awe: the starry heavens above me and the moral law within me.',
      isReal: true,
      realAuthor: 'Immanuel Kant',
      difficulty: 'medium',
      explain: `Yes — the famous closing lines of Kant's Critique of Practical Reason (1788).`,
    },
    {
      kind: 'fill',
      prompt: 'Complete the line:',
      quote: 'Act only according to that maxim whereby you can at the same time will that it should become a ___.',
      options: ['moral truth', 'universal law', 'divine principle', 'human custom'],
      correctIndex: 1,
      difficulty: 'medium',
      explain: `The answer is "universal law" — Kant's categorical imperative: act only on rules you could will everyone to follow.`,
    },
    {
      kind: 'mc',
      prompt: `Which work is Kant's central treatment of ethics?`,
      options: [
        'Critique of Pure Reason',
        'Critique of Practical Reason',
        'Critique of Judgment',
        'Prolegomena to Any Future Metaphysics',
      ],
      correctIndex: 1,
      difficulty: 'medium',
      explain: `The Critique of Practical Reason (1788) is Kant's definitive work on ethics, containing the fullest account of the categorical imperative.`,
    },
    {
      kind: 'attribution',
      prompt: 'Did Immanuel Kant say this?',
      quote: 'Sapere aude — dare to know; have courage to use your own understanding.',
      isReal: true,
      realAuthor: 'Immanuel Kant',
      difficulty: 'niche',
      explain: `Yes — Kant made "Sapere aude" the rallying cry of his 1784 essay "What Is Enlightenment?"`,
    },
  ],

  'friedrich-nietzsche': [
    {
      kind: 'fill',
      prompt: 'Complete the line:',
      quote: 'Without music, life would be a ___.',
      options: ['mistake', 'torment', 'tragedy', 'prison'],
      correctIndex: 0,
      difficulty: 'easy',
      explain: `The answer is "mistake" — from Twilight of the Idols, on how essential art is to human life.`,
    },
    {
      kind: 'attribution',
      prompt: 'Did Friedrich Nietzsche say this?',
      quote: 'That which does not kill us makes us stronger.',
      isReal: true,
      realAuthor: 'Friedrich Nietzsche',
      difficulty: 'easy',
      explain: `Yes — from Twilight of the Idols, expressing his view that hardship can forge strength.`,
    },
    {
      kind: 'attribution',
      prompt: 'Did Friedrich Nietzsche say this?',
      quote: 'Compassion is the basis of all morality.',
      isReal: false,
      realAuthor: 'Arthur Schopenhauer',
      difficulty: 'medium',
      explain: `This is Arthur Schopenhauer; Nietzsche in fact criticized excessive compassion as a feature of "slave morality."`,
    },
    {
      kind: 'mc',
      prompt: `Which concept is central to Nietzsche's philosophy?`,
      options: ['The categorical imperative', 'The greatest happiness principle', 'The Übermensch', 'The Form of the Good'],
      correctIndex: 2,
      difficulty: 'medium',
      explain: `The Übermensch ("overman") is Nietzsche's ideal of one who creates their own values beyond conventional morality.`,
    },
    {
      kind: 'mc',
      prompt: `What event is associated with Nietzsche's mental collapse in 1889?`,
      options: [
        'Seeing a horse being whipped in the street',
        'A violent quarrel with his closest friend',
        'Rejection of a manuscript by his publisher',
        "Learning of his mother's death",
      ],
      correctIndex: 0,
      difficulty: 'niche',
      explain: `By the traditional account, Nietzsche broke down after witnessing a horse being whipped in Turin; he never recovered his faculties.`,
    },
  ],

  'jean-paul-sartre': [
    {
      kind: 'attribution',
      prompt: 'Did Jean-Paul Sartre say this?',
      quote: 'Man is condemned to be free.',
      isReal: true,
      realAuthor: 'Jean-Paul Sartre',
      difficulty: 'easy',
      explain: `Yes — Sartre's foundational existentialist line: we cannot escape our freedom, or the responsibility it brings.`,
    },
    {
      kind: 'fill',
      prompt: 'Complete the line:',
      quote: 'Existence ___.',
      options: ['precedes essence', 'follows consciousness', 'determines nature', 'shapes freedom'],
      correctIndex: 0,
      difficulty: 'easy',
      explain: `"Existence precedes essence" — Sartre's claim that we exist first and create our essence through our choices.`,
    },
    {
      kind: 'mc',
      prompt: `Which work is central to Sartre's philosophy?`,
      options: ['Being and Nothingness', 'Critique of Pure Reason', 'The Phenomenology of Spirit', 'The Second Sex'],
      correctIndex: 0,
      difficulty: 'medium',
      explain: `Being and Nothingness (1943) is Sartre's existentialist masterwork; the others are by Kant, Hegel and Simone de Beauvoir.`,
    },
    {
      kind: 'attribution',
      prompt: 'Did Jean-Paul Sartre say this?',
      quote: 'Because we are in the world, we are condemned to meaning.',
      isReal: false,
      realAuthor: 'Maurice Merleau-Ponty',
      difficulty: 'medium',
      explain: `This is Maurice Merleau-Ponty, Sartre's fellow phenomenologist, who stressed embodied meaning over abstract radical freedom.`,
    },
    {
      kind: 'mc',
      prompt: 'What did Sartre do when awarded the Nobel Prize in Literature in 1964?',
      options: [
        'He turned it down, refusing to be turned into an institution',
        'He accepted but donated the money to political causes',
        'He gave his acceptance speech by video from Paris',
        'He delayed accepting until he could meet the Academy',
      ],
      correctIndex: 0,
      difficulty: 'niche',
      explain: `Sartre declined the Nobel Prize to preserve his independence — consistent with his emphasis on radical freedom.`,
    },
  ],
};

export function hasQuiz(philosopherId: string): boolean {
  return (PHILOSOPHER_QUIZZES[philosopherId]?.length ?? 0) > 0;
}

export function getQuiz(philosopherId: string): QuizQuestion[] | null {
  return PHILOSOPHER_QUIZZES[philosopherId] ?? null;
}
