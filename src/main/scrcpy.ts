import fs from 'fs'
import { IpcMainEvent } from 'electron'
import { spawn } from 'child_process'
import options from '@/types/options'
import './fixShell'
const argTemplete: object = {
  title: {
    key: '--window-title',
    configKey: 'title'
  },
  record: {
    key: '--record',
    configKey: 'recordpath'
  },
  noDisplay: '--no-display',
  bitRate: {
    key: '--bit-rate',
    configKey: 'bitRate',
    suffix: 'M'
  },
  maxSize: {
    key: '--max-size',
    configKey: 'maxSize'
  },
  maxFps: {
    key: '--max-fps',
    configKey: 'maxFps'
  },
  rotation: {
    key: '--rotation',
    configKey: 'rotation'
  },
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
const openedIds: string[] = []
export default ({ sender }: IpcMainEvent, opt: options) => {
  console.log('ipc open')
  const args: string[] = []
  const { config, id } = opt
  let cmd = 'scrcpy'
  if (config.source) { // 如果配置了scrcpy路径
    if (!fs.existsSync(config.source)) {
      !sender.isDestroyed() && sender.send('scrcpy-error', { type: 'unknownScrcpyPathException' })
      return
    }
    cmd = config.source
  }
  // 默认参数
  args.push('--shortcut-mod=lctrl,rctrl')
  // 添加启动参数
  type arg = keyof typeof argTemplete
  function addArg(key: string) {
    const arg = argTemplete[key as arg]
    if (arg) {
      if (arg['key']) {
        args.push(arg['key'])
        args.push(String(config[arg['configKey']]) + arg['suffix'] || '')
      } else {
        args.push(arg)
      }
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
  // devices.forEach(({ id }) => {
  const command = spawn(cmd, [...args, '-s', `${id}`])
  let opened = false
  let exited = false
  command.stdout.on('data', (data) => {
    if (!opened) {
      !sender.isDestroyed() && sender.send('scrcpy-opened', id)
      opened = true
    }
    console.log(`stdout: ${data} ${id}`)
  })
  command.on('error', (code) => {
    console.log(`child process close all stdio with code ${code} ${id}`)
    command.kill()
  })

  command.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`)
  })

  command.on('exit', (code) => {
    console.log(`child process exited with code ${code} ${id}`)
    if (!exited) {
      !sender.isDestroyed() && sender.send('scrcpy-closeed', id)
      command.kill()
      exited = true
    }
  })
  // })
}