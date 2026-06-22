from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from database import get_db
from models import Contract as ContractModel
from schemas import Contract, ContractCreate

router = APIRouter()

@router.get("/", response_model=List[Contract])
def get_contracts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    contracts = db.query(ContractModel).offset(skip).limit(limit).all()
    for contract in contracts:
        if contract.tariff_lines:
            contract.tariff_lines = json.loads(contract.tariff_lines)
    return contracts

@router.get("/{contract_id}", response_model=Contract)
def get_contract(contract_id: str, db: Session = Depends(get_db)):
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if contract.tariff_lines:
        contract.tariff_lines = json.loads(contract.tariff_lines)
    return contract

@router.post("/", response_model=Contract)
def create_contract(contract: ContractCreate, db: Session = Depends(get_db)):
    db_contract = ContractModel(
        id=contract.id or f"ct{int(__import__('time').time())}",
        **contract.dict(exclude={'id', 'tariff_lines'})
    )
    db_contract.tariff_lines = json.dumps(contract.tariff_lines or [])
    
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    
    if db_contract.tariff_lines:
        db_contract.tariff_lines = json.loads(db_contract.tariff_lines)
    
    return db_contract

@router.put("/{contract_id}", response_model=Contract)
def update_contract(contract_id: str, contract: ContractCreate, db: Session = Depends(get_db)):
    db_contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()
    if not db_contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    for key, value in contract.dict(exclude={'id', 'tariff_lines'}).items():
        setattr(db_contract, key, value)
    
    db_contract.tariff_lines = json.dumps(contract.tariff_lines or [])
    
    db.commit()
    db.refresh(db_contract)
    
    if db_contract.tariff_lines:
        db_contract.tariff_lines = json.loads(db_contract.tariff_lines)
    
    return db_contract

@router.delete("/{contract_id}")
def delete_contract(contract_id: str, db: Session = Depends(get_db)):
    db_contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()
    if not db_contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    db.delete(db_contract)
    db.commit()
    return {"message": "Contract deleted"}