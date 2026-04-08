<script setup>
import { ref, getCurrentInstance, onMounted, nextTick } from "vue";

const instance = getCurrentInstance();
const results = ref([]);
const buttonRef = ref(null);

onMounted(() => {
	items.value = generateInitialList();
	if (buttonRef.value) buttonRef.value.click();
});

// 实验固定参数
const N = 200; // 列表规模
const MOVE_RATIO = 0.4; // 移动比例
const REPEATS = 20; // 每种 key 类型重复次数

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
			// 'none'
			keyValue = undefined; // 无 key
		}
		list.push({
			id,
			name: `Item ${id}`,
			keyValue,
		});
	}
	// 打乱顺序，避免初始顺序影响
	return shuffleArray(list);
}

// 设置 Diff 策略
function setStrategy(strategy) {
	if (instance && instance.proxy) {
		instance.proxy.__diffStrategy = strategy;
	}
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
		// 生成初始列表
		const oldList = generateInitialList(keyCfg.type);
		// 生成新列表（基于旧列表，移动比例固定）
		const newList = generateNewListByMoveRatio(oldList, MOVE_RATIO);

		let sumDoubleEnd = 0,
			sumFast = 0;

		// 测试双端 Diff
		for (let i = 0; i < REPEATS; i++) {
			// 重置列表为旧列表（深拷贝）
			items.value = JSON.parse(JSON.stringify(oldList));
			await nextTick();
			const start = performance.now();
			setStrategy("doubleEnd");
			items.value = JSON.parse(JSON.stringify(newList));
			await nextTick();
			const end = performance.now();
			sumDoubleEnd += end - start;
		}

		// 测试快速 Diff
		for (let i = 0; i < REPEATS; i++) {
			items.value = JSON.parse(JSON.stringify(oldList));
			await nextTick();
			const start = performance.now();
			setStrategy("fast");
			items.value = JSON.parse(JSON.stringify(newList));
			await nextTick();
			const end = performance.now();
			sumFast += end - start;
		}

		const avgDoubleEnd = Number((sumDoubleEnd / REPEATS).toFixed(2));
		const avgFast = Number((sumFast / REPEATS).toFixed(2));
		const diff = Number((avgDoubleEnd - avgFast).toFixed(2));

		results.value.push({
			type: keyCfg.name,
			k: keyCfg.k,
			avgDoubleEnd,
			avgFast,
			diff,
		});
		console.log(
			`${keyCfg.name}: double=${avgDoubleEnd}ms, fast=${avgFast}ms, diff=${diff}ms`
		);
	}
	console.table(`实验结果`);
	console.table(results.value);
}

// 列表数据（用于模板渲染）
const items = ref([]);
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