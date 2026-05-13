const express = require('express');
const prisma = require('../db');
const authMiddleware = require('../middleware/auth');
const questions = require('../data/questions');
const { generateNovel, buildPersonalityProfile } = require('../services/deepseek');

const router = express.Router();

const dimensionKeys = [
  'bravery', 'idealism', 'passion',
  'altruism', 'rebellion', 'extraversion',
];

const dimensionMap = {};
dimensionKeys.forEach((key, i) => {
  dimensionMap[`勇气/谨慎`] = key;
  dimensionMap[`理想/务实`] = key;
  dimensionMap[`热血/冷静`] = key;
  dimensionMap[`利他/利己`] = key;
  dimensionMap[`叛逆/守序`] = key;
  dimensionMap[`开朗/内敛`] = key;
});

const realDimensionMap = {
  '勇气/谨慎': 'bravery',
  '理想/务实': 'idealism',
  '热血/冷静': 'passion',
  '利他/利己': 'altruism',
  '叛逆/守序': 'rebellion',
  '开朗/内敛': 'extraversion',
};

function calculateScores(answers) {
  const rawScores = { bravery: 0, idealism: 0, passion: 0, altruism: 0, rebellion: 0, extraversion: 0 };
  const counts = { bravery: 0, idealism: 0, passion: 0, altruism: 0, rebellion: 0, extraversion: 0 };
  const totalWeight = { bravery: 0, idealism: 0, passion: 0, altruism: 0, rebellion: 0, extraversion: 0 };

  for (const ans of answers) {
    const question = questions.find(q => q.id === ans.questionId);
    if (!question) continue;
    const dimKey = realDimensionMap[question.dimension];
    if (!dimKey) continue;

    const v = ans.value;
    const weight = (v === 1 || v === 5) ? 1.5 : 1.0;
    rawScores[dimKey] += v * weight;
    totalWeight[dimKey] += weight;
    counts[dimKey] += 1;
  }

  const avgScores = {};
  for (const key of dimensionKeys) {
    if (counts[key] > 0) {
      const weightedAvg = rawScores[key] / totalWeight[key];
      const deviation = weightedAvg - 3;
      const amplified = 3 + deviation * 1.3;
      avgScores[key] = Math.round(Math.max(1, Math.min(5, amplified)) * 10) / 10;
    } else {
      avgScores[key] = 3;
    }
  }

  return avgScores;
}

router.post('/generate-guest', async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: '请提供有效的答案数据' });
    }

    const scores = calculateScores(answers);
    const profile = buildPersonalityProfile(scores);
    const novel = await generateNovel(answers, scores);

    res.json({
      title: novel.title,
      worldSetting: novel.worldSetting,
      plot: novel.plot,
      protagonistProfile: profile,
      dimensionScores: scores,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Guest novel generation error:', err);
    res.status(500).json({ error: '小说生成失败，请稍后重试' });
  }
});

router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: '请提供有效的答案数据' });
    }

    const scores = calculateScores(answers);
    const profile = buildPersonalityProfile(scores);

    const novel = await generateNovel(answers, scores);

    const saved = await prisma.novel.create({
      data: {
        title: novel.title,
        worldSetting: novel.worldSetting,
        plot: novel.plot,
        protagonistProfile: profile,
        dimensionScores: scores,
        userId: req.userId,
      },
    });

    res.json({
      id: saved.id,
      title: saved.title,
      worldSetting: saved.worldSetting,
      plot: saved.plot,
      protagonistProfile: saved.protagonistProfile,
      dimensionScores: saved.dimensionScores,
      createdAt: saved.createdAt,
    });
  } catch (err) {
    console.error('Novel generation error:', err);
    res.status(500).json({ error: '小说生成失败，请稍后重试' });
  }
});

router.get('/list', authMiddleware, async (req, res) => {
  try {
    const novels = await prisma.novel.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        protagonistProfile: true,
        dimensionScores: true,
        createdAt: true,
      },
    });
    res.json(novels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取小说列表失败' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const novel = await prisma.novel.findUnique({
      where: { id: req.params.id },
    });
    if (!novel || novel.userId !== req.userId) {
      return res.status(404).json({ error: '小说不存在' });
    }
    res.json(novel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取小说详情失败' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const novel = await prisma.novel.findUnique({
      where: { id: req.params.id },
    });
    if (!novel || novel.userId !== req.userId) {
      return res.status(404).json({ error: '小说不存在' });
    }
    await prisma.novel.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;
