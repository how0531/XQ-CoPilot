---
name: 交易腳本專家
description: 專門處理 XS 交易腳本的撰寫，包含部位管理、進出場邏輯、當沖防呆機制、狀態控制等
---

# 交易腳本專家 Skill

## 🎯 專長領域

專門處理 XS 交易腳本（Trading Script）的撰寫，確保符合 XQ 自動交易系統的部位管理規範、風險控制與防呆機制。

## 🚨 核心強制規則

### ⚡ 雙重部位同步檢查（CRITICAL）

**核心邏輯：**

- `filled` = 帳戶內目前執行商品的「實際部位」(Actual Position)
- `position` = 自動交易系統內目前執行商品的「預期部位」(Expected/Strategy Position)

**強制規則：**

> 所有部位異動邏輯必須同時判定 `filled` 與 `position` 的一致性

**為什麼需要雙重檢查？**
避免委託單在「送出但尚未成交」期間重複觸發訊號（`filled=0` 但 `position<>0`）

**同步判斷式範例：**

```delphi
// 🚨 強制規則：必須同時檢查 filled 與 position
if filled <>0 and position <>0 and filled = position then begin
    // 執行出場或調整邏輯
end;
```

### 📋 狀態檢查邏輯模板

#### 1️⃣ 進場前檢查

```delphi
// 確保空手且無未成交委託
if filled = 0 and position = 0 and (進場條件) then begin
    SetPosition(...);
end;
```

#### 2️⃣ 多單出場前檢查

```delphi
// 確保實際持有多單且與策略一致
if filled > 0 and position > 0 and filled = position and (出場條件) then begin
    SetPosition(0);
end;
```

#### 3️⃣ 空單出場前檢查

```delphi
// 確保實際持有空單且與策略一致
if filled < 0 and position < 0 and filled = position and (出場條件) then begin
    SetPosition(0);
end;
```

## 🔄 期貨 vs 股票交易差異

### 商品類型判斷

**Input 參數：**

```delphi
input: _Market(1, "商品類型", InputKind:=Dict(["股票", 1], ["期貨", 2]));
```

### 關鍵差異對照表

| 項目           | 期貨                             | 股票                           |
| -------------- | -------------------------------- | ------------------------------ |
| **交易單位**   | `口`                             | `張`                           |
| **部位判斷**   | `position = 0` / `position <> 0` | `Filled` + `Position` 雙重檢查 |
| **資格檢查**   | 無需檢查                         | 需檢查「買賣現沖」等           |
| **委託價格**   | `market` (市價)                  | `close`, `open`, 或讓價        |
| **未平倉成本** | `filledAvgPrice`                 | `FilledAvgPrice`               |
| **強制平倉**   | 無特殊限制                       | 當沖需收盤前平倉               |

### 期貨簡化範例

```delphi
input: _GoalPrice(30, "上漲點數"),
       _StopLost(50, "跌破點數");

var: InCondition(false), OutCondition(false);

// 僅支援分鐘
if barfreq <> "Min" then raiseRunTimeError("僅支援分鐘");

// 進場條件
InCondition = close - GetField("開盤價", "D") >= _GoalPrice;

// 出場條件
OutCondition = filledAvgPrice - close >= _StopLost;

// 期貨不需要 Filled=Position 雙重檢查
if position = 0 and InCondition then setposition(1, market);
if position <> 0 and OutCondition then setposition(0, market);
```

**注意：**

- 期貨無需 `Filled = Position` 同步檢查，只需 `position` 判斷
- 期貨通常使用 `market` 市價下單
- 期貨不需要現沖資格檢查

---

## 📋 股票交易專屬規範

### 部位狀態檢查模板

#### 1️⃣ 進場前檢查

```delphi
// 確保空手且無未成交委託
if filled = 0 and position = 0 and (進場條件) then begin
    SetPosition(...);
end;
```

#### 2️⃣ 多單出場前檢查

```delphi
// 確保實際持有多單且與策略一致
if filled > 0 and position > 0 and filled = position and (出場條件) then begin
    SetPosition(0);
end;
```

#### 3️⃣ 空單出場前檢查

````delphi
// 確保實際持有空單且與策略一致
if filled < 0 and position < 0 and filled = position and (出場條件) then begin
    SetPosition(0);
end;
```

## 📊 波段策略專屬規範

### 資源預載 (SetBarBack/SetTotalBar)

**背景：** 波段策略需要較長的歷史資料進行回測與計算，必須在腳本開頭預先宣告資料長度。

**規範：**

```delphi
// ==============================
// 資源預載區 (波段策略必備)
// ==============================
SetBarBack(90);  // 跨頻率/跨商品引用時需要
SetTotalBar(121); // 持有期數 + 安全邊界

// 計算公式：SetTotalBar(持有期數 × 2 + 20)
// 範例：持有 60 日 → SetTotalBar(140)
````

**注意事項：**

- **當沖策略：** 不需要設定 `SetTotalBar`，系統預設足夠。
- **波段策略：** 根據 `period` 參數動態計算，建議至少 `持有期數 × 2`。
- **警示：** 200 根可能仍不足，請根據回測報錯調整。

---

## 🗑️ 取消委託 (CancelAllOrders)

**背景：** 用於安全地撤銷所有未成交的委託單，避免在刪改單過程中因成交導致部位不同步。

**核心特性：**

- **非同步執行**：指令發出後需等待主機確認。
- **狀態鎖定**：在等待確認期間，`Position` 鎖定，後續 `SetPosition` 無效。
- **自動同步**：刪單完成後，系統會自動將 `Position` 更新等於 `Filled`。

**標準寫法 (使用 State 狀態機)：**

```delphi
var: intrabarpersist _CancelState(0);

// 觸發刪單條件 (例如：價格偏離過大)
if _CancelState = 0 and Position <> Filled and (刪單條件) then begin
    CancelAllOrders();
    _CancelState = 1; // 標記進入刪單狀態
end;

// 檢查刪單是否完成 (Position = Filled 代表已同步)
if _CancelState = 1 and Position = Filled then begin
    _CancelState = 0; // 重置狀態
    // 可在此處執行後續邏輯 (如重新掛單)
end;
```

**使用場景：**

- 追價失敗後取消舊單
- 停損觸發時撤銷所有掛單
- 收盤前清理戰場

---

## 🛡️ 防呆機制規範

### 1️⃣ 環境與頻率防呆

```delphi
// 檢查執行頻率
if BarFreq <> "Min" then RaiseRunTimeError("僅支援分鐘線頻率");

// 檢查商品資格（現股當沖 - 分多空判斷）
input: _Period(0, "持有期數(0=當沖)");
input: _Direction(1, "方向", InputKind:=Dict(["多", 1], ["空", -1]));

// 當沖資格分多空檢查
if _Period = 0 and (
    (_Direction = 1 and not (GetSymbolInfo("先買現沖") or GetSymbolInfo("買賣現沖")))
    or (_Direction = -1 and not GetSymbolInfo("買賣現沖"))
) then return;

// 檢查 input 參數
if _StopLoss <= 0 or _TakeProfit <= 0 then
    RaiseRunTimeError("停損停利參數必須大於 0");
```

**重點說明：**

- **多單當沖：** 需要「先買現沖」**或**「買賣現沖」資格（兩者擇一即可）
- **空單當沖：** 只需要「買賣現沖」資格（無法僅先買）
- **波段策略：** 不需要現沖資格檢查

### 2️⃣ 參數歸零機制（當沖必備）

**核心邏輯：**
避免跨日汙染參數，必須在腳本運算區塊最上方偵測新交易日並將狀態變數歸零

```delphi
// 1. 每日參數歸零區
if Date <> Date[1] then begin
    // 狀態旗標歸零
    _EntryFlag = 0;
    _ExitFlag = 0;

    // 價格紀錄歸零
    _EntryPrice = 0;
    _StopLossPrice = 0;
    _TakeProfitPrice = 0;

    // 計數器歸零
    _BarNumberOfToday = 0;

    // 快取前一日數據（若需要）
    _Yesterday_AvgPrice = GetField("均價", "D")[1];
end;
```

### 3️⃣ 收盤前強制平倉（當沖）

```delphi
// 4. 收盤前強制出場
if CurrentTime >= 133000 then begin  // 13:30 強制平倉
    if filled <> 0 and position <> 0 and filled = position then begin
        SetPosition(0, label:="收盤前強制平倉");
    end;
end;

// 緊急警示（收盤前10分鐘仍有持倉）
if CurrentTime >= 132000 and filled <> 0 then begin
    Alert("注意：收盤前10分鐘仍有持倉！");
end;
```

### 4️⃣ 漲跌停鎖死防護（空單當沖）

```delphi
// 5. 漲停前強制出場（防空單鎖死）
value1 = (close - GetField("參考價", "D")) / GetField("參考價", "D") * 100;

if filled < 0 and position < 0 and value1 >= 9.5 then begin
    SetPosition(0, label:="接近漲停，強制平倉空單");
end;
```

## 📊 張數計算規範

### 🚨 強制規則：以「張」為單位

**背景：**

- 台股 1 張 = 1000 股
- XQ 自動交易目前不支援零股

**公式：**

```delphi
// ✅ 正確：計算可買張數
input: _Amount(50, "每筆投入金額(萬)");

var: _Lots(0);

// 使用漲停價計算（符合券商最嚴格額度控管）
_Lots = IntPortion(_Amount * 10000 / (GetField("漲停價", "D") * 1000));

// 進場
if _EntryCondition and filled = 0 and position = 0 then begin
    SetPosition(_Lots);
end;

// 更新進場價格 (使用成交均價)
if filled > 0 and position > 0 and filled = position then begin
    _EntryPrice = FilledAvgPrice;
end;
```

**錯誤範例：**

```delphi
// ❌ 錯誤：直接用股價計算
_Quantity = IntPortion(_Amount * 10000 / close);  // 這會算出「股數」而非「張數」
```

## 📝 逐筆洗價與狀態保存

### IntrabarPersist 關鍵字

**背景：**
XQ 日線回測預設開啟逐筆洗價，變數會在每個 Tick 重置回開盤狀態

**規範：**
凡涉及「狀態紀錄」或「累計數值」的變數，必須使用 `intrabarpersist`

```delphi
var: intrabarpersist _Flag(0);           // 狀態旗標
var: intrabarpersist _CumulativePos(0);  // 累計持倉
var: intrabarpersist _LastMonth(0);      // 最後成交月份
var: intrabarpersist _EntryPrice(0);     // 進場價格
```

## 🎯 完整交易腳本架構範本

### 當沖多單策略範例

```delphi
// ==============================
// 1. 參數宣告區
// ==============================
input:
    _Amount(50, "每筆金額(萬)"),
    _StopLoss(2, "停損(%)"),
    _TakeProfit(4, "停利(%)"),
    _MA_Short(5, "短均線"),
    _MA_Short(5, "短均線"),
    _MA_Long(20, "長均線");




// ==============================
// 2. 變數宣告區
// ==============================
var:
    intrabarpersist _EntryFlag(0),      // 進場旗標
    intrabarpersist _EntryPrice(0),     // 進場價格
    intrabarpersist _StopPrice(0),      // 停損價
    intrabarpersist _ProfitPrice(0),    // 停利價
    _Lots(0),                           // 下單張數
    _MA_S(0),                           // 短均線
    _MA_L(0);                           // 長均線

// ==============================
// 3. 環境預檢區
// ==============================
if BarFreq <> "Min" then RaiseRunTimeError("僅支援分鐘線頻率");
if GetSymbolInfo("買賣現沖") = false then return;






// ==============================
// 3.1 每日參數歸零區
// ==============================
if Date <> Date[1] then begin
    _EntryFlag = 0;
    _EntryPrice = 0;
    _StopPrice = 0;
    _ProfitPrice = 0;
end;

// ==============================
// 4. 邏輯運算區
// ==============================
// 計算均線
_MA_S = Average(Close, _MA_Short);
_MA_L = Average(Close, _MA_Long);

// 計算下單張數
_Lots = IntPortion(_Amount * 10000 / (GetField("漲停價", "D") * 1000));

// ==============================
// 5. 執行與輸出區
// ==============================

// 5.1.1 進場邏輯（均線黃金交叉 + 濾網）


if filled = 0 and position = 0 and _MA_S cross above _MA_L then begin
    SetPosition(_Lots);
    _EntryFlag = 1;
    _OrderTime = Time; // 紀錄下單時間
end;

// 5.1.2 未成交處理 (N分鐘後取消或追價)
input: _NotTradedKill(5, "未成交N分後處理");
input: _NotTradedMode(1, "未成交處理模式", InputKind:=Dict(["取消", 1], ["市價補", 2]));

if _EntryFlag = 1 and Filled = 0 and Position <> 0 and TimeDiff(Time, _OrderTime, "M") >= _NotTradedKill then begin
    if _NotTradedMode = 1 then begin
         SetPosition(0, label:="未成交_超時取消");
         _EntryFlag = 0; // 重置旗標
    end else if _NotTradedMode = 2 then begin
         SetPosition(Position, MARKET, label:="未成交_市價補滿");
    end;
end;

// 5.1.1 更新進場價格與停損利 (成交後執行)
if filled > 0 and position > 0 and filled = position and _EntryFlag = 1 then begin
    _EntryPrice = FilledAvgPrice;
    _StopPrice = _EntryPrice * (1 - _StopLoss / 100);
    _ProfitPrice = _EntryPrice * (1 + _TakeProfit / 100);
end;

// 5.2 停損出場
if filled > 0 and position > 0 and filled = position and close <= _StopPrice then begin
    SetPosition(0, label:="觸發停損");
end;

// 5.3 移動停利出場 (Adv)
input: _OpenMoveSP(4, "獲利N%後開啟移動");
input: _ProfitPullback(2, "獲利回吐M%出場");
var: intrabarpersist _MaxUnrealizedProfit(0);
var: _ProfitPercent(0);

if Filled > 0 and Position > 0 and Filled = Position and _EntryPrice > 0 then begin
    _ProfitPercent = (Close - _EntryPrice) / _EntryPrice * 100;
    _MaxUnrealizedProfit = MaxList(_ProfitPercent, _MaxUnrealizedProfit);

    if _MaxUnrealizedProfit > _OpenMoveSP and (_MaxUnrealizedProfit - _ProfitPercent) >= _ProfitPullback then begin
        SetPosition(0, label:="移動停利");
    end;
end;

// 5.4 傳統停利出場
if Filled > 0 and Position > 0 and Filled = Position and Close >= _ProfitPrice and _OpenMoveSP = 0 then begin // 若未開啟移動停利才執行
    SetPosition(0, label:="觸發停利");
end;

// 5.5 收盤前強制平倉 (使用 EnterMarketCloseTime)
input: _ExitPeriod(10, "收盤前N分平倉"); // 13:20
if EnterMarketCloseTime(_ExitPeriod) then begin
    if Filled <> 0 then begin
        SetPosition(0, label:="收盤前強制平倉");
    end;
end;


// 5.6 持有時間相關出場 (Adv)

// 重點：計算持有天數 (日曆日 vs K棒數)
// 1. 日曆日 (Calendar Days)：使用 DateDiff(Date, FilledEntryDate)
// 2. K棒數 (Bars)：使用 GetBarOffset(FilledEntryDate)
// 注意：XS 無內建 BarsSinceEntry 變數，需透過 GetBarOffset 計算。

input: _MaxHoldDays(10, "最多持有天數(日)");

if Filled > 0 and Position > 0 and Filled = Position then begin

    // 檢查持有天數 (日曆日) - 適用波段
    if DateDiff(Date, FilledEntryDate) >= _MaxHoldDays then begin
        SetPosition(0, label:="持有超時_日曆日");
    end;

    // 檢查持有 K 棒數 - 適用當沖或短波段
    if GetBarOffset(FilledEntryDate) >= 20 then begin
        SetPosition(0, label:="持有超時_K棒");
    end;
end;


// ❌ 常見錯誤寫法 (Anti-Pattern)
// Warn: GetFieldStartOffset 是查「資料源頭」(上市多久)，不能用來查「這筆單」進場多久
// if GetFieldStartOffset(FilledEntryDate) > 10 then ... // 絕對錯誤！語法與邏輯皆不通






```

## 🔧 狀態機設計（進階）

### 6.1 手動狀態追蹤模式 (進階)

當不信任系統變數或需在回測與實盤間取得絕對一致性時，可使用 `IntrabarPersist` 自行紀錄進場資訊。

```delphi
var: intrabarpersist _EntryDate(0);

// 進場邏輯
if Position = 0 and Filled = 0 and (進場條件) then begin
    SetPosition(1, Market);
    _EntryDate = Date; // 自行紀錄進場日期
end;

// 出場邏輯 (持有 N 日)
// Warn: 這裡的 [20] 在日線代表 20 天，在分鐘線代表 20 根 Bar (可能都在同一天)
if Position = 1 and Filled = 1 and Date[20] >= _EntryDate then begin
    SetPosition(0, Market);
end;
```

### 6.2 狀態機適用情境

當腳本有超過 5 種進出場判斷機制時，建議使用狀態機

```delphi
var: intrabarpersist _State(0);
// 0: 空手
// 1: 委託中
// 2: 已處理未成交
// 3: 持倉中
// 4: 收盤強平

// 狀態轉換邏輯
if _State = 0 and (進場條件) then begin
    SetPosition(_Lots);
    _State = 1;  // 轉為委託中
end;

if _State = 1 and filled > 0 and position > 0 and filled = position then begin
    _State = 3;  // 轉為持倉中
end;

if _State = 3 and (出場條件) then begin
    SetPosition(0);
    _State = 0;  // 轉為空手
end;
```

## 💡 xs-helper 最佳實踐

### 通用注意事項（適用所有腳本）

1. **命名規範**
   - `input` 和 `var` 名稱前都加上 `_`，避免使用內建名稱
   - 範例：`input: _Amount(50);` ✅

2. **var 宣告限制**
   - var 只可以包含變數名稱與初始值，不能包含其他描述
   - 範例：`var: intrabarpersist _Flag(0);` ✅

3. **函數優先原則**
   - 優先使用 XS 內建函數，找不到才自己寫計算式
   - 範例：`value1 = Average(Close, 20);` ✅

4. **序列存取方式**
   - 使用方括號 `[]` 加索引值取得歷史資料
   - 範例：`Close[1]`（昨日收盤）✅

5. **首根 K 棒判斷**
   - 不要用 `newday` 判斷是否為當天第一根 K 棒
   - 使用：`Date <> Date[1]` 或 `isfirstBar` ✅

6. **跨頻率取值注意**
   - 如有需要取用前期資料且資料頻率與主頻不同時
   - 不要使用變數，直接用 `GetField`，避免中間變數誤用
   - 範例：`if Close > GetField("收盤價", "D") then ...` ✅

7. **優先執行與預讀取機制 (Runtime Behavior)**
   - 某些函數在「初始化階段」執行，不受 if 條件控制
   - **典型函數**：`SetTotalBar`, `SetBarFreq`, `GetSymbolField`
   - **影響**：無法透過 if 動態決定是否讀取某商品資料，系統會預先載入
   - 範例：`if ... then SetTotalBar(100);` (無效，全域生效) ❌

### 交易腳本專屬注意事項

- **部位函數**：使用 `position`、`filled`、`setposition`
- **嚴禁使用**：`marketposition`（XQ 無此函數）
- **雙重檢查**：所有部位判斷都必須同時檢查 `filled` 與 `position`
- **狀態保存**：使用 `intrabarpersist` 宣告狀態變數

## 📚 官方範例索引

### XScript Preset 交易範例

**資源位置：** `references/xscript_preset/自動交易/`

#### 🎯 0-基本語法（12 個核心範例）

**必讀範例：**

- `01-SetPosition.xs` - 完整的 SetPosition 函數說明
  - 學習重點：Position 概念、預期部位設定
  - 包含：市價委託、限價委託、讓價機制
- `03-Filled.xs` - Filled 函數詳解
  - 學習重點：實際部位查詢、成交狀態判斷
  - 包含：Filled vs Position 差異說明

- `07-Position跟Filled的異動時機點.xs` - 核心概念（重要）
  - 學習重點：Position 與 Filled 何時會改變
  - 包含：委託流程完整說明

**進階範例：**

- `04-SetPosition範例#4(追價).xs` - 追價策略
- `04-SetPosition範例#5(加碼).xs` - 加碼邏輯
- `05-FilledAvgPrice以及停損停利範例.xs` - 停損停利實作
- `06-FilledRecord函數.xs` - 成交記錄查詢

#### 📋 1-常用下單方式

包含常見的下單模式範例：

- 市價單、限價單
- 追價單、停損單
- 分批進場策略

#### 🚪 2-下單出場方式

包含各種出場策略：

- 停損停利出場
- 時間出場
- 訊號反轉出場
- 移動停損

#### 🤖 3-Algo策略委託

量化交易進階功能：

- TWAP（時間加權平均價格）
- VWAP（成交量加權平均價格）
- 冰山委託

#### 📊 常見技術分析

基於技術指標的交易策略：

- 均線策略
- KD 策略
- MACD 策略
- 布林通道策略

### 學習路徑建議

#### 初學者（第 1-2 週）

1. **必讀**：`01-SetPosition.xs` - 理解交易腳本基礎
2. **必讀**：`03-Filled.xs` - 理解部位查詢
3. **必讀**：`07-Position跟Filled的異動時機點.xs` - 理解核心機制
4. **練習**：撰寫簡單的買進持有策略

#### 進階者（第 3-4 週）

1. **學習**：`05-FilledAvgPrice以及停損停利範例.xs` - 風險控制
2. **學習**：`04-SetPosition範例#4(追價).xs` - 進階委託
3. **練習**：撰寫均線交叉策略 + 停損停利
4. **參考**：`常見技術分析` 資料夾的策略範例

#### 專家（第 5 週以上）

1. **研究**：`3-Algo策略委託` 資料夾
2. **研究**：多策略組合
3. **實戰**：回測優化、參數調整
4. **進階**：開發自訂指標與函數

### 範例特色標記

我們為每個範例標記了特色，方便快速查找：

- 🔰 **入門級**：適合初學者，概念清晰
- ⭐ **推薦**：經典範例，必讀必懂
- 🎯 **實戰**：可直接用於實盤
- 🧪 **實驗**：進階技巧，需謹慎使用
- 📖 **教學**：包含詳細註解說明

## 📚 參考資源

- **官方範例**: [自動交易腳本範例](../../references/examples_index.md#自動交易腳本)
- **XS 語法手冊**: [XS 語法手冊](https://xshelp.xq.com.tw/XSHelp/)
- **內建函數**: `說明/內建.md` (SetPosition, Buy, Sell 等函數完整說明)
- **系統函數**: `說明/系統.md` (部位控制與邏輯判斷)
- **報價欄位**: `說明/報價.md` (GetQuote 欄位速查)
- [XScript Preset Repository](https://github.com/how0531/XScript_Preset)

### 本地資源

- **官方範例集：** `references/xscript_preset/自動交易/`
- **12 個基本語法範例**
- **完整的技術分析策略範例**

## ✅ 撰寫檢查清單

- [ ] 所有部位判斷都包含 `filled` 與 `position` 雙重檢查
- [ ] 當沖腳本包含每日參數歸零機制
- [ ] 包含環境預檢（頻率、商品資格）
- [ ] 張數計算使用 `IntPortion` 且以「張」為單位
- [ ] 使用 `intrabarpersist` 宣告狀態變數
- [ ] 包含停損停利機制
- [ ] 當沖腳本包含收盤前強制平倉
- [ ] 空單腳本包含漲停前強制平倉
- [ ] 所有 input 參數都加上 `_` 前綴且有中文描述
- [ ] 關鍵邏輯有繁體中文註解
- [ ] 註解不包含「強制模板」、「雙重判定」等提示詞相關字眼

## 8. 實戰策略範例 (Reference Implementation)

### 📝 雙週期 MACD 當沖策略模板

**結構解析 (僅供語法參考)：**

_(註：本範例僅展示程式邏輯與架構之完整性，不代表獲利保證)_

1. **同頻率趨勢模擬**：示範如何在單一頻率下計算長週期指標，避免跨頻率引用之副作用。
2. **ControlBar 機制**：示範標準的 K 棒控制權寫法，防止訊號閃爍造成重複下單。
3. **複雜出場邏輯**：示範如何撰寫分段式移動停利與狀態重置。

```delphi
// 15Min MACD 做多當沖交易 (微型台指近月)
// 適用頻率：15分鐘

// 1. 環境設定
if BarFreq <> "Min" or BarInterval <> 15 then RaiseRunTimeError("限用15分鐘");

// 2. 參數宣告
input: _StartTime(084500, "程式開始時間");
input: _FastLen(5, "DIF短天數"), _SlowLen(25, "DIF長天數"), _MACDLen(2, "MACD天數");
input: _TrendFast(13, "趨勢DIF短天數"), _TrendSlow(89, "趨勢DIF長天數"), _TrendMACD(34, "趨勢MACD天數");
input: _StopLossPoint(35, "停損點數"), _TrailingPercent(0.2, "移動停利啟動%");

// 設定最大引用筆數 (重要：包含長週期參數)
SetTotalBar(MaxList(_TrendFast, _TrendSlow, _TrendMACD) * 4 + 100);

// 3. 變數宣告
var: _Price(0);
var: _Dif(0), _Macd(0), _Osc(0);           // 短週期 MACD
var: _TrendDif(0), _TrendMacd(0), _TrendOsc(0); // 長週期 MACD (模擬趨勢)
var: _DynamicStopPoint(0);                 // 動態停損點
var: _ProfitPoint(0);                      // 目前獲利點數
var: intrabarpersist _ControlBar(0);       // K棒控制權
var: intrabarpersist _HighestPrice(0);     // 持倉期間最高價

_Price = WeightedClose();

// 4. 指標計算
// 短週期 (5/25/2)
_Dif = XAverage(_Price, _FastLen) - XAverage(_Price, _SlowLen);
_Macd = XAverage(_Dif, _MACDLen);
_Osc = _Dif - _Macd;

// 長週期 (13/89/34) - 用長參數模擬大趨勢，避免跨頻率
_TrendDif = XAverage(_Price, _TrendFast) - XAverage(_Price, _TrendSlow);
_TrendMacd = XAverage(_TrendDif, _TrendMACD);
_TrendOsc = _TrendDif - _TrendMacd;

if CurrentTime >= _StartTime then begin

    // 5. 進場條件
    // 趨勢 MACD > 0 且柱狀體向上，短線柱狀體也向上
    condition1 = _TrendOsc > 0 and _TrendDif > 0 and _Osc >= _Osc[1] and _Osc[1] >= 0;
    // 確保同一根 K 棒不重複進場
    condition2 = _ControlBar <> CurrentBar;

    if Position = 0 and condition1 and condition2 then begin
        SetPosition(1);
        _HighestPrice = 0; // 進場重置最高價
        _ControlBar = CurrentBar; // 鎖定這根 Bar
    end;

    // 6. 出場與停利邏輯
    if Position = 1 and Filled = 1 then begin

        // A. 初始停損
        if Close <= FilledAvgPrice - _StopLossPoint then begin
            SetPosition(0);
            _HighestPrice = 0;
            _ControlBar = CurrentBar;
        end else begin

            // B. 移動停利計算
            // 更新持倉最高價
            if Close > _HighestPrice then _HighestPrice = Close;

            if _HighestPrice > 0 then begin
                _ProfitPoint = _HighestPrice - FilledAvgPrice;

                // 分段式停利邏輯
                if _ProfitPoint < 200 then begin
                    // 獲利小於 200 點：使用初始停損或百分比回檔
                    // 這裡簡化邏輯，用戶原意是動態調整 _DynamicStopPoint
                    if _ProfitPoint > (Close * _TrailingPercent / 100) then
                       _DynamicStopPoint = Close * (_TrailingPercent/100);
                    else
                       _DynamicStopPoint = _StopLossPoint;
                end else begin
                    // 獲利大於 200 點：使用 1/3 回檔法 (鎖住大部分獲利)
                    _DynamicStopPoint = _ProfitPoint / 3;
                end;

                // 觸發移動停利 或 指標反轉 (Osc 下穿 0)
                if Close <= (_HighestPrice - _DynamicStopPoint) or _Osc Cross Below 0 then begin
                    SetPosition(0);
                    _HighestPrice = 0;
                    _ControlBar = CurrentBar;
                end;
            end;
        end;
    end;

    // 7. 尾盤強制平倉
    if Position <> 0 and CurrentTime >= 134300 then begin
        SetPosition(0);
        _HighestPrice = 0;
        _ControlBar = CurrentBar;
    end;
end;
```

## 9. 選擇權策略專題 (Option Strategy)

### ⚠️ 舊世代 vs 現代化寫法對比

在早期 (2010前)，交易者習慣用「字串組裝」來指定選擇權商品（如 `TX` + `N05` + `C`）。
這種寫法維護成本極高，因為月份代碼與年份代碼會不斷變動。

**現代化最佳實踐：屬性篩選法 (Attribute Filtering)**

將腳本掛在「一籃子選擇權」群組上，讓腳本自動判斷「我是不是你要找的那檔」。

| 特性       | 舊式寫法 (String Assembly)   | 現代化寫法 (Attribute Filtering)       |
| :--------- | :--------------------------- | :------------------------------------- |
| **邏輯**   | `Symbol = "TX2N05C18000.TF"` | `GetSymbolInfo("StrikePrice") = 18000` |
| **維護性** | ❌ 需每月修改代碼            | ✅ 萬年通用 (只需掛對群組)             |
| **複雜度** | 高 (需處理年月代碼轉換)      | 低 (直接讀取屬性)                      |

### 📝 現代化週選雙賣策略 (含動態避險)

**適用場景：** 策略雷達/選股中心 (指定群組：台指選週)
**策略邏輯：** 09:00 雙賣價平外一檔，遇逆勢 20 點則平倉觀望(鎖單)，回檔則恢復持倉。

**命名規則參考 (過濾依據)：**

- **選擇權 (Options)：**
  - **月選 (不操作)**： `TXO` (含每月第三週 W3)
  - **週選 (操作)**：
    - 週三到期：`TX1`, `TX2`, `TX4`, `TX5`
    - 週五到期：`TXU`, `TXV`, `TXX`, `TXY`, `TXZ`

- **期貨 (Futures)：**
  - **大台指**：`TX` | **小台指**：`MTX` (月選), `MX1~5` (週選)
  - **電子期**：`TE` | **小電子**：`ZEF`
  - **金融期**：`TF` | **小金融**：`ZFF`

- **全日盤識別 (Full Session)：**
  - 代碼中包含 `N` 代表全日盤 (含夜盤)，例如 `FITXN*1` 或 `TXON02...`
  - 若無 `N` 只有標 (一般) 則僅含日盤 (08:45-13:45)

```delphi
// 現代化週選雙賣策略範例
// 核心概念：屬性篩選 + 狀態機動態避險



input: _Underlying("FITXN*1.TF", "標的代碼");
input: _Gap(50, "履約價間距");      // 價外 N 點
input: _RiskPoint(20, "避險點數");  // 逆勢多少點平倉
input: _MaxRetry(5, "最大避險次數");

var: _SpotPrice(0), _ATM(0);
var: _MyStrike(0), _MyType("");
// 狀態機: 0=空手, 1=持倉(雙賣), 2=避險(暫時平倉)
var: intrabarpersist _State(0);
var: intrabarpersist _EntryPrice(0);
var: intrabarpersist _Count(0); // 避險次數

// 0. 代碼過濾 (排除月選 TXO)
// 雖然掛在週選群組最保險，但增加此行可防止掛錯
// TXO 代表月選 (含 W3)，TX1/2/4/5 代表週選
if InStr(Symbol, "TXO") > 0 then return;

// 1. 計算標的價平 (09:00 定錨)
if CurrentTime = 090000 or _ATM = 0 then begin
    _SpotPrice = GetSymbolField(_Underlying, "Close");
    if _SpotPrice > 0 then begin
        _ATM = Round(_SpotPrice / 50, 0) * 50; // 週選通常為 50 點一跳
    end;
    _Count = 0; // 每日重置
end;

// 2. 獲取自身屬性
_MyStrike = GetSymbolInfo("履約價");
_MyType = GetSymbolInfo("買賣權");

// 3. 目標履約價篩選
// 賣 Call: 價平 + Gap (例如 20050)
condition1 = (_MyType = "Call" and _MyStrike = _ATM + _Gap);
// 賣 Put: 價平 - Gap (例如 19950)
condition2 = (_MyType = "Put" and _MyStrike = _ATM - _Gap);

// 09:00 進場
if _State = 0 and Position = 0 and (condition1 or condition2) and CurrentTime >= 090000 and CurrentTime < 090500 then begin
    SetPosition(-1);
    _State = 1;
    _EntryPrice = Close;
end;

// 4. 動態避險監控 (持倉狀態)
if _State = 1 and Position = -1 then begin
    // 若權利金上漲(虧損)超過避險點數 -> 先行平倉(鎖單)
    if Close >= _EntryPrice + _RiskPoint then begin
        SetPosition(0);
        _State = 2; // 轉入避險狀態
        _Count += 1;
    end;
end;

// 5. 恢復持倉監控 (避險狀態)
// 邏輯：價格跌回原價 + 時間 > 09:10 + 次數未滿
if _State = 2 and Position = 0 and CurrentTime > 091000 then begin
    if _Count <= _MaxRetry and Close <= _EntryPrice then begin
        SetPosition(-1);
        _State = 1; // 轉回持倉狀態
    end;
end;


// 6. 尾盤或次數過多強制平倉
if (CurrentTime >= 133500) or (_Count > _MaxRetry) then begin
    if Position <> 0 then SetPosition(0);
    _State = 0;
end;
```

## 10. 進階語法專題 (Advanced Syntax)

### 🔄 群組遍歷 (Group Iteration)

**用途**：在單一腳本中遍歷指定群組的所有商品（常用於盤前掃描或盤後分析）。
**注意**：此語法通常用於「自動交易中心」的策略執行，而非個別商品的回測。

```delphi
// 群組掃描範例
// 執行頻率：日 (因為要掃描收盤價)
setTotalBar(1);

input: OpGroup(Group); // 群組變數
var: OpGroupSize(0), i(0);

OpGroupSize = GroupSize(OpGroup); // 取得群組大小

for i = 1 to OpGroupSize begin
    // 取得第 i 個成員代碼與收盤價
    Print(OpGroup[i], GetSymbolField(OpGroup[i], "Close", "D"));
end;
```

## 11. 語法重構案例 (Refactoring Case Study)

### ⚠️ 可運行但有風險 (Running with Risks)

以下是一個 **「可以編譯執行」** 但隱藏潛在風險的腳本。雖然 XS 編譯器容許這些寫法，但為了資產安全，建議進行優化。

**潛在風險分析 (Risk Analysis)：**

1. **變數宣告位置**：雖然部分版本允許在 `if` 區塊內宣告變數，但這可能導致變數範圍 (Scope) 混亂，建議統一在檔案最上方宣告。
2. **條件變數持久化**：`long_condition` 使用 `intrabarpersist` 雖然配合手動重置 (`= false`) 可以運作，但邏輯較為冗餘且易出錯。
3. **收盤價停損 (關鍵風險)**：使用 `plratio` (基於收盤價) 判斷停損。若盤中瞬間暴跌 10% 但收盤拉回，**此邏輯將不會觸發停損**。這在實戰中是極度危險的。
4. **冗餘運算**：計算了 `highestPriceToday` 但進場條件未使用，徒增運算成本。

**✅ 正確重構版本 (Best Practice)：**

```delphi
// 策略：區間突破 (Donchian Channel Breakout)
// 修正重點：變數宣告置頂、觸價停損機制

input: _Length(9, "計算期數");
input: _LossPercent(2, "止損(%)");
input: _ProfitPercent(6, "止盈(%)");
input: _StartTime(091500, "開始計算時間");

// 變數宣告 (全部移到最上方)
var: _TakeProfitPrice(0);
var: _StopLossPrice(0);

// 進場條件
// 時間允許 + 突破前 N 根高點
condition1 = Time >= _StartTime and High > Highest(High, _Length)[1];

// 1. 進場邏輯
if Position = 0 and condition1 then begin
    SetPosition(1, MARKET);
end;

// 2. 出場邏輯 (持有且已成交)
if Position = 1 and Filled = 1 then begin

    // 計算停損停利價 (基於成交均價)
    _TakeProfitPrice = FilledAvgPrice * (1 + _ProfitPercent / 100);
    _StopLossPrice = FilledAvgPrice * (1 - _LossPercent / 100);

    // A. 停利 (觸價即出)
    // 若當根最高價碰到停利價 -> 出場
    if High >= _TakeProfitPrice then begin
        SetPosition(0, MARKET);
        // 註：回測可用 SetPosition(0, _TakeProfitPrice) 模擬限價單
    end;

    // B. 停損 (觸價即出)
    // 若當根最低價碰到停損價 -> 出場
    if Low <= _StopLossPrice then begin
        SetPosition(0, MARKET);
    end;
end;

// 3. 尾盤強制平倉
if Time >= 134000 and Position <> 0 then SetPosition(0);
```
