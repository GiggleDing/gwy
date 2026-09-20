import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import GkChart from './components/GkChart.vue'
import GkHome from './components/GkHome.vue'
import 'katex/dist/katex.min.css'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 全局注册，markdown 里直接用 <GkChart name="..." /> / <GkHome />
    app.component('GkChart', GkChart)
    app.component('GkHome', GkHome)
  },
} satisfies Theme
