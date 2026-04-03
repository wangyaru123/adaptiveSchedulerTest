<template>
  <div id="app">
    <generateTestSet />
    <!-- <pretestFast50append /> -->
    <!-- <pretestFast200append /> -->
    <!-- <pretestFast1000append /> -->
    <!-- <pretestFast5000append /> -->
    <!-- <pretestFast50insert /> -->
    <!-- <pretestFast200insert /> -->
    <!-- <pretestFast1000insert /> -->
    <!-- <pretestFast5000insert /> -->
    <!-- <pretestFast50towchange /> -->
    <!-- <pretestFast200towchange /> -->
    <!-- <pretestFast1000towchange /> -->
    <!-- <pretestFast5000towchange /> -->
    <!-- <pretestFast50delete /> -->
    <!-- <pretestFast200delete /> -->
    <!-- <pretestFast1000delete /> -->
    <!-- <pretestFast5000delete /> -->
    <!-- <pretestDoubleEnd50append /> -->
    <!-- <pretestDoubleEnd200append /> -->
    <!-- <pretestDoubleEnd1000append /> -->
    <!-- <pretestDoubleEnd5000append /> -->
    <!-- <pretestDoubleEnd50insert /> -->
    <!-- <pretestDoubleEnd200insert /> -->
    <!-- <pretestDoubleEnd1000insert /> -->
    <!-- <pretestDoubleEnd5000insert /> -->
    <!-- <pretestDoubleEnd50towchange /> -->
    <!-- <pretestDoubleEnd200towchange /> -->
    <!-- <pretestDoubleEnd1000towchange /> -->
    <!-- <pretestDoubleEnd5000towchange /> -->
    <!-- <pretestDoubleEnd50delete /> -->
    <!-- <pretestDoubleEnd200delete /> -->
    <!-- <pretestDoubleEnd1000delete /> -->
    <!-- <pretestDoubleEnd5000delete /> -->
    <!-- <pretestSimple50append /> -->
    <!-- <pretestSimple200append /> -->
    <!-- <pretestSimple1000append /> -->
    <!-- <pretestSimple5000append /> -->
    <!-- <pretestSimple50insert /> -->
    <!-- <pretestSimple200insert /> -->
    <!-- <pretestSimple1000insert /> -->
    <!-- <pretestSimple5000insert /> -->
    <!-- <pretestSimple50towchange /> -->
    <!-- <pretestSimple200towchange /> -->
    <!-- <pretestSimple1000towchange /> -->
    <!-- <pretestSimple5000towchange /> -->
    <!-- <pretestSimple50delete /> -->
    <!-- <pretestSimple200delete /> -->
    <!-- <pretestSimple1000delete /> -->
    <!-- <pretestSimple5000delete /> -->
  </div>
</template>
<script setup>

import generateTestSet from './pages/generateTestSet.vue'
// import pretestFast50append from './components/pretest/fast/50append.vue'
// import pretestFast200append from './components/pretest/fast/200append.vue'
// import pretestFast1000append from './components/pretest/fast/1000append.vue'
// import pretestFast5000append from './components/pretest/fast/5000append.vue'
// import pretestFast50insert from './components/pretest/fast/50insert.vue'
// import pretestFast200insert from './components/pretest/fast/200insert.vue'
// import pretestFast1000insert from './components/pretest/fast/1000insert.vue'
// import pretestFast5000insert from './components/pretest/fast/5000insert.vue'
// import pretestFast50towchange from './components/pretest/fast/50towchange.vue'
// import pretestFast200towchange from './components/pretest/fast/200towchange.vue'
// import pretestFast1000towchange from './components/pretest/fast/1000towchange.vue'
// import pretestFast5000towchange from './components/pretest/fast/5000towchange.vue'
// import pretestFast50delete from './components/pretest/fast/50delete.vue'
// import pretestFast200delete from './components/pretest/fast/200delete.vue'
// import pretestFast1000delete from './components/pretest/fast/1000delete.vue'
// import pretestFast5000delete from './components/pretest/fast/5000delete.vue'
// import pretestDoubleEnd50append from './components/pretest/doubleEnd/50append.vue'
// import pretestDoubleEnd200append from './components/pretest/doubleEnd/200append.vue'
// import pretestDoubleEnd1000append from './components/pretest/doubleEnd/1000append.vue'
// import pretestDoubleEnd5000append from './components/pretest/doubleEnd/5000append.vue'
// import pretestDoubleEnd50insert from './components/pretest/doubleEnd/50insert.vue'
// import pretestDoubleEnd200insert from './components/pretest/doubleEnd/200insert.vue'
// import pretestDoubleEnd1000insert from './components/pretest/doubleEnd/1000insert.vue'
// import pretestDoubleEnd5000insert from './components/pretest/doubleEnd/5000insert.vue'
// import pretestDoubleEnd50towchange from './components/pretest/doubleEnd/50towchange.vue'
// import pretestDoubleEnd200towchange from './components/pretest/doubleEnd/200towchange.vue'
// import pretestDoubleEnd1000towchange from './components/pretest/doubleEnd/1000towchange.vue'
// import pretestDoubleEnd5000towchange from './components/pretest/doubleEnd/5000towchange.vue'
// import pretestDoubleEnd50delete from './components/pretest/doubleEnd/50delete.vue'
// import pretestDoubleEnd200delete from './components/pretest/doubleEnd/200delete.vue'
// import pretestDoubleEnd1000delete from './components/pretest/doubleEnd/1000delete.vue'
// import pretestDoubleEnd5000delete from './components/pretest/doubleEnd/5000delete.vue'
// import pretestSimple50append from './components/pretest/simple/50append.vue'
// import pretestSimple200append from './components/pretest/simple/200append.vue'
// import pretestSimple1000append from './components/pretest/simple/1000append.vue'
// import pretestSimple5000append from './components/pretest/simple/5000append.vue'
// import pretestSimple50insert from './components/pretest/simple/50insert.vue'
// import pretestSimple200insert from './components/pretest/simple/200insert.vue'
// import pretestSimple1000insert from './components/pretest/simple/1000insert.vue'
// import pretestSimple5000insert from './components/pretest/simple/5000insert.vue'
// import pretestSimple50towchange from './components/pretest/simple/50towchange.vue'
// import pretestSimple200towchange from './components/pretest/simple/200towchange.vue'
// import pretestSimple1000towchange from './components/pretest/simple/1000towchange.vue'
// import pretestSimple5000towchange from './components/pretest/simple/5000towchange.vue'
// import pretestSimple50delete from './components/pretest/simple/50delete.vue'
// import pretestSimple200delete from './components/pretest/simple/200delete.vue'
// import pretestSimple1000delete from './components/pretest/simple/1000delete.vue'
// import pretestSimple5000delete from './components/pretest/fast/5000delete.vue'

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
