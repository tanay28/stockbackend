var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var datetime = require("node-datetime");
var BCRYPT_SALT_ROUNDS = 12;
require("dotenv").config();
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/register", function (req, res, next) {
  var db_conn = req.app.get("db_conn");
  var name = req.body.name;
  var email = req.body.email;
  var phoneNo = req.body.phoneNo;
  var password = req.body.password;
  var hash_pass;

  bcrypt.hash(password, BCRYPT_SALT_ROUNDS, function (err, hash) {
    hash_pass = hash;
    var obj = {
      name: name,
      phone: phoneNo,
      email: email,
      password: hash_pass
    };

    db_conn.query("INSERT INTO user_master SET ?", obj, function (err, result) {
      //if(err) throw err
      if (err) {
        ///console.log(err);
        res.status(500).json({ err });
      } else {
        var rep = {
          status: "success",
          msg: "Successfully Inserted"
        };
        res.send(rep);
      }
    });

    //console.log('here im'+hash_pass)
  });
});

router.post("/authenticate", function (req, res, next) {
  var db_conn = req.app.get("db_conn");
  var email = req.body.username;
  var password = req.body.password;

  db_conn.query(
    "SELECT * FROM user_master WHERE email = " + db_conn.escape(email),
    function (err, result) {
      //if(err) throw err
      if (err) {
        //console.log(err);
        res.status(403).json({ err });
      } else {
        if (result.length > 0) {
          bcrypt.compare(password, result[0].password, function (err, match) {
            if (match) {
              // Passwords match
              //console.log('match')
              var token = jwt.sign(
                {
                  id: result[0].id,
                  email: result[0].email,
                  name: result[0].name
                },
                process.env.API_SECRET,
                {
                  expiresIn: 86400 // expires in 24 hours
                }
              );

              var dt = datetime.create();
              var user_id = result[0].id;
              var login_time = dt.format("Y-m-d H:M:S");
              sql1 =
                "INSERT INTO login_details(user_id,login_time)VALUES(" +
                db_conn.escape(user_id) +
                "," +
                db_conn.escape(login_time) +
                ")";
              db_conn.query(sql1, function (err, log_result) {
                if (err) {
                  //console.log(err);
                  res.status(403).json({ err });
                } else {
                  //res.status(200).send(log_result);
                  //console.log(log_result);
                  res.status(200).send({ auth: true, token: token });
                }
              });
            } else {
              res.status(403).send({ message: "Wrong Password" });
              // Passwords don't match
            }
          });
        } else {
          res.status(400).send({ message: "Email address not found" });
        }
      }
    }
  );
});

module.exports = router;
