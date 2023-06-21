/*

 @name    : 锅巴汉化 - Web汉化插件
 @author  : 麦子、JAR、小蓝、好阳光的小锅巴
 @version : V0.6.1 - 2019-07-09
 @website : http://www.g8hh.com
 @idle games : http://www.gityx.com
 @QQ Group : 627141737

*/

//1.汉化杂项
var cnItems = {
    _OTHER_: [],

    //未分类：
    'Save': '保存',
    'Export': '导出',
    'Import': '导入',
    'Settings': '设置',
    'Achievements': '成就',
    'Statistics': '统计',
    'Changelog': '更新日志',
    'Hotkeys': '快捷键',
    'ALL': '全部',
    'Default': '默认',
    'AUTO': '自动',
    'default': '默认',
    "points": "点数",
    "Reset for +": "重置得到 + ",
    "Currently": "当前",
    "Effect": "效果",
    "Cost": "成本",
    "Goal:": "目标:",
    "Reward": "奖励",
    "Start": "开始",
    "Exit Early": "提前退出",
    "Finish": "完成",
    "Milestone Gotten!": "获得里程碑！",
    "Milestones": "里程碑",
    "Completed": "已完成",
    "Default Save": "默认存档",
    "Delete": "删除",
    "No": "否",
    "Saves": "存档",
    "Options": "选项",
    "Yes": "是",
    "Are you sure?": "你确定吗？",
    "Edit Name": "编辑名称",
    "Info": "信息",
    "Currently:": "当前:",
    "Appearance": "外观",
    "How the game looks.": "游戏看起来如何。",
    "Theme": "主题",
    "Show milestones": "显示里程碑",
    "Show TPS meter at the bottom-left corner of the page.": "在页面左下角显示 TPS。",
    "Show TPS": "显示 TPS",
    "None": "无",
    "Align modifier units": "对齐概览单位",
    "Align numbers to the beginning of the unit in modifier view.": "在概览视图中将数字与单元的开头对齐。",
    "Select which milestones to display based on criterias.": "根据标准选择要显示的里程碑。",
    "All": "全部",
    "Classic": "经典",
    "Configurable": "可配置",
    "Duplicate": "复制",
    "A game by Alastor Game": "Alastor Game 的一款游戏",
    "Continue game": "继续游戏",
    "EcoClicker": "环保点击",
    "New game": "新游戏",
    "If the CO2 concentration goes below 230PPM, you're good for an Ice Age.": "如果 CO2 浓度低于 230PPM，则说明冰河时代已经到来。",
    "The number of growing trees is visible in a tooltip when hovering the top trees counter.": "将鼠标悬停在顶部树木计数器上时，工具提示中可以看到正在生长的树木数量。",
    "If the temperature anomaly exceed 3.5°C, you lose!": "如果温度异常超过 3.5°C，你就输了！",
    "Temperature lags 30 years behind CO2 concentration.": "温度滞后于 CO2 浓度 30 年。",
    "Trees take usually one year to grow enough to absorb CO2 and be chopped.": "树木通常需要一年才能长到足以吸收二氧化碳并被砍伐。",
    "The Eco dome wins you the game. But is that what you really want?": "生态圆顶为您赢得比赛。 但那是你真正想要的吗？",
    "Researches can significantly improve your clicks!": "研究可以显着提高您的点击次数！",
    "If the temperature anomaly pass under -6°C, you lose.": "如果温度异常低于-6°C，你就输了。",
    "If the CO2 concentration goes below 230PPM, you\'re good for an Ice Age.": "如果 CO2 浓度低于 230PPM，您就可以进入冰河时代。",
    "The big green button let you plant trees.": "绿色的大按钮让你种树。",
    'Air traffic ban': '航空交通禁令',
    'Blue Manager': '蓝色管理',
    'Carbon tax': '碳排放税',
    'Coal power ban': '煤电禁令',
    'Eco Click': '环保点击',
    'Eco dome': '生态圆顶',
    'Eco merchandise': '环保商品',
    'Emergency State': '紧急状态',
    'Forestry tech': '林业科技',
    'Fortune Click': '财富点击',
    'Free firewood': '免费木柴',
    'Free market': '自由市场',
    'Free-trade Zones': '自由贸易区',
    'Gas cars ban': '汽油车禁令',
    'GMOs': '转基因生物',
    'Gold Manager': '金币管理',
    'Harvest Tech': '收获技术',
    'Lobbying': '游说',
    'Meat cut act': '切肉行为',
    'Media Campaign': '媒体宣传',
    'National Parks': '国家公园',
    'Net of Stuff': '物网',
    'Permaculture': '永续农业',
    'Popular initiative': '热门举措',
    'Recycling act': '回收法案',
    'Sanctuaries': '保护区',
    'UBI': '',
    'XP Click': '经验点击',
    'Activist': '积极分子',
    'Advocate': '宣扬',
    'Arborist': '树艺师',
    'Delimber': '打枝机',
    'District Ranger': '护林员',
    'Florist': '花匠',
    'Forester': '护林人',
    'Gatherer': '采集者',
    'Grapple': '抓钩',
    'Harvester': '收割机',
    'Heavy delimber': '重型打枝机',
    'Helicopter': '直升机',
    'Lumberjack': '伐木工人',
    'Plane': '飞机',
    'Ranger': '巡游者',
    'Tree planter': '树播种机',
    "Absorbed (Your forest)": "吸收（你的森林）",
    "Anomaly": "异常",
    "big green button": "大绿色按钮",
    "Chop a tree": "砍一棵树",
    "Click the": "点击",
    "Difference": "不同之处",
    "Earth average": "地球平均值",
    "Emitted (Pollution)": "排放（污染）",
    "Metric tons/week": "公吨/周",
    "Plant a tree": "种一棵树",
    "Policies": "政策",
    "PPM/year": "PPM/年",
    "Research": "研究",
    "Temperature": "温度",
    "to start planting trees!": "开始植树！",
    "Total CO2 (Metric tons)": "二氧化碳总量（公吨）",
    "Total CO2 (PPM)": "二氧化碳总量 (PPM)",
    "Welcome to": "欢迎来到",
    "Workers": "工人",
    "Adopt policies": "采用政策",
    "At last, you can spend money on research, in order to improve your workers productivity, or even escape the game.": "最后，你可以花钱进行研究，以提高你的工人的生产力，甚至逃脱游戏。",
    "CO2": "二氧化碳",
    "Each time you plant a tree, or use other actions, you gain experience. Experience progress is visible at the top right of the screen.": "每次种树或使用其他动作时，您都会获得经验。 屏幕右上角可以看到体验进度。",
    "Get experience": "获得经验",
    "Get gold": "获得金币",
    "Good luck": "祝你好运",
    "Grown trees": "种植树木",
    "Happy new year (sort of)": "新年快乐（某种程度上）",
    "Hire workers": "雇佣工人",
    "How to save the world": "如何拯救世界",
    "It's 2021 now, and CO2 concentration is still increasing. We need more trees!!": "现在是 2021 年，CO2 浓度仍在增加。 我们需要更多的树！！",
    "It's quite simple: keep the temperature anomaly between -6°C and +3.5°C. Otherwise, it's the end of Humanity - it's game over.": "很简单：将温度异常保持在-6°C 和+3.5°C 之间。 否则，就是人类的末日——游戏结束了。",
    "Keep an eye on time": "注意时间",
    "Now that you're growing a forest, you need to save the world.": "现在你正在种植森林，你需要拯救世界。",
    "Now, we live in a capitalistic economy. You'll need money to save the world.": "现在，我们生活在资本主义经济中。 你需要钱来拯救世界。",
    "Once you have gold, you can hire workers, who will plant and chop trees for you.": "一旦你有了金子，你就可以雇佣工人，他们会为你植树和砍树。",
    "Science": "科学",
    "The current date is visible at the top right of the screen.": "当前日期显示在屏幕右上角。",
    "The journey begins": "旅程开始",
    "The number of grown trees appear at the top center. Continue planting trees...": "生长的树木数量出现在顶部中央。 继续植树……",
    "The ultimate journey": "终极旅程",
    "To get gold, just click the big yellow button once some trees are grown, to chop them down and sell them for gold.": "要获得金币，只需在种植一些树木后点击黄色的大按钮，将它们砍伐并出售以换取金币。",
    "Trees can help a lot to save humanity. Plant another tree...": "树木对拯救人类有很大帮助。 再种一棵树...",
    "Trees need time to grow": "树木需要时间才能成长",
    "Trees take one year to grow.": "树木需要一年才能长成。",
    "You can also adopt policies, that will bring various kind of improvements.": "您还可以采用政策，这将带来各种改进。",
    "You're on your own now. Thank you for saving the world!": "你现在靠自己了。 感谢您拯救世界！",
    "You've planted your first tree. You'll need a lot of trees. Plant another tree...": "你种下了第一棵树。 你需要很多树。 再种一棵树...",
    "Back to game": "返回游戏",
    "Florists like nature. Incidentally, 1 tree will grow every week.": "花店喜欢大自然。 顺便说一下，每周会长出一棵树。",
    "Improves each chopping click by 100%.": "将每次砍树点击提高 100%。",
    "Improves each planting click by 100%.": "将每次种树点击提高 100%。",
    "Main menu": "主菜单",
    "Not enough gold!": "金币不够！",
    "Sell some merch branded: \"Save the planet!\". CO2 emissions increased by 0.1%. 2 extra gold per week.": "出售一些带有“拯救地球！”品牌的商品。 二氧化碳排放量增加了 0.1%。 每周额外获得 2 金币。",
    "These guys visit the forest and gather firewood. 1 tree is chopped every week.": "这些家伙去森林里捡柴火。 每周砍伐一棵树。",
    "Master Planter": "种植大师",
    "New achievement:": "新成就：",
    "You've grown 1000 trees! We're getting serious...": "你种了 1000 棵树了！ 我们开始认真了...",
    "Boost planting with a Media Campaign. Increase workers planting rate by 10%.": "通过媒体宣传促进种植。 工人种植率提高 10%。",
    "Doubles level progress for each click.": "每次点击都会使等级进度加倍。",
    "Advocates are more powerfull than activists: they raise 400 gold per week!": "拥护者比活动家更有力量：他们每周筹集 400 金币！",
    "Each worker produces 0.01 XP every week.": "每个工人每周生产 0.01 XP。",
    "Freedom of getting firewood! Increase chop rate by 20%, increase CO2 emissions by 1%. 40 extra gold per week.": "自由取柴！ 将切碎率提高 20%，将 CO2 排放量提高 1%。 每周额外获得 40 金币。",
    "Huge trees die-off": "大树枯死",
    "Level up": "升级",
    "Lumberjacks are professionals who chop 100 trees every week.": "伐木工人是每周砍伐 100 棵树的专业人士。",
    "Lumberjacks are professionals who chop 120 trees every week.": "伐木工人是每周砍伐 120 棵树的专业人士。",
    "Protect the nature! Reduce chopping rate by 5%, decrease CO2 emissions by 1%.": "保护大自然！ 减少 5% 的砍伐率，减少 1% 的二氧化碳排放量。",
    "Senior Manager": "高级经理",
    "Workers plant 10% more trees.": "工人们多种植了 10% 的树木。",
    "You've hired 50 people to help you.": "你雇佣了 50 个人来帮助你。",
    "Game Over": "游戏结束",
    "Looks like you grilled us to death. Thank you for playing!": "看来你把我们烤死了。 谢谢你玩本游戏！",
    "Remember: Earth won't die. Humans will.": "记住：地球不会灭亡。 人类会。",
    "Please be reasonable for our children! Eat less meat, take public transportation when possible, don't buy what you don't need.": "请对我们的孩子讲道理！ 少吃肉，尽可能乘坐公共交通工具，不要买你不需要的东西。",
    "Plant a seed.": "种下一颗种子。",
    "Workers cost is reduced by 5%. Advocates and Activists raise 20% more money.": "工人成本降低了5%。支持者和活动家筹集的资金增加了20%。",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    // 图标代码，不能汉化
    "Jacorb's Games": "Jacorb's Games",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "By Jacorb90": "By Jacorb90",
    "content_copy": "content_copy",
    "library_books": "library_books",
    "discord": "discord",
    "drag_handle": "drag_handle",
    "edit": "edit",
    "forum": "forum",
    "content_paste": "content_paste",
    "delete": "delete",
    "info": "info",
    "settings": "settings",

    //树游戏
    'Loading...': '加载中...',
    'ALWAYS': '一直',
    'HARD RESET': '硬重置',
    'Export to clipboard': '导出到剪切板',
    'INCOMPLETE': '不完整',
    'HIDDEN': '隐藏',
    'AUTOMATION': '自动',
    'NEVER': '从不',
    'ON': '打开',
    'OFF': '关闭',
    'SHOWN': '显示',
    'Play Again': '再次游戏',
    'Keep Going': '继续',
    'The Modding Tree Discord': '模型树Discord',
    'You have': '你有',
    'It took you {{formatTime(player.timePlayed)}} to beat the game.': '花费了 {{formatTime(player.timePlayed)}} 时间去通关游戏.',
    'Congratulations! You have reached the end and beaten this game, but for now...': '恭喜你！ 您已经结束并通关了本游戏，但就目前而言...',
    'Main Prestige Tree server': '主声望树服务器',
    'Reach {{formatWhole(ENDGAME)}} to beat the game!': '达到 {{formatWhole(ENDGAME)}} 去通关游戏!',
    "Loading... (If this takes too long it means there was a serious error!": "正在加载...（如果这花费的时间太长，则表示存在严重错误！",
    'Loading... (If this takes too long it means there was a serious error!)←': '正在加载...（如果时间太长，则表示存在严重错误！）←',
    'Main\n\t\t\t\tPrestige Tree server': '主\n\t\t\t\t声望树服务器',
    'The Modding Tree\n\t\t\t\t\t\t\tDiscord': '模型树\n\t\t\t\t\t\t\tDiscord',
    'Please check the Discord to see if there are new content updates!': '请检查 Discord 以查看是否有新的内容更新！',
    'aqua': '水色',
    'AUTOMATION, INCOMPLETE': '自动化，不完整',
    'LAST, AUTO, INCOMPLETE': '最后，自动，不完整',
    'NONE': '无',
    'P: Reset for': 'P: 重置获得',
    'Git游戏': 'Git游戏',
    'QQ群号': 'QQ群号',
    'x': 'x',
    'QQ群号:': 'QQ群号:',
    '* 启用后台游戏': '* 启用后台游戏',
    '更多同类游戏:': '更多同类游戏:',
    'I': 'I',
    'II': 'I',
    'III': 'III',
    'IV': 'IV',
    'V': 'V',
    'VI': 'VI',
    'VII': 'VII',
    'VIII': 'VIII',
    'X': 'X',
    'XI': 'XI',
    'XII': 'XII',
    'XIII': 'XIII',
    'XIV': 'XIV',
    'XV': 'XV',
    'XVI': 'XVI',
    'A': 'A',
    'B': 'B',
    'C': 'C',
    'D': 'D',
    'E': 'E',
    'F': 'F',
    'G': 'G',
    'H': 'H',
    'I': 'I',
    'J': 'J',
    'K': 'K',
    'L': 'L',
    'M': 'M',
    'N': 'N',
    'O': 'O',
    'P': 'P',
    'Q': 'Q',
    'R': 'R',
    'S': 'S',
    'T': 'T',
    'U': 'U',
    'V': 'V',
    'W': 'W',
    'X': 'X',
    'Y': 'Y',
    'Z': 'Z',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',

}


//需处理的前缀，此处可以截取语句开头部分的内容进行汉化
//例如：Coin: 13、Coin: 14、Coin: 15... 这种有相同开头的语句
//可以在这里汉化开头："Coin: ":"金币: "
var cnPrefix = {
    "\n": "\n",
    "                   ": "",
    "                  ": "",
    "                 ": "",
    "                ": "",
    "               ": "",
    "              ": "",
    "             ": "",
    "            ": "",
    "           ": "",
    "          ": "",
    "         ": "",
    "        ": "",
    "       ": "",
    "      ": "",
    "     ": "",
    "    ": "",
    "   ": "",
    "  ": " ",
    " ": " ",
    //树游戏
    "\t\t\t": "\t\t\t",
    "\n\n\t\t": "\n\n\t\t",
    "\n\t\t": "\n\t\t",
    "\t": "\t",
    "Show Milestones: ": "显示里程碑：",
    "Autosave: ": "自动保存: ",
    "Offline Prod: ": "离线生产: ",
    "Completed Challenges: ": "完成的挑战: ",
    "High-Quality Tree: ": "高质量树贴图: ",
    "Offline Time: ": "离线时间: ",
    "Theme: ": "主题: ",
    "Anti-Epilepsy Mode: ": "抗癫痫模式：",
    "In-line Exponent: ": "直列指数：",
    "Single-Tab Mode: ": "单标签模式：",
    "Time Played: ": "已玩时长：",
    "Shift-Click to Toggle Tooltips: ": "Shift-单击以切换工具提示：",
    "Random fact: ": "随机事实：",
    "Your mission: ": "你的任务：",
    "save the world ": "拯救世界 ",
    "[Shift + Click] to revoke for ": "[Shift + 点击] 以回收 ",
    "[Shift + Click] to sell for ": "[Shift + 点击] 以出售获得 ",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
}

//需处理的后缀，此处可以截取语句结尾部分的内容进行汉化
//例如：13 Coin、14 Coin、15 Coin... 这种有相同结尾的语句
//可以在这里汉化结尾：" Coin":" 金币"
var cnPostfix = {
    "                   ": "",
    "                  ": "",
    "                 ": "",
    "                ": "",
    "               ": "",
    "              ": "",
    "             ": "",
    "            ": "",
    "           ": "",
    "          ": "",
    "         ": "",
    "        ": "",
    "       ": "",
    "      ": "",
    "     ": "",
    "    ": "",
    "   ": "",
    "  ": "  ",
    " ": " ",
    "\n": "\n",
    "\n\t\t\t": "\n\t\t\t",
    "\t\t\n\t\t": "\t\t\n\t\t",
    "\t\t\t\t": "\t\t\t\t",
    "\n\t\t": "\n\t\t",
    "\t": "\t",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
    "": "",
}

//需排除的，正则匹配
var cnExcludeWhole = [
    /^(\d+)$/,
    /^\s*$/, //纯空格
    /^([\d\.]+):([\d\.]+)$/,
    /^([\d\.]+):([\d\.]+):([\d\.]+)$/,
    /^([\d\.]+):([\d\.]+):([\d\.]+):([\d\.]+)$/,
    /^([\d\.]+):([\d\.]+):([\d\.]+):([\d\.]+):([\d\.]+)$/,
    /^([\d\.]+)h ([\d\.]+)m ([\d\.]+)s$/,
    /^([\d\.]+)y ([\d\.]+)d ([\d\.]+)h$/,
    /^([\d\.]+)\-([\d\.]+)\-([\d\.]+)$/,
    /^([\d\.]+)e(\d+)$/,
    /^([\d\.]+)$/,
    /^\(([\d\.]+)\)$/,
    /^([\d\.]+)\%$/,
    /^([\d\.]+)\/([\d\.]+)$/,
    /^\(([\d\.]+)\/([\d\.]+)\)$/,
    /^成本(.+)$/,
    /^\(([\d\.]+)\%\)$/,
    /^([\d\.]+):([\d\.]+):([\d\.]+)$/,
    /^([\d\.]+)°C$/,
    /^\+([\d\.]+)°C$/,
    /^([\d\.]+)K$/,
    /^([\d\.]+)M$/,
    /^([\d\.]+)B$/,
    /^([\d\.]+) K$/,
    /^([\d\.]+) M$/,
    /^([\d\.]+) B$/,
    /^([\d\.]+)s$/,
    /^([\d\.]+)x$/,
    /^x([\d\.]+)$/,
    /^([\d\.,]+)$/,
    /^([\d\.,]+) ([\d\.,]+)$/,
    /^-\([\d\.,]+) ([\d\.,]+)$/,
    /^([\d\.,]+) ([\d\.,]+) ([\d\.,]+)$/,
    /^\-([\d\.,]+) ([\d\.,]+) ([\d\.,]+)$/,
    /^([\d\.,]+) ([\d\.,]+) ([\d\.,]+) ([\d\.,]+)$/,
    /^([\d\.,]+) ([\d\.,]+) ([\d\.,]+) ([\d\.,]+) ([\d\.,]+)$/,
    /^\+([\d\.,]+)$/,
    /^\-([\d\.,]+)$/,
    /^([\d\.,]+)x$/,
    /^x([\d\.,]+)$/,
    /^([\d\.,]+) \/ ([\d\.,]+)$/,
    /^([\d\.]+)e([\d\.,]+)$/,
    /^([\d\.,]+)\/([\d\.]+)e([\d\.,]+)$/,
    /^([\d\.]+)e([\d\.,]+)\/([\d\.]+)e([\d\.,]+)$/,
    /^([\d\.]+)e\+([\d\.,]+)$/,
    /^e([\d\.]+)e([\d\.,]+)$/,
    /^x([\d\.]+)e([\d\.,]+)$/,
    /^([\d\.]+)e([\d\.,]+)x$/,
    /^[\u4E00-\u9FA5]+$/
];
var cnExcludePostfix = [
]

//正则替换，带数字的固定格式句子
//纯数字：(\d+)
//逗号：([\d\.,]+)
//小数点：([\d\.]+)
//原样输出的字段：(.+)
//换行加空格：\n(.+)
var cnRegReplace = new Map([
    [/^([\d\.]+) hours ([\d\.]+) minutes ([\d\.]+) seconds$/, '$1 小时 $2 分钟 $3 秒'],
    [/^You are gaining (.+) elves per second$/, '你每秒获得 $1 精灵'],
    [/^It's (.+) now, and CO2 concentration is still increasing. We need more trees!!$/, '现在是 $1 年，二氧化碳浓度仍在增加。 我们需要更多的树！！'],
    [/^You have (.+) points$/, '你有 $1 点数'],
    [/^Next at (.+) points$/, '下一个在 $1 点数'],
    [/^Advocates are more powerfull than activists: they raise (.+) gold per week!$/, '支持者比活动家更有权力：他们每周筹集 $1 金币！'],
    [/^Increase chopping rate by (.+). (.+) gold per week.$/, '砍树率提高 $1。每周 $2 金币。'],
    [/^Lumberjacks are professionals who chop (.+) trees every week.$/, '伐木工人是专业人士，每周砍伐 $1 棵树。'],
    [/^District Rangers plant (.+) trees every week.$/, '地区巡游者 每周种 $1 树。'],
    [/^Delimbers are light harvesting vehicules that chop (.+) trees per week.$/, '打枝机 是一种轻型收割车，每周可砍伐 $1 棵树。'],
    [/^These guys visit the forest and gather firewood. (.+) trees is chopped every week.$/, '这些家伙去森林里捡柴火。 每周砍伐 $1 棵树。'],
    [/^A lightning disease due to Global Warming killed a large number of trees. (.+) of your forest died.$/, '全球变暖导致的闪电病害大量树木死亡。 $1 的森林死亡。'],
    [/^Arborists manage your forest: they plant (.+) trees and chop (.+) trees every week.$/, '树艺师管理您的森林：他们每周种植 $1 棵树并砍伐 $2 棵树。'],
    [/^Foresters plant (.+) trees every week.$/, '林务员 每周种植 $1 棵树。'],
    [/^Rangers plant (.+) trees every week.$/, '巡游者 每周种植 $1 棵树。'],
    [/^Florists like nature. Incidentally, (.+) trees will grow every week.$/, '花艺师喜欢大自然。 顺便说一下，每周会长出 $1 棵树。'],
    [/^Activists help raise money for your organization. Each raise (.+) gold per week. They also plant trees from time to time \((.+) tree per week\).$/, '活动家帮助为您的组织筹集资金。 每人每周筹集 $1 金币。 他们还时常种树（每周 $2 棵树）。'],
    [/^Activists help raise money for your organization. Each raise (.+) gold per week. They also plant trees from time to time \((.+) trees per week\).$/, '活动家帮助为您的组织筹集资金。 每人每周筹集 $1 金币。 他们还时常种树（每周 $2 棵树）。'],
    [/^Arborists manage your forest: they plant (.+) trees and chop (.+) tree every week.$/, '树艺师管理您的森林：他们每周种植 $1 棵树并砍伐 $2 棵树。'],
	[/^([\d\.]+)\/sec$/, '$1\/秒'],
	[/^\+(.+)\/week$/, '\+$1\/周'],
	[/^\-(.+)\/week$/, '\-$1\/周'],
	[/^([\d\.,]+)\/sec$/, '$1\/秒'],
	[/^([\d\.,]+) OOMs\/sec$/, '$1 OOMs\/秒'],
	[/^([\d\.]+) OOMs\/sec$/, '$1 OOMs\/秒'],
	[/^([\d\.]+)e([\d\.,]+)\/sec$/, '$1e$2\/秒'],
    [/^requires ([\d\.]+) more research points$/, '需要$1个研究点'],
    [/^([\d\.]+)e([\d\.,]+) points$/, '$1e$2 点数'],
    [/^([\d\.]+) elves$/, '$1 精灵'],
    [/^([\d\.]+)d ([\d\.]+)h ([\d\.]+)m$/, '$1天 $2小时 $3分'],
    [/^([\d\.]+)e([\d\.,]+) elves$/, '$1e$2 精灵'],
    [/^([\d\.,]+) elves$/, '$1 精灵'],
    [/^([\d\.,]+) gold$/, '$1 金币'],
    [/^You reached level ([\d\.,]+). Way to go!$/, '您已达到第 $1 级。干得好！'],
    [/^(.+) gold$/, '$1 金币'],
    [/^\*(.+) to electricity gain$/, '\*$1 到电力增益'],
    [/^Cost: (.+) points$/, '成本：$1 点数'],
    [/^Req: (.+) elves$/, '要求：$1 精灵'],
    [/^Req: (.+) \/ (.+) elves$/, '要求：$1 \/ $2 精灵'],
    [/^Usages: (\d+)\/$/, '用途：$1\/'],
    [/^workers: (\d+)\/$/, '工人：$1\/'],

]);