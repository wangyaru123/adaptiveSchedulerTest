<template>
  <div class="sidebar-menu">
    <div class="logo-section">
      <span class="logo-text">Vue 测试平台</span>
    </div>
    
    <div class="menu-items">
      <router-link 
        v-for="item in menuItems" 
        :key="item.id"
        :to="item.route"
        :class="['menu-item', { active: isActive(item.route) }]"
      >
        <span class="menu-text">{{ item.title }}</span>
      </router-link>
    <RouterLink  to="/Shuffle">
test
    </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menuItems = ref([
  { id: 'shuffle', title: 'Shuffle 测试', route: '/' },
  { id: 'shuffle2', title: '性能实验', route: '/shuffle2' }
])

const isActive = (routePath) => {
  console.log('routePath',routePath)
  return route.path === routePath
}
</script>

<style scoped>
.sidebar-menu {
  width: 240px;
  height: 100vh;
  background-color: #1a2236;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}

.logo-section {
  padding: 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #2c364c;
}

.logo {
  height: 32px;
  margin-right: 12px;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
}

.menu-items {
  flex: 1;
  padding: 20px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  margin: 4px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background-color: #2c364c;
}

.menu-item.active {
  background-color: #4e79a7;
  border-radius: 4px;
}

.menu-text {
  font-size: 14px;
}



</style>