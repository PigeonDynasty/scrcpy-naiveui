<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { NTag, NInput, NButton, NDataTable, NEmpty, useMessage, NSpace, NPopover, NInputGroup } from 'naive-ui'
import type { TableColumns } from 'naive-ui/lib/data-table/src/interface'
import { useStore } from '../plugins/store'
import { device } from '@/types/options'
const message = useMessage() // 注册message方法
const store = useStore()
// 表格加载动画
const loading = computed<boolean>({
  get() {
    return store.get('devicesLoading')
  },
  set(val) {
    store.set('devicesLoading', val)
  }
})
// 数据表格的数据
const data = computed<device[]>({
  get() {
    return store.get('devices') || []
  },
  set(val) {
    store.set('devices', val)
  }
})
// 数据表格渲染格式
const columns: TableColumns = [
  {
    title: 'ID',
    key: 'id',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '名称',
    key: 'name',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '状态',
    key: 'type',
    render(row) {
      return h(
        NTag,
        {
          type: row.type === 'device' ? 'success' : (row.type === 'offline' ? 'error' : 'info')
        },
        {
          default: () => row.type
        }
      )
    }
  },
  {
    title: '操作',
    key: 'operation',
    render(row: device) {
      const isWireless = isIP(row.id)
      return h(NSpace, {},
        {
          default: () => [
            isWireless ? h(
              NButton,
              {
                size: 'small',
                strong: true,
                type: 'error',
                onClick: () => {
                  // 向主线程发起断开连接请求
                  window.ipcRenderer.send('device-disconnect', row.id)
                }
              }, { default: () => '断开连接' }
            ) : h(
              NPopover,
              {
                trigger: 'click'
              },
              {
                trigger: () => h(NButton, { size: 'small', strong: true, type: 'primary' }, { default: () => '打开无线连接' }),
                default: () => h(NInputGroup, {}, {
                  default: () => [
                    h(NInput, { placeholder: '请输入IP', value: row.ip, 'onUpdate:value': (val: string) => row.ip = val }, {}),
                    h(NButton, {
                      type: 'primary', ghost: true,
                      onClick: () => {
                        if (!row.ip || !isIP(row.ip)) {
                          message.warning('请检查ip地址')
                          return
                        }
                        window.ipcRenderer.send('device-connect', { id: row.id, ip: row.ip })
                      }
                    }, { default: () => '连接' })
                  ]
                })
              }
            ),
            // 打开镜像
            h(
              NButton,
              {
                size: 'small',
                strong: true,
                type: 'info',
                onClick: () => {
                  window.ipcRenderer.send('scrcpy-open', { config: {}, id: row.id })
                }
              },
              {
                default: () => '打开镜像'
              }
            )
            // end 打开镜像
          ]
        }
      )

    }
  }
]
// 判断是否ip地址
function isIP(str: any): str is string {
  return (/^(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])(:([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5]))?$/).test(str)
}
// 初始化设备数据
loading.value = true
window.ipcRenderer.send('device-list')
</script>
<template>
  <NDataTable :columns="columns" :data="data" :row-key="row => row.id" :loading="loading">
    <template #empty>
      <NEmpty description="暂无设备连接" />
    </template>
  </NDataTable>
</template>