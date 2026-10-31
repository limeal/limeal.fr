import type { IconType } from "react-icons";
import { FaJava } from "react-icons/fa";
import {
  LuBarChart3,
  LuBot,
  LuKanbanSquare,
  LuLayoutTemplate,
  LuMap,
  LuMessageSquare,
  LuPlug,
  LuSearch,
  LuSplit,
  LuTerminal,
  LuWorkflow,
} from "react-icons/lu";
import {
  SiC,
  SiCplusplus,
  SiDart,
  SiDrupal,
  SiExpress,
  SiFlutter,
  SiGo,
  SiGraphql,
  SiHtml5,
  SiMongodb,
  SiMysql,
  SiNestjs,
  SiNextdotjs,
  SiOpenapiinitiative,
  SiPhp,
  SiPostgresql,
  SiPrestashop,
  SiPython,
  SiReact,
  SiRedis,
  SiRuby,
  SiStrapi,
  SiTypescript,
  SiVuedotjs,
  SiWordpress,
} from "react-icons/si";

export interface Skill {
  name: string;
  // Translation key, when the label differs between languages
  tid?: string;
  icon?: IconType;
  // Highlighted with the lime accent
  accent?: boolean;
}

export interface SkillCategory {
  id: string;
  // Translation key of the tab label
  tid: string;
  skills: Skill[];
}

export const skillCategories: SkillCategory[] = [
  {
    id: "ai",
    tid: "skills--cat--ai",
    skills: [
      { name: "Claude Code", icon: LuTerminal, accent: true },
      { name: "Agents & sub-agents", icon: LuBot },
      { name: "MCP", icon: LuPlug },
      { name: "Prompt engineering", icon: LuMessageSquare },
      { name: "Claude API", icon: LuWorkflow },
    ],
  },
  {
    id: "product",
    tid: "skills--cat--product",
    skills: [
      { name: "Problem framing", tid: "skills--product--framing", icon: LuSearch },
      { name: "UX / UI", icon: LuLayoutTemplate },
      { name: "Analytics", icon: LuBarChart3 },
      { name: "A/B testing", icon: LuSplit },
      { name: "Roadmap", tid: "skills--product--roadmap", icon: LuMap },
    ],
  },
  {
    id: "languages",
    tid: "skills--cat--languages",
    skills: [
      { name: "TypeScript / JavaScript", icon: SiTypescript },
      { name: "Go", icon: SiGo },
      { name: "C", icon: SiC },
      { name: "C++", icon: SiCplusplus },
      { name: "Java", icon: FaJava },
      { name: "HTML & CSS", icon: SiHtml5 },
      { name: "Python", icon: SiPython },
      { name: "PHP", icon: SiPhp },
      { name: "Ruby", icon: SiRuby },
      { name: "Dart", icon: SiDart },
    ],
  },
  {
    id: "frameworks",
    tid: "skills--cat--frameworks",
    skills: [
      { name: "React", icon: SiReact },
      { name: "Next.js", icon: SiNextdotjs },
      { name: "NestJS", icon: SiNestjs },
      { name: "Vue", icon: SiVuedotjs },
      { name: "Express", icon: SiExpress },
      { name: "Flutter", icon: SiFlutter },
    ],
  },
  {
    id: "databases",
    tid: "skills--cat--databases",
    skills: [
      { name: "PostgreSQL", icon: SiPostgresql },
      { name: "MySQL", icon: SiMysql },
      { name: "MongoDB", icon: SiMongodb },
      { name: "Redis", icon: SiRedis },
    ],
  },
  {
    id: "cms",
    tid: "skills--cat--cms",
    skills: [
      { name: "Strapi", icon: SiStrapi },
      { name: "WordPress", icon: SiWordpress },
      { name: "Drupal", icon: SiDrupal },
      { name: "PrestaShop", icon: SiPrestashop },
    ],
  },
  {
    id: "apis",
    tid: "skills--cat--apis",
    skills: [
      { name: "REST", icon: SiOpenapiinitiative },
      { name: "GraphQL", icon: SiGraphql },
    ],
  },
];

export const heroStack: Skill[] = [
  { name: "TypeScript", icon: SiTypescript },
  { name: "React / Next.js", icon: SiReact },
  { name: "NestJS", icon: SiNestjs },
  { name: "Go", icon: SiGo },
  { name: "Python", icon: SiPython },
  { name: "C", icon: SiC },
  { name: "PostgreSQL", icon: SiPostgresql },
  { name: "Product management", icon: LuKanbanSquare },
  { name: "Claude Code", icon: LuTerminal, accent: true },
];

// Every skill by name, to show a project's stack with the same icons
export const skillsByName = new Map(
  skillCategories.flatMap((category) => category.skills).map((skill) => [skill.name, skill])
);
