import adb from '@devicefarmer/adbkit'
import { BrowserWindow, IpcMainEvent } from 'electron'
import { device } from '@/types/options'
const client = adb.createClient()
// 处理设备数据
async function fixDevice(device: device) {
  try {
    const d = client.getDevice(device.id)
    // 获取设备prop
    const properties = await d.getProperties()
    device.name = properties['ro.product.name']
    // 获取设备ip
    device.ip = await d.getDHCPIpAddress()
  } catch { }
  return device
}
// 获取设备列表
function listAdbDevices(webContents: BrowserWindow['webContents'] | IpcMainEvent['sender']) {
  client.listDevices().then((devices: device[]) => {
    return Promise.all(
      devices.map((device: device) => fixDevice(device))
    )
  }).then((devices: device[]) => {
    webContents && webContents.send('devices', devices)
  })
}
// 设备列表变动监听
function adbDevicesListener(webContents: BrowserWindow['webContents']) {
  if (!webContents) return
  client.trackDevices().then((tracker: any) => {
    // 添加
    tracker.on('add', (device: device) => {
      console.log('Device %s was plugged in', device.id)
      listAdbDevices(webContents)
    })
    // 移除
    tracker.on('remove', (device: device) => {
      console.log('Device %s was unplugged', device.id)
      listAdbDevices(webContents)
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
  function connect(ip: string, port: number = 5555) {
    client.connect(ip, port).then((err: any) => {
      sender.send('connected', !err)
    }).catch(() => {
      sender.send('connected', false)
    })
  }
  if (id) {
    // 有id 先根据id获取端口
    client.getDevice(id).tcpip().then((port: number) => {
      // 获取成功 根据ip port 进行连接
      ip && connect(ip, port)
    }).catch(() => {
      // 获取失败 尝试ip直接连接
      ip && connect(ip)
    })
  } else {
    ip && connect(ip)
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
  listAdbDevices,
  adbDevicesListener,
  adbConnect,
  adbDisconnect
}