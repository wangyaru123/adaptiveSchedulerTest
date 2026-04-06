<script setup>
import { ref, nextTick, onMounted } from "vue";

// 定义组件的可配置参数
const props = defineProps({
	diff: { type: String, default: "快速Diff" },
	itemCount: { type: Number, required: true },
	operation: { type: String, default: "push" }, // 支持 'push', 'unshift', 'towchange', 'delete', 'randomMove'
	maxTests: { type: Number, default: 20 },
	moveRatio: { type: Number, default: 0.3 }, // 仅对 randomMove 有效，移动比例 0~1
});

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

	// 生成索引数组并随机打乱
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

// 根据规模和操作类型生成独立的存储键，避免不同测试互相干扰
let initKey = `initArrData_${props.itemCount}_${props.operation}`;
let testKey = `auto_test_data_${props.itemCount}_${props.operation}`;
if (props.operation === "randomMove") {
	initKey += `_${props.moveRatio}`;
	testKey += `_${props.moveRatio}`;
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

// 执行测试操作（一次点击）
const changeData = () => {
	updateStartTime = performance.now();
	// 构造操作名称字符串用于日志
	let opName = "";
	if (props.operation === "push") opName = "尾部插入";
	else if (props.operation === "unshift") opName = "头部插入";
	else if (props.operation === "towchange") opName = "首尾交换";
	else if (props.operation === "delete") opName = "尾部删除";
	else if (props.operation === "randomMove")
		opName = `随机重排(${props.moveRatio})`;

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
	} else if (props.operation === "randomMove") {
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
				initArr(); // 重置数组到初始状态，保证每次起始数据一致
				if (buttonRef.value) {
					buttonRef.value.click(); // 自动触发下一次点击
				}
			} else {
				// 测试完成，输出汇总
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
	// 每次挂载时重新生成初始数据（保证起始状态一致）
	sessionStorage.removeItem(initKey);
	initArr();
});
</script>

<template>
  <div data-monitor-list>
    <div v-for="(item, index) in items" :key="index">
      {{ item.name }}
    </div>
  </div>

  <button ref="buttonRef" type="button" @click="changeData">
    change
  </button>

  <button type="button" @click="resetTest" style="margin-left: 10px;">
    重置测试
  </button>
</template>

<style scoped>
.read-the-docs {
	color: #888;
}
</style>