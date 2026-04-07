<script setup>
import { ref, getCurrentInstance, onMounted, nextTick } from "vue";
// 列表数据（用于模板渲染，必须存在）
const items = ref([]);
const buttonRef = ref(null);

onMounted(() => {
	items.value = generateComplexityList();
	if (buttonRef.value) buttonRef.value.click();
});

const instance = getCurrentInstance();

// 实验参数
const cListInput = ref("0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9");
const repeats = ref(20);
const itemCount = ref(200);
const moveRatio = ref(0.4);
const results = ref([]);

// ---------- 固定种子的随机函数（保证可重复）----------
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

// 生成具有指定重型节点比例的列表（重型节点含子元素）
function generateComplexityList(heavyRatio, n) {
	const list = [];
	const heavyCount = Math.floor(n * heavyRatio);
	for (let i = 0; i < n; i++) {
		const id = `n${i + 1}`;
		const isHeavy = i < heavyCount;
		list.push({
			id,
			name: isHeavy ? `Heavy ${id}` : `Light ${id}`,
			isHeavy,
			children: isHeavy
				? Array(5)
						.fill(0)
						.map((_, idx) => ({ text: `sub ${idx}` }))
				: [],
		});
	}
	// 打乱顺序，使重型节点均匀分布
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

	const cValues = cListInput.value
		.split(",")
		.map((s) => parseFloat(s.trim()))
		.filter((v) => !isNaN(v));
	const n = itemCount.value;
	const m = moveRatio.value;
	const rep = repeats.value;

	for (const c of cValues) {
		console.log(`测试重型节点比例: ${c * 100}%`);
		// 生成初始列表（带复杂度）
		const oldList = generateComplexityList(c, n);
		// 生成新列表（基于旧列表，固定移动比例 m）
		const newList = generateNewListByMoveRatio(oldList, m);

		let sumDoubleEnd = 0,
			sumFast = 0;

		// 测试双端 Diff
		for (let i = 0; i < rep; i++) {
			// 重置列表
			items.value = [...oldList];
			await nextTick();
			const start = performance.now();
			setStrategy("doubleEnd");
			items.value = [...newList];
			await nextTick();
			const end = performance.now();
			sumDoubleEnd += end - start;
		}

		// 测试快速 Diff
		for (let i = 0; i < rep; i++) {
			items.value = [...oldList];
			await nextTick();
			const start = performance.now();
			setStrategy("fast");
			items.value = [...newList];
			await nextTick();
			const end = performance.now();
			sumFast += end - start;
		}

		const avgDoubleEnd = Number((sumDoubleEnd / rep).toFixed(2));
		const avgFast = Number((sumFast / rep).toFixed(2));
		const diff = Number((avgDoubleEnd - avgFast).toFixed(2));
		results.value.push({ c, avgDoubleEnd, avgFast, diff });
		console.log(
			`c=${c}: double=${avgDoubleEnd}ms, fast=${avgFast}ms, diff=${diff}ms`
		);
	}
// 将数组转换为以 name 为键的对象
const resultsMap = results.value.reduce((acc, result) => {
  acc[result.c] = result;
  return acc;
}, {});
	console.table(`实验结果`);
	console.table(resultsMap);
}
</script>

<template>
  <div>
    <div data-monitor-list>
      <div v-for="(item, index) in items" :key="index">
        <span>{{ item.name }}</span>
        <div v-if="item.isHeavy" style="margin-left: 20px;">
          <div v-for="(child, idx) in item.children" :key="idx">{{ child.text }}</div>
        </div>
      </div>
    </div>
    <button ref="buttonRef" type="button" @click="changeData">change</button>
    <button type="button" @click="resetTest" style="margin-left: 10px;">重置测试</button>
  </div>
</template>