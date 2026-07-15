import React from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import styles from './Header.module.scss'

const Header = () => {
  // 수정: Zustand의 로그인 상태에 따라 로그인/로그아웃 동작을 전환합니다.
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const isGuestBookPage = location.pathname === '/guestbook'

  const handleLogout = async (event) => {
    event.preventDefault()

    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('로그아웃 실패:', error)
      alert('로그아웃에 실패했습니다.')
    }
  }

  return (
    <header className={`${styles.header} ${isGuestBookPage ? styles.guestBookHeader : ''}`}>
      <span></span>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>GUESTBOOK-CLOUD</Link>
        <nav className={styles.nav}>
          <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''}>HOME</NavLink>
          <NavLink to="/guestbook" className={({ isActive }) => isActive ? styles.active : ''}>GUESTBOOK</NavLink>
          <NavLink to="/Gallery" className={({ isActive }) => isActive ? styles.active : ''}>GALLERY</NavLink>
        </nav>
        <div>
          {/* 수정: 기존 LOGIN 위치를 로그인 상태일 때 LOGOUT으로 사용합니다. */}
          {user
            ? <Link to="/" className={styles.login} onClick={handleLogout}>LOGOUT</Link>
            : <Link to="/login" className={styles.login}>LOGIN</Link>}
          <Link to="/signup" className={styles.signup}>SIGN UP</Link>
        </div>
      </div>
    </header>
  )
}

export default Header
