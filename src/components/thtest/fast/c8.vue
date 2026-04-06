<template>
  <thtestCom :item-count="200" :heavyRatio="0.8" operation="testComplexity" :moveRatio="0.4" diff="快速Diff" />
</template>

<script setup>
import thtestCom from '../thtestCom.vue'
</script>