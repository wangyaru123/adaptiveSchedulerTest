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
    <!-- <thtestFastN100 /> -->
    <!-- <thtestFastN200 /> -->
    <!-- <thtestFastN500 /> -->
    <!-- <thtestFastN1000 /> -->
    <!-- <thtestFastN5000 /> -->

    <!-- 移动比例阈值mth -->
    <!-- n=200 是测试这剩余三个特征敏感性的理想规模。通过控制随机重排的比例（0%, 10%, …, 100%）产生不同移动比例，记录三种策略在每种场景下分别执行20次的平均耗时 -->
    <!-- <thtestDoubleEndM00 /> -->
    <!-- <thtestDoubleEndM01 /> -->
    <!-- <thtestDoubleEndM02 /> -->
    <!-- <thtestDoubleEndM03 /> -->
    <!-- <thtestDoubleEndM04 /> -->
    <!-- <thtestDoubleEndM05 /> -->
    <!-- <thtestDoubleEndM06 /> -->
    <!-- <thtestDoubleEndM07 /> -->
    <!-- <thtestDoubleEndM08 /> -->
    <!-- <thtestDoubleEndM09 /> -->
    <!-- <thtestDoubleEndM10 /> -->
    <!-- <thtestFastM00 /> -->
    <!-- <thtestFastM01 /> -->
    <!-- <thtestFastM02 /> -->
    <!-- <thtestFastM03 /> -->
    <!-- <thtestFastM04 /> -->
    <!-- <thtestFastM05 /> -->
    <!-- <thtestFastM06 /> -->
    <!-- <thtestFastM07 /> -->
    <!-- <thtestFastM08 /> -->
    <!-- <thtestFastM09 /> -->
    <thtestFastM10 />
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
import thtestDoubleEndM00 from './components/thtest/doubleEnd/m0.vue'
import thtestDoubleEndM01 from './components/thtest/doubleEnd/m1.vue'
import thtestDoubleEndM02 from './components/thtest/doubleEnd/m2.vue'
import thtestDoubleEndM03 from './components/thtest/doubleEnd/m3.vue'
import thtestDoubleEndM04 from './components/thtest/doubleEnd/m4.vue'
import thtestDoubleEndM05 from './components/thtest/doubleEnd/m5.vue'
import thtestDoubleEndM06 from './components/thtest/doubleEnd/m6.vue'
import thtestDoubleEndM07 from './components/thtest/doubleEnd/m7.vue'
import thtestDoubleEndM08 from './components/thtest/doubleEnd/m8.vue'
import thtestDoubleEndM09 from './components/thtest/doubleEnd/m9.vue'
import thtestDoubleEndM10 from './components/thtest/doubleEnd/m10.vue'
import thtestFastM00 from './components/thtest/fast/m0.vue'
import thtestFastM01 from './components/thtest/fast/m1.vue'
import thtestFastM02 from './components/thtest/fast/m2.vue'
import thtestFastM03 from './components/thtest/fast/m3.vue'
import thtestFastM04 from './components/thtest/fast/m4.vue'
import thtestFastM05 from './components/thtest/fast/m5.vue'
import thtestFastM06 from './components/thtest/fast/m6.vue'
import thtestFastM07 from './components/thtest/fast/m7.vue'
import thtestFastM08 from './components/thtest/fast/m8.vue'
import thtestFastM09 from './components/thtest/fast/m9.vue'
import thtestFastM10 from './components/thtest/fast/m10.vue'
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
