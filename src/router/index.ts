import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router';
import store from '@/store';

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/home/Index.vue'),
  },
  {
    path: '/households',
    name: 'Households',
    component: () => import('../views/households/HouseholdLanding.vue')
  },
  {
    path: '/households/:id',
    name: 'Household Detail',
    component: () => import('../views/households/HouseholdDetail.vue'),
  },
  {
    path: '/approve-billing',
    name: 'Approvals',
    component: () => import('../views/approvals/ApprovalLanding.vue')
  },
  {
    path: '/review-billing',
    name: 'Review',
    component: () => import('../views/review/ReviewLanding.vue')
  },
  {
    path: '/upload-billing',
    name: 'Upload',
    component: () => import('../views/upload/UploadBilling.vue')
  },
  {
    path: '/payment-accounts',
    name: 'Payment',
    component: () => import('../views/payment/PaymentAccounts.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

router.beforeEach((to, from, next) => {
  store.dispatch("loadSettings").then(() => {
    store.dispatch("loadEntitlements").then(() => {
      store.dispatch("checkSession").then(() => {
        store.dispatch("loadUserPreferences");
        next();
      });
    });
  });

  return;
});