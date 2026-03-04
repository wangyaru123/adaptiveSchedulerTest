import { createRouter, createWebHistory } from 'vue-router'
import Shuffle from '../components/Shuffle.vue'
import Shuffle2 from '../components/Shuffle2.vue'

const routes = [
  {
    path: '/',
    redirect: '/shuffle'
  },
  {
    path: '/shuffle',
    name: 'Shuffle',
    component: Shuffle
  },
  {
    path: '/shuffle2',
    name: 'Shuffle2',
    component: Shuffle2
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router