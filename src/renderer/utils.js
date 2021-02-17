const _ = require('lodash')
const fs = require('fs')

const types = ['text', 'number', 'boolean', 'enum', 'list']

const defaultValues = {
  'text': '',
  'number': 0,
  'boolean': false,
  'enum': '',
  'list': []
}

const loadJsonFile = filename => JSON.parse(fs.readFileSync(filename))

const prepareData = data => {
  if (!_.isObject(data)) {
    throw new TypeError('data is not object')
  }

  const rawColumns = data.hasOwnProperty('columns') && _.isObject(data.columns) ? data.columns : {}
  const columns = _.pickBy(rawColumns, c => _.isObject(c) && c.hasOwnProperty('type') && types.includes(c.type))
  const columnIds = Object.keys(columns)
  const columnIdsInverted = _.invert(columnIds)
  const rows = data.hasOwnProperty('rows') && Array.isArray(data.rows) ? data.rows : []

  const preparedRows = rows.map(row => {
    const rowKeys = Object.keys(row).filter(column => columns.hasOwnProperty(column))
    const missingKeys = columnIds.filter(id => !rowKeys.includes(id))

    const inputValues = rowKeys.map(column => ({
      id: column,
      value: row[column],
      schema: columns[column]
    }))

    const defaultValuesForMissingKeys = missingKeys.map(key => ({
      id: key,
      schema: columns[key],
      value: _.get(defaultValues, columns[key].type, null)
    }))

    return inputValues
      .concat(defaultValuesForMissingKeys)
      .sort((l, r) => columnIdsInverted[l.id] - columnIdsInverted[r.id])
  })

  const newRow = columnIds.map(id => ({
    id,
    value: defaultValues[id],
    schema: columns[id]
  }))

  console.log(newRow, preparedRows[0])
  return {columns, rows: preparedRows, newRow}
}

export {
  types, loadJsonFile, prepareData
}
