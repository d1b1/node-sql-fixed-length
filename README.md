Node MYSQL Query to Text File
=====================

Command line script to connect to a MSQL Database, run a query and
output the rows as a fixed length text file. This was written to solve a
single use query. Added the command line options to make it easier to call
later, and to remove the need to tweak the SQL string.

Fun.

### Security
To keep from doing stupid end of the day mistakes, the db conn info must
is found in a db.jon file. Create this file in the root and all will work.

    ./db.json
    {
      "host"     : "localhost",
      "user"     : "root",
      "password" : "hacked-by-bobo",
      "database" : "myDB",
      "prefix"   : ""
    }

### Usage

    MYSQL Query to a text file.
    Usage: node ./index.js

    Options:
      -f, --from  From Date (YYYY-MM-DD)  [required]
      -t, --to    To Date (YYYY-MM-DD)    [required]
      -o, --out   Output file name        [required]

    Sample:
    node index.js -f 2014-01-01 -t 2014-02-01 -o myfile.txt

### Example

    node index.js -f 2014-07-01 -t 2014-08-01 -o myfile-new.txt
