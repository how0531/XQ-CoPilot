---
name: 指標腳本專家
description: 專門處理 XS 指標腳本的撰寫，包含繪圖設定、plot 使用、跨頻率數據處理等
---

# 指標腳本專家 Skill

## 🎯 專長領域

專門處理 XS 指標腳本（Indicator Script）的撰寫與優化，確保符合 XQ 平台的繪圖規範與技術指標計算邏輯。

## 📋 核心規範

### 1️⃣ Plot 繪圖規範

#### 必要語法結構

```delphi
plot1(close,"收盤價");
plot2(value1,"自訂數值");
```

**強制規則：**

- `plot` 無法定義顏色、線條樣式與線條粗細
- 必須包含：plot 序列、名稱與要繪製的數值
- 必須包含 checkbox 參數

#### 多色線處理（重要）

> **⚠️ 嚴禁使用一條主線疊加多條色線**

若指標需根據數值正負或趨勢改變顏色（如 SuperTrend），應：

- ✅ 使用多條 plot 分別繪製不同狀態
- ❌ 避免圖層重複渲染
- ✅ 確保數據視窗 (Data Window) 的數值顯示清晰

**錯誤範例：**

```delphi
// ❌ 錯誤：疊加多條色線
plot1(supertrend, "SuperTrend");
if trend = 1 then plot2(supertrend, "上升趨勢");
if trend = -1 then plot3(supertrend, "下降趨勢");
```

**正確範例：**

```delphi
// ✅ 正確：條件式繪製
if trend = 1 then plot1(supertrend, "上升趨勢");
if trend = -1 then plot2(supertrend, "下降趨勢");
```

#### Plot 偏移參數 (shift:=N) 【新功能】

**背景：** 在某些指標（如一目均衡表、預測指標）中，需要在當前 K 棒的基礎上向前（未來）或向後（過去）偏移繪製數值。

**支援的 Plot 函數：**

```delphi
Plot(序列編號, 數值, shift:=N)
Plot(序列編號, 數值, "序列名稱", shift:=N)
PlotN(數值, shift:=N)
PlotN(數值, "序列名稱", shift:=N)
PlotK(序列編號, vOpen, vHigh, vLow, vClose, shift:=N)
PlotK(序列編號, vOpen, vHigh, vLow, vClose, "序列名稱", shift:=N)
PlotFill(序列編號, vFrom, vTo, shift:=N)
PlotFill(序列編號, vFrom, vTo, "序列名稱", shift:=N)
```

**參數運作方式：**

- **shift 為整數**：正值向右/未來偏移，負值向左/過去偏移
- **偏移単位**：K 棒數量（例：`shift:=-2` 為向左 2 根 K 棒）
- **限制**：
  - 每個 Plot 只能有一個偏移值
  - 超出繪圖範圍的部分不會顯示

**範例：一目均衡表 (Ichimoku Cloud)**

```delphi
input: ConvPeriod(9, "轉換天數");
input: BasePeriod(26, "樞紐天數");
input: LagPeriod(52, "延遲天數");

// 轉換線
Value1 = (Highest(High, ConvPeriod) + Lowest(Low, ConvPeriod)) / 2;

// 樞紐線
Value2 = (Highest(High, BasePeriod) + Lowest(Low, BasePeriod)) / 2;

// 先行帶 A
Value3 = (Value1 + Value2) / 2;

// 先行帶 B
Value4 = (Highest(High, LagPeriod) + Lowest(Low, LagPeriod)) / 2;

// 繪圖
Plot(1, value1, "轉換線");                      // 當根 K 棒
Plot(2, value2, "樞紐線");                      // 當根 K 棒
Plot(3, Close, "後行時間", shift:=-BasePeriod+1); // 向左偏移 25 根
Plot(4, Value3, "先行時間(1)", shift:=BasePeriod-1); // 向右偏移 25 根
Plot(5, Value4, "先行時間(2)", shift:=BasePeriod-1); // 向右偏移 25 根
PlotFill(6, Value3, Value4, shift:=BasePeriod-1);   // 雲帶填充
```

**使用場景：**

- 🔮 **預測指標**：向未來繪製預測走勢（`shift:=N`）
- 🔙 **落後指標**：向過去繪製轉折點（`shift:=-N`）
- ☁️ **雲帶指標**：結合 PlotFill 圖形化區間

---

### 2️⃣ PlotK 繪 K 棒規範

**語法結構：**

```delphi
PlotK(序列編號, 開盤價, 最高價, 最低價, 收盤價, "名稱");
```

**範例：**

```delphi
PlotK(1, open, high, low, close, "自訂K棒");
```

**限制：**

- XQ 3.17 版本不支援指定顏色
- 參數順序必須嚴格遵守

### 3️⃣ 跨頻率數據處理

#### 使用 GetField 取得不同頻率數據

```delphi
value1 = GetField("內盤量", "1");  // 1分鐘頻率
value2 = GetField("內盤量", "5");  // 5分鐘頻率
value3 = GetField("內盤量", "D");  // 日線頻率
```

#### 跨商品數據引用（強制規則）

```delphi
// ✅ 正確：使用 GetSymbolField
value1 = GetSymbolField("TSE.TW", "收盤價", "D");

// ❌ 錯誤：直接引用其他商品數據
value1 = Close of "TSE.TW";  // XS 不支援此語法
```

### 4️⃣ 繪圖設定規範

#### 使用 SetPlotLabel 設定動態標籤

```delphi
plot1(value1);
SetPlotLabel(1, "自訂標籤名稱");
```

#### 使用 SetPlotColor 設定顏色（若版本支援）

```delphi
plot1(value1, "數值");
if value1 > 0 then SetPlotColor(1, Red)
else SetPlotColor(1, Green);
```

## 🔧 常見應用模板

### 📊 移動平均線指標

```delphi
input: _Length(20, "均線週期");

var: _ma(0);

// 計算移動平均
_ma = Average(Close, _Length);

// 繪圖
plot1(_ma, "移動平均線");
```

### 📈 KD 指標

```delphi
input: _Length(9, "KD 週期"), _Smooth1(3, "K 平滑"), _Smooth2(3, "D 平滑");

var: _rsv(0), _k(0), _d(0);

// 計算 RSV
_rsv = 100 * (Close - Lowest(Low, _Length)) / (Highest(High, _Length) - Lowest(Low, _Length));

// 計算 K 值
_k = Average(_rsv, _Smooth1);

// 計算 D 值
_d = Average(_k, _Smooth2);

// 繪圖
plot1(_k, "K值");
plot2(_d, "D值");
```

### 🌊 布林通道指標

```delphi
input: _Length(20, "週期"), _StdDev(2, "標準差倍數");

var: _middle(0), _upper(0), _lower(0), _std(0);

// 計算中軌
_middle = Average(Close, _Length);

// 計算標準差
_std = StandardDev(Close, _Length);

// 計算上下軌
_upper = _middle + (_StdDev * _std);
_lower = _middle - (_StdDev * _std);

// 繪圖
plot1(_upper, "上軌");
plot2(_middle, "中軌");
plot3(_lower, "下軌");
```

### 📊 成交量指標（跨頻率）

```delphi
input: _Freq("5", "頻率", InputKind:=Dict(["1分鐘","1"],["5分鐘","5"],["日線","D"]));

var: _vol(0);

// 取得指定頻率的成交量
_vol = GetField("成交量", _Freq);

// 繪圖
plot1(_vol, "成交量");
```

## 🚨 常見錯誤與修正

### ❌ 錯誤 1：Plot 序列不連續

```delphi
// ❌ 錯誤
plot1(value1);
plot3(value2);  // 跳過 plot2
```

**修正：**

```delphi
// ✅ 正確
plot1(value1);
plot2(value2);
```

### ❌ 錯誤 2：未處理除以零

```delphi
// ❌ 錯誤
value1 = (High - Low) / (High[1] - Low[1]);
```

**修正：**

```delphi
// ✅ 正確
if (High[1] - Low[1]) <> 0 then
    value1 = (High - Low) / (High[1] - Low[1])
else
    value1 = 0;
```

### ❌ 錯誤 3：跨頻率數據使用變數暫存

```delphi
// ❌ 錯誤：容易造成對位錯誤
var: _dayClose(0);
_dayClose = GetField("收盤價", "D");
value1 = close cross above _dayClose;
```

**修正：**

```delphi
// ✅ 正確：直接使用 GetField
value1 = close cross above GetField("收盤價", "D");
```

### 4️⃣ 進階：商品群組 (Group) 與跨商品掃描

**背景：**
XQ 提供了強大的 `Group` (商品群組) 功能，允許腳本動態指定或遍歷一組商品。搭配 `GetSymbolInfo` 和 `GetSymbolField`，可以在單一腳本內實現「跨商品掃描」與「配對交易監控」。

**核心語法：**

#### 1. 宣告與指定群組

```delphi
// 方法 A：使用者手動選擇 (Input)
input: _MyGroup(Group, "選擇群組");

// 方法 B：腳本動態指定 (Variable)
variable: _SysGroup(Group);
_SysGroup = GetSymbolGroup("TSE.TW", "成分股");
// 支援類型："成分股", "細產業", "概念股", "集團股", "期貨", "選擇權", "權證", "可轉債"
```

#### 2. 遍歷群組 (Scanning)

```delphi
// 取得群組大小
value1 = GroupSize(_MyGroup);

// 遍歷迴圈 (Index 從 1 開始)
For i = 1 to GroupSize(_MyGroup) begin
    // 取得代碼：_MyGroup[i]
    // 取得報價：GetSymbolField(_MyGroup[i], "Close")
    // 取得屬性：GetSymbolInfo(_MyGroup[i], "履約價")
end;
```

**實戰範例：自動搜尋價平選擇權 (ATM Option Scanner)**

```delphi
input: OPGroup(Group, "選擇權群組");

variable: i(0), iSpotPrice(0), KK(0);
variable: CC(0), PP(0);
variable: isCallFound(false), isPutFound(false);

// 1. 取得標的價格與價平履約價
iSpotPrice = GetSymbolField("FITMN*1.TF", "收盤價");
KK = Round(iSpotPrice * 0.01, 0) * 100; // 假設間距 100

// 2. 遍歷群組尋找價平合約
isCallFound = false;
isPutFound = false;

For i = 1 to GroupSize(OPGroup) begin
    // 判斷該商品履約價是否等於價平
    if GetSymbolInfo(OPGroup[i], "履約價") = KK then begin

        // 分別紀錄 Call 與 Put 的價格
        if GetSymbolInfo(OPGroup[i], "買賣權") = "Call" then begin
            CC = GetSymbolField(OPGroup[i], "Close");
            isCallFound = true;
        end else begin
            PP = GetSymbolField(OPGroup[i], "Close");
            isPutFound = true;
        end;

        // 若兩者都找到則提早結束迴圈
        if isCallFound and isPutFound then break;
    end;
end;

// 3. 輸出結果
if isCallFound and isPutFound then begin
    Print(Date, Time, "標的=", iSpotPrice, "價平=", KK, "Call=", CC, "Put=", PP);
end;
```

**⚠️ 限制與最佳實踐：**

1.  **InputKind 限制**：可使用 `InputKind:=SymbolGroup("類型")` 限制使用者只能選特定類型的群組。
    - 範例：`input: _OptGroup(Group, "選擇權", InputKind:=SymbolGroup("選擇權"));`
2.  **變數限制**：`GetSymbolField` 支援 `Group[i]` 這種變數形式，但不支援隨意定義的字串變數。
3.  **效能注意**：遍歷大型群組（如所有上市櫃股票）極度消耗資源，建議僅用於小型群組（如成分股、期權鍊）。

---

## 💡 xs-helper 最佳實踐

### 通用注意事項（適用所有腳本）

1. **命名規範**
   - `input` 和 `var` 名稱前都加上 `_`，避免使用內建名稱
   - 範例：`input: _Length(20);` ✅

2. **var 宣告限制**
   - var 只可以包含變數名稱與初始值，不能包含其他描述
   - 範例：`var: _Flag(0);` ✅
   - 錯誤：`var: _Flag(0, "標記");` ❌

3. **函數優先原則**
   - 優先使用 XS 內建函數，找不到才自己寫計算式
   - 範例：`value1 = Average(Close, 20);` ✅（使用內建函數）
   - 避免：手寫移動平均計算 ❌

4. **序列存取方式**
   - 使用方括號 `[]` 加索引值取得歷史資料
   - 範例：`Close[1]`（昨日收盤）✅
   - 錯誤：`Close(-1)` ❌

5. **首根 K 棒判斷**
   - 不要用 `newday` 判斷是否為當天第一根 K 棒
   - 使用：`Date <> Date[1]` 或 `isfirstBar` ✅

6. **跨頻率取值注意**
   - 如有需要取用前期資料且資料頻率與主頻不同時
   - 不要使用變數，直接用 `GetField`，避免中間變數誤用
   - 範例：`if Close > GetField("收盤價", "D") then ...` ✅

### 指標腳本專屬注意事項

- **plot 限制**：無法定義顏色、線條樣式與線條粗細
- **必要元素**：僅包含要繪製的數值、序列名稱跟 checkbox
- **PlotK 順序**：必須嚴格遵守開、高、低、收的參數順序

## 📚 官方範例索引

### XScript Preset 指標範例

**資源位置：** `references/xscript_preset/指標/`

#### 📊 技術指標（83 個範例）

**基礎指標：**

- `KD 隨機指標.xs` - 經典 KD 指標實作
- `MACD.xs` - MACD 指標實作
- `BB指標.xs` - 布林通道
- `RSI.xs` - 相對強弱指標
- `DMI.xs` - 趨向指標

**進階指標：**

- `股性綜合分數指標.xs` - 多維度評分系統
- `波動率指標.xs` - 市場波動度量
- `動量指標.xs` - 價格動量分析
- `多空力道指標.xs` - 多空對比

**完整清單：** 共 83 個技術指標範例，涵蓋：

- 趨勢指標（均線、DMI、ADX 等）
- 震盪指標（KD、RSI、威廉指標等）
- 量能指標（OBV、MFI 等）
- 波動指標（ATR、布林通道等）

#### 🔄 跨頻率指標（重要）

- `分鐘與日KD.xs` - 如何在分鐘線中引用日線 KD
- `週KD.xs` - 週線 KD 指標實作

#### 📈 其他類別

- **XQ技術指標**（官方精選）
- **主圖指標**（疊加在 K 線圖上）
- **籌碼指標**（結合籌碼數據）
- **量能指標**（成交量分析）

### 如何使用官方範例

1. **瀏覽範例**

   ```powershell
   # 查看所有KD相關範例
   dir "C:\Users\How\OneDrive\Documents\XQ chatbot\references\xscript_preset\指標" -Recurse -Filter "*KD*"
   ```

2. **學習順序建議**
   - 初學者：從 `XQ技術指標` 資料夾開始
   - 進階者：參考 `跨頻率指標` 學習跨頻率處理
   - 專家：研究 `技術指標` 資料夾的進階範例

3. **範例特色**
   - ✅ 使用官方推薦的函數與語法
   - ✅ 包含完整的 input 參數設定
   - ✅ 遵循最佳實踐規範

### 📚 參考資源

- **官方範例**: [指標腳本範例](../../references/examples_index.md#指標腳本)
- **XS 語法手冊**: [XS 語法手冊](https://xshelp.xq.com.tw/XSHelp/)
- **內建函數**: `說明/內建.md` (Plot 繪圖函數完整說明)
- **系統函數**: `說明/系統.md` (技術指標計算函數)
- **進階語法**: `說明/XS語法運用.md` (進階語法與範例)
- [跨頻率語法說明](https://www.xq.com.tw/lesson/xspractice/%E8%B7%A8%E9%A0%頻率/)
- [XScript Preset Repository](https://github.com/how0531/XScript_Preset)

### 本地資源

- **官方範例集：** `references/xscript_preset/指標/`
- **83 個技術指標範例**
- **跨頻率指標範例**

## ✅ 撰寫檢查清單

完成指標腳本後，請確認以下事項：

- [ ] 所有 plot 序列編號連續（1, 2, 3...）
- [ ] 所有 plot 都有明確的名稱標籤
- [ ] 涉及除法的地方都有檢查分母是否為 0
- [ ] 跨頻率數據使用 GetField 且未使用變數暫存
- [ ] 跨商品數據使用 GetSymbolField
- [ ] input 參數都有中文描述且加上 `_` 前綴
- [ ] 關鍵計算邏輯有繁體中文註解
- [ ] 已設定 SetBarBack 與 SetTotalBar 確保數據足夠

## 9. 跨頻率繪圖專題 (Cross-Frequency Plotting)

### 📊 3分K 畫 1分K 高低點 (含延後開盤偵測)

**核心概念：**

1. **資料對齊**：在 3分K 上，`GetField("...", "1")` 默認對應當根 3分K 的結束時間點。
2. **開盤偵測**：透過檢查細頻率成交量 (`Volume=0`) 來判斷是否延後開盤，動態調整引用位置。

```delphi
// 適用頻率：3分鐘
if barFreq <> "Min" or barinterval <> 3 then raiseRunTimeError("限用3分鐘頻率");

var: myBar(0);
var: _High1(0), _Low1(0);

// 每日開盤第一根 3分K (09:03)
if date <> date[1] then begin

    // 檢查 1分K 的時間是否為 09:02:00 (中間那根)
    // 正常 3分K (09:03) 包含 09:01, 09:02, 09:03
    // 若 GetField("Time", "1") 回傳 09:02 (這裡邏輯視資料源而定)
    if GetField("Time", "1") = 090200 then begin

        // 檢查第一根 1分K (09:01) 是否有量
        // [2] 代表往前推 2 根 (09:03 -> 09:02 -> 09:01)
        if GetField("Volume", "1")[2] = 0 then begin
            // 延後開盤 (09:01 沒量)
            // 改抓當前或前一根
            _High1 = GetField("High", "1");
            _Low1 = GetField("Low", "1");
            myBar = currentBar; // 線段起點
        end else begin
            // 正常開盤
            // 抓 09:01 的高低點
            _High1 = GetField("High", "1")[2];
            _Low1 = GetField("Low", "1")[2];
            myBar = currentBar - 2; // 線段起點 (模擬 1分K 位置)
        end;
    end;
end;

// 畫水平線 (從開盤延伸至今)
plotline(1, myBar, _High1, currentBar, _High1, "第一根1分K高點", add:=1);
plotline(2, myBar, _Low1, currentBar, _Low1, "第一根1分K低點", add:=1);
```

## 10. 統計分析專題 (Statistical Analysis)

### 📈 特定時段波動率統計 (盤中/盤後通用版)

**核心概念：**

1. **時段過濾**：只統計開盤後特定時段 (如 08:45-09:45) 的 K 棒。
2. **動態計數**：使用變數 `_Count` 累積符合條件的 K 棒數，而非硬編碼除數，確保統計精確。
3. **模式判斷**：透過 `GetInfo("TradeMode")` 區分即時盤中與歷史回測，彈性決定是否包含當日資料。

```delphi
// 計算過去 N 天「特定時段」的平均振幅
// 適用頻率：5分鐘 (或其他分K)

input: _Days(10, "統計天數");
input: _StartTime(084500, "統計開始時間");
input: _EndTime(094000, "統計結束時間");
input: _IncludeToday(false, "盤中是否包含今日");

// 設定引用筆數
// 全日盤一天約 230 根，10天需 2300 根，建議設大一點確保足夠
SetTotalBar(3000);

var: _Sum(0), _Count(0);
var: _IsRealTime(false);

// 判斷是否為即時模式 (1=Realtime)
_IsRealTime = (GetInfo("TradeMode") = 1);

// 核心迴圈
if Time >= _StartTime and Time <= _EndTime then begin

    // 盤中過濾邏輯：若不包含今日且為即時模式，則跳過今日資料
    if _IsRealTime and Date = CurrentDate and _IncludeToday = false then begin
        return;
    end;

    // 計算單根 K 棒振幅 (%)
    // 公式：(高-低)/低 * 100
    value1 = 0;
    if Low > 0 then value1 = 100 * (High / Low - 1);

    // 累加
    _Sum += value1;
    _Count += 1;

    // (可選) 列印詳細資料
    // Print(Date, Time, "振幅%", value1);
end;

// 結算輸出
if IsLastBar then begin
    if _Count > 0 then begin
        value2 = _Sum / _Count; // 平均振幅
        Print("統計期間:", _Days, "天",
              " 總K棒數:", _Count,
              " 平均振幅:", value2, "%");

        // 可畫圖或作為指標輸出
        Plot1(value2, "時段平均振幅");
    end else begin
        Print("樣本不足");
    end;
end;
```
