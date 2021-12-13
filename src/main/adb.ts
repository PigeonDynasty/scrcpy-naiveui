import adb from 'adbkit'
import { BrowserWindow, IpcMainEvent } from 'electron'
import { device } from '@/common/options.interface'
const client = adb.createClient()
// 设备列表变动监听
function adbDevicesListener(webContents: BrowserWindow['webContents'] | undefined) {
  if (!webContents) return
  // 获取设备列表
  function listDevices() {
    client.listDevices().then((devices: device[]) => {
      webContents && webContents.send('devices', devices)
    })
  }
  client.trackDevices().then((tracker: any) => {
    // 添加
    tracker.on('add', (device: device) => {
      console.log('Device %s was plugged in', device.id)
      listDevices()
    })
    // 移除
    tracker.on('remove', (device: device) => {
      console.log('Device %s was unplugged', device.id)
      listDevices()
    })
    // 结束
    tracker.on('end', () => {
      console.log('Tracking stopped')
    })
  }).catch((err: any) => {
    console.error('Something went wrong:', err.stack)
  })
}
// 连接设备
function adbConnect({ sender }: IpcMainEvent, device: device) {
  const { id, ip } = device
  // 连接的方法 没设置端口号默认是5555
  function connect(ip: string, port: string = '5555') {
    client.connect(ip, port).then((err: any) => {
      sender.send('connected', !err)
    }).catch(() => {
      sender.send('connected', false)
    })
  }
  if (id) {
    // 有id 先根据id获取端口
    client.tcpip(id).then((port: string) => {
      // 获取成功 根据ip port 进行连接
      connect(ip, port)
    }).catch(() => {
      // 获取失败 尝试ip直接连接
      connect(ip)
    })
  } else {
    connect(ip)
  }
}
// 断开连接
function adbDisconnect({ sender }: IpcMainEvent, ip: string) {
  client.disconnect(ip).then((id: string) => {
    sender.send('disconnected', true)
  }).catch(() => {
    sender.send('disconnected', false)
  })
}
export {
  adbDevicesListener,
  adbConnect,
  adbDisconnect
}