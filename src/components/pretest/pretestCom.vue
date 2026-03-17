<script setup>
import { ref, nextTick, onMounted } from "vue";

// 定义组件的可配置参数
const props = defineProps({
	diff: { type: String, default: "快速Diff" },
	// 数据规模（初始列表长度）
	itemCount: { type: Number, required: true },
	// 操作类型：'push'（尾部插入）或 'unshift'（头部插入）
	operation: { type: String, default: "push" },
	// 测试总次数（默认 1000）
	maxTests: { type: Number, default: 1000 },

});

// 根据规模和操作类型生成独立的存储键，避免不同测试互相干扰
const initKey = `initArrData_${props.itemCount}_${props.operation}`;
const testKey = `auto_test_data_${props.itemCount}_${props.operation}`;

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
	if (props.operation === "push") {
		console.log(
			`${props.diff}-规模${props.itemCount}-尾部插入-[第${
				getCurrentCount() + 1
			}次]实验`
		);
	} else if (props.operation === "unshift") {
		console.log(
			`${props.diff}-规模${props.itemCount}-头部插入-[第${
				getCurrentCount() + 1
			}次]实验`
		);
	} else if (props.operation === "towchange") {
		console.log(
			`${props.diff}-规模${props.itemCount}-首尾交换-[第${
				getCurrentCount() + 1
			}次]实验`
		);
	} else if (props.operation === "delete") {
		console.log(
			`${props.diff}-规模${props.itemCount}-尾部删除-[第${
				getCurrentCount() + 1
			}次]实验`
		);
	}

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
		items.value.pop(); // 删除最后一个元素，并返回被删除的元素
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