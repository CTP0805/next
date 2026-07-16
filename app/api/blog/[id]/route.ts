import { NextResponse } from "next/server";
import {
  deletePost,
  getPostById,
  updatePost,
} from "@/app/blog/_lib/blog-store";
import type { BlogPostInput } from "@/app/blog/_lib/types";
import { BLOG_TITLE_MAX } from "@/app/blog/_lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const post = await getPostById(Number(id));
    if (!post) {
      return NextResponse.json({ message: "找不到文章" }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (error) {
    console.error("[GET /api/blog/:id]", error);
    return NextResponse.json({ message: "讀取失敗" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    const post = await updatePost(Number(id), {
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt ?? null,
      cover_image: body.cover_image ?? null,
      content_image: body.content_image ?? null,
      region: body.region ?? null,
      category_id: Number(body.category_id),
      status: body.status,
      author_id: body.author_id,
    });

    if (!post) {
      return NextResponse.json({ message: "找不到文章" }, { status: 404 });
    }

    return NextResponse.json({
      post,
      message: "文章已更新並寫入 blogPosts.json",
    });
  } catch (error) {
    console.error("[PUT /api/blog/:id]", error);
    const message =
      error instanceof Error ? error.message : "更新失敗";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const postId = Number(id);
    if (!Number.isFinite(postId) || postId <= 0) {
      return NextResponse.json({ message: "無效的文章 ID" }, { status: 400 });
    }

    const ok = await deletePost(postId);
    if (!ok) {
      return NextResponse.json({ message: "找不到文章" }, { status: 404 });
    }

    return NextResponse.json({ message: "文章已刪除" });
  } catch (error) {
    console.error("[DELETE /api/blog/:id]", error);
    return NextResponse.json({ message: "刪除失敗" }, { status: 500 });
  }
}
