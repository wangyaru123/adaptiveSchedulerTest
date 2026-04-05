<template>
  <div>
    <button @click="run">运行仿真</button>
    <div v-if="result">
      <p>准确率: {{ result.accuracy }}%</p>
      <p>平均耗时: {{ result.avgTime }} ms</p>
      <p>最终 m_th: {{ result.finalMth }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { runSimulation } from './feedbackSimulation.js';

const result = ref(null);

async function run() {
  result.value = await runSimulation(10000);
}
</script>