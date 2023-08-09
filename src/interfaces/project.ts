interface Project {
    id?: string;
    name: string;
    thumbnail: {
        ref: string;
        url?: string;
    };
    description: string;
    category: string;
    github?: string;
    external_link?: string;
    release_date: string;
}

export default Project;