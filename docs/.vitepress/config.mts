import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: '考公笔记',
  description: '国考副省级备考速查站 · 行测六模块 + 申论，只留考场用得上的',
  base: '/gwy/',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['meta', { name: 'theme-color', content: '#8c1f28' }],
    ['meta', { name: 'description', content: '国考副省级备考速查站：行测六模块速查卡 + 申论方法框架' }]
  ],

  themeConfig: {
    siteTitle: '考公笔记',

    nav: [
      { text: '首页', link: '/' },
      { text: '总览', link: '/00-总览/备考总览' },
      {
        text: '行测',
        items: [
          { text: '政治理论 20 题', link: '/01-政治理论/政治理论总览' },
          { text: '常识判断 15 题', link: '/02-常识判断/常识总览' },
          { text: '言语理解 30 题', link: '/03-言语理解/言语总览' },
          { text: '数量关系 15 题', link: '/04-数量关系/数量总览' },
          { text: '判断推理 35 题', link: '/05-判断推理/判断总览' },
          { text: '资料分析 20 题', link: '/06-资料分析/资料总览' }
        ]
      },
      { text: '申论', link: '/07-申论/申论总览' },
      { text: '工具', link: '/08-工具/遗忘曲线排期' }
    ],

    sidebar: [
      {
        text: '总览',
        collapsed: false,
        items: [
          { text: '备考总览', link: '/00-总览/备考总览' },
          { text: '行测战略地图', link: '/00-总览/行测战略地图' },
          { text: '模考复盘法', link: '/00-总览/模考复盘法' }
        ]
      },
      {
        text: '政治理论 · 20 题',
        collapsed: true,
        items: [
          { text: '模块总览', link: '/01-政治理论/政治理论总览' },
          { text: '马原速查', link: '/01-政治理论/马原速查' },
          { text: '中特与习思想', link: '/01-政治理论/中特与习思想' },
          { text: '时政与挖坑规律', link: '/01-政治理论/时政与陷阱' }
        ]
      },
      {
        text: '常识判断 · 15 题',
        collapsed: true,
        items: [
          { text: '模块总览', link: '/02-常识判断/常识总览' },
          { text: '法律常识', link: '/02-常识判断/法律常识' },
          { text: '人文历史', link: '/02-常识判断/人文历史' },
          { text: '科技 · 地理 · 经济', link: '/02-常识判断/科技地理经济' }
        ]
      },
      {
        text: '言语理解 · 30 题',
        collapsed: true,
        items: [
          { text: '模块总览', link: '/03-言语理解/言语总览' },
          { text: '逻辑填空', link: '/03-言语理解/逻辑填空' },
          { text: '片段阅读与语句表达', link: '/03-言语理解/片段阅读与语句表达' }
        ]
      },
      {
        text: '数量关系 · 15 题',
        collapsed: true,
        items: [
          { text: '模块总览', link: '/04-数量关系/数量总览' },
          { text: '十大题型速查', link: '/04-数量关系/十大题型速查' },
          { text: '考场取舍与猜题', link: '/04-数量关系/考场取舍与猜题' }
        ]
      },
      {
        text: '判断推理 · 35 题',
        collapsed: true,
        items: [
          { text: '模块总览', link: '/05-判断推理/判断总览' },
          { text: '图形推理', link: '/05-判断推理/图形推理' },
          { text: '定义判断与类比推理', link: '/05-判断推理/定义判断与类比推理' },
          { text: '逻辑判断', link: '/05-判断推理/逻辑判断' }
        ]
      },
      {
        text: '资料分析 · 20 题',
        collapsed: true,
        items: [
          { text: '模块总览', link: '/06-资料分析/资料总览' },
          { text: '核心概念与公式', link: '/06-资料分析/核心概念与公式' },
          { text: '速算五法', link: '/06-资料分析/速算五法' },
          { text: '陷阱清单', link: '/06-资料分析/陷阱清单' }
        ]
      },
      {
        text: '申论',
        collapsed: true,
        items: [
          { text: '模块总览', link: '/07-申论/申论总览' },
          { text: '单一题与综合题', link: '/07-申论/单一题与综合题' },
          { text: '公文题', link: '/07-申论/公文题' },
          { text: '文章写作', link: '/07-申论/文章写作' }
        ]
      },
      {
        text: '工具',
        collapsed: true,
        items: [
          { text: '遗忘曲线排期', link: '/08-工具/遗忘曲线排期' },
          { text: '错题归因表', link: '/08-工具/错题归因表' }
        ]
      }
    ],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索笔记', buttonAriaLabel: '搜索笔记' },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除查询条件',
            backButtonTitle: '返回',
            noResultsText: '没有找到相关结果',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },

    outline: { level: [2, 3], label: '本页导航' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: {
      text: '最后更新',
      formatOptions: { dateStyle: 'short', timeStyle: 'short' }
    },
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '回到顶部',
    externalLinkIcon: true,
    footer: {
      message: '个人备考速查笔记 · 内容持续更新',
      copyright: '仅供个人学习使用'
    }
  }
})
