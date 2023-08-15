interface Profile {
    id?: string;
    username: string;
    picture?: {
        ref: string;
        url?: string;
    };
    email: string;
}

export default Profile;