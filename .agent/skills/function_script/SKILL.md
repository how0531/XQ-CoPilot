---
name: 函數腳本專家
description: 專門處理 XS 函數腳本的撰寫，包含參數類型定義、NumericRef 回傳機制、函數封裝等
---

# 函數腳本專家 Skill

## 🎯 專長領域

專門處理 XS 函數腳本（Function Script）的撰寫，確保函數封裝正確、參數類型定義清晰、回傳機制符合規範。

## 📋 核心規範

### 1️⃣ 基本函數結構

```delphi
// Input 參數宣告
input: Price(NumericSeries);
input: Length(NumericSimple);

// Output 參數（使用 NumericRef）
input: Result(NumericRef);

// 計算邏輯
Result = Average(Price, Length);
```

### 2️⃣ 參數類型定義

#### Numeric 系列

| 類型                 | 說明           | 使用情境                  |
| -------------------- | -------------- | ------------------------- |
| `Numeric`            | 通用數值型態   | 一般數值參數              |
| `NumericSeries`      | 數值序列       | 傳入 Close, Volume 等序列 |
| `NumericSimple`      | 單一數值       | 傳入固定數字如 20, 5      |
| `NumericRef`         | 可回傳數值     | 需要從函數回傳結果時使用  |
| `NumericArray[X]`    | 數值陣列       | 傳入陣列資料              |
| `NumericArrayRef[X]` | 可回傳數值陣列 | 需回傳陣列時使用          |

#### String 系列

| 類型                | 說明           |
| ------------------- | -------------- |
| `String`            | 通用字串型態   |
| `StringSeries`      | 字串序列       |
| `StringSimple`      | 單一字串       |
| `StringRef`         | 可回傳字串     |
| `StringArray[X]`    | 字串陣列       |
| `StringArrayRef[X]` | 可回傳字串陣列 |

#### TrueFalse 系列

| 類型                   | 說明           |
| ---------------------- | -------------- |
| `TrueFalse`            | 通用邏輯型態   |
| `TrueFalseSeries`      | 邏輯序列       |
| `TrueFalseSimple`      | 單一邏輯值     |
| `TrueFalseRef`         | 可回傳邏輯值   |
| `TrueFalseArray[X]`    | 邏輯陣列       |
| `TrueFalseArrayRef[X]` | 可回傳邏輯陣列 |

### 3️⃣ NumericRef 回傳機制

當函數需要回傳多個數值時，使用 `NumericRef`

```delphi
// MACD 函數範例
input: Price(NumericSeries);
input: FastLength(NumericSimple);
input: SlowLength(NumericSimple);
input: MACDLength(NumericSimple);

// 使用 NumericRef 回傳三個數值
input: DifValue(NumericRef);
input: MACDValue(NumericRef);
input: OscValue(NumericRef);

// 計算
DifValue = XAverage(Price, FastLength) - XAverage(Price, SlowLength);
MACDValue = XAverage(DifValue, MACDLength);
OscValue = DifValue - MACDValue;
```

**呼叫範例：**

```delphi
input: FastLength(12), SlowLength(26), MACDLength(9);
variable: difValue(0), macdValue(0), oscValue(0);

// 呼叫函數
MACD(Close, FastLength, SlowLength, MACDLength, difValue, macdValue, oscValue);

// 使用回傳值
if difValue cross above macdValue then ret = 1;
```

### 4️⃣ NumericArray 陣列參數

```delphi
// 函數定義
input: MyNumericArray[X](NumericArray);

var: Value1(0), Value2(0);

// X 是陣列大小
for Value1 = 1 to X begin
    Value2 = Value2 + MyNumericArray[Value1];
end;
```

**二維陣列：**

```delphi
input: MyNumericArray[X, Y](NumericArray);
// X = 行數, Y = 欄數
```

### 5️⃣ 函數預設值與命名

```delphi
// 帶預設值與名稱的參數
input: Price(close, NumericSeries, "價格");
input: Length(10, NumericSimple, "天期");
input: Result(0, NumericRef, "結果");
```

## 🔧 常見應用模板

### 📊 簡單移動平均函數

```delphi
// MyAverage.xs
input: Price(NumericSeries, "價格序列");
input: Length(NumericSimple, "週期");
input: Result(NumericRef, "平均值");

// 計算邏輯
Result = Average(Price, Length);
```

**呼叫：**

```delphi
var: _ma(0);
MyAverage(Close, 20, _ma);
plot1(_ma, "20日均線");
```

### 📈 KD 指標函數

```delphi
// MyKD.xs
input:
    HighPrice(NumericSeries, "最高價"),
    LowPrice(NumericSeries, "最低價"),
    ClosePrice(NumericSeries, "收盤價"),
    Length(NumericSimple, "KD週期"),
    SmoothK(NumericSimple, "K平滑"),
    SmoothD(NumericSimple, "D平滑");

input:
    RSV_Out(NumericRef, "RSV"),
    K_Out(NumericRef, "K值"),
    D_Out(NumericRef, "D值");

var: _rsv(0);

// 計算 RSV
_rsv = 100 * (ClosePrice - Lowest(LowPrice, Length))
    / (Highest(HighPrice, Length) - Lowest(LowPrice, Length));

// 計算 K 值
K_Out = Average(_rsv, SmoothK);

// 計算 D 值
D_Out = Average(K_Out, SmoothD);

// 輸出 RSV
RSV_Out = _rsv;
```

**呼叫：**

```delphi
var: _rsv(0), _k(0), _d(0);
MyKD(High, Low, Close, 9, 3, 3, _rsv, _k, _d);

plot1(_k, "K值");
plot2(_d, "D值");
```

### 🔄 布林通道函數

```delphi
// MyBollinger.xs
input:
    Price(NumericSeries, "價格"),
    Length(NumericSimple, "週期"),
    StdDevMult(NumericSimple, "標準差倍數");

input:
    Upper(NumericRef, "上軌"),
    Middle(NumericRef, "中軌"),
    Lower(NumericRef, "下軌");

var: _std(0);

// 計算中軌
Middle = Average(Price, Length);

// 計算標準差
_std = StandardDev(Price, Length);

// 計算上下軌
Upper = Middle + (StdDevMult * _std);
Lower = Middle - (StdDevMult * _std);
```

**呼叫：**

```delphi
var: _upper(0), _middle(0), _lower(0);
MyBollinger(Close, 20, 2, _upper, _middle, _lower);

plot1(_upper, "上軌");
plot2(_middle, "中軌");
plot3(_lower, "下軌");
```

### 📊 多重回傳值（選擇權希臘字母範例）

```delphi
// MyGreeks.xs
input:
    CallPut(String, "買賣權"),
    UnderlyingPrice(NumericSimple, "標的價格"),
    StrikePrice(NumericSimple, "履約價"),
    DaysToExpiry(NumericSimple, "到期天數"),
    RiskFreeRate(NumericSimple, "無風險利率"),
    Volatility(NumericSimple, "波動率");

input:
    Delta_Out(NumericRef, "Delta"),
    Gamma_Out(NumericRef, "Gamma"),
    Theta_Out(NumericRef, "Theta"),
    Vega_Out(NumericRef, "Vega");

// 計算希臘字母（使用內建函數或自訂邏輯）
Delta_Out = BSDelta(CallPut, UnderlyingPrice, StrikePrice, DaysToExpiry, RiskFreeRate, 0, Volatility);
Gamma_Out = BSGamma(CallPut, UnderlyingPrice, StrikePrice, DaysToExpiry, RiskFreeRate, 0, Volatility);
Theta_Out = BSTheta(CallPut, UnderlyingPrice, StrikePrice, DaysToExpiry, RiskFreeRate, 0, Volatility);
Vega_Out = BSVega(CallPut, UnderlyingPrice, StrikePrice, DaysToExpiry, RiskFreeRate, 0,  Volatility);
```

## 🚨 常見錯誤與修正

### ❌ 錯誤 1：忘記使用 NumericRef

```delphi
// ❌ 錯誤：無法回傳數值
input: Result(Numeric);
Result = Average(Price, Length);
```

**修正：**

```delphi
// ✅ 正確：使用 NumericRef
input: Result(NumericRef);
Result = Average(Price, Length);
```

### ❌ 錯誤 2：陣列未宣告大小變數

```delphi
// ❌ 錯誤：無法知道陣列大小
input: MyArray(NumericArray);
```

**修正：**

```delphi
// ✅ 正確：使用 [X] 宣告大小變數
input: MyArray[X](NumericArray);

for Value1 = 1 to X begin
    // 使用 MyArray[Value1]
end;
```

### ❌ 錯誤 3：參數類型不匹配

```delphi
// ❌ 錯誤：Length 宣告為 Series 但只需要單一值
input: Length(NumericSeries);
```

**修正：**

```delphi
// ✅ 正確：使用 NumericSimple
input: Length(NumericSimple);
```

## 💡 xs-helper 最佳實踐

### 通用注意事項

1. **命名規範**：`input` 和 `var` 名稱前都加上 `_`
2. **函數優先**：優先使用 XS 內建函數
3. **參數類型定義清晰**：一定要正確宣告 Series/Simple/Ref

### 函數腳本專屬注意

- **NumericRef 回傳**：需要回傳的參數使用 `NumericRef`
- **參數類型比對**：Series 傳入序列、Simple 傳入單一數值
- **陣列參數設計**：使用 `[X]` 宣告大小變數

## 📚 官方範例索引

### XScript Preset 函數範例

**資源位置：** `references/xscript_preset/函數/`

#### 📦 14 個功能類別

- **Array函數**：陣列操作函數
- **交易相關**：部位、成交相關函數
- **價格取得**：價格資料取值函數
- **價格計算**：價格運算函數
- **價格關係**：價格比較函數
- **技術指標**：封裝好的指標函數
- **排行**：rank 相關函數
- **日期相關**：時間處理函數
- **期權相關**：BS 模型、希臘字母等
- **統計分析**：數學統計函數
- **趨勢分析**：趨勢判斷函數
- **跨頻率**：跨頻率輔助函數
- **邏輯判斷**：數學邏輯函數
- **量能相關**：成交量處理函數

### 學習路徑建議

#### 初學者

1. 📊 **學習**：技術指標類 - 理解 NumericRef 回傳
2. 📈 **學習**：價格計算類 - 理解Series/Simple

#### 進階者

1. 📦 **學習**：Array函數 - 陣列操作
2. 🔄 **學習**：跨頻率函數 - 進階應用

#### 專家

1. 📊 **研究**：期權相關 - BS 模型實作
2. 🔍 **研究**：統計分析 - 進階數學函數

## 📚 參考資源

- **官方範例**: [函數腳本範例](../../references/examples_index.md#函數腳本)
- **XS 語法手冊**: [XS 語法手冊](https://xshelp.xq.com.tw/XSHelp/)
- **內建函數**: `說明/內建.md` (內建函數完整說明)
- **系統函數**: `說明/系統.md` (系統功能與跨頻率函數)
- [函數參數類型說明](https://xshelp.xq.com.tw/XSHelp/lists?a=DECLARATION)
- [NumericRef 說明](https://xshelp.xq.com.tw/XSHelp/api?a=NumericRef&b=declaration)
- [選擇權希臘字母應用](https://www.xq.com.tw/lesson/xspractice/)

### 本地資源

- **官方範例集：** `references/xscript_preset/函數/`
- **14 個功能類別**
- **完整的函數封裝範例**

### 系統內建函數範例

可參考 XQ 系統內建函數：

- `Average` - 移動平均
- `BSDelta` - Black-Scholes Delta
- `Stochastic` - KD 指標
- `MACD` - MACD 指標

## ✅ 撰寫檢查清單

- [ ] 所有 input 參數都有正確的類型定義
- [ ] 需要回傳的參數使用 `NumericRef` / `StringRef` / `TrueFalseRef`
- [ ] 陣列參數宣告包含大小變數 `[X]` 或 `[X, Y]`
- [ ] 參數類型符合實際使用（Series vs Simple）
- [ ] 參數都有中文命名（第三個參數）
- [ ] 函數邏輯清晰、易於理解
- [ ] 關鍵計算邏輯有繁體中文註解
- [ ] 已測試函數在不同腳本類型中的呼叫
