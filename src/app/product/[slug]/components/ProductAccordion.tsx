import { ChevronDown, Truck, CreditCard, Shirt } from "lucide-react";

interface AccordionItem {
  key: string;
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

interface Props {
  openKey: string | null;
  onToggle: (key: string) => void;
}

const items: AccordionItem[] = [
  {
    key: "envio",
    icon: <Truck className="w-5 h-5 text-foreground" />,
    title: "ENVÍO",
    content: (
      <p>
        El envío nacional llega de 2 a 4 días hábiles y{" "}
        <strong>tiene un valor de $18,000</strong>.
      </p>
    ),
  },
  {
    key: "pago",
    icon: <CreditCard className="w-5 h-5 text-foreground" />,
    title: "MÉTODOS DE PAGO",
    content: (
      <p>
        <strong>Recibimos todas las tarjetas de</strong> Crédito y Débito, PSE, Nequi,
        Davivienda y Bancolombia.
      </p>
    ),
  },
  {
    key: "cuidados",
    icon: <Shirt className="w-5 h-5 text-foreground" />,
    title: "CUIDADOS DE LA PRENDA",
    content: (
      <ul className="list-disc pl-4 space-y-1">
        <li>Lavar a mano o en ciclo delicado.</li>
        <li>Utilizar agua fría para mantener el color.</li>
        <li>Evitar blanqueadores y suavizantes.</li>
        <li>Secar a la sombra, sin usar secadora.</li>
        <li>No planchar directamente sobre la prenda.</li>
      </ul>
    ),
  },
];

export default function ProductAccordion({ openKey, onToggle }: Props) {
  return (
    <div className="border-t border-border">
      {items.map(({ key, icon, title, content }) => (
        <div key={key} className="border-b border-border">
          <button
            onClick={() => onToggle(key)}
            className="w-full py-4 flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              {icon}
              <span className="text-sm font-semibold text-foreground uppercase tracking-wider">
                {title}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                openKey === key ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openKey === key ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="pb-4 text-sm text-muted-foreground pl-8">{content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
