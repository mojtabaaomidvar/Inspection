from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from database import get_db
from models import Client as ClientModel
from schemas import Client, ClientCreate

router = APIRouter()

@router.get("/", response_model=List[Client])
def get_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    clients = db.query(ClientModel).offset(skip).limit(limit).all()
    for client in clients:
        if client.emails:
            client.emails = json.loads(client.emails)
        if client.departments:
            client.departments = json.loads(client.departments)
        if client.contact_persons:
            client.contact_persons = json.loads(client.contact_persons)
    return clients

@router.get("/{client_id}", response_model=Client)
def get_client(client_id: str, db: Session = Depends(get_db)):
    client = db.query(ClientModel).filter(ClientModel.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if client.emails:
        client.emails = json.loads(client.emails)
    if client.departments:
        client.departments = json.loads(client.departments)
    if client.contact_persons:
        client.contact_persons = json.loads(client.contact_persons)
    return client

@router.post("/", response_model=Client)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    db_client = ClientModel(
        id=client.id or f"c{int(__import__('time').time())}",
        **client.dict(exclude={'id', 'emails', 'departments', 'contact_persons'})
    )
    db_client.emails = json.dumps(client.emails or [])
    db_client.departments = json.dumps(client.departments or [])
    db_client.contact_persons = json.dumps(client.contact_persons or [])
    
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    
    if db_client.emails:
        db_client.emails = json.loads(db_client.emails)
    if db_client.departments:
        db_client.departments = json.loads(db_client.departments)
    if db_client.contact_persons:
        db_client.contact_persons = json.loads(db_client.contact_persons)
    
    return db_client

@router.put("/{client_id}", response_model=Client)
def update_client(client_id: str, client: ClientCreate, db: Session = Depends(get_db)):
    db_client = db.query(ClientModel).filter(ClientModel.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    for key, value in client.dict(exclude={'id', 'emails', 'departments', 'contact_persons'}).items():
        setattr(db_client, key, value)
    
    db_client.emails = json.dumps(client.emails or [])
    db_client.departments = json.dumps(client.departments or [])
    db_client.contact_persons = json.dumps(client.contact_persons or [])
    
    db.commit()
    db.refresh(db_client)
    
    if db_client.emails:
        db_client.emails = json.loads(db_client.emails)
    if db_client.departments:
        db_client.departments = json.loads(db_client.departments)
    if db_client.contact_persons:
        db_client.contact_persons = json.loads(db_client.contact_persons)
    
    return db_client

@router.delete("/{client_id}")
def delete_client(client_id: str, db: Session = Depends(get_db)):
    db_client = db.query(ClientModel).filter(ClientModel.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(db_client)
    db.commit()
    return {"message": "Client deleted"}