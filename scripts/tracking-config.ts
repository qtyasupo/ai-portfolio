import { getStore } from "../lib/store";
import { defaultTracking } from "../lib/tracking";
const state = await (await getStore()).read();
console.log(JSON.stringify(state.tracking || defaultTracking()));
