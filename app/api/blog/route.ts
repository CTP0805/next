import { NextResponse } from "next/server";
import { createPost, getAllPosts } from "@/app/blog/_lib/blog-store";
import type { BlogPostInput } from "@/app/blog/_lib/types";
import { BLOG_TITLE_MAX } from "@/app/blog/_lib/types";

export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[GET /api/blog]", error);
    return NextResponse.json(
      { message: "讀取文章失敗" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BlogPostInput;

    if (!body.title?.trim()) {
      return NextResponse.json({ message: "請填寫標題" }, { status: 400 });
    }
    if (body.title.trim().length > BLOG_TITLE_MAX) {
      return NextResponse.json(
        { message: `標題最多 ${BLOG_TITLE_MAX} 字` },
        { status: 400 },
      );
    }
    if (!body.content?.trim()) {
      return NextResponse.json({ message: "請填寫內容" }, { status: 400 });
    }
    if (!body.category_id) {
      return NextResponse.json({ message: "請選擇分類" }, { status: 400 });
    }

    const post = await createPost({
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt ?? null,
      cover_image: body.cover_image ?? null,
      content_image: body.content_image ?? null,
      region: body.region ?? null,
      category_id: Number(body.category_id),
      status: body.status ?? "draft",
      author_id: body.author_id ?? 1,
    });

    return NextResponse.json(
      { post, message: "文章已儲存至 blogPosts.json" },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/blog]", error);
    const message =
      error instanceof Error ? error.message : "儲存文章失敗";
    return NextResponse.json({ message }, { status: 500 });
  }
}
