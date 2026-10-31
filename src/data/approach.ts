import type { IconType } from "react-icons";
import {
  LuEye,
  LuMessageSquare,
  LuRepeat,
  LuScissors,
  LuSearch,
  LuShare2,
  LuShieldCheck,
  LuTarget,
} from "react-icons/lu";

export type MindGroup = "ai" | "product";

export interface MindNode {
  id: string;
  group: MindGroup;
  icon: IconType;
  // Position on the ellipse around the core, in degrees (0 = right, 90 = top)
  angle: number;
}

// The 4D framework for working with AI on the left, product reflexes on the right.
// Titles and texts live in lang.json under approach--<id>-title / approach--<id>-text.
export const mindNodes: MindNode[] = [
  { id: "delegation", group: "ai", icon: LuShare2, angle: 135 },
  { id: "description", group: "ai", icon: LuMessageSquare, angle: 165 },
  { id: "discernment", group: "ai", icon: LuEye, angle: 195 },
  { id: "diligence", group: "ai", icon: LuShieldCheck, angle: 225 },
  { id: "framing", group: "product", icon: LuSearch, angle: 45 },
  { id: "value", group: "product", icon: LuTarget, angle: 15 },
  { id: "scope", group: "product", icon: LuScissors, angle: -15 },
  { id: "iterate", group: "product", icon: LuRepeat, angle: -45 },
];

// Synapses between nodes, on top of the links from every node to the core
export const mindLinks: [string, string][] = [
  ["delegation", "description"],
  ["description", "discernment"],
  ["discernment", "diligence"],
  ["framing", "value"],
  ["value", "scope"],
  ["scope", "iterate"],
  // Bridges between the two halves
  ["description", "framing"],
  ["discernment", "iterate"],
];
