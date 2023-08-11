const splashPhrases = [
    // Invent some phrase that can be displayed insteed of login
    "Loading...",
    "This website is so awesome, his need time to load",
    "I'm not a human, I'm a bot that what she said",
    "Don't drink before breakfast, i say this because i already did",
    "2023 is the year of the linux desktop",
    "Matter of fact, the moon is a hologram",
    "Don't think just do it",
    "Elon Musk is a reptilian",
];

const defaultTabs: Tab[] = [
    {
        href: "#about",
        tid: "tabs--about-me",
        type: "link"
    },
    {
        href: "#skills",
        tid: "tabs--skills",
        type: "link"
    },
    {
        href: "#portfolio",
        tid: "tabs--portfolio",
        type: "link"
    }
]

export { splashPhrases, defaultTabs };