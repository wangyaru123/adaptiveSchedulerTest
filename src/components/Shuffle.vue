<script setup>
// 使用 defineComponent 并添加自定义属性
import { ref,nextTick,onUpdated,defineComponent} from "vue";

defineComponent({
  adaptiveScheduler: true  // 启用自适应调度
})

const items = ref([
	{ id: "n1", name: "n1" },
	{ id: "n2", name: "n2" },
  { id: "n3", name: "n3" },
  { id: "n4", name: "n4" },
  { id: "n5", name: "n5" },
]);
const changeData = () => {
	console.log('点击按钮，开始修改数据')
	items.value = [
    { id: "n6", name: "n6" },
    { id: "n4", name: "n4" },
    { id: "n3", name: "n3" },
    { id: "n2", name: "n2" },
    { id: "n1", name: "n1" },
  ];
  // 强制重新渲染（测试用）
  nextTick(() => {
    console.log('DOM 已更新');
  });
};
onUpdated(() => {
  console.log('组件已更新，patchChildren 已执行')
})

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
