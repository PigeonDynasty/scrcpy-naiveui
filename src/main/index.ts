import os from 'os'
import { join } from 'path'
import { app, BrowserWindow, session, ipcMain, dialog, nativeTheme, NativeTheme } from 'electron'
import { adbDevicesListener, adbConnect, adbDisconnect } from './adb'
import scrcpy from './scrcpy'
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
    show: false,
    webPreferences: {
      nodeIntegration: true,
      preload: join(__dirname, '../preload/index.cjs'),
    },
  })

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
      devpath += '/ljjemllljcmogpfapbkkighbhhppjdbg/6.0.0.20_0';
      console.log(join(os.homedir(), devpath))
      await session.defaultSession.loadExtension(join(os.homedir(), devpath));
    } catch (e) {
      console.error('Vue Devtools failed to install:', e);
    }
    const url = `http://127.0.0.1:${process.env['PORT']}`
    win.loadURL(url)
    win.maximize()
    win.webContents.openDevTools()

  }
  win.on('ready-to-show', () => {
    // 赋值初始系统主题
    win.webContents.send('theme-updated', nativeTheme.shouldUseDarkColors)
    win?.show()
  })
  win.webContents.on('did-finish-load', () => {
    ipcMain.on('open', scrcpy)
    adbDevicesListener(win.webContents)
    ipcMain.on('connect', adbConnect)
    ipcMain.on('disconnect', adbDisconnect)
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
    // 监听系统主题变化
    nativeTheme.on('updated', ({ sender }: any) => {
      win.webContents.send('theme-updated', sender.shouldUseDarkColors)
    })
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
