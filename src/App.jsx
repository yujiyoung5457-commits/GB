import React, { useEffect } from 'react'
import { Navigate, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import GuestBook from './companent/GuestBook.jsx'
import Login from './pages/Login'
import Header from './companent/Header'
import SignUp from './pages/SignUp'
import useAuthStore from './store/useAuthStore'

const App = () => {
  // 수정: 앱 시작 시 Firebase 인증 상태를 Zustand와 동기화합니다.
  const initializeAuth = useAuthStore((state) => state.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <div>
     <Header />
     <Routes>
        <Route path='/' element={ <Home />} />
        <Route path='/login' element={ <Login />} />
        <Route path='/signup' element={ <SignUp />} />
        <Route path='/guestbook' element={<GuestBook/>} />
        {/* 만들지 않은 주소로 접근하면 홈으로 이동시킨다 */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </div>
  )
}

export default App

/* 
  guestbook 만들기
  프론트 - 서버연결(firebase) 

  폴더구조
    src
    ├─ main.jsx(BrowserRouter 생성)
    ├─ App.jsx(Routes, Route)
    ├─ components
       ├─ Header.jsx(Link, NavLink)
       ├─ Header.module.scss
       ├─ CharacterAvatar.jsx(캐릭터관리)
       ├─ CharacterAvatar.module.scss 
       ├─ characterData.js(캐릭터데이터)
       ├─ GuestbookForm.jsx(글입력, 캐릭터선택, 이모티콘선택등)
       ├─ GuestbookForm.module.scss
    ├─ pages
       ├─ Home.jsx ( 동영상 3개 무한전환)
       ├─ Home.module.scss
       ├─ Guestbook.jsx( GuestbookForm.jsx import )
       ├─ Guestbook.module.scss 
       ├─ Login.jsx
       ├─ Signup.jsx
       ├─ Auth.module.scss ( Login + Signup )

*/


 
