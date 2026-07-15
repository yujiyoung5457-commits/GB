import React, { useEffect, useRef, useState } from 'react'
import styles from './Gallery.module.scss'

const GALLERY_IMAGES = [
   '/img/c06.jpg',
  '/img/c07.jpg',
  '/img/c08.jpg',
  '/img/c05.jpg',
  '/img/c01.jpg',
  '/img/c02.jpg',
  '/img/c03.jpg',
  '/img/c04.jpg',
]

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [revealedTitles, setRevealedTitles] = useState({})
  const galleryRef = useRef(null)
  const sliderRef = useRef(null)
  const cursorRef = useRef(null)
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    hasMoved: false,
    pressedImage: null,
  })

  const startDragging = (event) => {
    const slider = sliderRef.current
    if (!slider) return

    dragRef.current = {
      isDragging: true,
      startX: event.clientX,
      scrollLeft: slider.scrollLeft,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
      hasMoved: false,
      pressedImage: event.target.closest('[data-gallery-image]')?.dataset.galleryImage ?? null,
    }
    slider.dataset.dragging = 'true'
    slider.setPointerCapture(event.pointerId)
  }

  const dragSlider = (event) => {
    const slider = sliderRef.current
    if (!slider || !dragRef.current.isDragging) return

    event.preventDefault()
    if (Math.abs(event.clientX - dragRef.current.startX) > 6) {
      dragRef.current.hasMoved = true
    }
    const now = performance.now()
    const elapsed = Math.max(now - dragRef.current.lastTime, 1)
    dragRef.current.velocity = (event.clientX - dragRef.current.lastX) / elapsed
    dragRef.current.lastX = event.clientX
    dragRef.current.lastTime = now
    slider.scrollLeft = dragRef.current.scrollLeft - (event.clientX - dragRef.current.startX)
  }

  const stopDragging = (event) => {
    const slider = sliderRef.current
    if (!slider || !dragRef.current.isDragging) return

    dragRef.current.isDragging = false
    slider.dataset.dragging = 'false'
    if (slider.hasPointerCapture(event.pointerId)) {
      slider.releasePointerCapture(event.pointerId)
    }

    if (!dragRef.current.hasMoved && dragRef.current.pressedImage) {
      setSelectedImage(dragRef.current.pressedImage)
    }

    slider.scrollBy({
      left: -dragRef.current.velocity * 220,
      behavior: 'smooth',
    })
  }

  const moveCustomCursor = (event) => {
    if (!cursorRef.current) return
    cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`
  }

  const showCustomCursor = () => {
    if (cursorRef.current) cursorRef.current.dataset.visible = 'true'
  }

  const hideCustomCursor = () => {
    if (cursorRef.current) cursorRef.current.dataset.visible = 'false'
  }


  useEffect(() => {
    if (!selectedImage) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedImage(null)
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [selectedImage])

  useEffect(() => {
    const revealElements = galleryRef.current?.querySelectorAll('[data-reveal]')
    if (!revealElements?.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const revealId = entry.target.dataset.reveal
            setRevealedTitles((current) => ({ ...current, [revealId]: true }))
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 },
    )

    revealElements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={galleryRef} className={styles.gallery}>
    <div
      ref={cursorRef}
      className={styles.customCursor}
      data-visible="false"
      aria-hidden="true"
    >
      <div className={styles.cursorLens}></div>
      <div className={styles.cursorVisual}>
        <img src="/img/w.png" alt="" />
      </div>
    </div>
    <section className={styles.section}>
      <div className={styles.txtBox}>
      <h1
        className={`${styles.text1} ${revealedTitles.hero ? styles.visible : ''}`}
        data-reveal="hero"
      >
        GALLERY<br />CLOUD
      </h1>
      </div>
    </section>
    <section className={styles.section2}>
      <h1
        className={`${styles.text2} ${revealedTitles.gallery ? styles.visible : ''}`}
        data-reveal="gallery"
      >
        EVERY CLOUDS
      </h1>
      <div
        className={styles.sliderWrap}
        onPointerMove={moveCustomCursor}
        onPointerEnter={showCustomCursor}
        onPointerLeave={hideCustomCursor}
      >
        <div
          className={styles.imageSlider}
          ref={sliderRef}
          onPointerDown={startDragging}
          onPointerMove={dragSlider}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
        >
          {GALLERY_IMAGES.map((image, index) => (
            <button
              type="button"
              className={styles.imageCard}
              key={image}
              data-gallery-image={image}
              onClick={(event) => {
                if (event.detail === 0) setSelectedImage(image)
              }}
              aria-label={`Open cloud gallery image ${index + 1}`}
            >
              <img src={image} alt={`Cloud gallery ${index + 1}`} draggable="false" />
            </button>
          ))}
        </div>
      </div>
    </section>
    <section className={styles.section3} aria-label="Abstract sky illustration">
      <h1
        className={`${styles.weatherTitle} ${revealedTitles.weather ? styles.visible : ''}`}
        data-reveal="weather"
      >
        Nice weather, huh?
      </h1>
      <svg
        className={styles.titleArc}
        viewBox="0 0 1000 270"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path id="titleArcRoute" d="M16 252Q390 -76 984 58" />
        <circle r="5">
          <animateMotion
            dur="11s"
            repeatCount="indefinite"
            keyPoints="0;1;0"
            keyTimes="0;0.5;1"
            calcMode="linear"
          >
            <mpath href="#titleArcRoute" />
          </animateMotion>
        </circle>
      </svg>
      <svg
        className={styles.skyGraphic}
        viewBox="0 0 1000 600"
        role="img"
        aria-labelledby="skyGraphicTitle"
      >
        <title id="skyGraphicTitle">Abstract wind, cloud, and colorful sky dots</title>

        <g className={styles.skyLines}>
          <path d="M70 165H390" />
          <circle cx="70" cy="165" r="4" className={styles.whiteDot} />

          <path d="M25 525C45 455 55 390 85 390C115 390 125 455 145 525" />
          <path d="M25 525C45 455 55 390 85 390C115 390 125 455 145 525" transform="translate(120 0)" />
          <path d="M25 525C45 455 55 390 85 390C115 390 125 455 145 525" transform="translate(240 0)" />

          <path id="windRoute" d="M515 105V150H440C418 150 418 184 440 184H515V225H585C610 225 610 260 585 260H515V300H440C418 300 418 334 440 334H515V375H585C610 375 610 410 585 410H515V505" />
          <circle r="4" className={`${styles.whiteDot} ${styles.routeDot}`}>
            <animateMotion dur="7s" repeatCount="indefinite" rotate="auto">
              <mpath href="#windRoute" />
            </animateMotion>
          </circle>

          <path id="cloudRoute" d="M735 150H720C695 150 675 130 675 105S695 60 720 60H905C930 60 950 80 950 105C950 115 947 124 941 132C967 137 985 159 985 185C985 215 960 240 930 240H735C710 240 690 220 690 195S710 150 735 150Z" />
        </g>

        <g className={styles.skyDots}>
          <circle cx="515" cy="82" r="24" fill="rgb(212, 25, 25)" />
          <circle cx="375" cy="183" r="16" fill="rgb(253, 211, 24)" />
          <circle cx="280" cy="255" r="16" fill="rgb(62, 92, 226)" />
          <circle cx="170" cy="335" r="16" fill="rgb(212, 25, 25)" />
          <circle r="11" fill="#1dbc5d" className={styles.routeDot}>
            <animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
              <mpath href="#cloudRoute" />
            </animateMotion>
          </circle>
        </g>
      </svg>
      <div className={styles.sunCharacter} aria-hidden="true">
        <img className={styles.sunMane} src="/img/backsun.svg" alt="" />
        <img className={styles.sunFace} src="/img/smile.png" alt="" />
      </div>
    </section>
    {selectedImage && (
      <div
        className={styles.modalBackdrop}
        role="presentation"
        onClick={() => setSelectedImage(null)}
      >
        <div
          className={styles.modalContent}
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged gallery image"
          onClick={(event) => event.stopPropagation()}
        >
          <img src={selectedImage} alt="Enlarged cloud gallery" />
          <button
            type="button"
            className={styles.modalClose}
            aria-label="Close image"
            onClick={() => setSelectedImage(null)}
          >
            &times;
          </button>
        </div>
      </div>
    )}
    </div>
  )
}

export default Gallery
