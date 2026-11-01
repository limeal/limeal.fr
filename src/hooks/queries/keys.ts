// Every cached Firestore read, by key. Invalidate a prefix (e.g. ["projects"])
// after a write to refetch everything under it.
export const queryKeys = {
  projects: (vaultCode: string | null) => ["projects", vaultCode ?? "public"] as const,
  assistantNotes: (vaultCode: string) => ["assistant-notes", vaultCode] as const,

  articles: (isAdmin: boolean) => ["articles", isAdmin ? "all" : "published"] as const,
  article: (slug: string) => ["article", slug] as const,
  articleImages: (articleId: string) => ["article-images", articleId] as const,
  comments: (articleId: string) => ["comments", articleId] as const,
  likes: (articleId: string) => ["likes", articleId] as const,
  profile: (uid: string) => ["profile", uid] as const,

  accessRequest: (uid: string) => ["access-request", uid] as const,
  accessRequests: ["access-requests"] as const,
  accessEvents: (uid: string) => ["access-events", uid] as const,
  accessSettings: ["access-settings"] as const,
  vaultCode: (scope: "admin" | "recruiter", uid: string) => ["vault-code", scope, uid] as const,
  traffic: (days: number) => ["traffic", days] as const,
};
