import type { InternalRowData } from 'naive-ui/lib/data-table/src/interface'
declare interface device extends InternalRowData {
  id: string,
  type: string,
  ip?: string,
  name?: string,
  method?: string
}
declare interface other {
  alwaysOnTop: boolean,// 窗口置顶
  noControl: boolean,// 电脑控制 不允许控制
  borderless: boolean,//有无边框 无边框
  fullscreen: boolean,// 全屏显示
  stayAwake: boolean,// 关闭锁屏
  showTouches: boolean,// 显示点按位置
  renderAll: boolean,// 渲染所有帧 会增加延迟
  screenOff: boolean// 打开镜像时关闭屏幕
}
declare interface config {
  title: string, // 窗口标题
  source: string, // scrcpy路径
  record: boolean, // 镜像录屏
  noDisplay: boolean, // 录屏时打开镜像
  recordpath: string // 录屏文件路径
  bitRate: number, // 比特率
  maxSize: number, // 等比最大分辨率
  maxFps: number, // 最大帧率
  rotation: number,// 旋转角度
  other: (keyof other)[] // 其他配置
}
export default interface options {
  config: config,
  id: device['id']
}
export {
  device,
  config
}