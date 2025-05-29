<template>
  <div class="mobile-layout">
    <div class="page-content">
      <NuxtPage></NuxtPage>
    </div>
    <var-bottom-navigation v-model="active" fixed border>
      <var-bottom-navigation-item
          v-for="item in tabs"
          :key="item.name"
          :name="item.name"
          :icon="item.icon"
          :label="item.label"
          @click="navigateTo(item.path)"
      />
    </var-bottom-navigation>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const active = computed({
  get: () => {
    const currentPath = route.path
    const tab = tabs.find(tab => tab.path === currentPath)
    return tab?.name || '/mobile/main'
  },
  set: () => {
  }
})
const tabs = [
  {name: 'category', icon: 'apps', label: '主页', path: '/mobile/main'},
  {name: 'cart', icon: 'cart', label: '历史', path: '/mobile/about'},
  {name: 'user', icon: 'user', label: '我的', path: '/mobile/my'}
]


const navigateTo = (path: string) => {
  router.push(path)
}
</script>
<style scoped>
.mobile-layout {
  position: relative;
  height: 100vh;
}

.page-content {

  height: calc(100vh - 50px);
  overflow-y: auto;
}
</style>