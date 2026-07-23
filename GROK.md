# GROK.md — xAI Grok 專用（其他 agent 請忽略本檔）

本檔只給 **Grok（xAI / Grok Build）** 使用。  
Claude、Cursor、Copilot 等其他 agent **不應讀取、不應覆寫、不應把本檔當成共用規範**。

## 寫入規則（使用者約定 — 強制）

**只要是在本專案與 Grok 對話中「新加」的規則／偏好／限制，一律只附加到本檔 `GROK.md`。**

- **要寫**：本檔（優先「Grok 專用備註」；長期行為可另開小節）。
- **不要寫**：共用 `AGENTS.md`、子目錄 `AGENTS.md`、`CLAUDE.md`、`.vscode/_docs/**` 的共用準則（除非使用者**明確**要求改共用檔）。
- **不要**為了「引導其他 agent」去改 `AGENTS.md`；Grok 靠自己讀本檔即可。
- 下方「規則快照」只是把**既有共用 `AGENTS.md` 內容抄一份**方便重啟，**不是**在共用檔新增規則的地方。若共用檔被別人更新，可再同步快照；Grok 自己加的新約定只進本檔。

## 何時讀本檔

- **新 session／重開本專案後的第一輪**：讀一次本檔，載入專案記憶與準則快照。
- 之後同一 session：**不要為了「經過 GROK.md」而每輪重讀**。
- 僅在本檔或 `AGENTS.md` 真的有改、或任務需要「按需查閱」細則時再讀。

## 與 `AGENTS.md` 的關係（避免衝突）

| 檔案 | 誰該讀 | 角色 |
|------|--------|------|
| `AGENTS.md` | 所有 agent | **既有共用**協作準則（Grok 遵守；Grok **不擅自改**） |
| 子目錄 `AGENTS.md`（如 `app/experiences/AGENTS.md`） | 在該目錄工作時 | 更深層覆寫／補充（Grok **不擅自改**） |
| **本檔 `GROK.md`** | **僅 Grok** | 重啟記憶；規則快照；**所有與 Grok 新約定的附加規則** |

**優先順序（Grok）：**

1. 使用者當下明確指令  
2. 本檔 `GROK.md` 內「寫入規則」與「Grok 專用備註」等**本對話／本專案為 Grok 新加的約定**  
3. `AGENTS.md`（含子目錄更深層 `AGENTS.md`）— 既有共用規則；**本檔新增內容不應要求其他 agent 做相反的事**  
4. `.vscode/_docs/code-style` 細則（按需）

**原則：** 不碰共用 agent 檔來塞 Grok 私規；新規則只 append 本檔。

---

## 專案脈絡（重啟時快速對齊）

- Workspace 常見結構：`next/`（前端 Next.js）+ `express/`（後端）。
- 前端 agent 設定主要在 `next/AGENTS.md`、本檔、`next/.vscode/_docs/`。
- Next.js 版本／慣例可能與訓練資料不同：**以現有 codebase 為準**，勿臆測 routing／caching／RSC。
- 非 runtime 文件放 workspace `_docs/` 或 `.vscode/_docs/`；根目錄只留 runtime、部署、agent 設定。

---

## 規則快照（自 `AGENTS.md` 同步，供重啟後不必猜）

> 下列與共用 `AGENTS.md` 對齊。若兩處日後分歧，**以 `AGENTS.md` 為準**，並視需要更新本快照。

### 0. Next.js 注意

This is NOT the Next.js you know — APIs、慣例、目錄結構可能與訓練資料不同。Prefer existing codebase patterns. 只有任務需要尚未涵蓋的規則時才開 `.vscode/_docs`（不要每輪重讀）。

### 1. 動手前先想清楚

- 明確說明假設；不確定就問。
- 多種解讀就列出來，不要默默選一種。
- 有更簡單做法要說；必要時提出異議。
- 不清楚就先停、點出困惑、再問。

### 2. 簡潔優先

- 不做超出需求的功能。
- 不為只用一次的程式碼抽象。
- 不加入未被要求的「彈性」或「可設定性」。
- 不為不可能發生的情境寫錯誤處理。
- 若 200 行其實 50 行就夠，就簡化。

### 3. 手術式變更

- 不要「順便」改相鄰程式碼、註解或格式。
- 不要重構沒壞的東西。
- 符合既有風格。
- 無關死碼：提及即可，勿擅自刪除。
- 只清理由**自己變更**產生的未使用 import／變數／函式。
- 每一行 diff 都應能對應到使用者請求。

### 4. 以目標驅動執行

- 把任務轉成可驗證目標（測試／重現／前後皆過）。
- 多步驟先簡述計畫：`步驟 → 驗證方式`。

### 5. 程式與專案慣例（摘要）

- **TypeScript / React**：避免 `any`；props 用 `interface`；只有互動元件才加 `"use client"`；非 page 元件優先 named export。勿虛構型別欄位／API；勿 `as any`、`!`、`@ts-ignore` 繞過型別。
- **Next.js**：不從訓練資料臆測 routing／caching／RSC；不確定時跟現有 codebase。
- **文件位置**：非 runtime 文件放 workspace `_docs/`；根目錄只留 runtime、部署、agent 設定。
- **卡住（sandbox）**：依 `.vscode/_docs/task-problem-log/SKILL.md` 記錄，不要每輪先讀。

### 6. 按需查閱（僅該任務類型需要時讀一次）

| 任務類型 | 路徑 |
|---------|------|
| 新增／移動文件 | `.vscode/_docs/code-style/rules/project-structure.md` |
| 格式化／命名／import | `formatting.md`、`naming-and-imports.md` |
| 註解 | `comments.md` |
| TS／React 細節 | `typescript-react.md` |
| 非同步／共用邏輯 | `async-and-pure-functions.md` |
| Prisma | `prisma.md` |
| Next.js 細節 | `nextjs.md` |
| sandbox 問題紀錄 | `.vscode/_docs/task-problem-log/SKILL.md` |
| agent 工作流（英文細則） | `.vscode/_docs/code-style/rules/agent-workflow.md` |

路徑相對於 `next/`；`formatting.md` 等與 `project-structure.md` 同目錄：`.vscode/_docs/code-style/rules/`。

### 7. 有效跡象

不必要的 diff 少、不因過度複雜重寫、釐清發生在實作之前。

---

## Grok 專用備註（可往後追加 — 新規則只寫這裡）

> 使用者與 Grok 新約定的偏好、分工、限制、流程，**一律 append 本節**（或本檔其他 Grok 小節），**不要**改 `AGENTS.md`。

### 已約定

1. **新規則只進 `GROK.md`**：本專案與 Grok 對話中添加的規則，一律附加本檔；不寫入共用 `AGENTS.md`／其他 agent 檔（除非使用者明確要求改共用檔）。
2. **`AGENTS.md` 保持原樣供其他人讀**：Grok 不為「引導自己」去改共用檔；重啟後自行讀本檔。
3. **本人負責三大主題**：`blog`、`member/level`、`member/coupon`（見下方完整目錄條列）。預設工作範圍以此為主；改到範圍外路徑須使用者明確要求。
4. **新手學習註解**：三大主題前後端要有 `【新手導讀】`／import 說明／函式對應路由／關鍵語法說明；新增邏輯沿用同風格，勿灌水到組員檔案。
   - 精讀範本：`member/level/*`、`member/coupon/api.ts`、`api-payment-success-rewards.ts`、`success/page.tsx`（接線 rewards）

### Session 重開檢查清單

1. 讀本檔一次（含「寫入規則」、「Grok 專用備註」、**本人專案範圍**）。  
2. 套用本檔規則快照 + 現行共用 `AGENTS.md`（只讀、不擅自改）。  
3. 使用者若再給新約定 → **只 append 本檔**。  
4. 開始任務前確認：變更是否都對應使用者請求，且落在本人三大主題（或使用者明確授權的範圍）。

---

## 本人專案範圍（使用者負責 — 三大主題）

本 monorepo 中，使用者**最主要**負責下列三塊。Grok 協助開發時以這三主題為預設工作範圍。

路徑以 workspace 根目錄（`期末-自己/`）為準：`next/` = 前端，`express/` = 後端。

### 主題一覽

| 主題 | 前端主目錄 | 後端主路由 |
|------|------------|------------|
| **Blog** | `next/app/blog/` | `express/routes/api-blog.ts`、`api-blog-upload.ts` |
| **Member / Level** | `next/app/member/level/` | `express/routes/api-member-level.ts` |
| **Member / Coupon** | `next/app/member/coupon/` | `express/routes/api-member-coupon.ts` |

---

### 1. Blog

#### 1.1 前端 — `next/app/blog/`

```text
next/app/blog/
├── page.tsx                          # 文章列表
├── [slug]/
│   ├── page.tsx                      # 文章詳情
│   └── edit/
│       └── page.tsx                  # 編輯文章
├── new/
│   └── page.tsx                      # 新增文章
├── manage/
│   └── page.tsx                      # 管理我的文章
├── review/
│   └── page.tsx                      # 審核佇列（管理者）
├── _components/
│   ├── BlogCommentSection.tsx
│   ├── BlogMediaImage.tsx
│   ├── BlogOwnerEditLink.tsx
│   ├── BlogPostCard.tsx
│   ├── BlogPostForm.tsx
│   └── BlogRichTextContent.tsx
└── _lib/
    ├── api.ts
    ├── content-images.ts
    ├── media.ts
    └── types.ts
```

#### 1.2 後端 — Blog 相關

```text
express/routes/
├── api-blog.ts                       # /api/blog 列表、詳情、CRUD、審核等
└── api-blog-upload.ts                # 部落格圖片上傳

express/utils/
├── blog-content-images.ts
└── upload-blog-image.ts

express/public/uploads/blog/          # 上傳圖檔存放（runtime assets）

express/databases/
└── wang-blog-order-review.sql        # blog／訂單／評論相關 SQL（若任務涉及 schema）
```

#### 1.3 常一併用到的共用元件（改 blog 富文字／顯示時可能碰到）

```text
next/components/
├── CKEditorWrapper.tsx
└── RichTextContent.tsx
```

> 上述共用元件若非 blog 任務明確需要，避免「順便」大改。

---

### 2. Member / Level（會員等級）

#### 2.1 前端 — `next/app/member/level/`

```text
next/app/member/level/
├── page.tsx                          # 等級頁入口
├── level.tsx
├── levelcontent.tsx
└── api.ts                            # 前端呼叫 level API
```

#### 2.2 後端 — Level

```text
express/routes/
└── api-member-level.ts               # /api/member/level（或專案實際 mount 路徑）
```

#### 2.3 會員殼層（level 掛在 member 下；非三大主題本體，改動需克制）

```text
next/app/member/
├── layout.tsx                        # 會員區 layout
├── page.tsx                          # 會員中心首頁
└── …                                 # 其他子頁（favorites / order / profile 等）非本主題主責
```

> 預設**不要**為了 level 任務去改其他 member 子頁（`order`、`favorites`、`profile`…），除非使用者點名。

---

### 3. Member / Coupon（優惠券／點數錢包）

#### 3.1 前端 — `next/app/member/coupon/`

```text
next/app/member/coupon/
├── page.tsx                          # 優惠券頁入口
├── api.ts
├── types.ts
├── utils.ts
└── _components/
    ├── CouponList.tsx
    ├── CouponPageClient.tsx
    ├── ListPagination.tsx
    ├── RedeemCouponForm.tsx
    ├── SegmentTabs.tsx
    ├── TransactionList.tsx
    └── WalletBanner.tsx
```

#### 3.2 後端 — Coupon

```text
express/routes/
├── api-member-coupon.ts              # 優惠券／兌換／交易等 API
└── api-payment-success-rewards.ts    # POST /api/payment-success-rewards
                                      # 結帳後剩餘 + 實付回饋；核銷券；累積／等級
                                      # 詳細註解見檔案頂部【新手導讀】
```

---

### 範圍外（預設不主動修改）

下列模組**不是**本人三大主題主責；Grok **預設不改**，除非使用者當次明確要求：

- `next/app/experiences/**`、`next/app/cart/**`、`next/app/checkout/**`、`next/app/payment/**`
- `next/app/auth/**`（除非 blog／level／coupon 登入串接被明確要求）
- `express/routes/api-cart.ts`、`api-checkout.ts`、`experience.ts`、`linepay.ts`、`ecpay-test-only.ts` 等
- 其他同學負責的 member 子頁：`order`、`favorites`、`profile`、`recently-viewed`、`review`、`points` 等（若與 coupon／level 無直接依賴）

若任務被迫跨模組（例如 coupon 結帳折抵），先說明會碰到的範圍外檔案，再動手。

---

### 目錄維護

- 三大主題內**新增／移動／刪除檔案**後，請同步更新本節樹狀條列。
- 只更新 `GROK.md`，不要把分工寫進共用 `AGENTS.md`。

---

**維護：**  
- 共用 `AGENTS.md` 若被別人更新，可把變更同步進本檔「規則快照」。  
- **禁止**把「只給 Grok 的新規則」反寫進 `AGENTS.md`。
