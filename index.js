var mysql      = require('mysql');
var fs         = require('fs');
var _          = require('underscore');
var moment     = require('moment');
var db         = require('./db.json');
var help       = require('./helpers');

var argv = require('optimist')
    .usage('Creates an Export for Reporting.\nUsage: $0')
    .demand('f').alias('f', 'from').describe('f', 'From Date (YYYY-MM-DD)')
    .demand('t').alias('t', 'to').describe('t', 'To Date (YYYY-MM-DD)')
    .demand('o').alias('o', 'out').describe('o', 'Output file name')
    .argv
;

var padl = help.padl;
var padr = help.padr;

var connection = mysql.createConnection({
  host     : db.host,
  user     : db.user,
  password : db.password,
  database : db.database
});

connection.connect();

var sql = 'SELECT d_users.id, d_users.name, d_users.email, \
           d_users.addr_zipcode, d_users.customfields, \
           d_userrewards.rewardid \
           FROM d_users \
           JOIN d_userrewards ON d_userrewards.userid = d_users.id \
           WHERE d_userrewards.timestamp > unix_timestamp(\'' + argv.from + '\') \
                 AND d_userrewards.timestamp < unix_timestamp(\'' + argv.to + '\') \
                 AND (d_userrewards.rewardid = 80 OR d_userrewards.rewardid = 81) \
          ';

connection.query(sql, function(err, rows, fields) {
  if (err) throw err;

  if (rows.length == 0) {
    console.log('No Records Found.');
    return;
  }

  console.log('Exporting ' + rows.length + ' records to ' + argv.out );

  var stream = fs.createWriteStream(argv.out, { flags : 'w' });


  var del = ' ';

  var currentDate = moment().format('MM/DD/YYYY');

  // Examle Header
  // 01 USB ADLYFFLEX 02/03/2014 001
  var header = '01' + 'USBA' + 'DLYFFLEX' + currentDate + '001';

  stream.write(header + '\r');

  _.each(rows, function(i) {
    var n = i.name.split(' ');
    var p = i.customfields.split('|');
    var pp1 = p[0].split(':');
    var pp2 = p[1].split(':');
    var amount = '';
    if (i.rewardid == 80) amount = '250';
    if (i.rewardid == 81) amount = '500';

    // console.log(pp1, pp2);
    var s = '02'                                         // Record Identifier, 2
      + padr( pp1[1].substr(0, 20).trim(), del, 20)      // Account ID, 20
      + 'L'                                              // Loyalty Flat, 1
      + padr( (n[1] ? n[1].trim().substr(0, 26) : ''), del, 26)        // Last Name, 26
      + padr( (n[0] ? n[0].trim().substr(0, 26) : ''), del, 26)        // First Name, 26
      + padr( (i.addr_zipcode || '').replace('-','').trim().substr(0, 9), '0', 10) + ' '  // ZipCode, 10
      + padr('', 0, 14)                                  // Reward Amt, 25 Code: 80/81
      + padl(amount, '0', 18)                            // Reward Unit, 18
      + '+'                                              // Reward Sign, 1
      + currentDate                                      // Trans Date, 10
      + 'DLF'                                            // Partner Code, 3
      + '00000000541';                                   // Activity Code, 11

    stream.write(s + '\r');
  });

  // Example Footer:
  // 09 USBA DLYFFLEX 0000000012
  var footer = '09USBA' + 'DLYFFLEX' + padl(rows.length.toString(), '0', 10) + '\r';

  stream.write(footer);
});

connection.end();
