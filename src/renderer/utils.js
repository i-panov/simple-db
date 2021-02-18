const _ = require('lodash')
const fs = require('fs')

const types = ['text', 'number', 'boolean', 'date', 'time', 'datetime', 'enum', 'list']

const defaultValues = {
  'text': '',
  'number': 0,
  'boolean': false,
  'date': '',
  'time': '',
  'datetime': '',
  'enum': '',
  'list': []
}

const sortByKeys = (collection, keys) => keys.reduce((acc, current) => {
  acc[current] = collection[current]
  return acc
}, {})

const loadJsonFile = filename => JSON.parse(fs.readFileSync(filename))

const saveJsonFile = (filename, data) => fs.writeFileSync(filename, JSON.stringify(data, '\t'))

const prepareData = data => {
  if (!_.isObject(data)) {
    throw new TypeError('data is not object')
  }

  const rawColumns = data.hasOwnProperty('columns') && _.isObject(data.columns) ? data.columns : {}
  const columns = _.pickBy(rawColumns, c => _.isObject(c) && c.hasOwnProperty('type') && types.includes(c.type))
  const columnIds = Object.keys(columns)
  const rows = data.hasOwnProperty('rows') && Array.isArray(data.rows) ? data.rows : []

  const preparedRows = rows.filter(_.isObject).map(row => {
    const rowKeys = Object.keys(row).filter(column => columns.hasOwnProperty(column))
    const missingKeys = columnIds.filter(id => !rowKeys.includes(id))

    const cleanRow = rowKeys.reduce((acc, column) => {
      acc[column] = rows[column]
      return acc
    }, {})

    const lostRow = missingKeys.reduce((acc, column) => {
      acc[column] = _.get(defaultValues, columns[column].type, null)
      return acc
    })

    const finalRow = {...cleanRow, ...lostRow}
    return sortByKeys(finalRow, columnIds)
  })

  return {columns, rows: preparedRows}
}

export {
  types, defaultValues, loadJsonFile, saveJsonFile, prepareData
}
