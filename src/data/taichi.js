/**
 * Workplace Tai-Chi & Blame Shifting Database
 */

export const TAICHI_SCENARIOS = [
  {
    id: 'urgent_hotfix',
    opponent: '高级产品经理阿强',
    title: '下班突袭提需',
    avatar: '👓',
    dialogue: '“李哥！核心交易链路在大促前夕有个紧急体验优化，下班前务必帮忙热更合入主干！”',
    cards: [
      {
        id: 'tech_freeze',
        text: '🛡️ “根据技术委员会《周五封板发布准则》，17:00后禁止高危发版以防引发P0，已排期至周一首发”',
        score: 95,
        type: 'perfect',
        feedback: '搬出全司红头技术安全规范，以最高合规标准降维制裁！阿强无言以对连连道歉！'
      },
      {
        id: 'arch_dep',
        text: '🔄 “该链路依赖中台统一契约升级，目前正由架构组专家联合评审中，建议先找架构师对齐”',
        score: 90,
        type: 'perfect',
        feedback: '祸水东引给高深莫测的中台架构组，阿强瞬间被跨部门协同流程劝退！'
      },
      {
        id: 'oa_ticket',
        text: '📋 “请业务方先在OA发起正式紧急需求立项，抄送阎总和技术VP审批后，我们立即敏捷拉通”',
        score: 80,
        type: 'pass',
        feedback: '用高管审批流程施压，阿强深知阎总脾气，悻悻地收起了需求文档。'
      },
      {
        id: 'emotional_refuse',
        text: '💥 “我马上就要打卡下班了，这功能之前不是好好的吗？你别瞎提需求了！”',
        score: 25,
        type: 'fail',
        feedback: '情绪化硬怼引发走廊争吵，阿强当场拉住你声泪俱下，引来路过高管侧目！'
      }
    ]
  },
  {
    id: 'qps_outage',
    opponent: '业务运维VP',
    title: '生产指标质询',
    avatar: '👔',
    dialogue: '“小李！上周五线上微服务集群偶发QPS抖动，你的团队为什么至今没有产出根因分析报告？”',
    cards: [
      {
        id: 'cloud_sla',
        text: '🌩️ “根因已查明为底层第三方公有云机房网络抖动，我们正向云厂商严正索赔SLA损失，复盘文档在第38页”',
        score: 96,
        type: 'perfect',
        feedback: '将不可抗力黑锅直接甩给第三方云巨头，且附带专业SLA索赔，VP深表敬佩并掏出手机转发！'
      },
      {
        id: 'deep_refactor',
        text: '🏗️ “我们正在推进新一代服务网格解耦与断路器熔断重构，长效沉淀在核心高可用护城河中”',
        score: 90,
        type: 'perfect',
        feedback: '硬核架构黑话连环轰炸，VP听得频频颔首，认为你在默默做大事！'
      },
      {
        id: 'data_pipeline',
        text: '📊 “监控指标与全链路调用链正在通过告警中心聚合，周一拉通全员复盘会”',
        score: 80,
        type: 'pass',
        feedback: '常规太极推诿，VP点点头：“周一早会我要看到数据。”'
      },
      {
        id: 'deny_all',
        text: '💥 “那台服务器根本不是我管的，谁配的谁去写，别找我！”',
        score: 20,
        type: 'fail',
        feedback: '极度不专业的推脱，VP脸色瞬间铁青，当场拿出记事本记下了你的工号！'
      }
    ]
  },
  {
    id: 'culture_exam',
    opponent: 'HR总监刘姐',
    title: '价值观大考盘问',
    avatar: '👠',
    dialogue: '“小李啊，这季度的组织健康度问卷和十二字企业文化线上大考，怎么全部门就差你一个人了？”',
    cards: [
      {
        id: 'code_culture',
        text: '⚖️ “刘姐！我正把公司的十二字价值观写进每一行代码注释与单元测试中，让企业文化形成底层技术闭环！”',
        score: 95,
        type: 'perfect',
        feedback: '政治觉悟直接拉满！把企业文化升华到代码层，刘姐感动得眼眶泛红！'
      },
      {
        id: 'deep_reflection',
        text: '📝 “我准备结合本季度业务体感写一篇两万字的深刻思想汇报，下周一交到政委办公室”',
        score: 90,
        type: 'perfect',
        feedback: '反客为主主动画大饼，刘姐喜笑颜开连连夸奖“这才是骨干悟性”！'
      },
      {
        id: 'network_issue',
        text: '🌐 “系统提交接口刚才出现网关超时，我已经截图报修IT小哥，稍后网络通畅立刻提交”',
        score: 80,
        type: 'pass',
        feedback: '合理利用技术故障借口，刘姐宽容地放你离开。'
      },
      {
        id: 'rebel_attitude',
        text: '💥 “天天搞这些花架子形式主义，业务都做不完了哪有闲工夫答这种脑残题！”',
        score: 15,
        type: 'fail',
        feedback: '当众开大轰炸政委！刘姐笑容瞬间凝固，直接判定为企业文化红线违纪！'
      }
    ]
  },
  {
    id: 'okr_targets',
    opponent: '大Boss阎总',
    title: '降本增效拷问',
    avatar: '👑',
    dialogue: '“小李，全司下半年降本增效攻坚战，你们技术中台的具体抓手和差异化打法是什么？”',
    cards: [
      {
        id: 'server_downsizing',
        text: '📉 “我们通过容器化缩容与Spot竞价实例优化，已为公司节约32%计算成本，详细账单已抄送总裁办”',
        score: 98,
        type: 'perfect',
        feedback: '直接把真金白银省钱数据拍在阎总眼前！阎总大喜过望，亲切拍了拍你的肩膀！'
      },
      {
        id: 'framework_empower',
        text: '🔄 “通过自动化脚手架与低代码平台赋能前端，提升全链路研发吞吐量200%”',
        score: 90,
        type: 'perfect',
        feedback: '高维赋能黑话无懈可击，阎总满意地点头：“继续保持战略定力！”'
      },
      {
        id: 'weekly_doc',
        text: '📁 “已在三季度战略对齐飞书文档第42页全面拉通，欢迎领导随时批示”',
        score: 80,
        type: 'pass',
        feedback: '将问题踢回文档，阎总表示会后仔细查阅。'
      },
      {
        id: 'clueless',
        text: '💥 “啊？降本增效？我们每天加班到十点，再降成本服务器都要被关机了！”',
        score: 20,
        type: 'fail',
        feedback: '负能量发言当场激怒大Boss，阎总当即指示今晚全组留下来整顿风气！'
      }
    ]
  }
];

export function getRandomTaiChiScenario() {
  return TAICHI_SCENARIOS[Math.floor(Math.random() * TAICHI_SCENARIOS.length)];
}
