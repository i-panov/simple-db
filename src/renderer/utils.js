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

// eslint-disable-next-line no-unused-vars
const flip = collection => {
  const result = {}

  for (const key in collection) {
    result[collection[key]] = key
  }

  return result
}

// eslint-disable-next-line no-unused-vars
const sortByKeys = (collection, keys) => keys.reduce((acc, current) => {
  acc[current] = collection[current]
  return acc
}, {})

// eslint-disable-next-line no-unused-vars
const sortObjectByKeys = (obj, comparator = null) => Object.keys(obj).sort(comparator).reduce((acc, key) => {
  acc[key] = obj[key]
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
  const columnIdsInverted = _.invert(columnIds)
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
    return sortObjectByKeys(finalRow, (l, r) => columnIdsInverted[l] - columnIdsInverted[r])
  })

  return {columns, rows: preparedRows}
}

export {
  types, defaultValues, loadJsonFile, saveJsonFile, prepareData
}
