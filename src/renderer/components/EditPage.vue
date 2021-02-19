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
    <modal name="options-modal" @before-open="beforeOptionsModalOpen" @before-close="beforeOptionsModalClose" width="650">
      <div class="container">
        <div class="row" style="margin-bottom: 2em">
          <div class="col-5">
            <label for="new_option_value" class="col-form-label">Значение</label>
            <input class="form-control" id="new_option_value" v-model="modalOptions.value">
          </div>
          <div class="col-5">
            <label for="new_option_value" class="col-form-label">Название</label>
            <input class="form-control" id="new_option_value" v-model="modalOptions.name">
          </div>
          <div class="col-2">
            <button class="btn btn-success float-right" style="margin-top: 2.3em" @click="addOption()">Добавить</button>
          </div>
        </div>
        <div style="overflow-x: hidden; overflow-y: scroll; height: 11em; padding: 1em">
          <div class="row" style="margin-bottom: 0.5em" v-for="(option, optionIndex) in modalOptions.options" :key="optionIndex">
            <div class="col-5">
              <input class="form-control" id="new_option_value" v-model="option.value">
            </div>
            <div class="col-5">
              <input class="form-control" id="new_option_value" v-model="option.name">
            </div>
            <div class="col-2">
              <button class="btn btn-warning float-right" @click="removeOption(optionIndex)">Удалить</button>
            </div>
          </div>
        </div>
      </div>
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
        <td v-for="(cell, column) in row" :key="column">
          <input v-if="columns[column].type === 'string'" type="text" v-model="rows[rowIndex][column]" class="form-control">
          <textarea v-if="columns[column].type === 'text'" v-model="rows[rowIndex][column]" class="form-control"></textarea>
          <input v-else-if="columns[column].type === 'number'" type="number" v-model="rows[rowIndex][column]" class="form-control">
          <input v-else-if="columns[column].type === 'boolean'" type="checkbox" v-model="rows[rowIndex][column]" class="form-control">
          <input v-else-if="columns[column].type === 'date'" type="date" v-model="rows[rowIndex][column]" class="form-control">
          <input v-else-if="columns[column].type === 'time'" type="time" v-model="rows[rowIndex][column]" class="form-control">
          <input v-else-if="columns[column].type === 'datetime'" type="datetime-local" v-model="rows[rowIndex][column]" class="form-control">
          <select v-else-if="columns[column].type === 'enum'" v-model="rows[rowIndex][column]" class="form-control">
            <option></option>
            <option v-for="(optionName, optionValue) in columns[column].options" :key="optionValue" :value="optionValue" :selected="cell === optionValue">
              {{ optionName }}
            </option>
          </select>
          <select v-else-if="columns[column].type === 'list'" multiple v-model="rows[rowIndex][column]" class="form-control">
            <option v-for="(optionName, optionValue) in columns[column].options" :key="optionValue" :value="optionValue" :selected="cell.hasOwnProperty(optionValue)">
              {{ optionName }}
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
const uuid = require('uuid')
const utils = require('../utils')

export default {
  name: 'edit-page',
  data () {
    const basePath = _.get(this.$route.query, 'path', '')
    const baseData = fs.existsSync(basePath) ? utils.prepareData(utils.loadJsonFile(basePath)) : {columns: {}, rows: []}

    return {
      basePath,
      columns: baseData.columns,
      rows: baseData.rows,
      types: utils.types,
      modalColumn: {id: '', name: '', type: ''},
      modalOptions: {columnId: '', value: '', name: '', options: []}
    }
  },
  methods: {
    editColumn (id) {
      this.modalColumn.id = id
      this.modalColumn.name = this.columns[id].name
      this.modalColumn.type = this.columns[id].type
      this.$modal.show('column-modal')
    },
    saveColumn () {
      const isNew = !this.columns.hasOwnProperty(this.modalColumn.id)
      const isStringOrText = !isNew && ['string', 'text'].includes(this.columns[this.modalColumn.id].type) && ['string', 'text'].includes(this.modalColumn.type)
      const isChangeType = !isNew && (this.columns[this.modalColumn.id].type !== this.modalColumn.type && !isStringOrText)

      if (isChangeType && !confirm('Вы уверены что хотите изменить тип столбца? Все значения, записанные ранее будут потеряны!')) {
        return
      }

      if (isNew || isChangeType) {
        for (const row of this.rows) {
          row[this.modalColumn.id] = utils.defaultValues[this.modalColumn.type]
        }
      }

      if (isNew) {
        this.columns[this.modalColumn.id] = {name: this.modalColumn.name, type: this.modalColumn.type}
      } else {
        this.columns[this.modalColumn.id].name = this.modalColumn.name
        this.columns[this.modalColumn.id].type = this.modalColumn.type
      }

      this.modalColumn.id = this.modalColumn.name = this.modalColumn.type = ''
      this.$modal.hide('column-modal')
    },
    removeColumn (id) {
      if (confirm('Вы уверены что хотите удалить этот столбец?')) {
        for (const row of this.rows) {
          this.$delete(row, id)
        }

        this.$delete(this.columns, id)
      }
    },
    editOptions (id) {
      this.modalOptions.columnId = id
      this.$modal.show('options-modal')
    },
    addRow () {
      if (Object.keys(this.columns).length === 0) {
        alert('Нельзя добавить строку пока не добавлено ни одного столбца!')
        return
      }

      const newRow = {}

      for (const id in this.columns) {
        newRow[id] = utils.defaultValues[this.columns[id].type]
      }

      this.rows.push(newRow)
    },
    removeRow (index) {
      if (confirm('Вы уверены что хотите удалить эту строку?')) {
        this.rows.splice(index, 1)
      }
    },
    save () {
      this.basePath = this.basePath || this.$electron.remote.dialog.showSaveDialog({
        filters: [
          {name: 'Базы данных', extensions: ['json']}
        ]
      })

      for (const row of this.rows) {
        for (const column in row) {
          if (this.columns[column].type === 'number') {
            row[column] = +row[column]
          }
        }
      }

      console.log(this.rows)
      utils.saveJsonFile(this.basePath, {columns: this.columns, rows: this.rows})
    },
    exit () {
      if (confirm('Вы уверены что хотите выйти без сохранения?')) {
        this.$router.push({name: 'main-page'})
      }

      /* this.$confirm({
        message: 'Вы уверены что хотите выйти без сохранения?',
        button: {no: 'Нет', yes: 'Да'},
        callback (confirm) {
          console.log(confirm)
        }
      }) */
    },
    beforeOptionsModalOpen () {
      const options = this.columns[this.modalOptions.columnId].hasOwnProperty('options') ? this.columns[this.modalOptions.columnId].options : {}
      this.modalOptions.options = Object.keys(options).map(key => ({value: key, name: options[key]}))
      this.modalOptions.value = this.modalOptions.name = ''
    },
    beforeOptionsModalClose () {
      for (const option of this.modalOptions.options) {
        if (!option.value) {
          option.value = uuid.v4()
        }
      }

      this.columns[this.modalOptions.columnId].options = _.chain(this.modalOptions.options).keyBy('value').mapValues('name').value()
      this.modalOptions.columnId = ''
    },
    addOption () {
      this.modalOptions.options.push({value: this.modalOptions.value, name: this.modalOptions.name})
      this.modalOptions.value = this.modalOptions.name = ''
    },
    removeOption (index) {
      this.$delete(this.modalOptions.options, index)
    }
  },
  beforeRouteLeave (to, from, next) {
  }
}
</script>

<style scoped>
  table { margin-top: 2em; margin-left: 1em; }
  th, td { padding-right: 1em; }
  td { padding-top: 1em }
  .pointer { cursor: pointer; }
</style>
