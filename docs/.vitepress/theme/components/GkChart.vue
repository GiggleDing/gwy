<script setup lang="ts">
/**
 * 通用图表组件。
 * markdown 里写：<GkChart name="module-share" />
 * 图表定义集中在 theme/charts/registry.ts，页面里不写数据。
 *
 * 设计要点：
 * 1. ECharts 用动态 import，既避开 SSG（Node 环境）下的 DOM 依赖，也避免主包变大。
 * 2. 颜色全部由 palette(isDark) 显式提供，跟随站点明暗主题重新渲染。
 * 3. 图在客户端挂载后才画，服务端渲染阶段只输出一个占位容器。
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { getChart } from '../charts/registry'
import { palette } from '../charts/theme'

const props = withDefaults(
  defineProps<{
    /** registry 中的图表名 */
    name: string
    /** 覆盖默认高度，如 '420px' */
    height?: string
  }>(),
  { height: '' },
)

const { isDark } = useData()
const el = ref<HTMLElement | null>(null)

let instance: {
  setOption: (option: unknown, notMerge?: boolean) => void
  resize: () => void
  dispose: () => void
} | null = null
let observer: ResizeObserver | null = null

const def = getChart(props.name)
const boxHeight = props.height || def?.height || '320px'

function render() {
  if (!instance || !def) return
  instance.setOption(
    {
      aria: { enabled: true, description: def.aria },
      ...def.build(palette(isDark.value)),
    },
    true,
  )
}

onMounted(async () => {
  if (!def) {
    console.warn(`[GkChart] 未注册的图表名：${props.name}`)
    return
  }
  const [core, chartsMod, compsMod, renderersMod] = await Promise.all([
    import('echarts/core'),
    import('echarts/charts'),
    import('echarts/components'),
    import('echarts/renderers'),
  ])

  core.use([
    chartsMod.BarChart,
    chartsMod.LineChart,
    chartsMod.PieChart,
    chartsMod.ScatterChart,
    compsMod.GridComponent,
    compsMod.TooltipComponent,
    compsMod.LegendComponent,
    compsMod.TitleComponent,
    compsMod.MarkLineComponent,
    compsMod.AriaComponent,
    renderersMod.CanvasRenderer,
  ])

  if (!el.value) return
  instance = core.init(el.value, undefined, { renderer: 'canvas' }) as never
  render()

  observer = new ResizeObserver(() => instance?.resize())
  observer.observe(el.value)
})

// 明暗主题切换后重画（canvas 不认 CSS 变量，必须重算颜色）
watch(isDark, render)

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  instance?.dispose()
  instance = null
})
</script>

<template>
  <figure v-if="def" class="gk-chart">
    <div ref="el" class="gk-chart__canvas" :style="{ height: boxHeight }" />
    <figcaption v-if="def.caption" class="gk-chart__caption">{{ def.caption }}</figcaption>
  </figure>
  <div v-else class="gk-chart gk-chart--missing">
    图表未注册：<code>{{ name }}</code>
  </div>
</template>
