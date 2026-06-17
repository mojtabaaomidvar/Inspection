import { FixedSizeList as List } from "react-window";
import { Avatar, Badge } from "./ui";
import { Client } from "../views/Clients";

interface VirtualClientListProps {
  clients: Client[];
  selectedClientId: string | null;
  onSelect: (client: Client) => void;
  height: number;
}

const ROW_HEIGHT = 72;

export function VirtualClientList({ 
  clients, 
  selectedClientId, 
  onSelect, 
  height 
}: VirtualClientListProps) {
  
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const client = clients[index];
    if (!client) return null;

    const isSelected = selectedClientId === client.id;

    return (
      <div
        style={style}
        onClick={() => onSelect(client)}
        className={`flex items-center gap-3 px-4 border-b border-slate-100 cursor-pointer transition-colors ${
          isSelected 
            ? "bg-indigo-50 border-l-4 border-l-indigo-500" 
            : "hover:bg-slate-50"
        }`}
      >
        <Avatar name={client.name_en} gradient={client.logoColor} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-900 truncate">
            {client.name_en}
          </div>
          <div className="text-xs text-slate-500 truncate" dir="rtl">
            {client.name_fa}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge tone={client.type === "LEGAL" ? "indigo" : "violet"}>
              {client.type === "LEGAL" ? "Legal" : "Individual"}
            </Badge>
            <span className="text-[10px] text-slate-400 font-mono">
              {client.contracts} {client.contracts === 1 ? "Agreement" : "Agreements"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (clients.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-2">🔍</div>
        <p className="text-sm text-slate-500">No clients found</p>
      </div>
    );
  }

  return (
    <List
      height={height}
      itemCount={clients.length}
      itemSize={ROW_HEIGHT}
      width="100%"
      className="scrollbar-thin"
    >
      {Row}
    </List>
  );
}