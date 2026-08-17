'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame } from 'lucide-react';

interface StreakFlash {
  current: number;
  longest: number;
  isNewDay: boolean;
  isFirstVisit?: boolean;
}

interface Particle {
  id: number;
  x: number;
  rotate: number;
  color: string;
  delay: number;
  size: number;
}

const CONFETTI_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e'];

function milestoneMessage(current: number): string {
  if (current >= 30) return 'Un mois de suite, impressionnant !';
  if (current >= 14) return 'Deux semaines complètes, bravo !';
  if (current >= 7) return 'Une semaine complète, bravo !';
  if (current >= 3) return 'Tu prends le rythme !';
  return 'Content de te revoir.';
}

// Bannière ponctuelle affichée juste après connexion/inscription (lue depuis
// sessionStorage, posée par lib/api.ts) — moment de bienvenue à l'inscription,
// rappel de streak au retour, pour donner envie de revenir régulièrement.
export default function WelcomeStreakBanner() {
  const [flash, setFlash] = useState<StreakFlash | null>(null);
  // GlobalProvider est monté une seule fois au niveau du layout racine — il ne se
  // remonte pas lors d'une navigation client-side (ex: /auth/signup → /dashboard).
  // On réagit donc aux changements de route plutôt qu'au seul montage initial,
  // sinon le flag posé par lib/api.ts juste après la redirection n'est jamais relu.
  const pathname = usePathname();

  useEffect(() => {
    const raw = sessionStorage.getItem('gc_streak_flash');
    if (!raw) {
      console.debug('[streak] rien dans sessionStorage à', pathname);
      return;
    }
    sessionStorage.removeItem('gc_streak_flash');
    try {
      const parsed: StreakFlash = JSON.parse(raw);
      console.debug('[streak] flag trouvé et lu :', parsed);
      if (parsed.isFirstVisit || parsed.isNewDay) {
        setFlash(parsed);
        const timer = setTimeout(() => setFlash(null), 5500);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, [pathname]);

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 300,
        rotate: Math.random() * 360,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 0.15,
        size: 6 + Math.random() * 5,
      })),
    [],
  );

  const isWelcome = !!flash?.isFirstVisit;
  const showConfetti = !!flash && (isWelcome || flash.current >= 3);

  return (
    <AnimatePresence>
      {flash && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={{ type: 'spring', bounce: 0.35, duration: 0.6 }}
          onClick={() => setFlash(null)}
          className="fixed top-5 left-1/2 z-[9999] cursor-pointer"
          style={{ transform: 'translateX(-50%)' }}
        >
          <div
            className="relative flex items-center gap-3 rounded-2xl px-5 py-3.5 text-white overflow-hidden"
            style={{
              background: isWelcome
                ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 60%, #8b5cf6 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              boxShadow: '0 16px 40px rgba(15,23,42,0.25)',
              minWidth: 280,
            }}
          >
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none">
                {particles.map((p) => (
                  <motion.span
                    key={p.id}
                    initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                    animate={{ x: p.x, y: 90 + Math.random() * 40, opacity: 0, rotate: p.rotate }}
                    transition={{ duration: 1 + Math.random() * 0.3, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: p.size,
                      height: p.size * 0.4,
                      background: p.color,
                      borderRadius: 2,
                    }}
                  />
                ))}
              </div>
            )}

            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.6, delay: 0.15 }}
              className="relative w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0"
            >
              {isWelcome ? <Sparkles size={20} /> : <Flame size={20} />}
            </motion.div>

            <div className="relative min-w-0">
              <p className="font-bold text-sm">
                {isWelcome
                  ? 'Bienvenue sur GoConnexions !'
                  : `${flash.current} jour${flash.current > 1 ? 's' : ''} de suite !`}
              </p>
              <p className="text-xs text-white/80">
                {isWelcome ? 'Ton compte est prêt — explore ton réseau.' : milestoneMessage(flash.current)}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
