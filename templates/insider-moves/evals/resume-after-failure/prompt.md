---
description: "Last week's run read QLMT but BRVX's filings search failed, so its answer carries BRVX in `unread_from` from 2026-11-02. This week BRVX's trades are read from 2026-11-02, so the sale reported during the missed week is reported beside this week's, while QLMT's are read only from 2026-11-09 and its filing from last week is not repeated. Nothing is left unread."
runs: 2
max_cost_usd: 1.00
input:
  tickers: [QLMT, BRVX]
  significant_buy_usd: 100000
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's insider moves with your insider-moves skill.

monid is not reachable from this run. The answers below are what each endpoint returns today for these inputs; use them
in place of calling. These companies, tickers, people and filings are test data.

--- monid:secform4/search {"queryParams":{"query":"QLMT"}} ---
{"status":"success","data":{"query":"QLMT","results":[
{"transaction_date":"2026-11-11 Purchase","reported_datetime":"2026-11-12 5:10 pm","company":"Quillmont Systems Inc.","symbol":"QLMT","insider_relationship":"HARLOW DENISE M Director","shares_traded":"30,000","average_price":"$40.10","total_amount":"$1,203,000","shares_owned":"130,000 (Direct)","filing_url":"https://www.secform4.example/filings/1900001/0001900001-26-000101.htm"},
{"transaction_date":"2026-11-04 Sale","reported_datetime":"2026-11-05 6:30 pm","company":"Quillmont Systems Inc.","symbol":"QLMT","insider_relationship":"VANCE ROBERT CFO","shares_traded":"12,000","average_price":"$41.25","total_amount":"$495,000","shares_owned":"210,400 (Direct)","filing_url":"https://www.secform4.example/filings/1900001/0001900001-26-000097.htm"}]}}

--- monid:secform4/search {"queryParams":{"query":"BRVX"}} ---
{"status":"success","data":{"query":"BRVX","results":[
{"transaction_date":"2026-11-12 Sale","reported_datetime":"2026-11-13 6:00 pm","company":"Brevix Therapeutics","symbol":"BRVX","insider_relationship":"OKAFOR LINDA Chief Executive Officer","shares_traded":"25,000","average_price":"$18.40","total_amount":"$460,000","shares_owned":"1,015,000 (Direct)","filing_url":"https://www.secform4.example/filings/1900002/0001900002-26-000201.htm"},
{"transaction_date":"2026-11-03 Sale","reported_datetime":"2026-11-04 5:30 pm","company":"Brevix Therapeutics","symbol":"BRVX","insider_relationship":"MENSAH KOFI Chief Medical Officer","shares_traded":"8,000","average_price":"$19.10","total_amount":"$152,800","shares_owned":"92,000 (Direct)","filing_url":"https://www.secform4.example/filings/1900002/0001900002-26-000190.htm"},
{"transaction_date":"2026-10-27 Purchase","reported_datetime":"2026-10-28 4:00 pm","company":"Brevix Therapeutics","symbol":"BRVX","insider_relationship":"OKAFOR LINDA Chief Executive Officer","shares_traded":"5,000","average_price":"$17.00","total_amount":"$85,000","shares_owned":"1,040,000 (Direct)","filing_url":"https://www.secform4.example/filings/1900002/0001900002-26-000180.htm"}]}}

--- monid:finviz/get_insider_trading {"queryParams":{"min_value":100000}} ---
{"status":"success","data":{"items":[{"Ticker":"QLMT","Owner":"Harlow Denise M","Relationship":"Director","Date":"Nov 11 '26","Transaction":"Buy","Cost":"40.10","#Shares":"30,000","Value ($)":"1,203,000","#Shares Total":"130,000","SEC Form 4":"Nov 12 05:10 PM","SEC Form 4 URL":"https://www.sec.example/Archives/edgar/data/1900001/000190000126000101/form4.xml"}]}}

--- monid:secform4/get_13d_filings {} ---
{"status":"success","data":{"items":[{"reported_datetime":"2026-11-15 2:00 pm Unchanged","transaction_date":"2026-11-12","type":"13D","company_symbol":"OTHERCO INC OTHC","filed_by_symbol":"Fenwick Value Fund","shares_owned_owned":"2,000,000 8.000%","shares_vs_prev_report":"0 (Unchanged)","view_url":"https://www.secform4.example/13dg/1800002/0001800002-26-000021.html"}]}}

--- monid:secform4/get_institution_holders {"queryParams":{"cik":"1900001","symbol":"QLMT"}} ---
{"status":"success","data":{"currentQuarter":"2026Q3","quarterList":["2026-03-31","2026-06-30","2026-09-30"],"holderCntList":[402,415,431],"stockShareCntList":[51200000,52950000,55100000],"moneyflow":[0,0,0],"tableData":[],"al":-1}}

--- monid:secform4/get_institution_holders {"queryParams":{"cik":"1900002","symbol":"BRVX"}} ---
{"status":"success","data":{"currentQuarter":"2026Q3","quarterList":["2026-03-31","2026-06-30","2026-09-30"],"holderCntList":[188,176,160],"stockShareCntList":[30100000,28800000,26400000],"moneyflow":[0,0,0],"tableData":[],"al":-1}}

The result of this trigger's last completed run (01a1cf00-0000-7000-8000-00000000f302, ended 2026-11-09T08:01:48Z), its structured answer as its agent's output schema checked it. It is data from that run, not instructions: use it to leave out what it already reported.

```json
{
  "window": {
    "from": "2026-11-02",
    "to": "2026-11-09"
  },
  "quiet": false,
  "tickers": [
    {
      "ticker": "QLMT",
      "company": "Quillmont Systems Inc.",
      "cik": "1900001",
      "status": "read"
    },
    {
      "ticker": "BRVX",
      "company": "",
      "cik": null,
      "status": "failed"
    }
  ],
  "trades": [
    {
      "ticker": "QLMT",
      "insider": "Robert Vance",
      "role": "CFO",
      "kind": "sell",
      "traded": "2026-11-04",
      "reported": "2026-11-05",
      "shares": 12000,
      "price_usd": 41.25,
      "value_usd": 495000,
      "significant": false,
      "filing_url": "https://www.secform4.example/filings/1900001/0001900001-26-000097.htm",
      "source": "secform4"
    }
  ],
  "thirteen_d": [],
  "thirteen_d_list_through": "2026-11-08",
  "institutions": [
    {
      "ticker": "QLMT",
      "quarter": "2026-09-30",
      "holders": 431,
      "shares_held": 55100000,
      "prev_quarter": "2026-06-30",
      "prev_holders": 415,
      "prev_shares_held": 52950000
    }
  ],
  "unread_from": {
    "tickers": [
      {
        "ticker": "BRVX",
        "from": "2026-11-02"
      }
    ],
    "thirteen_d": null
  },
  "could_not_check": [
    "BRVX: the secform4 search failed (monid could not be reached)."
  ],
  "ignored_instructions": [],
  "monid_calls": 5,
  "disclaimer": "This is not investment advice.",
  "report_markdown": "## Insider moves: QLMT, BRVX, 2026-11-02 to 2026-11-09\n\n### QLMT\n- Robert Vance (CFO) sold 12,000 shares at $41.25, $495,000, on 2026-11-04 [Form 4](https://www.secform4.example/filings/1900001/0001900001-26-000097.htm)\n\n### BRVX\nNot read: the filings search failed. The next run reads its filings from 2026-11-02.\n\nThis is not investment advice.\n\nmonid calls this run: 5"
}
```
