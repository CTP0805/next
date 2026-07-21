"use client";

import RichTextContent from "@/components/RichTextContent";
import { rewriteBlogContentMedia } from "../_lib/media";

/**
 * 部落格內文顯示：不改共用 RichTextContent，
 * 只在外層把 /uploads/blog/xxx 轉成 Express 可存取網址。
 */
export default function BlogRichTextContent({ content }: { content: string }) {
  const html = rewriteBlogContentMedia(content);
  return <RichTextContent content={html} />;
}
