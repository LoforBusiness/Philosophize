import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { BY_ID, type Piece } from './wardrobe';
import { WARDROBE } from '../../../data/lessonWardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// WHAT THE FIGURES IN THIS LESSON ARE WEARING.
//
// A CONTEXT rather than a prop, and the alternative is why: every one of the 186
// scenes mounts its own `<Stickman D={DF} k={K_FIG} />`, and none of them knows
// its own lesson id. Threading a costume through would be 186 mechanical edits to
// files that are otherwise untouched — and 186 edits to scene files is 186
// chances to move a prop by a unit, which `muststamp` would then make everyone
// re-measure. The player knows the lesson; the figure asks.
//
// TWO ROLES, because a scene may have two figures and they must not be twins.
// `lead` is the mascot the reader follows from lesson to lesson. `second` is
// whoever else is on stage — the opposing position, the visitor — and it is
// deliberately a DIFFERENT costume, since two identical figures in identical top
// hats is worse than two plain ones: it draws the eye to a coincidence.
// ─────────────────────────────────────────────────────────────────────────────

export interface Worn {
  lead: Piece[];
  second: Piece[];
  /**
   * The third figure and beyond — a CROWD, and it wears nothing.
   *
   * `politicalScene` and `political9Scene` put five figures on stage; dressing
   * the extras in the second's costume would put four identical dandies in a
   * multitude, which reads as a uniform rather than as variety. Two figures are
   * an argument and get two looks; more than two are a crowd and get none.
   */
  crowd: Piece[];
}

const NONE: Piece[] = [];
const EMPTY: Worn = { lead: NONE, second: NONE, crowd: NONE };
const Ctx = createContext<Worn>(EMPTY);

export function WardrobeProvider({ lessonId, children }: { lessonId: string; children: ReactNode }) {
  const value = useMemo<Worn>(() => {
    // BOTH LOOKS COME FROM THE TABLE. The second used to be derived here by
    // stepping through a roll, which is all a component can do — and it cannot see
    // the lesson's BAND. `ethics3`'s lead is `plain`, so it was handed a dandy
    // whose top hat pokes seven units above that lesson's band, and nothing here
    // could have known. `make:wardrobe` picks a second that fits.
    const [leadId, secondId] = WARDROBE[lessonId] || ['plain', 'plain'];
    return {
      lead: BY_ID[leadId]?.pieces ?? NONE,
      second: BY_ID[secondId]?.pieces ?? NONE,
      crowd: NONE,
    };
  }, [lessonId]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** What this figure wears. Outside a lesson (the launch screen, the road) it is nothing. */
export function useWorn(role: 'lead' | 'second' | 'crowd' = 'lead'): Piece[] {
  return useContext(Ctx)[role];
}
