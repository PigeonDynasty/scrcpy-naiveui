<script setup lang="ts">
import { h, ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { NTag, NInput, NButton, NDataTable, NEmpty, useMessage, NSpace } from 'naive-ui'
import type { TableColumns } from 'naive-ui/lib/data-table/src/interface'
import { device } from '@/types/options'
const message = useMessage() // 注册message方法
const loading = ref(true)
// 数据表格渲染格式
const columns: TableColumns = [
  {
    title: 'ID',
    key: 'id'
  },
  {
    title: '名称',
    key: 'name'
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
  // {
  //   title: 'IP',
  //   key: 'ip',
  //   render(row) {
  //     return h(
  //       NInput,
  //       {
  //         props: {
  //           value: row.ip,
  //           disabled: isIP(row.id as string),
  //           placeholder: '无线连接IP地址'
  //         },
  //         on: {
  //           'update:value': (val: string) => row.ip = val
  //         }
  //       }
  //     )
  //   }
  // },
  {
    title: '操作',
    key: 'operation',
    render(row) {
      const isWireless = isIP(row.id as string)
      return h(
        NSpace,
        {

        },
        [h(
          NButton,
          {
            size: 'small',
            strong: true,
            type: isWireless ? 'error' : 'primary',
            onClick: () => {
              if (isWireless) {
                // 向主线程发起断开连接请求
                window.ipcRenderer.send('disconnect', row.id)
              } else {
                // 向主线程发起无线连接请求
                if (!row.ip || !isIP(row.ip as string)) {
                  message.warning('请检查ip地址')
                  return
                }
                // window.ipcRenderer.send('connect', row)
              }
            }
          },
          {
            default: () => isWireless ? '断开连接' : '打开无线连接',
          }
        ),
        h(
          NButton,
          {
            size: 'small',
            strong: true,
            type: 'info',
            onClick: () => {
              window.ipcRenderer.send('open', { config: {}, devices: [{ ...row }] })
            }
          },
          {
            default: () => '打开镜像'
          }
        )
        ]
      )

    }
  }
]
let data = reactive<device[]>([]) // 数据表格的数据
// 判断是否ip地址
function isIP(str: string) {
  return (/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(:\d{4})?$/).test(str)
}

onMounted(() => {
  // 主线程发送过来的设备列表变动
  window.ipcRenderer.on('devices', (event: any, devices: device[]) => {
    data.length = 0 // 清空数组
    data.push(...devices)
    loading.value = false
  })
})
onBeforeUnmount(() => {
  window.ipcRenderer.removeAllListeners('devices')
})

// 初始化设备数据
window.ipcRenderer.send('get-adb-devices')
</script>
<template>
  <NDataTable :columns="columns" :data="data" :row-key="row => row.id" :loading="loading">
    <template #empty>
      <NEmpty description="暂无设备连接" />
    </template>
  </NDataTable>
</template>