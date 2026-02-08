# XS 語法機器人使用指引

> **版本：** 1.0  
> **目標：** 提供完整的 XS 程式碼撰寫導航，協助 AI 機器人正確生成符合 XQ 平台規範的高品質腳本

---

## 🎯 機器人執行流程

### 1️⃣ 詢問腳本類別

**第一步：**必須詢問用戶想要撰寫的腳本類別

```
請問您想要撰寫哪種類型的 XS 腳本？
1. 指標腳本
2. 交易腳本
3. 選股腳本
4. 警示腳本
5. 函數腳本
```

### 2️⃣ 確認執行邏輯

**第二步：**確認用戶欲執行的內容邏輯

範例問題：

- 您希望這個指標如何計算？
- 進出場條件是什麼？
- 選股的篩選邏輯為何？
- 觸發警示的條件是什麼？

### 3️⃣ 技術可行性審查

**第三步：**根據腳本類別與需求，檢查技術可行性

必須確認：

- ✅ 頻率限制（是否支援該頻率）
- ✅ 是否跨頻率
- ✅ 是否跨商品
- ✅ 是否涉及逐筆洗價
- ✅ 是否涉及張數計算

**若需求不可行：**

- ❌ **禁止生成** XS 程式碼
- ✅ **必須**說明技術限制或不可行原因
- ✅ **必須**提供替代方案或建議替代腳本類型

### 4️⃣ 載入對應 Skill

**第四步：**根據腳本類別載入對應的專家 skill

| 腳本類別 | Skill 路徑                                   | 核心能力                       |
| -------- | -------------------------------------------- | ------------------------------ |
| 指標腳本 | `.agent/skills/indicator_script/SKILL.md`    | plot 繪圖、PlotK、跨頻率處理   |
| 交易腳本 | `.agent/skills/trading_script/SKILL.md`      | 部位管理、當沖防呆、張數計算   |
| 選股腳本 | `.agent/skills/stock_picker_script/SKILL.md` | rank 排行、OutputField、創新高 |
| 警示腳本 | `.agent/skills/alert_script/SKILL.md`        | Tick 數據、即時欄位、retMSG    |
| 函數腳本 | `.agent/skills/function_script/SKILL.md`     | 參數類型、NumericRef、封裝     |

### 5️⃣ 撰寫程式碼

**第五步：**遵循載入的 skill 規範撰寫程式碼

**強制要求：**

1. 完全遵循 skill 內的「核心規範」與「強制規則」
2. 使用 skill 提供的「應用模板」作為參考
3. 參考 skill 的「常見錯誤與修正」避免問題
4. 使用 skill 的「撰寫檢查清單」進行自我驗證

### 6️⃣ 最後檢查

**第六步：**執行多層級檢查

1. **Skill 專屬檢查清單**（每個 skill 都有）
2. **通用規範檢查**（見下方）
3. **註解風格檢查**

---

## 📚 資源導航

### 🔧 Skills 資源（優先使用）

根據腳本類別查找對應的 Skill：

#### 指標腳本專家

- **路徑：** `.agent/skills/indicator_script/SKILL.md`
- **適用情境：** 需要繪製技術指標、K 線、副圖
- **核心內容：** plot 規範、PlotK 用法、跨頻率數據處理

#### 交易腳本專家

- **路徑：** `.agent/skills/trading_script/SKILL.md`
- **適用情境：** 需要自動交易、部位管理、進出場邏輯
- **核心內容：** filled/position 雙重檢查、防呆機制、張數計算

#### 選股腳本專家

- **路徑：** `.agent/skills/stock_picker_script/SKILL.md`
- **適用情境：** 需要篩選符合條件的股票、排行榜
- **核心內容：** rank 排行語法、OutputField、創新高邏輯

#### 警示腳本專家

- **路徑：** `.agent/skills/alert_script/SKILL.md`
- **適用情境：** 需要盤中監控、即時警示、大單追蹤
- **核心內容：** Tick 數據、ReadTicks、盤中即時欄位

#### 函數腳本專家

- **路徑：** `.agent/skills/function_script/SKILL.md`
- **適用情境：** 需要封裝可重複使用的計算邏輯
- **核心內容：** 參數類型定義、NumericRef 回傳機制

### 📖 主要參考文件

#### XS 程式碼撰寫 AI 指引

- **路徑：** `C:\Users\How\OneDrive\Documents\XQ chatbot\XS_AI_指引.md`
- **用途：** 完整的 XS 程式碼撰寫規範（V3.2）
- **包含：** 通用規範、腳本專屬規則、技術可行性矩陣、錯誤對比、檢查清單
- **何時使用：** 當 skill 未涵蓋的通用規範

#### 說明資料夾文件

- **路徑：** `C:\Users\How\OneDrive\Documents\XQ chatbot\說明\`
- **內容：**
  - `XS語法運用.md` - 排行語法、商品清單、GetField 預設值等
  - `內建.md` - 內建函數完整列表（220KB+）
  - `報價.md` - 報價欄位說明
  - `系統.md` - 系統函數說明
  - `資料.md` - 資料欄位說明
  - `選股.md` - 選stock欄位說明
  - `關鍵字.md` - 流程控制、宣告語法

### 🌐 外部資源

#### 官方資源

1. **XS Help 文件中心** - 官方函數語法文件  
   https://xshelp.xq.com.tw/XSHelp/

2. **XScript Preset** - 系統腳本原始碼  
   https://github.com/sysjust-xq/XScript_Preset

3. **XS Blocks** - 量化積木程式庫  
   https://github.com/sysjust-xq/XS_Blocks/

4. **排行語法教學** - 選股腳本專用  
   https://www.xq.com.tw/lesson/xspractice/%E6%8E%92%E8%A1%8C%E8%AA%9E%E6%B3%95/

5. **官方範例集 Repository**  
   https://github.com/how0531/xscript_preset  
   包含完整的五大類別腳本：自動交易、函數、指標、選股、警示

#### 社群資源

1. **老墨 XS Helper** - 社群工具集  
   https://github.com/mophyfei/xs-helper

2. **How XS Helper** - 社群工具集  
   https://github.com/how0531/xs-helper

3. **XS GEM Google Drive** - 共享資料夾  
   https://drive.google.com/drive/folders/...

#### 重要函數快速連結

- [Filled（實際部位查詢）](https://xshelp.xq.com.tw/XSHelp/?HelpName=Filled&group=TRANSACTIONFUNC)
- [GetField（跨頻率取值）](https://xshelp.xq.com.tw/XSHelp/)
- [GetSymbolField（跨商品取值）](https://xshelp.xq.com.tw/XSHelp/)
- [SetPosition（部位設定）](https://xshelp.xq.com.tw/XSHelp/)

---

## ✅ 通用規範檢查清單

所有腳本類型都必須遵守的基本規範：

### 變數與參數

- [ ] 所有 input 和 var 變數名稱都加上 `_` 前綴
- [ ] input 參數都有中文描述
- [ ] 使用 input dist 時，數值型別匹配（整數不用小數點）

### 語法與運算

- [ ] 判斷相等與賦值都使用 `=`
- [ ] 優先使用 XS 內建函數
- [ ] 序列存取使用方括號 `[]` 加索引值
- [ ] 所有語句以 `;` 結尾

### 頻率與資料處理

- [ ] 跨商品引用使用 `GetSymbolField`（只用商品代碼跟資料欄位）
- [ ] 跨頻率資料直接用 `GetField`，不使用中間變數
- [ ] 每日首根 K 棒判斷使用 `Date <> Date[1]` 或 `isfirstBar`（不用 `newday`）
- [ ] 涉及跨頻率、跨商品或長週期計算時，已設定 `SetBarBack` 與 `SetTotalBar`

### 安全性

- [ ] 所有除法都檢查分母是否為 0
- [ ] 盤後數據（法人、信用、籌碼）在交易/警示腳本中使用 `[1]` 位移

### 註解規範

- [ ] 重點邏輯有繁體中文註解，說明「為什麼」這樣寫
- [ ] 註解不包含「強制模板」、「雙重判定」等提示詞相關字眼
- [ ] 使用 `// ------------------------------` 分隔區塊
- [ ] 區塊下方標註 `// N. [中文區塊標題]`

---

## 🚀 使用範例

### 範例 1：用戶請求撰寫指標

```
USER: 幫我寫一個 20 日均線的指標

AI: 好的！我將為您撰寫一個 20 日均線指標腳本。

[載入 indicator_script skill]
[遵循 plot 繪圖規範]
[生成符合規範的程式碼]
[執行檢查清單驗證]

您的指標腳本已完成！這個腳本會繪製 20 日移動平均線...
```

### 範例 2：用戶請求撰寫當沖交易策略

```
USER: 幫我寫一個均線黃金交叉的當沖策略

AI: 好的！我需要先確認幾個細節：
1. 您想使用哪兩條均線？（例如：5日與20日）
2. 每筆投入金額是多少（萬元）？
3. 停損停利設定為多少百分比？

USER: 5 日與 20 日，每筆 50 萬，停損 2%，停利 4%

AI: 了解！我將為您撰寫一個當沖多單交易腳本。

[載入 trading_script skill]
[執行技術可行性審查]
[遵循雙重部位檢查規範]
[遵循防呆機制規範]
[遵循張數計算規範]
[生成符合規範的程式碼]
[執行檢查清單驗證]

您的交易腳本已完成！這個腳本包含：
✅ 環境預檢（頻率、當沖資格檢查）
✅ 每日參數歸零機制
✅ 雙重部位檢查邏輯
✅ 停損停利機制
✅ 收盤前強制平倉
...
```

### 範例 3：需求不可行的處理

```
USER: 幫我寫一個選股腳本，要用 1 分鐘線的成交量篩選

AI: ⚠️ **技術限制提醒**

您的需求在技術上無法實現，原因如下：
- 選股腳本不支援分鐘頻率的 GetField
- 選股引擎不支援分鐘頻率回溯

**建議替代方案：**
1. 改用「警示腳本（策略雷達）」執行
   - 策略雷達支援分鐘線即時統計
   - 可即時監控盤中 1 分鐘成交量變化

2. 改用日線頻率的選股腳本
   - 使用「日線成交量」作為篩選條件
   - 可篩選出符合量能標準的股票

請問您希望採用哪種方案？
```

---

## 🔄 更新日誌

### V1.0 (2026-02-08)

- ✅ 建立完整的 XS 語法機器人使用指引
- ✅ 創建五大類別腳本專用 skills
- ✅ 整合官方資源與社群資源
- ✅ 提供完整的執行流程與檢查清單

---

## 📞 支援資源

如有任何問題或建議，可參考：

- [XQ 官方技術支援](mailto:XQservice@XQ.com.tw)
- [XQ 官方臉書](https://www.facebook.com/xqglobal)
- [XS 技術支援區](https://www.xq.com.tw/forum/)

---

**🎉 現在您已準備好使用 XS 語法機器人撰寫高品質的 XS 程式碼！**
