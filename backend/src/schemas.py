from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ClientBase(BaseModel):
    type: str
    name_en: str
    name_fa: str
    national_id: Optional[str] = None
    email: Optional[str] = None
    emails: Optional[List[str]] = []
    phone: Optional[str] = None
    category: Optional[str] = None
    contacts: int = 0
    contracts: int = 0
    logo_color: Optional[str] = None
    abbreviated_name: Optional[str] = None
    company_type: Optional[str] = None
    registration_no: Optional[str] = None
    economic_code: Optional[str] = None
    address_en: Optional[str] = None
    address_fa: Optional[str] = None
    departments: Optional[List[str]] = []
    contact_persons: Optional[List[dict]] = []

class ClientCreate(ClientBase):
    id: Optional[str] = None

class Client(ClientBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ContractBase(BaseModel):
    contract_no: str
    external_contract_no: Optional[str] = None
    source_type: Optional[str] = None
    source_ref: Optional[str] = None
    source_file: Optional[str] = None
    source_letter_date: Optional[str] = None
    source_letter_image: Optional[str] = None
    source_email_from: Optional[str] = None
    source_email_date: Optional[str] = None
    client_id: str
    client_name: str
    contract_title: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    total_value: float = 0
    invoiced: float = 0
    currency: str = "IRR"
    status: str = "ACTIVE"
    type: str
    tariffs: int = 0
    contract_count: int = 1
    tariff_lines: Optional[List[dict]] = []
    department: Optional[str] = None
    description: Optional[str] = None

class ContractCreate(ContractBase):
    id: Optional[str] = None

class Contract(ContractBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TariffBase(BaseModel):
    contract_id: str
    description: str
    unit: str
    rate: float
    currency: str = "IRR"
    total: float = 0
    is_lump_sum: int = 0
    total_quantity: float = 0
    consumed_quantity: float = 0
    invoiced: float = 0

class TariffCreate(TariffBase):
    id: Optional[str] = None

class Tariff(TariffBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True