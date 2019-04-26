/**
 * 20190319@JAR:
 * 
 * 1.汉化字典'cnItems:obj',
 * 2.采集新词'cnItem:fun';
 * 
 */

//1.汉化杂项
var cnItems = {
    _STYLE_: [
        '符号', '待归类', '地图', '防具', '武器', '道具', '属性', '敌人'
    ],
    _OTHER_: [],

    //1.0.符号
    '': '',
    '---': '———',

    //1.1.待归类
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
    'Gold Manager': '黄金管理',
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
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',

    //1.2.地图
    '': '',
    '': '',

    //1.3.防具
    //1.4.武器
    //1.5.道具

    //1.6.属性（30）
    '': '',

    //1.7.敌人 

};
//2.采集新词
//20190320@JAR

var cnItem = function () {

    //传参是否非空字串
    if (!arguments[0]) return;

    //检验传参是否对象
    let text = arguments[0],
        s = '';
    if (typeof (text) != "string")
        return text;
    else
        s = arguments[0].charCodeAt();

    //检验传参是否英文
    if (
        s < 65 || (s > 90 && s < 97) || (s > 122)

    ) return text;
    //检验字典是否可存
    if (!cnItems._OTHER_) cnItems._OTHER_ = [];

    //遍历尝试匹配
    for (let i in cnItems) {
        //字典已有词汇或译文、且译文不为空，则返回译文
        if (
            text == i || text == cnItems[i] &&
            cnItems[i] != ''
        )
            return cnItems[i];
    }

    //遍历生词表是否收录
    for (
        let i = 0; i < cnItems._OTHER_.length; i++
    ) {
        //已收录则直接返回
        if (text == cnItems._OTHER_[i])
            return text;
    }

    //未收录则保存
    cnItems._OTHER_.push(text);
    cnItems._OTHER_.sort(
        function (a, b) {
            return a.localeCompare(b)
        }
    );

    /*
        //开启生词打印
        //console.log(
            '有需要汉化的英文：', text
        );
    */

    //返回生词字串
    return text;
};
