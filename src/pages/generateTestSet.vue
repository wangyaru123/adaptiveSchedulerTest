<template>
  <div>
    <button type="button" @click="createDataset">创建数据集 (2000条)</button>
    <button type="button" @click="createDataset500">创建数据集 (5000条)</button>
  </div>
</template>

<script setup>
import { downloadTestSet } from './generateTestSet.js';

const createDataset = () => {
  downloadTestSet(2000, 'test_set_2000.csv');
};

const createDataset500 = () => {
  downloadTestSet(5000, 'test_set_5000.csv');
};
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>