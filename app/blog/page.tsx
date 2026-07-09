// app/blog/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';                    // ← 新增
import blogData from '@/data/blogPosts.json';
import Header from '@/components/header';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  published_at: string;
  region: string;
  category_id: number;
}

const countries = ['倫敦', '巴黎', '慕尼黑', '阿姆斯特丹', '羅馬', '巴賽隆納'];

const categoryMap: Record<number, string> = {
  1: '古蹟巡禮',
  2: '藝文導覽',
  3: '美饌饗宴',
  4: '戶外探索',
  5: '專人攝影',
  6: '娛樂與夜生活',
};

export default function BlogListPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const allPosts = useMemo(() => blogData.posts as BlogPost[], []);

  const filteredPosts = useMemo(() => {
    if (!selectedCountry) return allPosts;
    return allPosts.filter(post => post.region === selectedCountry);
  }, [allPosts, selectedCountry]);

  const featuredPosts = useMemo(() => {
    if (selectedCountry) return [];
    return allPosts.slice(0, 6);
  }, [allPosts, selectedCountry]);

  const latestPosts = useMemo(() => {
    if (selectedCountry) return [];
    return [...allPosts]
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 12);
  }, [allPosts, selectedCountry]);

  const popularPosts = useMemo(() => {
    if (selectedCountry) return [];
    return [...allPosts]
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 6);
  }, [allPosts, selectedCountry]);

  return (
    <div className="min-h-screen bg-gray-50">
        <Header />
      {/* Hero Banner */}
      <div className="relative h-[420px] bg-cover bg-center" style={{ backgroundImage: "url('https://placehold.co/1920x600/0f766e/ffffff?text=MaoDay+全球旅遊')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">全球旅遊攻略</h1>
          <p className="text-xl mb-10 max-w-md">選擇目的地，探索專屬旅行靈感</p>
          
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
            {countries.map((country) => (
              <button
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`px-8 py-4 rounded-2xl font-medium text-lg transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 ${
                  selectedCountry === country 
                    ? 'bg-white text-teal-700 scale-105' 
                    : 'bg-white/20 hover:bg-white/30 backdrop-blur text-white border border-white/30'
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            {selectedCountry ? `${selectedCountry} 所有文章` : '精選旅遊情報'}
          </h2>
        </div>

        {/* 文章卡片區 */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(selectedCountry ? filteredPosts : featuredPosts).map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.id} className="group">
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer">
                  <div className="relative h-64 overflow-hidden">
                    <Image 
                      src={post.cover_image} 
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized={true}                    // ← 建議保留
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  <div className="p-7">
                    <h3 className="font-semibold text-2xl text-gray-900 mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed line-clamp-3 mb-4 text-[15.2px]">
                      {post.excerpt}
                    </p>

                    {/* 地區 + 類型標籤 */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-2xl text-xs font-medium bg-teal-100 text-teal-700">
                        {post.region}
                      </span>
                      <span className="inline-flex items-center px-4 py-1.5 rounded-2xl text-xs font-medium bg-amber-100 text-amber-700">
                        {categoryMap[post.category_id] || '其他'}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mt-3">
                      {new Date(post.published_at).toLocaleDateString('zh-TW')}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 最新 + 最受歡迎（未選國家時顯示） */}
        {!selectedCountry && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* 最新旅遊攻略 */}
            <section className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">最新旅遊攻略</h2>
              <div className="space-y-10">
                {latestPosts.map((post) => (
                  <Link href={`/blog/${post.slug}`} key={post.id} className="group block">
                    <div className="flex gap-8 cursor-pointer">
                      <div className="relative w-72 h-48 flex-shrink-0 rounded-3xl overflow-hidden shadow-md">
                        <Image 
                          src={post.cover_image} 
                          alt={post.title} 
                          fill
                          className="object-cover group-hover:scale-105 transition duration-500"
                          sizes="(max-width: 768px) 100vw, 272px"
                          unoptimized={true}
                        />
                      </div>
                      <div className="flex-1 pt-2">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-xs bg-teal-100 text-teal-700 px-4 py-2 rounded-2xl font-medium">{post.region}</span>
                          <span className="text-xs bg-amber-100 text-amber-700 px-4 py-2 rounded-2xl font-medium">
                            {categoryMap[post.category_id] || '其他'}
                          </span>
                          <span className="text-sm text-gray-500 ml-auto">{new Date(post.published_at).toLocaleDateString('zh-TW')}</span>
                        </div>
                        <h3 className="font-semibold text-2xl text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">{post.title}</h3>
                        <p className="text-gray-600 leading-relaxed line-clamp-3">{post.excerpt}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* 最受歡迎 */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">最受歡迎</h2>
              <div className="space-y-8">
                {popularPosts.map((post, idx) => (
                  <Link href={`/blog/${post.slug}`} key={post.id} className="group block">
                    <div className="flex gap-5 cursor-pointer">
                      <div className="text-5xl font-bold text-teal-100 group-hover:text-teal-200 transition w-14">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <span className="text-teal-600 font-medium">{post.region}</span>
                          <span className="text-amber-600">・{categoryMap[post.category_id] || '其他'}</span>
                        </div>
                        <h4 className="font-medium text-xl text-gray-900 leading-tight mb-3 group-hover:text-teal-600 transition-colors">{post.title}</h4>
                        <p className="text-gray-600 text-sm line-clamp-3">{post.excerpt}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      <footer className="bg-gray-900 text-gray-400 py-16 text-sm">
        <div className="max-w-7xl mx-auto px-6 text-center">
          © 2026 MaoDay - 你的旅行靈感來源
        </div>
      </footer>
    </div>
  );
}