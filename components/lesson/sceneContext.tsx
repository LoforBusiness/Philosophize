import { createContext, useContext } from 'react';

// Where a scene leaves room for the card's text, and whether the artwork is
// drawn on black (white text) or paper (ink text).
export interface SceneMeta {
  mode: 'light' | 'dark';
  zone: 'top' | 'middle' | 'bottom';
  // Horizontal text inset — scenes with art hugging the side edges widen this.
  padH?: number;
}

export const SceneMetaContext = createContext<SceneMeta>({ mode: 'light', zone: 'middle' });

// True only for the card currently centred in the pager — reading cards use it
// to start their word-by-word reveal the moment the reader arrives.
export const CardActiveContext = createContext(true);

export const useSceneMeta = () => useContext(SceneMetaContext);
export const useCardActive = () => useContext(CardActiveContext);
