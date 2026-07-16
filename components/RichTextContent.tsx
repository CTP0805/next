"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";

interface Props {
  content: string;
}

function looksLikeHtml(content: string): boolean {
  const trimmed = content.trim();
  return /^<[a-z][\s\S]*>/i.test(trimmed);
}

export default function RichTextContent({ content }: Props) {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const dompurifyModule = await import("dompurify");
      const DOMPurify = dompurifyModule.default || dompurifyModule;

      // CKEditor 存的是 HTML；舊資料多為 Markdown
      const source = looksLikeHtml(content)
        ? content
        : ((await marked.parse(content, { breaks: true })) as string);

      const cleanHtml = DOMPurify.sanitize(source);
      if (!cancelled) setHtmlContent(cleanHtml);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [content]);

  return (
    <div
      className={[
        "prose prose-lg max-w-none prose-headings:font-bold prose-a:text-teal-600",
        // CKEditor 產出的表格／圖／程式碼／引用
        "prose-img:rounded-xl prose-img:shadow-md",
        "prose-table:border prose-th:bg-slate-50 prose-th:p-2 prose-td:border prose-td:p-2",
        "prose-pre:bg-slate-900 prose-pre:text-slate-100",
        "prose-blockquote:border-teal-400",
        "[&_.image]:my-6 [&_.image]:text-center",
        "[&_.image-style-side]:float-right [&_.image-style-side]:ml-4 [&_.image-style-side]:max-w-[50%]",
        "[&_.todo-list]:list-none [&_.todo-list_input]:mr-2",
        "[&_.marker-yellow]:bg-yellow-200 [&_.marker-green]:bg-green-200",
        "[&_.marker-pink]:bg-pink-200 [&_.marker-blue]:bg-blue-200",
        "[&_.pen-red]:text-red-600 [&_.pen-green]:text-green-600",
        "[&_.page-break]:my-8 [&_.page-break]:border-t [&_.page-break]:border-dashed",
        "[&_figure.table]:overflow-x-auto",
        "[&_.media]:my-6",
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      suppressHydrationWarning
    />
  );
}
