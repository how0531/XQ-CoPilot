# XQ Chatbot (XS 交易語法專家)

這是一個專為 XQ 選股、警示、指標與交易腳本開發者設計的 AI 助手。整合了完整的 XS 官方文件與腳本庫，提供高品質的代碼產出與技術諮詢。

## 🚀 核心功能

- **XS 代碼生成**：根據需求自動撰寫完整的交易策略、選股腳本或指標。
- **文件查詢**：即時存取最新 XS 函數字典與語法教科書。
- **自動同步**：整合外部腳本庫，自動保持知識庫為最新狀態。
- **現代介面**：基於 Next.js 與 Tailwind CSS 打造的高級 UI/UX 體驗。

## 🛠️ 技術棧

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **AI Engine**: Google Gemini API (2.5 Flash)
- **Backend/Auth**: Firebase & Firestore
- **Version Control**: GitHub CI/CD Ready

## 📂 目錄結構

- `說明/`: 核心知識庫（包含整理過的函數字典、語法教科書等）。
- `web-app/`: Web 應用程式源代碼。
- `scripts/`: 動態同步與維護腳本。

## 🏗️ 如何開始

1. 進入 `web-app` 目錄：`cd web-app`
2. 安裝依賴：`npm install`
3. 建立 `.env.local` 並填入必要的 API Key (Firebase & Gemini)。
4. 啟動開發伺服器：`npm run dev`

---

**版本紀錄：**

- **V1.2.0**: 文件整理優化、加入 README 與自動同步機制。
