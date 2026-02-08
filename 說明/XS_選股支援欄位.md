# XS 選股腳本支援欄位一覽

本文件列出了所有在 **XS 選股腳本** 中可使用的 `GetField` 欄位。
共計 515 個欄位 (已整合最新選股手冊定義)。

| 欄位名稱 (Title) | 支援的 GetField 代碼 |
| :--- | :--- |
| *存貨*應收帳款\_\_營收 | (Inventory+AccoutReceivable)／Sales, (存貨+應收帳款)／季營收, (存貨+應收帳款)／營收 |
| 10年年化報酬率 | 10年年化報酬率, IRR10YAnnualized |
| 1年夏普指數 | 1年夏普指數, SHARPE_1Y |
| 1年年化報酬率 | 1年年化報酬率, IRR1YAnnualized |
| 3年年化報酬率 | 3年年化報酬率, IRR3YAnnualized |
| 5年年化報酬率 | 5年年化報酬率, IRR5YAnnualized |
| CB剩餘張數 | CBConversionAmount, CB剩餘張數 |
| EPS法說公佈值 | EPS法說公佈值, ReportedQuarterlyEPS |
| EPS預估值 | EPS預估值, EstimateQuarterlyEPS |
| ETF規模 | ETFSize, ETF規模 |
| Jensen | Jensen |
| SHARPE | SHARPE |
| Treynor | Treynor |
| 一年內到期長期負債 | CurrentOfLong－TermDebt, 一年內到期長期負債 |
| 上游股價指標 | UpStreamPriceIndex, 上游股價指標 |
| 上漲量 | UpVolume, 上漲成交量, 上漲量 |
| 下一次董監改選年 | NextElectionYearOfBoardOfDirectors, 下一次董監改選年 |
| 下游股價指標 | DownStreamPriceIndex, 下游股價指標 |
| 下跌量 | DownVolume, 下跌成交量, 下跌量 |
| 主力平均買超成本 | AvgCostLeadertotalbuy, 主力平均買超成本 |
| 主力平均賣超成本 | AvgCostLeadertotalSell, 主力平均賣超成本 |
| 主力成本 | LeaderCost, 主力成本 |
| 主力持股 | LeaderSharesHeld, 主力持股 |
| 主力買張 | Leadertotalbuy, 主力買張 |
| 主力買賣超張數 | LeaderDifference, 主力買賣超張數 |
| 主力買賣超張數 | LeaderDifference, 主力買賣超張數 |
| 主力賣張 | Leadertotalsell, 主力賣張 |
| 企業價值 | EnterpriseValue, 企業價值 |
| 企業價值營收比 | CorporateValue／Sales, 企業價值營收比 |
| 佔全市場成交量比 | WeightOfMarket, 佔全市場成交量比 |
| 佔大盤成交量比 | WeightOfTSE, 佔大盤成交量比 |
| 來自營運之現金流量 | CFO, CashFlow－Operating, 來自營運之現金流量 |
| 借券張數 | SBLBorrowing, 借券張數 |
| 借券賣出張數 | SBUnits, 借券賣出張數 |
| 借券賣出還券張數 | SBStcokDiff, 借券賣出庫存異動張數, 借券賣出還券張數 |
| 借券賣出餘額張數 | SBRemain, 借券賣出餘額張數 |
| 借券餘額張數 | SBLbalance, 借券餘額張數 |
| 借款依存度 | Debt／Eqity ％, 借款依存度 |
| 停業部門損益 | DiscontinuedDepartmentsGainLoss, 停業單位損益, 停業部門損益 |
| 停止轉換結束日 | StopConvertingED, 停止轉換結束日 |
| 停止轉換起始日 | StopConvertingSD, 停止轉換起始日 |
| 兌換損失 | ExchangeLoss, 兌換損失 |
| 兌換盈益 | ForeignExchangeGains, 兌換盈益 |
| 內外盤比 | BidAskRatio, 內外盤比 |
| 內盤均量 | BidAvg, 內盤均量 |
| 內盤成交次數 | TotalInTicks, 內盤成交次數 |
| 內盤量 | TradeVolumeAtBid, 內盤量 |
| 內部人持股 | InsiderHodings, 內部人持股 |
| 內部人持股張數 | Insidersharesheld, 內部人持股張數 |
| 內部人持股比例 | Insidersharesheldratio, 內部人持股比例 |
| 內部人持股異動 | InsiderHodingsDiff, 內部人持股異動 |
| 公司成立日期 | FoundingDate, 公司成立日期 |
| 公司掛牌日期 | ListingDate, 公司掛牌日期 |
| 公司類別 | CompanySize, 公司類別 |
| 公司風格 | CompanyStyle, 公司風格 |
| 公積及其他佔股本比重 | CapitalReserveOther／Capital, 公積及其他佔股本比重 |
| 公積配股 | DividendFromCapitalReserve, 公積配股 |
| 其他應付款 | OtherReceivable, 其他應付款 |
| 其他應收款 | BadDebtAllOther, 其他應收款 |
| 其他收入 | OtherNonOperatingIncome, 其他收入 |
| 其他流動負債 | OtherCurrentLiabilities, 其他流動負債 |
| 其他流動資產 | OtherCurrentAssets, 其他流動資產 |
| 其他資產 | TotalOtherAssets, 其他資產, 其他非流動資產 |
| 分公司交易家數 | BranchesOfTraded, 分公司交易家數 |
| 分公司淨買超金額家數 | BranchesOfNetBuyers, 分公司淨買超金額家數 |
| 分公司淨賣超金額家數 | BranchesOfNetSellers, 分公司淨賣超金額家數 |
| 分公司買進家數 | LongBranches, 分公司買進家數 |
| 分公司賣出家數 | ShortBranches, 分公司賣出家數 |
| 利息保障倍數 | TimesInterestEarne, 利息保障倍數 |
| 利息支出 | InterestExpenses, 利息支出 |
| 利息支出率 | InterestExpense(％), 利息支出率 |
| 利息收入 | InterestIncome, 利息收入 |
| 券資比 | ShortSale／Margin, 券資比 |
| 加權平均股數 | WeightedAverageCapitalStock, 加權平均股數 |
| 參考價 | RefPrice, 參考價 |
| 合約負債 | AdvancesCustomers, ContractLiabilities, 合約負債, 預收款項 |
| 吉尼係數 | GiniCoefficient, 吉尼係數 |
| 同業股價指標 | CompetitorsPriceIndex, 同業股價指標 |
| 員工人數 | Numemployees, 員工人數 |
| 員工平均營業額*千元* | SalesPerEmployee, 員工平均營業額(千元), 每人營收 |
| 員工配股率 | RatioOfEmployeeBonus－Stock, 員工配股率 |
| 因子\_QMJ安全 | Factor_QMJ_SAFETY, Factor_QMJ_Safety Factor, 因子_QMJ安全, 因子_QMJ安全因子 |
| 因子\_QMJ獲利 | Factor_QMJ_PROFIT, Factor_QMJ_Profitability Factor, 因子_QMJ獲利, 因子_QMJ獲利因子 |
| 因子\_一年動能 | Factor_MOM, Factor_Momentum Factor, 因子_一年動能, 因子_動能因子(以前11個月報酬為基準) |
| 因子\_偏態係數 | Factor_TSKEW, Factor_Total Skewness Factor, 因子_偏態係數, 因子_偏態係數因子 |
| 因子\_前一年獲利 | Factor_PROFITABILITY_LAG1, Factor_one year lagged profitability Factor, 因子_前一年獲利, 因子_獲利因子(以前一年獲利為基準) |
| 因子\_前三年獲利 | Factor_PROFITABILITY_LAG3, Factor_three year lagged  profitability Factor, 因子_前三年獲利, 因子_獲利因子(以前三年獲利為基準) |
| 因子\_前兩年獲利 | Factor_PROFITABILITY_LAG2, Factor_two year lagged  profitability Factor, 因子_前兩年獲利, 因子_獲利因子(以前兩年獲利為基準) |
| 因子\_半年動能因子 | Factor_MOM_1Y, Factor_Momentum Factor, 因子_動能因子(以前7~12月報酬為基準), 因子_半年動能因子 |
| 因子\_實現損益偏態係數 | Factor_RDSKEW, Factor_Realized skewness Factor, 因子_偏態係數因子(以實現損益為基準), 因子_實現損益偏態係數 |
| 因子\_帳面市值比 | Factor_BM, Factor_Book-to-Market ratio Factor, 因子_帳面市值比, 因子_帳面市值比因子 |
| 因子\_彩券型需求 | Factor_Lottery Demand Factor, Factor_MAX, 因子_彩券型需求, 因子_彩券型需求因子 |
| 因子\_成交值流動性 | Factor_DVOL, Factor_Trading volume Factor, 因子_成交值流動性, 因子_流動性因子(以成交值為基準) |
| 因子\_日週轉率流動性 | Factor_TURNOVER_AVG, Factor_Trading volume Factor, 因子_日週轉率流動性, 因子_流動性因子(以平均日週轉率為基準) |
| 因子\_最高價動能 | Factor_52-week High Momentum Factor, Factor_MOM_52W, 因子_動能因子(以前52週高價為基準), 因子_最高價動能 |
| 因子\_月週轉率流動性 | Factor_STDTURN, Factor_Standard deviation of share turnover Factor, 因子_月週轉率流動性, 因子_流動性因子(以股票月週轉率標準差為基準) |
| 因子\_淨營運資產 | Factor_NOA, Factor_Net Operating Assets Factor, 因子_淨營運資產, 因子_淨營運資產因子 |
| 因子\_潛在上檔報酬比 | Factor_UPR, Factor_Upside Potential Ratio Factor, 因子_潛在上檔報酬比, 因子_潛在上檔報酬比率因子 |
| 因子\_特質波動度 | Factor_IVOL, Factor_Idiosyncratic Factor, 因子_特質波動度, 因子_特質波動度因子 |
| 因子\_現金流量波動度 | Factor_Cash flow volatility Factor, Factor_VCF, 因子_現金流量波動度, 因子_現金流量波動度因子 |
| 因子\_股票發行量 | Factor_ISSUE, Factor_Share issuance Factor, 因子_股票發行量, 因子_股票發行量因子 |
| 因子\_貝他值 | Factor_BETA_1Y, Factor_BETA_1year Factor, 因子_貝他值, 因子_貝他因子 |
| 因子分數\_QMJ安全 | FactorScore_QMJ_SAFETY, FactorScore_QMJ_Safety Factor, 因子分數_QMJ安全, 因子分數_QMJ安全因子 |
| 因子分數\_QMJ獲利 | FactorScore_QMJ_PROFIT, FactorScore_QMJ_Profitability Factor, 因子分數_QMJ獲利, 因子分數_QMJ獲利因子 |
| 因子分數\_一年動能 | FactorScore_MOM, FactorScore_Momentum Factor, 因子分數_一年動能, 因子分數_動能因子(以前11個月報酬為基準) |
| 因子分數\_偏態係數 | FactorScore_TSKEW, FactorScore_Total Skewness Factor, 因子分數_偏態係數, 因子分數_偏態係數因子 |
| 因子分數\_前一年獲利 | FactorScore_PROFITABILITY_LAG1, FactorScore_one year lagged profitability Factor, 因子分數_前一年獲利, 因子分數_獲利因子(以前一年獲利為基準) |
| 因子分數\_前三年獲利 | FactorScore_PROFITABILITY_LAG3, FactorScore_three year lagged  profitability Factor, 因子分數_前三年獲利, 因子分數_獲利因子(以前三年獲利為基準) |
| 因子分數\_前兩年獲利 | FactorScore_PROFITABILITY_LAG2, FactorScore_two year lagged  profitability Factor, 因子分數_前兩年獲利, 因子分數_獲利因子(以前兩年獲利為基準) |
| 因子分數\_半年動能因子 | FactorScore_MOM_1Y, FactorScore_Momentum Factor, 因子分數_動能因子(以前7~12月報酬為基準), 因子分數_半年動能因子 |
| 因子分數\_實現損益偏態係數 | FactorScore_RDSKEW, FactorScore_Realized skewness Factor, 因子分數_偏態係數因子(以實現損益為基準), 因子分數_實現損益偏態係數 |
| 因子分數\_帳面市值比 | FactorScore_BM, FactorScore_Book-to-Market ratio Factor, 因子分數_帳面市值比, 因子分數_帳面市值比因子 |
| 因子分數\_彩券型需求 | FactorScore_Lottery Demand Factor, FactorScore_MAX, 因子分數_彩券型需求, 因子分數_彩券型需求因子 |
| 因子分數\_成交值流動性 | FactorScore_DVOL, FactorScore_Trading volume Factor, 因子分數_成交值流動性, 因子分數_流動性因子(以成交值為基準) |
| 因子分數\_日週轉率流動性 | FactorScore_TURNOVER_AVG, FactorScore_Trading volume Factor, 因子分數_日週轉率流動性, 因子分數_流動性因子(以平均日週轉率為基準) |
| 因子分數\_最高價動能 | FactorScore_52-week High Momentum Factor, FactorScore_MOM_52W, 因子分數_動能因子(以前52週高價為基準), 因子分數_最高價動能 |
| 因子分數\_月週轉率流動性 | FactorScore_STDTURN, FactorScore_Standard deviation of share turnover Factor, 因子分數_月週轉率流動性, 因子分數_流動性因子(以股票月週轉率標準差為基準) |
| 因子分數\_淨營運資產 | FactorScore_NOA, FactorScore_Net Operating Assets Factor, 因子分數_淨營運資產, 因子分數_淨營運資產因子 |
| 因子分數\_潛在上檔報酬比 | FactorScore_UPR, FactorScore_Upside Potential Ratio Factor, 因子分數_潛在上檔報酬比, 因子分數_潛在上檔報酬比率因子 |
| 因子分數\_特質波動度 | FactorScore_IVOL, FactorScore_Idiosyncratic Factor, 因子分數_特質波動度, 因子分數_特質波動度因子 |
| 因子分數\_現金殖利率 | FactorScore_DY, FactorScore_Dividend Yield, 因子分數_現金殖利率, 因子分數_現金殖利率因子 |
| 因子分數\_現金流量波動度 | FactorScore_Cash flow volatility Factor, FactorScore_VCF, 因子分數_現金流量波動度, 因子分數_現金流量波動度因子 |
| 因子分數\_股東權益報酬率 | FactorScore_ROE, FactorScore_Return on Equity, 因子分數_股東權益報酬率, 因子分數_股東權益報酬率因子 |
| 因子分數\_股票發行量 | FactorScore_ISSUE, FactorScore_Share issuance Factor, 因子分數_股票發行量, 因子分數_股票發行量因子 |
| 因子分數\_貝他值 | FactorScore_BETA_1Y, FactorScore_BETA_1year Factor, 因子分數_貝他值, 因子分數_貝他因子 |
| 固定資產 | TotalFixedAssets, 不動產廠房及設備, 固定資產 |
| 固定資產報酬率 | ReturnOnFixedAsset, 固定資產報酬率 |
| 固定資產成長率 | YOY％－FixedAssets, 固定資產成長率, 折舊性FA成長率 |
| 固定資產週轉率*次* | FixedAssetTurnover, 固定資產週轉率(次) |
| 地緣券商買賣超張數 | GBDifference, 地緣券商買賣超張數 |
| 均價 | AvgPrice, 均價 |
| 均價 | AvgPrice, 均價 |
| 填息天數 | DaysForCashDividendAdjustment, 填息天數 |
| 填權天數 | DaysForStockDividendAdjustment, 填權天數 |
| 外幣換算調整數 | AdjustmentForFX, 國外機構報表換算差額, 外幣換算調整數 |
| 外盤均量 | AskAvg, 外盤均量 |
| 外盤成交次數 | TotalOutTicks, 外盤成交次數 |
| 外盤量 | TradeVolumeAtAsk, 外盤量 |
| 外資成本 | FBSCost, 外資成本 |
| 外資持股 | Fsharesheld, 外資持股 |
| 外資持股比例 | ExgFsharesheld／Capital, Fsharesheldratio, 外資持股比例, 外資持股比重 |
| 外資買張 | Ftotalbuy, 外資買張 |
| 外資買賣超 | Fdifference, 外資買賣超 |
| 外資賣張 | Ftotalsell, 外資賣張 |
| 外銷比率 | ExportRatio, 外銷比率 |
| 大戶持股人數 |  |
| 大戶持股人數 |  |
| 大戶持股張數 |  |
| 大戶持股張數 |  |
| 大戶持股比例 |  |
| 大戶持股比例 |  |
| 存貨 | Inventories, 存貨 |
| 存貨及應收帳款\_淨值 | Inventory, 存貨及應收帳款／淨值 |
| 存貨營收比 | Inventory／Sales, 存貨營收比 |
| 存貨週轉率*次* | InventoryTurnover, 存貨週轉率(次) |
| 官股券商買賣超張數 | OBDifference, 官股券商買賣超張數 |
| 實戶買張 | operatortotalbuy, 實戶買張 |
| 實戶買賣超張數 | operatordifference, 實戶買賣超張數 |
| 實戶賣張 | operatortotalSell, 實戶賣張 |
| 實質買盤比 | RealLongRatio, 實質買盤比 |
| 實質賣盤比 | RealShortRatio, 實質賣盤比 |
| 市值營收比 | MarketValue／Sales, 市值營收比 |
| 市研率 | OperatingExpense－R＆D／MarketValue, 市研率 |
| 常續性利益*稅後* | NetIncome－ExcDispo, 常續性利益(稅後) |
| 平均售貨天數 | DaysInventoryOutstanding, 平均售貨天數 |
| 平均收帳天數 | DaysReceivablesOutstanding, 平均收帳天數 |
| 年報酬率 |  |
| 年報酬率 |  |
| 庫藏股實際買回張數 | Stockbuyvalue, 庫藏股實際買回張數 |
| 庫藏股票帳面值 | TreasuryStock, 庫藏股票帳面值 |
| 庫藏股結束日期 | Stockenddate, 庫藏股結束日期 |
| 庫藏股開始日期 | Stockstartdate, 庫藏股開始日期 |
| 庫藏股預計買回張數 | Stockestivalue, 庫藏股預計買回張數 |
| 應付商業本票 | BillsIssued, 應付商業本票 |
| 應付帳款付現天數 | Days－A／P Turnover, 應付帳款付現天數 |
| 應付帳款及票據 | AccountsPayable＆NotesPayable, 應付帳款及票據 |
| 應收帳款及票據 | AccountsReceivable＆NotesReceivable, 應收帳款及票據 |
| 應收帳款週轉次數 | AccountsReceivablesTurnover, 應收帳款週轉次數 |
| 應收帳款週轉率*次* | AccountsReceivableNotesReceivableTurnover, 應收帳款週轉率(次) |
| 成交均量 | AvgDealedShare, 成交均量 |
| 成交量 | Volume, 成交量 |
| 成交量 | Volume, 成交量 |
| 成交金額*億* | TradeValue, 成交金額, 成交金額(億) |
| 成交金額*億* | TradeValue, 成交金額, 成交金額(億) |
| 成交金額*元* | TradeValue, 成交金額(元) |
| 或有負債比率 | Contingent Liab／Equity, 或有負債比率 |
| 所得稅費用 | IncomeTaxExpense, 所得稅費用 |
| 投信成本 | SBSCost, 投信成本 |
| 投信持股 | Ssharesheld, 投信持股 |
| 投信持股比例 | Ssharesheldratio, 投信持股比例 |
| 投信買張 | Stotalbuy, 投信買張 |
| 投信買賣超 | Sdifference, 投信買賣超 |
| 投信賣張 | Stotalsell, 投信賣張 |
| 投資建議目標價 | AnalystPriceTargets, 投資建議目標價 |
| 投資建議評級 | RecommendationRating, 投資建議評級 |
| 投資活動之現金流量 | CFI, CashFlowInvestment, 投資活動之現金流量 |
| 投資跌價損失 | LossonInvestmentRevaluation, 投資跌價損失, 金融資產減損損失 |
| 投資跌價損失回轉 | RevofLossonInvestment, 投資跌價損失回轉, 金融資產減損迴轉利益 |
| 振幅 | Range(％), 振幅 |
| 控盤者成本線 | CostLine, 控盤者成本線 |
| 控盤者買張 | controllertotalbuy, 控盤者買張 |
| 控盤者買賣超張數 | controllerdifference, 控盤者買賣超張數 |
| 控盤者賣張 | controllertotalsell, 控盤者賣張 |
| 推銷費用 | OperatingExpense－Promotion, 推銷費用 |
| 收盤價 | Close, 收盤價 |
| 收盤價 | Close, 收盤價 |
| 收盤量 | VolumeAtClose, 收盤量 |
| 散戶持股人數 |  |
| 散戶持股人數 |  |
| 散戶持股張數 |  |
| 散戶持股張數 |  |
| 散戶持股比例 |  |
| 散戶持股比例 |  |
| 散戶買張 | retailtotalbuy, 散戶買張 |
| 散戶買賣超張數 | retaildifference, 散戶買賣超張數 |
| 散戶賣張 | retailtotalsell, 散戶賣張 |
| 新產能預計量產日期 | DateOfNewProductionCapacity, 新產能預計量產日期 |
| 新聞正向分數 | NewsPosScore, 新聞正向分數 |
| 新聞聲量分數 | NewsVolScore, 新聞聲量分數 |
| 新聞負向分數 | NewsNegScore, 新聞負向分數 |
| 新股上市日 | LaunchDayOfNewShares, 新股上市日 |
| 日期 | Date, 日期 |
| 普通股股本 | CapitalCommonStocks, 普通股股本 |
| 最低價 | Low, 最低價 |
| 最低價 | Low, 最低價 |
| 最後交易日 | LastTradeDate, 最後交易日 |
| 最後過戶日期 | LastTransferDay, 最後過戶日期 |
| 最高價 | High, 最高價 |
| 最高價 | High, 最高價 |
| 月平均收益率 | AvgReturnM, 月平均收益率 |
| 月營收 | Sales, 月營收 |
| 月營收 | Sales, 月營收 |
| 月營收年增率 | Sales－YoY, 月營收年增率 |
| 月營收月增率 | Sales－MoM, 月營收月增率 |
| 有息負債利率 | Int.Exp.／Debt, 有息負債利率 |
| 有效稅率 | Tax Rate, 有效稅率 |
| 未分配盈餘 | UnappropriatedRetainedEarnings, 未分配盈餘 |
| 未完工程及預付款 | ConstructionProcess＆Prepayment, 未完工程及預付款, 預付設備款 |
| 本期稅後淨利 | NetIncome, 本期稅後淨利, 歸屬母公司淨利(損) |
| 本益比 | PE, PERatio, 本益比 |
| 本益比 | PE, PERatio, 本益比 |
| 杜邦型ROA | ROA－DuPont?Analysis, 杜邦型ROA |
| 杜邦型ROE | ROE－DuPont?Analysis, 杜邦型ROE |
| 標準差 | StdDev, 標準差 |
| 機構持股 | 13FHoldings, 機構持股 |
| 機構持股比重 | 13FHoldingsRate, 機構持股比重 |
| 殖利率 | Yield, 殖利率 |
| 殖利率 | Yield, 殖利率 |
| 每人營業利益 | OperatingIncomePerEmployee, 每人營業利益 |
| 每股流動淨資產 | NetCurrentAssetsPerShare, 每股流動淨資產 |
| 每股淨值*元* | BookValuePerShare, 每股淨值(元) |
| 每股營業利益*元* | OperatingIncomePerShare, 每股營業利益(元) |
| 每股營業額*元* | SalesPerShare, 每股營業額(元) |
| 每股現金流量 | CashflowPerShare, 每股現金流量 |
| 每股稅前淨利*元* | Pre_TaxIncomePerShare, 每股稅前淨利(元) |
| 每股稅後淨利*元* | EPS, EarningPerShare, 每股稅後淨利(元) |
| 每股稅後淨利*元* | EPS, EarningPerShare, 每股稅後淨利(元) |
| 每股自由現金流量 | FCFFPerShare, 每股自由現金流量 |
| 法人持股 | InvestorSharesHeld, 法人持股 |
| 法人持股比例 | InvestorSharesHeldRatio, 法人持股比例 |
| 法人買張 | InvestorTotalBuy, 法人買張 |
| 法人買賣超張數 | InvestorDifference, 法人買賣超張數 |
| 法人買賣超張數 | InvestorDifference, 法人買賣超張數 |
| 法人賣張 | investorTotalSell, 法人賣張 |
| 法定盈餘公積 | LegalReserve, 法定盈餘公積 |
| 法說會日期 | InvestorConferenceDate, 法說會日期 |
| 波動率 | Volatility, 波動率 |
| 流動比率 | CurrentRatio, 流動比率 |
| 流動負債 | TotalCurrentLiabilities, 流動負債 |
| 流動資產 | TotalCurrentAssets, 流動資產 |
| 淨值成長率 | YOY％－TotalEquity, 淨值成長率 |
| 淨值自由現金流量比 | NetValue／FCF, 淨值自由現金流量比 |
| 淨值週轉率 | EquityTurnover, 淨值週轉率 |
| 淨營業週期 | NetOperatingCycle, 淨營業週期 |
| 減資新股上市日 | LaunchDayOfCapitalReduction, 減資新股上市日 |
| 減資日期 | CapitalReductionDate, 減資日期 |
| 減資最後過戶日 | LastTransferDateOfCapitalReduction, 減資最後過戶日 |
| 減資比例 | CapitalReductionRatio, 減資比例 |
| 漲停價 | UpLimit, 漲停價 |
| 漲停委買數量 |  |
| 漲停委買筆數 |  |
| 漲停委賣數量 |  |
| 漲停委賣筆數 |  |
| 漲跌幅 | Change(％), 漲跌幅 |
| 漲跌幅 | Change(％), 漲跌幅 |
| 無形資產 | IntangibleAssets, 無形資產 |
| 營收成長率 | YOY％－Sales, 營收成長率 |
| 營業利益 | OperatingIncome, 營業利益 |
| 營業利益成長率 | YOY％－OperatingIncome, 營業利益成長率 |
| 營業利益率 | OperatingProfitMargin, 營業利益率 |
| 營業外收入及支出 | NonOperatingIncome&Expense, 營業外收入及支出 |
| 營業外收入合計 | TotalNonOperatingIncome, 營業外收入合計 |
| 營業成本 | CostOfGoodsSold, 營業成本 |
| 營業收入淨額 | NetSales, 營業收入淨額 |
| 營業毛利 | GrossProfit, 營業毛利 |
| 營業毛利率 | GrossMargin, 營業毛利率 |
| 營業毛利率 | GrossMargin, 營業毛利率 |
| 營業現金流量\_營業利益 | CFO／OperatingIncome, 營業現金流量／營業利益 |
| 營業費用 | OperatingExpenses, 營業費用 |
| 營業費用率 | Operating Exp. ％, 營業費用率 |
| 營運資金 | WorkingCapital, 營運資金 |
| 特別盈餘公積 | AppropriatedRetainedEarnings, 特別盈餘公積 |
| 特別股股本 | CapitalPreferredStocks, 特別股股本 |
| 現券償還張數 | ShortSalesRS, 現券償還張數 |
| 現增價格 | CashIncrementAmount, 現增價格 |
| 現增新股上市日 | LaunchDayOfNewSharesCashIncrement, 現增新股上市日 |
| 現增最後過戶日 | LastTransferDayOfCashIncrement, 現增最後過戶日 |
| 現增比率 | RatioofCashIncrement, 現增比率 |
| 現增繳款日期 | DateofCashIncrement, 現增繳款日期 |
| 現增金額 | PriceofCashIncrement, 現增金額 |
| 現股當沖張數 | NormalDayTrades, 現股當沖張數 |
| 現股當沖買進金額 | DayTradeBValue, 現股當沖買進金額 |
| 現股當沖賣出金額 | DayTradeSValue, 現股當沖賣出金額 |
| 現金償還張數 | POMRC, 現金償還張數 |
| 現金再投資\_ | CashReinvestmentRatio, 現金再投資％ |
| 現金及約當現金 | CashCashEquivalent, 現金及約當現金 |
| 現金增資佔股本比重 | CashIncrease／Capital, 現金增資佔股本比重 |
| 現金派息比率 | CurrentPayoutRatio, 現金派息比率 |
| 現金流量允當\_ | CFAdequacyRatio, 現金流量允當％ |
| 現金流量比率 | CFO ／CL ％, 現金流量比率 |
| 現金股利 | CashDividend, 現金股利, 股息 |
| 現金股利佔股利比重 | CashDividend／TotalDividend, 現金股利佔股利比重 |
| 現金股利殖利率 | CashDividendYield, 現金股利殖利率 |
| 理財活動之現金流量 | CFF, CashFlowFinancing, 理財活動之現金流量 |
| 用人費用率 | Employee Fee ％, 用人費用率 |
| 當日沖銷張數 | Daytradeshares, 當日沖銷張數 |
| 當期財報截止日 | PeriodEndDate, 當期財報截止日 |
| 發行張數*張* | OutStandingShares, 發行張數(張) |
| 發行張數*萬張* | OutStandingShares, 發行張數, 發行張數(萬張) |
| 盈餘成長係數 | PEG, 盈餘成長係數 |
| 盈餘殖利率 | EarningYield, 盈餘殖利率 |
| 盈餘營收成長率比 | EarningGrowth／SalesGrowth, 盈餘營收成長率比 |
| 盈餘轉增資佔股本比重 | CaptialIncreaseFromEarning／Capital, 盈餘轉增資佔股本比重 |
| 盈餘配股 | DividendFromEarning, 盈餘配股 |
| 盤中整股成交量 | BoardLotVolume, 盤中整股成交量 |
| 盤中零股成交量 | OddLotVolume, 盤中零股成交量 |
| 盤後量 | OffHourVolume, 盤後量 |
| 真實範圍 | TR, TrueRange, 真實範圍 |
| 真實範圍波幅 | TR％, 真實範圍波幅 |
| 短期借支 | LoanToOther－ShortTerm, 短期借支 |
| 短期借款 | Short－TermBorrowing, 短期借款 |
| 短期投資 | MarketableSecurity, 短期投資 |
| 研發費用 | OperatingExpense－R＆D, 研發費用 |
| 研發費用率 | R＆D ％, 研發費用率 |
| 稀釋後每股淨利 | DilutedEPS, 稀釋後每股淨利 |
| 稅前息前折舊前淨利 | EBITDA, 稅前息前折舊前淨利 |
| 稅前息前淨利 | EBIT, 稅前息前淨利 |
| 稅前淨利 | Pre－TaxIncome, 稅前淨利 |
| 稅前淨利成長率 | YOY％－Pre－TaxIncome, 稅前淨利成長率 |
| 稅前淨利率 | Pre－TaxIncomeMargin, Pre－TaxProfitMargin, 稅前淨利率 |
| 稅後淨利成長率 | YOY％－NetIncome, 稅後淨利成長率 |
| 稅後淨利率 | ProfitMargin, 稅後淨利率 |
| 管理*銷售費用*營收 | OperatingExpense－ADM＆Promotion／Sales, 管理+銷售費用／營收 |
| 管理費用 | OperatingExpense－ADM, 管理費用 |
| 管理費用\_季營收 | OperatingExpense－ADM／Sales, 管理費用／季營收 |
| 籌碼鎖定率 | RatioOfMajorHolder, 籌碼鎖定率 |
| 累計營收 | AccSales, 累計營收 |
| 累計營收年增率 | AccSales－YoY, 累計營收年增率 |
| 經常利益 | OrdinaryIncome, 經常利益, 繼續營業單位損益 |
| 綜合前十大券商買賣超張數 | IB10Difference, 綜合前十大券商買賣超張數 |
| 總市值*億* | MarketCapin100Million, 總市值, 總市值(億) |
| 總市值*億* | MarketCapin100Million, 總市值, 總市值(億) |
| 總市值*元* | TotalMarketValue, 總市值(元) |
| 總成交次數 | TotalTicks, 總成交次數 |
| 總成交筆數 | TotalTransaction, 總成交筆數 |
| 總持股人數 | TotalSharesHeldPeople, 總持股人數, 總股東人數 |
| 總流通在外股數 | TotalSharesOutstanding, 總流通在外股數 |
| 總經理 | GeneralManager, 總經理 |
| 總資產成長率 | YOY％－TotalAssets, 總資產成長率 |
| 總資產週轉率*次* | TotalAssetTurnover, 總資產週轉率(次) |
| 聯屬公司間未實現銷貨 | UnearnedRelatedSale, 聯屬公司間未實現銷貨 |
| 股價淨值比 | PB, PBRatio, 股價淨值比 |
| 股價淨值比 | PB, PBRatio, 股價淨值比 |
| 股價自由現金流量比 | Price／FCF, 股價自由現金流量比 |
| 股利合計 | TotalDividend, 股利合計 |
| 股利年度 | DividendYear, 股利年度 |
| 股利收入 | InvestmentIncome, 投資收入／股利收入, 股利收入 |
| 股本*億* | Capital-Lastest, 最新股本, 股本(億) |
| 股本*元* | CurrentCapital, 股本(元) |
| 股東會日期 | DateofMeetingofShareHolders, 股東會日期 |
| 股東權益報酬率 | ROE, ReturnOnEquity, 股東權益報酬率 |
| 股東權益報酬率 | ROE, ReturnOnEquity, 股東權益報酬率 |
| 股東權益總額 | TotalEquity, 股東權益總額 |
| 股票基金持有檔數 | HoldingByFunds, 股票基金持有檔數 |
| 股票股利 | StockDividend, 股票股利 |
| 股票股利佔股利比重 | StockDividend／TotalDividend, 股票股利佔股利比重 |
| 股票股利殖利率 | StockDividendYield, 股票股利殖利率 |
| 背書保證佔淨值比 | 背書保證佔淨值比, ％OfEndorsementsGuarantees |
| 背書保證餘額 | BalanceOfEndorsementsGuarantees, 背書保證餘額 |
| 自營商成本 | DBSCost, 自營商成本 |
| 自營商持股 | Dsharesheld, 自營商持股 |
| 自營商持股比例 | Dsharesheldratio, 自營商持股比例 |
| 自營商自行買賣買張 | DSelftotalbuy, 自營商自行買賣買張 |
| 自營商自行買賣買賣超 | DSelfdifference, 自營商自行買賣買賣超 |
| 自營商自行買賣賣張 | DSelftotalsell, 自營商自行買賣賣張 |
| 自營商買張 | Dtotalbuy, 自營商買張 |
| 自營商買賣超 | Ddifference, 自營商買賣超 |
| 自營商賣張 | Dtotalsell, 自營商賣張 |
| 自營商避險買張 | DtotalHedgebuy, 自營商避險買張 |
| 自營商避險買賣超 | DHedgedifference, 自營商避險買賣超 |
| 自營商避險賣張 | DtotalHedgesell, 自營商避險賣張 |
| 自由現金流量 | FCFF, 自由現金流量 |
| 自由現金流量營收比 | FCF／Sales, 自由現金流量營收比 |
| 董事長 | Chairman, 董事長 |
| 董監事就任日期 | DateOfBoardOfDirectorInaugurate, 董監事就任日期 |
| 董監持股 | DirectorHeld, 董監持股 |
| 董監持股佔股本比例 | DirectorHeld／Capital, 董監持股佔股本比例 |
| 董監質設比例 | DSmortgageratio, 董監質設比例 |
| 處分投資利得 | Gain－DisposalInvestment, 處分投資利得 |
| 處分投資損失 | Loss－DisposalInvestment, 處分投資損失 |
| 處分資產利得 | GainsDisposalFixedAssets, 處分資產利得 |
| 處分資產損失 | Loss－DisposalFixedAssets, 處分資產損失 |
| 處置結束日期 | DispositionED, 處置結束日期 |
| 處置開始日期 | DispositionSD, 處置開始日期 |
| 融券使用率 | ShortSell％, 融券使用率 |
| 融券增減張數 | ShortSaleNew, 融券增減張數 |
| 融券最後回補日 | ShortSaleFinalRecallDate, 融券最後回補日 |
| 融券買進張數 | ShortSaleRecall, 融券買進張數 |
| 融券賣出張數 | ShortSales, 融券賣出張數 |
| 融券餘額佔股本比例 | Shortsaleremain／Capital, 融券餘額佔股本比例 |
| 融券餘額張數 | ShortSaleRemain, 融券餘額張數 |
| 融資使用率 | pomusingratio, 融資使用率 |
| 融資增減張數 | pomnew, 融資增減張數 |
| 融資維持率 | Pomremainratio, 融資維持率 |
| 融資買進張數 | POMBuy, 融資買進張數 |
| 融資賣出張數 | POMSell, 融資賣出張數 |
| 融資限額張數 | MarginLimit, 融資限額張數 |
| 融資餘額佔股本比例 | Pomremain／Capital, 融資餘額佔股本比例 |
| 融資餘額張數 | Pomremain, 融資餘額張數 |
| 誠信指標 | CreditIndicator, 誠信指標 |
| 貝他值 | Beta, 貝他值 |
| 負債及股東權益總額 | TotalLiabilities＆Equity, 負債及股東權益總額 |
| 負債對淨值比率 | DebtEquityRatio, 總負債/總淨值, 負債對淨值比率 |
| 負債比率 | LiabilitiesRatio, 負債比率 |
| 負債總額 | TotalLiabilities, 負債總額 |
| 財報股本*億* | CurrentCapitalin100Million, 億元股本, 加權平均股本, 財報股本(億) |
| 買家數 | NetLongBranches, 買家數 |
| 買進中單成交次數 | BidTickCount_M, 買進中單成交次數 |
| 買進中單量 | BidVolume_M, 買進中單量 |
| 買進中單金額 | BidVolumePrice_M, 買進中單金額 |
| 買進公司家數 | LongSecurityFirms, 買進公司家數 |
| 買進大單成交次數 | BidTickCount_L, 買進大單成交次數 |
| 買進大單量 | BidVolume_L, 買進大單量 |
| 買進大單金額 | BidVolumePrice_L, 買進大單金額 |
| 買進小單成交次數 | BidTickCount_S, 買進小單成交次數 |
| 買進小單量 | BidVolume_S, 買進小單量 |
| 買進小單金額 | BidVolumePrice_S, 買進小單金額 |
| 買進特大單成交次數 | BidTickCount_XL, 買進特大單成交次數 |
| 買進特大單量 | BidVolume_XL, 買進特大單量 |
| 買進特大單金額 | BidVolumePrice_XL, 買進特大單金額 |
| 資券互抵張數 | MarginTrades, 資券互抵張數 |
| 資本公積 | CapitalReserve, 資本公積 |
| 資本支出營收比 | Capitalexpenditure／Sales, 資本支出營收比 |
| 資本支出金額 | CapitalExpenditure, 資本支出金額 |
| 資產報酬率 | ROA, ReturnOnAssets, 資產報酬率 |
| 資產總額 | TotalAssets, 資產總額 |
| 資金貸放佔淨值比 | 資金貸放佔淨值比, ％OfLoanBalance |
| 資金貸放餘額 | LoanBalance, 資金貸放餘額 |
| 賣出中單成交次數 | AskTickCount_M, 賣出中單成交次數 |
| 賣出中單量 | AskVolume_M, 賣出中單量 |
| 賣出中單金額 | AskVolumePrice_M, 賣出中單金額 |
| 賣出公司家數 | ShortSecurityFirms, 賣出公司家數 |
| 賣出大單成交次數 | AskTickCount_L, 賣出大單成交次數 |
| 賣出大單量 | AskVolume_L, 賣出大單量 |
| 賣出大單金額 | AskVolumePrice_L, 賣出大單金額 |
| 賣出小單成交次數 | AskTickCount_S, 賣出小單成交次數 |
| 賣出小單量 | AskVolume_S, 賣出小單量 |
| 賣出小單金額 | AskVolumePrice_S, 賣出小單金額 |
| 賣出特大單成交次數 | AskTickCount_XL, 賣出特大單成交次數 |
| 賣出特大單量 | AskVolume_XL, 賣出特大單量 |
| 賣出特大單金額 | AskVolumePrice_XL, 賣出特大單金額 |
| 賣家數 | NetShortBranches, 賣家數 |
| 跌停價 | DownLimit, 跌停價 |
| 跌停委買數量 |  |
| 跌停委買筆數 |  |
| 跌停委賣數量 |  |
| 跌停委賣筆數 |  |
| 轉換價格 | ConversionPrice, 轉換價格 |
| 退休金準備 | AccruedPensionPay, 退休金準備 |
| 速動比率 | AcidTest, 速動比率 |
| 週平均收益率 | AvgReturnW, 週平均收益率 |
| 週轉率 | TurnOverRatio, 週轉率 |
| 遞延所得稅 | DeferredTax, 遞延所得稅 |
| 遞延貸項 | DeferredCreditBalances, 遞延貸項 |
| 遞延資產 | DeferredAssets, 遞延資產 |
| 還券張數 | SBLreturn, 還券張數 |
| 鉅額交易量 | BlockTrade, 鉅額交易量 |
| 銷售費用比 | SellingExpanseRatio／CostOfGoodsSold, 銷售費用比 |
| 長期投資 | Long－TermInvestment, 長期投資 |
| 長期負債 | Long－TermLiabilities, 長期負債, 非流動負債 |
| 長期資金適合率 | (L－TLiab.+SE)／FA％, 長期資金適合率 |
| 長短期負債比率 | LongTermDebt/ShortTermDebt, 長短期負債比率 |
| 開盤價 | Open, 開盤價 |
| 開盤價 | Open, 開盤價 |
| 開盤委買 | BidAtOpen, DayOpenBid, 開盤委買 |
| 開盤委賣 | AskAtOpen, DayOpenAsk, 開盤委賣 |
| 開盤量 | VolumeAtOpen, 開盤量 |
| 關聯券商買賣超張數 | CorrelationBrokerDifference, 關聯券商買賣超張數 |
| 關鍵券商買賣超張數 | KeyBrokerDifference, 關鍵券商買賣超張數 |
| 除息值 | ExDividendValue, 除息值 |
| 除息年度 | ExDividendYear, 除息年度 |
| 除息日期 | ExDividendDate, 除息日期 |
| 除權值 | ExRightValue, 除權值 |
| 除權年度 | ExRightYear, 除權年度 |
| 除權息值 | ExDividendRightValue, 除權息值 |
| 除權息年度 | ExDividendRightYear, 除權息年度 |
| 除權息日期 | ExDividendRightDate, 除權息日期 |
| 除權日期 | ExRightDate, 除權日期 |
| 集保張數 | SharesUnderCentralCustody, 集保張數 |
| 集保張數佔發行張數百分比 | SharesUnderCentralCustody％, 集保張數佔發行張數百分比 |
| 零股量 | OddLot, 盤後零股成交量, 零股量 |
| 預付費用及預付款 | Prepaid＆Advance, 預付費用及預付款 |
| 預收款項 | AdvancesCustomers, 預收款項 |
| 預收股款 | Proceeds－NewIssued, 預收股款 |
| 高低差 | Range, 高低差 |
