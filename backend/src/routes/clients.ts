import { Router, Request, Response } from 'express';
import db from '../config/database';

const router = Router();

// GET all clients
router.get('/', (req: Request, res: Response) => {
  try {
    const clients = db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// GET client by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// POST create client
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      id, type, name_en, name_fa, national_id, email, emails, phone,
      category, contacts, contracts, logo_color, abbreviated_name,
      company_type, registration_no, economic_code, address_en,
      address_fa, departments, contact_persons
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO clients (
        id, type, name_en, name_fa, national_id, email, emails, phone,
        category, contacts, contracts, logo_color, abbreviated_name,
        company_type, registration_no, economic_code, address_en,
        address_fa, departments, contact_persons
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id || `c${Date.now()}`, type, name_en, name_fa, national_id, email,
      JSON.stringify(emails || []), phone, category, contacts || 0,
      contracts || 0, logo_color, abbreviated_name, company_type,
      registration_no, economic_code, address_en, address_fa,
      JSON.stringify(departments || []), JSON.stringify(contact_persons || [])
    );

    res.status(201).json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// PUT update client
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    db.prepare(`UPDATE clients SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// DELETE client
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;