import { Router } from 'express';
import { getAllUsers, getUserById } from '../dal/users.js';
import { createUser } from '../dal/users.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// TODO: Student implementation - Part 1: User Routes

// GET / user
router.get('/', async (_req, res, next) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// GET /users/:id
router.get('/:id', async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  try {
    const user = await getUserById(id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

// POST /users
router.post('/', authMiddleware, async (req, res, next) => {
  const { name, email } = req.body ?? {};

  if (
    typeof name !== 'string' ||
    name.trim() === '' ||
    typeof email !== 'string' ||
    email.trim() === ''
  ) {
    res.status(400).json({ error: 'Name and email are required' });
    return;
  }

  try {
    const user = await createUser({
      name: name.trim(),
      email: email.trim(),
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
