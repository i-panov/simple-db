const _ = require('lodash')
const fs = require('fs')

const types = ['text', 'number', 'boolean', 'date', 'time', 'datetime', 'enum', 'list']

const defaultValues = {
  'string': '',
  'text': '',
  'number': 0,
  'boolean': false,
  'date': '',
  'time': '',
  'datetime': '',
  'enum': '',
  'list': {}
}

const typeMatching = {
  'string': 'string',
  'text': 'string',
  'number': 'number',
  'boolean': 'boolean',
  'date': 'string',
  'time': 'string',
  'datetime': 'string',
  'enum': 'string',
  'list': 'array'
}

const isTypeValid = (value, type) => {
  if (typeMatching.hasOwnProperty(type)) {
    if (typeMatching[type] === 'array') {
      return Array.isArray(value)
    }

    if (typeMatching[type] === 'object') {
      return _.isPlainObject(value)
    }

    // eslint-disable-next-line valid-typeof
    return typeof (value) === typeMatching[type]
  }

  return false
}

const sortByKeys = (collection, keys) => keys.reduce((acc, current) => {
  acc[current] = collection[current]
  return acc
}, {})

const loadJsonFile = filename => JSON.parse(fs.readFileSync(filename))

const saveJsonFile = (filename, data) => fs.writeFileSync(filename, JSON.stringify(data, '\t'))

const prepareData = data => {
  if (!_.isPlainObject(data)) {
    throw new TypeError('data is not object')
  }

  const rawColumns = data.hasOwnProperty('columns') && _.isPlainObject(data.columns) ? data.columns : {}
  const columns = _.pickBy(rawColumns, c => _.isPlainObject(c) && c.hasOwnProperty('type') && types.includes(c.type))

  const preparedColumns = _.mapValues(columns, schema => {
    if (['enum', 'list'].includes(schema.type) && (!schema.hasOwnProperty('options') || !_.isPlainObject(schema.options))) {
      schema.options = {}
    }

    return schema
  })

  const columnIds = Object.keys(preparedColumns)
  const rows = data.hasOwnProperty('rows') && Array.isArray(data.rows) ? data.rows : []

  const preparedRows = rows.filter(_.isPlainObject).map(row => {
    const rowKeys = Object.keys(row).filter(column => preparedColumns.hasOwnProperty(column) && isTypeValid(row[column], preparedColumns[column].type))
    const missingKeys = columnIds.filter(id => !rowKeys.includes(id))

    const cleanRow = rowKeys.reduce((acc, column) => {
      acc[column] = row[column]
      return acc
    }, {})

    const lostRow = missingKeys.reduce((acc, column) => {
      acc[column] = _.get(defaultValues, preparedColumns[column].type, null)
      return acc
    }, {})

    const finalRow = {...cleanRow, ...lostRow}
    return sortByKeys(finalRow, columnIds)
  })

  return {columns: preparedColumns, rows: preparedRows}
}

export {
  types, defaultValues, loadJsonFile, saveJsonFile, prepareData
}
