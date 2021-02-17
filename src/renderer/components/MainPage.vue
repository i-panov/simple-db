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
export default {
  name: 'main-page',
  data () {
    return {
      previouslyOpenedBases: ['/path/to/file']
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
        this.$router.push({'name': 'edit-page', 'query': {'path': result[0]}})
      }
    }
  }
}
</script>

<style scoped>
</style>
