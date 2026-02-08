# XS 語法運用

## 排行語法

「排行語法」讓使用者可直接在選股腳本中撰寫排行條件，無需額外撰寫函數腳本，並可靈活運用不同的排行名次作為篩選條件。

### 語法

#### 基礎範例

```xs
rank myRank begin
    Value1 = Average(Close, 10);
    retval = (Close - Value1);
end;

if myRank.pos <= 100 then ret = 1;
OutputField1(myRank.value);
```

上面範例中，使用了 rank 宣告了 myRank 的物件，並將收盤價和移動平均線的差距來當作排行的條件。 接著透過呼叫 myRank 物件的 pos 屬性，將前一百名的商品篩選出，並使用 OutputField 將符合條件商品的收盤價和移動平均線差距輸出。

> [!NOTE]
> rank 語法只支援選股腳本，其他的腳本都無法使用。

每個排行透過 rank 函數宣告排行物件，並在 begin 到 end 區塊內撰寫排行條件所需的計算數值，最後透過 retval 回傳作為排行依據的數值，預設為由大到小。 當 rank 物件運算完成後，即可使用其屬性來進行排序與篩選等相關操作。

以下為 rank 物件支援的屬性：

- **pos**: 排行名次，整數，從 1 開始，1 是第一名。
- **range**: 排行 %，等於 pos / <參與排行商品數> \* 100。這是一個實數 (有小數點)，數值範圍介於 0 ~ 100 之間，越小排名越前面。
- **pr**: Percentile Rank %。PR = (N - pos) / (N - 1) \* 100。這是一個實數，數值範圍介於 100 ~ 0 之間，第一名是 100，PR95 表示是 95% 之前。
- **count**: 參與排行的商品個數。這個數值對任何一檔商品而言都是固定的。
- **value**: rank object 的回傳數值，也就是 retval 的回傳數值。
- **avgvalue**: 所有商品 rank.value 的平均值。可以使用這個數值來決定目前商品是否是在平均值以上或是平均值以下。這個數值對任何一檔商品而言都是固定的。
- **medvalue**: 所有商品 rank.value 的中位數 (median value)。可以使用這個數值來決定目前商品是否是在中位數以上或是中位數以下。這個數值對任何一檔商品而言都是固定的。

### rank 語法的注意點

**一、同個腳本當中可以有多個 rank 物件，但每個物件的名稱不能和彼此、腳本中變數以及參數重複。**

(X) 錯誤的案例：

```xs
var: myRank(0);
rank myRank begin
    Value1 = Average(Close, 10);
    retval = (Close - Value1);
end;
```

(O) 正確的案例：

```xs
rank myRank1 begin
    retval = Close;
end;
rank myRank2 begin
    retval = Volume;
end;
```

**二、rank 物件不能夠放在任何的條件或是 begin … end 之間，需要放在最上面一層。**

(X) 錯誤的案例：

```xs
if close > open then begin
    rank myRank begin
        Value1 = Average(Close, 10);
        retval = (Close - Value1);
    end;
end;
```

排行的結果是一個序列。

```xs
rank myRank begin
    retval = Close;
end;
if myRank.pos[1] <> myRank.pos then ret = 1;
//篩選出前期排行與當期排行不同的商品
```

**三、rank 排行預設為大到小，但可以透過 desc 和 asc 來設定是大到小還是小到大。**

```xs
//大到小
rank myRank1 desc begin
    retval = Close;
end;

//小到大
rank myRank2 asc begin
    retval = Close;
end;
```

**四、rank 物件內是獨立空間，無法傳入腳本他處的參數和變數。**

rank 物件使用的變數需另行在 rank 區間內宣告 (亦可使用內建的 Value1 等變數)。 變數即使有相同的名字，但不會互相影響 (內建變數亦相同)。

(X) 錯誤的案例：

```xs
//錯誤訊息要特別註明
Input: len(10);
rank myRank begin
    Value1 = Average(Close, len);
    retval = (Close - Value1);
end;
```

(O) 正確的案例：

```xs
//編譯時禁止 rank 內宣告相同名稱的變數
var: _price(0);
_price = Open;
rank myRank begin
    var: _price(0);
    _price = Average(Close, 10);
    retval = (Close - _price);
end;
// rank 物件內 _price 會是 10 期收盤價移動平均值，物件外的 _price 會是開盤價
```

**五、rank 內雖然不能夠使用外部的參數變數，但可以使用前面其他 rank 運算出來的結果。**

舉例來說，在 Alpha 101 的因子內，有些因子會需要針對某些排行結果再做另外一次排行。其中 Alpha 13＝-1 \* rank(covariance(rank(close), rank(volume), 5))，這個因子的邏輯是：

首先統計過去 5 日每一日 close 在母體內排名以及每一日 volume 在母體內的排名。 如果這 5 日的排名正相關的話 (>1)，那就賣出這檔股票，如果是負相關的話 (<-1)，那就買進這檔股票。注意到這個因子必須針對過去 5 日的排行數值的運算結果 (covariance) 再做一次排行。以下是模擬 Alpha 13 的腳本範例：

```xs
//收盤價排行

rank rank_close begin
    retval = close;
end;

//成交量排行

rank rank_volume begin
    retval = volume;
end;

//上述兩個排行的相關性

rank rank_alpha_13 begin
    retval = Covariance(rank_close.pr, rank_volume.pr, 5);
end;
ret = 1;

OutputField1(rank_alpha_13.value, "相關性");
```

## 商品清單功能

目前 XS 語法可透過 GetSymbolField 取得不同商品的資料欄位，但在指定商品的狀況下僅能透過 Input 參數或直接輸入商品代號字串，當需要處理大量商品時，腳本撰寫會變得相對複雜 。

此次更新新增了商品清單功能，使用者可在 Input 參數中設定所需的商品清單，或透過新建立的 Group 語法獲取指定商品的成分股、期貨或可轉債等商品清單，並搭配 GetSymbolField 快速取得所需資訊。

### 語法說明

#### 透過 Input 宣告清單

```xs
Input: myGroup(Group);
Var: _TF(False);

Value1 = GetSymbolField(myGroup[1], "Close", "D");
_TF = GetSymbolInfo(myGroup[1], "可放空");
```

上述範例使用 Input 語法宣告了一個清單 myGroup ，允許在指標或策略中設定所需的商品清單 。 myGroup 是一個陣列，存放清單中的商品代號，並可透過 [N] 來取得陣列中第 N 個商品代號 。 GetSymbolField 和 GetSymbolInfo 在這次修改中增加支援 Group 清單的功能 （ 需注意還是無法使用變數指定商品代碼 ） 。

從 Input 宣告的 Group 有四種方法可以設定清單 ：

- **商品**： 使用者自行輸入所需商品
- **組合**： 使用者選擇所需的組合 （ 包含自選股 ）
- **選股**： 使用者選擇一個選股中心策略 （ 選股中心策略不能選擇其他選股中心的策略 ）
- **檔案**： 使用者選擇一個外部傳入的檔案 （ 支援 .txt 和 .csv ）

以上四種設定方式與目前策略雷達和自動交易中心中設定執行商品的方式相同 。

#### 透過 Group 宣告清單

```xs
Group: myGroup();
Var: _TF(False);

myGroup = GetSymbolGroup("TSE23.TW", "成分股");

Value1 = GetSymbolField(myGroup[1], "Close", "D");
_TF = GetSymbolInfo(myGroup[1], "可放空");
```

上述範例使用 Group 語法宣告了一個清單 myGroup ，接著再透過 GetSymbolGroup 來取得指定商品的成分股 。

GetSymbolGroup 可用來取得系統內建的商品清單 。

第一個參數指定要取得清單的商品，例如範例中的 TSE23.TW 。 若未指定商品，則預設取得目前執行商品的清單 （ 前提是該清單存在 ） 。 第二個參數指定所需的清單類型，例如範例中的 成分股 ，此參數為必填 。以下為支援的清單類型 ：

- **成分股**: 指數商品、細產業商品回傳指數 ／ 細產業指數的成分股清單。 (支援台灣市場。指數的範圍為交易所公佈的類股指數，以及XQ所編制的細產業指數 (包含族群)，例如TSE11.TW。 不包含TSE.TW、OTC.TW這種全市場的指數。)
- **權證**: 股票回傳此商品的所有權證商品。(支援台股)
- **股期**: 指數 ／ 股票回傳此商品的所有期貨。(支援台灣市場)
- **可轉債**: 股票回傳此商品的所有可轉債商品。(支援台股)
- **選擇權**: 指數 ／ 股票回傳此商品的所有選擇權。(支援台灣市場。註： 在走勢圖 ／ 技術線圖上的商品名稱點擊右鍵，可確認該商品支援的相關清單類型 )

#### 指標腳本的清單選單

```xs
Input:cb_id("", inputKind:=SymbolGroup("CB"), quickedit:=true);
value1 = GetSymbolField(cb_id, "Close");
value2 = GetSymbolField(cb_id, "Volume");
plot1(value1, "CB走勢");
plot2(value2, "CB成交量");
```

在指標腳本中，若希望使用者能在介面上直接選擇所需的清單商品，可以在 Input 宣告時一併傳入清單類型 。

這樣一來，在技術分析頁面中，使用者即可透過選單快速切換執行商品對應的清單類型 。 例如上述範例中，若執行商品對應到多個可轉債，使用者便能透過選單切換，輕鬆繪製可轉債的價格與成交量 。

#### 搭配清單使用的函數

```xs
Value1 = GroupSize(myGroup);
```

GroupSize 會回傳商品清單包含的數量 。 可以此數值避免取用到超出陣列範圍的資料而導致錯誤 。

### 使用範例

#### 盤中漲幅排行 [警示腳本]

```xs
input: _S(group, "排行股票");
Array: rankRT[2000, 2](-9999);

SetTotalBar(10);
value1 = GroupSize(_S);

//將清單的 商品代碼 以及 漲跌幅 的數值放入陣列中

for value2 = 1 to value1 begin
    value3 = 100 * (getsymbolField(_S[value2], "Close", default = 0)
    - getsymbolField(_S[value2], "參考價", "D", default = 0))
    / getsymbolField(_S[value2], "參考價", "D", default = 1);
    rankRT[value2, 1] = strtonum(leftStr(_S[value2], 4));
    rankRT[value2, 2] = value3;
end;

//將陣列依據漲跌幅排序後印出
Array_Sort2d(rankRT, 1, value1, 2, false);
print("==========漲跌幅前10==========");
print("日期時間：", numtostr(datetime, 0));
for value2 = 1 to 10 begin
    print(text("排名", numtostr(value2, 0), "商品: "),
    text(numtostr(rankRT[value2, 1], 0), ".TW"),
    " / 漲跌幅: ", rankRT[value2, 2]);
end;

print("==============================");
if symbol = text(numtostr(rankRT[1, 1], 0), ".TW") then ret = 1;
```

上述腳本中宣告了一個清單 （ 設定為需要盤中即時排序的商品 ） 和陣列，並將清單內的商品代號和漲跌幅存入陣列後進行排序 。

#### 指數成分股的營收加總 [指標腳本]

```xs
group: _symbolGroup();
var: _sum(0), _num(0);

_symbolGroup = GetSymbolGroup("成分股");
value1 = GroupSize(_symbolGroup);

_sum = 0;
_num = 0;
for value2 = 1 to value1 begin
    if CheckSymbolField(_symbolGroup[value2], "月營收", "M") then begin
        _sum += GetSymbolField(_symbolGroup[value2], "月營收", "M");
        _num += 1;
    end;
end;

plot1(_sum);
SetPlotLabel(1, "成分股月營收");
plot2(_num);
SetPlotLabel(2, "有月營收家數");
plot3(value1);
SetPlotLabel(3, "成分股家數");
```

使用者可將執行商品設為指數商品 （ 如 TSE23.TW ） ，並透過 \_symbolGroup 取得該指數對應的成分股清單 。

接著使用 CheckSymbolField 判斷指定成分股的月營收欄位是否存在，加總月營收和計算有資料的成分股數量，最後將其畫出 。

#### 對應選擇權的成交金額加總 [指標腳本]

```xs
group: _list();
var: _uSum(0), _dSum(0), _count(0), _cp("");

_list = getsymbolgroup("選擇權");

_uSum = 0; //買權加總
_dSum = 0; //賣權加總
_count = 0;
for value1 = 1 to groupSize(_list) begin
    if getsymbolField(_list[value1], "Date", "Tick", default:= 0) = getfield("Date", default:= -999999) then begin
        _cp = getsymbolinfo(_list[value1], "買賣權");
        if _cp = "CALL" then _uSum += getsymbolField(_list[value1], "Close", "Tick", default:=0) * getsymbolField(_list[value1], "Volume", "Tick", default:=0) * 2000;
        if _cp = "PUT" then _dSum += getsymbolField(_list[value1], "Close", "Tick", default:=0) * getsymbolField(_list[value1], "Volume", "Tick", default:=0) * 2000;
    end;
end;

plot1(_uSum, "近一筆買權權利金加總金額");
plot2(_dSum, "近一筆賣權權利金加總金額");
```

這個腳本會加總執行商品該日最近一筆買進權利金的交易金額 （ 買權賣權分開加總 ） ，並將這些總額繪製出來 。 透過觀察這個總額的變化，可以推測市場對該執行商品價格漲跌的看法，就像「以權追股」的功能一樣 。

如果想要根據成交量判斷是否有大額交易，或者只加總最近一段時間的成交金額，可以在腳本中的 For 迴圈部分進行修改 。

## GetField 預設值

使用者在取得資料欄位時，有時會遇到資料尚未更新或欄位缺失的情況，這可能導致回測或執行時發生錯誤。 為避免此類問題，GetField 欄位新增了預設值參數，當資料缺失時，可回傳指定的預設值，確保策略順利執行。 除了預設值以外，還有其他函數可用來判斷欄位是否可用以及欄位名稱等參數是否正確。

### 語法說明

#### default

```xs
Value1 = GetField("大戶持股比例", "W", default := 0);
Value2 = GetSymbolField("2330.TW", "大戶持股比例", "W", default := Value2[1]);
```

GetField / GetSymbolField 在傳入參數時，現在可額外加上 default 參數。 此參數可以是固定數值 （ 如上方範例 0 ） 或是變數 （ 如上方範例 Value2[1] ）。

當欄位資訊輸入正確時，以下情境支援預設值：

- 資料尚未更新。
- 資料中間有空值。
- 資料讀取範圍內沒有資料。
- 資料序列為空。 (例如： 從未發生不定期欄位事件的商品。)

以下情境則不支援預設值：

- 取未來值。
- 回測頻率為 1 分鐘逐筆洗價取 Tick 或是分鐘頻率資料欄位，因無法對位故會發生錯誤。
- 不支援的商品 ／ 頻率。
- 回測範圍內沒有發生過不定期欄位的事件。 （ 會回最新一筆 ）

#### CheckField

```xs
CheckField("外盤量", "D");
CheckSymbolField("TSE.TW", "外盤量");
```

CheckField / CheckSymbolField 會依據傳入的商品代碼、欄位和頻率來判斷該資料是否能夠取用，回傳 True / False。

#### IsSupportField

```xs
IsSupportField("月營收", "M");
IsSupportSymbolField("TSE.TW", "月營收");
```

IsSupportField / IsSupportSymbolField 可根據傳入的商品代碼、欄位和頻率，判斷指定的欄位是否存在，回傳 True / False。

需注意此函數並不會判斷對應 K 棒上是否有資料，只會判斷欄位是否存在。

因此，可能會發生函數回傳 True ，但該根 K 棒上沒有資料的情況。

## XS美股新增欄位列表

7.12.01 / 3.12.01 版本，新增支援美國市場的 XS 欄位列表，分為「選股、資料、商品資訊欄位」。

支援美國市場的選股欄位，此次有 71 個，包含：

- **常用、價格**: 本益比、股價淨值比、殖利率
- **常用、財務**: 營業毛利率、股東權益報酬率、每股稅後淨利(元)
- **價格**: 貝他值、SHARPE、Treynor、Jensen、1~10年標準差
- **籌碼**: ETF規模、機構持股、機構持股比重、內部人持股及異動
- **基本**: 投資建議評級、員工人數、現金股利、公司成立日期、總市值(元)
- **財務**: 流動資產、長期投資、固定資產、無形資產、資產總額、負債總額、普通股股本、股東權益總額、營業收入淨額、營業成本、營業毛利、營業利益、稅前淨利、本期稅後淨利、加權平均股數、EBITDA、營業利益率、稅前淨利率、稅後淨利率、每股淨值(元)、資產報酬率、流動比率、速動比率、負債比率、現金流量(投資/營運/理財)、自由現金流量營收比、營運資金、當期財報截止日、總流通在外股數、EPS預估值、EPS法說公佈值、稀釋後每股淨利、年報酬率等。
- **事件日期**: 除權日期、除息日期、股利年度、除權年度、除息年度、除息值、除權值

支援美國市場的資料欄位，此次有 9 個：

- 總成交次數、機構持股、內部人持股異動、內部人持股、機構持股比重、本益比、殖利率、投資建議評級

支援美國市場的商品資訊欄位，此次有 7 個：

- 交易所、ETF分類、到期日、票面利率、面額、ETD、第一個回購日

## XS美股欄位的使用介紹

在 7.12.01 / 3.12.01 版本（簡稱 \*.12.01）XS 將新增 71 個美股選股欄位與 9 個美股資料欄位，讓大家可以獲取更多美股資訊，進行更多元的投資策略佈局。

### 基本面欄位

美股基本面的XS選股欄位，在 \*.12.01 版本有：殖利率、 總市值(元)、 現金股利。我們可以使用「殖利率」選股欄位，製作美股市場的「殖利率」排行榜。

**範例：製作美股「殖利率」排行榜**

第一步：在 XS 編輯器，新增「\_YieldRank」函數腳本，程式碼如下

```xs
Retval = GetField("殖利率", "D");
```

第二步：在 XS 編輯器，新增「殖利率相關資訊」選股腳本，程式碼如下

```xs
Ret = 1;
outputField1(GetField("殖利率", "D"),"殖利率");
outputField2(GetFielddate("殖利率", "D"),"殖利率資料日期");
outputField3(GetField("現金股利", "Y"),"現金股利");
outputField4(GetFielddate("現金股利", "Y"),"現金股利資料日期");
outputField5(GetField("總市值(元)", "D"),"總市值(元)");
outputField6(GetFielddate("總市值(元)", "D"),"總市值(元)資料日期");
```

### 財報欄位

美股財報的選股欄位，在 \*.12.01 版本，共新增 71 個美股的 XS 選股欄位，也有新增相關的內建選股條件，方便大家直接加入使用。

### 籌碼欄位

美股的籌碼欄位，在 \*.12.01 版本，新增 5 個美股的選股欄位，與 4 個美股的資料欄位。
美股市場的籌碼面資料中，比較常見的是「機構持股」與「機構持股比重」這種依美國證券交易委員會規定每季公告的「SEC Form 13F」數據。

**範例：「XS自訂指標\_機構持股」**

```xs
//因為繪圖設定→查價視窗→數值顯示→%，會自動 × 100，所以該數值要 / 100，才會在顯示正確 % 數值。
plot1(GetField("機構持股比重", "Q")/100,"比重",Checkbox:=1);
plot2(GetField("機構持股", "Q"),"數值",Checkbox:=0);
```

## 取得資料欄位時的「對位問題」

### 變數的對位方式

很多 XQ 的資深用戶，經常使用「變數(Variable)」這個概念。尤其是當我們想要進行重複性較高的運算式時，通常都會將資料欄位包入變數。

例如用戶想要計算近 4 期的月營收平均，於是寫出下方 XS 代碼：

```xs
// 計算 近 4 期的月營收平均
Value1 = GetField("月營收", "M");
Value2 = Average(Value1+Value1[1]+Value1[2]+Value1[3], 4);
```

**但由於變數後方的中括號，其實是代表著不同頻率下的資料內容**。

於是，系統將這串 XS 代碼理解成：

- `Value1` = 取得當期K棒日期之變數內容 = GetField("月營收", "M")
- `Value1[1]` = 取得前 1 期K棒日期之變數內容 = GetField("月營收", "M")

**Value1 和 Value1[1] 都會取得相同的欄位資料！**

由於最新一期的月營收尚未公布，而用戶又誤將變數後方的中括號，當作是資料欄位的期數。這時，如果在月營收尚未公布之前，就開始計算 T 日和 T+1 的月營收，用戶就會取得相同的資料，進而導致運算結果在某些時間點可能有誤。

**因此，當我們在使用變數時，要特別留意中括號的意義，以免造成運算結果錯誤唷！**

### 資料欄位的對位方式

那要如何正確地取得資料欄位呢？
其實方法非常簡單，您只需在呼叫資料時，於 GetField 後方加上中括號與期數。

因為您只需要在資料取得時，直接在後方加上中括號。系統就會根據您輸入的 頻率 與 期數，自動判斷您想要取得的欄位資料究竟是第幾期？

- `GetField("月營收", "Ｍ")[1]` = 上一期月頻率的月營收
- `GetField("集保張數", "W")[3]` = 前三期周頻率的集保張數

## 選股中心創掛牌新高與大單欄位的應用

### 創公司掛牌新高的選股條件與語法應用

「創公司掛牌後新高」的判斷方式，是透過這次改版新增的 **GetFieldStartOffset** 語法。這個語法可以讓你抓到這個欄位第一筆的位置，知道這個欄位總共有多少筆之後，腳本就可以很容易的判斷目前最新一期數值到底是不是新高了。

範例：

```xs
value1 = GetFieldStartOffset("月營收", "M");
if value1 = 0 then begin
    ret = 1; // 只有1期, 就當成創新高了吧
    outputField1(GetField("月營收", "M"),"月營收");
end else if value1 > 0 then begin
    // 算出前N期的最大值
    value2 = Highest(GetField("月營收", "M")[1], value1);
    if GetField("月營收", "M") > value2 then ret = 1;
    outputField1(GetField("月營收", "M"),"月營收");
end;
```

> [!NOTE]
> GetFieldStartOffset目前僅支援選股腳本。另外 GetFieldStartOffset 所定義的第一筆資料的位置，是依照公司上市櫃日期所決定的，不包含興櫃期間的資料。

### 大單相關的選股條件與語法應用

在XS選股中心內，新增條件時可以直接找到這些欄位以及相關條件直接使用(包含買進大單量，賣出大單量等)。

範例：篩選大戶買超的股票，大戶的定義是（買進特大單＋買進大單）－（賣出特大單＋賣出大單）＞ 0的股票。

```xs
value801 = GetField("買進特大單量", "D") + GetField("買進大單量", "D");
value802 = GetField("賣出特大單量", "D") + GetField("賣出大單量", "D");
value888 = value801 - value802;
//大單買超 = (買進特大單+買進大單)-(賣出特大單+賣出大單) > 0
if value888 > 0 then ret = 1;
outputField1(value888,"大單買超由大到小排名",order:=1);
```

## 台股逐筆撮合的連續成交Tick序列

逐筆撮合制度上線後產生了「連續成交序列」。
當一筆買進委託對應到多筆賣出委託並成交時，會產生多筆 Tick，但這些 Tick 屬於同一筆主動買盤。

在 Tick 資料內有一個欄位叫做「**TickGroup**」，這個欄位是用來標示這一筆成交資料是怎麼撮合出來的，總共有5種可能的數值：

- **-1**: 表示這一筆成交並不是逐筆撮合所產生的。
- **0**: 表示這一筆成交是逐筆撮合所產生的，只有撮出一筆。
- **1**: 表示這一筆成交是連續成交序列內的第一筆。
- **2**: 表示這一筆成交是連續成交序列內中間的任何一筆。
- **3**: 表示這一筆成交是連續成交序列內的最後一筆。

可以使用 **ReadTicks** 函數來讀取並自動合併連續成交序列：

```xs
input: filterMode(1, "篩選方式", inputkind:=dict(["買盤",1], ["賣盤",-1]));
input: filterVolume(100, "大單門檻");

var: intrabarpersist readtick_cookie(0);// ReadTicks內部使用, 每次呼叫時請照實傳入
array: tick_array[100, 11](0);// 需要宣告一個2維陣列來儲存Tick資料
var: row_count(0), idx(0);

// 讀取Tick資料
row_count = ReadTicks(tick_array, readtick_cookie);
for idx = 1 to row_count begin
    if tick_array[idx, 5] = filterMode and tick_array[idx, 10] >= filterVolume then begin
        ret=1;
    end;
end;
```

ReadTicks讀回的Tick資料會存放在tick_array內，最新的一筆是第一個橫列(row)。每一個row內包含11個欄位(column)：

- 1: 日期
- 2: 時間
- 3: 成交價
- 4: 成交量
- 5: 內外盤註記
- 6: SeqNo
- 7: 連續成交序列總筆數 (合併後)
- 8: 連續成交序列第一筆位置 (合併後)
- 9: 連續成交序列最後一筆位置 (合併後)
- 10: 總成交量 (合併後)
- 11: 總成交金額 (合併後)

## Tick欄位的應用

Tick資料就是每一筆成交資料。從腳本內可以取得每一筆成交資料的詳細資料。

```xs
value1 = GetField("Date", "Tick");   // 成交日期
value2 = GetField("Time", "Tick");   // 成交時間
value3 = GetField("Close", "Tick");  // 成交價格
value4 = GetField("Volume", "Tick"); // 成交單量
value5 = GetField("BidAskFlag", "Tick"); // 內外盤標記: 1代表外盤, -1代表內盤, 0代表中立
value6 = GetField("BidPrice", "Tick"); // 買進價格
value7 = GetField("AskPrice", "Tick"); // 賣出價格
value8 = GetField("SeqNo", "Tick");  // 資料編號
```

**Tick欄位 v.s. 報價欄位**

- **報價欄位** (如 q_Last): 回傳目前最新的行情。
- **Tick欄位**: 系統保證抓到的 Tick 資料跟洗價當時的 K 棒內容是一致的。

如何抓到洗價兩次之間所有的 Tick 資料？利用 SeqNo。

```xs
input: filterMode(1, "篩選方式", inputkind:=dict(["買盤",1], ["賣盤",-1]));
input: filterVolume(100, "大單門檻");

var: intrabarpersist last_seqno(0);// 上次洗價時最後一筆Tick的SeqNo
var: curr_seqno(0);// 這次洗價時最後一筆Tick的SeqNo

if Date <> CurrentDate then return;// 只跑今日的資料

curr_seqno = GetField("SeqNo", "Tick");// 最新一筆Tick編號

if last_seqno = 0 then last_seqno = curr_seqno - 1; // 第一次洗價時只洗當時那一筆

var: seq_no(0), offset(0);
seq_no = curr_seqno;
offset = 0;
while seq_no > last_seqno begin

    // 讀取Tick資料
    value1 = GetField("Time", "Tick")[offset];
    value2 = GetField("Close", "Tick")[offset];
    value3 = GetField("Volume", "Tick")[offset];
    value4 = GetField("BidAskFlag", "Tick")[offset];

    if value4 = filterMode and value3 >= filterVolume then begin
        ret=1;
    end;

    seq_no = seq_no - 1;
    offset = offset + 1;
end;

last_seqno = curr_seqno;
```

## 盤中即時資料欄位的應用

「盤中即時資料欄位」指的是支援分鐘頻率的資料欄位 (如內盤量、外盤量、大單量等)。

```xs
value1 = GetField("內盤量", "1"); // 取得1分鐘頻率的數值
value2 = GetField("內盤量", "2"); // 取得2分鐘頻率的數值
value3 = GetField("內盤量", "5"); // 取得5分鐘頻率的數值
value4 = GetField("內盤量");      // 不指定頻率: 依照目前執行的頻率
```

應用範例：

**當日賺賠 [指標]**

```xs
value1 = GetField("均價");
value2 = weightedclose - value1;

plot1(value2, "賺賠");
```

**特大單買盤進場 [警示]**

```xs
value1 = GetField("買進特大單量", "1") - GetField("賣出特大單量", "1");
if value1 > 0 then ret=1;
```

## 利用InputKind函數製作跨頻率週期的選取介面

InputKind 函數讓使用者可以在腳本內控制介面的行為（如製作下拉選單）。

**範例：跨頻率KD指標**

```xs
// 跨頻率KD指標，預設跨頻率為30分
// 不支援大頻率跨小頻率
input:    Length(9, "天數"), RSVt(3, "RSVt權數"), Kt(3, "Kt權數"),
        FreqType("30", "跨頻率週期", inputkind:=dict(["1分鐘","1"],["5分鐘","5"],["10分鐘","10"],["15分鐘","15"],["30分鐘","30"],["60分鐘","60"],["日","D"],["還原日","AD"]));
variable: rsv(0), k(0), _d(0);

if barfreq <> "Tick" and barfreq <> "Min" and barfreq <> "D" and barfreq <> "AD" then raiseruntimeerror("此範例僅支援分鐘、日與還原日頻率");

xfMin_stochastic(FreqType, Length, RSVt, Kt, rsv, k, _d);

Plot1(k, "分鐘與日K(%)");
Plot2(_d, "分鐘與日D(%)");

// 防呆，大頻率跨小頻率時，在線圖秀不支援
switch (FreqType)
begin
    case  "1":
        if barfreq <> "Tick" and barfreq <> "Min" then raiseruntimeerror("不支援大頻率跨小頻率：主頻率大於1分鐘");
        if barinterval <> 1 then raiseruntimeerror("不支援大頻率跨小頻率：主頻率大於1分鐘");
        setplotlabel(1, "1分K(%)");
        setplotlabel(2, "1分D(%)");
    // ... (其他CASE省略)
end;
```

## 利用GetSymbolInfo函數計算選擇權的希臘字母Delta

使用 **GetSymbolInfo** 可以取得選擇權的基本資料 (買賣權、履約價、到期日等)。

**範例：通用版Delta指標**

```xs
input:
    iRate100(2,"無風險利率%"),
    iHV(20,"標的歷史波動率計算期間");

variable:vStrikePrice(0),vVolity100(0),vTTMdays(0);

if symboltype <> 5 then
    raiseruntimeerror("僅支援選擇權");

if iHV > 0 then
    vVolity100 = HVolatility(getsymbolfield("Underlying","收盤價","D"),iHV)
else
    vVolity100 = 20;

vStrikePrice = getsymbolinfo("履約價");
vTTMdays = DateDiff(GetSymbolInfo("到期日"), Date) + 1;

value1 = bsdelta(leftstr(getsymbolinfo("買賣權"),1), //C表買權、P表賣權
getsymbolfield("Underlying","收盤價"), //標的價格
vStrikePrice, //履約價
vTTMdays, //到期天數
iRate100, //無風險利率
0, //持有成本
vVolity100); //波動率

plot1(value1,"Delta");
```

## 關於背離的寫法

內建函數 **linearregslope** (線性回歸斜率) 可用來判斷趨勢方向。

**背離函數範例**

```xs
input:price(numericsimple),index1(numericsimple),length(numericsimple);
if length<5
then raiseruntimeerror("計算期別請超過五期");

value1=linearregslope(price,length);
value2=linearregslope(index1,length);

if value1>0 and value2<0
then deviate=-1
else
    if value1<0 and value2>0
    then deviate=1
    else
        deviate=0;
```

**應用：收盤價下跌，但跟10日RSI上昇**

```xs
value1=rsi(close,10);
if deviate(close,value1,10)=1
then ret=1;
```

## 私房交易策略之：強勢股整理結束

**GetBarOffset** 函數：傳入某個日期，回傳從現在到該日期共隔了幾根Bar。

**範例：強勢股整理結束**
條件：

1. 從特定日期以來，到最高點漲幅超過 30%。
2. 從最高點到前一個交易日的低點修正幅度超過 7%。
3. 今天收盤比前一天收盤漲超過 2%。
4. 從高點拉回整理超過五天。

```xs
input: stardate(20150824);
input:ratio(30);
input:ratio1(7);
input:ratio2(2);
setinputname(1,"輸入上漲起始日");
setinputname(2,"輸入上漲最低幅度");
setinputname(3,"輸入最小拉回幅度");
setinputname(4,"今日最低漲幅");
setfirstbardate(stardate);
value1=getbaroffset(stardate);//找出輸入的日期是在第幾根bar
value2=highest(high[1],value1+1);//找出這一波的最高點

condition1=false;
condition2=false;

if value2>=close[value1]*(1+ratio/100)//計算波段漲幅有沒有符合要求
then condition1=true;

if value2>=close[1]*(1+ratio1/100)//計算拉回的幅度夠不夠要求
then condition2=true;

if nthhighestbar(1,high,10)>=5//從最高點到今天超過五根bar
then begin
    if condition1 and condition2 and close>=close[1]*(1+ratio2/100)
    then ret=1;
end;
```

## 用XS寫籌碼集中度的選股策略

**範例：計算區間漲跌幅的自訂函數 (BS)**

```xs
input:days(numericsimple,"計算天數");
value1=GetField("主力買賣超張數");
value2=summation(volume,days);
value3=summation(value1,days);
if value2<>0
then value4=value3/value2*100;
bs=value4;
```

**範例：籌碼集中度選股**
找出在N日內，籌碼集中度高於多少百分比，且漲幅低於多少百分比的股票。

```xs
input:days(10,"天數");
input:ratio(5,"最低百分比");
input:percent(10,"漲幅上限");
value1=bs(days);
if close[days-1]<>0 and close>close[days-1]
then value2=(close-close[days-1])/close[days-1]*100;
if value1>ratio and value2<percent
then ret=1;

outputfield(1,value1,0,"籌碼集中度");
outputfield(2,value2,1,"區間漲幅%");
```

## 那些股票中長紅之後還會續漲?

**選股腳本：前一日中長紅**

```xs
if close>=close[1]*1.03 and volume>500
then ret=1;
```

**策略雷達：預估量超過昨天成交量**
盤中找出前一天中長紅，今天成交量會比昨天大且外盤量比內盤量大的股票。

```xs
value1=q_InSize;//當日內盤量
value2=q_OutSize;//當日外盤量
if GetQuote("估計量") > volume[1]
and value2>value1
then ret=1;
```

## 計算區間漲跌幅的自訂函數

**自訂函數：rangechange**

```xs
input:price(numeric);
input:startday(numeric);
input:endday(numeric);

value1=getbaroffset(startday);
value2=getbaroffset(endday);

value3=(price[value2]/price[value1])-1 ;
rangechange=value3*100;
```

**應用：區間漲跌幅選股**

```xs
input:startday(20150702,"區間起始日");
input:endday(20151002,"區間結束日");
input:ratio(10,"最低漲幅");

value1=rangechange(close,startday,endday);
if value1>=ratio
then ret=1;

value2=GetField("最新股本");
value3=GetField("月營收年增率","M");
value4=GetField("股價淨值比","D");
outputfield(1,value1,1,"區間漲跌幅");
outputfield(2,value2,0,"股本(億)");
outputfield(3,value3,1,"月營收年增率");
outputfield(4,value4,1,"股價淨值比");
```

## 選股欄位放大鏡：談OutputField跟GetFieldDate這兩個函數

**利用 OutputField 檢查腳本執行狀態 (Debug)**

```xs
// ... (計算邏輯)
ret = 1;
outputfield(1, GetFieldDate("月營收","M"), "最新月份");
outputfield(2, Value1);
outputfield(3, Value1[1]);
outputfield(4, Value1[2]);
```

**應用：估算季營收**
利用 **GetFieldDate** 回傳的營收月份來決定該怎麼樣估算這一季的營收。

```xs
Var: mm(0);

Value1 = getfield("月營收","M");
mm = Month(GetFieldDate("月營收","M"));

if mm=1 or mm=4 or mm=7 or mm=10
then value2=Value1 * 3;

if mm=2 or mm=5 or mm=8 or mm=11
then value2=Value1 * 2 + Value1[1];

if mm=3 or mm=6 or mm=9 or mm=12
then value2=Value1+Value1[1]+Value1[2];

// 預估獲利(單位=百萬) = 季營收 * 毛利率 - 營業費用
value3 = value2 * GetField("營業毛利率","Q") - GetField("營業費用","Q");

OutputField(1, mm, "營收月份");
OutputField(2, Value1, "本月");
// ...略
```

## 如何運用Print指令來抓程式的臭蟲

**Print基本語法**

```xs
Value1 = Average(Close, 5);
Print("Date=", Date, "Close=", Close, "Value1", Value1);
```

**密技1：指定輸出檔案路徑**

```xs
print(file("C:\print\"),date,symbol,close);
```

**密技2：指定輸出檔案名稱**

```xs
// 使用 [Symbol] 自動替換為商品代碼
print(file("c:\Print\[Symbol].log"),date,symbol,close);

// 按商品代碼整理
print(file("C:\print\[Symbol]\"),date,symbol,close);
```

## 探討變數序列的觀念：幾天前黃金交叉商品為例

**黃金交叉 (最新)**

```xs
Value1 = Average(Close,Shortlength);
Value2 = Average(Close,Longlength);
If Value1 cross over Value2 then ret = 1;
```

**前一期黃金交叉**
使用 `[1]` 取得變數前一期的數值。

```xs
If Value1[1] cross over Value2[1] then ret = 1;
```

**連續上漲三天**

```xs
Value1 = Close - Close[1];
if Value1 > 0 And Value1[1] > 0 And Value1[2] > 0 then ret=1;
```

## SetBackBar指定頻率設定資料筆數

在v7.06.01版本中，可以使用 **setbackbar** 直接將 GetField 指定頻率的資料引用筆數設定充足。

```xs
settotalBar(Hlength);
setbarBack(Davglength,"D"); // 添加 setbackbar 指定頻率調整資料引用筆數

condition1 = close > average(GetField("收盤價", "D"),Davglength);
// ...
```

## SetTotalBar資料讀取範圍與腳本執行的關係

**SetTotalBar** 用來設定腳本要從哪裡開始執行起 (資料讀取範圍)。

- 指標：不包含當日即時的 K 棒。
- 警示：不包含當日即時的 K 棒。
- 選股：包含當日。

**SetBackBar / SetBarBack** 用來設定最大引用範圍。
當腳本引用範圍很大 (例如 `Close[100]`) 時，可透過此函數告知系統，減少錯誤。

```xs
SetTotalBar(300); // 只計算最新的300筆
SetFirstBarDate(20150101); // 從 20150101 開始計算
SetBackBar(50); // 設定最大引用筆數
```
