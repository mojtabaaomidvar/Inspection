import { Router, Request, Response } from 'express';
import db from '../config/database';

const router = Router();

// GET all contracts
router.get('/', (req: Request, res: Response) => {
  try {
    const contracts = db.prepare('SELECT * FROM contracts ORDER BY created_at DESC').all();
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// GET contract by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const contract = db.prepare('SELECT * FROM contracts WHERE id = ?').get(req.params.id);
    if (!contract) {
      res.status(404).json({ error: 'Contract not found' });
      return;
    }
    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

// POST create contract
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      id, contract_no, external_contract_no, source_type, source_ref,
      source_file, source_letter_date, source_letter_image,
      source_email_from, source_email_date, client_id, client_name,
      contract_title, start_date, end_date, total_value, invoiced,
      currency, status, type, tariffs, contract_count, tariff_lines,
      department, description
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO contracts (
        id, contract_no, external_contract_no, source_type, source_ref,
        source_file, source_letter_date, source_letter_image,
        source_email_from, source_email_date, client_id, client_name,
        contract_title, start_date, end_date, total_value, invoiced,
        currency, status, type, tariffs, contract_count, tariff_lines,
        department, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id || `ct${Date.now()}`, contract_no, external_contract_no, source_type,
      source_ref, source_file, source_letter_date, source_letter_image,
      source_email_from, source_email_date, client_id, client_name,
      contract_title, start_date, end_date, total_value || 0, invoiced || 0,
      currency || 'IRR', status || 'ACTIVE', type, tariffs || 0,
      contract_count || 1, JSON.stringify(tariff_lines || []), department, description
    );

    res.status(201).json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

// PUT update contract
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    db.prepare(`UPDATE contracts SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

// DELETE contract
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM contracts WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Contract not found' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contract' });
  }
});

export default router;