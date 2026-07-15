import { useEffect, useRef, useState } from "react"
import styles from './Home.module.scss'

const videos =[
    {title: "WHITE MOVE", label: "CLOUD" , src: "/mp4/cloud3.mp4"},
    {title: "SEA & SKY", label: "SKY" , src: "/mp4/cloud10.mp4"},
    {title: "RABBIT FLOWER", label: "BLUE" ,src: "/mp4/cloud9.mp4"},
    {title: "FLOWER DANCE", label: "SLOW" , src: "/mp4/cloud7.mp4"},
]
const Home = () => {
    // 현재 보여줄 영상 번호 
    const [activeIndex, setActiveIndex]=useState(0)
    const [previousIndex, setPreviousIndex] = useState(null)
    const activeIndexRef = useRef(0)
    const fadeTimerRef = useRef(null)
    //현재 보여줄 영상 객체
    const activeVideo=videos[activeIndex]
    // 수정: 전환할 때만 이전 영상을 남기고 페이드 종료 후 DOM에서 제거합니다.
    const changeVideo = (nextIndex) => {
        const currentIndex = activeIndexRef.current
        if (nextIndex === currentIndex) return

        setPreviousIndex(currentIndex)
        activeIndexRef.current = nextIndex
        setActiveIndex(nextIndex)

        clearTimeout(fadeTimerRef.current)
        fadeTimerRef.current = setTimeout(() => {
            setPreviousIndex(null)
        }, 1200)
    }
    //4초 마다 다음 영상으로 전환
    useEffect(()=>{
        const timer=setInterval(()=>{
            const nextIndex = (activeIndexRef.current + 1) % videos.length
            changeVideo(nextIndex)
        }, 4000)
        return ()=>{
            clearInterval(timer)
            clearTimeout(fadeTimerRef.current)
        }
    },[])
  return (
    <section className={styles.home}>
        <div className={styles.slide}>
            {/* 여기는 어두운 부분 */}
            <div className={styles.drop}></div>
            {/* 수정: 평소에는 활성 영상 1개만 재생해 브라우저 디코딩 부하를 줄입니다. */}
            <video
                key={videos[activeIndex].src}
                className={`${styles.videoLayer} ${styles.activeVideo}`}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
            >
                <source src={videos[activeIndex].src} type="video/mp4"/>
            </video>

            {/* 수정: 페이드 중인 1.2초 동안만 이전 영상을 추가로 유지합니다. */}
            {previousIndex !== null && (
                <video
                    key={videos[previousIndex].src}
                    className={`${styles.videoLayer} ${styles.previousVideo}`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-hidden="true"
                >
                    <source src={videos[previousIndex].src} type="video/mp4"/>
                </video>
            )}
        </div>
        {/* 글자가 나타나는 부분 */}
        <div className={styles.copy}>
            <h1>{activeVideo.label}</h1>
            <h2>{activeVideo.title}</h2>
        </div>
        {/* 동영상을 알려주는 점 (dot) */}
        <div className={styles.dots}>
            {videos.map((item,index)=>{
                return (
                    <button key={item.label} className={`${styles.activeDot} ${
  index === activeIndex ? styles.on : ''
}`}
                    onClick={()=>{
                        changeVideo(index)
                    }}>

                    </button>
                )
            })}
        </div>
    </section>
  )
}

export default Home
