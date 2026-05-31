import React from 'react';
import { motion } from 'framer-motion';

function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-lg overflow-hidden relative ${className}`}
      style={{ background: '#f1f5f9', ...style }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.6s infinite',
        }}
      />
    </div>
  );
}

export function PostSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl overflow-hidden"
      style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}
    >
      <div className="p-5">
        {/* Author row */}
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3.5 w-36 rounded-md" />
            <Skeleton className="h-2.5 w-24 rounded-md" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        {/* Content lines */}
        <div className="space-y-2.5">
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-[88%] rounded-md" />
          <Skeleton className="h-3.5 w-[72%] rounded-md" />
        </div>
      </div>
      {/* Stats bar */}
      <div className="px-5 py-3" style={{ borderTop: '1px solid #f1f5f9' }}>
        <div className="flex gap-3">
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
      </div>
      {/* Actions */}
      <div className="px-5 py-3 flex gap-2" style={{ borderTop: '1px solid #f1f5f9' }}>
        {[60, 72, 64, 80].map((w, i) => (
          <Skeleton key={i} className="h-8 rounded-xl flex-1" />
        ))}
      </div>
    </motion.div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <PostSkeleton />
        </motion.div>
      ))}
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
      <Skeleton className="h-20 rounded-none" />
      <div className="px-6 pb-6">
        <div className="flex items-end gap-4 -mt-8 mb-4">
          <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" style={{ border: '3px solid white' }} />
          <div className="space-y-2 pb-1 flex-1">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-4/5 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function ConnectionCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 flex items-center gap-3" style={{ border: '1px solid #e2e8f0' }}>
      <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-32 rounded-md" />
        <Skeleton className="h-2.5 w-20 rounded-md" />
      </div>
      <Skeleton className="h-8 w-24 rounded-xl" />
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-20 rounded-md" />
        <Skeleton className="h-11 w-56 rounded-2xl" />
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 space-y-4" style={{ border: '1px solid #e2e8f0' }}>
      <div className="flex justify-between items-start">
        <Skeleton className="h-4 w-44 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded-md" />
        <Skeleton className="h-3 w-3/4 rounded-md" />
      </div>
      <div className="flex gap-2">
        {[56, 68, 48].map((w, i) => (
          <Skeleton key={i} className="h-5 rounded-full" style={{ width: `${w}px` }} />
        ))}
      </div>
      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-3 w-20 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}

export { Skeleton };
