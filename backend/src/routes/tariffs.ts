import { Router, Request, Response } from 'express';
import db from '../config/database';

const router = Router();

// GET all tariffs
router.get('/', (req: Request, res: Response) => {
  try {
    const tariffs = db.prepare('SELECT * FROM contract_tariffs ORDER BY created_at DESC').all();
    res.json(tariffs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tariffs' });
  }
});

// GET tariffs by contract ID
router.get('/contract/:contractId', (req: Request, res: Response) => {
  try {
    const tariffs = db.prepare('SELECT * FROM contract_tariffs WHERE contract_id = ?').all(req.params.contractId);
    res.json(tariffs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tariffs' });
  }
});

// POST create tariff
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      id, contract_id, description, unit, rate, currency, total,
      is_lump_sum, total_quantity, consumed_quantity, invoiced
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO contract_tariffs (
        id, contract_id, description, unit, rate, currency, total,
        is_lump_sum, total_quantity, consumed_quantity, invoiced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id || `t${Date.now()}`, contract_id, description, unit, rate,
      currency || 'IRR', total || 0, is_lump_sum ? 1 : 0,
      total_quantity || 0, consumed_quantity || 0, invoiced || 0
    );

    res.status(201).json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tariff' });
  }
});

// PUT update tariff
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    db.prepare(`UPDATE contract_tariffs SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tariff' });
  }
});

// DELETE tariff
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM contract_tariffs WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Tariff not found' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tariff' });
  }
});

export default router;