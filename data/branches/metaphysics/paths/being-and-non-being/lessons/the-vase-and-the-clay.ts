import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-38',
  slug: 'the-vase-and-the-clay',
  title: 'The Vase and the Clay',
  description: 'On Tuesday they are the same size, shape and place. They still cannot be the same thing, and the reason is a matter of dates.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Same shape. Same place. Same stuff.',
      subtext: 'One of them is older than the other.',
      emoji: '🏺',
    },
    {
      type: 'concept',
      title: 'Constitution',
      body: 'A vase is made of clay, and on the day it exists there is nothing about its size, shape or position that the clay does not share. Constitution is the claim that being made of something is not the same as being it.',
      visual: '🧱',
      highlight: 'being made of something is not the same as being it',
    },
    {
      type: 'example',
      title: 'Three Days',
      scenario: 'Monday: a lump of clay on the bench. Tuesday: the same clay, thrown into a vase. Wednesday: the potter squashes it, and there is a lump again. The clay was there all three days. The vase was there for one. Two lives, two lengths, and only one piece of matter.',
      source: 'philosophers usually tell this one with a statue',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-38',
      quote: 'If x and y are the same thing, it could not have been that they were different.',
      author: 'Saul Kripke',
      era: '1980',
      philosopherId: 'saul-kripke',
    },
    {
      type: 'question',
      prompt: 'Why can the vase not simply be the clay?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The clay outlived it, and one thing cannot outlive itself', isCorrect: true },
          { id: 'b', text: 'The vase is prettier than the clay', isCorrect: false },
          { id: 'c', text: 'They are made of different materials', isCorrect: false },
          { id: 'd', text: 'The vase is only an idea in the potter\'s head', isCorrect: false },
        ],
        explanation: 'The dates do it. Identity is not something a thing can have on Tuesday and lose on Wednesday, so anything true of the clay on Monday has to be true of the vase, and the vase did not exist. The materials are the same, which is exactly what makes the puzzle hard.',
      },
    },
    {
      type: 'question',
      prompt: 'So what is the vase?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A different thing, in the same place, made of that clay', isCorrect: true },
          { id: 'b', text: 'The same thing as the clay, under another name', isCorrect: false },
          { id: 'c', text: 'Not a thing at all, only a shape the clay is in', isCorrect: false },
          { id: 'd', text: 'A thing with no material at all', isCorrect: false },
        ],
        explanation: 'The standard answer is two things sharing a place. It costs something and philosophers say so: two objects in one spot at one time. The rival answers each pay elsewhere — call them the same and the dates contradict you; call the vase no thing at all and you cannot say what the potter made.',
      },
    },
    {
      type: 'summary',
      title: 'Two Lives, One Lump',
      keyPoints: [
        'A thing can be made of stuff without being that stuff',
        'The test is what survives what',
        'Identity cannot start on Tuesday and stop on Wednesday',
        'So one place can hold two histories',
      ],
      closingThought: 'The same argument runs on a person and their body, a nation and its people, a river and its water. Once you see the two lifelines, you see them everywhere.',
    },
  ],
};

export default lesson;
