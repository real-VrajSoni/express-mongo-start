import { Router } from 'express';
import Item from '../models/Item.js';

const router = Router();

// GET /api/items: read all items.
router.get('/', async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

// POST /api/items: save a new item.
router.post('/', async (req, res) => {
  const item = await Item.create({ name: req.body?.name });
  res.status(201).json(item);
});

export default router;
