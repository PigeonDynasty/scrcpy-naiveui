<script lang="ts">
import { defineComponent, computed } from 'vue'
import {
  NConfigProvider,
  NMessageProvider,
  NGlobalStyle,
  NTabs,
  NTabPane,
  useOsTheme,
  darkTheme
} from 'naive-ui'
import Management from './components/Management.vue'
import MirrorConfiguration from './components/Mirrorconfiguration.vue'
export default defineComponent({
  components: {
    NConfigProvider,
    NMessageProvider,
    NGlobalStyle,
    NTabs,
    NTabPane,
    Management,
    MirrorConfiguration
  },
  setup() {
    const theme = computed(() => (useOsTheme().value === 'dark' ? darkTheme : null))
    return {
      theme,
    }
  },
  methods: {
  }
})
</script>

<template>
  <n-config-provider :theme="theme">
    <n-global-style />
    <n-message-provider placement="top-right">
      <n-tabs default-value="Mirror configuration" justify-content="space-evenly" size="large">
        <n-tab-pane name="Mirror configuration" tab="镜像配置">
          <MirrorConfiguration />
        </n-tab-pane>
        <n-tab-pane name="Image management" tab="镜像管理">
          <management />
        </n-tab-pane>
      </n-tabs>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
body {
  padding: 0 20px 20px;
}
</style>
