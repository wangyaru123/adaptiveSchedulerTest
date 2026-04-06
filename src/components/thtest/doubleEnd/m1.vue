<template>
  <thtestCom :item-count="200" operation="randomMove" :moveRatio="0.1" diff="双端Diff" />
</template>

<script setup>
import thtestCom from '../thtestCom.vue'
</script>