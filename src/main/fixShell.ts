// 处理shell问题
// import process from 'node:process'
import execa from 'execa'
import stripAnsi from 'strip-ansi'
// 获取默认shell
function detectDefaultShell() {
  const { env } = process
  if (process.platform === 'win32') {
    return env.COMSPEC || 'cmd.exe';
  }
  if (process.platform === 'darwin') {
    return env.SHELL || '/bin/zsh';
  }

  return env.SHELL || '/bin/sh';
}
// 处理环境
function parseEnv(env: any) {
  env = env.split('_SHELL_ENV_DELIMITER_')[1]
  const returnValue: any = {}
  for (const line of stripAnsi(env).split('\n').filter(line => Boolean(line))) {
    const [key, ...values] = line.split('=')
    returnValue[key] = values.join('=')
  }
  return returnValue
}
// shell 环境
async function shellEnv() {
  if (process.platform === 'win32') {
    return process.env
  }

  try {
    const defaultShell = detectDefaultShell()
    const args = [
      '-ilc',
      'echo -n "_SHELL_ENV_DELIMITER_"; env; echo -n "_SHELL_ENV_DELIMITER_"; exit',
    ]
    const env = {
      // Disables Oh My Zsh auto-update thing that can block the process.
      DISABLE_AUTO_UPDATE: 'true',
    }
    const { stdout } = await execa(defaultShell, args, { env })
    return parseEnv(stdout)
  } catch (error) {
    return process.env
  }
}

async function fixShell() {
  if (process.platform === 'win32') {
    return
  }
  const { PATH } = await shellEnv()
  process.env.PATH = PATH || [
    './node_modules/.bin',
    '/.nodebrew/current/bin',
    '/usr/local/bin',
    process.env.PATH,
  ].join(':')
}
fixShell()