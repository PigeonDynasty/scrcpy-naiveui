import { App, inject, watch } from 'vue'
const storeName: string = 'scrcpy-naiveui'
const local = () => {
  return {
    get() {
      return JSON.parse(localStorage.getItem(storeName) || '{}')
    },
    set(val: object) {
      localStorage.setItem(storeName, JSON.stringify(val || {}))
      return this.get()
    }
  }
}
interface IStore {
  state: any
  dispatch?: any
}
class Store {
  state: any
  private _dispatch: any
  constructor({ state, dispatch }: IStore) {
    this.state = state
    this._dispatch = dispatch
    this.state &&
      Object.keys(state).forEach(key => {
        this.state[key] = local().get()[key] || state[key] // 初始化数据
        watch(
          () => this.state[key],
          n => {
            // 数据变动的时候往localStorage里存
            const data = local().get()
            data[key] = n
            local().set(data)
          },
          {
            deep: true
          }
        )
      })
  }
  get(key: string): any {
    return JSON.parse(JSON.stringify(this.state[key])) // 去除绑定
  }
  set(key: string, val: any): void {
    this.state[key] = val
  }
  dispatch(key: string, ...args: any[]): Promise<any> {
    try {
      if (this._dispatch[key]) {
        return this._dispatch[key](...args)
      }
    } catch {}
    return Promise.reject(new Error(`${key} is not a function`))
  }
  install(app: App) {
    app.provide('store', this)
    app.config.globalProperties.$store = this
  }
}
function createStore(opt: IStore): Store {
  return new Store(opt)
}

function useStore<T>(): T | any {
  return inject('store')
}

export { createStore, useStore, Store }
