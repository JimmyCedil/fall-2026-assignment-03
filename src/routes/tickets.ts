import { Router } from 'express';
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
} from '../dal/tickets.js';
import { insertTimeLog, getTotalHoursForTicket } from '../dal/timeLogs.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// TODO: Student implementation - Part 1: Ticket Routes
// GET /tickets
router.get('/', async (req, res, next) => {
  const { limit, offset, status } = req.query;

  const parsedLimit = limit === undefined ? undefined : Number(limit);
  const parsedOffset = offset === undefined ? undefined : Number(offset);

  if (
    (parsedLimit !== undefined &&
      (!Number.isSafeInteger(parsedLimit) || parsedLimit < 0)) ||
    (parsedOffset !== undefined &&
      (!Number.isSafeInteger(parsedOffset) || parsedOffset < 0)) ||
    (status !== undefined && typeof status !== 'string')
  ) {
    res.status(400).json({ error: 'Invalid ticket filters' });
    return;
  }

  try {
    const tickets = await getAllTickets({
      limit: parsedLimit,
      offset: parsedOffset,
      status,
    });
    res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
});

// GET /tickets/:id
router.get('/:id', async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid ticket ID' });
    return;
  }

  try {
    const ticket = await getTicketById(id);

    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
});

// POST /tickets
router.post('/', authMiddleware, async (req, res, next) => {
  const { title, description } = req.body ?? {};

  if (
    typeof title !== 'string' ||
    title.trim() === '' ||
    (description !== undefined &&
      description !== null &&
      typeof description !== 'string')
  ) {
    res.status(400).json({ error: 'Invalid ticket details' });
    return;
  }

  try {
    const ticket = await createTicket({
      title: title.trim(),
      description: description ?? null,
      creator_id: res.locals.userId,
      assignee_id: null,
    });

    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});

// PATCH /tickets/:id/status
router.patch('/:id/status', authMiddleware, async (req, res, next) => {
  const id = Number(req.params.id);
  const { status } = req.body ?? {};

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid ticket ID' });
    return;
  }

  if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  try {
    const ticket = await updateTicketStatus(id, status);

    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
});

// TODO: Student implementation - Part 2: Time Log Routes
// POST /tickets/:id/time
router.post('/:id/time', authMiddleware, async (req, res, next) => {
  const id = Number(req.params.id);
  const { hours } = req.body ?? {};

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid ticket ID' });
    return;
  }

  if (typeof hours !== 'number' || !Number.isFinite(hours) || hours <= 0) {
    res.status(400).json({ error: 'Hours must be a positive number' });
    return;
  }

  try {
    const ticket = await getTicketById(id);

    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    const log = await insertTimeLog(id, res.locals.userId, hours);
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
});

// GET /tickets/:id/time
router.get('/:id/time', async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid ticket ID' });
    return;
  }

  try {
    const ticket = await getTicketById(id);

    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    const totalHours = await getTotalHoursForTicket(id);
    res.status(200).json({ ticket_id: id, total_hours: totalHours });
  } catch (error) {
    next(error);
  }
});

export default router;
