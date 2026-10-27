import { User, CheckCircle2 } from "lucide-react";
import { SECTION_CLS, ACCENT_BAR_CLS, SECTION_TITLE_CLS } from "../constants";

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
      <User className="w-4 sm:w-5 h-4 sm:h-5 text-[color:var(--theme-accent)] shrink-0" />
      Facturación
    </h2>
    <div className="flex items-center gap-3 px-4 py-3.5 bg-[color:var(--theme-primary)]/4 border border-[color:var(--theme-primary)]/10 rounded-xl">
      <CheckCircle2 className="w-4 h-4 text-[color:var(--theme-primary)] shrink-0" />
      <span className="text-sm text-[color:var(--theme-primary)] font-medium">
        Misma dirección de envío
      </span>
    </div>
  </section>
);

export default BillingSection;
