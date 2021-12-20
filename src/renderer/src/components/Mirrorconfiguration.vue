<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import {
    NInput,
    NForm,
    NFormItemRow,
    NButton,
    NSpace,
    NSwitch,
    NCheckbox,
    NSlider,
    NInputNumber,
    NSelect,
    NCheckboxGroup,
    NDivider,
    NGrid,
    NGridItem
} from 'naive-ui'
import { fileSelect } from '../common/utils'
import { useStore } from '../plugins/store'
export default defineComponent({
    components: {
        NInput,
        NForm,
        NFormItemRow,
        NButton,
        NSpace,
        NSwitch,
        NCheckbox,
        NSlider,
        NInputNumber,
        NSelect,
        NCheckboxGroup,
        NDivider,
        NGrid,
        NGridItem,
    },
    setup() {
        const store = useStore()
        return {
            form: reactive(store.get('config')),
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
    },
    methods: {
        selectRecordPath() {
            fileSelect().then(path => {
                this.form.source = path as string
            })
        }
    }
})
</script>

<template>
    <n-form label-placement="left" label-align="left">
        <n-form-item-row label="窗口标题" label-width="110">
            <n-input placeholder="请输入窗口标题" />
        </n-form-item-row>
        <n-form-item-row label="Scrcpy程序路径" label-width="110">
            <n-input
                v-model:value="form.source"
                readonly
                placeholder="Scrcpy文件夹路径-例如:C:\scrcpy-win64\scrcpy.exe"
                @click="selectRecordPath"
            />
        </n-form-item-row>
        <n-form-item-row label="镜像录屏" label-width="110">
            <n-space>
                <n-switch v-model:value="active" />
                <n-checkbox v-model:checked="value">录屏时打开镜像</n-checkbox>
            </n-space>
        </n-form-item-row>
        <n-form-item-row label="录屏文件路径" label-width="110">
            <n-input placeholder="请输入录屏文件路径" />
        </n-form-item-row>
        <n-form-item-row label="镜像传输比特率" label-width="110">
            <n-grid :cols="2" x-gap="100px">
                <n-grid-item>
                    <n-slider v-model:value="BitRate" :step="1" :max="1024" />
                </n-grid-item>
                <n-grid-item>
                    <n-input-number size="small" v-model:value="BitRate" :min="0" />
                </n-grid-item>
            </n-grid>
        </n-form-item-row>
        <n-form-item-row label="等比最大分辨率" label-width="110">
            <n-grid :cols="2" x-gap="100px">
                <n-grid-item>
                    <n-slider v-model:value="resolution" :step="1" :max="1024" />
                </n-grid-item>
                <n-grid-item>
                    <n-input-number size="small" v-model:value="resolution" :min="0" />
                </n-grid-item>
            </n-grid>
        </n-form-item-row>
        <n-form-item-row label="最大帧率" label-width="110">
            <n-grid :cols="2" x-gap="100px">
                <n-grid-item>
                    <n-slider v-model:value="Framerate" :step="1" :max="144" />
                </n-grid-item>
                <n-grid-item>
                    <n-input-number size="small" v-model:value="Framerate" :min="0" />
                </n-grid-item>
            </n-grid>
        </n-form-item-row>
        <n-form-item-row label="旋转角度" label-width="110">
            <n-select v-model:value="angle" :options="options" />
        </n-form-item-row>
        <n-form-item-row label="其他设置" label-width="110">
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
        <n-space justify="center">
            <n-button type="info">保存当前配置</n-button>
            <n-button type="primary">恢复默认配置</n-button>
        </n-space>
    </n-form>
</template>