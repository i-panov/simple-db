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

  return {columns, rows: preparedRows}
}

const saveBase = (filename, columns, rows) => {
  const rowValues = rows.map(row => _.mapValues(_.mapKeys(row, 'id'), 'value'))
  saveJsonFile(filename, {columns, rows: rowValues})
}

export {
  types, defaultValues, loadJsonFile, prepareData, saveBase
}
