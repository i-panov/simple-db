<template>
  <div>
    <table>
      <tr>
        <th v-for="column in columns" :key="column">{{ column }}</th>
      </tr>
      <tr v-for="row in rows" :key="row">
        <td v-for="cell in row" :key="cell">
          <input v-if="cell.schema.type === 'text'" type="text" :value="cell.value">
          <input v-else-if="cell.schema.type === 'number'" type="number" :value="cell.value">
          <input v-else-if="cell.schema.type === 'boolean'" type="checkbox" :checked="cell.value">
          <select v-else-if="cell.schema.type === 'enum'">
            <option></option>
            <option v-for="option in cell.schema.options" :key="option" :value="option.value" :selected="cell.value === option.value">{{ option.name }}</option>
          </select>
          <select v-else-if="cell.schema.type === 'list'" multiple>
            <option></option>
            <option v-for="option in cell.schema.options" :key="option" :value="option.value" :selected="cell.value.includes(option.value)">{{ option.name }}</option>
          </select>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
const _ = require('lodash')

const baseData = {
  columns: {
    'text': {name: 'Text column', type: 'text'},
    'number': {name: 'Number column', type: 'number'},
    'boolean': {name: 'Boolean column', type: 'boolean'},
    'enum': {name: 'Enum column', type: 'enum', options: [{value: 'p1', name: 'Option 1'}, {value: 'p2', name: 'Option 2'}]},
    'list': {name: 'List column', type: 'list', options: [{value: 'p3', name: 'Option 3'}, {value: 'p4', name: 'Option 4'}, {value: 'p5', name: 'Option 5'}]}
  },
  rows: [
    {'text': 'text value', 'number': 123, 'enum': 'p2', 'list': ['p1', 'p2'], 'boolean': true},
    {'text': 'text value #2', 'number': 456}
  ]
}

const columnIds = Object.keys(baseData.columns)
const columnIdsInverted = _.invert(columnIds)
const columns = columnIds.map(key => baseData.columns[key].name)

const getDefaultColumnValue = schema => {
  switch (schema.type) {
    case 'text': return ''
    case 'number': return 0
    case 'boolean': return false
    case 'enum': return ''
    case 'list': return []
    default: return null
  }
}

const preparedRows = baseData.rows.map(row => {
  const rowKeys = Object.keys(row).filter(column => baseData.columns.hasOwnProperty(column))
  const missingKeys = columnIds.filter(id => !rowKeys.includes(id))

  const inputValues = rowKeys.map(column => ({
    id: column,
    value: row[column],
    schema: baseData.columns[column]
  }))

  const defaultValuesForMissingKeys = missingKeys.map(key => ({
    id: key,
    schema: baseData.columns[key],
    value: getDefaultColumnValue(baseData.columns[key])
  }))

  return inputValues.concat(defaultValuesForMissingKeys).sort((l, r) => columnIdsInverted[l.id] - columnIdsInverted[r.id])
})

export default {
  name: 'edit-page',
  data () {
    console.log({preparedRows, columns})

    return {
      columns: columns,
      rows: preparedRows
    }
  }
}
</script>

<style scoped>
</style>
