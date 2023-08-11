interface Article {
    id?: string;
    
    title: string;
    slug: string;
    lore: string;
    
    images: {
        ref: string;
        url?: string;
    }[]; // List of images reference
    content: string; // In HTML
    
    place?: {
        address?: string;
        city?: string;
        country: string;
    };

    created_at: string; // YYYY-MM-DD
    published: boolean;
}

export default Article;