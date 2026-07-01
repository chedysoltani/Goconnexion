'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const VIDEO_ID = 'vs-I-ZNV5ys';
const THUMBNAIL = `https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`;
const EMBED_URL = `https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`;

export default function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section
      className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden"
      style={{ background: '#080f1a' }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(74,144,217,0.10) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Glow blobs */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(74,144,217,0.12) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest"
            style={{ background: 'rgba(74,144,217,0.12)', border: '1px solid rgba(74,144,217,0.25)', color: '#7eb8f0' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#7eb8f0] inline-block" />
            Voir en action
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.08]">
            Découvrez GoConnexions{' '}
            <span className="font-serif italic font-normal" style={{ color: '#7eb8f0' }}>
              en 2 minutes.
            </span>
          </h2>
          <p className="text-white/50 text-base max-w-lg mx-auto leading-relaxed">
            Regardez comment GoConnexions transforme votre façon de gérer et développer votre réseau professionnel.
          </p>
        </div>

        {/* Video player */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl"
          style={{
            border: '1px solid rgba(74,144,217,0.2)',
            boxShadow: '0 0 0 1px rgba(74,144,217,0.1), 0 32px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* 16:9 aspect ratio wrapper */}
          <div className="relative" style={{ paddingBottom: '56.25%' }}>
            {playing ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={EMBED_URL}
                title="GoConnexions — Présentation officielle"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 w-full h-full group"
                aria-label="Lancer la vidéo GoConnexions"
              >
                {/* Thumbnail */}
                <Image
                  src={THUMBNAIL}
                  alt="Aperçu de la vidéo GoConnexions"
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: 'rgba(255,255,255,0.95)',
                      boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
                    }}
                  >
                    {/* Triangle play icon */}
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="#0f1f3d"
                      className="translate-x-0.5"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* YouTube badge */}
                <div
                  className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-white"
                  style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
                >
                  <svg width="14" height="10" viewBox="0 0 24 17" fill="red">
                    <path d="M23.5 2.6s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.6-.1 12 0 12 0S7.4-.1 4.7.5c-.6.1-1.9.1-3 1.3C.8.6.5 2.6.5 2.6S.2 4.9.2 7.2v2.2c0 2.3.3 4.6.3 4.6s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.2 18.2 12 18.2 12 18.2s4.6 0 7.3-.6c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.3.3-4.6V7.2c0-2.3-.3-4.6-.3-4.6zM9.7 12.1V4.9l8.1 3.7-8.1 3.5z" />
                  </svg>
                  YouTube
                </div>
              </button>
            )}
          </div>
        </div>

        {/* CTA sous la vidéo */}
        <div className="text-center mt-10">
          <a
            href="/signup"
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              boxShadow: '0 4px 20px rgba(59,130,246,0.35)',
            }}
          >
            Commencer gratuitement
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <p className="text-white/30 text-xs mt-3">Sans carte bancaire · Gratuit pour commencer</p>
        </div>
      </div>
    </section>
  );
}
