// Every lesson picture make-lesson-art.mjs draws and check-lesson-art.mjs holds.
//
// `view` is the drawing's own viewBox; `box` is where the picture sits in the scene, in
// SCENE units, relative to whatever the scene places it on (the stage, or a moving rider).
// A prop that replaces a shape-built object takes that object's box exactly, so nothing on
// the stage moves. Zero imports beyond the drawings themselves.
import { carvingSvg, kingSvg, CARVING_VIEW, KING_VIEW } from './hist6Carving.mjs';
import { carouselHorse, hammockFull, hammockEmpty, wreck, ship, fishingBoat, ratRunA, ratRunB, ratPeek } from './props.mjs';

const same = (v) => ({ view: v, box: v });

export const ART = [
  { name: 'hist6-carving', svg: carvingSvg, ...same(CARVING_VIEW) },
  { name: 'hist6-king-gold', svg: kingSvg, ...same(KING_VIEW) },
  // phil6's galloper: ph6Horse(0, 0, 34, 30)
  { name: 'phil6-horse', svg: carouselHorse, ...same({ x: -17, y: -15, w: 34, h: 30 }) },
  // sci6's hammocks: sc6HammockFull/Empty(0, 31, 46, 62)
  { name: 'sci6-hammock-full', svg: hammockFull, ...same({ x: -23, y: 0, w: 46, h: 62 }) },
  { name: 'sci6-hammock-empty', svg: hammockEmpty, ...same({ x: -23, y: 0, w: 46, h: 62 }) },
  // econ6's wreck (ec6Wreck(56, 372, 120, 70)) and the ship coming in (ec6Ship(0, 0, 40, 34))
  { name: 'econ6-wreck', svg: wreck, view: { x: -60, y: -35, w: 120, h: 70 }, box: { x: -4, y: 337, w: 120, h: 70 } },
  { name: 'econ6-ship', svg: ship, ...same({ x: -20, y: -17, w: 40, h: 34 }) },
  // growth6's boat: gr6Boat(0, -11, 56, 31), drawn in its old 40 × 24 frame
  { name: 'growth6-boat', svg: fishingBoat, view: { x: 0, y: 0, w: 40, h: 24 }, box: { x: -28, y: -26.5, w: 56, h: 31 } },
  // econ5's rats: ratRun(0, -4.8, 30, 30, stride) fits 38 × 13 into the 30 square;
  // ratPeek(0, -7, 17, 14) fits 16 × 13
  { name: 'econ5-rat-a', svg: ratRunA, view: { x: 0, y: 0, w: 38, h: 13 }, box: { x: -15, y: -9.93, w: 30, h: 10.26 } },
  { name: 'econ5-rat-b', svg: ratRunB, view: { x: 0, y: 0, w: 38, h: 13 }, box: { x: -15, y: -9.93, w: 30, h: 10.26 } },
  { name: 'econ5-rat-peek', svg: ratPeek, view: { x: 0, y: 0, w: 16, h: 13 }, box: { x: -8.5, y: -13.9, w: 17, h: 13.81 } },
];
