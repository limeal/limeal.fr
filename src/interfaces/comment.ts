import Profile from './profile';
import Like from './like';

interface Comment {
    id?: string;
    article_ref: string;
    author_id: string; // userId == authid
    author?: Profile | null;
    likes?: Like[];
    content: string;
    created_at: string;
}

export default Comment;