// generateTestSet.js
// 前端版本：生成测试集 CSV 并提供下载

// 伪随机数生成器（固定种子，保证可重复）
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(42); // 固定种子

function randInt(min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}
function randUniform(a, b) {
  return a + rng() * (b - a);
}

// 特征采样
function sampleN() {
  const r = rng();
  if (r < 0.3) return randInt(10, 49);
  if (r < 0.7) return randInt(50, 499);
  return randInt(500, 5000);
}
function sampleM() {
  if (rng() < 0.8) return randUniform(0, 0.3);
  else return randUniform(0.3, 1.0);
}
function sampleC() {
  const r = rng();
  if (r < 0.3) return randUniform(0, 0.2);
  if (r < 0.7) return randUniform(0.2, 0.5);
  return randUniform(0.5, 1.0);
}
function sampleK() {
  const r = rng();
  if (r < 0.2) return randUniform(0, 0.4);
  if (r < 0.6) return randUniform(0.4, 0.7);
  return randUniform(0.7, 1.0);
}

// 性能模型
function timeSimple(n) {
  if (n < 50) return 0.12 + 0.005 * n;
  return 1000 + n * 0.5;
}
function timeDouble(n, m, c) {
  const base = 0.32 + 0.006 * n;
  const movePenalty = 2.0 * m * n / 1000;
  const complexityPenalty = 0.5 * c * n / 1000;
  return base + movePenalty + complexityPenalty;
}
function timeFast(n, m, k) {
  const base = 0.38 + 0.0058 * n;
  const lisOverhead = n > 1 ? 0.002 * n * Math.log2(n) : 0;
  let moveEffect = 0;
  if (m >= 0.3) moveEffect = -0.8 * m * n / 1000;
  const keyPenalty = 1.5 * (1 - k) * n / 1000;
  return base + lisOverhead + moveEffect + keyPenalty;
}

// 生成测试集数据（返回 CSV 字符串）
export function generateTestSetCSV(numSamples = 2000) {
  const rows = [];
  // 表头
  rows.push('n,m_est,c,k,best_strategy,time_simple,time_double,time_fast');
  for (let i = 0; i < numSamples; i++) {
    const n = sampleN();
    const m = sampleM();
    const c = sampleC();
    const k = sampleK();

    const tSimple = timeSimple(n);
    const tDouble = timeDouble(n, m, c);
    const tFast = timeFast(n, m, k);

    let best = 'fast';
    let min = tFast;
    if (tSimple < min) { best = 'simple'; min = tSimple; }
    if (tDouble < min) { best = 'doubleEnd'; min = tDouble; }

    rows.push([
      n,
      m.toFixed(4),
      c.toFixed(4),
      k.toFixed(4),
      best,
      tSimple.toFixed(3),
      tDouble.toFixed(3),
      tFast.toFixed(3)
    ].join(','));
  }
  return rows.join('\n');
}

// 生成并下载 CSV 文件
export function downloadTestSet(numSamples = 2000, filename = 'test_set.csv') {
  const csvContent = generateTestSetCSV(numSamples);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}