import './assets/main.css';
import 'primeicons/primeicons.css';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import router from './router';

import { createApp } from 'vue';
import App from './App.vue';
import { installMockApi } from './mockApi.js';

// The static deploy has no json-server, so answer /api/jobs in the browser instead
if (import.meta.env.PROD) installMockApi();

const app = createApp(App);

app.use(router);
app.use(Toast);

app.mount('#app');
