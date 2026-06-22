from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False)
    name_en = Column(String, nullable=False)
    name_fa = Column(String, nullable=False)
    national_id = Column(String, nullable=True)
    email = Column(String, nullable=True)
    emails = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    category = Column(String, nullable=True)
    contacts = Column(Integer, default=0)
    contracts = Column(Integer, default=0)
    logo_color = Column(String, nullable=True)
    abbreviated_name = Column(String, nullable=True)
    company_type = Column(String, nullable=True)
    registration_no = Column(String, nullable=True)
    economic_code = Column(String, nullable=True)
    address_en = Column(Text, nullable=True)
    address_fa = Column(Text, nullable=True)
    departments = Column(Text, nullable=True)
    contact_persons = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Contract(Base):
    __tablename__ = "contracts"
    
    id = Column(String, primary_key=True, index=True)
    contract_no = Column(String, nullable=False)
    external_contract_no = Column(String, nullable=True)
    source_type = Column(String, nullable=True)
    source_ref = Column(String, nullable=True)
    source_file = Column(String, nullable=True)
    source_letter_date = Column(String, nullable=True)
    source_letter_image = Column(String, nullable=True)
    source_email_from = Column(String, nullable=True)
    source_email_date = Column(String, nullable=True)
    client_id = Column(String, nullable=False)
    client_name = Column(String, nullable=False)
    contract_title = Column(String, nullable=False)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    total_value = Column(Float, default=0)
    invoiced = Column(Float, default=0)
    currency = Column(String, default="IRR")
    status = Column(String, default="ACTIVE")
    type = Column(String, nullable=False)
    tariffs = Column(Integer, default=0)
    contract_count = Column(Integer, default=1)
    tariff_lines = Column(Text, nullable=True)
    department = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ContractTariff(Base):
    __tablename__ = "contract_tariffs"
    
    id = Column(String, primary_key=True, index=True)
    contract_id = Column(String, nullable=False)
    description = Column(String, nullable=False)
    unit = Column(String, nullable=False)
    rate = Column(Float, nullable=False)
    currency = Column(String, default="IRR")
    total = Column(Float, default=0)
    is_lump_sum = Column(Integer, default=0)
    total_quantity = Column(Float, default=0)
    consumed_quantity = Column(Float, default=0)
    invoiced = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())