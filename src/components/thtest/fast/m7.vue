<template>
  <thtestCom :item-count="200" operation="randomMove" :moveRatio="0.7" diff="快速Diff" />
</template>

<script setup>
import thtestCom from '../thtestCom.vue'
</script>