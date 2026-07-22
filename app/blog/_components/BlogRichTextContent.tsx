"use client";

import RichTextContent from "@/components/RichTextContent";
import { rewriteBlogContentMedia } from "../_lib/media";

/**
 * 【新手】詳情頁內文 HTML
 * rewriteBlogContentMedia：把 /uploads/... 接上 Express
 * 再交給全站共用 RichTextContent（消毒／樣式）
 */
export default function BlogRichTextContent({ content }: { content: string }) {
  const html = rewriteBlogContentMedia(content);
  return <RichTextContent content={html} />;
}
