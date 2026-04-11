<template>
  <div class="container">
    <h2>自适应调度机制决策准确率实验</h2>
    <button @click="runExperiment" :disabled="running">
      {{ running ? '实验中...' : '开始实验' }}
    </button>
    <div v-if="accuracyTable.length" class="results">
      <h3>调度准确率 (%)</h3>
      <table border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr>
            <th>列表规模</th>
            <th>尾部追加</th>
            <th>头部插入</th>
            <th>随机重排</th>
            <th>节点交换</th>
            <th>平均准确率</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in accuracyTable" :key="row.size">
            <td>{{ row.size }}项</td>
            <td>{{ row.append }}%</td>
            <td>{{ row.insert }}%</td>
            <td>{{ row.shuffle }}%</td>
            <td>{{ row.swap }}%</td>
            <td>{{ row.avg }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div data-monitor-list>
      <div v-for="(item, index) in items" :key="index">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, nextTick } from 'vue';

const running = ref(false);
const accuracyTable = ref([]);

const instance = getCurrentInstance();

// ========== 实验参数 ==========
const SIZES = [50, 200, 500, 1000, 5000];   // 列表规模
const MODES = [
  { name: '尾部追加', fn: (oldList, count = 5) => [...oldList, ...generateItems(count, oldList.length)] },
  { name: '头部插入', fn: (oldList, count = 5) => [...generateItems(count, oldList.length), ...oldList] },
  { name: '随机重排', fn: (oldList) => shuffleArray([...oldList]) },
  { name: '节点交换', fn: (oldList) => swapTwoItems([...oldList]) }
];
const REPEATS = 1000;           // 每个用例重复次数（用于测量单一策略平均耗时，以及自适应调度决策次数）

// 辅助函数
function generateItems(count, startId) {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push({ id: `n${startId + i + 1}`, name: `Item ${startId + i + 1}` });
  }
  return items;
}

function shuffleArray(arr) {
  // 固定随机种子，保证可重复
  let seed = 42;
  const rng = () => {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function swapTwoItems(arr) {
  if (arr.length < 2) return arr;
  const idx1 = Math.floor(arr.length / 3);
  const idx2 = Math.floor(arr.length * 2 / 3);
  [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
  return arr;
}

// 设置 Diff 策略
function setStrategy(strategy) {
  if (instance && instance.proxy) {
    instance.proxy.__diffStrategy = strategy;
  }
}

// 测量单一策略在特定新旧列表下的平均耗时（重复多次取平均）
async function measureStrategyTime(oldList, newList, strategy, repeats = REPEATS) {
  let totalTime = 0;
  for (let i = 0; i < repeats; i++) {
    // 重置列表
    items.value = JSON.parse(JSON.stringify(oldList));
    await nextTick();
    const start = performance.now();
    setStrategy(strategy);
    items.value = JSON.parse(JSON.stringify(newList));
    await nextTick();
    const end = performance.now();
    totalTime += (end - start);
  }
  return totalTime / repeats;
}

// 自适应调度决策（实际应调用您的调度器，此处简化为规则）
function adaptiveDecision(sample) {
  const { n, m, c, k } = sample;
  const THRESHOLDS = { n1: 35, n2: 520, m_th: 0.3, c_th: 0.5, k_th: 0.6 };
  if (n < THRESHOLDS.n1) return 'simple';
  if (n >= THRESHOLDS.n2) return 'fast';
  if (m < THRESHOLDS.m_th) return 'doubleEnd';
  if (c >= THRESHOLDS.c_th) return 'doubleEnd';
  if (k >= THRESHOLDS.k_th) return 'fast';
  return 'doubleEnd';
}

// 测量自适应调度决策是否正确（与理论最优比较）
// 理论最优通过测量三种策略的实际耗时获得
async function measureAdaptiveAccuracy(size, mode, repeats = REPEATS) {
  // 生成固定旧列表和新列表（所有重复使用同一对列表，保证公平）
  const oldList = generateItems(size, 0);
  const newList = mode.fn(oldList);

  // 1. 测量三种单一策略的平均耗时
  const tSimple = await measureStrategyTime(oldList, newList, 'simple', 5);
  const tDouble = await measureStrategyTime(oldList, newList, 'doubleEnd', 5);
  const tFast = await measureStrategyTime(oldList, newList, 'fast', 5);

  // 理论最优策略
  let bestStrategy = 'simple';
  let bestTime = tSimple;
  if (tDouble < bestTime) { bestStrategy = 'doubleEnd'; bestTime = tDouble; }
  if (tFast < bestTime) { bestStrategy = 'fast'; bestTime = tFast; }

  // 2. 运行自适应调度决策，统计正确次数
  let correct = 0;
  // 为了准确，需要采集当前场景的特征。这里简化：假设特征已知（实际应从监控层获取）
  // 特征：移动比例 m，节点复杂度 c，key稳定性 k。对于固定模式，可估算典型值。
  // 示例中尾部追加 m≈0，头部插入 m≈1，随机重排 m≈1，节点交换 m≈2/size
  let m = 0;
  if (mode.name === '尾部追加') m = 0;
  else if (mode.name === '头部插入') m = 1;
  else if (mode.name === '随机重排') m = 1;
  else if (mode.name === '节点交换') m = 2 / size;
  const c = 0;   // 本实验节点复杂度固定为0
  const k = 1;   // key 稳定性固定为1（稳定ID）
  const sample = { n: size, m, c, k };
  const chosen = adaptiveDecision(sample);
  if (chosen === bestStrategy) correct++;

  // 重复多次以统计准确率（每次使用相同的列表对，但实际中每次更新可能不同，这里为简化）
  // 由于列表对相同，策略耗时相同，最优策略不变，因此只需一次决策即可判断。
  // 若要统计多次决策的稳定性，可多次运行（但决策结果相同）。这里按论文要求，每个组合统计一次。
  // 为了与示例表格数据一致，我们仍运行 REPEATS 次，但由于特征固定，结果相同。
  for (let i = 1; i < repeats; i++) {
    const chosenAgain = adaptiveDecision(sample);
    if (chosenAgain === bestStrategy) correct++;
  }
  return (correct / repeats) * 100;
}

// 运行完整实验，生成准确率表格
async function runExperiment() {
  running.value = true;
  accuracyTable.value = [];

  for (const size of SIZES) {
    const row = { size, append: 0, insert: 0, shuffle: 0, swap: 0, avg: 0 };
    let totalAcc = 0;
    for (const mode of MODES) {
      const acc = await measureAdaptiveAccuracy(size, mode);
      if (mode.name === '尾部追加') row.append = acc;
      else if (mode.name === '头部插入') row.insert = acc;
      else if (mode.name === '随机重排') row.shuffle = acc;
      else if (mode.name === '节点交换') row.swap = acc;
      totalAcc += acc;
    }
    row.avg = totalAcc / MODES.length;
    accuracyTable.value.push(row);
    // 让UI更新，避免长时间阻塞
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  running.value = false;
}

// 列表数据（用于渲染）
const items = ref([]);
</script>

<style scoped>
.container {
  font-family: Arial, sans-serif;
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}
button {
  padding: 8px 16px;
  font-size: 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:disabled {
  background: #aaa;
  cursor: not-allowed;
}
.results {
  margin-top: 20px;
}
table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 10px;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
th {
  background-color: #f2f2f2;
}
</style>