<script setup lang="ts">
/**
 * 首页工作台。
 *
 * 原来的首页是「六个等权重的目录卡」——能跳转，但不告诉你现在该干什么。
 * 这个组件把它改成一张作战板，回答三个问题：
 *   1. 还剩多少时间（精确到秒）；
 *   2. 六块里哪些是主攻、哪些是取舍（角色徽章 + 按权重排序）；
 *   3. 这一周先动什么、下一个硬节点是什么。
 *
 * 数据来源：09-套卷记录（首考战绩）+ 备考总览（目标与下一步）。
 * 站点是纯静态的，这些数字跟着笔记一起改，不联网。
 *
 * SSG 注意：所有和时间有关的取值都延迟到 onMounted，服务端只渲染占位符，
 * 否则构建产物里的时间戳和客户端对不上，Vue 会报 hydration mismatch。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

const EXAM_AT = new Date('2026-11-29T09:00:00+08:00').getTime()
const WEEKDAY = ['日', '一', '二', '三', '四', '五', '六']

type Tone = 'main' | 'warn' | 'good' | 'info' | 'mute'

interface ModuleRow {
  name: string
  count: number
  role: string
  tone: Tone
  /** 首考战绩 */
  score: string
  /** 下一步动作 */
  next: string
  href: string
}

/** 按得分权重排序：主攻 → 短板 → 优势 → 补课 → 碎片 → 取舍 */
const modules: ModuleRow[] = [
  {
    name: '资料分析',
    count: 20,
    role: '主攻',
    tone: 'main',
    score: '首考 20/20 · 比大盘 +30.8 · 均时 92 秒',
    next: '限时 25 分钟，练到 45 秒/题',
    href: '/06-资料分析/资料总览',
  },
  {
    name: '判断推理',
    count: 35,
    role: '短板',
    tone: 'warn',
    score: '首考 24/35 · −2.1，全卷唯一跑输大盘',
    next: '图形推理 50 秒硬止损，专项突破',
    href: '/05-判断推理/判断总览',
  },
  {
    name: '言语理解',
    count: 30,
    role: '优势',
    tone: 'good',
    score: '首考 26/30 · 比大盘 +19.3',
    next: '固化为可复现方法，主攻提速',
    href: '/03-言语理解/言语总览',
  },
  {
    name: '政治理论',
    count: 20,
    role: '补课',
    tone: 'info',
    score: '首考 12/20 · 比大盘 +5.8 · 课程未重看',
    next: '6 节全部重看，10-06 前收口',
    href: '/01-政治理论/政治理论总览',
  },
  {
    name: '常识判断',
    count: 15,
    role: '碎片',
    tone: 'mute',
    score: '首考 6/15 · 比大盘 +4.5',
    next: '碎片时段积累，法律优先',
    href: '/02-常识判断/常识总览',
  },
  {
    name: '数量关系',
    count: 15,
    role: '取舍',
    tone: 'mute',
    score: '首考全蒙 C，6/15',
    next: '仍不先补，维持取舍策略',
    href: '/04-数量关系/数量总览',
  },
]

/** 申论不在行测六模块里，单独一行——它是另一条独立的线 */
const essay: ModuleRow = {
  name: '申论',
  count: 100,
  role: '待启动',
  tone: 'info',
  score: '仅看过 2 节单一题，写过 2 道配套小题（有批改）',
  next: '课程 10-18 前看完，每周 1 道实写',
  href: '/07-申论/申论总览',
}

const focus = [
  {
    t: '修配速',
    d: '首考 119.9 分钟压线，问题不在做不完而在内部分配：资料 +5.8′、判断 +3.0′ 把数量挤成 1.1 分钟。资料分析压进 25 分钟，图形推理 50 秒硬止损。',
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

/** 硬节点。at 写成 YYYY-MM-DD，用本地零点算剩余天数，避免时区偏移 */
const nodes = [
  { at: '2026-10-15', label: '报名开始', note: '当天复核职位表' },
  { at: '2026-11-01', label: '网上缴费', note: '' },
  { at: '2026-11-24', label: '打印准考证', note: '当天起年假冲刺' },
  { at: '2026-11-29', label: '笔试（以公告为准）', note: '' },
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

/** 距笔试：天数单独放大，时分秒跟在下面一起走 */
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
    <!-- ── 计时 + 目标刻度 ──────────────────────────────────────── -->
    <section class="gk-clock" aria-label="时间与目标">
      <div class="gk-clock__grid">
        <div class="gk-clock__cell">
          <p class="gk-clock__k">距 2027 国考笔试</p>
          <p class="gk-clock__v">
            {{ countdown.days }}<small>天</small>
          </p>
          <p class="gk-clock__sub">{{ countdown.hms }}</p>
        </div>
        <div class="gk-clock__cell">
          <p class="gk-clock__k">现在</p>
          <p class="gk-clock__v gk-clock__v--time">{{ clock }}</p>
          <p class="gk-clock__sub">{{ today }}</p>
        </div>
      </div>

      <ul class="gk-goals">
        <li>
          <span class="gk-goals__k">行测首考 · 估分</span>
          <span class="gk-goals__v">70.8<span>分</span></span>
        </li>
        <li>
          <span class="gk-goals__k">行测首考 · 扣蒙对</span>
          <span class="gk-goals__v gk-goals__v--main">68<span>分</span></span>
        </li>
        <li>
          <span class="gk-goals__k">总分 · 达标</span>
          <span class="gk-goals__v">130<span>分</span></span>
        </li>
        <li>
          <span class="gk-goals__k">总分 · 保底</span>
          <span class="gk-goals__v">118<span>分</span></span>
        </li>
      </ul>
    </section>

    <!-- ── 行测六模块作战板 ─────────────────────────────────────── -->
    <h2 class="gk-sec">
      行测六模块
      <span class="gk-sec__hint">按得分权重排序 · 首考 2026 年度副省级卷</span>
    </h2>

    <ul class="gk-board">
      <li v-for="m in modules" :key="m.name">
        <a class="gk-mod" :href="withBase(m.href)">
          <span class="gk-mod__head">
            <span class="gk-mod__name">{{ m.name }}</span>
            <span class="gk-mod__n">{{ m.count }} 题</span>
            <span class="gk-role" :class="`gk-role--${m.tone}`">{{ m.role }}</span>
          </span>
          <span class="gk-mod__score">{{ m.score }}</span>
          <span class="gk-mod__next">{{ m.next }}</span>
        </a>
      </li>
    </ul>

    <h2 class="gk-sec">申论</h2>

    <ul class="gk-board gk-board--single">
      <li>
        <a class="gk-mod gk-mod--row" :href="withBase(essay.href)">
          <span class="gk-mod__head">
            <span class="gk-mod__name">{{ essay.name }}</span>
            <span class="gk-mod__n">100 分</span>
            <span class="gk-role" :class="`gk-role--${essay.tone}`">{{ essay.role }}</span>
          </span>
          <span class="gk-mod__score">{{ essay.score }}</span>
          <span class="gk-mod__next">{{ essay.next }}</span>
        </a>
      </li>
    </ul>

    <!-- ── 推进线 + 硬节点 ─────────────────────────────────────── -->
    <div class="gk-cols">
      <div>
        <h2 class="gk-sec gk-sec--flush">本周重点</h2>
        <ul class="gk-focus">
          <li v-for="(f, i) in focus" :key="f.t">
            <span class="gk-focus__idx">{{ i + 1 }}</span>
            <span class="gk-focus__body">
              <span class="gk-focus__t">{{ f.t }}</span>
              <span class="gk-focus__d">{{ f.d }}</span>
            </span>
          </li>
        </ul>
      </div>

      <div>
        <h2 class="gk-sec gk-sec--flush">关键节点</h2>
        <ul class="gk-nodes">
          <li
            v-for="(n, i) in nodeRows"
            :key="n.at"
            :class="{ 'is-next': i === nextIndex }"
          >
            <span class="gk-node__date">{{ n.short }}</span>
            <span class="gk-node__label">{{ n.label }}</span>
            <span v-if="n.note" class="gk-node__note">{{ n.note }}</span>
            <span v-if="i === nextIndex && n.left !== null" class="gk-node__rest">
              还剩 {{ n.left }} 天
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
