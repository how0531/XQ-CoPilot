---
name: 選股腳本專家
description: 專門處理 XS 選股腳本的撰寫，包含 rank 排行語法、OutputField 輸出欄位、跨商品篩選等
---

# 選股腳本專家 Skill

## 🎯 專長領域

專門處理 XS 選股腳本（Stock Picker Script）的撰寫，確保符合選股中心的執行規範與排行邏輯。

## 📋 核心規範

### 1️⃣ 基本選股語法

```delphi
// 符合條件才選取
if (篩選條件) then ret = 1;

// 輸出自訂欄位
outputField1(GetField("月營收", "M"), "月營收");
outputField2(GetField("本益比", "D"), "本益比");
```

### 2️⃣ Rank 排行語法（重要）

#### 基本結構

```delphi
rank myRank begin
    Value1 = Average(Close, 10);
    retval = (Close - Value1);  // retval 是排行依據
end;

// 使用排行結果篩選
if myRank.pos <= 100 then ret = 1;  // 前 100 名
```

#### Rank 物件屬性

| 屬性       | 說明                            | 範例              |
| ---------- | ------------------------------- | ----------------- |
| `pos`      | 排行名次（1=第一名）            | `myRank.pos`      |
| `range`    | 排行 %（pos / 總數 \* 100）     | `myRank.range`    |
| `pr`       | Percentile Rank %（100=第一名） | `myRank.pr`       |
| `count`    | 參與排行的商品個數              | `myRank.count`    |
| `value`    | retval 回傳數值                 | `myRank.value`    |
| `avgvalue` | 所有商品 value 的平均值         | `myRank.avgvalue` |
| `medvalue` | 所有商品 value 的中位數         | `myRank.medvalue` |

#### Rank 語法注意事項

**🚨 強制規則：**

##### 1. Rank 只支援選股腳本

```delphi
// ✅ 選股腳本可用
// ❌ 指標、交易、警示腳本不可用
```

##### 2. Rank 物件名稱不可重複

```delphi
// ❌ 錯誤：與變數名稱重複
var: myRank(0);
rank myRank begin
    retval = Close;
end;

// ✅ 正確：名稱不重複
rank myRank1 begin
    retval = Close;
end;
rank myRank2 begin
    retval = Volume;
end;
```

##### 3. Rank 必須放在最上層

```delphi
// ❌ 錯誤：放在 if 內
if close > open then begin
    rank myRank begin
        retval = Close;
    end;
end;

// ✅ 正確：放在最上層
rank myRank begin
    retval = Close;
end;

if close > open and myRank.pos <50 then ret = 1;
```

##### 4. Rank 是獨立空間，無法傳入外部變數

```delphi
// ❌ 錯誤：無法使用外部 input
input: len(10);
rank myRank begin
    Value1 = Average(Close, len);  // len 無法傳入
    retval = (Close - Value1);
end;

// ✅ 正確：rank 內另行宣告
rank myRank begin
    var: _len(10);
    Value1 = Average(Close, _len);
    retval = (Close - Value1);
end;
```

##### 5. 可使用前面其他 Rank 的結果

```delphi
// Alpha 13 因子範例
rank rank_close begin
    retval = close;
end;

rank rank_volume begin
    retval = volume;
end;

// 使用前面 rank 的結果
rank rank_alpha_13 begin
    retval = Covariance(rank_close.pr, rank_volume.pr, 5);
end;

ret = 1;
OutputField1(rank_alpha_13.value, "相關性");
```

##### 6. Rank 預設大到小，可用 desc/asc 控制

```delphi
// 大到小（預設）
rank myRank1 desc begin
    retval = Close;
end;

// 小到大
rank myRank2 asc begin
    retval = Close;
end;
```

##### 7. Rank 排行結果是序列

```delphi
rank myRank begin
    retval = Close;
end;

// 篩選出前期排行與當期排行不同的商品
if myRank.pos[1] <> myRank.pos then ret = 1;
```

### 3️⃣ OutputField 輸出欄位

```delphi
// 基本輸出
outputField1(GetField("月營收", "M"), "月營收");
outputField2(GetField("本益比", "D"), "本益比");

// 輸出排行（order:=1 表示由大到小排序）
outputField3(value888, "大單買超", order:=1);
```

### 4️⃣ 資料長度判斷 (GetFieldStartOffset)

**用途：** 判斷個股某欄位的歷史資料起始點（例如：上市多久、營收資料長度）。
**限制：** 僅支援選股腳本。

**語法：** `GetFieldStartOffset("欄位名稱", "頻率")`

- 回傳值：目前 K 棒距離該欄位起始點的 K 棒數。

**常見誤區 (CRITICAL)：**

- ❌ **不可用於計算由進場持有至今的天數**。
- ✅ **正確用途**：過濾上市時間不足的新股、確保長週期指標有足夠數據。

**範例：排除上市未滿 100 天的新股**

```delphi
value1 = GetFieldStartOffset("收盤價", "D");
if value1 < 100 then return; // 資料不足 100 天則跳過
```

**範例：檢查「月營收」是否創掛牌後新高**

```delphi
value1 = GetFieldStartOffset("月營收", "M");

if value1 = 0 then begin
    ret = 1;  // 只有 1 期，當成創新高
    outputField1(GetField("月營收", "M"), "月營收");
end else if value1 > 0 then begin
    // 算出前 N 期的最大值
    value2 = Highest(GetField("月營收", "M")[1], value1);
    if GetField("月營收", "M") > value2 then ret = 1;
    outputField1(GetField("月營收", "M"), "月營收");
end;
```

**⚠️ 注意：**

- `GetFieldStartOffset` 目前僅支援選股腳本
- 第一筆資料位置依公司上市櫃日期決定（不含興櫃期間）

## 🔧 常見應用模板

### 📊 營收創新高

```delphi
value1 = GetFieldStartOffset("月營收", "M");

if value1 > 0 then begin
    value2 = Highest(GetField("月營收", "M")[1], value1);
    if GetField("月營收", "M") > value2 then begin
        ret = 1;
        outputField1(GetField("月營收", "M"), "月營收");
        outputField2(GetFieldDate("月營收", "M"), "資料日期");
    end;
end;
```

### 📈 大單買超排行

```delphi
value801 = GetField("買進特大單量", "D") + GetField("買進大單量", "D");
value802 = GetField("賣出特大單量", "D") + GetField("賣出大單量", "D");
value888 = value801 - value802;

// 大單買超 = (買進特大單+買進大單)-(賣出特大單+賣出大單) > 0
if value888 > 0 then ret = 1;

outputField1(value888, "大單買超由大到小排名", order:=1);
```

### 🌟 多重條件篩選 + 排行

```delphi
// 宣告排行
rank revRank begin
    var: _len(10);
    retval = GetField("月營收", "M");
end;

// 條件 1：月營收前 50 名
condition1 = revRank.pos <= 50;

// 條件 2：本益比 < 15
condition2 = GetField("本益比", "D") < 15 and GetField("本益比", "D") > 0;

// 條件 3：近 5 日平均量 > 1000 張
condition3 = Average(GetField("成交量", "D"), 5) > 1000;

// 篩選
if condition1 and condition2 and condition3 then ret = 1;

// 輸出
outputField1(revRank.value, "月營收");
outputField2(revRank.pos, "月營收排名");
outputField3(GetField("本益比", "D"), "本益比");
outputField4(Average(GetField("成交量", "D"), 5), "近5日均量");
```

### 🔍 Alpha 101 因子範例

```delphi
// Alpha 13 = -1 * rank(covariance(rank(close), rank(volume), 5))
// 邏輯：若過去 5 日 close 排名與 volume 排名正相關則賣出，負相關則買進

// 收盤價排行
rank rank_close begin
    retval = close;
end;

// 成交量排行
rank rank_volume begin
    retval = volume;
end;

// 兩者相關性排行
rank rank_alpha_13 begin
    retval = Covariance(rank_close.pr, rank_volume.pr, 5);
end;

ret = 1;
OutputField1(rank_alpha_13.value, "相關性");
OutputField2(rank_alpha_13.pos, "相關性排名");
```

## 🚨 常見錯誤與修正

### ❌ 錯誤 1：選股腳本使用分鐘頻率 GetField

```d elphi
// ❌ 錯誤：選股腳本不支援分鐘頻率
value1 = GetField("內盤量", "1");  // 選股引擎不支援分鐘回溯
```

**修正：**

```delphi
// ✅ 正確：使用日線或更長頻率
value1 = GetField("內盤量", "D");
```

### ❌ 錯誤 2：Rank 内使用外部變數

```delphi
// ❌ 錯誤
input: _Length(10);
rank myRank begin
    retval = Average(Close, _Length);  // 無法使用外部 input
end;
```

**修正：**

```delphi
// ✅ 正確：rank 內另行宣告
rank myRank begin
    var: _Length(10);
    retval = Average(Close, _Length);
end;
```

### ❌ 錯誤 3：OutputField 沒有命名

```delphi
// ❌ 錯誤：沒有命名
outputField1(GetField("月營收", "M"));
```

**修正：**

```delphi
// ✅ 正確：加上中文名稱
outputField1(GetField("月營收", "M"), "月營收");
```

## 💡 xs-helper 最佳實踐

### 通用注意事項

1. **命名規範**：`input` 和 `var` 名稱前都加上 `_`
2. **var 宣告限制**：var 只可以包含變數名稱與初始值
3. **函數優先原則**：優先使用 XS 內建函數
4. **序列存取方式**：使用方括號 `[]` 加索引值
5. **首根 K 棒判斷**：不要用 `newday`，用 `Date <> Date[1]`
6. **跨頻率取值**：直接用 `GetField`，不要用變數暫存

### 選股腳本專屬注意

- **rank 區塊限制**：rank 是獨立空間，無法傳入外部參數和變數
- **無法使用 input 值**：rank 內需重新宣告變數
- **可建立變數**：名稱可與外部相同，但建議使用不同名稱
- **頻率限制**：選股腳本不支援分鐘頻率 GetField

## 📚 官方範例索引

### XScript Preset 選股範例

**資源位置：** `references/xscript_preset/選股/`

#### 📚 00.語法範例（19 個基礎範例）

**必讀範例：**

- `_基本範例.xs` - 選股腳本基礎結構
  - 學習重點：ret = 1 用法、OutputField 輸出
  - 包含：完整的選股邏輯說明

**技術指標範例：**

- `N期股價趨勢向上.xs` - 價格趨勢判斷
- `收盤價近N期漲幅大於X%以上.xs` - 漈跌幅過濾

**基本面範例：**

- `EPS連續N季成長.xs` - 盈餘成長篩選
- `最近4季EPS合計大於X元.xs` - EPS 篩選
- `本益比小於X倍.xs` - 本益比篩選
- `月營收創N期新高.xs` - 營收創高

**技術指標範例：**

- `股價大於近N期平均.xs` - 均線篩選
- `週轉率大於X%.xs` - 流動性篩選

#### 🔍 01.常用過濾條件

包含常見的篩選條件：

- 價格過濾（高低點、收盤價範圍）
- 量能過濾（成交量、量比）
- 市值過濾（大型、中型、小型股）

#### 📊 02.基本技術指標

基於技術指標的選股：

- KD 指標篩選
- MACD 指標篩選
- RSI 指標篩選
- 均線系統篩選

#### 🎯 03.進階技術分析

進階技術分析策略：

- 背離型態
- 躁隨想應策略
- 波浪理論應用

#### 💰 04-11.專題選股

- **04.價量選股**：價量關係、量增價漲等
- **05.型態選股**：K棒型態、範例
- **06.籌碼選股**：法人買超、融資券等
- **07.月營收選股**：營收成長、創新高等
- **08.財報選股**：EPS、ROE、毛利率等
- **09.時機操作**：低接、高出時機
- **10.價值投資**：深度價值分析
- **11.選股機器人**：綜合選股系統

### 學習路徑建議

#### 初學者（第 1-2 週）

1. 📚 **必讀**：`00.語法範例/_基本範例.xs`
2. 📊 **練習**：基本技術指標篩選（KD、MACD）
3. 💰 **練習**：簡單的價量篩選

#### 進階者（第 3-4 週）

1. 📈 **學習**：月營收選股、財報選股
2. 🎯 **學習**：進階技術分析
3. 🔍 **練習**：多條件組合篩選

#### 專家（第 5 週以上）

1. 🤖 **研究**：選股機器人資料夾
2. 📊 **研究**：rank 排行進階應用
3. 🚀 **實戰**：回測驗證、優化參數

## 📚 參考資源

- **官方範例**: [選股腳本範例](../../references/examples_index.md#選股腳本)
- **XS 語法手冊**: [XS 語法手冊](https://xshelp.xq.com.tw/XSHelp/)
- **選股欄位**: `說明/選股.md` (GetField 完整欄位列表)
- **進階語法**: `說明/XS語法運用.md` (Rank 排行語法詳解)
- **資料欄位**: `說明/資料.md` (基本面資料欄位速查)
- [排行語法教學](https://www.xq.com.tw/lesson/xspractice/%E6%8E%92%E8%A1%8C%E8%AA%9E%E6%B3%95/)
- [創掛牌新高語法](https://www.xq.com.tw/lesson/xspractice/%E9%81%B8%E8%82%A1%E4%B8%AD%E5%BF%83/)
- [GetFieldStartOffset 說明](https://xshelp.xq.com.tw/XSHelp/)

### 本地資源

- **官方範例集：** `references/xscript_preset/選股/`
- **12 個專題資料夾**
- **完整的選股策略範例**

### 系統內建選股範例

可參考選股中心系統內建策略：

- 價值投資 → 巴菲特概念stock
- 成長投資 → 營收創新高
- 籌碼選股 → 大單買超

## ✅ 撰寫檢查清單

- [ ] 所有 rank 物件都放在最上層（非 if/for 內）
- [ ] rank 物件名稱不與變數/參數重複
- [ ] rank 內使用的變數都在 rank 內宣告
- [ ] 所有 outputField 都有中文名稱
- [ ] 未使用分鐘頻率的 GetField
- [ ] 使用 `ret = 1` 標記符合條件的商品
- [ ] input 參數都有 `_` 前綴且有中文描述
- [ ] 關鍵邏輯有繁體中文註解
- [ ] 已設定 SetBarBack 與 SetTotalBar 確保數據足夠
