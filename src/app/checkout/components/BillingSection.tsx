import { User } from "lucide-react";

interface BillingSectionProps {
  billingSameAsShipping: boolean;
  onChange: (value: boolean) => void;
}

const RadioOption = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) => (
  <label className="flex items-center gap-4 p-5 cursor-pointer hover:bg-[#FAFAFA] transition-colors">
    <div className="relative flex items-center justify-center shrink-0">
      <input
        type="radio"
        name="billing"
        checked={checked}
        onChange={onChange}
        className="peer appearance-none w-5 h-5 border-2 border-gray-300 checked:border-[#154734] rounded-full transition-colors cursor-pointer"
      />
      <div className="absolute w-2.5 h-2.5 bg-[#154734] rounded-full opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
    </div>
    <span className="text-sm font-medium text-[#154734]">{label}</span>
  </label>
);

const BillingSection = ({ billingSameAsShipping, onChange }: BillingSectionProps) => (
  <section className="mb-12 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group/section hover:border-[#C19A6B]/30 transition-colors duration-300">
    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#154734] scale-y-0 group-hover/section:scale-y-100 origin-top transition-transform duration-500" />
    <h2
      className="text-xl sm:text-2xl text-[#154734] mb-6 flex items-center gap-3"
      style={{ fontFamily: "Georgia, serif" }}
    >
      <User className="w-5 h-5 text-[#C19A6B]" /> Facturación
    </h2>
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
      <div className="border-b border-gray-100">
        <RadioOption
          checked={billingSameAsShipping}
          onChange={() => onChange(true)}
          label="Misma dirección de envío"
        />
      </div>
      <RadioOption
        checked={!billingSameAsShipping}
        onChange={() => onChange(false)}
        label="Usar una dirección distinta"
      />
    </div>
  </section>
);

export default BillingSection;
