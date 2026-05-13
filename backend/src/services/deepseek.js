const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
});

const SYSTEM_PROMPT = `你是"墨染"，起点中文网/晋江文学城双平台万订级网文作家，精通男频和女频的所有爆款题材。覆盖类型包括但不限于：奇幻冒险、江湖侠义、都市异能、悬疑解谜、热血竞技、反套路修仙、喜剧爽文、都市奇缘、深宫风云、古代宫斗、仙侠虐恋、星际科幻、末世废土、女尊世界、兽世兽人、电竞女王、种田经营、洪荒神话、盗墓探险……你了解每一种题材的读者爽点和情感需求。

你的写作信条：
1. 开篇即高能——第一段就要有冲突、悬念或一个让人停不下来的场景
2. 三章一反转——剧情推进要快，每段都有信息增量
3. 对白带梗——人物对话要有性格、有烟火气，拒绝书面腔。男频对白干脆利落带狠劲，女频对白有情感层次和细腻心思
4. 爽点密集——主角必须有独特金手指，每隔一段就有一个让读者拍案叫绝的瞬间
5. 拒绝AI味——不要说明书式旁白，不要"在遥远的未来""命运的齿轮开始转动"等烂俗表达
6. 男女频通吃——男频注重升级打怪和实力突破，女频注重情感张力和关系博弈，两种模式都能自由切换

安全创作边界（你必须严格遵守）：
- 情感戏写"眼神对视、欲言又止、指尖微颤"，不写身体细节
- 战斗写"剑气纵横、拳风凌厉、一招制敌"，不写血腥画面
- 冲突写"智斗碾压、商业围剿、众叛亲离"，不写暴力报复
- 反派写"灰色地带、立场不同、博弈失败"，不写黑暗犯罪细节
- 保持网文爽感的同时自动规避敏感描写，你是有经验的作者，这对你来说不是难事

你的对话风格是口语化、接地气的，像一个老书虫在跟朋友兴奋地讲一个刚想到的绝妙故事。每次创作的主角名字、金手指、世界观都必须独一无二，绝不重复使用。`;

function buildPersonalityProfile(scores) {
  const dims = [
    { key: 'bravery', label: '勇气/谨慎', high: '勇敢无畏', low: '谨慎小心' },
    { key: 'idealism', label: '理想/务实', high: '理想主义', low: '务实现实' },
    { key: 'passion', label: '热血/冷静', high: '热血冲动', low: '冷静沉着' },
    { key: 'altruism', label: '利他/利己', high: '无私奉献', low: '自我优先' },
    { key: 'rebellion', label: '叛逆/守序', high: '叛逆不羁', low: '守序遵规' },
    { key: 'extraversion', label: '开朗/内敛', high: '开朗外向', low: '内敛沉静' },
  ];

  return dims.map(({ key, label, high, low }) => {
    const score = scores[key] || 3;
    const trait = score >= 4 ? high : score <= 2 ? low : '平衡';
    return { dimension: label, score, trait };
  });
}

const RANDOM_POOL = [
  { name: '穿越架空', desc: '魂穿异界，用现代思维在古代或架空世界闯出一片天' },
  { name: '都市异能', desc: '表面繁华的都市下隐藏着超能力者的世界' },
  { name: '灵气复苏', desc: '现代世界灵气爆发，普通人觉醒天赋进入修行时代' },
  { name: '重生娱乐圈', desc: '带着记忆重生到过去，在娱乐圈从龙套到顶流' },
  { name: '星际科幻', desc: '浩瀚星海、外星文明，人类在宇宙尺度上的冒险' },
  { name: '洪荒神话', desc: '开天辟地、巫妖大战，从洪荒走向封神的史诗旅程' },
  { name: '无限流生存', desc: '被拉入神秘游戏世界，在关卡挑战中不断变强' },
  { name: '盗墓探险', desc: '古墓机关、千年谜团，下斗摸金步步惊心' },
  { name: '诡异世界', desc: '规则类怪谈、异常收容，日常之下出现裂缝' },
  { name: '修仙种田', desc: '穿到修仙界不打架，专心种灵草炼丹开宗立派' },
  { name: '美食经营', desc: '靠一手好厨艺从路边摊做到天下第一楼' },
  { name: '女尊世界', desc: '女子为尊的国度，女帝、女将、女相执掌天下' },
  { name: '深宫风云', desc: '深宫红墙内，各路人马的生存博弈与真情假意' },
  { name: '兽世兽人', desc: '穿越到兽人部落，在原始丛林中建立文明与羁绊' },
  { name: '电竞王者', desc: '从网吧少年到世界冠军，指尖上的巅峰对决' },
  { name: '仙侠虐恋', desc: '三生三世、情劫轮回，仙魔之恋虐到心碎又欲罢不能' },
  { name: '都市奇缘', desc: '高冷总裁遇上不按套路出牌的女主，先婚后爱真香定律' },
  { name: '学霸科技', desc: '重生当学霸，用超前科技知识改变世界格局' },
  { name: '荒岛求生', desc: '流落荒岛，从零开始建立自己的原始帝国' },
  { name: '阴阳天师', desc: '捉鬼驱邪、风水玄学，都市中的捉妖天师日常' },
  { name: '武侠推理', desc: '古风+悬疑，名捕/仵作/侠客联手破案' },
  { name: '机甲科幻', desc: '驾驶巨型机甲，在星际战场上对抗异星虫族' },
  { name: '侦探事务所', desc: '开一家只接离奇委托的侦探事务所' },
  { name: '异兽驯养', desc: '穿到异界发现能跟所有妖兽沟通当宠物养' },
  { name: '卡牌召唤师', desc: '卡片就是战力，抽卡组卡召唤万界英灵' },
  { name: '全民转职', desc: '世界游戏化，每个人获得职业和技能从新手村开始' },
  { name: '灰色行者', desc: '不做好人也能成王，主角从灰色地带闯出一片天' },
  { name: '锦鲤福星', desc: '天生欧皇体质，走到哪捡到哪，运气好到对手崩溃' },
  { name: '国风志怪', desc: '《山海经》百鬼夜行、《聊斋》奇闻异事活在现代' },
  { name: '修仙界首富', desc: '别人修仙靠打坐，我修仙靠经商，把修真界做成商业帝国' },
  { name: '废柴退婚流', desc: '开局被退婚测试零天赋，然后悄悄觉醒隐藏血脉' },
  { name: '御兽进化', desc: '契约灵兽进化变异，培养一只史莱姆进化成神兽' },
  { name: '古代基建', desc: '穿成古代县令/藩王，从修路架桥到工业革命' },
];

function selectGenre(scores) {
  const { bravery, idealism, passion, altruism, rebellion, extraversion } = scores;
  const triggered = [];

  if (bravery >= 4) {
    triggered.push(
      { name: '奇幻冒险', desc: '古老遗迹、异世界秘境，主角踏遍未知之地探寻力量与真相' },
      { name: '探秘考古', desc: '现代都市下藏着远古文明遗址，主角在发掘中意外揭开世界另一面' }
    );
  }
  if (bravery <= 2) {
    triggered.push(
      { name: '悬疑解谜', desc: '连环谜题、密室困境，主角用缜密推理一步步接近真相' },
      { name: '策略博弈', desc: '商战暗流、多方势力角力，主角以智取胜步步为营' }
    );
  }

  if (idealism >= 4) {
    triggered.push(
      { name: '江湖侠义', desc: '古代或架空江湖，主角持信念行侠仗义' },
      { name: '古代基建', desc: '穿成古代县令/藩王，从修路架桥到工业革命' },
      { name: '星际科幻', desc: '浩瀚星海、外星文明，人类在宇宙尺度上的冒险' }
    );
  }
  if (idealism <= 2) {
    triggered.push(
      { name: '都市商战', desc: '白手起家创建商业帝国，现实向逆袭爽文' },
      { name: '职业竞技', desc: '电竞、体育或手艺领域，主角凭硬实力登顶' }
    );
  }

  if (passion >= 4) {
    triggered.push(
      { name: '热血竞技', desc: '擂台格斗、极限赛车，主角用实力打出名堂' },
      { name: '燃向逆袭', desc: '从废柴到强者，一路燃到底的少年成长故事' }
    );
  }
  if (passion <= 2) {
    triggered.push(
      { name: '幕后军师', desc: '主角运筹帷幄，用头脑在乱世中布局天下' },
      { name: '宫廷权谋', desc: '朝堂博弈、情报暗战，话里有话步步杀机' }
    );
  }

  if (altruism >= 4) {
    triggered.push(
      { name: '治愈经营', desc: '开一家小店、经营一片田园，温暖治愈的日常中暗藏不凡' },
      { name: '救赎之旅', desc: '主角在帮助他人的过程中完成自我成长与救赎' }
    );
  }
  if (altruism <= 2) {
    triggered.push(
      { name: '灰色行者', desc: '不做好人也能成王，主角从灰色地带闯出一片天' },
      { name: '独行猎人', desc: '一人一枪，游离于各方势力之外的神秘高手' }
    );
  }

  if (rebellion >= 4) {
    triggered.push(
      { name: '反套路修仙', desc: '别人修仙我摆烂、别人渡劫我摆摊，用离谱玩法破常规' },
      { name: '都市怪盗', desc: '高智商侠盗、秘密组织，在都市暗面潇洒行事' },
      { name: '深宫风云', desc: '深宫红墙内，各路人马的生存博弈与真情假意' }
    );
  }
  if (rebellion <= 2) {
    triggered.push(
      { name: '体制内修行', desc: '在规则体系内一步步升级，稳扎稳打的成长史诗' },
      { name: '秩序守护', desc: '维持世界平衡的神秘组织成员，在暗处守护日常' }
    );
  }

  if (extraversion >= 4) {
    triggered.push(
      { name: '欢乐群像', desc: '一群性格各异的伙伴打打闹闹闯荡世界' },
      { name: '搞笑爽文', desc: '嘴炮王者、扮猪吃虎，看得人拍大腿的欢乐剧情' },
      { name: '都市奇缘', desc: '高冷总裁遇上不按套路出牌的女主，先婚后爱真香定律' },
      { name: '女霸总', desc: '冷艳女总裁与她的年下小奶狗/忠犬保镖，女强男也强' }
    );
  }
  if (extraversion <= 2) {
    triggered.push(
      { name: '独行侠客', desc: '一人一剑走天下，沉默寡言但实力深不可测' },
      { name: '隐居种田', desc: '大隐于市，低调发展势力，直到世界主动找上门' },
      { name: '仙侠虐恋', desc: '三生三世、情劫轮回，仙魔之恋虐到心碎又欲罢不能' }
    );
  }

  if (bravery >= 4 && passion >= 4) {
    triggered.push(
      { name: '末日废土', desc: '全球灾变后废土世界，觉醒者在废墟中重建秩序' },
      { name: '重生逆袭', desc: '带着记忆回到过去，抢占先机改写命运轨迹' }
    );
  }

  if (bravery >= 4 && idealism <= 2) {
    triggered.push(
      { name: '末世种田', desc: '末日降临不打架，囤物资建基地种田养队友' }
    );
  }

  if (passion <= 2 && altruism >= 4) {
    triggered.push(
      { name: '种田经营', desc: '不争不抢，靠种田、经商、经营势力安静变强' }
    );
  }

  if (rebellion >= 4 && extraversion >= 4) {
    triggered.push(
      { name: '电竞女王', desc: '女选手在男子统治的电竞圈闯出一条路登顶封神' }
    );
  }

  const triggeredNames = new Set(triggered.map(g => g.name));
  const candidateRandoms = RANDOM_POOL.filter(g => !triggeredNames.has(g.name));
  const randomPicks = candidateRandoms.sort(() => Math.random() - 0.5).slice(0, 4);
  const allCandidates = [...triggered, ...randomPicks];

  if (allCandidates.length < 6) {
    const extra = candidateRandoms
      .filter(g => !allCandidates.find(c => c.name === g.name))
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    allCandidates.push(...extra);
  }

  const selected = allCandidates
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

  return selected.map(g => `  - 【${g.name}】${g.desc}`).join('\n');
}

function buildNovelPrompt(answers, scores) {
  const profile = buildPersonalityProfile(scores);
  const genres = selectGenre(scores);

  const highTraits = profile.filter(p => p.score >= 4).map(p => p.trait);
  const lowTraits = profile.filter(p => p.score <= 2).map(p => p.trait);

  const profileText = profile
    .map(p => `  - ${p.dimension}: ${p.score}/5 (${p.trait})`)
    .join('\n');

  const summaryTraits = [
    ...highTraits.length ? [`性格突出: ${highTraits.join('、')}`] : [],
  ].join('\n');

  return `== 主角性格画像 ==
${profileText}
${summaryTraits}

== 推荐题材方向（以下题材仅供参考，你也可以自己选择最契合的）==
${genres}

== 创作任务 ==

请根据主角性格，从上述推荐题材中选择最契合的（或自己发挥），创造一部爽感拉满的网文设定。

【主角命名要求】：
- 从以下姓氏库随机选一个（严禁直接用任何现成角色名）：
  姓氏库：慕容、上官、令狐、南宫、独孤、夏侯、尉迟、长孙、叶、沈、顾、萧、谢、裴、虞、晏、温、段、秦、霍、陆、卫、洛、楚、苏、季、云、池、唐
- 名字2-3字，从以下单字库自由搭配，创造你从未见过的新组合：
  男名用字：弈、尘、安、行、舟、渊、白、长、风、渡、惊、蛰、北、辰、临、夜、霄、寒、霁、辞、问、瑾、修、砚、青、野、归、澈、曜、循、衡、策
  女名用字：听、雪、清、鸢、若、笙、晚、晴、知、意、初、见、九、歌、秋、惊、鸿、宁、漪、棠、絮、瑶、舒、灵、微、念、颜、谣、祈、涧、涟
- 严禁从你记忆中复制现成角色名。每次必须从这个字库里随机搭配创造全新的名字

【世界观设定 worldSetting】（200-300字）：
- 开篇三句内抛出核心冲突或悬念，拒绝套话开头
- 必须包含一条独特的"金手指"或"系统/能力"设定（如签到系统、隐藏天赋、记忆回溯、直播间系统等）
- 描写一个让读者立刻感受到"这个世界不对劲"的具体场景
- 给出世界力量体系的核心规则（至少2条具体规则）

【故事主线 plot】（600-800字）：
- 以主角的第一视角展开叙述，至少包含：
  1. 一个开场钩子：主角面临的第一个重大危机或抉择
  2. 一个爽点场景：主角用能力/金手指力克对手或逆风翻盘（写具体动作和对话）
  3. 一个伏笔：暗示更大的阴谋或更强的对手
  4. 一个情感冲突：友情/爱情/信任中的抉择
- 禁止纯概括式叙述，每个情节点都要有具体的人、事、物
- 对话至少出现两处，用双引号括起来
- 节奏要快，章节感要强，像在口述一个精彩故事
- 女性向题材注重情感描写和人物关系的细腻刻画

【小说名 title】：
- 模仿爆款网文命名公式，参考以下格式（可自由发挥）：
  《开局签到SSS级天赋》《灵气崩塌我觉醒了》《我靠种田在江湖无敌》
  《重生弃少之开局捡大佬》《这个侠客过分谨慎》《全球高武我的副本有bug》
  《从摆地摊到修仙界首富》《穿书后我成了反派的白月光》《我真不是大魔王》
  《帝少的心尖宠》《这个娘娘过分谨慎》《王爷他总想娶我》《女帝的冷面侍卫》
  《开局被退婚觉醒了SSS》《回档1998我靠记忆封神》《星际直播全宇宙围观我养猫》
  《当修真界开始搞基建》《在诡异世界开事务所》《我是怎么从赘婿成神帝的》
- 名字要抓人眼球、体现核心金手指、让读者一秒想点进来
- 倾向独立成句，避免用冒号做解释性分隔。如需增加层次感用"之"字或破折号

【写作风格要求】：
- 参考"老鹰吃小鸡"的快节奏爽感和"卖报小郎君"的对白功底
- 女性向题材参考"天下归元""吱吱""意千重"的古言功底
- 用具体动作、声音、颜色替代抽象形容词
- 每段不超过4行，信息密度要高
- 人物对话要有性格辨识度，每句话都能看出是谁在说

请严格按以下 JSON 格式输出（标题写在最前面），不要输出任何其他内容：
{
  "title": "...",
  "worldSetting": "...",
  "plot": "..."
}`;
}

async function generateNovel(answers, scores) {
  const prompt = buildNovelPrompt(answers, scores);

  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.9,
    max_tokens: 8192,
    top_p: 0.92,
  });

  const content = response.choices[0].message.content;

  let jsonStr = content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) jsonStr = jsonMatch[0];

  try {
    const result = JSON.parse(jsonStr);
    return {
      title: result.title || '未命名',
      worldSetting: result.worldSetting || '',
      plot: result.plot || '',
    };
  } catch {
    return {
      title: '命运之章',
      worldSetting: '在这个世界中，命运如同一张无形的网...',
      plot: '故事才刚刚开始，一切皆有可能...',
    };
  }
}

module.exports = { generateNovel, buildPersonalityProfile };
