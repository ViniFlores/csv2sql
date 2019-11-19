# csv2sqltable ![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)
Parses spreadsheets and insert into a SQL Table.

## Usage
Clone it and run:
```sh
npm install
node csv2sqltable.js <path_to_file> <table_name>
```

## Configuration
```json
{
  "host": "localhost",
  "user": "root",
  "password": "",
  "database": "mydb",
  "split_char": ",",
  "insert_number": 30000
}
```