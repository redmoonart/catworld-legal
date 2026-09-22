import { useState } from "react";
import { motion } from "framer-motion";
import { Trans } from "../i18n/I18nContext";
import { useI18n } from "../i18n/I18nContext";

export default function FAQItem({ qKey, aKey, defaultOpen = false }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <h4>
        <button className="faq-toggle" type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span>{t(qKey)}</span> <span className="tog" aria-hidden="true">{open ? "−" : "+"}</span>
        </button>
      </h4>
      <motion.div
        className="faq-body"
        initial={false}
        animate={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        style={{ display: "grid", overflow: "hidden" }}
        transition={{ duration: 0.3, ease: [0.16, 0.84, 0.44, 1] }}
      >
        <div style={{ minHeight: 0, overflow: "hidden" }}>
          <p><Trans k={aKey} /></p>
        </div>
      </motion.div>
    </div>
  );
}
