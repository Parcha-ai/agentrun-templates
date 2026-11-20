---
description: "First week for a two-ticker watchlist. One company has a $1.2M director buy, a small officer buy and a sale reported in the window beside older filings; the other has a CEO sale and a planned sale that only Finviz shows. The 13D list is months old. The report flags only the large buy as significant, calls the planned sale planned, links each filing, gives each company's institutional holder counts for the last two quarters, says the 13D list could not show this week, and says it is not investment advice."
runs: 2
max_cost_usd: 1.00
input:
  tickers: [QLMT, BRVX]
  significant_buy_usd: 100000
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's insider moves with your insider-moves skill.
There is no previous run.

monid is not reachable from this run. The answers below are what each endpoint returns today for these inputs; use them
in place of calling. These companies, tickers, people and filings are test data.

--- monid:secform4/search {"queryParams":{"query":"QLMT"}} ---
{"status":"success","data":{"query":"QLMT","results":[
{"transaction_date":"2026-11-12 Purchase","reported_datetime":"2026-11-13 5:10 pm","company":"Quillmont Systems Inc.","symbol":"QLMT","insider_relationship":"HARLOW DENISE M Director","shares_traded":"30,000","average_price":"$40.10","total_amount":"$1,203,000","shares_owned":"130,000 (Direct)","filing_url":"https://www.secform4.example/filings/1900001/0001900001-26-000101.htm"},
{"transaction_date":"2026-11-11 Purchase","reported_datetime":"2026-11-12 4:00 pm","company":"Quillmont Systems Inc.","symbol":"QLMT","insider_relationship":"PARK EUGENE Chief Accounting Officer","shares_traded":"500","average_price":"$39.80","total_amount":"$19,900","shares_owned":"8,500 (Direct)","filing_url":"https://www.secform4.example/filings/1900001/0001900001-26-000099.htm"},
{"transaction_date":"2026-11-09 Sale","reported_datetime":"2026-11-10 6:30 pm","company":"Quillmont Systems Inc.","symbol":"QLMT","insider_relationship":"VANCE ROBERT CFO","shares_traded":"12,000","average_price":"$41.25","total_amount":"$495,000","shares_owned":"210,400 (Direct)","filing_url":"https://www.secform4.example/filings/1900001/0001900001-26-000097.htm"},
{"transaction_date":"2026-11-05 Purchase","reported_datetime":"2026-11-06 5:00 pm","company":"Quillmont Systems Inc.","symbol":"QLMT","insider_relationship":"HARLOW DENISE M Director","shares_traded":"10,000","average_price":"$38.00","total_amount":"$380,000","shares_owned":"100,000 (Direct)","filing_url":"https://www.secform4.example/filings/1900001/0001900001-26-000090.htm"},
{"transaction_date":"2026-11-16 Sale","reported_datetime":"2026-11-16 7:05 am","company":"Quillmont Systems Inc.","symbol":"QLMT","insider_relationship":"VANCE ROBERT CFO","shares_traded":"3,000","average_price":"$40.90","total_amount":"$122,700","shares_owned":"207,400 (Direct)","filing_url":"https://www.secform4.example/filings/1900001/0001900001-26-000104.htm"}]}}

--- monid:secform4/search {"queryParams":{"query":"BRVX"}} ---
{"status":"success","data":{"query":"BRVX","results":[
{"transaction_date":"2026-11-10 Sale","reported_datetime":"2026-11-12 6:30 pm","company":"Brevix Therapeutics","symbol":"BRVX","insider_relationship":"OKAFOR LINDA Chief Executive Officer","shares_traded":"25,000","average_price":"$18.40","total_amount":"$460,000","shares_owned":"1,040,000 (Direct)","filing_url":"https://www.secform4.example/filings/1900002/0001900002-26-000201.htm"},
{"transaction_date":"2026-11-02 Option Exercise","reported_datetime":"2026-11-04 5:00 pm","company":"Brevix Therapeutics","symbol":"BRVX","insider_relationship":"OKAFOR LINDA Chief Executive Officer","shares_traded":"40,000","average_price":"$4.00","total_amount":"$160,000","shares_owned":"1,065,000 (Direct)","filing_url":"https://www.secform4.example/filings/1900002/0001900002-26-000195.htm"}]}}

--- monid:finviz/get_insider_trading {"queryParams":{"min_value":100000}} ---
{"status":"success","data":{"items":[
{"Ticker":"QLMT","Owner":"Harlow Denise M","Relationship":"Director","Date":"Nov 12 '26","Transaction":"Buy","Cost":"40.10","#Shares":"30,000","Value ($)":"1,203,000","#Shares Total":"130,000","SEC Form 4":"Nov 13 05:10 PM","SEC Form 4 URL":"https://www.sec.example/Archives/edgar/data/1900001/000190000126000101/form4.xml"},
{"Ticker":"BRVX","Owner":"Mensah Kofi","Relationship":"Chief Medical Officer","Date":"Nov 20 '26","Transaction":"Proposed Sale","Cost":"18.10","#Shares":"15,000","Value ($)":"271,500","#Shares Total":"","SEC Form 4":"Nov 14 04:40 PM","SEC Form 4 URL":"https://www.sec.example/Archives/edgar/data/1900002/000190000226000210/primary_doc.xml"},
{"Ticker":"ZZTP","Owner":"Ito Ken","Relationship":"Director","Date":"Nov 12 '26","Transaction":"Buy","Cost":"9.00","#Shares":"50,000","Value ($)":"450,000","#Shares Total":"90,000","SEC Form 4":"Nov 13 09:00 AM","SEC Form 4 URL":"https://www.sec.example/Archives/edgar/data/1900009/000190000926000011/form4.xml"}]}}

--- monid:secform4/get_13d_filings {} ---
{"status":"success","data":{"items":[
{"reported_datetime":"2026-05-22 4:01 pm Purchase","transaction_date":"2026-05-20","type":"13D","company_symbol":"QUILLMONT SYSTEMS INC QLMT","filed_by_symbol":"Larchmere Partners LP","shares_owned_owned":"4,100,000 6.100%","shares_vs_prev_report":"400,000 (+10.81%)","view_url":"https://www.secform4.example/13dg/1800001/0001800001-26-000050.html"},
{"reported_datetime":"2026-05-21 3:30 pm Unchanged","transaction_date":"2026-05-18","type":"13D","company_symbol":"OTHERCO INC OTHC","filed_by_symbol":"Fenwick Value Fund","shares_owned_owned":"2,000,000 8.000%","shares_vs_prev_report":"0 (Unchanged)","view_url":"https://www.secform4.example/13dg/1800002/0001800002-26-000020.html"}]}}

--- monid:secform4/get_institution_holders {"queryParams":{"cik":"1900001","symbol":"QLMT"}} ---
{"status":"success","data":{"currentQuarter":"2026Q3","quarterList":["2026-03-31","2026-06-30","2026-09-30"],"holderCntList":[402,415,431],"stockShareCntList":[51200000,52950000,55100000],"moneyflow":[0,0,0],"tableData":[{"holder":"Example Index Fund","sharesChanged":5100000,"newShares":5100000}],"al":-1}}

--- monid:secform4/get_institution_holders {"queryParams":{"cik":"1900002","symbol":"BRVX"}} ---
{"status":"success","data":{"currentQuarter":"2026Q3","quarterList":["2026-03-31","2026-06-30","2026-09-30"],"holderCntList":[188,176,160],"stockShareCntList":[30100000,28800000,26400000],"moneyflow":[0,0,0],"tableData":[],"al":-1}}
