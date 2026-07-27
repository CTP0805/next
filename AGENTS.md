<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Prefer existing codebase patterns over generic Next.js examples. Only open `.vscode/_docs` when a task needs a rule not already covered below (do **not** re-read these files every turn).
<!-- END:nextjs-agent-rules -->

# Agent 協作準則（已內嵌，勿每輪重讀）

以下內容已完整寫入本檔，會由 Grok 自動注入。**套用即可，不要為了「經過 AGENTS.md」而重複 read 本檔或 `_docs`。** 僅在規範真的有改、或任務需要下方「按需查閱」細則時再讀檔。

## 1. 動手前先想清楚

- 明確說明假設；不確定就問。
- 多種解讀就列出來，不要默默選一種。
- 有更簡單做法要說；必要時提出異議。
- 不清楚就先停、點出困惑、再問。

## 2. 簡潔優先

- 不做超出需求的功能。
- 不為只用一次的程式碼抽象。
- 不加入未被要求的「彈性」或「可設定性」。
- 不為不可能發生的情境寫錯誤處理。
- 若 200 行其實 50 行就夠，就簡化。

## 3. 手術式變更

- 不要「順便」改相鄰程式碼、註解或格式。
- 不要重構沒壞的東西。
- 符合既有風格。
- 無關死碼：提及即可，勿擅自刪除。
- 只清理由**自己變更**產生的未使用 import／變數／函式。
- 每一行 diff 都應能對應到使用者請求。

## 4. 以目標驅動執行

- 把任務轉成可驗證目標（測試／重現／前後皆過）。
- 多步驟先簡述計畫：`步驟 → 驗證方式`。

## 5. 程式與專案慣例（摘要）

- **TypeScript / React**：避免 `any`；props 用 `interface`；只有互動元件才加 `"use client"`；非 page 元件優先 named export。勿虛構型別欄位／API；勿 `as any`、`!`、`@ts-ignore` 繞過型別。
- **Next.js**：不從訓練資料臆測 routing／caching／RSC；不確定時跟現有 codebase。
- **文件位置**：非 runtime 文件放 workspace `_docs/`；根目錄只留 runtime、部署、agent 設定。
- **卡住（sandbox）**：依 `.vscode/_docs/task-problem-log/SKILL.md` 記錄，不要每輪先讀。

## 6. 優先順序

1. 使用者當下明確指令  
2. 本檔 `AGENTS.md`（含子目錄更深層 `AGENTS.md` 覆寫）  
3. `.vscode/_docs/code-style` 細則  

## 7. 按需查閱（僅該任務類型需要時讀一次）

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

---

**有效跡象：** 不必要的 diff 少、不因過度複雜重寫、釐清發生在實作之前。

<!-- BEGIN:codex-mao-rules -->
## Codex 專用規則

當執行者是 OpenAI Codex 時：

1. 新 session／重新開啟專案時，必須完整讀取同目錄的 `mao.md` 一次；同一 session 內保留於工作記憶，不要每項工作重讀。
2. 分析、修改、測試及交付都必須遵守 `mao.md`。
3. 完成工作前，再次核對結果是否符合 `mao.md`。
4. 其他 agent 忽略本節及 `mao.md`。
<!-- END:codex-mao-rules -->
