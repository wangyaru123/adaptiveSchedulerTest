<template>
  <div id="app">
    <!-- <feedbackSimulation /> -->
    <!-- 寻找阈值实验：场景：尾部追加一个节点（无节点移动，纯测算法本身开销） -->
    <!-- 规模取 10, 50, 100, 200, 500, 1000, 5000，记录三种策略在每种场景下分别执行20次的平均耗时 -->
    <!-- 规模n1与n2 -->
    <!-- <thtestSimpleN10 /> -->
    <!-- <thtestSimpleN50 /> -->
    <!-- <thtestSimpleN100 /> -->
    <!-- <thtestSimpleN200 /> -->
    <!-- <thtestSimpleN500 /> -->
    <!-- <thtestSimpleN1000 /> -->
    <!-- <thtestSimpleN5000 /> -->
    <!-- <thtestDoubleEndN10 /> -->
    <!-- <thtestDoubleEndN50 /> -->
    <!-- <thtestDoubleEndN100 /> -->
    <!-- <thtestDoubleEndN200 /> -->
    <!-- <thtestDoubleEndN500 /> -->
    <!-- <thtestDoubleEndN1000 /> -->
    <!-- <thtestDoubleEndN5000 /> -->
    <!-- <thtestFastN10 /> -->
    <!-- <thtestFastN50 /> -->
    <thtestFastN100 />
    <!-- <thtestFastN200 /> -->
    <!-- <thtestFastN500 /> -->
    <!-- <thtestFastN1000 /> -->
    <!-- <thtestFastN5000 /> -->
  </div>
</template>
<script setup>
// import feedbackSimulation from './pages/feedbackSimulation.vue'
import thtestSimpleN10 from './components/thtest/simple/n10.vue'
import thtestSimpleN50 from './components/thtest/simple/n50.vue'
import thtestSimpleN100 from './components/thtest/simple/n100.vue'
import thtestSimpleN200 from './components/thtest/simple/n200.vue'
import thtestSimpleN500 from './components/thtest/simple/n500.vue'
import thtestSimpleN1000 from './components/thtest/simple/n1000.vue'
import thtestSimpleN5000 from './components/thtest/simple/n5000.vue'
import thtestDoubleEndN10 from './components/thtest/doubleEnd/n10.vue'
import thtestDoubleEndN50 from './components/thtest/doubleEnd/n50.vue'
import thtestDoubleEndN100 from './components/thtest/doubleEnd/n100.vue'
import thtestDoubleEndN200 from './components/thtest/doubleEnd/n200.vue'
import thtestDoubleEndN500 from './components/thtest/doubleEnd/n500.vue'
import thtestDoubleEndN1000 from './components/thtest/doubleEnd/n1000.vue'
import thtestDoubleEndN5000 from './components/thtest/doubleEnd/n5000.vue'
import thtestFastN10 from './components/thtest/fast/n10.vue'
import thtestFastN50 from './components/thtest/fast/n50.vue'
import thtestFastN100 from './components/thtest/fast/n100.vue'
import thtestFastN200 from './components/thtest/fast/n200.vue'
import thtestFastN500 from './components/thtest/fast/n500.vue'
import thtestFastN1000 from './components/thtest/fast/n1000.vue'
import thtestFastN5000 from './components/thtest/fast/n5000.vue'

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
