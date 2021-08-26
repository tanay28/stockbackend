var express = require("express");
var fs = require("fs");
var router = express.Router();
var datetime = require("node-datetime");
const e = require("express");

router.post("/upload", function(req, resp, next) {
  var db_conn = req.app.get("db_conn");
  var db_conn_temp = req.app.get("db_conn");
  let jdata = req.body;
  let stockData = [];
  let values = "";
  let values1 = "";
  stockDataInfo = JSON.parse(jdata.iDatas, true);
  for (let j = 0; j < stockDataInfo.length; j++) {
    values1 +=
      "('" +
      stockDataInfo[j].stock +
      "','" +
      stockDataInfo[j].from +
      "','" +
      stockDataInfo[j].to +
      "','" +
      stockDataInfo[j].createdAt +
      "','" +
      stockDataInfo[j].filename +
      "'),";
  }
  var lastChar = values1.slice(-1);
  if (lastChar == ",") {
    values1 = values1.slice(0, -1);
  }
  let sql_dataInfo =
    "INSERT INTO stockdatainfo(stockname,data_from,data_to,createdon,filename)VALUES" +
    values1;

  stockData = JSON.parse(jdata.sDatas, true);
  for (let i = 0; i < stockData.length; i++) {
    values +=
      "('" +
      stockData[i].timestamp +
      "'," +
      stockData[i].open +
      "," +
      stockData[i].high +
      "," +
      stockData[i].low +
      "," +
      stockData[i].close +
      ",'" +
      stockData[i].stockname +
      "'),";
  }
  var lastChar = values.slice(-1);
  if (lastChar == ",") {
    values = values.slice(0, -1);
  }

  let sql_data =
    "INSERT INTO stockdata(timestamp,open,high,low,close,stockname)VALUES" +
    values;
  db_conn.query(sql_data, function(err, result) {
    if (err) {
      res.status(500).json({ err });
    } else {
      db_conn_temp.query(sql_dataInfo, function(err1, result1) {
        if (err) {
          res.status(500).json({ err1 });
        } else {
          //---- Create Weekwise data -----//
          let data = [];
          let sql =
            "SELECT MAX(high) as maxhigh, MAX(low) as maxlow, timestamp as sdate, (timestamp + INTERVAL 6 DAY) as edate,stockname FROM stockdata GROUP by year(timestamp) , week(timestamp), stockname order by timestamp";
          var db_conn_sort = req.app.get("db_conn");
          db_conn_sort.query(sql, function(er, res) {
            if (!err) {
              if (res.length > 0) {
                let valuess = "";
                let mhigh = 0;
                let mlow = 0;
                for (let i = 0; i < res.length; i++) {
                  let highDiff = 0;
                  let lowDiff = 0;
                  highDiff = mhigh - res[i].maxhigh;
                  lowDiff = mlow - res[i].maxlow;
                  let start = datetime
                    .create(res[i].sdate)
                    .format("Y-m-d H:M:S");
                  let end = datetime.create(res[i].edate).format("Y-m-d H:M:S");
                  valuess +=
                    "(" +
                    res[i].maxhigh +
                    "," +
                    res[i].maxlow +
                    ",'" +
                    start +
                    "','" +
                    end +
                    "','" +
                    res[i].stockname +
                    "'," +
                    highDiff +
                    "," +
                    lowDiff +
                    "),";
                  mhigh = res[i].maxhigh;
                  mlow = res[i].maxlow;
                }
                var lastChar = valuess.slice(-1);
                if (lastChar == ",") {
                  valuess = valuess.slice(0, -1);
                }
                sql_in =
                  "INSERT INTO stockweeklydata(maxhigh,maxlow,weekstartdate,weekenddate,stockname,high_weekly_change,low_weekly_change)VALUES" +
                  valuess;
              }
              //console.log(sql_in);
              var db_conn_in = req.app.get("db_conn");
              db_conn_in.query(sql_in, function(errr, res11) {
                if (errr) {
                  res.status(500).json({ err });
                } else {
                  var rep = {
                    status: "success",
                    msg: "Successfully Inserted"
                  };
                  resp.send(rep);
                }
              });
            }
          });
          //db_conn_sort.close();
          //----------- END --------------//
        }
      });
    }
  });
  //------------ END -------------//
});

module.exports = router;
