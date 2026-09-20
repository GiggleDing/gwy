---
layout: home

hero:
  name: 考公笔记
  text: 国考副省级备考速查站
  tagline: 行测 135 题 · 六模块速查卡 —— 只留考场用得上的
  actions:
    - theme: brand
      text: 行测战略地图
      link: /00-总览/行测战略地图
    - theme: alt
      text: 资料分析速算五法
      link: /06-资料分析/速算五法

features:
  - title: 政治理论 · 20 题
    details: 五大板块加四类挖坑规律。2025 年独立成第六模块，单题权重高于常识，是性价比洼地。
  - title: 资料分析 · 20 题
    details: 三大高频考点占八成，五大速算法覆盖全部计算。唯一"学了就能拿分"的模块。
  - title: 判断推理 · 35 题
    details: 图形看元素组成，逻辑记翻译规则。规律数量有限，记熟即秒杀。
  - title: 言语理解 · 30 题
    details: 逻辑填空靠对应关系，片段阅读靠行文脉络。拒绝语感，靠可复现的方法。
  - title: 数量关系 · 15 题
    details: 十大题型加 30 秒决策法则。先学会"哪些题不做"，比学会做题更重要。
  - title: 常识判断 · 15 题
    details: 法律优先，人文科技次之。只保留可积累、可复现的考点，不赌运气。
---

<div class="gk-home">
  <div class="gk-cd">
    <div class="lbl">距 2027 国考笔试</div>
    <div class="num"><span id="gk-days">--</span><small>天</small></div>
    <div class="note">笔试日期以官方公告为准 · 报考岗位为副省级综合管理类卷</div>
  </div>
</div>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const el = document.getElementById('gk-days')
  if (!el) return
  const target = new Date('2026-11-29T09:00:00+08:00').getTime()
  const left = Math.ceil((target - Date.now()) / 86400000)
  el.textContent = left > 0 ? String(left) : '0'
})
</script>
