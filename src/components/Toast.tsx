import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useStore } from '../store/StoreProvider';

export default function Toast() {
  const { toast, dismissToast } = useStore();
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          key={toast.id}
          initial={reducedMotion ? false : { opacity: 0, y: 18, x: 12 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          className={`fixed bottom-5 left-5 z-[90] flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold shadow-editorial ${toast.tone === 'light' ? 'bg-paper text-ink' : 'bg-ink text-paper'}`}
          role="status"
          onClick={dismissToast}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current/20">
            <Check size={14} />
          </span>
          <span>{toast.message}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
