'use client'

import { useState, useEffect } from 'react'
import { marked } from 'marked'

interface Props {
  content: string
}

export default function RichTextContent({ content }: Props) {
  const [htmlContent, setHtmlContent] = useState('')

  useEffect(() => {
    const sanitizeContent = async () => {
      // 動態載入 dompurify
      const dompurifyModule = await import('dompurify')
      const DOMPurify = dompurifyModule.default || dompurifyModule

      const parsed = marked.parse(content, { breaks: true }) as string
      const cleanHtml = DOMPurify.sanitize(parsed)

      setHtmlContent(cleanHtml)
    }

    sanitizeContent()
  }, [content])

  return (
    <div 
      className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-teal-600"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      suppressHydrationWarning
    />
  )
}