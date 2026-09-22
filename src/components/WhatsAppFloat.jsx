import { useI18n } from "../i18n/I18nContext";
import { STORE_CONFIG } from "../data/config";
import { waLink } from "../lib/whatsapp";

export default function WhatsAppFloat() {
  const { t } = useI18n();
  const href = waLink(STORE_CONFIG.whatsapp, t("wa.generic", { store: STORE_CONFIG.name }));
  return (
    <a className="wa-float" href={href} target="_blank" rel="noreferrer" aria-label={t("aria.wa")}>
      📱
    </a>
  );
}
