interface Like {
    id?: string;
    entity_type: "article" | "comment";
    entity_ref: string;
    author_id: string;
}

export default Like;