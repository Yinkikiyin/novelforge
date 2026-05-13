const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const registerSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  password: z.string().min(6, '密码至少6位'),
  name: z.string().min(1, '昵称不能为空').max(20, '昵称最多20个字符'),
});

const loginSchema = z.object({
  phone: z.string().min(1, '请输入手机号'),
  password: z.string().min(1, '请输入密码'),
});

router.post('/register', async (req, res) => {
  try {
    const { phone, password, name } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return res.status(409).json({ error: '该手机号已被注册' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { phone, password: hashedPassword, name },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user.id, phone: user.phone, name: user.name },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error(err);
    res.status(500).json({ error: '注册失败' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(401).json({ error: '手机号或密码错误' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: '手机号或密码错误' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, phone: user.phone, name: user.name },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error(err);
    res.status(500).json({ error: '登录失败' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, phone: true, name: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: '用户不存在' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

module.exports = router;
