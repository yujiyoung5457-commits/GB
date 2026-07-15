import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import styles from './Auth.module.scss'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  // 수정: Firebase 오류를 팝업 대신 로그인 폼 안에서 안내합니다.
  const getLoginErrorMessage = (errorCode) => {
    const messages = {
      'auth/invalid-credential': '가입 정보가 없습니다. 먼저 회원가입을 다시 진행하거나 이메일과 비밀번호를 확인해 주세요.',
      'auth/user-not-found': '해당 이메일로 가입된 계정이 없습니다.',
      'auth/wrong-password': '비밀번호가 일치하지 않습니다.',
      'auth/invalid-email': '이메일 형식을 확인해 주세요.',
      'auth/too-many-requests': '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      'auth/operation-not-allowed': 'Firebase 이메일 로그인이 비활성화되어 있습니다.',
      'auth/network-request-failed': '네트워크 연결을 확인해 주세요.',
    }

    return messages[errorCode] ?? `로그인에 실패했습니다. (${errorCode ?? '알 수 없는 오류'})`
  }

  // 수정: 이메일을 정규화하고 제출 중복을 막습니다.
  const submitFun = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
      navigate('/guestbook')
    } catch (error) {
      console.error('로그인 실패:', error)
      setErrorMessage(getLoginErrorMessage(error.code))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={styles.auth}>
      <form onSubmit={submitFun} className={styles.card}>
        <p>WELCOME TO GUESTBOOK</p>
        <h1>LOGIN</h1>

        <label className={styles.field}>
          E-MAIL
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="example@email.com" required />
        </label>

        <label className={styles.field}>
          PASS-WORD
          <input type="password" inputMode="numeric" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="text and number" required />
        </label>
        {/* 수정: 브라우저 alert 대신 폼 내부 오류 문구를 표시합니다. */}
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'LOGIN...' : 'LOGIN'}</button>
        <p className={styles.why}>계정이 없으신가요? {'  '}<Link to="/signup">회원가입 바로 가기</Link></p>
        <img src="img/cloud2.jpg" alt="구름 사진" />
         <div className={styles.black}></div>
      </form>
    </section>
  )
}

export default Login
