// feedbackSimulation.js
// 用途：在浏览器/Vue环境中离线验证在线反馈调度器的有效性
// 依赖：无 Node.js API，纯 JavaScript，可直接在 Vue 组件中 import 使用

// ------------------------------
// 1. 性能模型（基于预实验数据拟合，无噪声）
// ------------------------------

/**
 * 朴素 Diff 耗时估算
 * @param {number} n 列表规模
 * @returns {number} 估算耗时（毫秒）
 */
function timeSimple(n) {
  if (n < 50) return 0.12 + 0.005 * n;   // 小规模线性拟合
  return 1000 + n * 0.5;                 // 中大规模惩罚值，避免被选中
}

/**
 * 双端 Diff 耗时估算
 * @param {number} n 列表规模
 * @param {number} m 移动比例
 * @param {number} c 节点复杂度
 * @returns {number} 估算耗时（毫秒）
 */
function timeDouble(n, m, c) {
  const base = 0.32 + 0.006 * n;
  const movePenalty = 2.0 * m * n / 1000;
  const complexityPenalty = 0.5 * c * n / 1000;
  return base + movePenalty + complexityPenalty;
}

/**
 * 快速 Diff 耗时估算
 * @param {number} n 列表规模
 * @param {number} m 移动比例
 * @param {number} k key稳定性系数
 * @returns {number} 估算耗时（毫秒）
 */
function timeFast(n, m, k) {
  const base = 0.38 + 0.0058 * n;
  const lisOverhead = n > 1 ? 0.002 * n * Math.log2(n) : 0;
  let moveEffect = 0;
  if (m >= 0.3) moveEffect = -0.8 * m * n / 1000;
  const keyPenalty = 1.5 * (1 - k) * n / 1000;
  return base + lisOverhead + moveEffect + keyPenalty;
}

/**
 * 真实最优策略（无噪声）
 * @param {Object} f 特征向量 { n, m_est, c, k }
 * @returns {string} 'simple' | 'doubleEnd' | 'fast'
 */
function trueBestStrategy(f) {
  const t1 = timeSimple(f.n);
  const t2 = timeDouble(f.n, f.m_est, f.c);
  const t3 = timeFast(f.n, f.m_est, f.k);
  if (t1 <= t2 && t1 <= t3) return 'simple';
  if (t2 <= t1 && t2 <= t3) return 'doubleEnd';
  return 'fast';
}

// ------------------------------
// 2. 特征生成器（模拟真实负载）
// ------------------------------
class FeatureGenerator {
  /**
   * @param {number} seed 随机种子，保证可重复
   */
  constructor(seed = 42) {
    this.rng = this.mulberry32(seed);
    this.step = 0;
  }

  // Mulberry32 伪随机数生成器，返回 [0,1) 的浮点数
  mulberry32(seed) {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /**
   * 生成下一个特征向量
   * @returns {Object} { n, m_est, c, k }
   */
  next() {
    this.step++;
    // 两种负载模式：前 5000 步平稳，后 5000 步突变（高移动、大规模）
    const mode = this.step < 5000 ? 'stable' : 'high_mobility';
    let n, m_est, c, k;
    if (mode === 'stable') {
      n = this.sampleN([0.3, 0.4, 0.3], [10, 50, 500]);
      m_est = this.sampleM(0.8, 0.3);
      c = this.sampleC([0.3, 0.4, 0.3], [0, 0.2, 0.5]);
      k = this.sampleK([0.2, 0.4, 0.4], [0, 0.4, 0.7]);
    } else {
      n = this.sampleN([0.2, 0.3, 0.5], [10, 50, 500]);
      m_est = this.sampleM(0.4, 0.5);
      c = this.sampleC([0.2, 0.3, 0.5], [0, 0.2, 0.5]);
      k = this.sampleK([0.3, 0.3, 0.4], [0, 0.4, 0.7]);
    }
    return { n, m_est, c, k };
  }

  /**
   * 采样列表规模 n
   * @param {number[]} probs 三个区间的概率 [小,中,大]
   * @param {number[]} bounds 三个区间的下界 [小下界,中下界,大下界]
   * @returns {number}
   */
  sampleN(probs, bounds) {
    const r = this.rng();
    if (r < probs[0]) {
      const min = bounds[0];
      const max = bounds[1] - 1;
      return min + Math.floor(this.rng() * (max - min + 1));
    }
    if (r < probs[0] + probs[1]) {
      const min = bounds[1];
      const max = bounds[2] - 1;
      return min + Math.floor(this.rng() * (max - min + 1));
    }
    const min = bounds[2];
    const max = 5000;
    return min + Math.floor(this.rng() * (max - min + 1));
  }

  /**
   * 采样移动比例 m_est
   * @param {number} probLow 低移动比例（< lowMax）的概率
   * @param {number} lowMax 低移动比例的上界
   * @returns {number}
   */
  sampleM(probLow, lowMax) {
    if (this.rng() < probLow) return this.rng() * lowMax;
    else return lowMax + this.rng() * (1 - lowMax);
  }

  /**
   * 采样节点复杂度 c（通用方法，也用于 k）
   * @param {number[]} probs 三个区间的概率 [轻量,中,重]
   * @param {number[]} thresholds 三个区间的下界 [轻量下界,中下界,重下界]
   * @returns {number}
   */
  sampleC(probs, thresholds) {
    const r = this.rng();
    if (r < probs[0]) return this.rng() * thresholds[1];
    if (r < probs[0] + probs[1]) return thresholds[1] + this.rng() * (thresholds[2] - thresholds[1]);
    return thresholds[2] + this.rng() * (1 - thresholds[2]);
  }

  sampleK(probs, thresholds) {
    return this.sampleC(probs, thresholds);
  }
}

// ------------------------------
// 3. 反馈调度器（在线学习、ε-贪婪、历史记录和动态阈值）
// ------------------------------
class FeedbackScheduler {
  /**
   * @param {number} initialMth 初始移动比例阈值
   * @param {number} epsilon 探索概率
   * @param {number} adjustInterval 每多少步触发一次阈值调整
   */
  constructor(initialMth = 0.3, epsilon = 0.05, adjustInterval = 200) {
    this.m_th = initialMth;
    this.epsilon = epsilon;
    this.adjustInterval = adjustInterval;
    this.step = 0;
    // records: Map<离散化特征键, Map<策略名, { avgTime, count }>>
    this.records = new Map();
  }

  /**
   * 离散化特征：将连续特征转为区间索引字符串
   * @param {Object} f 特征向量
   * @returns {string}
   */
  discretize(f) {
    const nBin = f.n < 50 ? 0 : f.n < 200 ? 1 : f.n < 500 ? 2 : 3;
    const mBin = Math.min(4, Math.floor(f.m_est / 0.2));
    const cBin = Math.min(4, Math.floor(f.c / 0.2));
    const kBin = Math.min(4, Math.floor(f.k / 0.2));
    return `${nBin}_${mBin}_${cBin}_${kBin}`;
  }

  /**
   * 决策函数
   * @param {Object} f 特征向量
   * @returns {string} 'simple' | 'doubleEnd' | 'fast'
   */
  decide(f) {
    const key = this.discretize(f);
    const rec = this.records.get(key);
    let bestStrategy = null;
    if (rec) {
      let bestTime = Infinity;
      for (const [strat, data] of rec.entries()) {
        if (data.count >= 10 && data.avgTime < bestTime) {
          bestTime = data.avgTime;
          bestStrategy = strat;
        }
      }
    }
    // ε-贪婪
    if (bestStrategy && Math.random() > this.epsilon) {
      return bestStrategy;
    }
    // 启发式回退
    if (f.n < 50) return 'simple';
    if (f.n >= 500) return 'fast';
    if (f.m_est < this.m_th) return 'doubleEnd';
    return 'fast';
  }

  /**
   * 更新历史记录（指数加权移动平均）
   * @param {Object} f 特征向量
   * @param {string} chosen 所选策略
   * @param {number} duration 实际耗时（毫秒）
   */
  update(f, chosen, duration) {
    const key = this.discretize(f);
    if (!this.records.has(key)) this.records.set(key, new Map());
    const stratMap = this.records.get(key);
    const old = stratMap.get(chosen);
    if (old) {
      const newAvg = 0.3 * duration + 0.7 * old.avgTime; // α=0.3
      stratMap.set(chosen, { avgTime: newAvg, count: old.count + 1 });
    } else {
      stratMap.set(chosen, { avgTime: duration, count: 1 });
    }
    this.step++;
    if (this.step % this.adjustInterval === 0) {
      this.adjustThreshold();
    }
  }

  /**
   * 阈值调整：基于边界样本的误判方向，微调 m_th
   */
  adjustThreshold() {
    let increase = 0;
    let decrease = 0;
    for (const [key, stratMap] of this.records.entries()) {
      const parts = key.split('_').map(Number);
      const m_center = (parts[1] + 0.5) * 0.2;
      if (Math.abs(m_center - this.m_th) > 0.05) continue;
      const timeDouble = stratMap.get('doubleEnd')?.avgTime;
      const timeFast = stratMap.get('fast')?.avgTime;
      if (!timeDouble || !timeFast) continue;
      const best = timeDouble < timeFast ? 'doubleEnd' : 'fast';
      const decision = m_center < this.m_th ? 'doubleEnd' : 'fast';
      if (best !== decision) {
        if (best === 'fast') decrease++;
        else increase++;
      }
    }
    const total = increase + decrease;
    if (total === 0) return;
    const delta = ((increase - decrease) / total) * 0.02;
    let newMth = this.m_th + delta;
    newMth = Math.min(0.4, Math.max(0.2, newMth));
    if (newMth !== this.m_th) {
      console.log(`[Feedback] Step ${this.step}: m_th ${this.m_th.toFixed(3)} → ${newMth.toFixed(3)}`);
      this.m_th = newMth;
    }
  }

  getMth() { return this.m_th; }
}

// ------------------------------
// 4. 仿真运行函数（供 Vue 调用）
// ------------------------------

/**
 * 运行仿真，返回结果对象
 * @param {number} totalSteps 总步数，默认10000
 * @returns {Promise<Object>} { accuracy, avgTime, finalMth, mthTrace }
 */
export async function runSimulation(totalSteps = 10000) {
  const gen = new FeatureGenerator(42);
  const scheduler = new FeedbackScheduler(0.30, 0.05, 200);
  let correct = 0;
  let totalTime = 0;
  const mthTrace = [];

  for (let i = 0; i < totalSteps; i++) {
    const f = gen.next();
    const trueBest = trueBestStrategy(f);
    const chosen = scheduler.decide(f);
    let time;
    if (chosen === 'simple') time = timeSimple(f.n);
    else if (chosen === 'doubleEnd') time = timeDouble(f.n, f.m_est, f.c);
    else time = timeFast(f.n, f.m_est, f.k);
    scheduler.update(f, chosen, time);
    if (chosen === trueBest) correct++;
    totalTime += time;
    if (i % 1000 === 0) {
      mthTrace.push({ step: i, m_th: scheduler.getMth() });
    }
  }
  const accuracy = correct / totalSteps;
  const avgTime = totalTime / totalSteps;
  return {
    accuracy: (accuracy * 100).toFixed(2),
    avgTime: avgTime.toFixed(3),
    finalMth: scheduler.getMth().toFixed(3),
    mthTrace,
  };
}