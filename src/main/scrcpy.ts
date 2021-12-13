import fs from 'fs'
import { IpcMainEvent } from 'electron'
import { spawn } from 'child_process'
import options from '@/common/options.interface'
const argTemplete: object = {
  title: '--window-title ${config.title}',
  record: '--record ${config.recordpath}',
  noDisplay: '--no-display',
  bitRate: '${config.bitRate!==8?--bit-rate "${config.bitRate}M":""}',
  maxSize: '--max-size ${config.maxSize}',
  maxFps: '--max-fps ${maxFps}',
  rotation: '--rotation ${config.rotation}',
  // 其他内容
  alwaysOnTop: '--always-on-top',// 窗口置顶
  noControl: '--no-control',// 电脑控制 不允许控制
  borderless: '--window-borderless',//有无边框
  fullscreen: '--fullscreen',// 全屏显示
  stayAwake: '--stay-awake',// 关闭锁屏
  showTouches: '--show-touches',// 显示点按位置
  renderAll: '--render-expired-frames',// 渲染所有帧 会增加延迟
  screenOff: '--turn-screen-off',// 打开镜像时关闭屏幕
}
export default ({ sender }: IpcMainEvent, opt: options) => {
  console.log('ipc open')
  const args: string[] = []
  const { config, devices } = opt
  let cmd = 'scrcpy'
  if (config.source) { // 如果配置了scrcpy路径
    if (!fs.existsSync(config.source)) {
      sender.send('error', { type: 'unknownScrcpyPathException' })
      return
    }
    cmd = config.source
  }
  // 默认参数
  args.push('--shortcut-mod=lctrl,rctrl -s')
  // 添加启动参数
  type arg = keyof typeof argTemplete
  function addArg(key: string) {
    if (argTemplete[key as arg]) {
      args.push(eval(argTemplete[key as arg]))
    }
  }
  Object.keys(config).forEach(key => {
    if (key === 'other') {
      config[key].forEach(str => {
        addArg(str)
      })
    } else {
      addArg(key)
    }
  })
  // 处理模板
  devices.forEach(({ id }) => {
    const command = spawn(cmd, [...args, `${id}`])
    let opened = false
    let exited = false
    command.stdout.on('data', (data) => {
      if (!opened) {
        sender.send('open', id)
        opened = true
      }
      console.log(`stdout: ${data}`)
    })
    command.on('error', (code) => {
      console.log(`child process close all stdio with code ${code}`)
      command.kill()
    })

    command.on('close', (code) => {
      console.log(`child process close all stdio with code ${code}`)
    })

    command.on('exit', (code) => {
      console.log(`child process exited with code ${code}`)
      if (!exited) {
        sender.send('close', { success: code === 0, id })
        command.kill()
        exited = true
      }
    })
  })
}