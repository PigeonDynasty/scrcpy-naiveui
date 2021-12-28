// 文件选择
export function fileSelect(
  isDir: boolean = false,
  isMulti: boolean = false
): Promise<string[] | string> {
  return new Promise<string[] | string>(resolve => {
    const args = [isDir ? 'openDirectory' : 'openFile'] // 打开目录还是文件
    if (isMulti) args.push('multiSelections') // 是否多选
    window.ipcRenderer.send('file-select', args)
    window.ipcRenderer.once('file-selected', (event: any, paths: string[]) => {
      if (paths.length === 0) return
      resolve(isMulti ? paths : paths[0])
    })
  })
}
