import { db, TimeLog } from '../db/database.js';

// TODO: Student implementation - Part 2: DAL for time logs

export async function insertTimeLog(
  ticketId: number,
  userId: number,
  hours: number,
): Promise<TimeLog> {
  // TODO: Student implementation
  return await db
    .insertInto('time_logs')
    .values({
      ticket_id: ticketId,
      user_id: userId,
      hours,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function getTotalHoursForTicket(
  ticketId: number,
): Promise<number> {
  const result = await db
    .selectFrom('time_logs')
    .select((eb) => eb.fn.sum<number>('hours').as('total_hours'))
    .where('ticket_id', '=', ticketId)
    .executeTakeFirstOrThrow();

  // SUM returns null when a ticket has no logs
  return Number(result.total_hours ?? 0);
}
