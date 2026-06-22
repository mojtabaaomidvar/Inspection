from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import ContractTariff as TariffModel
from schemas import Tariff, TariffCreate

router = APIRouter()

@router.get("/", response_model=List[Tariff])
def get_tariffs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(TariffModel).offset(skip).limit(limit).all()

@router.get("/contract/{contract_id}", response_model=List[Tariff])
def get_tariffs_by_contract(contract_id: str, db: Session = Depends(get_db)):
    return db.query(TariffModel).filter(TariffModel.contract_id == contract_id).all()

@router.post("/", response_model=Tariff)
def create_tariff(tariff: TariffCreate, db: Session = Depends(get_db)):
    db_tariff = TariffModel(
        id=tariff.id or f"t{int(__import__('time').time())}",
        **tariff.dict(exclude={'id'})
    )
    db.add(db_tariff)
    db.commit()
    db.refresh(db_tariff)
    return db_tariff

@router.put("/{tariff_id}", response_model=Tariff)
def update_tariff(tariff_id: str, tariff: TariffCreate, db: Session = Depends(get_db)):
    db_tariff = db.query(TariffModel).filter(TariffModel.id == tariff_id).first()
    if not db_tariff:
        raise HTTPException(status_code=404, detail="Tariff not found")
    
    for key, value in tariff.dict(exclude={'id'}).items():
        setattr(db_tariff, key, value)
    
    db.commit()
    db.refresh(db_tariff)
    return db_tariff

@router.delete("/{tariff_id}")
def delete_tariff(tariff_id: str, db: Session = Depends(get_db)):
    db_tariff = db.query(TariffModel).filter(TariffModel.id == tariff_id).first()
    if not db_tariff:
        raise HTTPException(status_code=404, detail="Tariff not found")
    db.delete(db_tariff)
    db.commit()
    return {"message": "Tariff deleted"}