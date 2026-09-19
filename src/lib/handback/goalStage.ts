// Kept apart from the GoalPlant component so that importing the label does not
// drag lottie-web and the animation JSON into the route's own chunk.
const STAGES = [
  { at: 1, label: 'In bloom' },
  { at: 0.75, label: 'Nearly there' },
  { at: 0.4, label: 'Filling out' },
  { at: 0.15, label: 'Sprouting' },
  { at: 0.001, label: 'Taking root' },
  { at: 0, label: 'Just planted' },
]

export function stageLabel(fraction: number) {
  return (STAGES.find((s) => fraction >= s.at) ?? STAGES[STAGES.length - 1]).label
}
