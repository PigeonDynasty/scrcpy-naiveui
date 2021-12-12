interface device {
  id: string
}
interface config {
  title: string, // 窗口标题
  source: string, // scrcpy路径
  record: boolean, // 镜像录屏
  noDisplay: boolean, // 录屏时打开镜像
  recordpath: string // 录屏文件路径
  bitRate: number, // 比特率
  maxSize: number, // 等比最大分辨率
  maxFps: number, // 最大帧率
  rotation: number,// 旋转角度
  other: string[] // 其他配置
  // 其他配置的参数
  // alwaysOnTop,// 窗口置顶
  // noControl,// 电脑控制 不允许控制
  // borderless,//有无边框
  // fullscreen,// 全屏显示
  // stayAwake,// 关闭锁屏
  // showTouches,// 显示点按位置
  // renderAll,// 渲染所有帧 会增加延迟
  // screenOff,// 打开镜像时关闭屏幕
}
export default interface options {
  config: config,
  devices: device[]
}