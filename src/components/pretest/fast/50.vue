<script setup>
// 使用 defineComponent 并添加自定义属性
import { ref, nextTick, onUpdated, defineComponent } from "vue";

// defineComponent({
//   adaptiveScheduler: true  // 启用自适应调度
// })

const items = ref([
	{ id: "n1", name: "n1" },
	{ id: "n2", name: "n2" },
	{ id: "n3", name: "n3" },
	{ id: "n4", name: "n4" },
	{ id: "n5", name: "n5" },
	{ id: "n6", name: "n6" },
	{ id: "n7", name: "n7" },
	{ id: "n8", name: "n8" },
	{ id: "n9", name: "n9" },
	{ id: "n10", name: "n10" },
	{ id: "n11", name: "n11" },
	{ id: "n12", name: "n12" },
	{ id: "n13", name: "n13" },
	{ id: "n14", name: "n14" },
	{ id: "n15", name: "n15" },
	{ id: "n16", name: "n16" },
	{ id: "n17", name: "n17" },
	{ id: "n18", name: "n18" },
	{ id: "n19", name: "n19" },
	{ id: "n20", name: "n20" },
	{ id: "n21", name: "n21" },
	{ id: "n22", name: "n22" },
	{ id: "n23", name: "n23" },
	{ id: "n24", name: "n24" },
	{ id: "n25", name: "n25" },
	{ id: "n26", name: "n26" },
	{ id: "n27", name: "n27" },
	{ id: "n28", name: "n28" },
	{ id: "n29", name: "n29" },
	{ id: "n30", name: "n30" },
	{ id: "n31", name: "n31" },
	{ id: "n32", name: "n32" },
	{ id: "n33", name: "n33" },
	{ id: "n34", name: "n34" },
	{ id: "n35", name: "n35" },
	{ id: "n36", name: "n36" },
	{ id: "n37", name: "n37" },
	{ id: "n38", name: "n38" },
	{ id: "n39", name: "n39" },
	{ id: "n40", name: "n40" },
	{ id: "n41", name: "n41" },
	{ id: "n42", name: "n42" },
	{ id: "n43", name: "n43" },
	{ id: "n44", name: "n44" },
	{ id: "n45", name: "n45" },
	{ id: "n46", name: "n46" },
	{ id: "n47", name: "n47" },
	{ id: "n48", name: "n48" },
	{ id: "n49", name: "n49" },
	{ id: "n50", name: "n50" },
]);
let updateStartTime = 0;
const changeData = () => {
	// 1. 记录更新触发时间（数据变更前）
	updateStartTime = performance.now();
	console.log("更新开始时间", updateStartTime);

	// 2. 修改数据
	items.value.push({ id: `n51`, name: `n51` });

	// 3. 使用 nextTick 确保 DOM 更新完成后统计
	nextTick(() => {
		const endTime = performance.now();
		console.log("更新完成时间", endTime);

		const duration = endTime - updateStartTime;
		console.log(`更新完成，总耗时: ${duration}ms`);
		// console.log(`更新完成，总耗时: ${duration.toFixed(3)}ms`);
	});
};
onUpdated(() => {
	// console.log("组件已更新，patchChildren 已执行");
});
</script>

<template>
  <div data-monitor-list>
    <div v-for="(item,index) in items" :key="index">
      {{ item.name }}
    </div>
  </div>
 
  <button type="button" @click="changeData">调整顺序</button>

</template>

<style scoped>
.read-the-docs {
	color: #888;
}
</style>
