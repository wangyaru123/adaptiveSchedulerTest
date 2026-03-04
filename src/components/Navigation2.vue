<template>
  <div class="sidebar-menu">
    <div class="menu-items">
      <div 
        v-for="item in menuItems" 
        :key="item.id"
        :class="['menu-item', { active: activeItem === item.id }]"
        @click="selectItem(item)"
      >
        <span class="menu-text">{{ item.title }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarMenu',
  data() {
    return {
      menuItems: [
        { id: 'shuffle', title: '欢迎', route: '/shuffle' },
        { id: 'shuffle2', title: '账号管理', route: '/shuffle2' },
      ]
    }
  },
  computed: {
    activeItem() {
      // 根据当前路由路径返回对应的菜单项ID
      const currentPath = this.$route.path;
      const activeMenu = this.menuItems.find(item => item.route === currentPath);
      return activeMenu ? activeMenu.id : 'shuffle';
    },
  },
  methods: {
    selectItem(item) {
      // 更新激活状态并跳转到对应路由
      this.$router.push(item.route);
    },
  }
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