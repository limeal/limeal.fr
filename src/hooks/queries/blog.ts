"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDownloadURL, ref } from "firebase/storage";

import Article from "@/interfaces/article";
import Comment from "@/interfaces/comment";
import Like from "@/interfaces/like";
import { storage } from "@/firebase/firebase";
import { getArticles, getArticlesFromParam } from "@/firebase/store/article";
import { addComment, deleteComment, getCommentsFromParam } from "@/firebase/store/comment";
import { addLike, deleteLike, getLikesFromEntity } from "@/firebase/store/like";
import { getProfileFromId } from "@/firebase/store/profile";
import { queryKeys } from "./keys";

// Drafts are only listed for the admin; newest first
export const useArticles = (isAdmin: boolean) =>
  useQuery({
    queryKey: queryKeys.articles(isAdmin),
    queryFn: async () =>
      (await getArticles())
        .filter((article: Article) => isAdmin || article.published)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  });

// After creating, editing, publishing or deleting an article
export const useInvalidateArticles = () => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["articles"] }),
      queryClient.invalidateQueries({ queryKey: ["article"] }),
    ]);
};

export const useArticle = (slug: string) =>
  useQuery({
    queryKey: queryKeys.article(slug),
    queryFn: async () => (await getArticlesFromParam("slug", slug))[0] ?? null,
  });

// Download URLs of the article images, in order (missing files skipped)
export const useArticleImages = (article: Article | null | undefined) =>
  useQuery({
    queryKey: queryKeys.articleImages(article?.id ?? ""),
    queryFn: async () => {
      const urls = await Promise.all(
        (article?.images ?? []).map((image) => getDownloadURL(ref(storage, image.ref)).catch(() => null))
      );
      return urls.filter((url): url is string => !!url);
    },
    enabled: !!article?.id,
  });

export const useComments = (articleId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.comments(articleId ?? ""),
    queryFn: (): Promise<Comment[]> => getCommentsFromParam("article_ref", articleId ?? ""),
    enabled: !!articleId,
  });

export const useArticleLikes = (articleId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.likes(articleId ?? ""),
    queryFn: (): Promise<Like[]> => getLikesFromEntity({ type: "article", ref: articleId ?? "" }),
    enabled: !!articleId,
  });

export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (comment: Comment) => addComment(comment),
    onSuccess: (_, comment) => queryClient.invalidateQueries({ queryKey: queryKeys.comments(comment.article_ref) }),
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (comment: Comment) => deleteComment(comment),
    onSuccess: (_, comment) => queryClient.invalidateQueries({ queryKey: queryKeys.comments(comment.article_ref) }),
  });
};

// Likes an article or a comment, or removes the existing like.
// `articleId` tells which cached list to refresh.
export const useToggleLike = (articleId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ existing, like }: { existing?: Like; like: Like }) => {
      if (existing) await deleteLike(existing);
      else await addLike(like);
    },
    onSuccess: (_, { like }) =>
      queryClient.invalidateQueries({
        queryKey: like.entity_type === "article" ? queryKeys.likes(articleId) : queryKeys.comments(articleId),
      }),
  });
};

export const useProfile = (uid: string | undefined) =>
  useQuery({
    queryKey: queryKeys.profile(uid ?? ""),
    queryFn: async () => (await getProfileFromId(uid ?? "")) ?? null,
    enabled: !!uid,
  });

export const useInvalidateProfile = () => {
  const queryClient = useQueryClient();
  return (uid: string) => queryClient.invalidateQueries({ queryKey: queryKeys.profile(uid) });
};
