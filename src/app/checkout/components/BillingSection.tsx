import { User, CheckCircle2 } from "lucide-react";
import { SECTION_CLS, ACCENT_BAR_CLS, SECTION_TITLE_CLS } from "../constants/constants";

/**
 * Sección de facturación — informativa.
 * En Colombia la dirección de facturación siempre coincide con la de envío;
 * Bold gestiona los datos fiscales en su propio formulario de pago.
 */
const BillingSection = () => (
  <section className={`${SECTION_CLS} mb-8 sm:mb-12`}>
    <div className={ACCENT_BAR_CLS} />
    <h2
      className={`${SECTION_TITLE_CLS} mb-4 sm:mb-6`}
      style={{ fontFamily: "Georgia, serif" }}
    >
      <User className="w-4 sm:w-5 h-4 sm:h-5 text-[#C19A6B] shrink-0" />
      Facturación
    </h2>
    <div className="flex items-center gap-3 px-4 py-3.5 bg-[#154734]/4 border border-[#154734]/10 rounded-xl">
      <CheckCircle2 className="w-4 h-4 text-[#154734] shrink-0" />
      <span className="text-sm text-[#154734] font-medium">
        Misma dirección de envío
      </span>
    </div>
  </section>
);

export default BillingSection;
