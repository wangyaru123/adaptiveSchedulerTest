<template>
  <pretestCom :item-count="5000" operation="unshift" diff="朴素Diff"/>
</template>

<script setup>
import pretestCom from '../pretestCom.vue'
</script>