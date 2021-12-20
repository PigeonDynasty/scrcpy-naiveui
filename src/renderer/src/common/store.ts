import { reactive, ref } from 'vue'
import { createSotore } from '../plugins/store'
import { device, config } from '@/types/options'
const devices: device[] = []
const devicesLoading: boolean = false
const config: config = {
  title: '', // 窗口标题
  source: '', // scrcpy路径
  record: false, // 镜像录屏
  noDisplay: false, // 录屏时打开镜像
  recordpath: '', // 录屏文件路径
  bitRate: 8, // 比特率
  maxSize: 0, // 等比最大分辨率
  maxFps: 0, // 最大帧率
  rotation: 0,// 旋转角度
  other: [] // 其他配置
}
// 状态存储
const state = reactive({
  devices,
  devicesLoading,
  config
})
// 异步方法
const dispatch = {
  // 更新所有设备数据
  updateDevices(devices: device[]) {
    state.devicesLoading = true
    devices.forEach(device => {
      dispatch.updateDevice(device)
    })
    state.devicesLoading = false
  },
  // 更新单个设备数据
  updateDevice(device: device) {
    state.devicesLoading = true
    const obj = state.devices.find(item => item.id === device.id)
    if (!obj) { // 不存在
      state.devices.push(device)
    } else { // 存在 遍历键 赋值
      Object.keys(device).forEach(key => {
        obj[key] = device[key]
      })
    }
    state.devicesLoading = false
  }
}
export default createSotore({
  state,
  dispatch
})