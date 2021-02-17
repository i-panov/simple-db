<template>
  <div>
    <div>
      <modal name="add-column-modal" width="400" height="230">
        <div class="container" style="margin-top: 1em; margin-right: 1em">
          <div class="row mb-3">
            <label for="new_column_id" class="col-sm-3 col-form-label">ID</label>
            <div class="col-sm-9">
              <input class="form-control" id="new_column_id" v-model="newColumn.id">
            </div>
          </div>
          <div class="row mb-3">
            <label for="new_column_name" class="col-sm-3 col-form-label">Название</label>
            <div class="col-sm-9">
              <input class="form-control" id="new_column_name" v-model="newColumn.name">
            </div>
          </div>
          <div class="row mb-3">
            <label for="new_column_type" class="col-sm-3 col-form-label">Тип</label>
            <div class="col-sm-9">
              <select class="form-control" id="new_column_type" v-model="newColumn.type">
                <option v-for="option in types" :key="option">{{ option }}</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary float-right" @click="addColumn()">Сохранить</button>
        </div>
      </modal>
      <button class="btn btn-default" @click="save()">Сохранить</button>
      <button class="btn btn-default" @click="$modal.show('add-column-modal')">Добавить столбец</button>
      <button class="btn btn-default" @click="addRow()">Добавить строку</button>
    </div>
    <table>
      <tr>
        <th v-for="(column, id) in columns" :key="id">
          {{ column.name }} 
          <i class="fas fa-trash pointer" aria-hidden="true" title="Удалить" @click="removeColumn(id)"></i>
        </th>
        <th>Действия</th>
      </tr>
      <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
        <td v-for="cell in row" :key="cell.id">
          <input v-if="cell.schema.type === 'text'" type="text" v-model="cell.value">
          <input v-else-if="cell.schema.type === 'number'" type="number" v-model="cell.value">
          <input v-else-if="cell.schema.type === 'boolean'" type="checkbox" :checked="cell.value">
          <select v-else-if="cell.schema.type === 'enum'" v-model="cell.value">
            <option></option>
            <option v-for="option in cell.schema.options" :key="option.value" :value="option.value" :selected="cell.value === option.value">
              {{ option.name }}
            </option>
          </select>
          <select v-else-if="cell.schema.type === 'list'" multiple v-model="cell.value">
            <option v-for="option in cell.schema.options" :key="option.value" :value="option.value" :selected="cell.value.includes(option.value)">
              {{ option.name }}
            </option>
          </select>
        </td>
        <td><i class="fas fa-trash pointer" aria-hidden="true" title="Удалить" @click="removeRow(rowIndex)"></i></td>
      </tr>
    </table>
  </div>
</template>

<script>
const _ = require('lodash')
const utils = require('../utils')

export default {
  name: 'edit-page',
  data () {
    const basePath = _.get(this.$route.query, 'path', '')
    const baseData = utils.prepareData(utils.loadJsonFile(basePath))

    return {
      columns: baseData.columns,
      rows: baseData.rows,
      newRow: baseData.newRow,
      types: utils.types,
      newColumn: {id: '', name: '', type: ''}
    }
  },
  methods: {
    removeColumn (id) {
      if (confirm('Вы уверены что хотите удалить этот столбец?')) {
        this.$delete(this.columns, id)
      }
    },
    removeRow (index) {
      if (confirm('Вы уверены что хотите удалить эту строку?')) {
        this.rows.splice(index, 1)
      }
    },
    addRow () {
      this.rows.push(this.newRow)
    },
    addColumn () {
      this.columns[this.newColumn.id] = {name: this.newColumn.name, type: this.newColumn.type}
      this.newColumn.id = this.newColumn.name = this.newColumn.type = ''
      this.$modal.hide('add-column-modal')
    },
    save () {
      console.log(this.rows)
    }
  }
}
</script>

<style scoped>
  th, td { padding-right: 1em; }
  .pointer { cursor: pointer; }
</style>
