---
name: 警示腳本專家
description: 專門處理 XS 警示腳本的撰寫，包含 Tick 數據處理、盤中即時欄位、retMSG 警示訊息等
---

# 警示腳本專家 Skill

## 🎯 專長領域

專門處理 XS 警示腳本（Alert Script）的撰寫，確保符合策略雷達的執行規範與即時監控邏輯。

## 📋 核心規範

### 1️⃣ 基本警示語法

```delphi
// 觸發警示
if (觸發條件) then begin
    ret = 1;
    retMSG = "警示訊息內容";  // 必須設定警示名稱
end;
```

**⚠️ 重要：**

- 警示腳本**無法使用** `OutputField`
- 必須使用 `retMSG` 設定警示名稱以利推播

### 2️⃣ 盤中即時資料欄位

警示腳本支援分鐘頻率的即時欄位，可即時監控盤中變化

```delphi
// 取得 1 分鐘頻率數值
value1 = GetField("內盤量", "1");
value2 = GetField("外盤量", "1");
value3 = GetField("均價");  // 不指定頻率則依執行頻率

// 常用即時欄位
value4 = GetField("買進特大單量", "1");
value5 = GetField("賣出特大單量", "1");
value6 = GetField("量比");
value7 = GetField("成交金額", "1");
```

**支援的即時欄位：**

- 成交金額、均價
- 內盤量、外盤量、上漲量、下跌量
- 估計量、量比
- 總成交次數、內盤成交次數、外盤成交次數
- 買進/賣出特大單量、大單量、中單量、小單量
- 買進/賣出特大單金額、大單金額、中單金額、小單金額
- 累計委買、累計委賣、基差、波動率等

### 3️⃣ Tick 資料處理

#### 基本 Tick 欄位

```delphi
value1 = GetField("Date", "Tick");        // 成交日期
value2 = GetField("Time", "Tick");        // 成交時間
value3 = GetField("Close", "Tick");       // 成交價格
value4 = GetField("Volume", "Tick");      // 成交單量
value5 = GetField("BidAskFlag", "Tick");  // 內外盤標記（1=外盤, -1=內盤, 0=中立）
value6 = GetField("BidPrice", "Tick");    // 買進價格
value7 = GetField("AskPrice", "Tick");    // 賣出價格
value8 = GetField("SeqNo", "Tick");       // 資料編號（每日從 1 開始）
```

#### 讀取 Tick 序列

```delphi
// 讀取當前 Tick
value1 = GetField("Close", "Tick");

// 讀取前一筆 Tick
value2 = GetField("Close", "Tick")[1];

// 讀取前兩筆 Tick
value3 = GetField("Close", "Tick")[2];
```

#### 使用 ReadTicks 函數（推薦）

ReadTicks 會自動合併連續成交序列，簡化邏輯

```delphi
input: filterMode(1, "篩選方式", inputkind:=dict(["買盤",1], ["賣盤",-1]));
input: filterVolume(100, "大單門檻");

var: intrabarpersist readtick_cookie(0);   // ReadTicks 內部使用
array: tick_array[100, 11](0);              // 儲存 Tick 資料的二維陣列
var: row_count(0), idx(0);

// 讀取 Tick 資料
row_count = ReadTicks(tick_array, readtick_cookie);

for idx = 1 to row_count begin
    // tick_array[idx, 5] = 內外盤標記
    // tick_array[idx, 10] = 總成交量（連續成交序列會自動合併）
    if tick_array[idx, 5] = filterMode and tick_array[idx, 10] >= filterVolume then begin
        ret = 1;
        retMSG = "觸發大單";
    end;
end;
```

**ReadTicks 回傳的陣列結構：**
| Column | 內容 |
|--------|------|
| 1 | 日期 |
| 2 | 時間 |
| 3 | 成交價 |
| 4 | 成交量 |
| 5 | 內外盤註記（1=外盤, -1=內盤） |
| 6 | Tick 編號（SeqNo） |
| 7 | 連續成交序列總筆數 |
| 8 | 連續成交序列第一筆位置 |
| 9 | 連續成交序列最後一筆位置 |
| 10 | 總成交量（連續序列會合併） |
| 11 | 總成交金額（元） |

### 4️⃣ 連續成交序列（TickGroup）

```delphi
value1 = GetField("TickGroup", "Tick");
```

**TickGroup 回傳值：**

- `-1`: 不是逐筆撮合（如開盤、收盤）
- `0`: 逐筆撮合，只產生一筆成交
- `1`: 連續成交序列的第一筆
- `2`: 連續成交序列的中間筆
- `3`: 連續成交序列的最後一筆

**應用：**
判斷大單是否由單一委託產生多筆成交

### 5️⃣ 進階：歷史時間區間分析 (GetBarOffset)

**用途：** 鎖定過去特定時間區間（例如：昨日 12:00 ~ 收盤），計算該區間的高低點或成交量，並與今日即時數據比較。

**核心邏輯：**

1. 找出區間起始與結束的 K 棒位置 (Offset)。
2. 計算區間長度 (Length)。
3. 使用 `SimpleHighest` 或 `SimpleLowest` 配合 `[Offset]` 引用。

**範例：今日開盤 < 昨日午盤(12:00~13:29) 最高價**

```delphi
// 設定 K 棒位置
variable: idx_start(0), idx_end(0), interval_len(0);
variable: yst_high(0);

if Date <> Date[1] then begin
    // 取得昨日(Date[1]) 特定時間的 Offset
    // 12:00:00 (較早，Offset 較大)
    idx_start = GetBarOffset(Date[1], 120000);
    // 13:29:00 (較晚，Offset 較小)
    idx_end = GetBarOffset(Date[1], 132900);

    // 計算區間長度
    interval_len = idx_start - idx_end;

    // 確保區間有效
    if idx_end > 0 and interval_len > 0 then begin
        // 計算該區間最高價
        // SimpleHighest(序列, 期數)[位移]
        // 從 idx_end (昨日收盤前) 開始，往回算 interval_len 根
        yst_high = SimpleHighest(High, interval_len)[idx_end];
    end;
end;

// 觸發條件
if yst_high > 0 and Open < yst_high then begin
    ret = 1;
    retMSG = "開盤低於昨日午後高點";
end;
```

**⚠️ 注意事項：**

- `GetBarOffset` 回傳的是「距離現在」的根數，所以時間越早，數值越大。
- 引用序列時，位移值應使用「較晚的時間點 (idx_end)」。

## 🔧 常見應用模板

### 📊 大單監控（使用報價欄位）

```delphi
input: filterMode(1, "篩選方式", inputkind:=dict(["買盤",1], ["賣盤",-1]));
input: filterVolume(100, "大單門檻");

value1 = GetField("Time", "Tick");       // 時間
value2 = GetField("Close", "Tick");      // 價格
value3 = GetField("Volume", "Tick");     // 單量
value4 = GetField("BidAskFlag", "Tick"); // 外盤=1, 內盤=-1

if value4 = filterMode and value3 >= filterVolume then begin
    ret = 1;
    retMSG = text("大單：", numtostr(value3, 0), "張");
end;
```

### 🔔 盤中漲幅排行

```delphi
input: _S(group, "排行股票");
array: rankRT[2000, 2](-9999);

SetTotalBar(10);
value1 = GroupSize(_S);

// 將清單的商品代碼與漲跌幅放入陣列
for value2 = 1 to value1 begin
    value3 = 100 * (GetSymbolField(_S[value2], "Close", default = 0)
        - GetSymbolField(_S[value2], "參考價", "D", default = 0))
        / GetSymbolField(_S[value2], "參考價", "D", default = 1);
    rankRT[value2, 1] = strtonum(leftStr(_S[value2], 4));
    rankRT[value2, 2] = value3;
end;

// 將陣列依漲跌幅排序
Array_Sort2d(rankRT, 1, value1, 2, false);

print("========== 漲跌幅前10 ==========");
print("日期時間：", numtostr(datetime, 0));

for value2 = 1 to 10 begin
    print(text("排名", numtostr(value2, 0), "商品: "),
        text(numtostr(rankRT[value2, 1], 0), ".TW"),
        " / 漲跌幅: ", rankRT[value2, 2]);
end;

print("==============================");

if symbol = text(numtostr(rankRT[1, 1], 0), ".TW") then begin
    ret = 1;
    retMSG = "進入漲幅榜首";
end;
```

### ⚡ 均價突破監控

```delphi
// 當分鐘收盤價突破當日均價時觸發
value1 = GetField("均價");

if close cross above value1 then begin
    ret = 1;
    retMSG = "價格突破均價";
end;
```

### 📈 量比異常監控

```delphi
input: _Threshold(2.0, "量比門檻");

value1 = GetField("量比");

if value1 >= _Threshold then begin
    ret = 1;
    retMSG = text("量比達", numtostr(value1, 2), "倍");
end;
```

### 🔍 大戶連續買超

```delphi
input: _Days(3, "連續天數");

var: intrabarpersist _Count(0);

// 計算大單買超
value801 = GetField("買進特大單量", "1") + GetField("買進大單量", "1");
value802 = GetField("賣出特大單量", "1") + GetField("賣出大單量", "1");
value888 = value801 - value802;

// 每日歸零
if Date <> Date[1] then _Count = 0;

// 如果今日大單買超，計數器加 1
if value888 > 0 then _Count += 1;

// 連續 N 分鐘大單買超則觸發
if _Count >= _Days then begin
    ret = 1;
    retMSG = text("連續", numtostr(_Count, 0), "分鐘大單買超");
end;
```

## 🚨 常見錯誤與修正

### ❌ 錯誤 1：使用 OutputField

```delphi
// ❌ 錯誤：警示腳本不支援
outputField1(value1, "數值");
```

**修正：**

```delphi
// ✅ 正確：使用 retMSG
if (條件) then begin
    ret = 1;
    retMSG = text("數值：", numtostr(value1, 2));
end;
```

### ❌ 錯誤 2：報價欄位 vs Tick 欄位混淆

```delphi
// ⚠️ 風險：q_Last 會隨洗價更新，可能與 K 棒不一致
value1 = q_Last;  // 報價欄位

// ✅ 建議：使用 Tick 欄位保證與洗價一致
value1 = GetField("Close", "Tick");
```

### ❌ 錯誤 3：未設定 retMSG

```delphi
// ❌ 錯誤：無法推播警示名稱
if (條件) then ret = 1;
```

**修正：**

```delphi
// ✅ 正確：設定 retMSG
if (條件) then begin
    ret = 1;
    retMSG = "警示內容";
end;
```

## 💡 xs-helper 最佳實踐

### 警示腳本專屬注意

- **禁止使用 OutputField**：警示腳本不支援 OutputField
- **必須使用 retMSG**：設定警示訊息以利推播
- **Tick 數據處理**：使用 ReadTicks 自動合併連續成交
- **分鐘頻率支援**：支援分鐘線 GetField 即時監控

## 📚 官方範例索引

### XScript Preset 警示範例

**資源位置：** `references/xscript_preset/警示/`

#### 🚨 !語法範例

- Tick 數據處理範例
- retMSG 警示訊息設定
- 即時監控邏輯

#### 📋 17 個專題類別

- **籌碼監控**：大單追蹤、法人買超等
- **市場常用語**：常用警示條件
- **出場常用警示**：停損、停利警示
- **技術分析**：KD、MACD 警示
- **當沖交易型**：當沖監控策略
- **短線操作型**：短線警示條件
- **波段操作型**：中長線警示

### 📚 參考資源

- **官方範例**: [警示腳本範例](../../references/examples_index.md#警示腳本)
- **XS 語法手冊**: [XS 語法手冊](https://xshelp.xq.com.tw/XSHelp/)
- **報價欄位**: `說明/報價.md` (GetQuote 欄位速查)
- **內建函數**: `說明/內建.md` (RetMsg, GetField 完整說明)
- **系統函數**: `說明/系統.md` (邏輯判斷函數)
- [Tick 欄位應用](https://www.xq.com.tw/lesson/xspractice/tick%E6%AC%84%E4%BD%8D%E7%9A%84%E6%87%89%E7%94%A8/)
- [盤中即時欄位](https://www.xq.com.tw/lesson/xspractice/%E7%9B%A4%E4%B8%AD%E5%8D%B3%E6%99%82%E8%B3%87%E6%96%99%E6%AC%84%E4%BD%8D%E7%9A%84%E6%87%89%E7%94%A8/)
- [連續成交序列](https://www.xq.com.tw/lesson/xspractice/%E5%8F%B0%E8%82%A1%E9%80%90%E7%AD%86%E6%92%AE%E5%90%88%E7%9A%84%E7%A9%BF%E5%83%B9tick/)

### 本地資源

- **官方範例集：** `references/xscript_preset/警示/`
- **17 個專題類別**
- **Tick 數據處理範例**

### 系統內建警示範例

可參考策略雷達內建策略：

- 價量異常 → 量比異常
- 大單監控 → 特大單買超
- 技術指標 → 均線突破

## ✅ 撰寫檢查清單

- [ ] 觸發條件設定 `ret = 1`
- [ ] 設定 `retMSG` 警示訊息
- [ ] 未使用 `OutputField`
- [ ] 使用分鐘頻率執行時，確認 GetField 頻率參數正確
- [ ] 使用 Tick 資料時，確認是否需要 ReadTicks
- [ ] 使用 `intrabarpersist` 宣告狀態變數（若需累計）
- [ ] input 參數都有 `_` 前綴且有中文描述
- [ ] 關鍵邏輯有繁體中文註解
- [ ] 已設定 SetBarBack 與 SetTotalBar 確保數據足夠
