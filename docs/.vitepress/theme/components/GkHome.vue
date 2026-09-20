<script setup lang="ts">
/**
 * 首页 · 精修版
 *
 * 设计口径（方案甲）：
 *   · 骨架、卡片语言、圆角半径全部沿用 VitePress，只精修层级、节奏与字重
 *   · 只留朱红一个强调色；模块角色靠「文字 + 三档明度」区分，不做六色徽章
 *   · 分隔一律用 1px 细线，不堆边框、不加虚线、不加投影
 *
 * 目标口径（两层标准）：
 *   · 总分 / 行测 / 申论 三层目标取自「备考总览」，保底与冲刺是两端标准
 *   · 模块级两档目标由同一口径推出：保底 = 达标 × 62/68、冲刺 = 达标 × 73/68，
 *     其中「达标」是备考总览里已经写死的模块目标正确率（政治 80 / 常识 55 /
 *     言语 75 / 判断 75 / 资料 85，数量关系只做 3–5 题、不设目标）
 *   · 公式与推导同时写进「备考总览」，首页只做呈现
 *
 * 信息来自 09-套卷记录（首考战绩）与备考总览（目标、下一步）。
 *
 * SSG 注意：所有与当前时间有关的取值都延迟到 onMounted，服务端只渲染占位符，
 * 否则构建产物里的时间戳和客户端对不上，Vue 会报 hydration mismatch。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

const EXAM_AT = new Date('2026-11-29T09:00:00+08:00').getTime()
const WEEKDAY = ['日', '一', '二', '三', '四', '五', '六']

/** 角色的三档强调度：accent 现在就该动 / base 维持 / quiet 有意放着 */
type Role = 'accent' | 'base' | 'quiet'

interface Target {
  low: number
  high: number
  unit: string
}

interface ModuleRow {
  name: string
  count: string
  role: string
  tone: Role
  /** 两档目标；数量关系有意不设 */
  target: Target | null
  /** 首考战绩 */
  score: string
  /** 下一步动作 */
  next: string
  href: string
}

/** 三层目标（总分口径）。保底与冲刺是两端标准，达标是中间那条主攻线 */
const targets = [
  { k: '总分', low: 118, mid: 130, high: 140 },
  { k: '行测', low: 62, mid: 68, high: 73 },
  { k: '申论', low: 56, mid: 62, high: 67 },
]

/** 按得分权重排序：主攻 → 短板 → 优势 → 补课 → 碎片 → 取舍 */
const modules: ModuleRow[] = [
  {
    name: '资料分析',
    count: '20 题',
    role: '主攻',
    tone: 'accent',
    target: { low: 78, high: 91, unit: '%' },
    score: '20/20 · 比大盘 +30.8 · 均时 92 秒',
    next: '限时 25 分钟，练到 45 秒/题',
    href: '/06-资料分析/资料总览',
  },
  {
    name: '判断推理',
    count: '35 题',
    role: '短板',
    tone: 'accent',
    target: { low: 68, high: 81, unit: '%' },
    score: '24/35 · −2.1，全卷唯一跑输大盘',
    next: '图形推理 50 秒硬止损，专项突破',
    href: '/05-判断推理/判断总览',
  },
  {
    name: '言语理解',
    count: '30 题',
    role: '优势',
    tone: 'base',
    target: { low: 68, high: 81, unit: '%' },
    score: '26/30 · 比大盘 +19.3',
    next: '固化为可复现方法，主攻提速',
    href: '/03-言语理解/言语总览',
  },
  {
    name: '政治理论',
    count: '20 题',
    role: '补课',
    tone: 'base',
    target: { low: 73, high: 86, unit: '%' },
    score: '12/20 · 比大盘 +5.8 · 课程未重看',
    next: '6 节全部重看，10-06 前收口',
    href: '/01-政治理论/政治理论总览',
  },
  {
    name: '常识判断',
    count: '15 题',
    role: '碎片',
    tone: 'quiet',
    target: { low: 50, high: 59, unit: '%' },
    score: '6/15 · 比大盘 +4.5',
    next: '碎片时段积累，法律优先',
    href: '/02-常识判断/常识总览',
  },
  {
    name: '数量关系',
    count: '15 题',
    role: '取舍',
    tone: 'quiet',
    target: null,
    score: '全蒙 C，6/15',
    next: '仍不先补，维持取舍策略',
    href: '/04-数量关系/数量总览',
  },
]

/** 申论不在行测六模块里，单独一行——它是另一条独立的线 */
const essay: ModuleRow = {
  name: '申论',
  count: '100 分',
  role: '待启动',
  tone: 'base',
  target: { low: 56, high: 67, unit: ' 分' },
  score: '仅看过 2 节单一题，写过 2 道配套小题（有批改）',
  next: '课程 10-18 前看完，每周 1 道实写',
  href: '/07-申论/申论总览',
}

/** 当前推进的三条线。第一条是 09-19 首考复盘的唯一改进项 */
const focus = [
  {
    t: '修配速',
    d: '首考 119.9 分钟压线，问题不在做不完而在内部分配——资料 +5.8′、判断 +3.0′ 把数量挤成 1.1 分钟。资料分析压进 25 分钟，图形推理 50 秒硬止损。',
  },
  {
    t: '资料分析题型闭环',
    d: '抽题分型 → 不限时精做（识别用时 / 计算用时 分段计时）→ 归纳方法卡 → 用预留的三成题限时验证。',
  },
  {
    t: '政治理论 6 节重看',
    d: '只能晚上学、每次不超过 1 小时，每节拆两次，共 12 个晚上，10-06 前收口。',
  },
]

/** 硬节点。at 写成 YYYY-MM-DD，用本地零点算剩余天数，避免被当 UTC 解析 */
const nodes = [
  { at: '2026-10-15', label: '报名开始', note: '当天复核职位表' },
  { at: '2026-11-01', label: '网上缴费', note: '' },
  { at: '2026-11-24', label: '打印准考证', note: '当天起年假冲刺' },
  { at: '2026-11-29', label: '笔试', note: '日期以官方公告为准' },
]

const now = ref<number | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  now.value = Date.now()
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  timer = null
})

const pad = (n: number) => String(n).padStart(2, '0')

/** 当前时间，精确到秒 */
const clock = computed(() => {
  if (now.value === null) return '--:--:--'
  const d = new Date(now.value)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
})

const today = computed(() => {
  if (now.value === null) return '——'
  const d = new Date(now.value)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} 星期${WEEKDAY[d.getDay()]}`
})

/** 距笔试：天数用大字号撑住，时分秒跟在大数字基线上一起走 */
const countdown = computed(() => {
  if (now.value === null) return { days: '--', hms: '--:--:--' }
  const diff = EXAM_AT - now.value
  if (diff <= 0) return { days: '0', hms: '已开考' }
  const days = Math.floor(diff / 86400000)
  const rest = diff - days * 86400000
  return {
    days: String(days),
    hms: `${pad(Math.floor(rest / 3600000))}:${pad(Math.floor((rest % 3600000) / 60000))}:${pad(
      Math.floor((rest % 60000) / 1000),
    )}`,
  }
})

/** 本地零点时间戳，用来算「还剩几天」 */
const midnight = (y: number, m: number, d: number) => new Date(y, m - 1, d).getTime()

const nodeRows = computed(() => {
  const base =
    now.value === null
      ? null
      : (() => {
          const d = new Date(now.value as number)
          return midnight(d.getFullYear(), d.getMonth() + 1, d.getDate())
        })()

  return nodes.map((n) => {
    const [y, m, d] = n.at.split('-').map(Number)
    const left = base === null ? null : Math.round((midnight(y, m, d) - base) / 86400000)
    return { ...n, short: `${pad(m)}/${pad(d)}`, left }
  })
})

/** 第一个还没到的节点点亮，其余保持静默 */
const nextIndex = computed(() => nodeRows.value.findIndex((n) => n.left !== null && n.left >= 0))
</script>

<template>
  <div class="gk-home">
    <!-- ── 时间 ──────────────────────────────────────────────────── -->
    <section class="gk-clock" aria-label="时间">
      <div class="gk-clock__row">
        <div>
          <p class="gk-clock__k">距 2027 国考笔试</p>
          <p class="gk-clock__days">
            {{ countdown.days }}<em>天</em><b>{{ countdown.hms }}</b>
          </p>
        </div>
        <div>
          <p class="gk-clock__k">现在</p>
          <p class="gk-clock__now">{{ clock }}</p>
          <p class="gk-clock__meta">{{ today }}</p>
        </div>
      </div>

      <!-- ── 三层目标：保底与冲刺是两端标准 ──────────────────────── -->
      <table class="gk-targets" aria-label="总分、行测、申论的保底、达标与冲刺目标">
        <thead>
          <tr>
            <th scope="col">科目</th>
            <th scope="col">保底</th>
            <th scope="col">达标</th>
            <th scope="col">冲刺</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in targets" :key="t.k">
            <th scope="row">{{ t.k }}</th>
            <td>{{ t.low }}</td>
            <td>{{ t.mid }}</td>
            <td class="is-sprint">{{ t.high }}</td>
          </tr>
        </tbody>
      </table>

      <p class="gk-targets__foot">
        首考（2026 年度副省级卷）行测估分 <b>70.8</b>，扣掉数量关系蒙对的题后约
        <b class="is-accent">68</b>，正卡在达标线上。
      </p>
    </section>

    <!-- ── 行测六模块 ────────────────────────────────────────────── -->
    <h2 class="gk-sec">
      行测六模块
      <span class="gk-sec__hint">按得分权重排序 · 目标正确率两档，战绩为 2026 年度副省级卷首考</span>
    </h2>

    <ul class="gk-board">
      <li v-for="m in modules" :key="m.name">
        <a class="gk-mod" :href="withBase(m.href)">
          <span class="gk-mod__top">
            <span class="gk-mod__name">{{ m.name }}</span>
            <span class="gk-mod__count">{{ m.count }}</span>
          </span>
          <span class="gk-mod__role" :class="`is-${m.tone}`">{{ m.role }}</span>
          <span class="gk-mod__body">
            <span class="gk-mod__row">
              <span class="gk-mod__lb">目标</span>
              <span class="gk-mod__vl">
                <template v-if="m.target">
                  保底 <b>{{ m.target.low }}{{ m.target.unit }}</b> · 冲刺
                  <b class="is-sprint">{{ m.target.high }}{{ m.target.unit }}</b>
                </template>
                <template v-else>维持取舍，不设正确率目标</template>
              </span>
            </span>
            <span class="gk-mod__row">
              <span class="gk-mod__lb">首考</span>
              <span class="gk-mod__vl">{{ m.score }}</span>
            </span>
            <span class="gk-mod__row">
              <span class="gk-mod__lb">下一步</span>
              <span class="gk-mod__vl gk-mod__vl--next">{{ m.next }}</span>
            </span>
          </span>
        </a>
      </li>
    </ul>

    <ul class="gk-board gk-board--single">
      <li>
        <a class="gk-mod gk-mod--row" :href="withBase(essay.href)">
          <span class="gk-mod__top">
            <span class="gk-mod__name">{{ essay.name }}</span>
            <span class="gk-mod__count">{{ essay.count }}</span>
          </span>
          <span class="gk-mod__role" :class="`is-${essay.tone}`">{{ essay.role }}</span>
          <span class="gk-mod__body">
            <span class="gk-mod__row">
              <span class="gk-mod__lb">目标</span>
              <span class="gk-mod__vl">
                保底 <b>{{ essay.target?.low }}{{ essay.target?.unit }}</b> · 冲刺
                <b class="is-sprint">{{ essay.target?.high }}{{ essay.target?.unit }}</b>
              </span>
            </span>
            <span class="gk-mod__row">
              <span class="gk-mod__lb">现状</span>
              <span class="gk-mod__vl">{{ essay.score }}</span>
            </span>
            <span class="gk-mod__row">
              <span class="gk-mod__lb">下一步</span>
              <span class="gk-mod__vl gk-mod__vl--next">{{ essay.next }}</span>
            </span>
          </span>
        </a>
      </li>
    </ul>

    <!-- ── 推进线 + 硬节点 ───────────────────────────────────────── -->
    <div class="gk-cols">
      <section>
        <h2 class="gk-sec gk-sec--flush">当前推进</h2>
        <ol class="gk-steps">
          <li v-for="(f, i) in focus" :key="f.t">
            <span class="gk-steps__no">{{ pad(i + 1) }}</span>
            <span class="gk-steps__body">
              <span class="gk-steps__t">{{ f.t }}</span>
              <span class="gk-steps__d">{{ f.d }}</span>
            </span>
          </li>
        </ol>
      </section>

      <section>
        <h2 class="gk-sec gk-sec--flush">关键节点</h2>
        <ul class="gk-nodes">
          <li v-for="(n, i) in nodeRows" :key="n.at" :class="{ 'is-next': i === nextIndex }">
            <span class="gk-nodes__date">{{ n.short }}</span>
            <span class="gk-nodes__label">{{ n.label }}</span>
            <span v-if="n.note" class="gk-nodes__note">{{ n.note }}</span>
            <span v-if="i === nextIndex && n.left !== null" class="gk-nodes__left">
              还剩 {{ n.left }} 天
            </span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
