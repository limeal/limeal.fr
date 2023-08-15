import Comment from './comment';
import Like from './like';

interface Article {
    id?: string;

    slug: string;
    created_at: string; // YYYY-MM-DD

    translations: {
        [key: string]: {
            title: string;
            lore: string;
            content: string; // In HTML
        };
    }

    // Default
    defaultLanguage: string;

    images: {
        ref: string;
        url?: string;
    }[]; // List of images reference

    place?: {
        address?: string;
        city?: string;
        country: string;
    };

    published: boolean;

    likes?: Like[];
    comments?: Comment[];
}

export default Article;