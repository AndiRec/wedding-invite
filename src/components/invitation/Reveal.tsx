import { motion as Motion } from "framer-motion";

/**
 * Fades + lifts its children into view as they scroll into the viewport.
 * A subtle "soft animation" pass that makes the long invitation feel premium.
 */
export default function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </Motion.div>
  );
}
