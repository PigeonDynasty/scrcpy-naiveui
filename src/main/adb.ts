import adb from '@devicefarmer/adbkit'
import { BrowserWindow, IpcMainEvent } from 'electron'
import { device } from '@/types/options'
const client = adb.createClient()
// 处理设备数据
async function getAdbDeviceInfo(device: device) {
  try {
    const d = client.getDevice(device.id)
    // 获取设备prop
    const properties = await d.getProperties()
    device.name = properties['ro.product.name']
    // 获取设备ip
    device.ip = await d.getDHCPIpAddress()
    return device
  } catch {
    return device
  }
}
// 获取设备列表
function listAdbDevices({ sender }: IpcMainEvent) {
  client.listDevices().then((devices: device[]) => {
    return Promise.all(
      devices.map((device: device) => getAdbDeviceInfo(device))
    )
  }).then((devices: device[]) => {
    sender && !sender.isDestroyed() && sender.send('device-listed', devices)
  })
}
// 设备列表变动监听
function adbDevicesListener(webContents: BrowserWindow['webContents']) {
  if (!webContents) return
  client.trackDevices().then((tracker: any) => {
    // 全部修改操作
    tracker.on('change', async (device: device) => {
      console.log('Device %s was changed to %s', device.id, device.type)
      const d: device = await getAdbDeviceInfo(device)
      !webContents.isDestroyed() && webContents.send('device-updated', d)
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
  console.log(device)
  const { id, ip } = device
  const ipPort: number = Number(ip?.split(':')[1])
  // 连接的方法 没设置端口号默认是5555
  function connect(port = 5555) {
    if (!ip) return
    client.connect(ip, port).then((err: any) => {
      !sender.isDestroyed() && sender.send('device-connected', !err)
    }).catch(() => {
      !sender.isDestroyed() && sender.send('device-connected', false)
    })
  }
  if (id) {
    // 有id 先根据id获取端口
    client.getDevice(id).tcpip(ipPort || 5555).then((port: number) => {
      console.log(port)
      // 获取成功 根据ip port 进行连接
      connect(port)
    }).catch(() => {
      // 获取失败 尝试ip直接连接
      connect()
    })
  } else {
    connect()
  }
}
// 断开连接
function adbDisconnect({ sender }: IpcMainEvent, ip: string) {
  client.disconnect(ip).then((id: string) => {
    !sender.isDestroyed() && sender.send('device-disconnected', true)
  }).catch(() => {
    !sender.isDestroyed() && sender.send('device-disconnected', false)
  })
}
export {
  getAdbDeviceInfo,
  listAdbDevices,
  adbDevicesListener,
  adbConnect,
  adbDisconnect
}