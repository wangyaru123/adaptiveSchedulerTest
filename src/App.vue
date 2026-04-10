<template>
  <div id="app">
    <!-- <feedbackSimulation /> -->
    <!-- 寻找阈值实验：场景：尾部追加一个节点（无节点移动，纯测算法本身开销） -->
    <!-- 规模取 10, 50, 100, 200, 500, 1000, 5000，记录三种策略在每种场景下分别执行20次的平均耗时 -->
    <!-- 规模n1与n2 -->
    <!-- <thtestNCom /> -->

    <!-- 移动比例阈值mth -->
    <!-- n=200 是测试这剩余三个特征敏感性的理想规模。通过控制随机重排的比例（0%, 10%, …, 100%）产生不同移动比例，记录三种策略在每种场景下分别执行20次的平均耗时 -->
    <thtestMCom />
    
    <!-- 节点复杂度cth -->
    <!-- n=200 是测试这剩余三个特征敏感性的理想规模。通过控制随机重排的比例（0%, 10%, …, 100%）产生不同移动比例，记录三种策略在每种场景下分别执行20次的平均耗时 -->
    <!-- <thtestCCom /> -->

    <!-- key稳定性阈值kth -->
    <!-- <thtestKCom /> -->

  </div>
</template>
<script setup>
// import feedbackSimulation from './pages/feedbackSimulation.vue'

import thtestNCom from './components/thtest/thtestNCom.vue'
import thtestMCom from './components/thtest/thtestMCom.vue'
import thtestKCom from './components/thtest/thtestKCom.vue'
import thtestCCom from './components/thtest/thtestCCom.vue'

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
