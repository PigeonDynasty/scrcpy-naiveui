<script setup lang="ts">
import { h, computed } from 'vue'
import { NTag, NInput, NButton, NDataTable, NEmpty, useMessage, NSpace, NPopover, NInputGroup, NTooltip } from 'naive-ui'
import type { TableColumns } from 'naive-ui/lib/data-table/src/interface'
import { useStore } from '../plugins/store'
import { device, config } from '@/types/options'
const message = useMessage() // 注册message方法
const store = useStore()
// 配置文件
const mirrorConfig = computed<config>(() => store.get('config'))
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
    width: 92,
    render(rowData) {
      const row = rowData as device
      const isWireless = isIP(row.id)
      return h(NSpace, { vertical: true },
        {
          default: () => [
            isWireless ?
              // 无线连接的 device代表状态是已连接
              (row.type === 'device' || row.type === 'offline' ? h(
                NButton,
                {
                  size: 'small',
                  type: row.type === 'device' ? 'error' : 'primary',
                  onClick: () => {
                    if (row.type === 'device') {
                      // 向主线程发起断开连接请求
                      window.ipcRenderer.send('device-disconnect', row.id)
                    } else {
                      // 连接
                      window.ipcRenderer.send('device-connect', { ip: row.id })
                    }
                  }
                }, { default: () => row.type === 'device' ? '断开连接' : '连接设备' }
              ) : null)
              :
              (!hasWireless(row.ip) ? h(
                NPopover,
                {
                  style: { display: hasWireless(row.ip) ? 'none' : '' },
                  trigger: 'click'
                },
                {
                  trigger: () => h(NButton, { size: 'small', type: 'primary' }, { default: () => '无线连接' }),
                  default: () => h(NInputGroup, {}, {
                    default: () => [
                      h(NInput, { placeholder: '请输入IP', value: row._ip, 'onUpdate:value': (val: string) => row._ip = val }, {}),
                      h(NButton, {
                        type: 'info', secondary: true,
                        onClick: () => {
                          if (!row._ip || !isIP(row._ip)) {
                            message.warning('请检查ip地址')
                            return
                          } else if (hasWireless(row._ip)) {
                            message.warning('当前ip地址已存在')
                            return
                          }
                          row.ip = row._ip
                          window.ipcRenderer.send('device-connect', { id: row.id, ip: row.ip })
                        }
                      }, { default: () => '连接' })
                    ]
                  })
                }
              ) : null),
            // 打开镜像
            row.type === 'device' ? h(
              NTooltip, {},
              {
                trigger: () => h(NButton,
                  {
                    size: 'small',
                    type: 'info',
                    onClick: () => {
                      window.ipcRenderer.send('scrcpy-open', { config: JSON.parse(JSON.stringify(mirrorConfig.value)), id: row.id })
                    }
                  },
                  { default: () => '打开镜像' }),
                default: () => '单个设备可以同时打开多个镜像窗口'
              }
            ) : null
            // end 打开镜像
          ]
        }
      )
    }
  }
]
// 判断是否ip地址
function isIP(str: string): boolean {
  return (/^(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])(:([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5]))?$/).test(str)
}
// 检查是否已经有对应无线连接的对象存在
function hasWireless(ipAddress: string | undefined): boolean {
  if (!ipAddress || !isIP(ipAddress)) return false
  const ip = ipAddress.split(':')[0]
  return data.value.some(device => {
    if (!isIP(device.id)) return false
    const dIp = device.id.split(':')[0]
    return dIp === ip
  })
}
// 初始化设备数据
loading.value = true
window.ipcRenderer.send('device-list')
</script>
<template>
  <NDataTable
    :columns="columns"
    :data="data"
    :row-key="row => row.id"
    :loading="loading"
    size="small"
  >
    <template #empty>
      <NEmpty description="暂无设备连接" />
    </template>
  </NDataTable>
</template>