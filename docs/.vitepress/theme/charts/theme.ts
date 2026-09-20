/**
 * 图表主题工具。
 * 说明：本文件只做纯数据/纯函数，不 import echarts，
 * 这样它可以被 SSR 安全地求值（真正的 echarts 在组件 onMounted 里动态加载）。
 * 颜色必须显式指定，不能依赖 CSS 变量——ECharts 画在 canvas 上。
 */

export interface Palette {
  dark: boolean
  /** 主文字色 */
  text: string
  /** 次要文字色（轴标签、说明） */
  sub: string
  /** 轴线 */
  axis: string
  /** 网格分割线 */
  split: string
  /** 边框 */
  border: string
  /** 系列配色，按顺序取用 */
  series: string[]
  /** 语义色 */
  good: string
  warn: string
  dim: string
}

const LIGHT_SERIES = [
  '#8c1f28',
  '#b5525b',
  '#d98c92',
  '#3f5f8f',
  '#7292bd',
  '#c9a227',
  '#5f8a6a',
  '#8a7f9c',
  '#b08968',
  '#8f8f8f',
]

const DARK_SERIES = [
  '#d4636c',
  '#e08a92',
  '#efb3b8',
  '#7fa3d1',
  '#a8c2e0',
  '#e0c34d',
  '#8fb89a',
  '#b3a9c4',
  '#d0ab8a',
  '#b0b0b0',
]

export function palette(dark: boolean): Palette {
  return dark
    ? {
        dark: true,
        text: '#e6e6e6',
        sub: '#9aa0a6',
        axis: '#3a3f46',
        split: '#2b3037',
        border: '#33383f',
        series: DARK_SERIES,
        good: '#8fb89a',
        warn: '#e0c34d',
        dim: '#7a7a7a',
      }
    : {
        dark: false,
        text: '#24292f',
        sub: '#6b7280',
        axis: '#d8dbe0',
        split: '#f0f1f3',
        border: '#e5e7eb',
        series: LIGHT_SERIES,
        good: '#5f8a6a',
        warn: '#c9a227',
        dim: '#9aa0a6',
      }
}

/** 通用 tooltip（跟随主题，避免暗色下白底白字） */
export function tooltip(p: Palette) {
  return {
    trigger: 'axis' as const,
    backgroundColor: p.dark ? '#1c2025' : '#ffffff',
    borderColor: p.border,
    borderWidth: 1,
    textStyle: { color: p.text, fontSize: 12.5 },
    extraCssText:
      'box-shadow:0 2px 10px rgba(0,0,0,.10);border-radius:6px;padding:8px 10px;',
  }
}

export function tooltipItem(p: Palette) {
  return { ...tooltip(p), trigger: 'item' as const }
}

/** 图例统一样式 */
export function legend(p: Palette, extra: Record<string, unknown> = {}) {
  return {
    top: 0,
    left: 'center',
    icon: 'roundRect',
    itemWidth: 11,
    itemHeight: 11,
    itemGap: 16,
    textStyle: { color: p.sub, fontSize: 12 },
    ...extra,
  }
}

/** 类目轴 */
export function catAxis(
  data: (string | number)[],
  p: Palette,
  extra: Record<string, unknown> = {},
) {
  return {
    type: 'category' as const,
    data,
    axisLine: { lineStyle: { color: p.axis } },
    axisTick: { show: false },
    axisLabel: { color: p.sub, fontSize: 11.5 },
    ...extra,
  }
}

/** 数值轴 */
export function valAxis(p: Palette, extra: Record<string, unknown> = {}) {
  return {
    type: 'value' as const,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: p.sub, fontSize: 11.5 },
    splitLine: { lineStyle: { color: p.split } },
    ...extra,
  }
}

/** 干净的网格边距 */
export function grid(extra: Record<string, unknown> = {}) {
  return { left: 4, right: 18, top: 44, bottom: 4, containLabel: true, ...extra }
}

/** 轴名称样式 */
export function axisName(p: Palette) {
  return { color: p.sub, fontSize: 11.5, padding: [0, 0, 6, 0] }
}

export interface RangeRow {
  label: string
  min: number
  max: number
}

/**
 * 区间条：表达「A–B」这种范围（如申论分值 15–20 分）。
 * 用「透明底段 + 有色段」堆叠，在一根条上画出区间——
 * 比把区间取中值画成饼图更诚实。
 * 返回两个 series，按顺序 spread 进 series 数组即可。
 */
export function rangeBar(
  name: string,
  rows: RangeRow[],
  color: string,
  p: Palette,
  unit = '',
) {
  return [
    {
      name,
      type: 'bar' as const,
      stack: 'range',
      silent: true,
      barWidth: 20,
      itemStyle: { color: 'transparent' },
      data: rows.map((r) => r.min),
    },
    {
      name,
      type: 'bar' as const,
      stack: 'range',
      barWidth: 20,
      itemStyle: { color },
      data: rows.map((r) => r.max - r.min),
      label: {
        show: true,
        position: 'right' as const,
        distance: 8,
        color: p.text,
        fontSize: 12,
        formatter: (params: { dataIndex: number }) => {
          const r = rows[params.dataIndex]
          return r.min === r.max ? `${r.min}${unit}` : `${r.min}–${r.max}${unit}`
        },
      },
    },
  ]
}
