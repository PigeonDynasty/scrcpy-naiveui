<script lang="ts">
import { defineComponent, reactive } from 'vue'
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
    NGridItem,
    useMessage
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
        const message = useMessage()
        return {
            message,
            form: reactive(store.get('config')),
            options: [
                {
                    label: "0°",
                    value: 0,
                },
                {
                    label: '90°',
                    value: 1
                },
                {
                    label: '180°',
                    value: 2
                },
                {
                    label: "270°",
                    value: 3
                }
            ]
        }
    },
    methods: {
        selectRecordPath(key: string, bol: boolean = false) {
            fileSelect(bol).then(path => {
                if (key === 'recordPath') {
                    this.form.recordPath = path + '/scrcpy-record.mp4'
                } else if (key === 'source') {
                    if (path.indexOf('scrcpy') === -1) {
                        this.message.error('请正确选择Scrcpy路径')
                        return
                    }
                    this.form.source = path
                }
            })
        },
        save() {
            this.$store.set('config', this.form)
            this.message.success('保存成功')
        },
        resetToDefault() {
            this.$store.dispatch('resetConfigToDefault').then(config => {
                Object.keys(config).forEach(key => {
                    this.form[key] = config[key]
                })
                this.message.success('重置成功')
            })
        }
    }
})
</script>

<template>
    <n-form class="mirror-configuration" label-placement="left" label-align="left">
        <n-form-item-row label="窗口标题" label-width="110">
            <n-input v-model:value="form.title" placeholder="请输入窗口标题" />
        </n-form-item-row>
        <n-form-item-row label="Scrcpy路径" label-width="110">
            <n-input
                v-model:value="form.source"
                readonly
                placeholder="<scrcpy directory>/scrcpy 默认使用环境变量"
                @click="selectRecordPath('source')"
            />
        </n-form-item-row>
        <n-form-item-row label="镜像录屏" label-width="110">
            <n-space>
                <n-switch v-model:value="form.record" />
                <n-checkbox v-model:checked="form.noDisplay">录屏时关闭镜像</n-checkbox>
            </n-space>
        </n-form-item-row>
        <n-form-item-row label="录屏文件路径" label-width="110">
            <n-input
                v-model:value="form.recordPath"
                readonly
                placeholder="请输入录屏文件路径"
                @click="selectRecordPath('recordPath', true)"
            />
        </n-form-item-row>
        <n-form-item-row label="镜像传输比特率" label-width="110">
            <n-grid :cols="3" x-gap="20px">
                <n-grid-item :span="2">
                    <n-slider v-model:value="form.bitRate" :max="1024" />
                </n-grid-item>
                <n-grid-item :span="1">
                    <n-input-number size="small" v-model:value="form.bitRate" :min="0" :max="1024" />
                </n-grid-item>
            </n-grid>
        </n-form-item-row>
        <n-form-item-row label="等比最大分辨率" label-width="110">
            <n-grid :cols="3" x-gap="20px">
                <n-grid-item :span="2">
                    <n-slider v-model:value="form.maxSize" :max="1024" />
                </n-grid-item>
                <n-grid-item :span="1">
                    <n-input-number size="small" v-model:value="form.maxSize" :min="0" :max="1024" />
                </n-grid-item>
            </n-grid>
        </n-form-item-row>
        <n-form-item-row label="最大帧率" label-width="110">
            <n-grid :cols="3" x-gap="20px">
                <n-grid-item :span="2">
                    <n-slider v-model:value="form.maxFps" :max="144" />
                </n-grid-item>
                <n-grid-item :span="1">
                    <n-input-number size="small" v-model:value="form.maxFps" :min="0" :max="144" />
                </n-grid-item>
            </n-grid>
        </n-form-item-row>
        <n-form-item-row label="旋转角度" label-width="110">
            <n-select v-model:value="form.rotation" :options="options" />
        </n-form-item-row>
        <n-form-item-row label="其他设置" label-width="110">
            <n-checkbox-group v-model:value="form.other">
                <n-space item-style="display: flex;">
                    <n-checkbox value="alwaysOnTop" label="窗口置顶" />
                    <n-checkbox value="noControl" label="不允许控制" />
                    <n-checkbox value="borderless" label="无边框" />
                    <n-checkbox value="fullscreen" label="全屏显示" />
                    <n-checkbox value="stayAwake" label="保持唤醒" />
                    <n-checkbox value="renderAll" label="渲染所有帧(会增加延迟)" />
                    <n-checkbox value="screenOff" label="打开时关闭屏幕" />
                </n-space>
            </n-checkbox-group>
        </n-form-item-row>
        <n-divider />
        <n-space justify="center">
            <n-button type="info" @click="save">保存当前配置</n-button>
            <n-button type="primary" @click="resetToDefault">恢复默认配置</n-button>
        </n-space>
    </n-form>
</template>