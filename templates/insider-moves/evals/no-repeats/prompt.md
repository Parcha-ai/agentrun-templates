---
description: "Second week for QLMT. Last week's window ended 2026-11-09. This week's search still lists two trades reported before that day, and one reported this morning. The report lists only the two trades reported from 2026-11-09 to yesterday."
runs: 2
max_cost_usd: 1.00
input:
  tickers: [QLMT]
  significant_buy_usd: 100000
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's insider moves with your insider-moves skill.

monid is not reachable from this run. The answers below are what each endpoint returns today for these inputs; use them
in place of calling. These companies, tickers, people and filings are test data.

--- monid:secform4/search {"queryParams":{"query":"QLMT"}} ---
{"status":"success","data":{"query":"QLMT","results":[
{"transaction_date":"2026-11-16 Sale","reported_datetime":"2026-11-16 7:05 am","company":"Quillmont Systems Inc.","symbol":"QLMT","insider_relationship":"VANCE ROBERT CFO","shares_traded":"3,000","average_price":"$40.90","total_amount":"$122,700","shares_owned":"207,400 (Direct)","filing_url":"https://www.secform4.example/filings/1900001/0001900001-26-000104.htm"},
{"transaction_date":"2026-11-11 Purchase","reported_datetime":"2026-11-12 5:10 pm","company":"Quillmont Systems Inc.","symbol":"QLMT","insider_relationship":"HARLOW DENISE M Director","shares_traded":"30,000","average_price":"$40.10","total_amount":"$1,203,000","shares_owned":"130,000 (Direct)","filing_url":"https://www.secform4.example/filings/1900001/0001900001-26-000101.htm"},
{"transaction_date":"2026-11-07 Sale","reported_datetime":"2026-11-09 9:15 am","company":"Quillmont Systems Inc.","symbol":"QLMT","insider_relationship":"VANCE ROBERT CFO","shares_traded":"12,000","average_price":"$41.25","total_amount":"$495,000","shares_owned":"210,400 (Direct)","filing_url":"https://www.secform4.example/filings/1900001/0001900001-26-000097.htm"},
{"transaction_date":"2026-11-06 Purchase","reported_datetime":"2026-11-08 5:00 pm","company":"Quillmont Systems Inc.","symbol":"QLMT","insider_relationship":"HARLOW DENISE M Director","shares_traded":"10,000","average_price":"$38.00","total_amount":"$380,000","shares_owned":"100,000 (Direct)","filing_url":"https://www.secform4.example/filings/1900001/0001900001-26-000090.htm"},
{"transaction_date":"2026-11-04 Sale","reported_datetime":"2026-11-06 6:30 pm","company":"Quillmont Systems Inc.","symbol":"QLMT","insider_relationship":"PARK EUGENE Chief Accounting Officer","shares_traded":"2,000","average_price":"$37.10","total_amount":"$74,200","shares_owned":"8,000 (Direct)","filing_url":"https://www.secform4.example/filings/1900001/0001900001-26-000086.htm"}]}}

--- monid:finviz/get_insider_trading {"queryParams":{"min_value":100000}} ---
{"status":"success","data":{"items":[{"Ticker":"QLMT","Owner":"Harlow Denise M","Relationship":"Director","Date":"Nov 11 '26","Transaction":"Buy","Cost":"40.10","#Shares":"30,000","Value ($)":"1,203,000","#Shares Total":"130,000","SEC Form 4":"Nov 12 05:10 PM","SEC Form 4 URL":"https://www.sec.example/Archives/edgar/data/1900001/000190000126000101/form4.xml"}]}}

--- monid:secform4/get_13d_filings {} ---
{"status":"success","data":{"items":[{"reported_datetime":"2026-05-22 4:01 pm Purchase","transaction_date":"2026-05-20","type":"13D","company_symbol":"OTHERCO INC OTHC","filed_by_symbol":"Fenwick Value Fund","shares_owned_owned":"2,000,000 8.000%","shares_vs_prev_report":"0 (Unchanged)","view_url":"https://www.secform4.example/13dg/1800002/0001800002-26-000020.html"}]}}

--- monid:secform4/get_institution_holders {"queryParams":{"cik":"1900001","symbol":"QLMT"}} ---
{"status":"success","data":{"currentQuarter":"2026Q3","quarterList":["2026-03-31","2026-06-30","2026-09-30"],"holderCntList":[402,415,431],"stockShareCntList":[51200000,52950000,55100000],"moneyflow":[0,0,0],"tableData":[],"al":-1}}

The result of this trigger's last completed run:

```json
{"window":{"from":"2026-11-02","to":"2026-11-09"},"quiet":false,"tickers":[{"ticker":"QLMT","company":"Quillmont Systems Inc.","cik":"1900001","status":"read"}],"trades":[{"ticker":"QLMT","insider":"Denise M Harlow","role":"Director","kind":"buy","traded":"2026-11-06","reported":"2026-11-08","shares":10000,"price_usd":38,"value_usd":380000,"significant":true,"filing_url":"https://www.secform4.example/filings/1900001/0001900001-26-000090.htm","source":"secform4"},{"ticker":"QLMT","insider":"Eugene Park","role":"Chief Accounting Officer","kind":"sell","traded":"2026-11-04","reported":"2026-11-06","shares":2000,"price_usd":37.1,"value_usd":74200,"significant":false,"filing_url":"https://www.secform4.example/filings/1900001/0001900001-26-000086.htm","source":"secform4"}],"thirteen_d":[],"thirteen_d_list_through":"2026-05-22","institutions":[{"ticker":"QLMT","quarter":"2026-09-30","holders":431,"shares_held":55100000,"prev_quarter":"2026-06-30","prev_holders":415,"prev_shares_held":52950000}],"could_not_check":["monid's 13D list only runs through 2026-05-22."],"ignored_instructions":[],"monid_calls":4,"disclaimer":"This is not investment advice.","report_markdown":"## Insider moves: QLMT, 2026-11-02 to 2026-11-09"}
```
