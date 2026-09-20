/**
 * 图表注册表。
 * 每张图用 name 引用，markdown 里只写 <GkChart name="xxx" />。
 * 数据来源：各页面原有的数据表格（本次改造已用图表替换）。
 *
 * 约定：build(p) 返回 ECharts option 片段（不含容器），
 * 颜色一律来自 p，保证明暗主题都清晰可读。
 */

import {
  axisName,
  catAxis,
  grid,
  legend,
  palette,
  rangeBar,
  tooltip,
  tooltipItem,
  valAxis,
  type Palette,
} from './theme'

export interface ChartDef {
  /** 容器高度 */
  height: string
  /** 图表下方说明（可选） */
  caption?: string
  /** 无障碍 / 悬停说明 */
  aria?: string
  build: (p: Palette) => Record<string, unknown>
}

interface DonutOpts {
  /** 数量单位，如「题」「道」 */
  unit?: string
  inner?: string
  outer?: string
  /** 数据本身就是百分数（占比分布），标签只显示 {b} + {d}%，避免出现「35 % · 35%」 */
  percentValues?: boolean
}

/** 快捷：环形图 */
function donut(
  p: Palette,
  rows: { name: string; value: number }[],
  opts: DonutOpts = {},
) {
  const { unit = '题', inner = '50%', outer = '72%', percentValues = false } = opts
  return {
    tooltip: tooltipItem(p),
    legend: {
      bottom: 0,
      left: 'center',
      icon: 'roundRect',
      itemWidth: 11,
      itemHeight: 11,
      itemGap: 14,
      textStyle: { color: p.sub, fontSize: 12 },
    },
    series: [
      {
        type: 'pie',
        radius: [inner, outer],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: p.dark ? '#1b1b1b' : '#fff', borderWidth: 2 },
        label: {
          color: p.text,
          fontSize: 11.5,
          lineHeight: 15,
          formatter: percentValues
            ? '{b}\n{d}%'
            : (x: { name: string; value: number; percent: number }) =>
                `${x.name}\n${x.value} ${unit} · ${Math.round(x.percent)}%`,
        },
        labelLine: { length: 8, length2: 8, lineStyle: { color: p.axis } },
        data: rows.map((r, i) => ({
          ...r,
          itemStyle: { color: p.series[i % p.series.length] },
        })),
      },
    ],
  }
}

export const charts: Record<string, ChartDef> = {
  /* ───────────────── 00-总览 / 备考总览 ───────────────── */

  /** 三层目标分：行测 + 申论 = 总分，堆叠后自然等于总分，可自校验 */
  'target-scores': {
    height: '300px',
    caption: '行测与申论堆叠即总分。虚线为 2026 年同岗位进面分 112.4，达标线 130 留出 17.6 分安全垫。',
    aria: '三层目标分数：保底 118（行测 62 + 申论 56）、达标 130（68 + 62）、冲刺 140（73 + 67）',
    build: (p) => ({
      tooltip: tooltip(p),
      legend: legend(p),
      grid: grid({ top: 48 }),
      xAxis: catAxis(['保底 118', '达标 130', '冲刺 140'], p, {
        axisLabel: { color: p.sub, fontSize: 12.5 },
      }),
      yAxis: valAxis(p, { name: '分数', nameTextStyle: axisName(p), max: 150 }),
      series: [
        {
          name: '行测',
          type: 'bar',
          stack: 'total',
          barWidth: 54,
          itemStyle: { color: p.series[0] },
          label: { show: true, position: 'inside', color: '#fff', fontSize: 12.5 },
          data: [62, 68, 73],
        },
        {
          name: '申论',
          type: 'bar',
          stack: 'total',
          barWidth: 54,
          itemStyle: { color: p.series[3] },
          label: { show: true, position: 'inside', color: '#fff', fontSize: 12.5 },
          data: [56, 62, 67],
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { type: 'dashed', color: p.sub, width: 1.2 },
            label: {
              formatter: '进面线 112.4',
              color: p.sub,
              fontSize: 11,
              position: 'insideEndTop',
            },
            data: [{ yAxis: 112.4 }],
          },
        },
      ],
    }),
  },

  /** 试卷形态：题量 / 建议用时 / 目标正确率，三个量纲放同一张图 */
  'paper-structure': {
    height: '340px',
    caption:
      '柱为题量与建议用时（左轴），折线为目标正确率（右轴）。数量关系不设正确率目标（只做 3–5 题、其余统一蒙），故折线在此断开；涂卡 2 分钟未计入。',
    aria: '副省级卷六个模块的题量、建议用时与目标正确率',
    build: (p) => ({
      tooltip: tooltip(p),
      legend: legend(p),
      grid: grid({ top: 52, right: 44 }),
      xAxis: catAxis(
        ['政治理论', '常识判断', '言语理解', '数量关系', '判断推理', '资料分析'],
        p,
        {
          axisLabel: { color: p.sub, fontSize: 11, interval: 0, rotate: 18 },
        },
      ),
      yAxis: [
        valAxis(p, { name: '题量 / 用时', nameTextStyle: axisName(p), max: 60, interval: 20 }),
        valAxis(p, {
          name: '正确率',
          nameTextStyle: axisName(p),
          max: 100,
          min: 0,
          splitLine: { show: false },
          axisLabel: { color: p.sub, fontSize: 11.5, formatter: '{value}%' },
        }),
      ],
      series: [
        {
          name: '题量',
          type: 'bar',
          barWidth: 20,
          itemStyle: { color: p.series[0] },
          data: [20, 15, 30, 15, 35, 20],
        },
        {
          name: '建议用时（分钟）',
          type: 'bar',
          barWidth: 20,
          itemStyle: { color: p.series[4] },
          data: [13, 8, 30, 6, 33, 28],
        },
        {
          name: '目标正确率',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          connectNulls: false,
          symbolSize: 7,
          lineStyle: { width: 2.2, color: p.series[5] },
          itemStyle: { color: p.series[5] },
          label: {
            show: true,
            color: p.text,
            fontSize: 11,
            formatter: (x: { value: number | null }) => (x.value == null ? '' : x.value + '%'),
          },
          data: [80, 55, 75, null, 75, 85],
        },
      ],
    }),
  },

  /* ───────────────── 00-总览 / 行测战略地图 ───────────────── */

  /** 题量分布（占比） */
  'module-share': {
    height: '330px',
    caption: '副省级卷 135 题。判断推理 + 言语理解已占 48%，是分数的基本盘。',
    aria: '各模块题量与占比：判断推理 35、言语理解 30、政治理论 20、资料分析 20、常识判断 15、数量关系 15',
    build: (p) =>
      donut(p, [
        { name: '判断推理', value: 35 },
        { name: '言语理解', value: 30 },
        { name: '政治理论', value: 20 },
        { name: '资料分析', value: 20 },
        { name: '常识判断', value: 15 },
        { name: '数量关系', value: 15 },
      ]),
  },

  /** 120 分钟怎么切：条形长度 = 用时，颜色 = 得分权重 */
  'time-allocation': {
    height: '320px',
    caption:
      '条长 = 建议用时，颜色 = 得分权重（深红最高、红为高、蓝为稳、灰为低）。资料分析占 28 分钟却是权重最高的模块，所以要放在清醒期做。',
    aria: '作答顺序与用时：政治理论 13 分钟、常识判断 8、资料分析 28、判断推理 33、言语理解 30、数量关系 6',
    build: (p) => {
      const rows = [
        { name: '1 政治理论', min: 13, acc: '80%', w: p.series[3] },
        { name: '2 常识判断', min: 8, acc: '55%', w: p.dim },
        { name: '3 资料分析', min: 28, acc: '85%', w: p.series[0] },
        { name: '4 判断推理', min: 33, acc: '75%', w: p.series[1] },
        { name: '5 言语理解', min: 30, acc: '75%', w: p.series[1] },
        { name: '6 数量关系', min: 6, acc: '做 3 蒙 12', w: p.dim },
      ]
      return {
        tooltip: tooltipItem(p),
        grid: grid({ left: 4, right: 96, top: 18 }),
        xAxis: valAxis(p, { name: '分钟', nameTextStyle: axisName(p), max: 36 }),
        yAxis: catAxis(
          rows.map((r) => r.name),
          p,
          { inverse: true, axisLabel: { color: p.text, fontSize: 12 } },
        ),
        series: [
          {
            type: 'bar',
            barWidth: 17,
            data: rows.map((r) => ({
              value: r.min,
              itemStyle: { color: r.w, borderRadius: [0, 3, 3, 0] },
              name: r.name,
            })),
            label: {
              show: true,
              position: 'right',
              distance: 8,
              color: p.text,
              fontSize: 11.5,
              formatter: (x: { dataIndex: number }) =>
                `${rows[x.dataIndex].min} min · ${rows[x.dataIndex].acc}`,
            },
          },
        ],
      }
    },
  },

  /** 单题止损线：排序后的水平条，越靠上越宽松 */
  'stop-loss': {
    height: '400px',
    caption: '单题超过这个秒数就标记走人。注意数量关系（90 秒）超时是永久放弃，不是回头再看。',
    aria: '单题止损线：资料分析与数量关系 90 秒、逻辑判断 70 秒、片段阅读 60 秒、定义判断 55 秒、图形推理 50 秒、逻辑填空 45 秒、政治理论 40 秒、常识判断与类比推理 30 秒',
    build: (p) => {
      const rows: [string, number][] = [
        ['资料分析', 90],
        ['数量关系', 90],
        ['逻辑判断', 70],
        ['片段阅读', 60],
        ['定义判断', 55],
        ['图形推理', 50],
        ['逻辑填空', 45],
        ['政治理论', 40],
        ['常识判断', 30],
        ['类比推理', 30],
      ]
      return {
        tooltip: tooltipItem(p),
        grid: grid({ left: 4, right: 64, top: 18 }),
        xAxis: valAxis(p, { name: '秒', nameTextStyle: axisName(p), max: 100 }),
        yAxis: catAxis(
          rows.map((r) => r[0]),
          p,
          { inverse: true, axisLabel: { color: p.text, fontSize: 12 } },
        ),
        series: [
          {
            type: 'bar',
            barWidth: 15,
            data: rows.map(([n, v]) => ({
              value: v,
              name: n,
              itemStyle: {
                color: v >= 90 ? p.series[0] : v >= 60 ? p.series[1] : p.series[4],
                borderRadius: [0, 3, 3, 0],
              },
            })),
            label: {
              show: true,
              position: 'right',
              distance: 8,
              color: p.text,
              fontSize: 11.5,
              formatter: '{c} 秒',
            },
          },
        ],
      }
    },
  },

  /* ───────────────── 01-政治理论 ───────────────── */

  'zzll-difficulty': {
    height: '300px',
    caption: '低 + 中等合计 19 题。把框架搭起来就能稳定拿到 80%，这是全卷性价比最高的 20 题。',
    aria: '政治理论难度分布：低难度 5 题、中等 14 题、高难度 1 题',
    build: (p) =>
      donut(
        p,
        [
          { name: '低难度', value: 5 },
          { name: '中等难度', value: 14 },
          { name: '高难度', value: 1 },
        ],
        { unit: '题', inner: '46%', outer: '70%' },
      ),
  },

  /* ───────────────── 02-常识判断 ───────────────── */

  /** 各模块目标正确率对比，用来解释"为什么常识只定 55%" */
  'cs-accuracy-compare': {
    height: '290px',
    caption:
      '常识判断是六个模块里目标正确率最低的一个。把整块时间投给常识，等于用最贵的资源去填最浅的坑。',
    aria: '目标正确率对比：资料分析 85%、政治理论 80%、言语理解 75%、判断推理 75%、常识判断 55%',
    build: (p) => {
      const rows: [string, number][] = [
        ['资料分析', 85],
        ['政治理论', 80],
        ['言语理解', 75],
        ['判断推理', 75],
        ['常识判断', 55],
      ]
      return {
        tooltip: tooltipItem(p),
        grid: grid({ left: 4, right: 56, top: 18 }),
        xAxis: valAxis(p, {
          max: 100,
          axisLabel: { color: p.sub, fontSize: 11.5, formatter: '{value}%' },
        }),
        yAxis: catAxis(
          rows.map((r) => r[0]),
          p,
          { inverse: true, axisLabel: { color: p.text, fontSize: 12 } },
        ),
        series: [
          {
            type: 'bar',
            barWidth: 17,
            data: rows.map(([n, v]) => ({
              value: v,
              name: n,
              itemStyle: {
                // 用金色标出「常识判断」这个被讨论的对象，避免用品牌红被误读成「最高」
                color: n === '常识判断' ? p.series[5] : p.series[4],
                borderRadius: [0, 3, 3, 0],
              },
            })),
            label: {
              show: true,
              position: 'right',
              distance: 8,
              color: p.text,
              fontSize: 11.5,
              formatter: '{c}%',
            },
          },
        ],
      }
    },
  },

  /* ───────────────── 03-言语理解 ───────────────── */

  'yy-composition': {
    height: '310px',
    caption: '逻辑填空一项占半壁，且规律性最强——它就是言语提分的入口。',
    aria: '言语理解题型构成：逻辑填空 15 题、片段阅读 12 题、语句表达 3 题',
    build: (p) =>
      donut(p, [
        { name: '逻辑填空', value: 15 },
        { name: '片段阅读', value: 12 },
        { name: '语句表达', value: 3 },
      ]),
  },

  /* ───────────────── 04-数量关系 ───────────────── */

  'sl-difficulty': {
    height: '300px',
    caption: '这就是"5:3:2"的来历。一半基础题值得做，两成难题直接蒙——先学会哪些题不做。',
    aria: '数量关系难度分布：基础题约 50%、中等题约 30%、难题约 20%',
    build: (p) =>
      donut(
        p,
        [
          { name: '基础题（做）', value: 50 },
          { name: '中等题（30 秒判定）', value: 30 },
          { name: '难题（直接蒙）', value: 20 },
        ],
        { percentValues: true, inner: '46%', outer: '70%' },
      ),
  },

  /** 省出来的 6 分钟从哪来 */
  'qty-time-source': {
    height: '290px',
    caption: '数量关系只能做 6 分钟，这 6 分钟不是"想出来"的，是从别的模块省出来的。',
    aria: '省时来源：资料分析不超时 4–6 分钟、图形题不恋战 3–4 分钟、政治理论控时 2–3 分钟、常识 30 秒不回头 2–3 分钟',
    build: (p) => {
      const rows = [
        { label: '资料分析不超时（每篇 ≤ 7 分钟）', min: 4, max: 6 },
        { label: '图形推理不恋战', min: 3, max: 4 },
        { label: '政治理论控制在 13 分钟内', min: 2, max: 3 },
        { label: '常识 30 秒一题不回头', min: 2, max: 3 },
      ]
      return {
        tooltip: tooltipItem(p),
        grid: grid({ left: 4, right: 96, top: 18 }),
        xAxis: valAxis(p, {
          name: '可省分钟',
          nameTextStyle: axisName(p),
          max: 7,
          interval: 1,
        }),
        yAxis: catAxis(
          rows.map((r) => r.label),
          p,
          { inverse: true, axisLabel: { color: p.text, fontSize: 11.5 } },
        ),
        series: rangeBar('可省时间', rows, p.series[0], p, ' 分钟'),
      }
    },
  },

  /* ───────────────── 05-判断推理 ───────────────── */

  'pd-modules': {
    height: '310px',
    caption:
      '四类题型各 10 题，差别在用时与目标正确率。定义判断、类比推理用时最短、目标最高——先把这两项做到 85%。',
    aria: '判断推理四类题型：图形推理 8 分钟目标 70%、定义判断 9 分钟目标 80%、类比推理 5 分钟目标 80%、逻辑判断 11 分钟目标 70%，各 10 题',
    build: (p) => ({
      tooltip: tooltip(p),
      legend: legend(p),
      grid: grid({ top: 52, right: 44 }),
      xAxis: catAxis(['图形推理', '定义判断', '类比推理', '逻辑判断'], p, {
        axisLabel: { color: p.sub, fontSize: 12 },
      }),
      yAxis: [
        valAxis(p, { name: '分钟', nameTextStyle: axisName(p), max: 20, interval: 5 }),
        valAxis(p, {
          name: '正确率',
          nameTextStyle: axisName(p),
          max: 100,
          splitLine: { show: false },
          axisLabel: { color: p.sub, fontSize: 11.5, formatter: '{value}%' },
        }),
      ],
      series: [
        {
          name: '建议用时（分钟，各 10 题）',
          type: 'bar',
          barWidth: 34,
          itemStyle: { color: p.series[0] },
          label: {
            show: true,
            position: 'top',
            color: p.sub,
            fontSize: 11,
            formatter: '{c} min',
          },
          data: [8, 9, 5, 11],
        },
        {
          name: '目标正确率',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          symbolSize: 8,
          lineStyle: { width: 2.2, color: p.series[5] },
          itemStyle: { color: p.series[5] },
          label: {
            show: true,
            color: p.text,
            fontSize: 11,
            formatter: '{c}%',
          },
          data: [70, 80, 80, 70],
        },
      ],
    }),
  },

  /* ───────────────── 06-资料分析 ───────────────── */

  /** 20 题的目标正确率分解：哪几题允许丢 */
  'zlfx-target': {
    height: '320px',
    caption:
      '题量 20，目标 17–19 对（图中画的是上限 19）。两处红色差就是允许丢分的位置——比重与综合分析，也正是检查重点。',
    aria: '资料分析题型题量与目标做对数：现期量/增长率 6、基期量 4、增长量 3、比重 3/4、平均数倍数 2、综合分析 1/2',
    build: (p) => ({
      tooltip: tooltip(p),
      legend: legend(p),
      grid: grid({ top: 52 }),
      xAxis: catAxis(
        ['现期/增长率', '基期量', '增长量', '比重', '平均数/倍数', '综合分析'],
        p,
        { axisLabel: { color: p.sub, fontSize: 11, interval: 0, rotate: 18 } },
      ),
      yAxis: valAxis(p, { name: '题', nameTextStyle: axisName(p), max: 7 }),
      series: [
        {
          name: '题量',
          type: 'bar',
          barWidth: 22,
          itemStyle: { color: p.series[2] },
          label: { show: true, position: 'top', color: p.sub, fontSize: 11 },
          data: [6, 4, 3, 4, 2, 2],
        },
        {
          name: '目标做对',
          type: 'bar',
          barWidth: 22,
          itemStyle: { color: p.series[0] },
          label: { show: true, position: 'top', color: p.text, fontSize: 11.5 },
          data: [6, 4, 3, 3, 2, 1],
        },
      ],
    }),
  },

  /** 高频考点集中度 */
  'zlfx-focus': {
    height: '300px',
    caption: '增长、比重、平均数合计超 80%。把这个 80% 练到 85% 正确率，这个模块的基本盘就稳了。',
    aria: '资料分析高频考点占比：比重 35%、增长 30%、平均数 15%、其余考点 20%',
    build: (p) =>
      donut(
        p,
        [
          { name: '比重', value: 35 },
          { name: '增长', value: 30 },
          { name: '平均数', value: 15 },
          { name: '其余考点', value: 20 },
        ],
        { percentValues: true, inner: '50%', outer: '72%' },
      ),
  },

  /* ───────────────── 07-申论 ───────────────── */

  /** 分值区间用区间条表达，不取中值 */
  'sl-score-share': {
    height: '300px',
    caption:
      '分值本身是区间，所以用区间条展示而不是取中值。大作文 35–40 分，是能否及格的分水岭。',
    aria: '申论题型分值区间：单一题 15–20 分、综合题 15–20 分、公文题 20–25 分、文章写作 35–40 分',
    build: (p) => {
      const rows = [
        { label: '单一题（归纳概括）', min: 15, max: 20 },
        { label: '综合题（词句理解/观点分析）', min: 15, max: 20 },
        { label: '公文题（应用文写作）', min: 20, max: 25 },
        { label: '文章写作（大作文）', min: 35, max: 40 },
      ]
      return {
        tooltip: tooltipItem(p),
        grid: grid({ left: 4, right: 96, top: 18 }),
        xAxis: valAxis(p, { name: '分', nameTextStyle: axisName(p), max: 44 }),
        yAxis: catAxis(
          rows.map((r) => r.label),
          p,
          { inverse: true, axisLabel: { color: p.text, fontSize: 11.5 } },
        ),
        series: rangeBar('分值', rows, p.series[0], p, ' 分'),
      }
    },
  },

  /** 180 分钟怎么切 */
  'sl-time-plan': {
    height: '320px',
    caption:
      '通读材料与公文题取区间中值。合计约 175 分钟，剩余即为涂改与缓冲。倒排时间：先锁死大作文的 55 分钟。',
    aria: '申论 180 分钟分配：通读材料约 35 分钟、单一题 20、综合题 25、公文题约 32、文章写作约 57、检查 5',
    build: (p) => {
      const rows = [
        { label: '通读材料', mid: 35, range: '30–40 min', c: p.series[4] },
        { label: '单一题', mid: 20, range: '20 min', c: p.series[3] },
        { label: '综合题', mid: 25, range: '25 min', c: p.series[3] },
        { label: '公文题', mid: 32.5, range: '30–35 min', c: p.series[1] },
        { label: '文章写作', mid: 57.5, range: '55–60 min', c: p.series[0] },
        { label: '检查', mid: 5, range: '5 min', c: p.dim },
      ]
      return {
        tooltip: tooltipItem(p),
        grid: grid({ left: 4, right: 96, top: 18 }),
        xAxis: valAxis(p, { name: '分钟', nameTextStyle: axisName(p), max: 68 }),
        yAxis: catAxis(
          rows.map((r) => r.label),
          p,
          { inverse: true, axisLabel: { color: p.text, fontSize: 12 } },
        ),
        series: [
          {
            type: 'bar',
            barWidth: 17,
            data: rows.map((r) => ({
              value: r.mid,
              name: r.label,
              itemStyle: { color: r.c, borderRadius: [0, 3, 3, 0] },
            })),
            label: {
              show: true,
              position: 'right',
              distance: 8,
              color: p.text,
              fontSize: 11.5,
              formatter: (x: { dataIndex: number }) => rows[x.dataIndex].range,
            },
          },
        ],
      }
    },
  },

  /* ───────────────── 08-工具 ───────────────── */

  /** 遗忘曲线 + 五轮复习点 */
  'review-curve': {
    height: '360px',
    caption:
      '示意图，用来确定复习点该落在哪一天，不是精确的心理学模型。①②③④⑤ 五轮复习分别在学完后的第 1、3、7、15、30 天。',
    aria: '遗忘曲线示意：不复习时记忆保持率快速衰减至接近零；在第 1、3、7、15、30 天复习后，保持率维持在较高水平',
    build: (p) => {
      const REVIEWS = [1, 3, 7, 15, 30]
      const withReview: [number, number][] = []
      const noReview: [number, number][] = []
      const points: [number, number][] = []
      for (let t = 0; t <= 30 + 1e-9; t = +(t + 0.25).toFixed(2)) {
        const passed = REVIEWS.filter((r) => r <= t).length
        const last = passed === 0 ? 0 : REVIEWS[passed - 1]
        const S = 1.1 * Math.pow(2.6, passed)
        const v = +(100 * Math.exp(-(t - last) / S)).toFixed(2)
        withReview.push([t, v])
        noReview.push([t, +(100 * Math.exp(-t / 1.1)).toFixed(2)])
        if (passed > 0 && Math.abs(t - last) < 1e-6) points.push([t, v])
      }
      return {
        tooltip: {
          ...tooltip(p),
          formatter: (
            ps: { seriesName: string; marker: string; value: number[] }[],
          ) => {
            if (!ps.length) return ''
            const t = Array.isArray(ps[0].value) ? ps[0].value[0] : 0
            const head = t === 0 ? '学习当天' : `学完第 ${t} 天`
            return (
              `<b>${head}</b>` +
              ps.map((x) => {
                const v = Array.isArray(x.value) ? x.value[1] : x.value
                const txt = v == null ? '—' : Math.round(Number(v)) + '%'
                return `<br/>${x.marker} ${x.seriesName}：${txt}`
              }).join('')
            )
          },
        },
        legend: legend(p),
        // 顶部留出 100% 峰值上方放圈码标签的空间
        grid: grid({ top: 52, right: 24, bottom: 34 }),
        xAxis: valAxis(p, {
          name: '学完后的天数',
          nameTextStyle: axisName(p),
          nameLocation: 'middle',
          nameGap: 28,
          min: 0,
          max: 30,
          interval: 5,
          axisLabel: {
            color: p.sub,
            fontSize: 11.5,
            formatter: (v: number) => (v === 0 ? '当天' : `第 ${v} 天`),
          },
        }),
        yAxis: valAxis(p, {
          // 不写轴名：会和第 1 轮的圈码标签撞在一起，单位由轴标签的 % 表达
          min: 0,
          max: 120,
          interval: 20,
          axisLabel: { color: p.sub, fontSize: 11.5, formatter: '{value}%' },
        }),
        series: [
          {
            name: '不复习',
            type: 'line',
            smooth: true,
            symbol: 'none',
            lineStyle: { width: 1.6, type: 'dashed', color: p.dim },
            itemStyle: { color: p.dim },
            data: noReview,
          },
          {
            name: '按 5 轮复习',
            type: 'line',
            smooth: true,
            symbol: 'none',
            lineStyle: { width: 2.4, color: p.series[0] },
            itemStyle: { color: p.series[0] },
            areaStyle: { color: p.series[0], opacity: p.dark ? 0.16 : 0.09 },
            data: withReview,
          },
          {
            name: '复习点',
            type: 'scatter',
            symbolSize: 9,
            itemStyle: { color: p.series[5], borderColor: p.dark ? '#1b1b1b' : '#fff', borderWidth: 1.5 },
            label: {
              show: true,
              // 圈码代替「第 N 轮」：第 1、2 轮只隔两天，写全了会叠字。
              // 必须显式给 color，否则 scatter 会继承系列色，暗色下糊成一团；
              // 再加一层描边光晕，保证压在曲线上也读得清。
              position: 'top',
              distance: 6,
              color: p.text,
              fontSize: 12,
              textBorderColor: p.dark ? '#1b1b1b' : '#ffffff',
              textBorderWidth: 2,
              formatter: (x: { dataIndex: number }) => '①②③④⑤'[x.dataIndex] ?? '',
            },
            data: points,
          },
        ],
      }
    },
  },

  /** 错题归因分布（示例） */
  'review-attribution': {
    height: '300px',
    caption:
      '一次模考 15 道错题的四类归因示例。若「时间不够」占比最大，该调时间分配而不是补知识。',
    aria: '错题归因分布示例：时间不够 6 道、知识盲区 4 道、审题偏差 3 道、计算失误 2 道',
    build: (p) =>
      donut(
        p,
        [
          { name: '时间不够', value: 6 },
          { name: '知识盲区', value: 4 },
          { name: '审题偏差', value: 3 },
          { name: '计算失误', value: 2 },
        ],
        { unit: '道', inner: '50%', outer: '72%' },
      ),
  },

  /* ───────────────── 02-常识判断 / 法律常识 ───────────────── */

  /** 刑责年龄时间线 */
  'legal-age': {
    height: '330px',
    caption:
      '横轴是真实年龄轴，每行的色块长度就是该年龄段的跨度——12–14 与 14–16 两段各只有 2 年，是最容易被命题人做手脚的地方。',
    aria: '刑事责任年龄：不满 12 周岁完全不负；12 至 14 周岁仅极端情形且需最高检核准追诉；14 至 16 周岁仅对八类罪负责；16 至 75 周岁完全负刑事责任；75 周岁以上故意犯罪可从轻或减轻',
    build: (p) => {
      const rows = [
        { name: '不满 12 周岁', start: 0, end: 12, color: p.series[4], desc: '完全不负刑事责任' },
        {
          name: '12–14 周岁',
          start: 12,
          end: 14,
          color: p.series[5],
          desc: '仅极端情形，且需最高检核准追诉',
        },
        {
          name: '14–16 周岁',
          start: 14,
          end: 16,
          color: p.series[1],
          desc: '仅对八类严重犯罪负责',
        },
        { name: '16–75 周岁', start: 16, end: 75, color: p.series[0], desc: '完全负刑事责任' },
        {
          name: '75 周岁以上',
          start: 75,
          end: 80,
          color: p.series[3],
          desc: '故意犯罪可从轻或减轻处罚',
        },
      ]
      return {
        tooltip: {
          ...tooltipItem(p),
          formatter: (x: { dataIndex: number }) => {
            const r = rows[x.dataIndex]
            return r ? `<b>${r.name}</b><br/>${r.desc}` : ''
          },
        },
        // 右侧留白给说明文字
        grid: grid({ left: 4, right: 150, top: 18 }),
        xAxis: valAxis(p, {
          name: '周岁',
          nameTextStyle: axisName(p),
          min: 0,
          max: 80,
          interval: 10,
        }),
        yAxis: catAxis(
          rows.map((r) => r.name),
          p,
          { inverse: true, axisLabel: { color: p.text, fontSize: 12 } },
        ),
        series: [
          {
            // 透明底段：把有色段推到它在年龄轴上的真实位置
            name: '__offset__',
            type: 'bar',
            stack: 'age',
            silent: true,
            barWidth: 16,
            itemStyle: { color: 'transparent' },
            data: rows.map((r) => r.start),
          },
          {
            name: '刑责年龄',
            type: 'bar',
            stack: 'age',
            barWidth: 16,
            data: rows.map((r) => ({
              value: r.end - r.start,
              itemStyle: { color: r.color, borderRadius: 2 },
            })),
            label: {
              show: true,
              position: 'right',
              distance: 8,
              color: p.text,
              fontSize: 11.5,
              formatter: (x: { dataIndex: number }) => rows[x.dataIndex].desc,
            },
          },
        ],
      }
    },
  },
}

export function getChart(name: string): ChartDef | undefined {
  return charts[name]
}

export function chartNames(): string[] {
  return Object.keys(charts)
}

export { palette }
