import type { Overview, RadarState } from "./types";
export function publicState(state: RadarState): RadarState {
  const { tracking: _privateTracking, ...shared } = state;
  return {
    ...shared,
    items: state.items
      .filter((i) => i.status === "selected" || i.status === "archive")
      .map((i) => ({
        ...i,
        text: i.text.slice(0, 400),
        evidence: i.evidence.slice(0, 220),
        observations: i.observations.map((o) => ({
          ...o,
          evidence: o.evidence.slice(0, 160),
        })),
      })),
    runs: state.runs.map((r) => ({
      ...r,
      message: r.status === "error" ? "采集受限，详见本机工作台" : r.message,
    })),
  };
}
export function publicOverview(data: Overview): Overview {
  const state = publicState(data.state);
  const byId = new Map(state.items.map((i) => [i.id, i]));
  return {
    ...data,
    state,
    writable: false,
    stories: data.stories.map((s) => ({
      ...s,
      items: s.items.map((i) => byId.get(i.id)!).filter(Boolean),
    })),
    brief: {
      ...data.brief,
      entries: data.brief.entries.map((i) => byId.get(i.id)!).filter(Boolean),
    },
  };
}
