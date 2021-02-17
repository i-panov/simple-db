<template>
  <div>
    <modal name="column-modal" width="400" height="230">
      <div class="container" style="margin-top: 1em; margin-right: 1em">
        <div class="row mb-3">
          <label for="new_column_id" class="col-sm-3 col-form-label">ID</label>
          <div class="col-sm-9">
            <input class="form-control" id="new_column_id" v-model="modalColumn.id">
          </div>
        </div>
        <div class="row mb-3">
          <label for="new_column_name" class="col-sm-3 col-form-label">Название</label>
          <div class="col-sm-9">
            <input class="form-control" id="new_column_name" v-model="modalColumn.name">
          </div>
        </div>
        <div class="row mb-3">
          <label for="new_column_type" class="col-sm-3 col-form-label">Тип</label>
          <div class="col-sm-9">
            <select class="form-control" id="new_column_type" v-model="modalColumn.type">
              <option v-for="option in types" :key="option">{{ option }}</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary float-right" @click="saveColumn()">Сохранить</button>
      </div>
    </modal>
    <modal name="options-modal">
    </modal>
    <div style="margin-top: 1em">
      <button class="btn btn-default" @click="save()">Сохранить</button>
      <button class="btn btn-default" @click="$modal.show('column-modal')">Добавить столбец</button>
      <button class="btn btn-default" @click="addRow()">Добавить строку</button>
      <button class="btn btn-danger" @click="exit()">Выйти без сохранения</button>
    </div>
    <table>
      <tr>
        <th v-for="(column, id) in columns" :key="id">
          <i class="fas fa-edit pointer" aria-hidden="true" title="Редактировать" @click="editColumn(id)"></i> 
          <i class="fas fa-list pointer" aria-hidden="true" title="Редактировать опции" v-if="['enum', 'list'].includes(column.type)" @click="editOptions(id)"></i> 
          <i class="fas fa-trash pointer" aria-hidden="true" title="Удалить" @click="removeColumn(id)"></i>
          <br>
          {{ column.name }}
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
const fs = require('fs')
const _ = require('lodash')
const utils = require('../utils')

export default {
  name: 'edit-page',
  data () {
    const basePath = _.get(this.$route.query, 'path', '')
    const baseData = fs.existsSync(basePath) ? utils.prepareData(utils.loadJsonFile(basePath)) : {columns: [], rows: []}

    return {
      columns: baseData.columns,
      rows: baseData.rows,
      types: utils.types,
      modalColumn: {id: '', name: '', type: ''},
      modalOptionsId: null
    }
  },
  methods: {
    saveColumn () {
      const isNew = !this.columns.hasOwnProperty(this.modalColumn.id)
      const isChangeType = !isNew && this.columns[this.modalColumn.id].type !== this.modalColumn.type

      if (isChangeType && !confirm('Вы уверены что хотите изменить тип столбца? Все значения, записанные ранее будут потеряны!')) {
        return
      }

      for (const row of this.rows) {
        if (isNew) {
          row.push({
            id: this.modalColumn.id,
            value: utils.defaultValues[this.modalColumn.type],
            schema: {name: this.modalColumn.name, type: this.modalColumn.type}
          })
        } else if (isChangeType) {
          for (const cell of row) {
            if (cell.id === this.modalColumn.id) {
              cell.value = utils.defaultValues[this.modalColumn.type]
              cell.schema = {name: this.modalColumn.name, type: this.modalColumn.type}
              break
            }
          }
        }
      }

      this.columns[this.modalColumn.id] = {name: this.modalColumn.name, type: this.modalColumn.type}
      this.modalColumn.id = this.modalColumn.name = this.modalColumn.type = ''
      this.$modal.hide('column-modal')
    },
    editColumn (id) {
      this.modalColumn.id = id
      this.modalColumn.name = this.columns[id].name
      this.modalColumn.type = this.columns[id].type
      this.$modal.show('column-modal')
    },
    editOptions (id) {
      this.modalOptionsId = id
      this.$modal.show('options-modal')
    },
    removeColumn (id) {
      if (confirm('Вы уверены что хотите удалить этот столбец?')) {
        for (const row of this.rows) {
          for (const cellIndex in row) {
            console.log({row, cellIndex})
            if (row[cellIndex].id === id) {
              this.$delete(row, cellIndex)
            }
          }
        }

        this.$delete(this.columns, id)
      }
    },
    addRow () {
      const newRow = {}

      for (const id in this.columns) {
        newRow[id] = {
          id: id,
          value: utils.defaultValues[this.columns[id].type],
          schema: this.columns[id]
        }
      }

      this.rows.push(newRow)
    },
    removeRow (index) {
      if (confirm('Вы уверены что хотите удалить эту строку?')) {
        this.rows.splice(index, 1)
      }
    },
    save () {
      console.log(this.rows)
    },
    exit () {
      if (confirm('Вы уверены что хотите выйти без сохранения?')) {
        this.$router.push({name: 'main-page'})
      }
    }
  }
}
</script>

<style scoped>
  table { margin-top: 2em; margin-left: 1em; }
  th, td { padding-right: 1em; }
  td { padding-top: 1em }
  .pointer { cursor: pointer; }
</style>
