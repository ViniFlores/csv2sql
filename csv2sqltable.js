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
const split_character = config.split_char

/* Table Name */
const table_name = process.argv.slice(2)[1]

async function main() {
  con.connect(async err => {
    if (err) throw err
    console.log('Successfully connected to database!')
    let columns = liner.next()
    lineNumber += 1

    /* Create table if not exist */
    await createTable(con, columns)

    let lines = []
    do {
      lines = []
      for(let i = 0; i < config.insert_number; i++){
        let line = liner.next()
        if (line) {
          lines.push(line)
          lineNumber += 1
        }
      }
      if (lines.length > 0) {
        await insertLine(con, lines)
      }
      console.log(`Inserted lines: ${lineNumber}`)
    } while (lines.length > 0)
    
    console.log('Successfully imported text file to table.')
    con.destroy()
  })
  return
}

function insertLine(con, lines) {
  return new Promise((resolve, reject) => {
    let sql = "INSERT IGNORE INTO `" + table_name + "` VALUES "
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

function createTable(con, line) {
  return new Promise((resolve, reject) => {
    let sql = `CREATE TABLE IF NOT EXISTS ${table_name} (`
    let values = line.toString('utf-8').split(split_character)
    for(let i = 0; i < values.length; i++) {
      sql += "`" + values[i] + "` VARCHAR(255)"
      if (i + 1 != values.length) sql+= ", "
    }
    sql += ");"

    console.log('Creating table if not exists...')

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