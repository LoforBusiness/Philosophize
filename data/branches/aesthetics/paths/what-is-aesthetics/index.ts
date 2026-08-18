import type { Path } from '@/data/types';
import whyThingsFeelBeautiful from './lessons/why-things-feel-beautiful';
import artBeautyAndEmotion from './lessons/art-beauty-and-emotion';
import whyHumansLoveMusicAndStories from './lessons/why-humans-love-music-and-stories';
import canAnythingBeArt from './lessons/can-anything-be-art';
import seeingTheWorldDifferently from './lessons/seeing-the-world-differently';
import theSublimeAndTheOverwhelming from './lessons/the-sublime-and-the-overwhelming';
import tasteAndDisagreement from './lessons/taste-and-disagreement';
import formVersusExpression from './lessons/form-versus-expression';
import beautyVersusMeaning from './lessons/beauty-versus-meaning';
import artAndMorality from './lessons/art-and-morality';
import intentionalFallacyInterpretation from './lessons/intentional-fallacy-interpretation';
import forgeryAndAuthenticity from './lessons/forgery-and-authenticity';
import humesStandardOfTaste from './lessons/humes-standard-of-taste';
import kantOnDisinterestedBeauty from './lessons/kant-on-disinterested-beauty';
import paradoxOfTragedyAndHorror from './lessons/paradox-of-tragedy-and-horror';
import howCanMusicBeSad from './lessons/how-can-music-be-sad';
import everydayAndEnvironmentalAesthetics from './lessons/everyday-and-environmental-aesthetics';
import whyArtMattersTheValueOfArt from './lessons/why-art-matters-the-value-of-art';
import canAMachineMakeArt from './lessons/can-a-machine-make-art';
import theArtistsLife from './lessons/the-artists-life';
import theOntologyOfArt from './lessons/the-ontology-of-art';
import theParadoxOfFiction from './lessons/the-paradox-of-fiction';
import musicAndEmotion from './lessons/music-and-emotion';
import benjaminAuraAndReproduction from './lessons/benjamin-aura-and-reproduction';
import bourdieuTasteAndClass from './lessons/bourdieu-taste-and-class';
import kitschAndCamp from './lessons/kitsch-and-camp';
import theAvantGarde from './lessons/the-avant-garde';
import aestheticsOfTheEveryday from './lessons/aesthetics-of-the-everyday';
import artAndTruth from './lessons/art-and-truth';
import beautyAndTheGoodLife from './lessons/beauty-and-the-good-life';
import whyDoWeApplaudDifficulty from './lessons/why-do-we-applaud-difficulty';
import whyDoEndingsMatter from './lessons/why-do-endings-matter';
import howMuchShouldYouCleanAPainting from './lessons/how-much-should-you-clean-a-painting';
import whenAPictureStopsBeingOfSomething from './lessons/when-a-picture-stops-being-of-something';
import whyIsAnythingFunny from './lessons/why-is-anything-funny';
import doesAPhotographTellTheTruth from './lessons/does-a-photograph-tell-the-truth';

import whereIsAJazzSolo from './lessons/where-is-a-jazz-solo';
// 3 units — split from the original single "What Is Aesthetics?" path.
// Units are contiguous slices of the original lesson order, so progression is preserved.
const units: Path[] = [
  {
    id: "aesthetics-what-is-aesthetics",
    slug: "what-is-aesthetics",
    name: "What Is Aesthetics?",
    description: "Explore beauty, art, and why humans are moved by what they experience.",
    lessons: [whyThingsFeelBeautiful, artBeautyAndEmotion, whyHumansLoveMusicAndStories, canAnythingBeArt, seeingTheWorldDifferently, theSublimeAndTheOverwhelming, tasteAndDisagreement, formVersusExpression, beautyVersusMeaning, artAndMorality],
  },
  {
    id: "aesthetics-theories-and-hard-cases",
    slug: "theories-and-hard-cases",
    name: "Theories & Hard Cases",
    description: "Meet the great theories of art and the hard cases that test them — from what defines a work to why it moves us at all.",
    // Appended, never inserted: `lessonsByUnit` counts completions BY POSITION, so
    // slotting these mid-unit would silently re-point every later slot for anyone
    // part-way through (CLAUDE.md §11). It also levels the branch's three units at
    // ten lessons each.
    lessons: [intentionalFallacyInterpretation, forgeryAndAuthenticity, humesStandardOfTaste, kantOnDisinterestedBeauty, paradoxOfTragedyAndHorror, howCanMusicBeSad, everydayAndEnvironmentalAesthetics, whyArtMattersTheValueOfArt, canAMachineMakeArt, theArtistsLife, whyDoWeApplaudDifficulty],
  },
  {
    id: "aesthetics-puzzles-at-the-edge",
    slug: "puzzles-at-the-edge",
    name: "Puzzles at the Edge",
    description: "The deeper puzzles — where an artwork actually lives, why a perfect fake unsettles us, how taste is shaped — and what beauty is finally for.",
    lessons: [theOntologyOfArt, theParadoxOfFiction, musicAndEmotion, benjaminAuraAndReproduction, bourdieuTasteAndClass, kitschAndCamp, theAvantGarde, aestheticsOfTheEveryday, artAndTruth, beautyAndTheGoodLife, whyDoEndingsMatter, howMuchShouldYouCleanAPainting, whenAPictureStopsBeingOfSomething, whyIsAnythingFunny, doesAPhotographTellTheTruth, whereIsAJazzSolo],
  },
];

export default units;