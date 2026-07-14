import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../firebase'
import useAuthStore from '../store/useAuthStore'
import styles from './Auth.module.scss'

const SignUp = () => {
  const [nick, setNick] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)

  // 수정: Firebase 회원가입 오류를 팝업 대신 폼 안에서 안내합니다.
  const getSignUpErrorMessage = (errorCode) => {
    const messages = {
      'auth/email-already-in-use': '이미 가입된 이메일입니다. 로그인 페이지를 이용해 주세요.',
      'auth/invalid-email': '이메일 형식을 확인해 주세요.',
      'auth/weak-password': '비밀번호는 숫자만 사용해도 되지만 6자리 이상이어야 합니다.',
      'auth/operation-not-allowed': 'Firebase 이메일 회원가입이 비활성화되어 있습니다.',
      'auth/network-request-failed': '네트워크 연결을 확인해 주세요.',
    }

    return messages[errorCode] ?? `회원가입에 실패했습니다. (${errorCode ?? '알 수 없는 오류'})`
  }

  // 수정: 회원가입 성공이 확인된 경우에만 방명록 페이지로 이동합니다.
  const submitFun = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
      await updateProfile(credential.user, { displayName: nick.trim() })
      setUser(credential.user)
      navigate('/guestbook')
    } catch (error) {
      console.error('회원가입 실패:', error)
      setErrorMessage(getSignUpErrorMessage(error.code))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={styles.auth}>
      <form onSubmit={submitFun} className={styles.card}>
        <p>WELCOME TO GUESTBOOK</p>
        <h1>SIGN-UP</h1>

        <label className={styles.field}>
          NICK NAME
          <input type="text" value={nick} onChange={(event) => setNick(event.target.value)} placeholder="Nick123" maxLength={12} required />
        </label>

        <label className={styles.field}>
          E_MAIL
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="example@email.com" required />
        </label>

        <label className={styles.field}>
          PASS-WORD
          <input type="password" inputMode="numeric" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="숫자만 사용해도 가능 (6자리 이상)" minLength={6} required />
        </label>
        {/* 수정: 회원가입 실패 이유를 현재 화면 안에 표시합니다. */}
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'SIGNUP...' : 'SIGNUP'}</button>
        <p className={styles.why}>계정이 있으신가요? {'  '}<Link to="/login">로그인 바로 가기</Link></p>
        <img src="/cloud2.jpg" alt="구름 사진" />
        <div className={styles.black}></div>
      </form>
    </section>
  )
}

export default SignUp
