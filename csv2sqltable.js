const mysql = require('mysql')
const lineByLine = require('n-readlines');
const fs = require('fs')

/* Connection to MySQL DB */
const config = require('./config.json')
const con = mysql.createConnection(config)

/* Arg CSV */
const liner = new lineByLine(process.argv.slice(2)[0]);
let line;
let lineNumber = 0;
const split_character = '\t'

/* Table Name */
const table_name = process.argv.slice(2)[1]

async function main() {
  con.connect(async err => {
    if (err) throw err
    console.log('Connected!')
    let columns = liner.next()
    lineNumber += 1

    let lines = []
    do {
      lines = []
      for(let i = 0; i < 40000; i++){
        let line = liner.next()
        if (line) {
          lines.push(liner.next())
          lineNumber += 1
        }
      }
      if (lines.length > 0) {
        await insertLine(con, lines)
      }
      console.log(lineNumber)
    } while (lines.length > 0)
    return
  })
  return
}

function insertLine(con, lines) {
  return new Promise((resolve, reject) => {
    let sql = "INSERT INTO `" + table_name + "` VALUES "
    for(let i = 0; i < lines.length; i++) {
      sql += "("
      let values = lines[i].toString('utf-8').split(split_character)
      for(let j = 0; j < values.length; j++) {
        if(values[j] != "\\N")
          sql += `"` + mysqlEscape(values[j]) + `"`
        else sql += 'NULL'
        if (j + 1 < values.length)
          sql += ", "
        else (sql += ")")
      }
      if (i + 1 < lines.length) sql += ", "
    }
    sql += ";"

    con.query(sql, (err, result) => {
      if(err) throw err
      resolve(result)
    })
  })
}

function mysqlEscape(stringToEscape){
  if(stringToEscape == '') {
    return stringToEscape;
  }

  return stringToEscape
    .replace(/\\/g, "\\\\")
    .replace(/\'/g, "\\\'")
    .replace(/\"/g, "\\\"")
    .replace(/\n/g, "\\\n")
    .replace(/\r/g, "\\\r")
    .replace(/\x00/g, "\\\x00")
    .replace(/\x1a/g, "\\\x1a");
}

main()