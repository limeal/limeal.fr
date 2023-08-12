interface Profile {
    id?: string;
    username: string;
    picture?: {
        ref: string;
        url?: string;
    };
}

export default Profile;