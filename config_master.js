var config_master = {
  database: {
    host: "localhost",
    user: "root", // your database username
    password: "", // your database password
    port: 3306, // default MySQL port
    db: "stock" // your database name

    // host: "us-cdbr-east-02.cleardb.com",
    // user: "bbbe8f6bd71d87",
    // password: "aabd5a08",
    // db: "heroku_7d3412dad63100f",
    // port: 3306
  },
  server: {
    host: "127.0.0.1",
    port: "4000"
    //siteurl: "192.168.1.5:4200",
    //apiurl: "13.127.57.38"
  }
};

module.exports = config_master;
