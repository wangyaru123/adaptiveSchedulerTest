// feedbackSimulation.js
// 基于拟合模型的阈值校准函数，可在 Vue 组件中使用

// ========== 1. 拟合模型（基于最新实验数据） ==========
// 这些函数模拟了三种 Diff 策略的耗时（毫秒）

/**
 * 朴素 Diff 耗时
 * @param {number} n 列表规模
 * @returns {number} 耗时（ms）
 */
function timeSimple(n) {
  if (n < 50) return 0.16 + 0.0032 * n;
  return 1000 + n * 0.5;   // 中大规模惩罚值
}

/**
 * 双端 Diff 耗时
 * @param {number} n 列表规模
 * @param {number} m 移动比例
 * @param {number} c 节点复杂度
 * @returns {number} 耗时（ms）
 */
function timeDouble(n, m, c) {
  const base = 0.12 + 0.0024 * n;
  const move = 15 * m * n / 1000;
  const comp = 9 * c * n / 1000;
  return base + move + comp;
}

// 快速 Diff 基准耗时插值点（尾部追加场景实测数据）
const fastBasePoints = [
  { n: 10, time: 0.23 },
  { n: 50, time: 0.27 },
  { n: 100, time: 0.38 },
  { n: 200, time: 0.70 },
  { n: 500, time: 1.18 },
  { n: 1000, time: 2.45 },
  { n: 5000, time: 16.25 }
];

/**
 * 获取快速 Diff 的基准耗时（线性插值）
 * @param {number} n 列表规模
 * @returns {number} 基准耗时（ms）
 */
function getFastBase(n) {
  if (n <= fastBasePoints[0].n) return fastBasePoints[0].time;
  if (n >= fastBasePoints[fastBasePoints.length - 1].n) return fastBasePoints[fastBasePoints.length - 1].time;
  for (let i = 0; i < fastBasePoints.length - 1; i++) {
    const p1 = fastBasePoints[i];
    const p2 = fastBasePoints[i + 1];
    if (n >= p1.n && n <= p2.n) {
      const t = (n - p1.n) / (p2.n - p1.n);
      return p1.time + t * (p2.time - p1.time);
    }
  }
  return 0;
}

/**
 * 快速 Diff 耗时
 * @param {number} n 列表规模
 * @param {number} m 移动比例
 * @param {number} k key稳定性系数（0~1）
 * @param {number} c 节点复杂度（仅当 c≤0.5 时使用拟合系数）
 * @returns {number} 耗时（ms）
 */
function timeFast(n, m, k, c) {
  const base = getFastBase(n);
  const move = 9.5 * m * n / 1000;
  let comp;
  if (c <= 0.5) {
    comp = 7.7 * c * n / 1000;
  } else {
    comp = 1000; // c>0.5 时惩罚，不应被选中
  }
  const keyPen = 11 * (1 - k) * n / 1000;
  return base + move + comp + keyPen;
}

// ========== 2. 生成测试集（基于拟合模型） ==========
// 生成覆盖多维特征空间的样本，每个样本包含特征和三种策略的耗时以及理论最优策略
function generateTestSet() {
  const samples = [];
  // 列表规模：覆盖阈值附近
  const nValues = [10, 30, 50, 70, 100, 200, 300, 500, 700, 1000, 2000, 5000];
  // 移动比例：0~1 步长 0.1
  const mValues = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  // 节点复杂度：重点覆盖 0.5 附近
  const cValues = [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1.0];
  // key 稳定性：重点覆盖 0.6 附近
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
          samples.push({ n, m, c, k, tSim, tDou, tFst, best });
        }
      }
    }
  }
  return samples;
}

// ========== 3. 启发式调度规则（基于阈值） ==========
/**
 * 根据阈值决策选择策略
 * @param {Object} sample 样本特征 { n, m, c, k }
 * @param {Object} thresholds 阈值配置 { n1, n2, m_th, c_th, k_th }
 * @returns {string} 策略名 'simple' | 'doubleEnd' | 'fast'
 */
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

/**
 * 评估一组阈值在测试集上的性能
 * @param {Object} thresholds 阈值配置
 * @param {Array} testSet 测试集
 * @returns {Object} { accuracy, avgTime }
 */
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

// ========== 4. 离线搜索校准函数 ==========
/**
 * 执行阈值校准（基于拟合模型）
 * @returns {Promise<Object>} 返回校准后的性能指标和最终阈值
 */
export async function calibrate() {
  console.log('生成测试集...');
  const testSet = generateTestSet();
  console.log(`测试集样本数: ${testSet.length}`);

  // 初始阈值（预实验值）
  let thresholds = {
    n1: 50,
    n2: 500,
    m_th: 0.3,
    c_th: 0.5,
    k_th: 0.6
  };

  // 各阈值的搜索范围与步长
  const searchConfig = {
    n1: { min: 30, max: 70, step: 5 },
    n2: { min: 400, max: 600, step: 20 },
    m_th: { min: 0.20, max: 0.40, step: 0.02 },
    c_th: { min: 0.40, max: 0.60, step: 0.02 },
    k_th: { min: 0.50, max: 0.70, step: 0.02 }
  };

  const order = ['n1', 'n2', 'm_th', 'c_th', 'k_th'];

  // 顺序校准每个阈值（固定其他）
  for (const param of order) {
    const cfg = searchConfig[param];
    let bestVal = thresholds[param];
    let bestAcc = 0;
    let bestTime = Infinity;
    console.log(`校准 ${param} ...`);
    for (let v = cfg.min; v <= cfg.max + 1e-9; v += cfg.step) {
      const testTh = { ...thresholds, [param]: v };
      const { accuracy, avgTime } = evaluate(testTh, testSet);
      if (accuracy > bestAcc || (Math.abs(accuracy - bestAcc) < 1e-6 && avgTime < bestTime)) {
        bestAcc = accuracy;
        bestTime = avgTime;
        bestVal = v;
      }
    }
    thresholds[param] = bestVal;
    console.log(`  最优: ${param}=${bestVal.toFixed(3)} (acc=${(bestAcc * 100).toFixed(2)}%, avgTime=${bestTime.toFixed(3)}ms)`);
  }

  // 最终评估
  const final = evaluate(thresholds, testSet);
  console.log(`最终准确率: ${(final.accuracy * 100).toFixed(2)}%`);
  console.log(`最终平均耗时: ${final.avgTime.toFixed(3)} ms`);

  // 返回结果对象（与 Vue 模板匹配）
  return {
    accuracy: (final.accuracy * 100).toFixed(2),
    avgTime: final.avgTime.toFixed(3),
    finalMth: thresholds.m_th.toFixed(3),
    thresholds
  };
}