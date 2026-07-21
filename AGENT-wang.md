# AGENT-wang — 阿偉專屬協作記憶

> **用途**：本檔是「阿偉負責功能」的單一真相來源。  
> **讀取規則**：新 session 開場讀 **一次** 本檔即可（AGENTS 摘要已內嵌）。  
> **之後**：不要每輪重讀 `AGENTS.md` / `.vscode/_docs`。  
> **寫入規則**：每次完成需求後，在文末「更動紀錄」追加一則節點（時間／需求／更動檔案）。

---

## 0. Agent 準則（已讀一次，內嵌摘要，勿每輪重讀）

來源：`next/AGENTS.md`（2026-07-21 讀取）

1. 動手前先想清楚；多解讀就列選項；能簡就簡；不懂先問。
2. 簡潔優先：不做超需求功能；不為單次使用硬抽象。
3. 手術式變更：不順便改無關程式；對齊既有風格；只清自己 diff 死碼。
4. 目標驅動：`步驟 → 驗證`。
5. TS／React：避免 `any`；props 用 `interface`；僅互動元件 `"use client"`；勿虛構 API／欄位。
6. 優先：使用者指令 > 本檔／AGENTS > `_docs` 細則。

---

## 1. 負責範圍

| 領域 | 前端 | Express 掛載（`express/index.ts`） |
|------|------|-------------------------------------|
| Blog | `/blog/*` | `app.use("/api/blog/upload", …)` **先於** `app.use("/api/blog", …)` |
| Level | `/member/level` | `app.use("/api/member-level", …)` |
| Coupon | `/member/coupon` | `app.use("/api/member-coupon", …)` |
| Order | `/member/order` | `app.use("/api/member-order", …)` |

共用：`next/config/api-path.ts`（`getApiServer()` → hostname:3001）、`auth-context`、`authenticate` middleware、MySQL `pool`。

### 1.0 共用檔規則（強制）

- **預設不改別人負責的共用模組**（他人路由、layout、他人元件等）；阿偉功能維持獨立檔（`api-member-level`／`api-member-coupon`／`api-member-order`／`api-blog*`）。
- 會動到團隊共用檔（如 `seed.sql`／`schema.sql`）時：先**另建獨立檔**（例：`seed-wang-benefits.sql`），**等使用者明確說「併入」才寫進共用 seed**。
- 已交付／可併入：`express/databases/seed-wang-benefits.sql`（M幣／券／等級）；使用者已要求併入 `seed.sql`。

### 1.2 部落格 × 會員中心連動（2026-07-21）

- 前台 `/blog`：**拿掉**文章管理／文章審查按鈕；改「我的文章」「撰寫文章」
- 會員中心：`/member/edit-post`（會員：自己的文·撰寫／編輯／刪除）
- 會員中心：`/member/blog-review`（**管理者** only：檢視／註解／通過／駁回）
- 身分：`auth.role`（DB `member.role`：會員｜管理者｜客服）；`/api/auth/me` 回傳 role
- 撰寫綁 **已付款訂單**（`order_id`／`order_title` 鎖定）；需執行 `wang-blog-order-review.sql`
- 舊路由 `/blog/manage`、`/blog/review` → redirect 會員中心

### 1.1 語法／架構參考規則（強制）

之後阿偉負責功能的**前後端語法與撰寫架構**，一律**參考、對齊**下列寫法來建構；**只讀不改**（禁止修改參考來源檔案）。

| 參考來源 | 路徑 | 用途 | 可否修改 |
|----------|------|------|----------|
| **Member Profile（主參考）** | `next/app/member/profile/` | 會員功能 fetch／狀態／表單／API 信封寫法 | **禁止修改** |
| M 幣說明頁（若需靜態頁風格） | `next/app/points/` | 僅說明頁 UI，非 API 分層 | **禁止修改** |

> 專案內**沒有** `member/point` 目錄。既有 `member/coupon`、`member/level` 註解亦寫「寫法參考 **member/profile**」。使用者所稱 `member/point` → 以 **`member/profile` 為架構基準**；M 幣業務仍落在阿偉的 `member/coupon`（獨立檔擴充）。

**從 profile 對齊的架構要點（建構阿偉模組時套用，不改 profile 本體）：**

1. **`"use client"` 頁面** + 本地 `useState`／`useEffect` 載入資料  
2. **API 呼叫**：`API_SERVER` 或 `getApiServer()` + `credentials: "include"`  
3. **回應信封**：`{ success, message?, data? }` → 檢查 `response.ok`／`success`／`data` 後再使用  
4. **錯誤**：`toast` 或頁內 error 字串；訊息優先用後端 `message`  
5. **分層（阿偉模組建議，沿用 coupon／level 已採結構）**  
   - `page.tsx`：組裝、登入態、loading／error  
   - `api.ts`：純 fetch 函式（**勿把 fetch 全塞死在巨大 page 若可拆**；profile 本體可維持原樣不重構）  
   - `types.ts`／`utils.ts`：型別與純函式（需要時）  
   - `_components/*`：UI 子件  
6. **後端**：獨立 router 檔（如 `api-member-coupon.ts`），**不塞進** `api-member.ts` 等他人檔  
7. **樣式／互動**：對齊會員區既有圓角、`#45cad5` 語系與 toast 習慣；不為了「統一」去改 profile／points 檔

**違規示例：** 為了對齊風格直接 edit `member/profile/page.tsx` 或 `app/points/*` → 禁止。應在阿偉自己的 `blog`／`level`／`coupon` 路徑新建或修改。

---

## 2. Blog — 前後端行為（已讀 2026-07-21）

### 2.1 資料表 `posts`

- `id, title(varchar20), slug(unique), content(longtext), excerpt, cover_image, content_image, status, published_at, updated_at, created_at, author_id→member, category_id`
- status：`draft | pending_review | published | rejected`

### 2.2 Express `api-blog.ts`

| 方法 | 路徑 | 驗證 | 行為 |
|------|------|------|------|
| GET | `/api/blog` | 無 | query `status`、`category_id`；ORDER published_at DESC / updated_at |
| GET | `/api/blog/slug/:slug` | 無 | **僅** `status=published` |
| GET | `/api/blog/:id` | 無 | 任意 status 單篇 |
| POST | `/api/blog` | authenticate | 新建；author=`req.user.id`；title≤20；必填 title/content/category_id；`published` 強制改 `pending_review`；slug 唯一；HTML/封面 dataURL→檔案 |
| PUT | `/api/blog/:id` | authenticate | **僅作者**；draft/rejected→published 強制 `pending_review`；slug 唯一（排除自己） |
| DELETE | `/api/blog/:id` | authenticate | **僅作者** |

後端也會 `persistHtmlDataImages` / `persistSingleImageField`（base64→`public/uploads/blog`）。

### 2.3 Express `api-blog-upload.ts` + `upload-blog-image.ts`

- `POST /api/blog/upload`，field=`image`，需登入
- multer 5MB；png/jpeg/webp/gif/avif；UUID 檔名
- 回傳 `{ success, path: "/uploads/blog/xxx", url: absolute }`

### 2.4 前端 API `blog/_lib/api.ts`

- 一律 `getApiServer()` + `credentials: "include"` + `cache: "no-store"`
- `fetchBlogPosts` / `ById` / `BySlug` / `createBlogPost` / `updateBlogPost` / `deleteBlogPost` / `uploadBlogImage`
- 413／連線失敗中文錯誤訊息

### 2.5 前端型別 `types.ts`

- `BLOG_TITLE_MAX=20`；`BLOG_STATUS_LABEL` 中文
- `BLOG_REGIONS`：倫敦、巴黎、慕尼黑、阿姆斯特丹、羅馬、巴賽隆納（**無 DB region 欄**）
- `BLOG_CATEGORY_MAP` 1–6：古蹟巡禮／藝文導覽／美饌饗宴／戶外探索／專人攝影／娛樂與夜生活
- `slugifyTitle`：中文→pinyin-pro 無聲調 kebab

### 2.6 媒體

- `media.ts`：`resolveBlogMediaUrl`、`rewriteBlogContentMedia`；`/uploads/` 與六城市路徑接 Express；seed `/blog/`、錯誤 `carousel1.jpg` → placeholder `/images/carousel1.jpeg`；`shouldUseNextImage` 僅信任 `/images/`
- `content-images.ts`：送出前把 HTML base64 圖 `uploadBlogImage` 換成 path（單檔≤5MB）
- 後端 `blog-content-images.ts`：同步落盤去重

### 2.7 頁面行為

| 路由 | 重點 |
|------|------|
| `/blog` client | 列表只顯示 published；地區用 title/excerpt/content **字串包含**篩選；精選≤6、最新≤8、經典推薦≤5（較早 published）；連 manage／review／new |
| `/blog/[slug]` RSC | `fetchBlogPostBySlug`；404；推薦同 category 最多 5；上方圖 content_image\|\|cover；`BlogRichTextContent`；留言 **前端 mock**（無 API） |
| `/blog/new` | `BlogPostForm` create；成功 published→詳情否則 manage |
| `/blog/[slug]/edit` | 登入+作者；從列表 find slug；非作者 forbidden |
| `/blog/manage` | 全站文章列表（前端不過濾作者顯示）；狀態篩選+關鍵字；**操作僅 isOwner**；可改 status／刪除（update/delete API） |
| `/blog/review` | 非 published 佇列；預設 pending_review；通過→published、退回→rejected；**目前也是 isOwner 才能改**（非獨立 admin role） |

### 2.8 `BlogPostForm`

- 登入必填；title≤20；內容需有意義文字
- 狀態動作：草稿 `draft`、送出審查 `pending_review`
- 封面：本機預覽；**送出審查時才 upload**；草稿本機檔不上傳、沿用舊圖
- 內文：CKEditor；submit 前 `persistContentImagesInHtml`
- cover 與 content_image 常寫同一 path
- slug：`slugifyTitle(title)`

### 2.9 元件備註

- `BlogOwnerEditLink`：auth.id === author_id 才顯示
- `BlogCommentSection`：local state + seed，**未接後端**
- `BlogMediaImage` / `BlogRichTextContent`：媒體 URL 改寫

---

## 3. Member Level — 前後端行為（已讀 2026-07-21）

### 3.1 DB

- `member.member_level` enum 銅\|銀\|金 default 銅
- `total_orders`, `total_spent`, `current_points`, `name`

### 3.2 Express `api-member-level.ts`

- **僅** `GET /api/member-level` + authenticate
- **不寫入升等**（不 UPDATE member_level）；只讀 DB 現值 + 算進度
- 門檻常數：
  - 銅：0/0
  - 銀：orders≥3 **或** spent≥5000
  - 金：orders≥6 **或** spent≥15000
- 進度：相對當前→下一級 span，訂單／消費 progress 取 **max**，×100
- 回傳 `data`：name, current_level, next_level, progress_percent, remaining_orders/spend, totals, current_points, levels[], benefit_rows[], thresholds, faqs[]
- 權益列：大使權益、會員日、會員價、升等禮、續會禮（銅銀金文案）
- FAQ 4 則（後端寫死）

### 3.3 前端

- `api.ts`：`fetchMemberLevel` → envelope `data`
- `page.tsx`：authInit；未登入錯誤；loading／error／retry；`MemberLevelRightPanel` + `MemberLevelDetailDrawer`
- `level.tsx`：ELITE 卡、進度條、三欄權益摘要（取 benefit_rows）、FAQ 前 3 則可折疊、「會員詳情」開 drawer
- `levelcontent.tsx`：portal 右側 drawer；進度；完整權益表；門檻說明；全部 FAQ；Esc／遮罩關閉

---

## 4. Member Coupon — 前後端行為（已讀 2026-07-21）

### 4.1 DB

- `coupons`：id, coupon_name, min_spent, discount_amount, start_date, end_date（**無 code 欄**）
- `member_coupons`：id, member_id, coupon_id, is_used, received_at, used_at
- `member.current_points`
- `order_main`：points_earned / points_redeemed → 推導流水（**無 point_transactions 表**）

### 4.2 Express `api-member-coupon.ts`

| 方法 | 路徑 | 行為 |
|------|------|------|
| GET | `/benefits` | wallet.balance=current_points；redeem_threshold=10；transactions 由訂單 earn(+)/spend(-)；owned coupons JOIN；status=used\|expired\|scheduled\|available；redeemable=未持有且未過期券池（合成 code `C{id}`） |
| POST | `/redeem` | body `{code}`；parse `^C(\d+)$`；券存在、未過期、未持有 → INSERT member_coupons；201 + coupon view |

- map 相容舊 UI：`discount_type:"fixed"`, discount_value, min_order_amount, title, description, starts_at/expires_at
- end_date 當日 23:59:59 仍有效

### 4.3 前端 types / utils

- `MemberBenefitsPayload`：wallet, transactions, coupons, redeemable_codes
- filters：points all/earned/used/expired；coupons all/available/scheduled/used/expired
- `SELECTED_COUPON_STORAGE_KEY = "maoday-selected-coupon"`
- `LIST_PAGE_SIZE=10`；paginate；`saveSelectedCoupon` / read / clear
- `calcCouponDiscount` 固定金額且滿 min_order；`calcFinalAmount`

### 4.4 前端頁面

- `page.tsx`：auth + `fetchMemberBenefits` + `CouponPageClient`
- `CouponPageClient`：
  - tab：coupons（預設）/ points
  - 進入頁 `clearSelectedCoupon`
  - 使用券：status=available → localStorage + toast → `router.push("/cart")`；再點取消
  - 兌換：`redeemCouponCode` → 更新列表、從 redeemPool 移除；可 onReload
  - 分頁各 10 筆
- 子元件：WalletBanner、SegmentTabs、TransactionList、CouponList、RedeemCouponForm、ListPagination

### 4.5 邊界

- 兌換不扣 M幣；只寫 member_coupons
- M幣餘額只顯示；流水不影響 balance 重算
- 結帳真正用券在 cart／checkout（非本頁主責）；本頁只寫 localStorage 選券

---

## 5. 跨 session 雜記

- 六城市靜態圖：`express/public/{London|Paris|Munich|Amsterdam|Venice|Barcelona}/{City}##.jpg` 各 30；blog media 會解析城市路徑到 Express
- Level／Coupon 刻意獨立 router，不塞 `api-member.ts`
- Blog 審核 UI 無角色分流（非管理者專用 API）；與 manage 同靠作者 update

---

## 6. 更動紀錄格式

```
<!--
### CHANGELOG NODE
- 時間: YYYY-MM-dd HH:mm
- 需求: …
- 更動檔案:
  - path — …
-->
```

---

## 7. 更動紀錄

<!--
### CHANGELOG NODE
- 時間: 2026-07-21 11:30
- 需求: 確立負責 blog、member/level、member/coupon；agent 讀一次後不再每輪讀；寫入 AGENT-wang.md 與 changelog 節點格式
- 更動檔案:
  - next/AGENT-wang.md — 新建
-->

### [2026-07-21 11:30] 建立 AGENT-wang
- **需求**: 負責三路由；agent 讀一次；記憶與 changelog
- **更動檔案**: `next/AGENT-wang.md`

<!--
### CHANGELOG NODE
- 時間: 2026-07-21 11:33
- 需求: 了解 blog / member-level / member-coupon 前後端功能；讀取並記憶；不需對使用者說明
- 更動檔案:
  - next/AGENT-wang.md — 寫入三功能完整前後端行為、API、DB、頁面流程、邊界（§2–§5）；本則節點
-->

### [2026-07-21 11:33] 三功能前後端讀取入檔
- **需求**: 讀取並記憶 blog、member/level、member/coupon 前後端（無需說明）
- **更動檔案**:
  - `next/AGENT-wang.md` — 展開 §2 Blog、§3 Level、§4 Coupon 行為細節
- **已讀來源（本輪，之後不重讀除非改 code）**:
  - Blog: `api-blog.ts`, `api-blog-upload.ts`, `blog-content-images.ts`, `upload-blog-image.ts`, `blog/_lib/*`, pages, `BlogPostForm`, 相關 components, schema posts
  - Level: `api-member-level.ts`, `member/level/*`
  - Coupon: `api-member-coupon.ts`, `member/coupon/*`, schema coupons/member_coupons/member points
  - mount: `express/index.ts`

<!--
### CHANGELOG NODE
- 時間: 2026-07-21 14:22
- 需求: 參考 seed.sql 做 M幣／優惠券／等級模擬資料；每帳號 10 張券（未用/已用/過期/未生效）；等級依累積消費影響進度條
- 更動檔案:
  - express/databases/seed.sql — coupons 日期狀態、member_coupons×630、order_main/order_items M幣流水、member UPDATE 等級/points/spent/orders
  - express/databases/seed-wang-benefits.sql — 獨立片段（可重產）
  - express/databases/schema.sql — AUTO_INCREMENT member_coupons=631, order_items=253, member=104
  - express/databases/_gen_wang_seed.mjs、_patch_seed.mjs — 產生／併入工具
  - next/AGENT-wang.md — 本則紀錄
-->

### [2026-07-21 14:22] M幣／優惠券／等級 seed
- **需求**: 每帳號 10 券混合狀態 + M幣流水 + 等級進度對齊 total_spent
- **更動檔案**: （曾誤改共用 seed/schema，已還原）正式交付僅 `express/databases/seed-wang-benefits.sql`
- **規則摘要**:
  - 券 1–4 available、5–6 used、7–8 expired、9–10 scheduled
  - 每人 4 筆 paid 訂單（earn/redeem）
  - 測試：101 銅 spent 2800／102 銀 9200／103 金 22000

<!--
### CHANGELOG NODE
- 時間: 2026-07-21 14:30
- 需求: 共用檔勿直接改；之後只另建檔給使用者插入；記住此規則
- 更動檔案:
  - express/databases/seed.sql — 還原為團隊原版
  - express/databases/schema.sql — 還原 AUTO_INCREMENT
  - next/AGENT-wang.md — §1.0 共用檔規則 + 本則
  - 保留 express/databases/seed-wang-benefits.sql 供自行插入
-->

### [2026-07-21 14:30] 共用檔規則
- **需求**: 不改別人共用檔；只另建檔給你插入
- **更動檔案**: 還原 `seed.sql`／`schema.sql`；記憶寫入 `AGENT-wang.md` §1.0
- **自行插入**: `express/databases/seed-wang-benefits.sql`

<!--
### CHANGELOG NODE
- 時間: 2026-07-21 14:40
- 需求: 不用還原，直接併入 seed；記住預設不改別人的
- 更動檔案:
  - express/databases/seed.sql — 併入 M幣／券／等級模擬
  - express/databases/schema.sql — AUTO_INCREMENT 對齊
  - next/AGENT-wang.md — §1.0 改為「先獨立檔，明確說併入才寫共用 seed」
-->

### [2026-07-21 14:40] 併入 seed
- **需求**: 模擬資料併入 `seed.sql`；之後預設不改別人共用模組
- **更動檔案**: `seed.sql`、`schema.sql`、`AGENT-wang.md`

<!--
### CHANGELOG NODE
- 時間: 2026-07-21 15:00
- 需求: 新增規則—之後語法撰寫架構參考 member/point（實為 member/profile）寫法建構；只參考不修改該檔
- 更動檔案:
  - next/AGENT-wang.md — 新增 §1.1 語法／架構參考規則 + 本則
-->

### [2026-07-21 15:00] 架構參考 member/profile
- **需求**: 之後寫法對齊 member 參考架構；**不修改**參考來源
- **基準路徑**: `next/app/member/profile/`（無 `member/point`；與 coupon/level 既有註解一致）
- **更動檔案**: 僅 `next/AGENT-wang.md`（記憶）

<!--
### CHANGELOG NODE
- 時間: 2026-07-21 16:00
- 需求: 會員中心×部落格連動；拿掉前台審查／管理；管理進會員中心；role 分流；訂單綁定撰寫；管理者審查通過／駁回
- 更動檔案:
  - next/contexts/auth-context.tsx — role + ⭐註解
  - express/routes/api-auth.ts — /me 回傳 role
  - express/routes/api-blog.ts — mine／eligible-orders／review
  - express/databases/wang-blog-order-review.sql — 獨立 schema
  - next/app/member/edit-post、blog-review
  - next/app/blog/*（form、page、redirect）
  - next/components/MemberPanel.tsx — 依 role 選單
-->

### [2026-07-21 16:00] 部落格身分與會員中心
- **需求**: 見上
- **注意**: 請先執行 `wang-blog-order-review.sql`；DB role 為 會員／**管理者**／客服（管理者＝管理員）
