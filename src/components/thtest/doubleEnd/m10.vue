<template>
  <thtestCom :item-count="200" operation="randomMove" :moveRatio="1.0" diff="双端Diff" />
</template>

<script setup>
import thtestCom from '../thtestCom.vue'
</script>