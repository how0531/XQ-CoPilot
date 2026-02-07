# Firebase Security Rules

## Firestore Rules

請在 Firebase Console > Firestore Database > Rules 設定以下規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 對話記錄規則
    match /conversations/{conversationId} {
      // 只允許已登入使用者讀寫自己的對話
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;

      // 允許已登入使用者建立對話
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Firebase Authentication Rules

### Google 登入設定

1. 前往 Firebase Console > Authentication > Sign-in method
2. 啟用 **Google** 登入提供者
3. 設定授權網域：
   - `localhost`（開發環境）
   - 您的 Vercel 部署網址（例如：`your-app.vercel.app`）

### 授權網域設定

在 Firebase Console > Authentication > Settings > Authorized domains 新增：

- `localhost` - 本地開發
- `your-app.vercel.app` - Vercel 部署網址（部署後新增）

---

## 如何設定

### 步驟 1：開啟 Firebase Console

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的專案

### 步驟 2：設定 Firestore Rules

1. 左側選單 > **Firestore Database**
2. 點選上方 **Rules** 標籤
3. 複製上方的 Firestore Rules
4. 點選 **發布（Publish）**

### 步驟 3：設定 Authentication

1. 左側選單 > **Authentication**
2. 點選 **Sign-in method** 標籤
3. 啟用 **Google** 提供者
4. 儲存設定

---

## 安全性說明

### Firestore Rules 說明

- ✅ 使用者只能讀寫自己的對話記錄
- ✅ 必須登入才能存取資料
- ✅ 防止跨使用者資料洩漏
- ✅ 新建對話時驗證 userId

### 最佳實踐

1. **絕不在前端暴露敏感資料**
2. **使用環境變數管理 API Keys**
3. **定期檢查 Firebase Usage**（避免超額）
4. **啟用 App Check**（進階安全性，可選）

---

## 測試 Rules

Firebase Console 提供 Rules 模擬器：

1. Firestore Database > Rules
2. 點選 **Rules Playground**
3. 測試不同情境（已登入/未登入、不同 userId）

---

## 常見問題

### Q: 為什麼收到 "permission-denied" 錯誤？

A: 檢查：

1. 使用者是否已登入（`request.auth != null`）
2. userId 是否正確（`resource.data.userId == request.auth.uid`）
3. Firestore Rules 是否已發布

### Q: 如何新增更多欄位驗證？

A: 在 Rules 中加入資料驗證，例如：

```javascript
allow create: if request.auth != null
  && request.resource.data.keys().hasAll(['userId', 'title', 'messages'])
  && request.resource.data.userId == request.auth.uid;
```

---

## 相關連結

- [Firebase Security Rules 文件](https://firebase.google.com/docs/firestore/security/get-started)
- [Authentication 文件](https://firebase.google.com/docs/auth)
