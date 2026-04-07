<script setup>
import { ref, nextTick, onMounted, getCurrentInstance } from "vue";

// 定义组件的可配置参数
const props = defineProps({
  diff: { type: String, default: "快速Diff" },
  itemCount: { type: Number, required: true },
  operation: { type: String, default: "push" },
  maxTests: { type: Number, default: 20 },
  moveRatio: { type: Number, default: 0.3 },
  heavyRatio: { type: Number, default: 0.3 },
});

const instance = getCurrentInstance();
const setStrategy = (strategy) => {
  if (instance && instance.proxy) {
    instance.proxy.__diffStrategy = strategy
  }
}
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

// 生成具有指定重型节点比例的列表（重型节点含子元素）
function generateComplexityList() {
  const stored = sessionStorage.getItem(initKey);
  if (stored) {
    items.value = JSON.parse(stored);
  } else {
    const heavyCount = Math.floor(props.itemCount * props.heavyRatio);
    const arr = [];
    for (let i = 1; i <= props.itemCount; i++) {
      const id = `n${i}`;
      const isHeavy = i <= heavyCount;
      arr.push({
        id,
        name: isHeavy ? `Heavy ${id}` : `Light ${id}`,
        isHeavy,
        children: isHeavy
          ? Array(5).fill(0).map((_, idx) => ({ text: `sub ${idx}` }))
          : [],
      });
    }
    const shuffled = shuffleArray(arr);
    sessionStorage.setItem(initKey, JSON.stringify(shuffled));
    items.value = shuffled;
  }
}

// 根据规模和操作类型生成独立的存储键
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

// 初始化简单列表（用于非复杂度操作）
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

// 执行测试操作
const changeData = () => {
  updateStartTime = performance.now();
  let opName = "";
  if (props.operation === "push") opName = "尾部插入";
  else if (props.operation === "unshift") opName = "头部插入";
  else if (props.operation === "towchange") opName = "首尾交换";
  else if (props.operation === "delete") opName = "尾部删除";
  else if (props.operation === "randomMove") opName = `随机重排(${props.moveRatio})`;
  else if (props.operation === "testComplexity") opName = `测试复杂度(${props.heavyRatio})`;

  console.log(`${props.diff}-规模${props.itemCount}-${opName}-[${getCurrentCount() + 1}次]实验`);
  console.log(`更新开始时间`, updateStartTime);

  if (props.operation === "push") {
    items.value.push({ id: `n${items.value.length + 1}`, name: `新项` });
  } else if (props.operation === "unshift") {
    items.value.unshift({ id: `n${items.value.length + 1}`, name: `新项` });
  } else if (props.operation === "towchange") {
    [items.value[0], items.value[items.value.length - 1]] = [items.value[items.value.length - 1], items.value[0]];
  } else if (props.operation === "delete") {
    items.value.pop();
  } else if (props.operation === "randomMove" || props.operation === "testComplexity") {
    const newList = generateNewListByMoveRatio(items.value, props.moveRatio);
    items.value = newList;
  }

  

  nextTick(() => {
    const endTime = performance.now();
    const duration = endTime - updateStartTime;
    console.log(`更新完成时间: ${endTime}`);
    console.log(`更新耗时: ${duration}ms`);
    saveResult(duration);

    if (sessionStorage.getItem(testKey)) {
      const data = loadData();
      data.count += 1;
      if (data.count < props.maxTests) {
        saveData(data);
        // 重置列表到初始状态
        if (props.operation === "testComplexity") {
          generateComplexityList();
        } else {
          initArr();
        }
        if (buttonRef.value) buttonRef.value.click();
      } else {
        console.log("测试完成，所有耗时：", data.durations);
        const avg = data.durations.reduce((a, b) => a + b, 0) / props.maxTests;
        console.log("平均耗时：", avg);
        sessionStorage.removeItem(testKey);
      }
    }
  });
};

const getCurrentCount = () => loadData().count;
const saveResult = (duration) => {
  const data = loadData();
  data.durations.push(duration);
  saveData(data);
};
const loadData = () => {
  const stored = sessionStorage.getItem(testKey);
  return stored ? JSON.parse(stored) : { count: 0, durations: [] };
};
const saveData = (data) => {
  sessionStorage.setItem(testKey, JSON.stringify(data));
};
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
  setStrategy('fast')
  if (buttonRef.value) buttonRef.value.click();
});
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

<style scoped>
.read-the-docs { color: #888; }
</style>