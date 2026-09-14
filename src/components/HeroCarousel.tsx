import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles, ArrowRight, Pause, Play } from 'lucide-react';
import { CarouselSlide } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface HeroCarouselProps {
  slides: CarouselSlide[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const current = slides[currentSlideIndex];

  return (
    <div 
      className="relative rounded-2xl overflow-hidden shadow-xl border border-blue-900/40 text-white transition-all h-full flex flex-col justify-between"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      style={{ background: current.gradient }}
      id="hero-carousel-section"
    >
      {/* Decorative corporate background glow & mesh pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/15 via-transparent to-black/30 pointer-events-none"></div>
      
      {/* Subtle grid texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      ></div>

      <div className="relative z-10 px-6 py-7 sm:px-9 sm:py-8 flex-1 flex flex-col justify-between min-h-[320px] sm:min-h-[340px]">
        {/* Top Slide Meta: Badge & Slide Index Counter */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider text-cyan-200">
            <DynamicIcon name={current.icon} className="w-3.5 h-3.5 text-cyan-300" />
            <span>{current.badge}</span>
          </div>

          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs text-white/80 border border-white/10">
            <span>{currentSlideIndex + 1} de {slides.length}</span>
            <button 
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="hover:text-white transition p-0.5"
              title={isAutoPlaying ? "Pausar rotação automática" : "Retomar rotação automática"}
            >
              {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="my-4 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
            {current.title}
          </h2>
          <p className="text-cyan-200 font-medium text-sm sm:text-base mb-3">
            {current.subtitle}
          </p>
          <p className="text-slate-200/90 text-sm leading-relaxed max-w-xl">
            {current.description}
          </p>
        </div>

        {/* Action Button & Carousel Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {current.primaryActionUrl && (
            <a
              href={current.primaryActionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm transition-all shadow-lg hover:shadow-cyan-400/25 hover:-translate-y-0.5 active:translate-y-0"
              id={`carousel-action-btn-${current.id}`}
            >
              <span>{current.primaryActionText}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Dots Indicator & Arrows */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2 transition-all rounded-full ${
                    idx === currentSlideIndex
                      ? 'w-7 bg-cyan-400'
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1 pl-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition border border-white/10"
                aria-label="Slide anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition border border-white/10"
                aria-label="Próximo slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
