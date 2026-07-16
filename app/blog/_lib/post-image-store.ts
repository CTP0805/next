import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const POSTS_DIRECTORY = path.join(process.cwd(), "public", "posts");
const DATA_IMAGE_PATTERN =
  /data:(image\/(?:png|jpeg|gif|webp|avif));base64,([a-zA-Z0-9+/=\s]+)/g;

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
};

interface PostImageFields {
  content: string;
  coverImage: string | null | undefined;
  contentImage: string | null | undefined;
}

interface StoredPostImageFields {
  content: string;
  coverImage: string | null | undefined;
  contentImage: string | null | undefined;
}
//這裡是用來處理部落格文章中內文與封面圖的圖片儲存功能，將 base64 編碼的圖片資料轉換成實際的檔案並儲存到指定目錄，並回傳新的圖片路徑。提供了以下功能：
//1. 儲存 base64 圖片資料：storeDataImage(dataUrl, postSlug)

async function storeDataImage(
  dataUrl: string,
  postSlug: string,
): Promise<string | null> {
  const match = DATA_IMAGE_PATTERN.exec(dataUrl);
  DATA_IMAGE_PATTERN.lastIndex = 0;

  if (!match || match[0] !== dataUrl) return null;

  const extension = IMAGE_EXTENSIONS[match[1]];
  if (!extension) return null;

  const fileName = `${postSlug}-${randomUUID()}.${extension}`;
  const filePath = path.join(POSTS_DIRECTORY, fileName);
  const image = Buffer.from(match[2].replace(/\s/g, ""), "base64");

  await fs.mkdir(POSTS_DIRECTORY, { recursive: true });
  await fs.writeFile(filePath, image);

  return `/posts/${fileName}`;
}
//這裡是用來處理部落格文章中內文與封面圖的圖片儲存功能，將 base64 編碼的圖片資料轉換成實際的檔案並儲存到指定目錄，並回傳新的圖片路徑。提供了以下功能：
//2. 取代內文中的 base64 圖片資料：replaceDataImages(content, postSlug)
async function replaceDataImages(
  content: string,
  postSlug: string,
): Promise<string> {
  const matches = [...content.matchAll(DATA_IMAGE_PATTERN)];
  if (!matches.length) return content;

  let storedContent = content;
  for (const match of matches) {
    const storedPath = await storeDataImage(match[0], postSlug);
    if (storedPath) {
      storedContent = storedContent.replace(match[0], storedPath);
    }
  }

  return storedContent;
}
//這裡是用來處理部落格文章中內文與封面圖的圖片儲存功能，將 base64 編碼的圖片資料轉換成實際的檔案並儲存到指定目錄，並回傳新的圖片路徑。提供了以下功能：
//3. 取代單一圖片欄位的 base64 圖片資料：replaceDataImage(image, postSlug)
async function replaceDataImage(
  image: string | null | undefined,
  postSlug: string,
): Promise<string | null | undefined> {
  if (!image) return image;
  return (await storeDataImage(image, postSlug)) ?? image;
}
//這裡是用來處理部落格文章中內文與封面圖的圖片儲存功能，將 base64 編碼的圖片資料轉換成實際的檔案並儲存到指定目錄，並回傳新的圖片路徑。提供了以下功能：
//4. 儲存文章中所有圖片並回傳新的圖片路徑：storePostImages(fields, postSlug)
export async function storePostImages(
  fields: PostImageFields,
  postSlug: string,
): Promise<StoredPostImageFields> {
  const contentImage = await replaceDataImage(fields.contentImage, postSlug);

  return {
    content: await replaceDataImages(fields.content, postSlug),
    // 封面圖沿用頂圖時共用儲存路徑，避免重複寫入同一張檔案。
    coverImage:
      fields.coverImage === fields.contentImage
        ? contentImage
        : await replaceDataImage(fields.coverImage, postSlug),
    contentImage,
  };
}
