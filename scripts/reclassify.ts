// Recompute derived classification from already stored evidence; do not invent a fresh observation.
import { getStore } from "../lib/store";
import { refreshClassification } from "../lib/pipeline";
const at = Date.now();
const result = await (
  await getStore()
).update((state) => {
  let changed = 0;
  for (const item of state.items) {
    const before = JSON.stringify({
      category: item.category,
      tags: item.tags,
      score: item.score,
      status: item.status,
    });
    refreshClassification(item, at);
    if (
      before !==
      JSON.stringify({
        category: item.category,
        tags: item.tags,
        score: item.score,
        status: item.status,
      })
    )
      changed++;
  }
  return { changed, observationsUnchanged: true };
});
console.log(JSON.stringify(result));
