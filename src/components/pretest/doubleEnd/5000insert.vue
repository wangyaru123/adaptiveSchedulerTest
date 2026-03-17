<template>
  <pretestCom :item-count="5000" operation="unshift"    diff="双端Diff"/>
</template>

<script setup>
import pretestCom from '../pretestCom.vue'
</script>