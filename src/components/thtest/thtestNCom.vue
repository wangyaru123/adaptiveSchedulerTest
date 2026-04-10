<template>

  <div data-monitor-list>
    <div v-for="(item, index) in items" :key="index">
      {{ item.name }}
    </div>
  </div>
  <button ref="buttonRef" type="button" @click="changeData">开始实验</button>
  <button type="button" @click="resetTest" style="margin-left: 10px;">重置测试</button>

</template>

<script setup>
import { ref, getCurrentInstance, onMounted, nextTick } from "vue";

const instance = getCurrentInstance();
const items = ref([]);
const buttonRef = ref(null);
const results = ref([]);

// 实验固定参数
const ROUNDS = 50;          // 回合数
const PER_ROUND = 20;       // 每回合测量次数
const APPEND_COUNT = 1;     // 每次尾部追加的节点数量
const sizes = [10, 50, 100, 200, 500, 1000, 5000];  // 待测列表规模（初始规模）

// ---------- 固定种子的随机函数 ----------
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(42);

function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 生成指定规模的初始列表（轻量节点，稳定 ID）
function generateInitialList(size) {
  const list = [];
  for (let i = 0; i < size; i++) {
    list.push({
      id: `n${i + 1}`,
      name: `Item ${i + 1}`,
    });
  }
  return shuffleArray(list);
}

// 生成尾部追加后的新列表（在原列表末尾追加 APPEND_COUNT 个新节点）
function generateAppendedList(oldList, appendCount) {
  const newList = [...oldList];
  for (let i = 0; i < appendCount; i++) {
    const newId = `n${oldList.length + i + 1}`;
    newList.push({
      id: newId,
      name: `Item ${newId}`,
    });
  }
  return newList;
}

// 设置 Diff 策略
function setStrategy(strategy) {
  if (instance && instance.proxy) {
    instance.proxy.__diffStrategy = strategy;
  }
}

// 延迟函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 对指定的策略执行多回合测试，返回平均耗时
 * @param {string} strategy 'simple' | 'doubleEnd' | 'fast'
 * @param {Array} oldList 旧列表
 * @param {Array} newList 新列表
 * @returns {Promise<number>} 平均耗时（ms）
 */
async function runStrategyWithRounds(strategy, oldList, newList) {
  let totalTime = 0;
  let totalMeasurements = 0;
  for (let round = 0; round < ROUNDS; round++) {
    let roundTime = 0;
    for (let i = 0; i < PER_ROUND; i++) {
      items.value = JSON.parse(JSON.stringify(oldList));
      await nextTick();
      const start = performance.now();
      setStrategy(strategy);
      items.value = JSON.parse(JSON.stringify(newList));
      await nextTick();
      const end = performance.now();
      roundTime += end - start;
    }
    totalTime += roundTime;
    totalMeasurements += PER_ROUND;
    if (round < ROUNDS - 1) await sleep(1000);
  }
  return totalTime / totalMeasurements;
}

// 运行实验
async function changeData() {
  results.value = [];

  for (const n of sizes) {
    console.log(`测试列表规模: ${n}`);
    const oldList = generateInitialList(n);
    const newList = generateAppendedList(oldList, APPEND_COUNT);

    // 测量三种策略
    const avgSimple = await runStrategyWithRounds('simple', oldList, newList);
    const avgDouble = await runStrategyWithRounds('doubleEnd', oldList, newList);
    const avgFast = await runStrategyWithRounds('fast', oldList, newList);

    results.value.push({
      n,
      avgSimple: Number(avgSimple.toFixed(2)),
      avgDouble: Number(avgDouble.toFixed(2)),
      avgFast: Number(avgFast.toFixed(2)),
    });
    console.log(`n=${n}: simple=${avgSimple.toFixed(2)}ms, double=${avgDouble.toFixed(2)}ms, fast=${avgFast.toFixed(2)}ms`);
  }

  console.table("列表规模实验结果");
  console.table(results.value);
}

// 重置测试
const resetTest = () => {
  window.location.reload();
};

onMounted(() => {
  items.value = generateInitialList(10);
  if (buttonRef.value) buttonRef.value.click();
});
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>