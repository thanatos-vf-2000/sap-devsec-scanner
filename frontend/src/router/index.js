import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import UI5 from '@/views/UI5.vue'
import NotFound from '@/views/404.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: App
  },
  {
    path: '/ui5/:version',
    name: 'UI5',
    component: UI5
  },
  {
    path: '/ui5',
    redirect: '/ui5/latest'
  },
  {
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: NotFound
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router