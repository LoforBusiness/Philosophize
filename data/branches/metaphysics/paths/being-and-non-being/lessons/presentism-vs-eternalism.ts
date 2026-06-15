import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-21',
  slug: 'presentism-vs-eternalism',
  title: 'Is the Past Still Out There?',
  description: 'Only this instant feels real — but does the past still exist somewhere?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Your tenth birthday: gone forever, or still out there?',
      subtext: 'Two theories of time give opposite answers.',
      emoji: '📅',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you met two camps about time.',
      body: 'Lesson 7 split time into the A-theory, where it genuinely flows, and the B-theory, where every moment sits equally real. Today we name the rival pictures those theories paint — and feel how strange each one is.',
      emoji: '🕰️',
    },
    {
      type: 'concept',
      title: 'Presentism: Only Now Exists',
      body: 'The presentist says reality is razor-thin. Only the present moment exists. The past has dropped out of being entirely; the future has not arrived. Dinosaurs and your future grandchildren are simply not there — there is nothing for "the past" to refer to except memory and trace.',
      visual: '⚡',
      highlight: 'only the present exists',
    },
    {
      type: 'concept',
      title: 'Eternalism: All Times Are Real',
      body: 'The eternalist says past, present, and future all exist, like points on a map. "Now" is just where you stand, the way "here" is just where you are. Caesar and your future self exist as surely as you do — you simply cannot reach them from your slice of the timeline.',
      visual: '🗺️',
      highlight: 'all times are real',
    },
    {
      type: 'example',
      title: 'The Block and the Spotlight',
      scenario: 'Picture all of history as a four-dimensional block: every event frozen in place, no point more real than another. That is eternalism. Now imagine a moving spotlight gliding along the block, lighting up one slice as "now." That is the A-theory\'s flow. The presentist goes further — switch off everything but the lit slice, and that is all there is.',
      emoji: '🔦',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-21-1',
      quote: 'The distinction between past, present and future is only a stubbornly persistent illusion.',
      author: 'Albert Einstein',
      era: '1955',
      work: 'Letter to the family of Michele Besso',
    },
    {
      type: 'dilemma',
      scenario: 'Astronomers point a telescope at a star a thousand light-years away. The light arriving tonight left the star a thousand years ago. The star may have died centuries back. You are, in a real sense, looking at the past right now.',
      prompt: 'Is the past you are seeing real?',
      choices: [
        { id: 'a', label: 'No — only this present moment is real' },
        { id: 'b', label: 'Yes — past events exist as fully as the present' },
        { id: 'c', label: 'Only the present flows; past slices stay fixed but real' },
      ],
      views: [
        {
          thinker: 'Presentism',
          stance: 'Only the present is real.',
          why: 'The starlight is real now, but the event that emitted it has passed out of existence. What you see is a present trace of a past that no longer is. Reality is the thin edge of now.',
        },
        {
          thinker: 'Eternalism',
          stance: 'Past and present are equally real.',
          why: 'Relativity treats space and time together; what counts as "now" differs between observers. So no single present can be privileged. Every event, past or future, exists at its own location in the four-dimensional block.',
        },
        {
          thinker: 'Growing-block view',
          stance: 'The past is real; the future is not yet.',
          why: 'Reality grows. Past and present exist and accumulate, but the future is open and unmade. The dead star is real; tomorrow is not — being itself is still being added to.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'question',
      prompt: 'A friend says: "Eternalism must be false — obviously the past is gone, I can\'t visit it." Why is this too quick?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It is right — what you cannot reach cannot exist', isCorrect: false },
          { id: 'b', text: 'It confuses being unable to reach a time with that time not existing', isCorrect: true },
          { id: 'c', text: 'Eternalism says the past is more real than the present', isCorrect: false },
          { id: 'd', text: 'It assumes time travel is impossible', isCorrect: false },
        ],
        explanation: 'This is the inaccessibility fallacy. The eternalist agrees you cannot visit 1850 — but so what? You cannot visit a distant galaxy either, and it still exists. Unreachability is not non-existence. The argument smuggles in presentism rather than proving it.',
      },
    },
    {
      type: 'summary',
      title: 'How Thick Is Reality?',
      keyPoints: [
        'Presentism: only the present moment exists',
        'Eternalism: past, future, and now equally real',
        'Growing-block: past real, future not yet',
        'Relativity pressures the idea of one true "now"',
      ],
      closingThought: 'You now know that "the past is gone" is not obvious — it is a contested theory of what exists.',
    },
  ],
};

export default lesson;
