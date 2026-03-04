<template>
  <div id="app">
    <Navigation />
    <div class="content">
      <RouterView />
    </div>
  </div>
</template>
<script setup>
import Navigation from './components/Navigation.vue'
</script>



<style scoped>
.content {
  margin-left: 180px; /* 与导航宽度匹配 */
  padding: 20px;
}
</style>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
