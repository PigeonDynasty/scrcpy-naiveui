import { createApp } from 'vue'
import App from './App.vue'
import store from './common/store'
import { addIpc } from './common/ipc'
createApp(App)
  .use(store)
  .mount('#app')
  .$nextTick(window.removeLoading)

addIpc()
console.log('fs', window.fs)
console.log('ipcRenderer', window.ipcRenderer)
