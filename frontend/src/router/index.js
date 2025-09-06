import Vue from 'vue';
import VueRouter from 'vue-router';
import HomeLanding from '../components/HomeLandpage.vue';
import Login from '../components/SignIn.vue';      // Login component import karo
import Simulator from '../components/Simulator.vue'; // Simulator component import karo
import Signup from '../components/SignUp.vue';      // Signup component (optional)

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeLanding,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
  },
  {
    path: '/simulator',
    name: 'Simulator',
    component: Simulator,
    meta: { requiresAuth: true },  // Simulator route ko protected set kar diya
  },
  // Any other protected or public routes yahan add kar sakte ho
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

// Navigation Guard for Authentication check
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const token = localStorage.getItem('token');

  if (requiresAuth && !token) {
    next('/login');  // agar login nahi hai to login page redirect karo
  } else {
    next();  // otherwise jao
  }
});

export default router;
