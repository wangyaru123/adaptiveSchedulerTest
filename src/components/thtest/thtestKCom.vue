<script setup>
import { ref, getCurrentInstance, onMounted, nextTick } from "vue";

const instance = getCurrentInstance();
const results = ref([]);
const buttonRef = ref(null);
// 列表数据（用于模板渲染）
const items = ref([]);

onMounted(() => {
  items.value = generateInitialList("stable"); // 初始显示稳定 ID 列表，不影响实验
  if (buttonRef.value) buttonRef.value.click();
});

// 实验固定参数
const N = 200;          // 列表规模
const MOVE_RATIO = 0.4; // 移动比例
const ROUNDS = 10;      // 回合数
const PER_ROUND = 20;   // 每回合测量次数

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

function generateNewListByMoveRatio(oldList, m) {
  const n = oldList.length;
  const k = Math.floor(n * m);
  if (k === 0) return [...oldList];
  if (k === n) return shuffleArray(oldList);

  const indices = Array.from({ length: n }, (_, i) => i);
  for (let i = 0; i < n; i++) {
    const randIdx = i + Math.floor(rng() * (n - i));
    [indices[i], indices[randIdx]] = [indices[randIdx], indices[i]];
  }
  const moveIndices = indices.slice(0, k);
  const stayIndices = indices.slice(k);

  const newList = [];
  stayIndices.sort((a, b) => a - b);
  for (const idx of stayIndices) {
    newList.push(oldList[idx]);
  }
  const toMove = moveIndices.map((idx) => oldList[idx]);
  const shuffledToMove = shuffleArray(toMove);
  newList.push(...shuffledToMove);
  return newList;
}

// 生成初始列表（根据 key 类型生成不同的 key 字段）
function generateInitialList(keyType) {
  const list = [];
  for (let i = 0; i < N; i++) {
    const id = `n${i + 1}`;
    let keyValue;
    if (keyType === "stable") {
      keyValue = id; // 稳定 ID
    } else if (keyType === "index") {
      keyValue = i; // 数组索引（随位置变化，不稳定）
    } else {
      keyValue = undefined; // 无 key
    }
    list.push({
      id,
      name: `Item ${id}`,
      keyValue,
    });
  }
  return shuffleArray(list);
}

// 设置 Diff 策略
function setStrategy(strategy) {
  if (instance && instance.proxy) {
    instance.proxy.__diffStrategy = strategy;
  }
}

// 延迟函数（毫秒）
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 对指定的策略执行多回合测试，返回平均耗时
 * @param {string} strategy 'doubleEnd' 或 'fast'
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
      // 重置列表为旧列表
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
    // 回合间休息1秒（最后一回合后不休息）
    if (round < ROUNDS - 1) {
      await sleep(1000);
    }
  }
  return totalTime / totalMeasurements;
}

// 运行实验
async function changeData() {
  results.value = [];

  const keyTypes = [
    { name: "稳定 ID (业务唯一标识)", k: 1.0, type: "stable" },
    { name: "数组索引", k: 0.65, type: "index" },
    { name: "无 key", k: 0.0, type: "none" },
  ];

  for (const keyCfg of keyTypes) {
    console.log(`测试 key 类型: ${keyCfg.name} (k=${keyCfg.k})`);
    // 生成初始列表和新列表（固定，所有回合共用）
    const oldList = generateInitialList(keyCfg.type);
    const newList = generateNewListByMoveRatio(oldList, MOVE_RATIO);

    // 测试双端 Diff
    const avgDouble = await runStrategyWithRounds('doubleEnd', oldList, newList);
    // 测试快速 Diff
    const avgFast = await runStrategyWithRounds('fast', oldList, newList);

    const diff = avgDouble - avgFast;
    results.value.push({
      type: keyCfg.name,
      k: keyCfg.k,
      avgDoubleEnd: Number(avgDouble.toFixed(2)),
      avgFast: Number(avgFast.toFixed(2)),
      diff: Number(diff.toFixed(2)),
    });
    console.log(
      `${keyCfg.name}: double=${avgDouble.toFixed(2)}ms, fast=${avgFast.toFixed(2)}ms, diff=${diff.toFixed(2)}ms`
    );
  }
  console.table("实验结果");
  console.table(results.value);
}


</script>

<template>
  <div>
    <div data-monitor-list>
      <div v-for="item in items" :key="item.keyValue">
        {{ item.name }}
      </div>
    </div>
    <button ref="buttonRef" type="button" @click="changeData">change</button>
    <button type="button" @click="resetTest" style="margin-left: 10px;">重置测试</button>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>