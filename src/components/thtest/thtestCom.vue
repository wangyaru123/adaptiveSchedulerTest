<script setup>
import { ref, nextTick, onMounted, getCurrentInstance } from "vue";

// 定义组件的可配置参数
const props = defineProps({
	diff: { type: String, default: "快速Diff" },
	itemCount: { type: Number, required: true },
	operation: { type: String, default: "push" }, // 支持 'push', 'unshift', 'towchange', 'delete', 'randomMove', 'testComplexity'
	maxTests: { type: Number, default: 20 },
	moveRatio: { type: Number, default: 0.3 }, // 仅对 randomMove 有效，移动比例 0~1
	heavyRatio: { type: Number, default: 0.3 }, // 仅对 testComplexity 有效，移动比例 0~1
});

const instance = getCurrentInstance();

// ---------- 固定种子的随机函数（用于生成可重复的随机列表）----------
function mulberry32(seed) {
	return function () {
		let t = (seed += 0x6d2b79f5);
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
const rng = mulberry32(42); // 固定种子

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
	console.log("newList----", newList);

	return newList;
}

// 根据规模和操作类型生成独立的存储键，避免不同测试互相干扰
let initKey = `initArrData_${props.itemCount}_${props.operation}`;
let testKey = `auto_test_data_${props.itemCount}_${props.operation}`;
if (props.operation === "randomMove") {
	initKey += `_${props.moveRatio}`;
	testKey += `_${props.moveRatio}`;
}
if (props.operation === "testComplexity") {
	initKey += `_${props.heavyRatio}`;
	testKey += `_${props.heavyRatio}`;
}
const items = ref([]);
const buttonRef = ref(null);
let updateStartTime = 0;

// 初始化数组：从 sessionStorage 读取或重新生成
const initArr = () => {
	const stored = sessionStorage.getItem(initKey);
	if (stored) {
		items.value = JSON.parse(stored);
	} else {
		const arr = [];
		for (let i = 1; i <= props.itemCount; i++) {
			arr.push({ id: `n${i}`, name: `n${i}` });
		}
		sessionStorage.setItem(initKey, JSON.stringify(arr));
		items.value = arr;
	}
};
// 生成具有指定重型节点比例的列表（n = 200，重型节点含子元素）
function generateComplexityList() {
	const stored = sessionStorage.getItem(initKey);
	const heavyCount = Math.floor(props.itemCount * props.heavyRatio);
	if (stored) {
		items.value = JSON.parse(stored);
	} else {
		const arr = [];
		for (let i = 1; i <= props.itemCount; i++) {
			const id = `n${i + 1}`;
			const isHeavy = i < heavyCount;
			arr.push({
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
		sessionStorage.setItem(initKey, JSON.stringify(arr));
		// 打乱顺序，使重型节点均匀分布
		items.value = shuffleArray(arr);
		console.log("items.value", items.value);
	}
}
// 执行测试操作（一次点击）
const changeData = () => {
	updateStartTime = performance.now();
	let opName = "";
	if (props.operation === "push") opName = "尾部插入";
	else if (props.operation === "unshift") opName = "头部插入";
	else if (props.operation === "towchange") opName = "首尾交换";
	else if (props.operation === "delete") opName = "尾部删除";
	else if (props.operation === "randomMove")
		opName = `随机重排(${props.moveRatio})`;
	else if (props.operation === "testComplexity")
		opName = `测试复杂度(${props.heavyRatio})`;

	console.log(
		`${props.diff}-规模${props.itemCount}-${opName}-[${
			getCurrentCount() + 1
		}次]实验`
	);
	console.log(`更新开始时间`, updateStartTime);

	// 根据 operation 参数执行不同的数组修改
	if (props.operation === "push") {
		items.value.push({ id: `n${items.value.length + 1}`, name: `新项` });
	} else if (props.operation === "unshift") {
		items.value.unshift({ id: `n${items.value.length + 1}`, name: `新项` });
	} else if (props.operation === "towchange") {
		[items.value[0], items.value[items.value.length - 1]] = [
			items.value[items.value.length - 1],
			items.value[0],
		];
	} else if (props.operation === "delete") {
		items.value.pop();
	} else if (
		props.operation === "randomMove" ||
		props.operation === "testComplexity"
	) {
		const newList = generateNewListByMoveRatio(
			items.value,
			props.moveRatio
		);
		items.value = newList;
	}

	nextTick(() => {
		const endTime = performance.now();
		const duration = endTime - updateStartTime;
		console.log(`更新完成时间: ${endTime}`);
		console.log(`更新耗时: ${duration}ms`);

		saveResult(duration);

		// 自动继续测试（如果正在自动运行）
		if (sessionStorage.getItem(testKey)) {
			const data = loadData();
			data.count += 1;
			if (data.count < props.maxTests) {
				saveData(data);
				if (props.operation === "testComplexity") {
					generateComplexityList();
				} else {
					initArr(); // 重置数组到初始状态，保证每次起始数据一致
				}

				if (buttonRef.value) {
					buttonRef.value.click();
				}
			} else {
				console.log("测试完成，所有耗时：", data.durations);
				const avg =
					data.durations.reduce((a, b) => a + b, 0) / props.maxTests;
				console.log("平均耗时：", avg);
				sessionStorage.removeItem(testKey);
			}
		}
	});
};

// 获取当前已执行次数
const getCurrentCount = () => loadData().count;

// 保存单次结果
const saveResult = (duration) => {
	const data = loadData();
	data.durations.push(duration);
	saveData(data);
};

// 读取测试数据
const loadData = () => {
	const stored = sessionStorage.getItem(testKey);
	return stored ? JSON.parse(stored) : { count: 0, durations: [] };
};

// 保存测试数据
const saveData = (data) => {
	sessionStorage.setItem(testKey, JSON.stringify(data));
};

// 重置测试（清除存储并刷新页面）
const resetTest = () => {
	sessionStorage.removeItem(testKey);
	window.location.reload();
};

onMounted(() => {
	sessionStorage.removeItem(initKey);
	if (props.operation === "testComplexity") {
		generateComplexityList();
	} else {
		initArr();
	}
});
</script>

<template>
  <div>
    <!-- 原有测试区域 -->
    <div data-monitor-list>
      <div v-for="(item, index) in items" :key="index">
        <span>{{ item.name }}</span>
        <!-- 渲染重型节点的子元素（实验用） -->
        <div v-if="item.isHeavy" style="margin-left: 20px;">
          <div v-for="(child, idx) in item.children" :key="idx">{{ child.text }}</div>
        </div>
      </div>
    </div>

    <button ref="buttonRef" type="button" @click="changeData">
      change
    </button>

    <button type="button" @click="resetTest" style="margin-left: 10px;">
      重置测试
    </button>


  </div>
</template>

<style scoped>
.read-the-docs {
	color: #888;
}
</style>