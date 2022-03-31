// 处理shell问题
import { spawn } from 'child_process'
import stripAnsi from 'strip-ansi'
// 获取默认shell
function detectDefaultShell() {
  const { env } = process
  if (process.platform === 'win32') {
    return env.COMSPEC || 'cmd.exe'
  }
  if (process.platform === 'darwin') {
    return env.SHELL || '/bin/zsh'
  }
  return env.SHELL || '/bin/sh'
}
// 处理环境
function parseEnv(env: string) {
  const returnValue: any = {}
  for (const line of stripAnsi(env)
    .split('\n')
    .filter(line => Boolean(line))) {
    const [key, ...values] = line.split('=')
    returnValue[key] = values.join('=')
  }
  return returnValue
}
// shell 环境
function shellEnv(): any {
  return new Promise(resolve => {
    if (process.platform === 'win32') {
      resolve(process.env)
    }
    try {
      const defaultShell = detectDefaultShell()
      const args = ['-ilc', 'env']
      const env = {
        // Disables Oh My Zsh auto-update thing that can block the process.
        DISABLE_AUTO_UPDATE: 'true'
      }
      const { stdout } = spawn(defaultShell, args, { env })
      stdout.on('data', data => {
        String(data) && resolve(parseEnv(String(data)))
      })
    } catch (error) {
      resolve(process.env)
    }
  })
}
// 返回shell path
export default function getShellPath() {
  if (process.platform === 'win32') {
    return
  }
  return shellEnv().then(({ PATH }: any) => {
    return (
      PATH ||
      [
        './node_modules/.bin',
        '/.nodebrew/current/bin',
        '/usr/local/bin',
        '/opt/homebrew/bin',
        process.env.PATH
      ].join(':')
    )
  })
}
