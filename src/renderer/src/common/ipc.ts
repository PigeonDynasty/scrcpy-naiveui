import { device } from '@/types/options'
import store from '../common/store'
function addIpc(): void {
  // 监听设备列表
  window.ipcRenderer.on('device-listed', (event: any, devices: device[]) => {
    store.dispatch('updateDevices', devices)
  })
  // 单个设备状态变化
  window.ipcRenderer.on('device-updated', (event: any, device: device) => {
    store.dispatch('updateDevice', device)
  })
}
function removeIpc(): void {
  window.ipcRenderer.removeAllListeners('device-listed')
  window.ipcRenderer.removeAllListeners('device-updated')
}
export {
  addIpc,
  removeIpc
}