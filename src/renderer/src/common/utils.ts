// 文件选择
export function fileSelect(isDir: boolean = false, isMulti: boolean = false) {
  return new Promise<string[] | string>(resolve => {
    const args = [isDir ? 'openDirectory' : 'openFile'] // 打开目录还是文件
    if (isMulti) args.push('multiSelections') // 是否多选
    window.ipcRenderer.send('file-select', args)
    window.ipcRenderer.on('file-selected', (event: any, paths: string[]) => {
      resolve(isMulti ? paths : paths[0] as string)
    })
  })
}