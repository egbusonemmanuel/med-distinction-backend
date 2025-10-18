// routes/groups.js
import express from 'express';
import Group from '../models/Group.js';
const router = express.Router();

router.get('/', async (req, res) => {
  const groups = await Group.find();
  res.json(groups);
});

router.post('/', async (req, res) => {
  const { name, members } = req.body;
  const group = new Group({ name, members });
  await group.save();
  res.json(group);
});

export default router;
