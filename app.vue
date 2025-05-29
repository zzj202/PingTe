<template>
  <ClientOnly>


    <NuxtLayout>
      <div class="mobile-layout">
        <div class="page-content">
          <NuxtPage></NuxtPage>
        </div>
        <var-bottom-navigation v-model:active="active" fixed border>
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
    </NuxtLayout>
  </ClientOnly>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tabs = [
  {name: 'category', icon: 'wrench', label: '工作台', path: '/mobile/main'},
  {name: 'cart', icon: 'format-list-checkbox', label: '场次', path: '/mobile/history'},
  {name: 'user', icon: 'cog', label: '设置', path: '/mobile/my'}
]

// 计算当前 active 索引
const active = computed(() => {
  const index = tabs.findIndex(tab => route.path.startsWith(tab.path))
  return index >= 0 ? index : 0
})

const navigateTo = (path: string) => {
  router.push(path)
}
</script>
<style>

body {
  transition: background-color .25s, color .25s;
  color: var(--color-text);
  background-color: var(--color-body);
  color-scheme: var(--color-scheme);
  margin: 0;
}

.mobile-layout {
  position: relative;
  height: 100vh;
}

.page-content {
  padding-bottom: 50px; /* 给底部导航栏留出空间 */
  height: calc(100vh - 50px);
  overflow-y: auto;
}
</style>
