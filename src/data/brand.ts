// The same site answers on two domains. On the discreet one (pauldev.fr) nothing
// may point back to the "Limeal" pseudonym: name, lemon logo, GitHub/Discord
// accounts, links containing it.
export const DISCREET_HOSTS = ["pauldev.fr", "www.pauldev.fr"];

export interface Brand {
    discreet: boolean;
    // How the owner is named on the page
    name: string;
    domain: string;
    // Mark shown in the navbar, footer, splash screen and favicon
    logo: string;
}

export const brandFor = (host: string | null | undefined): Brand => {
    const hostname = (host ?? "").split(":")[0].toLowerCase();
    return DISCREET_HOSTS.includes(hostname)
        ? { discreet: true, name: "Paul", domain: "pauldev.fr", logo: "/assets/images/monogram.svg" }
        : { discreet: false, name: "Paul (Limeal)", domain: "limeal.fr", logo: "/assets/images/logo.png" };
};

const PSEUDO = /limeal/i;

// On the discreet domain: hide any link or text giving the pseudonym away
export const revealsPseudo = (value?: string) => !!value && PSEUDO.test(value);
export const withoutPseudo = (text: string) => text.replace(/limeal/gi, "Paul");

// A project as shown on the discreet domain: pseudonym replaced in the texts,
// links naming it (GitHub account, limeal.fr…) dropped
export const brandProject = <T extends { name: string; description: string; role?: string; github?: string; external_link?: string }>(
    project: T,
    brand: Brand
): T =>
    brand.discreet
        ? {
              ...project,
              name: withoutPseudo(project.name),
              description: withoutPseudo(project.description),
              role: project.role && withoutPseudo(project.role),
              github: revealsPseudo(project.github) ? "" : project.github,
              external_link: revealsPseudo(project.external_link) ? "" : project.external_link,
          }
        : project;
