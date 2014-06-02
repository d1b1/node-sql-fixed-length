Node MYSQL Query to Text File
=====================

Command line script to connect to a MSQL Database, run a query and
output the rows as a fixed length text file. This was written to solve a
single use query. Added the command line options to make it easier to call
later, and to remove the need to tweak the SQL string.

Fun.

### Usage

    node index.js --help
    node index.js -f 2014-01-01 -t 2014-02-01 -o myfile.txt
