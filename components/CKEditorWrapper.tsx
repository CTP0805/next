"use client";

import { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  // 基本樣式
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Subscript,
  Superscript,
  // 標題／區塊
  Heading,
  BlockQuote,
  CodeBlock,
  HorizontalLine,
  PageBreak,
  // 清單
  List,
  ListProperties,
  TodoList,
  // 縮排
  Indent,
  IndentBlock,
  // 對齊
  Alignment,
  // 字型（勿再加 Font 聚合外掛，避免重複註冊）
  FontFamily,
  FontSize,
  FontColor,
  FontBackgroundColor,
  // 螢光／清除格式
  Highlight,
  RemoveFormat,
  // 連結
  Link,
  AutoLink,
  // 圖片（上傳用 base64 模擬，無需後端）
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  ImageInsert,
  ImageInsertViaUrl,
  AutoImage,
  PictureEditing,
  LinkImage,
  // 表格
  Table,
  TableToolbar,
  TableCaption,
  TableProperties,
  TableCellProperties,
  TableColumnResize,
  // 媒體
  MediaEmbed,
  // 貼上／自動格式
  PasteFromOffice,
  Autoformat,
  TextTransformation,
  // 特殊字元／書籤
  SpecialCharacters,
  SpecialCharactersEssentials,
  Bookmark,
  // 尋找取代／原始碼／顯示區塊
  FindAndReplace,
  SourceEditing,
  ShowBlocks,
  // 全螢幕
  Fullscreen,
  // 字數統計
  WordCount,
  // HTML 支援
  GeneralHtmlSupport,
  HtmlEmbed,
  // 選取全部
  SelectAll,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { uploadBlogImage } from "@/app/blog/_lib/api";
import { resolveBlogMediaUrl } from "@/app/blog/_lib/media";

type CKEditorFileLoader = { file: Promise<File | null> };

class BlogImageUploadAdapter {
  constructor(private readonly loader: CKEditorFileLoader) {}

  async upload(): Promise<{ default: string }> {
    const file = await this.loader.file;
    if (!file) throw new Error("找不到要上傳的圖片");
    const path = await uploadBlogImage(file);
    return { default: resolveBlogMediaUrl(path) };
  }

  abort(): void {
    // CKEditor upload adapter contract.
  }
}

interface CKEditorWrapperProps {
  data: string;
  onChange: (data: string) => void;
  placeholder?: string;
}

export default function CKEditorWrapper({
  data,
  onChange,
  placeholder = "請輸入文章內容...",
}: CKEditorWrapperProps) {
  const [wordStats, setWordStats] = useState({ words: 0, characters: 0 });

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="[&_.ck-editor__editable]:min-h-[360px] [&_.ck-editor__editable]:text-gray-900 [&_.ck-editor__editable_inline]:px-4 [&_.ck-editor__editable_inline]:py-3 [&_.ck-toolbar__items]:flex-wrap [&_.ck-toolbar__items]:gap-y-1">
        <CKEditor
          editor={ClassicEditor}
          data={data}
          onReady={(editor) => {
            const repository = editor.plugins.get("FileRepository");
            repository.createUploadAdapter = (loader) =>
              new BlogImageUploadAdapter(loader);
          }}
          config={{
            licenseKey: "GPL",
            plugins: [
              Essentials,
              Paragraph,
              // 樣式
              Bold,
              Italic,
              Underline,
              Strikethrough,
              Code,
              Subscript,
              Superscript,
              // 結構
              Heading,
              BlockQuote,
              CodeBlock,
              HorizontalLine,
              PageBreak,
              // 清單
              List,
              ListProperties,
              TodoList,
              Indent,
              IndentBlock,
              // 對齊／字型
              Alignment,
              FontFamily,
              FontSize,
              FontColor,
              FontBackgroundColor,
              Highlight,
              RemoveFormat,
              // 連結
              Link,
              AutoLink,
              // 圖片
              Image,
              ImageCaption,
              ImageResize,
              ImageStyle,
              ImageToolbar,
              ImageUpload,
              ImageInsert,
              ImageInsertViaUrl,
              AutoImage,
              PictureEditing,
              LinkImage,
              // 表格
              Table,
              TableToolbar,
              TableCaption,
              TableProperties,
              TableCellProperties,
              TableColumnResize,
              // 媒體
              MediaEmbed,
              // 貼上與自動格式
              PasteFromOffice,
              Autoformat,
              TextTransformation,
              // 其他
              SpecialCharacters,
              SpecialCharactersEssentials,
              Bookmark,
              FindAndReplace,
              SourceEditing,
              ShowBlocks,
              Fullscreen,
              WordCount,
              GeneralHtmlSupport,
              HtmlEmbed,
              SelectAll,
            ],
            toolbar: {
              items: [
                "undo",
                "redo",
                "|",
                "heading",
                "|",
                "fontFamily",
                "fontSize",
                "fontColor",
                "fontBackgroundColor",
                "|",
                "bold",
                "italic",
                "underline",
                "strikethrough",
                "code",
                "subscript",
                "superscript",
                "removeFormat",
                "|",
                "alignment",
                "outdent",
                "indent",
                "|",
                "bulletedList",
                "numberedList",
                "todoList",
                "|",
                "blockQuote",
                "codeBlock",
                "horizontalLine",
                "pageBreak",
                "|",
                "link",
                "bookmark",
                "insertImage",
                "mediaEmbed",
                "insertTable",
                "htmlEmbed",
                "specialCharacters",
                "highlight",
                "|",
                "findAndReplace",
                "selectAll",
                "showBlocks",
                "sourceEditing",
                "fullscreen",
              ],
              shouldNotGroupWhenFull: false,
            },
            heading: {
              options: [
                {
                  model: "paragraph",
                  title: "內文",
                  class: "ck-heading_paragraph",
                },
                {
                  model: "heading1",
                  view: "h1",
                  title: "標題 1",
                  class: "ck-heading_heading1",
                },
                {
                  model: "heading2",
                  view: "h2",
                  title: "標題 2",
                  class: "ck-heading_heading2",
                },
                {
                  model: "heading3",
                  view: "h3",
                  title: "標題 3",
                  class: "ck-heading_heading3",
                },
                {
                  model: "heading4",
                  view: "h4",
                  title: "標題 4",
                  class: "ck-heading_heading4",
                },
              ],
            },
            fontFamily: {
              options: [
                "default",
                "Arial, Helvetica, sans-serif",
                "Courier New, Courier, monospace",
                "Georgia, serif",
                "Lucida Sans Unicode, Lucida Grande, sans-serif",
                "Tahoma, Geneva, sans-serif",
                "Times New Roman, Times, serif",
                "Trebuchet MS, Helvetica, sans-serif",
                "Verdana, Geneva, sans-serif",
                "微軟正黑體, Microsoft JhengHei, sans-serif",
                "新細明體, PMingLiU, serif",
              ],
              supportAllValues: true,
            },
            fontSize: {
              options: [10, 12, 14, "default", 18, 20, 24, 28, 32, 36, 48],
              supportAllValues: true,
            },
            fontColor: {
              colors: [
                { color: "hsl(0, 0%, 0%)", label: "黑" },
                { color: "hsl(0, 0%, 30%)", label: "深灰" },
                { color: "hsl(0, 0%, 60%)", label: "灰" },
                { color: "hsl(0, 0%, 90%)", label: "淺灰" },
                { color: "hsl(0, 0%, 100%)", label: "白", hasBorder: true },
                { color: "hsl(0, 75%, 60%)", label: "紅" },
                { color: "hsl(30, 75%, 60%)", label: "橙" },
                { color: "hsl(60, 75%, 60%)", label: "黃" },
                { color: "hsl(90, 75%, 60%)", label: "淺綠" },
                { color: "hsl(120, 75%, 60%)", label: "綠" },
                { color: "hsl(180, 75%, 60%)", label: "青" },
                { color: "#45cad5", label: "品牌青" },
                { color: "hsl(210, 75%, 60%)", label: "藍" },
                { color: "hsl(270, 75%, 60%)", label: "紫" },
                { color: "hsl(310, 75%, 60%)", label: "粉" },
              ],
              columns: 5,
            },
            fontBackgroundColor: {
              colors: [
                { color: "hsl(0, 0%, 100%)", label: "白", hasBorder: true },
                { color: "hsl(0, 0%, 90%)", label: "淺灰" },
                { color: "hsl(0, 75%, 90%)", label: "淺紅" },
                { color: "hsl(60, 75%, 90%)", label: "淺黃" },
                { color: "hsl(120, 75%, 90%)", label: "淺綠" },
                { color: "hsl(180, 75%, 90%)", label: "淺青" },
                { color: "hsl(210, 75%, 90%)", label: "淺藍" },
                { color: "hsl(270, 75%, 90%)", label: "淺紫" },
              ],
              columns: 4,
            },
            alignment: {
              options: ["left", "center", "right", "justify"],
            },
            list: {
              properties: {
                styles: true,
                startIndex: true,
                reversed: true,
              },
            },
            image: {
              toolbar: [
                "imageTextAlternative",
                "toggleImageCaption",
                "|",
                "imageStyle:inline",
                "imageStyle:block",
                "imageStyle:side",
                "imageStyle:alignLeft",
                "imageStyle:alignCenter",
                "imageStyle:alignRight",
                "|",
                "resizeImage",
                "linkImage",
              ],
              insert: {
                integrations: ["upload", "url"],
              },
              resizeOptions: [
                {
                  name: "resizeImage:original",
                  value: null,
                  label: "原始",
                },
                {
                  name: "resizeImage:25",
                  value: "25",
                  label: "25%",
                },
                {
                  name: "resizeImage:50",
                  value: "50",
                  label: "50%",
                },
                {
                  name: "resizeImage:75",
                  value: "75",
                  label: "75%",
                },
              ],
            },
            table: {
              contentToolbar: [
                "tableColumn",
                "tableRow",
                "mergeTableCells",
                "tableProperties",
                "tableCellProperties",
                "toggleTableCaption",
              ],
            },
            link: {
              decorators: {
                openInNewTab: {
                  mode: "manual",
                  label: "在新分頁開啟",
                  attributes: {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  },
                },
              },
              addTargetToExternalLinks: true,
              defaultProtocol: "https://",
            },
            mediaEmbed: {
              previewsInData: true,
            },
            codeBlock: {
              languages: [
                { language: "plaintext", label: "純文字" },
                { language: "html", label: "HTML" },
                { language: "css", label: "CSS" },
                { language: "javascript", label: "JavaScript" },
                { language: "typescript", label: "TypeScript" },
                { language: "json", label: "JSON" },
                { language: "python", label: "Python" },
                { language: "sql", label: "SQL" },
                { language: "bash", label: "Bash" },
              ],
            },
            highlight: {
              options: [
                {
                  model: "yellowMarker",
                  class: "marker-yellow",
                  title: "黃色螢光",
                  color: "var(--ck-highlight-marker-yellow)",
                  type: "marker",
                },
                {
                  model: "greenMarker",
                  class: "marker-green",
                  title: "綠色螢光",
                  color: "var(--ck-highlight-marker-green)",
                  type: "marker",
                },
                {
                  model: "pinkMarker",
                  class: "marker-pink",
                  title: "粉色螢光",
                  color: "var(--ck-highlight-marker-pink)",
                  type: "marker",
                },
                {
                  model: "blueMarker",
                  class: "marker-blue",
                  title: "藍色螢光",
                  color: "var(--ck-highlight-marker-blue)",
                  type: "marker",
                },
                {
                  model: "redPen",
                  class: "pen-red",
                  title: "紅色筆",
                  color: "var(--ck-highlight-pen-red)",
                  type: "pen",
                },
                {
                  model: "greenPen",
                  class: "pen-green",
                  title: "綠色筆",
                  color: "var(--ck-highlight-pen-green)",
                  type: "pen",
                },
              ],
            },
            htmlSupport: {
              allow: [
                {
                  name: /.*/,
                  attributes: true,
                  classes: true,
                  styles: true,
                },
              ],
            },
            wordCount: {
              onUpdate: (stats: { words: number; characters: number }) => {
                setWordStats({
                  words: stats.words,
                  characters: stats.characters,
                });
              },
            },
            placeholder,
          }}
          onChange={(_, editor) => {
            onChange(editor.getData());
          }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-slate-50 px-3 py-2 text-[11px] text-gray-500">
        <span>
          字數約 {wordStats.words} 字 · 字元 {wordStats.characters}
        </span>
        <span>圖片會直接上傳，草稿與退回文章皆可正常顯示</span>
      </div>
    </div>
  );
}
