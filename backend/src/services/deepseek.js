const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
});

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

function selectGenre(scores) {
  const { bravery, idealism, passion, altruism, rebellion, extraversion } = scores;

  const genrePool = [];

  // 勇气高 → 冒险、探秘
  if (bravery >= 4) {
    genrePool.push(
      { name: '奇幻冒险', desc: '古老遗迹、异世界秘境，主角踏遍未知之地探寻力量与真相' },
      { name: '探秘考古', desc: '现代都市下藏着远古文明遗址，主角在发掘中意外揭开世界另一面' }
    );
  }
  // 谨慎高 → 悬疑、策略
  if (bravery <= 2) {
    genrePool.push(
      { name: '悬疑解谜', desc: '连环谜题、密室困境，主角用缜密推理一步步接近真相' },
      { name: '策略博弈', desc: '商战暗流、多方势力角力，主角以智取胜步步为营' }
    );
  }
  // 理想高 → 侠义、异界
  if (idealism >= 4) {
    genrePool.push(
      { name: '江湖侠义', desc: '古代或架空江湖，主角持信念行侠仗义' },
      { name: '异界文化交流', desc: '两个文明意外碰撞，主角作为桥梁调和矛盾' }
    );
  }
  // 务实高 → 商战、竞技
  if (idealism <= 2) {
    genrePool.push(
      { name: '都市商战', desc: '白手起家创建商业帝国，现实向逆袭爽文' },
      { name: '职业竞技', desc: '电竞、体育或手艺领域，主角凭硬实力登顶' }
    );
  }
  // 热血高 → 竞技、燃向
  if (passion >= 4) {
    genrePool.push(
      { name: '热血竞技', desc: '擂台格斗、极限赛车，主角用实力打出名堂' },
      { name: '燃向逆袭', desc: '从废柴到强者，一路燃到底的少年成长故事' }
    );
  }
  // 冷静高 → 智斗、权谋
  if (passion <= 2) {
    genrePool.push(
      { name: '幕后军师', desc: '主角运筹帷幄，用头脑在乱世中布局天下' },
      { name: '宫廷权谋', desc: '朝堂博弈、情报暗战，话里有话步步杀机' }
    );
  }
  // 利他高 → 治愈、救赎
  if (altruism >= 4) {
    genrePool.push(
      { name: '治愈经营', desc: '开一家小店、经营一片田园，温暖治愈的日常中暗藏不凡' },
      { name: '救赎之旅', desc: '主角在帮助他人的过程中完成自我成长与救赎' }
    );
  }
  // 利己高 → 反派、独行
  if (altruism <= 2) {
    genrePool.push(
      { name: '反派崛起', desc: '不做好人也能成王，主角从灰色地带杀出一条路' },
      { name: '独行猎人', desc: '一人一枪，游离于各方势力之外的神秘高手' }
    );
  }
  // 叛逆高 → 反套路、怪盗
  if (rebellion >= 4) {
    genrePool.push(
      { name: '反套路修仙', desc: '别人修仙我摆烂、别人渡劫我摆摊，用离谱玩法破常规' },
      { name: '都市怪盗', desc: '高智商侠盗、秘密组织，在都市暗面潇洒行事' }
    );
  }
  // 守序高 → 体制内、守夜人
  if (rebellion <= 2) {
    genrePool.push(
      { name: '体制内修行', desc: '在规则体系内一步步升级，稳扎稳打的成长史诗' },
      { name: '秩序守护', desc: '维持世界平衡的神秘组织成员，在暗处守护日常' }
    );
  }
  // 开朗高 → 群像、搞笑
  if (extraversion >= 4) {
    genrePool.push(
      { name: '欢乐群像', desc: '一群性格各异的伙伴打打闹闹闯荡世界' },
      { name: '搞笑爽文', desc: '嘴炮王者、扮猪吃虎，看得人拍大腿的欢乐剧情' }
    );
  }
  // 内敛高 → 独行、种田
  if (extraversion <= 2) {
    genrePool.push(
      { name: '独行侠客', desc: '一人一剑走天下，沉默寡言但实力深不可测' },
      { name: '隐居种田', desc: '大隐于市，低调发展势力，直到世界主动找上门' }
    );
  }
  // 末日系：需要勇气和热血双高才触发
  if (bravery >= 4 && passion >= 4) {
    genrePool.push(
      { name: '末日废土', desc: '全球灾变后废土世界，觉醒者在废墟中重建秩序' },
      { name: '重生逆袭', desc: '带着记忆回到过去，抢占先机改写命运轨迹' }
    );
  }
  // 如果以上匹配太少，补一些中性题材
  if (genrePool.length < 5) {
    genrePool.push(
      { name: '灵气复苏', desc: '现代世界灵气爆发，普通人觉醒天赋进入修行时代' },
      { name: '穿越架空', desc: '魂穿异界，用现代思维在古代或架空世界闯出一片天' },
      { name: '都市异能', desc: '表面繁华的都市下隐藏着超能力者的世界' }
    );
  }

  const selected = genrePool
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

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

== 推荐题材方向（根据性格匹配）==
${genres}

== 创作任务 ==

请根据主角性格，从上述推荐题材中选择最契合的，创造一部爽感拉满的网文设定。

【世界观设定 worldSetting】（200-300字）：
- 开篇三句内抛出核心冲突或悬念，拒绝"在遥远的未来""这是一个…的世界"等套话开头
- 必须包含一条独特的"金手指"或"系统/能力"设定（如签到系统、SSS级隐藏天赋、记忆回溯等）
- 描写一个让读者立刻感受到"这个世界不对劲"的具体场景
- 给出世界力量体系的核心规则（至少2条具体规则）

【故事主线 plot】（600-800字）：
- 以主角的第一视角展开叙述，至少包含：
  1. 一个开场钩子：主角面临的第一个生死危机或重大抉择
  2. 一个爽点场景：主角用能力/金手指碾压敌人或逆风翻盘（写具体动作和对话）
  3. 一个伏笔：暗示更大的阴谋或更强敌人
  4. 一个情感冲突：友情/爱情/背叛中的抉择
- 禁止纯概括式叙述，每个情节点都要有具体的人、事、物
- 对话至少出现两处，用双引号括起来
- 节奏要快，章节感要强，像在口述一个精彩故事

【小说名 title】：
- 模仿爆款网文命名公式，例如：
  《我靠签到在江湖无敌》《灵气崩塌：我觉醒了xx系统》《重生弃少：开局捡个大佬》
  《这个侠客过分谨慎》《全球高武：我的副本有bug》《从摆地摊到修仙界首富》
  《大明：开局一个锦衣卫》《我成了反派的白月光》
- 要抓人眼球、体现核心金手指、带冒号或破折号增加层次感

【写作风格要求】：
- 参考"老鹰吃小鸡"的快节奏爽感和"卖报小郎君"的对白功底
- 用具体动作、声音、颜色替代抽象形容词
- 每段不超过4行，信息密度要高
- 拒绝"充满着""蕴含着""散发着"等空洞描写

请严格按以下 JSON 格式输出，不要输出任何其他内容：
{
  "worldSetting": "...",
  "plot": "...",
  "title": "..."
}`;
}

async function generateNovel(answers, scores) {
  const prompt = buildNovelPrompt(answers, scores);

  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `你是"墨染"，起点中文网万订级网文作家，擅长奇幻冒险、江湖侠义、都市异能、悬疑解谜、热血竞技、反套路修仙、喜剧爽文等多种爆款题材。你的读者是追求爽感和代入感的大众读者群体。

你的写作信条：
1. 开篇即高能——第一段就要有冲突、悬念或一个让人停不下来的场景
2. 三章一反转——剧情推进要快，每段都有信息增量
3. 对白带梗——人物的对话要有性格、有烟火气，拒绝书面腔
4. 爽点密集——主角必须有独特金手指，每隔一段就有一个让读者颅内高潮的瞬间
5. 拒绝AI味——不要说明书式旁白，不要"在遥远的未来""命运的齿轮开始转动"等烂俗表达

你的对话风格是口语化、接地气的，像一个老书虫在跟朋友兴奋地讲一个刚想到的绝妙故事。`,
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.9,
    max_tokens: 8192,
    top_p: 0.92,
  });

  const content = response.choices[0].message.content;

  let jsonStr = content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

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
