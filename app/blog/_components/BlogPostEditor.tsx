"use client";

/**
 * 文章編輯頁共用元件
 * - member/edit-post：variant="member"（會員中心框內）
 * - blog/new：variant="standalone"（獨立頁）
 */
/**
 * 【新手】BlogPostEditor = BlogPostForm 的別名 re-export
 * 有的頁 import Editor、有的 import Form，其實同一支元件
 */
export { default } from "./BlogPostForm";
export type { BlogPostFormProps as BlogPostEditorProps } from "./BlogPostForm";
