/** Everything a closing encounter is given, which is almost nothing on purpose. */
export interface CodaProps {
  /** Hand back to the player, which then shows the reward and pops the screen. */
  onDone: () => void;
}

export type CodaComponent = (p: CodaProps) => React.ReactElement | null;
