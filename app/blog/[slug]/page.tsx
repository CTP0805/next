// app/blog/[slug]/page.tsx
import React from 'react';
import blogData from '@/data/blogPosts.json';
import Link from 'next/link';
import Header from '@/components/header';
import Image from 'next/image';
import RichTextContent from '@/components/RichTextContent';   // ← 只保留這一個

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  published_at: string;
  region: string;
  category_id: number;
}

const categoryMap: Record<number, string> = {
  1: '古蹟巡禮',
  2: '藝文導覽',
  3: '美饌饗宴',
  4: '戶外探索',
  5: '專人攝影',
  6: '娛樂與夜生活',
};

export default async function BlogDetail({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  const post = blogData.posts.find((p: BlogPost) => p.slug === slug) as BlogPost | undefined;

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">文章不存在</h1>
        <p className="text-gray-600 mb-8">
          找不到 slug 為 <span className="font-mono text-red-500">{slug}</span> 的文章
        </p>
        <Link 
          href="/blog" 
          className="px-6 py-3 bg-teal-600 text-white rounded-2xl hover:bg-teal-700 transition"
        >
          返回文章列表
        </Link>
      </div>
    );
  }

  const recommendations = blogData.posts
    .filter((p: BlogPost) => p.region === post.region && p.slug !== post.slug)
    .slice(0, 5);
<Header />

return (
<div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* 左側主要內容 */}
        <div className="lg:col-span-8">
          {/* 標籤 */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-5 py-2 rounded-2xl text-sm font-medium bg-teal-100 text-teal-700">
              {post.region}
            </span>
            <span className="px-5 py-2 rounded-2xl text-sm font-medium bg-amber-100 text-amber-700">
              {categoryMap[post.category_id] || '其他'}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-10">
            <span>
              發布於 {new Date(post.published_at).toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <span>作者：MaoDay 編輯部</span>
          </div>

          <Image
            src={post.cover_image}
            alt={post.title}
            className="w-full rounded-3xl mb-12 shadow-lg"
            width={800}
            height={450}
            priority
          />

          {/* 文章內容 - 使用 RichTextContent 元件 */}
          <article className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-teal-600">
            <RichTextContent content={post.content} />
          </article>
        </div>

        {/* 右側推薦文章 */}
        <div className="lg:col-span-4">
          <div className="sticky top-8">
            <h3 className="font-bold text-2xl mb-8 pb-4 border-b">推薦閱讀</h3>

            <div className="space-y-8">
              {recommendations.length > 0 ? (
                recommendations.map((rec: BlogPost) => (
                  <Link href={`/blog/${rec.slug}`} key={rec.id} className="group block">
                    <div className="overflow-hidden rounded-2xl mb-4">
                      <Image
                        src={rec.cover_image}
                        alt={rec.title}
                        className="w-full h-44 object-cover group-hover:scale-105 transition duration-500"
                        width={800}
                        height={450}
                        priority
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xs mb-2">
                        <span className="text-teal-600 font-medium">{rec.region}</span>
                        <span className="text-amber-600">・{categoryMap[rec.category_id]}</span>
                      </div>
                      <h4 className="font-semibold text-lg leading-tight group-hover:text-teal-600 transition-colors mb-2">
                        {rec.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{rec.excerpt}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500">目前沒有更多推薦文章</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}