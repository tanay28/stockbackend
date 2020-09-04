var express = require("express");
var fs = require("fs");
var router = express.Router();

router.post("/upload", function (req, res, next) {
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
  // db_conn.query(sql_data, function (err, result) {
  //   if (err) {
  //     res.status(500).json({ err });
  //   } else {
  //     db_conn_temp.query(sql_dataInfo, function (err1, result1) {
  //       if (err) {
  //         res.status(500).json({ err1 });
  //       } else {
  //         var rep = {
  //           status: "success",
  //           msg: "Successfully Inserted"
  //         };
  //         res.send(rep);
  //       }
  //     });
  //   }
  // });

  //---- Create Weekwise date -----//
  let dates = [];
  for (let j = 0; j < stockDataInfo.length; j++) {
    let stockName = stockDataInfo[j].stock;
    let from = new Date(stockDataInfo[j].from);
    let AddDaysHere = 7;
    // let endDate = new Date(
    //   new Date(stockDataInfo[j].from).setDate(
    //     new Date(stockDataInfo[j].from).getDate() + AddDaysHere
    //   )
    // );
    // console.log("start", from);

    var endDate = new Date(
      from.setTime(from.getTime() + AddDaysHere * 86400000)
    );

    //console.log("end", endDate);
    //return;

    while (endDate < new Date(stockDataInfo[j].to)) {
      console.log("start", from);
      console.log("end", endDate);

      let tmp = from;
      from = endDate;
      endDate = new Date(tmp.setTime(tmp.getTime() + AddDaysHere * 86400000));

      console.log("astart", from);
      console.log("tmp", tmp);
      console.log("endDate", endDate);
      return;
    }
  }
  dates.status = "success";
  res.send(dates);
  //------------ END -------------//
});

module.exports = router;
