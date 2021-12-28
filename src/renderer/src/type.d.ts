import { ComponentCustomProperties } from 'vue'
import { Store } from './plugins/store'

declare module '@vue/runtime-core' {
  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: Store
  }
}
