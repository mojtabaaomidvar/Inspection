import { useState, useMemo, useEffect } from "react";
import { Card, Badge, Button, Avatar, Modal } from "../components/ui";
import { clients as initialClients, contracts as initialContracts, contractTariffs } from "../data/mockData";
import { formatCurrency, formatDate, contractHealth } from "../lib/formatters";
import { validateNationalCode, validateNationalId, validateMobile } from "../lib/validators";

const CURRENT_USER_DEPARTMENT = "Unit A";

// Normalize برای fuzzy matching
const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, "").trim();

// Types
interface ContactPerson {
  id: string;
  name: string;
  position: string;
  mobile: string;
  email: string;
  department: string;
}

interface Client {
  id: string;
  type: "LEGAL" | "INDIVIDUAL";
  name_en: string;
  name_fa: string;
  national_id?: string;
  email?: string;
  phone?: string;
  category: string;
  contacts: number;
  contracts: number;
  logoColor: string;
  abbreviated_name?: string;
  company_type?: string;
  registration_no?: string;
  economic_code?: string;
  address_en?: string;
  address_fa?: string;
  departments?: string[];
  contactPersons?: ContactPerson[];
}

interface Contract {
  id: string;
  contract_no: string;
  client_id: string;
  client_name: string;
  contract_title: string;
  start_date: string;
  end_date: string;
  total_value: number;
  invoiced: number;
  currency: string;
  status: string;
  type: "CONTRACT" | "WORK_ORDER";
  tariffs: number;
}

export function Clients() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0]);
  const [filter, setFilter] = useState<"ALL" | "LEGAL" | "INDIVIDUAL">("ALL");
  const [contractTab, setContractTab] = useState<"ALL" | "CONTRACT" | "WORK_ORDER">("ALL");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  // Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [entityType, setEntityType] = useState<"LEGAL" | "INDIVIDUAL">("LEGAL");
  const [addForm, setAddForm] = useState({
    name_en: "",
    name_fa: "",
    abbreviated_name: "",
    company_type: "",
    national_id: "",
    economic_code: "",
    registration_no: "",
    address_en: "",
    address_fa: "",
    primary_phone: "",
    email_inbox: "",
    contactPersons: [{ id: "1", name: "", position: "", mobile: "", email: "" }],
  });
  const [addErrors, setAddErrors] = useState<any>({});

  // Duplicate Detection
  const [duplicateWarning, setDuplicateWarning] = useState<{
    field: string;
    client: any;
    message: string;
  } | null>(null);

  // View Duplicate Modal
  const [isViewDuplicateOpen, setIsViewDuplicateOpen] = useState(false);
  const [viewDuplicateClient, setViewDuplicateClient] = useState<any>(null);
  const [newContactForDuplicate, setNewContactForDuplicate] = useState({
    name: "",
    position: "",
    mobile: "",
    email: "",
  });

  // Filtered Clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        client.name_en.toLowerCase().includes(query) ||
        client.name_fa.includes(query) ||
        (client.national_id && client.national_id.includes(query));
      const matchesFilter = filter === "ALL" || client.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filter, clients]);

const clientCounts = useMemo(() => {
  return {
    total: clients.length,
    legal: clients.filter((c) => c.type === "LEGAL").length,
    individual: clients.filter((c) => c.type === "INDIVIDUAL").length,
  };
}, [clients]);

  // Auto-select first client when filter changes
  useEffect(() => {
    setContractTab("ALL");
  }, [selectedClient]);

  useEffect(() => {
    if (selectedClient && !filteredClients.find((c) => c.id === selectedClient.id)) {
      setSelectedClient(filteredClients[0] || null);
    }
  }, [filter, filteredClients, selectedClient]);

  // Real-time duplicate detection
  useEffect(() => {
    const timer = setTimeout(() => {
      let found: any = null;
      let field = "";

      if (addForm.name_en.trim().length >= 3) {
        const normalizedInput = normalize(addForm.name_en);
        found = clients.find((c) => normalize(c.name_en) === normalizedInput);
        if (found) field = "name_en";
      }

      if (!found && addForm.national_id && addForm.national_id.length >= 10) {
        found = clients.find((c) => c.national_id && c.national_id === addForm.national_id);
        if (found) field = "national_id";
      }

      if (!found && entityType === "LEGAL" && addForm.registration_no.trim()) {
        found = clients.find((c) => (c as any).registration_no === addForm.registration_no);
        if (found) field = "registration_no";
      }

      if (found) {
        const dept = (found as any).departments?.[0] || "Unknown";
        const totalContacts = (found as any).contactPersons?.length || 0;
        setDuplicateWarning({
          field,
          client: found,
          message: `⚠️ This client already exists in ${dept}. Total contacts in company: ${totalContacts}`,
        });
      } else {
        setDuplicateWarning(null);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [addForm.national_id, addForm.name_en, addForm.registration_no, clients, entityType]);

  // 🔑 Contracts - فقط بر اساس client_id فیلتر می‌شوند (بدون department)
  const clientContracts = useMemo(() => {
    if (!selectedClient) return [];
    return contracts.filter((c) => c.client_id === selectedClient.id);
  }, [selectedClient, contracts]);

  const filteredContracts = useMemo(() => {
    if (contractTab === "ALL") return clientContracts;
    return clientContracts.filter((c) => c.type === contractTab);
  }, [contractTab, clientContracts]);

  // 🔑 داینامیک محاسبه کانترها
  const totalValue = filteredContracts.reduce((sum, c) => sum + c.total_value, 0);
  const totalInvoiced = filteredContracts.reduce((sum, c) => sum + c.invoiced, 0);
  const activeCount = filteredContracts.filter((c) => c.status === "ACTIVE").length;
  const overallProgress = totalValue > 0 ? (totalInvoiced / totalValue) * 100 : 0;
  const overallHealthTone = overallProgress >= 100 ? "rose" : overallProgress >= 80 ? "amber" : "emerald";

  // 🔑 داینامیک محاسبه تعداد تعرفه‌ها
  const totalTariffLines = filteredContracts.reduce((sum, c) => sum + c.tariffs, 0);

  // Contact Persons واحد فعلی
  const currentDepartmentContacts = useMemo(() => {
    if (!selectedClient) return [];
    return (selectedClient.contactPersons || []).filter(
      (cp) => cp.department === CURRENT_USER_DEPARTMENT
    );
  }, [selectedClient]);

  // All client contracts count (داینامیک)
  const dynamicContractCount = useMemo(() => {
    if (!selectedClient) return 0;
    return contracts.filter((c) => c.client_id === selectedClient.id).length;
  }, [selectedClient, contracts]);

  // ============ HANDLERS ============

  const handleAddClick = () => {
    setEntityType("LEGAL");
    setAddForm({
      name_en: "",
      name_fa: "",
      abbreviated_name: "",
      company_type: "",
      national_id: "",
      economic_code: "",
      registration_no: "",
      address_en: "",
      address_fa: "",
      primary_phone: "",
      email_inbox: "",
      contactPersons: [{ id: "1", name: "", position: "", mobile: "", email: "" }],
    });
    setAddErrors({});
    setDuplicateWarning(null);
    setIsAddModalOpen(true);
  };

  const validateAddForm = () => {
    const errors: any = {};
    if (!addForm.name_en.trim()) errors.name_en = "English name is required";
    if (!addForm.name_fa.trim()) errors.name_fa = "نام فارسی الزامی است";

    if (entityType === "LEGAL") {
      if (!addForm.national_id) errors.national_id = "National ID is required";
      else if (!validateNationalId(addForm.national_id)) errors.national_id = "Must be exactly 11 digits";
      if (!addForm.company_type) errors.company_type = "Company type is required";
      if (!addForm.registration_no) errors.registration_no = "Registration number is required";
      if (!addForm.primary_phone) errors.primary_phone = "Primary phone is required";
      if (!addForm.address_en.trim()) errors.address_en = "English address is required";
      if (!addForm.address_fa.trim()) errors.address_fa = "آدرس فارسی الزامی است";

      const validContacts = addForm.contactPersons.filter((cp) => cp.name.trim() && validateMobile(cp.mobile));
      if (validContacts.length === 0) errors.contactPersons = "At least one valid contact person required";
    } else {
      if (!addForm.national_id) errors.national_id = "National Code is required";
      else if (!validateNationalCode(addForm.national_id)) errors.national_id = "Invalid national code";
      if (!addForm.primary_phone) errors.primary_phone = "Mobile is required";
      else if (!validateMobile(addForm.primary_phone)) errors.primary_phone = "Must be 11 digits starting with 09";
    }

    setAddErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAdd = () => {
    if (!validateAddForm()) return;

    const newClient: any = {
      id: `c${Date.now()}`,
      type: entityType,
      name_en: addForm.name_en,
      name_fa: addForm.name_fa,
      national_id: addForm.national_id,
      category: "OIL_GAS",
      contacts: entityType === "LEGAL" ? addForm.contactPersons.filter((cp) => cp.name.trim()).length : 0,
      contracts: 0,
      logoColor: "from-indigo-500 to-violet-600",
      email: addForm.email_inbox,
      phone: addForm.primary_phone,
      address_en: addForm.address_en,
      address_fa: addForm.address_fa,
      departments: [CURRENT_USER_DEPARTMENT],
      contactPersons:
        entityType === "LEGAL"
          ? addForm.contactPersons.filter((cp) => cp.name.trim()).map((cp) => ({
              ...cp,
              department: CURRENT_USER_DEPARTMENT,
            }))
          : [],
    };

    if (entityType === "LEGAL") {
      newClient.company_type = addForm.company_type;
      newClient.registration_no = addForm.registration_no;
      newClient.economic_code = addForm.economic_code;
      newClient.abbreviated_name = addForm.abbreviated_name;
    }

    const updatedClients = [newClient, ...clients];
    setClients(updatedClients);
    setSelectedClient(newClient);
    setIsAddModalOpen(false);
    setDuplicateWarning(null);
  };

  const handleViewDuplicate = () => {
    if (!duplicateWarning?.client) return;
    setViewDuplicateClient(duplicateWarning.client);
    setIsViewDuplicateOpen(true);
    setIsAddModalOpen(false);
  };

  const handleAddContactToDuplicate = () => {
    if (!duplicateWarning?.client) return;
    if (!newContactForDuplicate.name.trim() || !validateMobile(newContactForDuplicate.mobile)) {
      alert("Please enter valid contact name and mobile number");
      return;
    }

    const updatedClients = clients.map((c) => {
      if (c.id === duplicateWarning.client.id) {
        const updatedClient = { ...c };
        if (!updatedClient.departments) updatedClient.departments = [];
        if (!updatedClient.departments.includes(CURRENT_USER_DEPARTMENT)) {
          updatedClient.departments.push(CURRENT_USER_DEPARTMENT);
        }
        if (!updatedClient.contactPersons) updatedClient.contactPersons = [];
        updatedClient.contactPersons.push({
          ...newContactForDuplicate,
          id: Date.now().toString(),
          department: CURRENT_USER_DEPARTMENT,
        });
        updatedClient.contacts = updatedClient.contactPersons.length;
        return updatedClient;
      }
      return c;
    });

    setClients(updatedClients);
    setSelectedClient(updatedClients.find((c) => c.id === duplicateWarning.client.id) || null);
    setIsAddModalOpen(false);
    setNewContactForDuplicate({ name: "", position: "", mobile: "", email: "" });
    setDuplicateWarning(null);
  };

  const handleSaveContactInDuplicateView = () => {
    if (!viewDuplicateClient) return;
    if (!newContactForDuplicate.name.trim() || !validateMobile(newContactForDuplicate.mobile)) {
      alert("Please enter valid contact name and mobile number");
      return;
    }

    const updatedClients = clients.map((c) => {
      if (c.id === viewDuplicateClient.id) {
        const updatedClient = { ...c };
        if (!updatedClient.departments) updatedClient.departments = [];
        if (!updatedClient.departments.includes(CURRENT_USER_DEPARTMENT)) {
          updatedClient.departments.push(CURRENT_USER_DEPARTMENT);
        }
        if (!updatedClient.contactPersons) updatedClient.contactPersons = [];
        updatedClient.contactPersons.push({
          ...newContactForDuplicate,
          id: Date.now().toString(),
          department: CURRENT_USER_DEPARTMENT,
        });
        updatedClient.contacts = updatedClient.contactPersons.length;
        return updatedClient;
      }
      return c;
    });

    setClients(updatedClients);
    setViewDuplicateClient(updatedClients.find((c) => c.id === viewDuplicateClient.id) || null);
    setSelectedClient(updatedClients.find((c) => c.id === viewDuplicateClient.id) || null);
    setNewContactForDuplicate({ name: "", position: "", mobile: "", email: "" });
  };

  // 🔑 Edit Handler - برای حقیقی‌ها contact person ندارد
  const handleEditClick = () => {
    if (!selectedClient) return;
    setEditForm({
      name_en: selectedClient.name_en,
      name_fa: selectedClient.name_fa,
      abbreviated_name: (selectedClient as any).abbreviated_name || "",
      company_type: (selectedClient as any).company_type || "",
      national_id: selectedClient.national_id || "",
      economic_code: (selectedClient as any).economic_code || "",
      registration_no: (selectedClient as any).registration_no || "",
      address_en: (selectedClient as any).address_en || "",
      address_fa: (selectedClient as any).address_fa || "",
      primary_phone: selectedClient.phone || "",
      email_inbox: selectedClient.email || "",
      category: selectedClient.category,
      type: selectedClient.type,
      contactPersons:
        selectedClient.type === "LEGAL"
          ? (selectedClient.contactPersons || [])
              .filter((cp) => cp.department === CURRENT_USER_DEPARTMENT)
              .map((cp) => ({ ...cp }))
          : [],
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedClient) return;

    const updatedClients = clients.map((c) => {
      if (c.id === selectedClient.id) {
        const updated: any = {
          ...c,
          address_en: editForm.address_en,
          address_fa: editForm.address_fa,
          email: editForm.email_inbox,
          phone: editForm.primary_phone,
        };

        // فقط برای حقوقی‌ها contact person به‌روز می‌شود
        if (c.type === "LEGAL") {
          const otherDeptContacts = (c.contactPersons || []).filter(
            (cp) => cp.department !== CURRENT_USER_DEPARTMENT
          );
          updated.contactPersons = [
            ...otherDeptContacts,
            ...editForm.contactPersons.map((cp: any) => ({ ...cp, department: CURRENT_USER_DEPARTMENT })),
          ];
          updated.contacts = updated.contactPersons.length;
        }

        return updated;
      }
      return c;
    });

    setClients(updatedClients);
    setSelectedClient(updatedClients.find((c) => c.id === selectedClient.id) || null);
    setIsEditModalOpen(false);
  };

  // Contact Person handlers for Add
  const addContactPerson = () => {
    setAddForm({
      ...addForm,
      contactPersons: [
        ...addForm.contactPersons,
        { id: Date.now().toString(), name: "", position: "", mobile: "", email: "" },
      ],
    });
  };

  const removeContactPerson = (id: string) => {
    setAddForm({
      ...addForm,
      contactPersons: addForm.contactPersons.filter((cp) => cp.id !== id),
    });
  };

  const updateContactPerson = (id: string, field: string, value: string) => {
    setAddForm({
      ...addForm,
      contactPersons: addForm.contactPersons.map((cp) => (cp.id === id ? { ...cp, [field]: value } : cp)),
    });
  };

  // Contact Person handlers for Edit
  const addEditContactPerson = () => {
    setEditForm({
      ...editForm,
      contactPersons: [
        ...editForm.contactPersons,
        { id: Date.now().toString(), name: "", position: "", mobile: "", email: "", department: CURRENT_USER_DEPARTMENT },
      ],
    });
  };

  const removeEditContactPerson = (id: string) => {
    setEditForm({
      ...editForm,
      contactPersons: editForm.contactPersons.filter((cp: any) => cp.id !== id),
    });
  };

  const updateEditContactPerson = (id: string, field: string, value: string) => {
    setEditForm({
      ...editForm,
      contactPersons: editForm.contactPersons.map((cp: any) => (cp.id === id ? { ...cp, [field]: value } : cp)),
    });
  };

  // Get tariff lines for selected contract
  const selectedContractTariffs = useMemo(() => {
    if (!selectedContract) return [];
    return contractTariffs.filter((t) => t.contract_id === selectedContract.id);
  }, [selectedContract]);

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)]">
      {/* LEFT: Client List */}
      <div className="col-span-4 flex flex-col bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-3 bg-slate-50/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Clients</h3>
            <Badge tone="slate">{filteredClients.length} found</Badge>
          </div>

          <Button size="sm" onClick={handleAddClick} className="w-full mb-3 justify-center">
            + Add New Client
          </Button>

          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                ✕
              </button>
            )}
          </div>

          <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
  {(["ALL", "LEGAL", "INDIVIDUAL"] as const).map((t) => {
    const count = t === "ALL" ? clientCounts.total : t === "LEGAL" ? clientCounts.legal : clientCounts.individual;
    return (
      <button
        key={t}
        onClick={() => setFilter(t)}
        className={`flex-1 rounded-md px-2 py-1.5 font-medium transition-colors ${
          filter === t ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        {t === "ALL" ? `All (${count})` : t === "LEGAL" ? `🏢 Legal (${count})` : `👤 Individual (${count})`}
      </button>
    );
  })}
</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredClients.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-sm text-slate-500">No clients found</p>
            </div>
          ) : (
            filteredClients.map((client) => {
              const clientContractCount = contracts.filter((c) => c.client_id === client.id).length;
              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-slate-100 cursor-pointer transition-colors ${
                    selectedClient?.id === client.id ? "bg-indigo-50 border-l-4 border-l-indigo-500" : "hover:bg-slate-50"
                  }`}
                >
                  <Avatar name={client.name_en} gradient={client.logoColor} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{client.name_en}</div>
                    <div className="text-xs text-slate-500 truncate" dir="rtl">
                      {client.name_fa}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge tone={client.type === "LEGAL" ? "indigo" : "violet"}>
                        {client.type === "LEGAL" ? "Legal" : "Individual"}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-mono">{clientContractCount} contracts</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: Client Details */}
      <div className="col-span-8 flex flex-col bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden">
        {selectedClient ? (
          <>
            <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar name={selectedClient.name_en} gradient={selectedClient.logoColor} size="lg" />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{selectedClient.name_en}</h2>
                    <p className="text-sm text-slate-500" dir="rtl">
                      {selectedClient.name_fa}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge tone={selectedClient.type === "LEGAL" ? "indigo" : "violet"}>
                        {selectedClient.type === "LEGAL" ? "Legal Entity" : "Individual"}
                      </Badge>
                      <Badge tone="slate">{CURRENT_USER_DEPARTMENT}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleEditClick}>
                    ✏️ Edit Client
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedClient(null)}>
                    ✕ Close
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Company Information (Legal only) */}
                {selectedClient.type === "LEGAL" && (
                  <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/30">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      🏢 Company Information
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">National ID</div>
                        <div className="font-mono text-xs text-slate-900">{selectedClient.national_id || "—"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Registration No</div>
                        <div className="font-mono text-xs text-slate-900">{(selectedClient as any).registration_no || "—"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Economic Code</div>
                        <div className="font-mono text-xs text-slate-900">{(selectedClient as any).economic_code || "—"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Company Type</div>
                        <div className="text-xs text-slate-900">{(selectedClient as any).company_type || "—"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Abbreviated Name</div>
                        <div className="text-xs text-slate-900">{(selectedClient as any).abbreviated_name || "—"}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Individual Info */}
                {selectedClient.type === "INDIVIDUAL" && (
                  <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/30">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      👤 Personal Information
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">National Code</div>
                        <div className="font-mono text-xs text-slate-900">{selectedClient.national_id || "—"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Mobile</div>
                        <div className="text-xs text-slate-900">{selectedClient.phone || "—"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Email</div>
                        <div className="text-xs text-indigo-600">{selectedClient.email || "—"}</div>
                      </div>
                      <div className="col-span-2 md:col-span-3">
                        <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Address (EN)</div>
                        <div className="text-xs text-slate-900">{(selectedClient as any).address_en || "—"}</div>
                      </div>
                      <div className="col-span-2 md:col-span-3">
                        <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Address (FA)</div>
                        <div className="text-xs text-slate-900" dir="rtl">{(selectedClient as any).address_fa || "—"}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Persons (Legal only) */}
                {selectedClient.type === "LEGAL" && currentDepartmentContacts.length > 0 && (
                  <div className="rounded-lg border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">
                      Contact Persons — {currentDepartmentContacts.length}
                    </h3>
                    <div className="space-y-2">
                      {currentDepartmentContacts.map((cp: any) => (
                        <div key={cp.id} className="flex items-center gap-3 p-2 rounded bg-slate-50">
                          <Avatar name={cp.name} gradient="from-indigo-500 to-violet-600" size="sm" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900">{cp.name}</div>
                            <div className="text-xs text-slate-500">{cp.position}</div>
                          </div>
                          <div className="text-xs text-slate-600">
                            <div>{cp.mobile}</div>
                            <div className="text-indigo-600">{cp.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="text-xs text-slate-500 mb-1">Total Contracts</div>
                    <div className="text-2xl font-bold text-slate-900">{dynamicContractCount}</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="text-xs text-slate-500 mb-1">Total Tariffs</div>
                    <div className="text-2xl font-bold text-slate-900">{totalTariffLines}</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="text-xs text-slate-500 mb-1">Total Value</div>
                    <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalValue)}</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="text-xs text-slate-500 mb-1">Invoiced</div>
                    <div className="text-2xl font-bold text-indigo-600">{formatCurrency(totalInvoiced)}</div>
                  </div>
                </div>

                {/* Contracts Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">Contracts & Work Orders</h3>
                    <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
                      {(["ALL", "CONTRACT", "WORK_ORDER"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setContractTab(t)}
                          className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                            contractTab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                          }`}
                        >
                          {t === "ALL" ? `All (${clientContracts.length})` : t === "CONTRACT" ? `📄 Contracts (${clientContracts.filter(c => c.type === "CONTRACT").length})` : `📦 Work Orders (${clientContracts.filter(c => c.type === "WORK_ORDER").length})`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-lg mb-4">
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-semibold">Total Value</div>
                        <div className="text-sm font-bold text-slate-900">{formatCurrency(totalValue)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-semibold">Invoiced</div>
                        <div className="text-sm font-bold text-slate-900">{formatCurrency(totalInvoiced)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-semibold">Active</div>
                        <div className="text-sm font-bold text-emerald-600">{activeCount}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-semibold">Budget Usage</div>
                        <div
                          className={`text-sm font-bold ${
                            overallHealthTone === "emerald"
                              ? "text-emerald-600"
                              : overallHealthTone === "amber"
                              ? "text-amber-600"
                              : "text-rose-600"
                          }`}
                        >
                          {overallProgress.toFixed(0)}%
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full ${
                              overallHealthTone === "emerald"
                                ? "bg-emerald-500"
                                : overallHealthTone === "amber"
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${Math.min(overallProgress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {filteredContracts.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <div className="text-3xl mb-2">📄</div>
                      <p className="text-sm">No contracts found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredContracts.map((contract) => {
                        const health = contractHealth(contract);
                        return (
                          <div
                            key={contract.id}
                            onClick={() => setSelectedContract(contract)}
                            className="rounded-lg border border-slate-200 p-4 hover:border-indigo-300 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge tone={contract.type === "CONTRACT" ? "indigo" : "amber"}>
                                    {contract.type === "CONTRACT" ? "Contract" : "Work Order"}
                                  </Badge>
                                  <span className="font-mono text-xs text-slate-500">{contract.contract_no}</span>
                                  <Badge tone="slate">{contract.tariffs} tariffs</Badge>
                                </div>
                                <h4 className="text-sm font-semibold text-slate-900">{contract.contract_title}</h4>
                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                                  <span>
                                    {formatDate(contract.start_date)} → {formatDate(contract.end_date)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-slate-900">
                                  {formatCurrency(contract.total_value, contract.currency)}
                                </div>
                                <Badge tone={contract.status === "ACTIVE" ? "emerald" : contract.status === "CLOSED" ? "zinc" : "amber"}>
                                  {contract.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      health.budgetTone === "emerald"
                                        ? "bg-emerald-500"
                                        : health.budgetTone === "amber"
                                        ? "bg-amber-500"
                                        : "bg-rose-500"
                                    }`}
                                    style={{ width: `${Math.min(health.spent, 100)}%` }}
                                  />
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {health.spent.toFixed(0)}% invoiced · {formatCurrency(contract.invoiced, contract.currency)}
                                </div>
                              </div>
                              <Badge tone={health.timeTone}>
                                {health.daysLeft > 0 ? `${health.daysLeft}d left` : `Expired ${-health.daysLeft}d ago`}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">👈</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a Client</h3>
              <p className="text-sm text-slate-500">Choose a client from the list to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setDuplicateWarning(null); }} title="Entity Onboarding" size="xl">
        <div className="space-y-6">
          <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-fit">
            <button
              type="button"
              onClick={() => setEntityType("LEGAL")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                entityType === "LEGAL" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-white"
              }`}
            >
               LEGAL
            </button>
            <button
              type="button"
              onClick={() => setEntityType("INDIVIDUAL")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                entityType === "INDIVIDUAL" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-white"
              }`}
            >
              👤 INDIVIDUAL
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">🌐 BASIC IDENTITY</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Full Name (English) <span className="text-rose-500">*</span>
                </label>
                <input
                  value={addForm.name_en}
                  onChange={(e) => setAddForm({ ...addForm, name_en: e.target.value })}
                  className={`w-full rounded-lg border bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-2 ${
                    duplicateWarning?.field === "name_en"
                      ? "border-amber-300 focus:ring-amber-100"
                      : addErrors.name_en
                      ? "border-rose-300 focus:ring-rose-100"
                      : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
                  }`}
                  placeholder="e.g., PetroPars Oil & Gas Co."
                />
                {duplicateWarning?.field === "name_en" && (
                  <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-medium text-amber-900 mb-2">{duplicateWarning.message}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar name={duplicateWarning.client.name_en} gradient={duplicateWarning.client.logoColor} size="sm" />
                      <div className="text-xs text-slate-700">
                        <div className="font-semibold">{duplicateWarning.client.name_en}</div>
                        <div className="text-slate-500" dir="rtl">{duplicateWarning.client.name_fa}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleViewDuplicate}>
                        👁️ View Client
                      </Button>
                      <Button size="sm" onClick={handleAddContactToDuplicate}>
                        + Add Contact Person
                      </Button>
                    </div>
                  </div>
                )}
                {addErrors.name_en && !duplicateWarning && (
                  <p className="mt-1 text-[11px] font-medium text-rose-600"> {addErrors.name_en}</p>
                )}
              </div>

              <div dir="rtl">
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 text-right">
                  Local Official Name <span className="text-rose-500">*</span>
                </label>
                <input
                  value={addForm.name_fa}
                  onChange={(e) => setAddForm({ ...addForm, name_fa: e.target.value })}
                  className={`w-full rounded-lg border bg-white py-2.5 px-3 text-sm text-right focus:outline-none focus:ring-2 ${
                    addErrors.name_fa ? "border-rose-300 focus:ring-rose-100" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
                  }`}
                  placeholder="مثلاً شرکت نفت و گاز پتروپارس"
                />
                {addErrors.name_fa && <p className="mt-1 text-[11px] font-medium text-rose-600 text-right">✕ {addErrors.name_fa}</p>}
              </div>

              {entityType === "LEGAL" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Abbreviated Name (English)</label>
                    <input
                      value={addForm.abbreviated_name}
                      onChange={(e) => setAddForm({ ...addForm, abbreviated_name: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      placeholder="e.g., PPOG"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Company Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={addForm.company_type}
                      onChange={(e) => setAddForm({ ...addForm, company_type: e.target.value })}
                      className={`w-full rounded-lg border bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-2 ${
                        addErrors.company_type ? "border-rose-300 focus:ring-rose-100" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
                      }`}
                    >
                      <option value="">Select Type...</option>
                      <option value="Private Joint Stock">Private Joint Stock (سهامی خاص)</option>
                      <option value="Public Joint Stock">Public Joint Stock (سهامی عام)</option>
                      <option value="Limited Liability">Limited Liability (مسئولیت محدود)</option>
                      <option value="Partnership">Partnership (تضامنی)</option>
                      <option value="Branch">Branch/Representative Office (نمایندگی/شعبه)</option>
                    </select>
                    {addErrors.company_type && <p className="mt-1 text-[11px] font-medium text-rose-600">✕ {addErrors.company_type}</p>}
                  </div>
                </>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  {entityType === "LEGAL" ? "National ID (11 digits)" : "National Code (10 digits)"} <span className="text-rose-500">*</span>
                </label>
                <input
                  value={addForm.national_id}
                  onChange={(e) => setAddForm({ ...addForm, national_id: e.target.value.replace(/\D/g, "") })}
                  maxLength={entityType === "LEGAL" ? 11 : 10}
                  className={`w-full rounded-lg border bg-white py-2.5 px-3 text-sm font-mono focus:outline-none focus:ring-2 ${
                    duplicateWarning?.field === "national_id"
                      ? "border-amber-300 focus:ring-amber-100"
                      : addErrors.national_id
                      ? "border-rose-300 focus:ring-rose-100"
                      : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
                  }`}
                  placeholder={entityType === "LEGAL" ? "10101010101" : "0012345678"}
                />
                {duplicateWarning?.field === "national_id" && (
                  <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-medium text-amber-900 mb-2">{duplicateWarning.message}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar name={duplicateWarning.client.name_en} gradient={duplicateWarning.client.logoColor} size="sm" />
                      <div className="text-xs text-slate-700">
                        <div className="font-semibold">{duplicateWarning.client.name_en}</div>
                        <div className="text-slate-500" dir="rtl">{duplicateWarning.client.name_fa}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleViewDuplicate}>
                        👁️ View Client
                      </Button>
                      <Button size="sm" onClick={handleAddContactToDuplicate}>
                        + Add Contact Person
                      </Button>
                    </div>
                  </div>
                )}
                {addErrors.national_id && !duplicateWarning && (
                  <p className="mt-1 text-[11px] font-medium text-rose-600">✕ {addErrors.national_id}</p>
                )}
              </div>

              {entityType === "LEGAL" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Economic Code</label>
                    <input
                      value={addForm.economic_code}
                      onChange={(e) => setAddForm({ ...addForm, economic_code: e.target.value.replace(/\D/g, "") })}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      placeholder="e.g., 411111111111"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Registration Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={addForm.registration_no}
                      onChange={(e) => setAddForm({ ...addForm, registration_no: e.target.value })}
                      className={`w-full rounded-lg border bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-2 ${
                        duplicateWarning?.field === "registration_no"
                          ? "border-amber-300 focus:ring-amber-100"
                          : addErrors.registration_no
                          ? "border-rose-300 focus:ring-rose-100"
                          : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
                      }`}
                      placeholder="e.g., 123456"
                    />
                    {duplicateWarning?.field === "registration_no" && (
                      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs font-medium text-amber-900 mb-2">{duplicateWarning.message}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar name={duplicateWarning.client.name_en} gradient={duplicateWarning.client.logoColor} size="sm" />
                          <div className="text-xs text-slate-700">
                            <div className="font-semibold">{duplicateWarning.client.name_en}</div>
                            <div className="text-slate-500" dir="rtl">{duplicateWarning.client.name_fa}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={handleViewDuplicate}>
                            👁️ View Client
                          </Button>
                          <Button size="sm" onClick={handleAddContactToDuplicate}>
                            + Add Contact Person
                          </Button>
                        </div>
                      </div>
                    )}
                    {addErrors.registration_no && !duplicateWarning && (
                      <p className="mt-1 text-[11px] font-medium text-rose-600">✕ {addErrors.registration_no}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">📞 CONTACT HUB</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Primary Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  value={addForm.primary_phone}
                  onChange={(e) => setAddForm({ ...addForm, primary_phone: e.target.value.replace(/\D/g, "") })}
                  maxLength={11}
                  className={`w-full rounded-lg border bg-white py-2.5 px-3 text-sm font-mono focus:outline-none focus:ring-2 ${
                    addErrors.primary_phone ? "border-rose-300 focus:ring-rose-100" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
                  }`}
                  placeholder={entityType === "LEGAL" ? "02188776655" : "09121234567"}
                />
                {addErrors.primary_phone && <p className="mt-1 text-[11px] font-medium text-rose-600">✕ {addErrors.primary_phone}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email Inbox</label>
                <input
                  type="email"
                  value={addForm.email_inbox}
                  onChange={(e) => setAddForm({ ...addForm, email_inbox: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="info@company.com"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">📍 OFFICIAL ADDRESS</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Global Address (English) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={addForm.address_en}
                  onChange={(e) => setAddForm({ ...addForm, address_en: e.target.value })}
                  rows={3}
                  className={`w-full rounded-lg border bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-2 ${
                    addErrors.address_en ? "border-rose-300 focus:ring-rose-100" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
                  }`}
                  placeholder="Tehran, Iran, Street..."
                />
                {addErrors.address_en && <p className="mt-1 text-[11px] font-medium text-rose-600">✕ {addErrors.address_en}</p>}
              </div>
              <div dir="rtl">
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 text-right">
                  Local Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={addForm.address_fa}
                  onChange={(e) => setAddForm({ ...addForm, address_fa: e.target.value })}
                  rows={3}
                  className={`w-full rounded-lg border bg-white py-2.5 px-3 text-sm text-right focus:outline-none focus:ring-2 ${
                    addErrors.address_fa ? "border-rose-300 focus:ring-rose-100" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
                  }`}
                  placeholder="تهران، ایران، خیابان..."
                />
                {addErrors.address_fa && <p className="mt-1 text-[11px] font-medium text-rose-600 text-right"> {addErrors.address_fa}</p>}
              </div>
            </div>
          </div>

          {entityType === "LEGAL" && (
            <div className="rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  👥 CONTACT PERSONS <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                    {addForm.contactPersons.length}
                  </span>
                </h2>
                <button type="button" onClick={addContactPerson} className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  + ADD LIAISON
                </button>
              </div>

              {addErrors.contactPersons && (
                <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                  ✕ {addErrors.contactPersons}
                </div>
              )}

              <div className="space-y-3">
                {addForm.contactPersons.map((cp) => (
                  <div key={cp.id} className="grid grid-cols-12 gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="col-span-4">
                      <label className="mb-1 block text-[10px] font-semibold text-slate-600">Liaison Name *</label>
                      <input
                        value={cp.name}
                        onChange={(e) => updateContactPerson(cp.id, "name", e.target.value)}
                        className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs focus:border-indigo-400 focus:outline-none"
                        placeholder="Full name"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="mb-1 block text-[10px] font-semibold text-slate-600">Position/Rank</label>
                      <input
                        value={cp.position}
                        onChange={(e) => updateContactPerson(cp.id, "position", e.target.value)}
                        className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs focus:border-indigo-400 focus:outline-none"
                        placeholder="e.g., Manager"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="mb-1 block text-[10px] font-semibold text-slate-600">Mobile Number *</label>
                      <input
                        value={cp.mobile}
                        onChange={(e) => updateContactPerson(cp.id, "mobile", e.target.value.replace(/\D/g, ""))}
                        className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs font-mono focus:border-indigo-400 focus:outline-none"
                        placeholder="09121234567"
                      />
                    </div>
                    <div className="col-span-2 flex items-end gap-1">
                      <div className="flex-1">
                        <label className="mb-1 block text-[10px] font-semibold text-slate-600">Direct Email</label>
                        <input
                          value={cp.email}
                          onChange={(e) => updateContactPerson(cp.id, "email", e.target.value)}
                          className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs focus:border-indigo-400 focus:outline-none"
                          placeholder="email@company.com"
                        />
                      </div>
                      {addForm.contactPersons.length > 1 && (
                        <button type="button" onClick={() => removeContactPerson(cp.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => { setIsAddModalOpen(false); setDuplicateWarning(null); }}>Cancel</Button>
            <Button onClick={handleSaveAdd}>Save Entity</Button>
          </div>
        </div>
      </Modal>

      {/* View Duplicate Modal */}
      <Modal
        isOpen={isViewDuplicateOpen}
        onClose={() => { setIsViewDuplicateOpen(false); setViewDuplicateClient(null); setNewContactForDuplicate({ name: "", position: "", mobile: "", email: "" }); }}
        title="Existing Client — Add Contact Person"
        size="xl"
      >
        {viewDuplicateClient && (
          <div className="space-y-6">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-900 mb-1">This client already exists in the system</h3>
                  <p className="text-xs text-amber-800">
                    You can view the existing information and add a new contact person for your department.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/30">
              <div className="flex items-center gap-4 mb-4">
                <Avatar name={viewDuplicateClient.name_en} gradient={viewDuplicateClient.logoColor} size="lg" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{viewDuplicateClient.name_en}</h2>
                  <p className="text-sm text-slate-500" dir="rtl">{viewDuplicateClient.name_fa}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge tone={viewDuplicateClient.type === "LEGAL" ? "indigo" : "violet"}>
                      {viewDuplicateClient.type === "LEGAL" ? "Legal Entity" : "Individual"}
                    </Badge>
                    <Badge tone="slate">{(viewDuplicateClient as any).departments?.join(", ") || "Unknown"}</Badge>
                  </div>
                </div>
              </div>

              {viewDuplicateClient.type === "LEGAL" && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm pt-4 border-t border-slate-200">
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">National ID</div>
                    <div className="font-mono text-xs text-slate-900">{viewDuplicateClient.national_id || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Registration No</div>
                    <div className="font-mono text-xs text-slate-900">{(viewDuplicateClient as any).registration_no || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Economic Code</div>
                    <div className="font-mono text-xs text-slate-900">{(viewDuplicateClient as any).economic_code || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Company Type</div>
                    <div className="text-xs text-slate-900">{(viewDuplicateClient as any).company_type || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Total Contacts (Company-wide)</div>
                    <div className="text-xs text-slate-900 font-semibold">{(viewDuplicateClient as any).contactPersons?.length || 0}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                ➕ Add New Contact Person
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Contact Name *</label>
                    <input
                      value={newContactForDuplicate.name}
                      onChange={(e) => setNewContactForDuplicate({ ...newContactForDuplicate, name: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Position</label>
                    <input
                      value={newContactForDuplicate.position}
                      onChange={(e) => setNewContactForDuplicate({ ...newContactForDuplicate, position: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      placeholder="e.g., Manager"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Mobile *</label>
                    <input
                      value={newContactForDuplicate.mobile}
                      onChange={(e) => setNewContactForDuplicate({ ...newContactForDuplicate, mobile: e.target.value.replace(/\D/g, "") })}
                      maxLength={11}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      placeholder="09121234567"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Email</label>
                    <input
                      type="email"
                      value={newContactForDuplicate.email}
                      onChange={(e) => setNewContactForDuplicate({ ...newContactForDuplicate, email: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      placeholder="email@company.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="ghost"
                onClick={() => { setIsViewDuplicateOpen(false); setViewDuplicateClient(null); setNewContactForDuplicate({ name: "", position: "", mobile: "", email: "" }); }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveContactInDuplicateView}>
                💾 Save Contact Person
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal - برای حقیقی‌ها Contact Person ندارد */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Client Information"
        size="xl"
      >
        {selectedClient && (
          <div className="space-y-6">
            {/* Read-Only Information */}
            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/30">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm">🔒</span>
                <h3 className="text-sm font-semibold text-slate-700">Read-Only Information</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">Full Name (English)</label>
                  <div className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2.5 px-3 text-sm text-slate-600">
                    {editForm.name_en}
                  </div>
                </div>
                <div dir="rtl">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500 text-right">نام فارسی</label>
                  <div className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2.5 px-3 text-sm text-slate-600 text-right">
                    {editForm.name_fa}
                  </div>
                </div>

                {editForm.type === "LEGAL" && (
                  <>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-500">Abbreviated Name</label>
                      <div className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2.5 px-3 text-sm text-slate-600">
                        {editForm.abbreviated_name || "—"}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-500">Company Type</label>
                      <div className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2.5 px-3 text-sm text-slate-600">
                        {editForm.company_type || "—"}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-500">National ID</label>
                      <div className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2.5 px-3 text-sm font-mono text-slate-600">
                        {editForm.national_id}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-500">Registration Number</label>
                      <div className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2.5 px-3 text-sm font-mono text-slate-600">
                        {editForm.registration_no || "—"}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-500">Economic Code</label>
                      <div className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2.5 px-3 text-sm font-mono text-slate-600">
                        {editForm.economic_code || "—"}
                      </div>
                    </div>

                  </>
                )}

                {editForm.type === "INDIVIDUAL" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-500">National Code</label>
                    <div className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2.5 px-3 text-sm font-mono text-slate-600">
                      {editForm.national_id}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Editable Information */}
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm">️</span>
                <h3 className="text-sm font-semibold text-slate-900">Editable Information</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Primary Phone</label>
                    <input
                      value={editForm.primary_phone || ""}
                      onChange={(e) => setEditForm({ ...editForm, primary_phone: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                      placeholder="02188776655 or 09121234567"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email Inbox</label>
                    <input
                      type="email"
                      value={editForm.email_inbox || ""}
                      onChange={(e) => setEditForm({ ...editForm, email_inbox: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                      placeholder="info@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Global Address (English)</label>
                    <textarea
                      value={editForm.address_en || ""}
                      onChange={(e) => setEditForm({ ...editForm, address_en: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                      placeholder="Tehran, Iran, Street..."
                    />
                  </div>
                  <div dir="rtl">
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700 text-right">آدرس فارسی</label>
                    <textarea
                      value={editForm.address_fa || ""}
                      onChange={(e) => setEditForm({ ...editForm, address_fa: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                      placeholder="تهران، ایران، خیابان..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 🔑 Contact Persons - فقط برای حقوقی‌ها */}
            {editForm.type === "LEGAL" && (
              <div className="rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    👥 Contact Persons
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                      {editForm.contactPersons?.length || 0}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={addEditContactPerson}
                    className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    + ADD LIAISON
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Only contact persons related to your department are shown and editable.
                </p>

                <div className="space-y-3">
                  {editForm.contactPersons?.map((cp: any) => (
                    <div key={cp.id} className="grid grid-cols-12 gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div className="col-span-4">
                        <label className="mb-1 block text-[10px] font-semibold text-slate-600">Liaison Name *</label>
                        <input
                          value={cp.name}
                          onChange={(e) => updateEditContactPerson(cp.id, "name", e.target.value)}
                          className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs focus:border-indigo-400 focus:outline-none"
                          placeholder="Full name"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="mb-1 block text-[10px] font-semibold text-slate-600">Position/Rank</label>
                        <input
                          value={cp.position}
                          onChange={(e) => updateEditContactPerson(cp.id, "position", e.target.value)}
                          className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs focus:border-indigo-400 focus:outline-none"
                          placeholder="e.g., Manager"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="mb-1 block text-[10px] font-semibold text-slate-600">Mobile *</label>
                        <input
                          value={cp.mobile}
                          onChange={(e) => updateEditContactPerson(cp.id, "mobile", e.target.value.replace(/\D/g, ""))}
                          className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs font-mono focus:border-indigo-400 focus:outline-none"
                          placeholder="09121234567"
                        />
                      </div>
                      <div className="col-span-2 flex items-end gap-1">
                        <div className="flex-1">
                          <label className="mb-1 block text-[10px] font-semibold text-slate-600">Direct Email</label>
                          <input
                            value={cp.email}
                            onChange={(e) => updateEditContactPerson(cp.id, "email", e.target.value)}
                            className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs focus:border-indigo-400 focus:outline-none"
                            placeholder="email@company.com"
                          />
                        </div>
                        {editForm.contactPersons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEditContactPerson(cp.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!editForm.contactPersons || editForm.contactPersons.length === 0) && (
                    <div className="text-center py-6 text-slate-400 text-sm">
                      No contact persons yet. Click "+ ADD LIAISON" to add one.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>💾 Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Contract Details Modal */}
      <Modal isOpen={!!selectedContract} onClose={() => setSelectedContract(null)} title="Contract Details" size="lg">
        {selectedContract && (() => {
          const health = contractHealth(selectedContract);
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Contract Title</div>
                  <div className="text-sm font-semibold text-slate-900">{selectedContract.contract_title}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Client</div>
                  <div className="text-sm font-medium text-slate-900">{selectedContract.client_name}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50">
                <Badge tone={selectedContract.type === "CONTRACT" ? "indigo" : "amber"}>
                  {selectedContract.type}
                </Badge>
                <Badge tone={selectedContract.status === "ACTIVE" ? "emerald" : selectedContract.status === "CLOSED" ? "zinc" : "amber"}>
                  {selectedContract.status}
                </Badge>
                <div className="ml-auto text-right">
                  <div className="text-xs text-slate-500">Total Value</div>
                  <div className="text-lg font-bold text-slate-900">
                    {formatCurrency(selectedContract.total_value, selectedContract.currency)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="text-xs text-slate-500 mb-1">Budget Used</div>
                  <div
                    className={`text-lg font-bold ${
                      health.budgetTone === "emerald" ? "text-emerald-600" : health.budgetTone === "amber" ? "text-amber-600" : "text-rose-600"
                    }`}
                  >
                    {health.spent.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatCurrency(selectedContract.invoiced, selectedContract.currency)} of{" "}
                    {formatCurrency(selectedContract.total_value, selectedContract.currency)}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="text-xs text-slate-500 mb-1">Time Remaining</div>
                  <div
                    className={`text-lg font-bold ${
                      health.timeTone === "emerald" ? "text-emerald-600" : health.timeTone === "amber" ? "text-amber-600" : "text-rose-600"
                    }`}
                  >
                    {health.daysLeft > 0 ? `${health.daysLeft} days` : `${-health.daysLeft} days overdue`}
                  </div>
                  <div className="text-xs text-slate-500">Ends {formatDate(selectedContract.end_date)}</div>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="text-xs text-slate-500 mb-1">Tariff Lines</div>
                  <div className="text-lg font-bold text-slate-900">{selectedContract.tariffs}</div>
                  <div className="text-xs text-slate-500">Active items</div>
                </div>
              </div>

              {selectedContractTariffs.length > 0 && (
                <div className="border-t border-slate-200 pt-6">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">Tariff Lines — Work Progress</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/60 text-[10px] uppercase tracking-wide text-slate-500">
                          <th className="px-3 py-2 font-medium">Description</th>
                          <th className="px-3 py-2 font-medium">Unit</th>
                          <th className="px-3 py-2 font-medium text-right">Rate</th>
                          <th className="px-3 py-2 font-medium text-right">Total</th>
                          <th className="px-3 py-2 font-medium text-right">Done</th>
                          <th className="px-3 py-2 font-medium text-right">Remaining</th>
                          <th className="px-3 py-2 font-medium">Progress</th>
                          <th className="px-3 py-2 font-medium text-right">Value Done</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedContractTariffs.map((tariff) => {
                          const remaining = tariff.total_quantity - tariff.consumed_quantity;
                          const progress = tariff.total_quantity > 0 ? (tariff.consumed_quantity / tariff.total_quantity) * 100 : 0;
                          const valueDone = tariff.consumed_quantity * tariff.rate;
                          const progressTone = progress >= 100 ? "rose" : progress >= 80 ? "amber" : "emerald";
                          return (
                            <tr key={tariff.id} className="hover:bg-slate-50/60">
                              <td className="px-3 py-3 text-sm text-slate-800 font-medium">{tariff.description}</td>
                              <td className="px-3 py-3">
                                <Badge tone="indigo">{tariff.unit.replace("_", " ")}</Badge>
                              </td>
                              <td className="px-3 py-3 text-right font-mono text-slate-700">{formatCurrency(tariff.rate)}</td>
                              <td className="px-3 py-3 text-right font-mono text-slate-700">{tariff.total_quantity}</td>
                              <td className="px-3 py-3 text-right font-mono text-emerald-600 font-semibold">{tariff.consumed_quantity}</td>
                              <td className="px-3 py-3 text-right font-mono text-slate-500">{remaining}</td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 overflow-hidden rounded-full bg-slate-200">
                                    <div
                                      className={`h-full rounded-full ${
                                        progressTone === "emerald" ? "bg-emerald-500" : progressTone === "amber" ? "bg-amber-500" : "bg-rose-500"
                                      }`}
                                      style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                  </div>
                                  <span
                                    className={`text-xs font-semibold ${
                                      progressTone === "emerald" ? "text-emerald-600" : progressTone === "amber" ? "text-amber-600" : "text-rose-600"
                                    }`}
                                  >
                                    {progress.toFixed(0)}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-right font-mono text-slate-900 font-semibold">{formatCurrency(valueDone)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}