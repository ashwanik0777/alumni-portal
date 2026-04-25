import { postgresPool } from "@/lib/postgres";

export async function getWebTestimonials() {
  const result = await postgresPool.query(`SELECT id::text, quote, author, meta, company, outcome, is_active FROM home_testimonials ORDER BY created_at DESC`);
  return result.rows.map((r: Record<string, unknown>) => ({
    id: String(r.id),
    quote: String(r.quote),
    author: String(r.author),
    meta: String(r.meta),
    company: String(r.company),
    outcome: String(r.outcome),
    isActive: Boolean(r.is_active),
  }));
}

export async function addWebTestimonial(payload: { quote: string; author: string; meta: string; company: string; outcome: string }) {
  const result = await postgresPool.query(
    `INSERT INTO home_testimonials (quote, author, meta, company, outcome) VALUES ($1, $2, $3, $4, $5) RETURNING id::text`,
    [payload.quote.trim(), payload.author.trim(), payload.meta.trim(), payload.company.trim(), payload.outcome.trim()]
  );
  return { id: String(result.rows[0].id) };
}

export async function deleteWebTestimonial(id: string) {
  await postgresPool.query(`DELETE FROM home_testimonials WHERE id = $1`, [id]);
  return { ok: true };
}

export async function updateWebTestimonial(id: string, payload: { quote: string; author: string; meta: string; company: string; outcome: string }) {
  await postgresPool.query(
    `UPDATE home_testimonials SET quote = $1, author = $2, meta = $3, company = $4, outcome = $5 WHERE id = $6`,
    [payload.quote.trim(), payload.author.trim(), payload.meta.trim(), payload.company.trim(), payload.outcome.trim(), id]
  );
  return { ok: true };
}

export async function toggleTestimonialStatus(id: string, isActive: boolean) {
  await postgresPool.query(`UPDATE home_testimonials SET is_active = $1 WHERE id = $2`, [isActive, id]);
  return { ok: true };
}

// Committee Members
export async function getWebCommittee() {
  const result = await postgresPool.query(`SELECT id::text, role, name, batch, sort_order, is_active FROM home_committee ORDER BY sort_order ASC`);
  return result.rows.map((r: Record<string, unknown>) => ({
    id: String(r.id),
    role: String(r.role),
    name: String(r.name),
    batch: String(r.batch),
    sortOrder: Number(r.sort_order),
    isActive: Boolean(r.is_active),
  }));
}

export async function addWebCommittee(payload: { role: string; name: string; batch: string; sortOrder?: number }) {
  const countRes = await postgresPool.query(`SELECT COUNT(*) AS c FROM home_committee`);
  const sort = payload.sortOrder ?? Number(countRes.rows[0].c);

  const result = await postgresPool.query(
    `INSERT INTO home_committee (role, name, batch, sort_order) VALUES ($1, $2, $3, $4) RETURNING id::text`,
    [payload.role.trim(), payload.name.trim(), payload.batch.trim(), sort]
  );
  return { id: String(result.rows[0].id) };
}

export async function deleteWebCommittee(id: string) {
  await postgresPool.query(`DELETE FROM home_committee WHERE id = $1`, [id]);
  return { ok: true };
}

export async function updateWebCommittee(id: string, payload: { role: string; name: string; batch: string }) {
  await postgresPool.query(
    `UPDATE home_committee SET role = $1, name = $2, batch = $3 WHERE id = $4`,
    [payload.role.trim(), payload.name.trim(), payload.batch.trim(), id]
  );
  return { ok: true };
}

export async function toggleCommitteeStatus(id: string, isActive: boolean) {
  await postgresPool.query(`UPDATE home_committee SET is_active = $1 WHERE id = $2`, [isActive, id]);
  return { ok: true };
}
