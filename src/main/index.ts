import os from 'os'
import fs from 'fs'
import { join } from 'path'
import { app, BrowserWindow, session, ipcMain, dialog } from 'electron'
import { listAdbDevices, addAdbDevicesListener, removeAdbDevicesListener, adbConnect, adbDisconnect } from './adb'
import scrcpy from './scrcpy'
import { functions } from 'electron-log'
Object.assign(console, functions)
// https://stackoverflow.com/questions/42524606/how-to-get-windows-version-using-node-js
const isWin7 = os.release().startsWith('6.1')
if (isWin7) app.disableHardwareAcceleration()

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow

async function bootstrap() {
  win = new BrowserWindow({
    height: 600,
    width: 356,
    center: true,
    maximizable: false,
    fullscreenable: false,
    // show: false,
    webPreferences: {
      nodeIntegration: true,
      preload: join(__dirname, '../preload/index.cjs'),
    },
  })
  win.removeMenu() // 移除顶部菜单
  if (app.isPackaged) {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  } else {
    //install vue devtool
    try {
      console.log(process.platform)
      let devpath: string = ''
      switch (process.platform) {
        case 'darwin': // mac
          devpath = '/Library/Application Support/Google/Chrome/Default/Extensions'
          break
        case 'win32': // windows
          devpath = '/AppData/Local/Google/Chrome/User Data/Default/Extensions'
          break
        case 'linux':
          devpath = '/.config/google-chrome/Default/Extensions'
          break
      }
      devpath += '/ljjemllljcmogpfapbkkighbhhppjdbg/' // 还需要取版本号文件夹 6.0.0.20_1
      const devToolPath = join(os.homedir(), devpath)
      const dirlist = fs.readdirSync(devToolPath) // 定位插件位置
      let versionPath = ''
      // for 方便跳出循环 查找版本号文件夹
      for (let i = 0; i < dirlist.length; i++) {
        const new_path = join(devToolPath, dirlist[i])
        const stat = fs.statSync(new_path) //要检查是否为文件夹，需获取stat对象
        if (stat && stat.isDirectory()) {
          versionPath = new_path
          break
        }
      }
      await session.defaultSession.loadExtension(versionPath)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e)
    }
    const url = `http://127.0.0.1:${process.env['PORT']}`
    win.loadURL(url)
    win.maximize()
    win.webContents.openDevTools()

  }
  // 窗口准备好打开
  win.on('ready-to-show', () => {
    // win?.show()
  })
  // 页面加载完成
  win.webContents.on('did-finish-load', () => {
    // 主线程与渲染线程通信
    addAdbDevicesListener(win.webContents) // 监听设备列表变化
    ipcMain.on('scrcpy-open', scrcpy)
    ipcMain.on('device-connect', adbConnect)
    ipcMain.on('device-disconnect', adbDisconnect)
    ipcMain.on('device-list', listAdbDevices)
    // 选择文件
    ipcMain.on('file-select', ({ sender }, args) => {
      dialog.showOpenDialog(
        win, {
        properties: args
      }
      ).then(({ canceled, filePaths }) => {
        if (!canceled) {
          sender.send('file-selected', filePaths)
        }
      })
    })
    // end 通信部分
  })
  // 页面关闭 移除通信监听
  win.on('close', () => {
    removeAdbDevicesListener()
    ipcMain.removeAllListeners('scrcpy-open')
    ipcMain.removeAllListeners('device-connect')
    ipcMain.removeAllListeners('device-disconnect')
    ipcMain.removeAllListeners('device-list')
    ipcMain.removeAllListeners('file-select')
  })
}

app.whenReady().then(bootstrap)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('second-instance', () => {
  if (win) {
    // someone tried to run a second instance, we should focus our window.
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})
app.on('activate', (event: Event, hasVisibleWindows: boolean) => {
  // macos dock点击判断 没有窗口则新建
  if (!hasVisibleWindows) {
    bootstrap()
  }
})
// @TODO
// auto update
/* if (app.isPackaged) {
  app.whenReady()
    .then(() => import('electron-updater'))
    .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
    .catch((e) =>
      // maybe you need to record some log files.
      console.error('Failed check update:', e)
    )
} */
