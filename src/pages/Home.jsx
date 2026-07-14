import { useEffect, useState } from "react"
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
    //현재 보여줄 영상 객체
    const activeVideo=videos[activeIndex]
    //4초 마다 다음 영상으로 전환
    useEffect(()=>{
        const timer=setInterval(()=>{
            setActiveIndex((idx)=>{
                if(idx===videos.length-1){
                    return 0
                }
                return idx+1
            })
        }, 4000)
        return ()=>{
            clearInterval(timer)
        }
    },[])
  return (
    <section className={styles.home}>
        <div className={styles.slide}>
            {/* 수정: 영상을 겹쳐 배치하고 활성 영상의 투명도를 바꿔 부드럽게 전환합니다. */}
            {videos.map((video, index) => (
                <video
                    key={video.src}
                    className={`${styles.videoLayer} ${index === activeIndex ? styles.activeVideo : ''}`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-hidden={index !== activeIndex}
                >
                    <source src={video.src} type="video/mp4"/>
                </video>
            ))}
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
                        setActiveIndex(index)
                    }}>

                    </button>
                )
            })}
        </div>
    </section>
  )
}

export default Home
