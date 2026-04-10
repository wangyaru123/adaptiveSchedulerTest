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
const N = 200; // 列表规模
const ROUNDS = 50; // 回合数
const PER_ROUND = 20; // 每回合测量次数
const moveRatios = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

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

// 生成初始列表（轻量节点，稳定 ID）
function generateInitialList() {
	const list = [];
	for (let i = 0; i < N; i++) {
		list.push({
			id: `n${i + 1}`,
			name: `Item ${i + 1}`,
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

// 延迟函数
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

	const oldList = generateInitialList(); // 固定旧列表（所有 m 共用）

	for (const m of moveRatios) {
		console.log(`测试移动比例: ${m.toFixed(1)}`);
		// 基于旧列表生成新列表（移动比例 m）
		const newList = generateNewListByMoveRatio(oldList, m);

		const avgDouble = await runStrategyWithRounds(
			"doubleEnd",
			oldList,
			newList
		);
		const avgFast = await runStrategyWithRounds("fast", oldList, newList);
		const diff = avgDouble - avgFast;

		results.value.push({
			m,
			avgDouble: Number(avgDouble.toFixed(2)),
			avgFast: Number(avgFast.toFixed(2)),
			diff: Number(diff.toFixed(2)),
		});
		console.log(
			`m=${m.toFixed(1)}: double=${avgDouble.toFixed(
				2
			)}ms, fast=${avgFast.toFixed(2)}ms, diff=${diff.toFixed(2)}ms`
		);
	}

	console.table("移动比例实验结果：");
	console.table(results.value);
}

// 重置测试
const resetTest = () => {
	window.location.reload();
};

onMounted(() => {
	// 初始化一个空列表，避免初始渲染报错
	items.value = generateInitialList();
	// 自动开始实验
	if (buttonRef.value) buttonRef.value.click();
});
</script>

<style scoped>
.read-the-docs {
	color: #888;
}
</style>