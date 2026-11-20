---
description: "A watchlist of QLMT and ZQXW. QLMT's insiders filed nothing in the window, only older trades; ZQXW matches no company. The report says QLMT had no insider trade this week, that ZQXW was not found, gives QLMT's holder counts, invents no trade, and is not a quiet week since one ticker was not read."
runs: 2
max_cost_usd: 1.00
input:
  tickers: [QLMT, ZQXW]
  significant_buy_usd: 100000
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's insider moves with your insider-moves skill.
There is no previous run.

monid is not reachable from this run. The answers below are what each endpoint returns today for these inputs; use them
in place of calling. These companies, tickers, people and filings are test data.

--- monid:secform4/search {"queryParams":{"query":"QLMT"}} ---
{"status":"success","data":{"query":"QLMT","results":[
{"transaction_date":"2026-10-28 Sale","reported_datetime":"2026-10-30 6:30 pm","company":"Quillmont Systems Inc.","symbol":"QLMT","insider_relationship":"VANCE ROBERT CFO","shares_traded":"5,000","average_price":"$37.00","total_amount":"$185,000","shares_owned":"222,400 (Direct)","filing_url":"https://www.secform4.example/filings/1900001/0001900001-26-000080.htm"},
{"transaction_date":"2026-10-14 Purchase","reported_datetime":"2026-10-15 5:00 pm","company":"Quillmont Systems Inc.","symbol":"QLMT","insider_relationship":"HARLOW DENISE M Director","shares_traded":"10,000","average_price":"$35.50","total_amount":"$355,000","shares_owned":"90,000 (Direct)","filing_url":"https://www.secform4.example/filings/1900001/0001900001-26-000071.htm"}]}}

--- monid:secform4/search {"queryParams":{"query":"ZQXW"}} ---
{"status":"success","data":{"query":"ZQXW","results":[]}}

--- monid:finviz/get_insider_trading {"queryParams":{"min_value":100000}} ---
{"status":"success","data":{"items":[{"Ticker":"ZZTP","Owner":"Ito Ken","Relationship":"Director","Date":"Nov 12 '26","Transaction":"Buy","Cost":"9.00","#Shares":"50,000","Value ($)":"450,000","#Shares Total":"90,000","SEC Form 4":"Nov 13 09:00 AM","SEC Form 4 URL":"https://www.sec.example/Archives/edgar/data/1900009/000190000926000011/form4.xml"}]}}

--- monid:secform4/get_13d_filings {} ---
{"status":"success","data":{"items":[{"reported_datetime":"2026-05-22 4:01 pm Purchase","transaction_date":"2026-05-20","type":"13D","company_symbol":"OTHERCO INC OTHC","filed_by_symbol":"Fenwick Value Fund","shares_owned_owned":"2,000,000 8.000%","shares_vs_prev_report":"0 (Unchanged)","view_url":"https://www.secform4.example/13dg/1800002/0001800002-26-000020.html"}]}}

--- monid:secform4/get_institution_holders {"queryParams":{"cik":"1900001","symbol":"QLMT"}} ---
{"status":"success","data":{"currentQuarter":"2026Q3","quarterList":["2026-03-31","2026-06-30","2026-09-30"],"holderCntList":[402,415,431],"stockShareCntList":[51200000,52950000,55100000],"moneyflow":[0,0,0],"tableData":[],"al":-1}}
