'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { api, setRoleMarker } from '@/lib/api';
import { ADMIN_HOME, ADMIN_NAV, type AdminRole, canAccessAdminPath, isAdminRole } from '@/lib/admin-access';

// Garde commune à toutes les pages /admin : rôle relu via /auth/me (source de vérité côté
// interface), menu filtré, redirection hors périmètre. Le middleware fait la même redirection
// plus tôt à partir du marqueur gc_role ; le backend renvoie 403 dans tous les cas.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<AdminRole | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.auth
      .me()
      .then((me) => {
        if (cancelled) return;
        if (me?.role) setRoleMarker(me.role);
        if (!isAdminRole(me?.role)) {
          router.replace('/dashboard');
          return;
        }
        setRole(me.role);
      })
      .catch(() => {
        // 401 : request() redirige déjà vers /auth/login
        if (!cancelled) router.replace('/auth/login?redirect=' + encodeURIComponent(pathname));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allowed = role !== null && canAccessAdminPath(role, pathname);

  useEffect(() => {
    if (role && !canAccessAdminPath(role, pathname)) router.replace(ADMIN_HOME[role]);
  }, [role, pathname, router]);

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg, #f8fafc)' }}>
        <Loader2 className="animate-spin text-slate-400" size={24} />
      </div>
    );
  }

  const items = ADMIN_NAV.filter((i) => i.roles.includes(role));

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg, #f8fafc)' }}>
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center gap-1 overflow-x-auto">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mr-3 py-4 whitespace-nowrap">
            {role === 'EDITOR' ? 'Édition' : 'Administration'}
          </span>
          {items.map((item) => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold px-3 py-4 border-b-2 whitespace-nowrap transition-colors"
                style={active ? { borderColor: '#3b82f6', color: '#1e40af' } : { borderColor: 'transparent', color: '#64748b' }}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/dashboard"
            className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors py-4 whitespace-nowrap"
          >
            <ArrowLeft size={15} />
            Tableau de bord
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
