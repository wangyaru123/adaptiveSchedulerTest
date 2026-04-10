<template>
  <div class="container">
    <h2>阈值校准仿真</h2>
    <button @click="runCalibration" :disabled="running">
      {{ running ? '校准中...' : '开始校准' }}
    </button>

    <!-- 显示每个阈值的搜索结果表格 -->
    <div v-if="results.length" class="results">
      <div v-for="(paramResult, idx) in results" :key="idx" class="param-result">
        <h3>{{ paramResult.paramName }} 阈值搜索结果</h3>
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th>{{ paramResult.paramName }} 候选值</th>
              <th>准确率 (%)</th>
              <th>平均耗时 (ms)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paramResult.candidates" :key="row.value">
              <td>{{ row.value.toFixed(3) }}</td>
              <td>{{ (row.accuracy * 100).toFixed(2) }}%</td>
              <td>{{ row.avgTime.toFixed(3) }}</td>
            </tr>
          </tbody>
        </table>
        <p><strong>最优值: {{ paramResult.bestValue.toFixed(3) }}</strong> (准确率 {{ (paramResult.bestAccuracy * 100).toFixed(2) }}%, 平均耗时 {{ paramResult.bestAvgTime.toFixed(3) }}ms)</p>
      </div>
    </div>

    <!-- 最终汇总结果 -->
    <div v-if="finalResult" class="final-result">
      <h3>最终校准结果</h3>
      <pre>{{ JSON.stringify(finalResult.thresholds, null, 2) }}</pre>
      <p>✅ 最终准确率: {{ finalResult.accuracy }}%</p>
      <p>⏱️ 最终平均耗时: {{ finalResult.avgTime }} ms</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const running = ref(false);
const results = ref([]);
const finalResult = ref(null);

// ========== 1. 拟合模型（基于最新实验数据） ==========
function timeSimple(n) {
  if (n < 50) return 0.16 + 0.0032 * n;
  return 1000 + n * 0.5;
}
function timeDouble(n, m, c) {
  const base = 0.12 + 0.0024 * n;
  const move = 15 * m * n / 1000;
  const comp = 9 * c * n / 1000;
  return base + move + comp;
}
const fastBasePoints = [
  { n: 10, time: 0.23 }, { n: 50, time: 0.27 }, { n: 100, time: 0.38 },
  { n: 200, time: 0.70 }, { n: 500, time: 1.18 }, { n: 1000, time: 2.45 },
  { n: 5000, time: 16.25 }
];
function getFastBase(n) {
  if (n <= fastBasePoints[0].n) return fastBasePoints[0].time;
  if (n >= fastBasePoints[fastBasePoints.length-1].n) return fastBasePoints[fastBasePoints.length-1].time;
  for (let i = 0; i < fastBasePoints.length-1; i++) {
    const p1 = fastBasePoints[i], p2 = fastBasePoints[i+1];
    if (n >= p1.n && n <= p2.n) {
      const t = (n - p1.n) / (p2.n - p1.n);
      return p1.time + t * (p2.time - p1.time);
    }
  }
  return 0;
}
function timeFast(n, m, k, c) {
  const base = getFastBase(n);
  const move = 9.5 * m * n / 1000;
  let comp;
  if (c <= 0.5) comp = 7.7 * c * n / 1000;
  else comp = 1000;
  const keyPen = 11 * (1 - k) * n / 1000;
  return base + move + comp + keyPen;
}

// ========== 2. 生成测试集 ==========
function generateTestSet() {
  const samples = [];
  const nValues = [10, 30, 50, 70, 100, 200, 300, 500, 700, 1000, 2000, 5000];
  const mValues = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  const cValues = [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1.0];
  const kValues = [0, 0.4, 0.6, 0.8, 1.0];
  for (const n of nValues) {
    for (const m of mValues) {
      for (const c of cValues) {
        for (const k of kValues) {
          const tSim = timeSimple(n);
          const tDou = timeDouble(n, m, c);
          const tFst = timeFast(n, m, k, c);
          let best;
          if (tSim <= tDou && tSim <= tFst) best = 'simple';
          else if (tDou <= tSim && tDou <= tFst) best = 'doubleEnd';
          else best = 'fast';
          samples.push({ n, m, c, k, tSim: tSim, tDou: tDou, tFst: tFst, best });
        }
      }
    }
  }
  return samples;
}

// ========== 3. 决策规则 ==========
function decideStrategy(sample, thresholds) {
  const { n, m, c, k } = sample;
  const { n1, n2, m_th, c_th, k_th } = thresholds;
  if (n < n1) return 'simple';
  if (n >= n2) return 'fast';
  if (m < m_th) return 'doubleEnd';
  if (c >= c_th) return 'doubleEnd';
  if (k >= k_th) return 'fast';
  return 'doubleEnd';
}

function evaluate(thresholds, testSet) {
  let correct = 0;
  let totalTime = 0;
  for (const s of testSet) {
    const chosen = decideStrategy(s, thresholds);
    if (chosen === s.best) correct++;
    let time;
    if (chosen === 'simple') time = s.tSim;
    else if (chosen === 'doubleEnd') time = s.tDou;
    else time = s.tFst;
    totalTime += time;
  }
  return {
    accuracy: correct / testSet.length,
    avgTime: totalTime / testSet.length
  };
}

// ========== 4. 校准函数（返回详细搜索数据） ==========
async function calibrateWithDetails() {
  const testSet = generateTestSet();
  console.log(`测试集样本数: ${testSet.length}`);

  let thresholds = { n1: 50, n2: 500, m_th: 0.3, c_th: 0.5, k_th: 0.6 };
  const searchConfig = {
    n1: { min: 30, max: 70, step: 5, paramName: 'n1' },
    n2: { min: 400, max: 600, step: 20, paramName: 'n2' },
    m_th: { min: 0.20, max: 0.40, step: 0.02, paramName: 'm_th' },
    c_th: { min: 0.40, max: 0.60, step: 0.02, paramName: 'c_th' },
    k_th: { min: 0.50, max: 0.70, step: 0.02, paramName: 'k_th' }
  };
  const order = ['n1', 'n2', 'm_th', 'c_th', 'k_th'];
  const allResults = [];

  for (const param of order) {
    const cfg = searchConfig[param];
    let bestVal = thresholds[param];
    let bestAcc = 0;
    let bestTime = Infinity;
    const candidates = [];
    for (let v = cfg.min; v <= cfg.max + 1e-9; v += cfg.step) {
      const testTh = { ...thresholds, [param]: v };
      const { accuracy, avgTime } = evaluate(testTh, testSet);
      candidates.push({ value: v, accuracy, avgTime });
      if (accuracy > bestAcc || (Math.abs(accuracy - bestAcc) < 1e-6 && avgTime < bestTime)) {
        bestAcc = accuracy;
        bestTime = avgTime;
        bestVal = v;
      }
    }
    thresholds[param] = bestVal;
    allResults.push({
      paramName: cfg.paramName,
      candidates,
      bestValue: bestVal,
      bestAccuracy: bestAcc,
      bestAvgTime: bestTime
    });
  }
  const final = evaluate(thresholds, testSet);
  return {
    details: allResults,
    final: {
      thresholds,
      accuracy: (final.accuracy * 100).toFixed(2),
      avgTime: final.avgTime.toFixed(3)
    }
  };
}

// 按钮点击处理
async function runCalibration() {
  running.value = true;
  try {
    const { details, final } = await calibrateWithDetails();
    results.value = details;
    finalResult.value = final;
  } catch (err) {
    console.error('校准失败:', err);
  } finally {
    running.value = false;
  }
}
</script>

<style scoped>
.container {
  font-family: Arial, sans-serif;
  max-width: 900px;
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
.param-result {
  margin-bottom: 30px;
  background: #fff;
  padding: 10px;
  border-radius: 4px;
  border-left: 4px solid #42b983;
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
.final-result {
  margin-top: 20px;
  background: #e6f7ff;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #1890ff;
}
pre {
  background: #f0f0f0;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>