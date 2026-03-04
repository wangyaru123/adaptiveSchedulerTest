<template>
  <div>
    <button @click="runExperiment">Start Pre-Experiment</button>
    <div v-if="results.length">
      <h3>Test Results:</h3>
      <pre>{{ formattedResults }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, getCurrentInstance, computed } from 'vue'

// Test scenario configuration
const sizes = [50, 200, 1000, 5000]
const modes = [
  { name: 'append-tail', fn: (oldList) => [...oldList, ...generateItems(5)] },
  { name: 'insert-head', fn: (oldList) => [...generateItems(5), ...oldList] },
  { name: 'shuffle', fn: (oldList) => shuffleArray([...oldList]) },
  { name: 'swap', fn: (oldList) => swapItems([...oldList]) }
]
const strategies = ['simple', 'doubleEnd', 'fast']

// Data generation helpers
const generateItems = (count, prefix = 'n') => 
  Array.from({ length: count }, (_, i) => ({ id: `${prefix}${i}`, name: `${prefix}${i}` }))

const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const swapItems = (arr) => {
  if (arr.length < 2) return arr
  const idx1 = Math.floor(arr.length / 3)
  const idx2 = Math.floor(arr.length * 2 / 3)
  ;[arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]]
  return arr
}

// Reactive data
const items = ref([])
const results = ref([])
const instance = getCurrentInstance()

// Set strategy flag
const setStrategy = (strategy) => {
  if (instance && instance.proxy) {
    instance.proxy.__diffStrategy = strategy
  }
}

// Run single test case
const runTestCase = async (size, modeName, modeFn, strategy) => {
  setStrategy(strategy)
  
  // Initialize list
  items.value = generateItems(size)
  await nextTick() // wait for initial render

  const start = performance.now()
  items.value = modeFn(items.value)
  await nextTick() // wait for update
  const end = performance.now()

  return end - start
}

// Run all tests
const runExperiment = async () => {
  results.value = []
  for (const size of sizes) {
    for (const mode of modes) {
      for (const strategy of strategies) {
        let total = 0
        const times = []
        for (let run = 0; run < 10; run++) {
          const time = await runTestCase(size, mode.name, mode.fn, strategy)
          times.push(time)
          total += time
        }
        const avg = total / 10
        results.value.push({
          size,
          mode: mode.name,
          strategy,
          avgTime: avg.toFixed(3),
          rawData: times.map(t => t.toFixed(3)).join(', ')
        })
        console.log(`Completed: size=${size}, mode=${mode.name}, strategy=${strategy}, avg=${avg.toFixed(3)}ms`)
      }
    }
  }
}

// Format results for display
const formattedResults = computed(() => {
  const header = 'Size\tMode\t\tStrategy\tAvg(ms)'
  const rows = results.value.map(r => 
    `${r.size}\t${r.mode}\t${r.strategy}\t${r.avgTime}`
  )
  return [header, ...rows].join('\n')
})
</script>