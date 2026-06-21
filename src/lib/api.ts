const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchClients() {
  const res = await fetch(`${API_BASE}/api/clients`);
  if (!res.ok) throw new Error('Failed to fetch clients');
  return res.json();
}

export async function createClient(data: any) {
  const res = await fetch(`${API_BASE}/api/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create client');
  return res.json();
}

export async function updateClient(id: string, data: any) {
  const res = await fetch(`${API_BASE}/api/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update client');
  return res.json();
}

export async function deleteClient(id: string) {
  const res = await fetch(`${API_BASE}/api/clients/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete client');
  return res.json();
}

export async function fetchContracts() {
  const res = await fetch(`${API_BASE}/api/contracts`);
  if (!res.ok) throw new Error('Failed to fetch contracts');
  return res.json();
}

export async function createContract(data: any) {
  const res = await fetch(`${API_BASE}/api/contracts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create contract');
  return res.json();
}

export async function updateContract(id: string, data: any) {
  const res = await fetch(`${API_BASE}/api/contracts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update contract');
  return res.json();
}

export async function deleteContract(id: string) {
  const res = await fetch(`${API_BASE}/api/contracts/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete contract');
  return res.json();
}

export async function fetchTariffs() {
  const res = await fetch(`${API_BASE}/api/tariffs`);
  if (!res.ok) throw new Error('Failed to fetch tariffs');
  return res.json();
}

export async function fetchTariffsByContract(contractId: string) {
  const res = await fetch(`${API_BASE}/api/tariffs/contract/${contractId}`);
  if (!res.ok) throw new Error('Failed to fetch tariffs');
  return res.json();
}

export async function createTariff(data: any) {
  const res = await fetch(`${API_BASE}/api/tariffs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create tariff');
  return res.json();
}

export async function updateTariff(id: string, data: any) {
  const res = await fetch(`${API_BASE}/api/tariffs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update tariff');
  return res.json();
}

export async function deleteTariff(id: string) {
  const res = await fetch(`${API_BASE}/api/tariffs/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete tariff');
  return res.json();
}