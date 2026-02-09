[Uploading README.md…]()
# XQ Chatbot - XS 腳本語言 AI 助理

> 專業的 XQ Script (XS) 語言 AI 助理，整合 Gemini AI、Firebase Auth 與動態 Skill 載入系統

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange)](https://firebase.google.com/)

---

## ✨ 功能特色

- 🔐 **Google 帳號登入** - 使用 Firebase Authentication
- 💬 **AI 對話介面** - 整合 Gemini 1.5 Pro，支援串流回應
- 📚 **動態 Skill 載入** - 自動載入專業技能（交易/指標/警示/選股/函數腳本）
- 🎨 **現代化 UI** - 使用 Tailwind CSS，支援 Dark Mode
- 📱 **響應式設計** - 完美支援桌面與行動裝置
- 🔄 **即時串流** - Server-Sent Events 實現打字機效果

---

## 🚀 快速開始

### 前置需求

- Node.js 18+
- npm 或 yarn
- Firebase 專案（啟用 Authentication 與 Firestore）
- Gemini API Key

### 安裝步驟

1. **Clone Repository**

   ```bash
   git clone https://github.com/how0531/XQ-CoPilot.git
   cd XQ-CoPilot/web-app
   ```

2. **安裝依賴**

   ```bash
   npm install
   ```

3. **配置環境變數**

   建立 `.env.local` 檔案：

   ```bash
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **啟動開發伺服器**

   ```bash
   npm run dev
   ```

   開啟 [http://localhost:3000](http://localhost:3000)

---

## 📁 專案結構

```
web-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/chat/          # AI 對話 API Route
│   │   ├── layout.tsx         # Root Layout
│   │   └── page.tsx           # 主頁面
│   ├── components/            # React 元件
│   │   ├── auth/              # 身份驗證元件
│   │   └── chat/              # 對話介面元件
│   ├── lib/                   # 核心邏輯
│   │   ├── firebase.ts        # Firebase 配置
│   │   ├── gemini.ts          # Gemini API
│   │   └── skillLoader.ts     # Skill 載入器
│   ├── contexts/              # React Contexts
│   │   └── AuthContext.tsx    # 身份驗證狀態
│   └── types/                 # TypeScript 類型
├── public/                    # 靜態資源
└── .env.local                 # 環境變數（不提交至 Git）
```

---

## 🛠️ 技術棧

### 前端框架

- **Next.js 16** - React 框架（App Router）
- **TypeScript** - 型別安全
- **Tailwind CSS 4** - 現代化 UI 框架

### 後端服務

- **Firebase Auth** - 使用者身份驗證
- **Firestore** - NoSQL 資料庫
- **Gemini 1.5 Pro** - Google AI 模型

### 核心功能

- **Server-Sent Events** - 即時串流回應
- **gray-matter** - YAML Frontmatter 解析
- **Dynamic Skill Loading** - 自動載入 Skill Markdown

---

## 📚 Skill 系統

本專案支援動態載入以下專業技能：

- 🔄 **交易腳本專家** - 部位管理、進出場邏輯、當沖防呆
- 📊 **指標腳本專家** - 繪圖設定、plot 使用、跨頻率數據
- 🔔 **警示腳本專家** - Tick 數據、盤中欄位、retMSG 訊息
- 📈 **選股腳本專家** - rank 排行、OutputField、跨商品篩選
- ⚙️ **函數腳本專家** - 參數定義、NumericRef 回傳、函數封裝

---

## 🔒 Firebase Security Rules

Firestore 安全規則範例（需在 Firebase Console 設定）：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 🚢 部署

### Vercel（推薦）

1. 連結 GitHub Repository 至 Vercel
2. 設定環境變數（與 `.env.local` 相同）
3. 自動部署

```bash
npm run build    # 測試 Production Build
```

---

## 📝 開發指南

### 新增 Skill

1. 在 `.agent/skills/` 建立新目錄
2. 建立 `SKILL.md`，包含 YAML Frontmatter：
   ```yaml
   ---
   name: 新技能名稱
   description: 技能描述
   ---
   ```
3. 系統將自動載入

### 自訂 System Prompt

編輯 `src/lib/gemini.ts` 的 `buildSystemPrompt` 函數

---

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

---

## 📄 授權

MIT License

---

## 👨‍💻 作者

**how0531**

- GitHub: [@how0531](https://github.com/how0531)
- Repository: [XQ-CoPilot](https://github.com/how0531/XQ-CoPilot)

---

## 🙏 致謝

- [Next.js](https://nextjs.org/) - React 框架
- [Firebase](https://firebase.google.com/) - 後端服務
- [Google Gemini](https://ai.google.dev/) - AI 模型
- [Tailwind CSS](https://tailwindcss.com/) - UI 框架
