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

const WEATHER_CITIES = ['Ansan', 'Helsinki', 'Tokyo', 'Rome', 'Moscow']
const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

/* Legacy HTML weather script (replaced by React state below).
let dis=document.querySelector("#dis")
        let rain=document.querySelector("#rain")
        let city=document.querySelector(".city")
        let biento=document.querySelector("#biento")
        let name=document.querySelector(".name")
        let imgBox=document.querySelector(".imgBox")

        const API_KEY=''

        const cityname=["Ansan", "Helsinki", "Tokyo", "Rome", "Moscow"];

        let con=document.querySelector("#con")

          
    
        async function weatherToday(cityname){
            let res=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=${API_KEY}&units=metric&lang=kr`)
            let data=await res.json()
            dis.innerHTML="Temperature:"+data.main.temp+"℃"
            rain.innerHTML="Dew Point:"+data.main.humidity+"%"
            biento.innerHTML="Wind Speed:"+data.wind.speed 
            let icon=data.weather[0].icon;

            let iconUrl=`http://openweathermap.org/img/wn/${icon}@2x.png`
            con.setAttribute('src', iconUrl)
            name.innerHTML=cityname
        }
        weatherToday('Ansan')
*/
        // 날씨 API가져옴
const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [revealedTitles, setRevealedTitles] = useState({})
  const [selectedCity, setSelectedCity] = useState('Ansan')
  const [weather, setWeather] = useState(null)
  const [weatherError, setWeatherError] = useState('')
  const [isWeatherLoading, setIsWeatherLoading] = useState(true)
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
    const controller = new AbortController()

    const loadWeather = async () => {
      setIsWeatherLoading(true)
      setWeatherError('')

      if (!WEATHER_API_KEY) {
        setWeatherError('OpenWeather API key가 설정되지 않았습니다.')
        setIsWeatherLoading(false)
        return
      }

      try {
        const params = new URLSearchParams({
          q: selectedCity,
          appid: WEATHER_API_KEY,
          units: 'metric',
          lang: 'kr',
        })
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?${params}`,
          { signal: controller.signal },
        )

        if (!response.ok) throw new Error(`날씨 요청 실패 (${response.status})`)
        setWeather(await response.json())
      } catch (error) {
        if (error.name !== 'AbortError') setWeatherError(error.message)
      } finally {
        if (!controller.signal.aborted) setIsWeatherLoading(false)
      }
    }

    loadWeather()
    return () => controller.abort()
  }, [selectedCity])

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
    <section className={styles.section3}>
      <h1 className={styles.todo}>What’s your sky today?</h1>
      {/* 날씨 에피아이 가져온거 아래 */}
      <div className={styles.one}>
    
        <div className={styles.wrap}>
        
        <div className={styles.city}>
          {WEATHER_CITIES.map((city) => (
            <button
              type="button"
              className={`${styles.bt} ${selectedCity === city ? styles.activeCity : ''}`}
              key={city}
              onClick={() => setSelectedCity(city)}
            >
              {city}
            </button>
          ))}
        </div>

        <div className={styles.mainBox}>
          {isWeatherLoading && <p className={styles.weatherMessage}>날씨를 불러오는 중...</p>}
          {weatherError && <p className={styles.weatherMessage}>{weatherError}</p>}
          {weather && !isWeatherLoading && !weatherError && (
            <>
              <img
                className={styles.weatherIcon}
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
              />
              <div className={styles.text}>
                <h2 className={styles.name}>{weather.name}</h2>
                <div>Temperature: {Math.round(weather.main.temp)}°C</div>
                <div>Humidity: {weather.main.humidity}%</div>
                <div>Wind Speed: {weather.wind.speed} m/s</div>
              </div>
            </>
          )}
        </div>
        <div className={styles.circle}></div>
    </div>
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
