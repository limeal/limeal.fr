export interface NavLink {
  href: string;
  // Translation key of the label
  tid: string;
}

export const homeLinks: NavLink[] = [
  { href: "#about-me", tid: "tabs--about-me" },
  { href: "#skills", tid: "tabs--skills" },
  { href: "#approach", tid: "tabs--approach" },
  { href: "#portfolio", tid: "tabs--portfolio" },
];

export const socials = {
  github: "https://github.com/limeal",
  discord: "limeal",
};
