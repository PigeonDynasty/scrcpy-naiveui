<script lang="ts">
import { defineComponent,ref } from 'vue'
  import {NCard,NTabs,NTabPane,NInput,NForm,NFormItemRow,NButton,NSpace,NSwitch,
  NCheckbox,NSlider,NInputNumber,NSelect,NCheckboxGroup,NDivider} from 'naive-ui'
  export default defineComponent({
    components: {
    NCard,NTabs,NTabPane,NInput,NForm,NFormItemRow,NButton,NSpace,NSwitch,
    NCheckbox,NSlider,NInputNumber,NSelect,NCheckboxGroup,NDivider},
    setup() {
      return {
        active: ref(false),
        value: ref(false),
        BitRate: ref(0),
        resolution: ref(0),
        Framerate: ref(0),
        angle: ref(null),
        options: [
        {
          label: "0°",
          value: 'angle0',
        },
        {
          label: '90°',
          value: 'angle1'
        },
        {
          label: '180°',
          value: 'angle2'
        },
        {
          label: "270°",
          value: 'angle3',
        }
        ],
        settings: ref(null)
      }
    }
  })
</script>

<template>
  <n-card title="Scrcpy" style="margin-bottom: 16px;">
    <n-tabs default-value="Mirror configuration" justify-content="space-evenly" size="large">
      <n-tab-pane name="Mirror configuration" tab="镜像配置">
        <n-form>
          <n-form-item-row label="窗口标题">
            <n-input placeholder="请输入窗口标题"/>
          </n-form-item-row>
          <n-form-item-row label="Scrcpy">
            <n-input placeholder="Scrcpy文件夹路径-例如:C:\scrcpy-win64" />
          </n-form-item-row>
          <n-form-item-row label="镜像录屏">
           <n-space>
             <n-switch v-model:value="active" />
             <n-checkbox v-model:checked="value">录屏时打开镜像</n-checkbox>
           </n-space>
          </n-form-item-row>
           <n-form-item-row label="录屏文件路径">
            <n-input placeholder="请输入录屏文件路径"/>
          </n-form-item-row>
          <n-form-item-row label="镜像传输比特率">
           <n-space vertical>
              <n-slider v-model:value="BitRate" :step="1" :max="1024" />
              <n-input-number size="small" v-model:value="BitRate"  :min="0"/>
           </n-space>
          </n-form-item-row>
          <n-form-item-row label="等比最大分辨率">
           <n-space vertical>
              <n-slider v-model:value="resolution" :step="1" :max="1024" />
              <n-input-number size="small" v-model:value="resolution"  :min="0"/>
           </n-space>
          </n-form-item-row>
          <n-form-item-row label="最大帧率">
           <n-space vertical>
              <n-slider v-model:value="Framerate" :step="1" :max="144" />
              <n-input-number size="small" v-model:value="Framerate"  :min="0"/>
           </n-space>
          </n-form-item-row>
          <n-form-item-row label="旋转角度">
             <n-select v-model:value="angle" :options="options" />
          </n-form-item-row>
          <n-form-item-row label="其他设置">
             <n-checkbox-group v-model:value="settings">
              <n-space item-style="display: flex;">
                <n-checkbox value="zhiding" label="窗口置顶" />
                <n-checkbox value="kongzhi" label="电脑控制" />
                <n-checkbox value="biankuang" label="显示边框" />
                <n-checkbox value="quanping" label="全屏显示" />
                <n-checkbox value="guanbisuoping" label="关闭锁屏" />
                <n-checkbox value="xuanran" label="渲染所有帧 会增加延迟" />
                <n-checkbox value="guanbipingmu" label="打开镜像时关闭屏幕" />
              </n-space>
             </n-checkbox-group>
          </n-form-item-row>
           <n-divider />
          <n-space>
            <n-button type="info">保存当前配置</n-button>
            <n-button type="primary">恢复默认配置</n-button>
           
  </n-space>
        </n-form>
      
      </n-tab-pane>
      <n-tab-pane name="Image management" tab="镜像管理">
        <n-form>
          <n-divider >设备局域网IP地址</n-divider>
          <n-form-item-row >
           <n-input placeholder="请输入IP地址" />
          </n-form-item-row>
            <n-button type="primary">开启无线连接</n-button>
            <n-divider ></n-divider>
          <n-form-item-row label="暂无设备连接">
          </n-form-item-row>
        </n-form>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<style>
body {
    background: rgb(102, 96, 96);
  }
</style>
