import React, { useEffect, useState } from 'react'
import GuestBookForm from './GuestBookForm.jsx'
import { subscribeGuestBooks } from '../services/guestBookService'

const GuestBook = () => {
  // 수정: Firestore 방명록을 실시간으로 구독하여 비회원도 조회할 수 있게 합니다.
  const [posts, setPosts] = useState([])
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const unsubscribe = subscribeGuestBooks(setPosts, (error) => {
      console.error('방명록 조회 실패:', error)
      // 수정: Firestore 조회 실패 원인을 검색창 아래에 전달합니다.
      setLoadError(`방명록을 불러오지 못했습니다. (${error.code ?? '알 수 없는 오류'})`)
    })

    return unsubscribe
  }, [])

  return (
    <div>
      {/* 수정: 조회 목록을 폼에 전달해 요청한 3열 화면 안에 배치합니다. */}
      <GuestBookForm posts={posts} loadError={loadError} />
    </div>
  )
}

export default GuestBook
