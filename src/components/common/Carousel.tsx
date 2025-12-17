import React, { useState, useEffect } from 'react';
import './Carousel.css';

export interface CarouselItem {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  category?: string;
}

interface CarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showThumbnails?: boolean;
  showIndicators?: boolean;
  showNavigation?: boolean;
  className?: string;
  height?: string;
}

const Carousel: React.FC<CarouselProps> = ({
  items,
  autoPlay = true,
  autoPlayInterval = 5000,
  showThumbnails = true,
  showIndicators = true,
  showNavigation = true,
  className = '',
  height = '500px'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, items.length, autoPlayInterval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (!items || items.length === 0) {
    return (
      <div className={`carousel-container ${className}`}>
        <div className="carousel-empty">
          <p>No images to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`carousel-container ${className}`} style={{ height }}>
      {/* Main Carousel */}
      <div className="carousel-main">
        {/* Navigation Arrows */}
        {showNavigation && items.length > 1 && (
          <>
            <button 
              className="carousel-nav carousel-nav-prev" 
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              ←
            </button>
            <button 
              className="carousel-nav carousel-nav-next" 
              onClick={goToNext}
              aria-label="Next image"
            >
              →
            </button>
          </>
        )}

        {/* Auto-play Toggle */}
        {items.length > 1 && (
          <button 
            className="carousel-autoplay-toggle" 
            onClick={toggleAutoPlay}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
        )}

        {/* Slides */}
        <div className="carousel-slides">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
            >
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="carousel-image"
              />
            </div>
          ))}
        </div>

        {/* Indicators */}
        {showIndicators && items.length > 1 && (
          <div className="carousel-indicators">
            {items.map((_, index) => (
              <button
                key={index}
                className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && items.length > 1 && (
        <div className="carousel-thumbnails">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`carousel-thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            >
              <img src={item.imageUrl} alt={item.title} />
              <div className="thumbnail-overlay">
                <span className="thumbnail-title">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide Counter */}
      {items.length > 1 && (
        <div className="carousel-counter">
          {currentIndex + 1} / {items.length}
        </div>
      )}
    </div>
  );
};

export default Carousel;
