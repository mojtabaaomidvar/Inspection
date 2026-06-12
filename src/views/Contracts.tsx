import { useState, useMemo, useEffect } from "react";
import { Card, Badge, Button, Avatar, Modal } from "../components/ui";
import {
  contracts as initialContracts,
  clients,
  contractTariffs,
} from "../data/mockData";
import { formatCurrency, contractHealth } from "../lib/formatters";
import { exportToExcel } from "../lib/exportToExcel";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import jalaali from "jalaali-js";

// ============ TYPES ============
interface Contract {
  id: string;
  contract_no: string;
  external_contract_no?: string;
  source_type?: "EMAIL" | "LETTER";
  source_ref?: string;
  source_file?: string;
  source_email_from?: string;
  source_email_subject?: string;
  source_email_date?: string;
  client_id: string;
  client_name: string;
  contract_title: string;
  start_date: string;
  end_date: string;
  total_value: number;
  invoiced: number;
  currency: string;
  status: "ACTIVE" | "PENDING" | "CLOSED";
  type: "CONTRACT" | "WORK_ORDER";
  tariffs: number;
  department: string;
  description?: string;
}

const CURRENT_DEPARTMENT = "Unit A";
const DEPT_CODE = "UNA";

// ============ JALAALI HELPERS ============
const getCurrentJalaaliYear = (): number => {
  const now = new Date();
  const j = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return j.jy;
};

const generateContractNo = (
  type: "CONTRACT" | "WORK_ORDER",
  contracts: Contract[]
): string => {
  const year = getCurrentJalaaliYear();
  const prefix = type === "CONTRACT" ? "CTR" : "WO";
  const count = contracts.filter((c) => c.department === CURRENT_DEPARTMENT && c.type === type).length + 1;
  return `${prefix}-${DEPT_CODE}-${year}-${String(count).padStart(4, "0")}`;
};

// ============ PERSIAN DATE PICKER ============
interface JalaaliDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  disabled?: boolean;
}

function JalaaliDatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "تاریخ را انتخاب کنید",
  disabled = false,
}: JalaaliDatePickerProps) {
  const handleSelect = (date: any) => {
    if (date && !Array.isArray(date)) {
      const formatted = `${date.year}/${String(date.month.index).padStart(2, "0")}/${String(date.day).padStart(2, "0")}`;
      onChange(formatted);
    } else {
      onChange("");
    }
  };

  return (
    <DatePicker
      calendar={persian}
      locale={persian_fa}
      value={value || undefined}
      onChange={handleSelect}
      calendarPosition="bottom-right"
      inputClass="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
      placeholder={placeholder}
      disabled={disabled}
      minDate={minDate}
      maxDate={maxDate}
      format="YYYY/DD/MM"
      calendarClassNames="!font-sans"
    />
  );
}

// ============ MAIN COMPONENT ============
export function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [typeFilter, setTypeFilter] = useState<"ALL" | "CONTRACT" | "WORK_ORDER">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "PENDING" | "CLOSED">("ALL");
  const [sortBy, setSortBy] = useState<"date" | "value" | "status">("date");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
	  contract_no: "",
	  external_contract_no: "",
	  source_type: "LETTER" as "EMAIL" | "LETTER",
	  source_ref: "",
	  source_file: "",
	  source_file_object: null as File | null, // 🔑 این خط را اضافه کنید
	  source_email_from: "",
	  source_email_subject: "",
	  source_email_date: "",
	  client_id: "",
	  contract_title: "",
	  start_date: "",
	  end_date: "",
	  total_value: 0,
	  currency: "USD",
	  status: "PENDING" as "ACTIVE" | "PENDING" | "CLOSED",
	  type: "CONTRACT" as "CONTRACT" | "WORK_ORDER",
	  description: "",
	});
  const [editForm, setEditForm] = useState<any>({});
  const [addErrors, setAddErrors] = useState<any>({});

  // State برای Modal نمایش قراردادهای قبلی مشتری
  const [isClientContractsOpen, setIsClientContractsOpen] = useState(false);
  const [clientContractsList, setClientContractsList] = useState<Contract[]>([]);
  const [selectedClientForView, setSelectedClientForView] = useState<any>(null);
  const [viewFilterType, setViewFilterType] = useState<"ALL" | "CONTRACT" | "WORK_ORDER">("ALL");
  const [viewFilterStatus, setViewFilterStatus] = useState<string>("ALL");

  // ============ COMPUTED VALUES ============
  const contractCounts = useMemo(() => ({
    total: contracts.length,
    active: contracts.filter((c) => c.status === "ACTIVE").length,
    pending: contracts.filter((c) => c.status === "PENDING").length,
    closed: contracts.filter((c) => c.status === "CLOSED").length,
    contractType: contracts.filter((c) => c.type === "CONTRACT").length,
    workOrderType: contracts.filter((c) => c.type === "WORK_ORDER").length,
    totalValue: contracts.reduce((sum, c) => sum + c.total_value, 0),
    totalInvoiced: contracts.reduce((sum, c) => sum + c.invoiced, 0),
  }), [contracts]);

  const availableStatuses = useMemo(() => {
    const statuses = new Set(contracts.map((c) => c.status));
    return Array.from(statuses);
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    let result = contracts.filter((contract) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        contract.contract_no.toLowerCase().includes(query) ||
        (contract.external_contract_no && contract.external_contract_no.toLowerCase().includes(query)) ||
        contract.client_name.toLowerCase().includes(query) ||
        contract.contract_title.toLowerCase().includes(query);
      const matchesType = typeFilter === "ALL" || contract.type === typeFilter;
      const matchesStatus = statusFilter === "ALL" || contract.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });

    return result.sort((a, b) => {
      if (sortBy === "date") {
        return b.start_date.localeCompare(a.start_date);
      }
      if (sortBy === "value") {
        return b.total_value - a.total_value;
      }
      if (sortBy === "status") {
        const order: Record<string, number> = { ACTIVE: 1, PENDING: 2, CLOSED: 3 };
        return (order[a.status] || 99) - (order[b.status] || 99);
      }
      return 0;
    });
  }, [searchQuery, typeFilter, statusFilter, sortBy, contracts]);

  const selectedTariffs = useMemo(() => {
    if (!selectedContract) return [];
    return contractTariffs.filter((t) => t.contract_id === selectedContract.id);
  }, [selectedContract]);

  // 🔑 ریست فرم هنگام تغییر نوع قرارداد
  useEffect(() => {
    if (isAddModalOpen) {
      const newContractNo = generateContractNo(addForm.type, contracts);
      setAddForm((prev) => ({
        ...prev,
        contract_no: newContractNo,
        external_contract_no: "",
        source_type: "LETTER",
        source_ref: "",
        source_file: "",
        source_email_from: "",
        source_email_subject: "",
        source_email_date: "",
        client_id: "",
        contract_title: "",
        start_date: "",
        end_date: "",
        total_value: 0,
        currency: "USD",
        status: "PENDING",
        description: "",
      }));
      setAddErrors({});
    }
  }, [addForm.type]);

  const getExistingContractsForClient = (clientId: string) => {
    return contracts.filter((c) => c.client_id === clientId && c.department === CURRENT_DEPARTMENT);
  };

  // ============ HANDLERS ============
  const handleExportToExcel = () => {
    const dataToExport = filteredContracts.map((c) => ({
      "شماره داخلی": c.contract_no,
      "نوع": c.type === "CONTRACT" ? "قرارداد" : "سفارش کار",
      "مشتری": c.client_name,
      "عنوان": c.contract_title,
      "وضعیت": c.status,
      "تاریخ شروع": c.start_date,
      "تاریخ پایان": c.end_date,
      "ارزش کل": c.total_value,
    }));
    const filterName = typeFilter === "ALL" ? "All" : typeFilter === "CONTRACT" ? "Contracts" : "WorkOrders";
    const today = new Date().toISOString().split("T")[0];
    exportToExcel(dataToExport, `${filterName}_Contracts_${today}`, "Contracts");
  };

  const handleAddClick = () => {
    const contractNo = generateContractNo("CONTRACT", contracts);
    setAddForm({
      contract_no: contractNo,
      external_contract_no: "",
      source_type: "LETTER",
      source_ref: "",
      source_file: "",
	  source_file_object: null,
      source_email_from: "",
      source_email_subject: "",
      source_email_date: "",
      client_id: "",
      contract_title: "",
      start_date: "",
      end_date: "",
      total_value: 0,
      currency: "USD",
      status: "PENDING",
      type: "CONTRACT",
      description: "",
    });
    setAddErrors({});
    setIsAddModalOpen(true);
  };

  const validateAddForm = () => {
    const errors: any = {};
    if (addForm.type === "CONTRACT") {
      if (!addForm.contract_title.trim()) errors.contract_title = "عنوان قرارداد الزامی است";
      if (!addForm.client_id) errors.client_id = "انتخاب مشتری الزامی است";
      if (!addForm.start_date) errors.start_date = "تاریخ شروع الزامی است";
      if (!addForm.end_date) errors.end_date = "تاریخ پایان الزامی است";
      if (addForm.start_date && addForm.end_date && addForm.end_date < addForm.start_date) {
        errors.end_date = "تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد";
      }
      if (addForm.total_value <= 0) errors.total_value = "مبلغ باید بیشتر از صفر باشد";
    } else {
      // Work Order validation
      if (addForm.source_type === "LETTER" && !addForm.source_ref.trim()) {
        errors.source_ref = "شماره نامه الزامی است";
      }
      if (addForm.source_type === "EMAIL" && !addForm.source_email_from.trim()) {
        errors.source_email_from = "آدرس ایمیل الزامی است";
		<div>
		  <label className="mb-1.5 block text-xs font-semibold text-slate-700">From Email Address *</label>
			<div>
			  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Attach Email File (Optional)</label>
			  <input 
				type="file" 
				accept=".msg,.eml"
				onChange={(e) => {
				  const file = e.target.files?.[0];
				  if (file) setAddForm({ ...addForm, source_file: file.name });
				}} 
				className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
			  />
			  {addForm.source_file && (
				<p className="mt-1 text-xs text-emerald-600">📎 {addForm.source_file}</p>
			  )}
			</div>
		  {addErrors.source_email_from && <p className="mt-1 text-[11px] font-medium text-rose-600">✕ {addErrors.source_email_from}</p>}
		</div>
      }
    }
    setAddErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAdd = () => {
    if (!validateAddForm()) return;
    const client = clients.find((c) => c.id === addForm.client_id);
    const newContract: Contract = {
      id: `ct${Date.now()}`,
      ...addForm,
      client_name: client?.name_en || "N/A",
      invoiced: 0,
      tariffs: 0,
      department: CURRENT_DEPARTMENT,
    };
    setContracts([newContract, ...contracts]);
    setSelectedContract(newContract);
    setIsDetailsOpen(true);
    setIsAddModalOpen(false);
  };

  const handleEditClick = () => {
    if (!selectedContract) return;
    setEditForm({ ...selectedContract });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedContract) return;
    const updatedContracts = contracts.map((c) =>
      c.id === selectedContract.id ? { ...c, ...editForm } : c
    );
    setContracts(updatedContracts);
    setSelectedContract({ ...selectedContract, ...editForm });
    setIsEditModalOpen(false);
  };

  const handleTypeChange = (type: "CONTRACT" | "WORK_ORDER") => {
    setAddForm({ ...addForm, type });
  };

  const handleAddClientChange = (clientId: string) => {
    setAddForm({ ...addForm, client_id: clientId });
  };

  const handleViewClientContracts = () => {
    if (!addForm.client_id) return;
    let existingContracts = contracts.filter(
      (c) => c.client_id === addForm.client_id && c.department === CURRENT_DEPARTMENT
    );
    if (addForm.type === "WORK_ORDER") {
      existingContracts = existingContracts.filter((c) => c.type === "WORK_ORDER");
      setViewFilterType("WORK_ORDER");
    } else {
      setViewFilterType("ALL");
    }
    const client = clients.find((c) => c.id === addForm.client_id);
    setClientContractsList(existingContracts);
    setSelectedClientForView(client);
    setViewFilterStatus("ALL");
    setIsClientContractsOpen(true);
  };

  const handleEditClientChange = (clientId: string) => {
    setEditForm({ ...editForm, client_id: clientId });
  };

  const handleViewEditClientContracts = () => {
    if (!editForm.client_id) return;
    let existingContracts = contracts.filter(
      (c) => c.client_id === editForm.client_id && c.department === CURRENT_DEPARTMENT
    );
    if (editForm.type === "WORK_ORDER") {
      existingContracts = existingContracts.filter((c) => c.type === "WORK_ORDER");
      setViewFilterType("WORK_ORDER");
    } else {
      setViewFilterType("ALL");
    }
    const client = clients.find((c) => c.id === editForm.client_id);
    setClientContractsList(existingContracts);
    setSelectedClientForView(client);
    setViewFilterStatus("ALL");
    setIsClientContractsOpen(true);
  };

  const filteredClientContracts = useMemo(() => {
    let result = clientContractsList;
    if (viewFilterType !== "ALL") {
      result = result.filter((c) => c.type === viewFilterType);
    }
    if (viewFilterStatus !== "ALL") {
      result = result.filter((c) => c.status === viewFilterStatus);
    }
    return result;
  }, [clientContractsList, viewFilterType, viewFilterStatus]);

  const clientContractCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: clientContractsList.length };
    clientContractsList.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return counts;
  }, [clientContractsList]);

  // ============ RENDER ============
  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)] p-6">
      {/* LEFT PANEL */}
      <div className={`${isDetailsOpen ? 'col-span-4' : 'col-span-12'} relative flex flex-col bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden transition-all duration-300 ease-in-out`}>
        <div className="relative z-10 border-b border-slate-100 px-4 py-4 bg-slate-50/50 space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-slate-900 shrink-0">Contracts</h3>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search by contract no, client, title..." 
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" 
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">✕</button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={handleExportToExcel} className="shrink-0 gap-1.5 text-xs">
              📥 Export
            </Button>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "value" | "status")}
                className="appearance-none text-xs rounded-md border border-slate-200 bg-white pl-2 pr-6 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer hover:bg-slate-50"
              >
                <option value="date">Latest First</option>
                <option value="value">Highest Value</option>
                <option value="status">By Status</option>
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]">▼</span>
            </div>
          </div>

          <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
            {(["ALL", "CONTRACT", "WORK_ORDER"] as const).map((t) => {
              const count = t === "ALL" ? contractCounts.total : t === "CONTRACT" ? contractCounts.contractType : contractCounts.workOrderType;
              return (
                <button key={t} onClick={() => setTypeFilter(t)} className={`flex-1 rounded-md px-2 py-1.5 font-medium transition-colors ${typeFilter === t ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}>
                  {t === "ALL" ? `All (${count})` : t === "CONTRACT" ? `📄 Contracts (${count})` : `📦 Work Orders (${count})`}
                </button>
              );
            })}
          </div>

          <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
            {(["ALL", "ACTIVE", "PENDING", "CLOSED"] as const).map((t) => {
              const count = t === "ALL" ? contractCounts.total : t === "ACTIVE" ? contractCounts.active : t === "PENDING" ? contractCounts.pending : contractCounts.closed;
              return (
                <button key={t} onClick={() => setStatusFilter(t)} className={`flex-1 rounded-md px-2 py-1.5 font-medium transition-colors ${statusFilter === t ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:text-slate-700"}`}>
                  {t === "ALL" ? `All (${count})` : t === "ACTIVE" ? `🟢 Active (${count})` : t === "PENDING" ? `🟡 Pending (${count})` : `⚫ Closed (${count})`}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pb-24">
          {filteredContracts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-sm text-slate-500">No contracts found</p>
            </div>
          ) : (
            filteredContracts.map((contract) => {
              const health = contractHealth(contract);
              return (
                <div 
                  key={contract.id} 
                  onClick={() => { setSelectedContract(contract); setIsDetailsOpen(true); }} 
                  className={`flex flex-col gap-2 px-4 py-3 border-b border-slate-100 cursor-pointer transition-colors ${selectedContract?.id === contract.id ? "bg-indigo-50 border-l-4 border-l-indigo-500" : "hover:bg-slate-50"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge tone={contract.type === "CONTRACT" ? "indigo" : "amber"}>
                          {contract.type === "CONTRACT" ? "Contract" : "Work Order"}
                        </Badge>
                        <span className="font-mono text-xs text-slate-500">{contract.contract_no}</span>
                      </div>
                      <div className="text-sm font-medium text-slate-900 truncate">{contract.contract_title}</div>
                      <div className="text-xs text-slate-500 truncate">{contract.client_name}</div>
                    </div>
                    <Badge tone={contract.status === "ACTIVE" ? "emerald" : contract.status === "PENDING" ? "amber" : "slate"}>
                      {contract.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500" dir="rtl">{contract.start_date} → {contract.end_date}</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(contract.total_value, contract.currency)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${health.budgetTone === "emerald" ? "bg-emerald-500" : health.budgetTone === "amber" ? "bg-amber-500" : "bg-rose-500"}`} 
                      style={{ width: `${Math.min(health.spent, 100)}%` }} 
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none z-10" />

        <div className="absolute bottom-6 left-0 right-0 px-6 z-20">
          <Button 
            variant="primary" 
            size="md" 
            onClick={handleAddClick} 
            className="w-full justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            <span>➕</span> Add New Contract
          </Button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      {isDetailsOpen && selectedContract && (
        <div className="col-span-8 flex flex-col bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-right-4">
          <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contract Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsDetailsOpen(false)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">✕ Close Panel</Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-lg font-bold">
                  📄
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedContract.contract_title}</h3>
                  <p className="text-sm text-slate-500 font-mono">{selectedContract.contract_no} • {selectedContract.client_name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge tone={selectedContract.type === "CONTRACT" ? "indigo" : "amber"}>
                      {selectedContract.type === "CONTRACT" ? "Contract" : "Work Order"}
                    </Badge>
                    <Badge tone={selectedContract.status === "ACTIVE" ? "emerald" : selectedContract.status === "PENDING" ? "amber" : "slate"}>
                      {selectedContract.status}
                    </Badge>
                    <Badge tone="slate">{selectedContract.department}</Badge>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="md" onClick={handleEditClick} className="gap-2 shadow-sm">
                <span>✏️</span> Edit Contract
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/30">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">📋 Contract Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Internal No (ICS)</div><div className="font-mono text-xs text-slate-900">{selectedContract.contract_no}</div></div>
                  <div><div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">External No</div><div className="font-mono text-xs text-slate-900">{selectedContract.external_contract_no || "—"}</div></div>
                  <div><div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Department</div><div className="text-xs text-slate-900">{selectedContract.department}</div></div>
                  <div><div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Start Date</div><div className="text-xs text-slate-900" dir="rtl">{selectedContract.start_date}</div></div>
                  <div><div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">End Date</div><div className="text-xs text-slate-900" dir="rtl">{selectedContract.end_date}</div></div>
                  <div><div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Currency</div><div className="text-xs text-slate-900">{selectedContract.currency}</div></div>
                  <div><div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Total Value</div><div className="text-xs font-semibold text-emerald-600">{formatCurrency(selectedContract.total_value, selectedContract.currency)}</div></div>
                  <div><div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Invoiced</div><div className="text-xs font-semibold text-indigo-600">{formatCurrency(selectedContract.invoiced, selectedContract.currency)}</div></div>
                  <div><div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Remaining</div><div className="text-xs font-semibold text-slate-900">{formatCurrency(selectedContract.total_value - selectedContract.invoiced, selectedContract.currency)}</div></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 bg-slate-50/50">
                  <div className="text-xs text-slate-500">Budget Used</div>
                  <div className={`text-lg font-bold ${contractHealth(selectedContract).budgetTone === "emerald" ? "text-emerald-600" : contractHealth(selectedContract).budgetTone === "amber" ? "text-amber-600" : "text-rose-600"}`}>
                    {contractHealth(selectedContract).spent.toFixed(1)}%
                  </div>
                </Card>
                <Card className="p-4 bg-slate-50/50">
                  <div className="text-xs text-slate-500">Time Remaining</div>
                  <div className="text-lg font-bold text-slate-900">
                    {contractHealth(selectedContract).daysLeft > 0 ? `${contractHealth(selectedContract).daysLeft} days` : `${-contractHealth(selectedContract).daysLeft} days overdue`}
                  </div>
                </Card>
                <Card className="p-4 bg-slate-50/50">
                  <div className="text-xs text-slate-500">{selectedTariffs.length === 1 ? "Tariff" : "Tariffs"}</div>
                  <div className="text-lg font-bold text-slate-900">{selectedTariffs.length}</div>
                </Card>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Tariff Lines & Consumption</h3>
                {selectedTariffs.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">No tariff lines defined for this contract</div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-3 py-2 font-medium">Description</th>
                          <th className="px-3 py-2 font-medium">Unit</th>
                          <th className="px-3 py-2 font-medium text-right">Rate</th>
                          <th className="px-3 py-2 font-medium text-center">Performed Work</th>
                          <th className="px-3 py-2 font-medium text-right">Total Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedTariffs.map((tariff) => {
                          const value = tariff.consumed_quantity * tariff.rate;
                          return (
                            <tr key={tariff.id} className="hover:bg-slate-50/60">
                              <td className="px-3 py-2 font-medium text-slate-800">{tariff.description}</td>
                              <td className="px-3 py-2"><Badge tone="indigo">{tariff.unit.replace("_", " ")}</Badge></td>
                              <td className="px-3 py-2 text-right font-mono">{formatCurrency(tariff.rate, selectedContract.currency)}</td>
                              <td className="px-3 py-2 text-center font-mono">{tariff.consumed_quantity}</td>
                              <td className="px-3 py-2 text-right font-mono font-semibold">{formatCurrency(value, selectedContract.currency)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD CONTRACT MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Contract" size="lg">
        <div className="space-y-4">
          {/* Type Selection */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Type *</label>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => handleTypeChange("CONTRACT")} 
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${addForm.type === "CONTRACT" ? "bg-indigo-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                📄 Contract
              </button>
              <button 
                type="button" 
                onClick={() => handleTypeChange("WORK_ORDER")} 
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${addForm.type === "WORK_ORDER" ? "bg-amber-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                 Work Order
              </button>
            </div>
          </div>

          {/* Internal Contract Number */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Internal Contract No (ICS)</label>
            <div className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm font-mono text-slate-700 font-semibold">
              {addForm.contract_no}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Auto-generated, unique per department</p>
          </div>

          {/* 🔑 فرم بر اساس نوع */}
          {addForm.type === "CONTRACT" ? (
            <>
              {/* Contract Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">External Contract No (Optional)</label>
                  <input 
                    value={addForm.external_contract_no} 
                    onChange={(e) => setAddForm({ ...addForm, external_contract_no: e.target.value })} 
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" 
                    placeholder="Client's contract number"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Client *</label>
                  <div className="flex gap-2">
                    <select 
                      value={addForm.client_id} 
                      onChange={(e) => handleAddClientChange(e.target.value)} 
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 ${addErrors.client_id ? "border-rose-300" : "border-slate-200 focus:border-indigo-400"}`}
                    >
                      <option value="">Select Client...</option>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.name_en} ({c.name_fa})</option>)}
                    </select>
                    {addForm.client_id && getExistingContractsForClient(addForm.client_id).length > 0 && (
                      <Button variant="outline" size="sm" onClick={handleViewClientContracts} className="shrink-0 gap-1.5">
                        👁️ View ({getExistingContractsForClient(addForm.client_id).length})
                      </Button>
                    )}
                  </div>
                  {addErrors.client_id && <p className="mt-1 text-[11px] font-medium text-rose-600">✕ {addErrors.client_id}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Contract Title *</label>
                <input 
                  value={addForm.contract_title} 
                  onChange={(e) => setAddForm({ ...addForm, contract_title: e.target.value })} 
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 ${addErrors.contract_title ? "border-rose-300" : "border-slate-200 focus:border-indigo-400"}`}
                  placeholder="e.g., South Pars Phase 22 — TPI"
                />
                {addErrors.contract_title && <p className="mt-1 text-[11px] font-medium text-rose-600">✕ {addErrors.contract_title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Start Date *</label>
                  <JalaaliDatePicker
                    value={addForm.start_date}
                    onChange={(date) => setAddForm({ ...addForm, start_date: date })}
                    placeholder="Start Date"
                  />
                  {addErrors.start_date && <p className="mt-1 text-[11px] font-medium text-rose-600">✕ {addErrors.start_date}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">End Date *</label>
                  <JalaaliDatePicker
                    value={addForm.end_date}
                    onChange={(date) => setAddForm({ ...addForm, end_date: date })}
                    minDate={addForm.start_date}
                    placeholder="End Date"
                  />
                  {addErrors.end_date && <p className="mt-1 text-[11px] font-medium text-rose-600">✕ {addErrors.end_date}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Total Value *</label>
                  <input 
                    type="number" 
                    value={addForm.total_value || ""} 
                    onChange={(e) => setAddForm({ ...addForm, total_value: Number(e.target.value) })} 
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 ${addErrors.total_value ? "border-rose-300" : "border-slate-200 focus:border-indigo-400"}`}
                    placeholder="0"
                  />
                  {addErrors.total_value && <p className="mt-1 text-[11px] font-medium text-rose-600">✕ {addErrors.total_value}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Currency</label>
                  <select value={addForm.currency} onChange={(e) => setAddForm({ ...addForm, currency: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="IRR">IRR</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Status</label>
                  <select value={addForm.status} onChange={(e) => setAddForm({ ...addForm, status: e.target.value as any })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100">
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Description</label>
                <textarea 
                  value={addForm.description} 
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} 
                  rows={3} 
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100" 
                  placeholder="Optional description..."
                />
              </div>
            </>
          ) : (
            <>
              {/* Work Order Form - Simplified */}
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                <h3 className="text-sm font-semibold text-amber-900 mb-2">📦 Work Order Request Source</h3>
                <p className="text-xs text-amber-700">Specify the source of this work order request</p>
              </div>

              {/* Source Type Selector */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Source Type *</label>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setAddForm({ ...addForm, source_type: "LETTER" })} 
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${addForm.source_type === "LETTER" ? "bg-emerald-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    📄 Letter
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setAddForm({ ...addForm, source_type: "EMAIL" })} 
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${addForm.source_type === "EMAIL" ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    📧 Email
                  </button>
                </div>
              </div>

              {/* Source Details based on Type */}
              {addForm.source_type === "LETTER" ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Letter Number (شماره نامه) *</label>
                    <input 
                      value={addForm.source_ref} 
                      onChange={(e) => setAddForm({ ...addForm, source_ref: e.target.value })} 
                      className={`w-full rounded-lg border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-100 ${addErrors.source_ref ? "border-rose-300" : "border-slate-200 focus:border-indigo-400"}`}
                      placeholder="e.g., 1404/1234"
                    />
                    {addErrors.source_ref && <p className="mt-1 text-[11px] font-medium text-rose-600">✕ {addErrors.source_ref}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Attach Letter File</label>
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.png,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setAddForm({ ...addForm, source_file: file.name });
                      }} 
                      className="flex items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                    />
                    {addForm.source_file && (
                      <p className="mt-1 text-xs text-emerald-600">📎 {addForm.source_file}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
				{/* 🔑 آپلود فایل ایمیل - سمت چپ */}
					<div>
						<label className="mb-1.5 block text-xs font-semibold text-slate-700">Attach Email File *</label>
						<div className="relative">
						  <input 
							type="file" 
							id="email-file-input"
							accept=".msg,.eml"
							onChange={(e) => {
							  const file = e.target.files?.[0];
							  if (file) {
								setAddForm({ 
								  ...addForm, 
								  source_file: file.name,
								  source_file_object: file
								});
							  }
							}} 
							className="hidden"
						  />
							<label 
							htmlFor="email-file-input"
							className={`flex items-center justify-between gap-2 w-full rounded-lg border-2 px-3 py-2.5 text-sm cursor-pointer transition-colors ${
							  addForm.source_file 
								? "border-emerald-400 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" 
								: "border-dashed border-slate-300 bg-slate-50 text-slate-600 hover:border-indigo-400 hover:bg-indigo-50"
							}`}
						  >
							{addForm.source_file ? (
							 <>
								<button
								  type="button"
								  onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									if (addForm.source_file_object) {
									  const url = URL.createObjectURL(addForm.source_file_object);
									  window.open(url, '_blank');
									}
								  }}
								  className="flex items-center gap-2 flex-1 text-left hover:underline min-w-0"
								  title="Click to open email"
								>
								  <span>📧</span>
								  <span className="truncate font-medium">{addForm.source_file}</span>
								</button>
								<button 
								  type="button"
								  onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									setAddForm({ ...addForm, source_file: "", source_file_object: null });
									const input = document.getElementById('email-file-input') as HTMLInputElement;
									if (input) input.value = '';
								  }}
								  className="shrink-0 p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded transition-colors"
								  title="Remove file"
								>
								  ✕
								</button>
							  </>
							) : (
							 <div className="flex items-center gap-2">
								<span>📎</span>
								<span>Click to attach (.msg, .eml)</span>
							 </div>
							)}
							</label>
						</div>
					</div>

					<div>
						<label className="mb-1.5 block text-xs font-semibold text-slate-700">Email Date *</label>
						<input 
						  type="date"
						  value={addForm.source_email_date}
						  onChange={(e) => setAddForm({ ...addForm, source_email_date: e.target.value })}
						  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
						/>
					</div>
				</div>
              )}

              {/* Optional fields for WO */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Client (Optional)</label>
                <div className="flex gap-2">
                  <select 
                    value={addForm.client_id} 
                    onChange={(e) => handleAddClientChange(e.target.value)} 
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Select Client...</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name_en} ({c.name_fa})</option>)}
                  </select>
                  {addForm.client_id && getExistingContractsForClient(addForm.client_id).length > 0 && (
                    <Button variant="outline" size="sm" onClick={handleViewClientContracts} className="shrink-0 gap-1.5">
                      👁️ View ({getExistingContractsForClient(addForm.client_id).length})
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Work Order Title (Optional)</label>
                <input 
                  value={addForm.contract_title} 
                  onChange={(e) => setAddForm({ ...addForm, contract_title: e.target.value })} 
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="Brief description of the work order"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Description (Optional)</label>
                <textarea 
                  value={addForm.description} 
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} 
                  rows={3} 
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100" 
                  placeholder="Additional details..."
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAdd}>💾 Save {addForm.type === "CONTRACT" ? "Contract" : "Work Order"}</Button>
          </div>
        </div>
      </Modal>

      {/* EDIT CONTRACT MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Contract" size="lg">
        {selectedContract && (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span>🔒</span>
                <h3 className="text-sm font-semibold text-slate-700">Read-Only Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">Internal Contract No</label>
                  <div className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2.5 px-3 text-sm font-mono text-slate-600">{editForm.contract_no}</div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">Type</label>
                  <div className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2.5 px-3 text-sm text-slate-600">{editForm.type === "CONTRACT" ? "Contract" : "Work Order"}</div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">Department</label>
                  <div className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2.5 px-3 text-sm text-slate-600">{editForm.department}</div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">Created Date</label>
                  <div className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2.5 px-3 text-sm text-slate-600" dir="rtl">{editForm.start_date}</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-indigo-200 bg-indigo-50/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span>✏️</span>
                <h3 className="text-sm font-semibold text-slate-900">Editable Information</h3>
              </div>

              <div className="space-y-4">
                {editForm.type === "CONTRACT" ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">External Contract No</label>
                        <input 
                          value={editForm.external_contract_no || ""} 
                          onChange={(e) => setEditForm({ ...editForm, external_contract_no: e.target.value })} 
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" 
                          placeholder="Client's contract number"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Client</label>
                        <div className="flex gap-2">
                          <select 
                            value={editForm.client_id || ""} 
                            onChange={(e) => handleEditClientChange(e.target.value)} 
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                          >
                            <option value="">Select Client...</option>
                            {clients.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                          </select>
                          {editForm.client_id && getExistingContractsForClient(editForm.client_id).length > 0 && (
                            <Button variant="outline" size="sm" onClick={handleViewEditClientContracts} className="shrink-0 gap-1.5">
                              ️ View ({getExistingContractsForClient(editForm.client_id).length})
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">Contract Title</label>
                      <input 
                        value={editForm.contract_title || ""} 
                        onChange={(e) => setEditForm({ ...editForm, contract_title: e.target.value })} 
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Start Date</label>
                        <JalaaliDatePicker
                          value={editForm.start_date || ""}
                          onChange={(date) => setEditForm({ ...editForm, start_date: date })}
                          placeholder="تاریخ شروع"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">End Date</label>
                        <JalaaliDatePicker
                          value={editForm.end_date || ""}
                          onChange={(date) => setEditForm({ ...editForm, end_date: date })}
                          minDate={editForm.start_date}
                          placeholder="تاریخ پایان"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Total Value</label>
                        <input 
                          type="number" 
                          value={editForm.total_value || 0} 
                          onChange={(e) => setEditForm({ ...editForm, total_value: Number(e.target.value) })} 
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" 
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Invoiced</label>
                        <input 
                          type="number" 
                          value={editForm.invoiced || 0} 
                          onChange={(e) => setEditForm({ ...editForm, invoiced: Number(e.target.value) })} 
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" 
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Status</label>
                        <select value={editForm.status || "PENDING"} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400">
                          <option value="PENDING">Pending</option>
                          <option value="ACTIVE">Active</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">Description</label>
                      <textarea 
                        value={editForm.description || ""} 
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} 
                        rows={3} 
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" 
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                      <p className="text-xs text-amber-800">📦 Work Order - Source: {editForm.source_type === "LETTER" ? `Letter #${editForm.source_ref}` : `Email from ${editForm.source_email_from}`}</p>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">Work Order Title</label>
                      <input 
                        value={editForm.contract_title || ""} 
                        onChange={(e) => setEditForm({ ...editForm, contract_title: e.target.value })} 
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Status</label>
                        <select value={editForm.status || "PENDING"} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400">
                          <option value="PENDING">Pending</option>
                          <option value="ACTIVE">Active</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Total Value</label>
                        <input 
                          type="number" 
                          value={editForm.total_value || 0} 
                          onChange={(e) => setEditForm({ ...editForm, total_value: Number(e.target.value) })} 
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">Description</label>
                      <textarea 
                        value={editForm.description || ""} 
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} 
                        rows={3} 
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" 
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>💾 Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL نمایش قراردادهای قبلی مشتری */}
      <Modal 
        isOpen={isClientContractsOpen} 
        onClose={() => { 
          setIsClientContractsOpen(false); 
          setClientContractsList([]); 
          setSelectedClientForView(null);
          setViewFilterType("ALL");
          setViewFilterStatus("ALL");
        }} 
        title={`Previous Contracts — ${selectedClientForView?.name_en || ""}`}
        size="lg"
      >
        {selectedClientForView && (
          <div className="space-y-4">
            <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm font-bold">
                  {selectedClientForView.name_en.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-900">{selectedClientForView.name_en}</h3>
                  <p className="text-xs text-slate-500" dir="rtl">{selectedClientForView.name_fa}</p>
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">
                    {clientContractsList.length} {clientContractsList.length === 1 ? "contract" : "contracts"} in {CURRENT_DEPARTMENT}
                  </p>
                </div>
                {viewFilterType === "WORK_ORDER" && (
                  <Badge tone="amber">Work Orders Only</Badge>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
                <button 
                  onClick={() => setViewFilterStatus("ALL")}
                  className={`flex-1 rounded-md px-2 py-1.5 font-medium transition-colors ${viewFilterStatus === "ALL" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
                >
                  All ({clientContractCounts.ALL || 0})
                </button>
                {availableStatuses.map((status) => (
                  <button 
                    key={status}
                    onClick={() => setViewFilterStatus(status)}
                    className={`flex-1 rounded-md px-2 py-1.5 font-medium transition-colors ${viewFilterStatus === status ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    {status === "ACTIVE" ? "🟢" : status === "PENDING" ? "🟡" : ""} {status} ({clientContractCounts[status] || 0})
                  </button>
                ))}
              </div>
            </div>

            {filteredClientContracts.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <div className="text-4xl mb-2"></div>
                <p className="text-sm">No contracts found with current filters</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredClientContracts.map((contract) => {
                  const health = contractHealth(contract);
                  return (
                    <div 
                      key={contract.id} 
                      className="rounded-lg border border-slate-200 p-3 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge tone={contract.type === "CONTRACT" ? "indigo" : "amber"}>
                              {contract.type === "CONTRACT" ? "Contract" : "Work Order"}
                            </Badge>
                            <span className="font-mono text-xs text-slate-500">{contract.contract_no}</span>
                            {contract.external_contract_no && (
                              <span className="text-xs text-slate-400 font-mono">({contract.external_contract_no})</span>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-slate-900">{contract.contract_title}</h4>
                        </div>
                        <Badge tone={contract.status === "ACTIVE" ? "emerald" : contract.status === "PENDING" ? "amber" : "slate"}>
                          {contract.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500" dir="rtl">{contract.start_date} → {contract.end_date}</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(contract.total_value, contract.currency)}</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${health.budgetTone === "emerald" ? "bg-emerald-500" : health.budgetTone === "amber" ? "bg-amber-500" : "bg-rose-500"}`} 
                          style={{ width: `${Math.min(health.spent, 100)}%` }} 
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">{health.spent.toFixed(0)}% invoiced</div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button 
                variant="ghost" 
                onClick={() => { 
                  setIsClientContractsOpen(false); 
                  setClientContractsList([]); 
                  setSelectedClientForView(null);
                  setViewFilterType("ALL");
                  setViewFilterStatus("ALL");
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}