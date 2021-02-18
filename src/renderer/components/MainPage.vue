<template>
    <div>
      <div>
        <router-link :to="{path: '/edit'}" class="btn btn-default">Создать новую базу</router-link>
        <button @click="openBase()" class="btn btn-default">Открыть базу</button>
      </div>
      <div>
        <p>Ранее открытые базы:</p>
        <div>
          <p v-for="path in previouslyOpenedBases" :key="path">
            {{ path }} 
            <router-link :to="{path: '/edit', query: {path}}">
              <i class="fas fa-edit" aria-hidden="true"></i>
            </router-link>
          </p>
        </div>
      </div>
    </div>
</template>

<script>
const _ = require('lodash')
const fs = require('fs')
const os = require('os')
const recentFilesPath = os.tmpdir() + '/simpledb_recent.log'
const getRecentBases = () => fs.existsSync(recentFilesPath) ? fs.readFileSync(recentFilesPath, {encoding: 'utf-8'}).split('\n').filter(Boolean) : []
const saveRecentBases = list => fs.writeFileSync(recentFilesPath, _.uniq(list.filter(Boolean)).join('\n'))

export default {
  name: 'main-page',
  data () {
    return {
      previouslyOpenedBases: getRecentBases()
    }
  },
  methods: {
    openBase () {
      const result = this.$electron.remote.dialog.showOpenDialog({
        filters: [
          {name: 'Базы данных', extensions: ['json']}
        ]
      })

      if (result && Array.isArray(result)) {
        const filename = result[0]
        saveRecentBases(getRecentBases().concat(filename))
        this.$router.push({'name': 'edit-page', 'query': {'path': filename}})
      }
    }
  }
}
</script>

<style scoped>
</style>
