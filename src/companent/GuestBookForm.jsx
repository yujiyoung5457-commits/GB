import React, { useEffect, useState } from 'react'
import CharacterAvatar from './CharacterAvatar'
import CHARACTERS from './characterData'
import styles from './GuestBook.module.scss'
import useAuthStore from '../store/useAuthStore'
import { createGuestBook } from '../services/guestBookService'
import GuestBookList from './GuestBookList'

const EMOJIS = ['😊', '😂', '😍', '🥰', '😎', '😭', '😴', '🤗', '👍', '👱‍♀️', '👶', '🤴', '👼', '👨‍✈️', '👩‍🚀', '👮‍♂️']

const GuestBookForm = ({ posts, loadError }) => {
  // 수정: Zustand에서 Firebase 로그인 사용자를 가져옵니다.
  const user = useAuthStore((state) => state.user)
  const [nickName, setNickName] = useState('')
  const [message, setMessage] = useState('')
  const [character, setCharacter] = useState('')
  const [formMessage, setFormMessage] = useState('')

  // 수정: 회원가입 때 저장한 닉네임을 방명록 작성 폼의 기본값으로 사용합니다.
  useEffect(() => {
    if (user?.displayName) setNickName(user.displayName)
  }, [user])

  const addEmoji = (emoji) => {
    setMessage((currentMessage) => currentMessage + emoji)
  }

  // 수정: 로그인 회원만 선택한 이모지·캐릭터와 메시지를 Firestore에 저장합니다.
  const submitForm = async (event) => {
    event.preventDefault()
    setFormMessage('')

    if (!user) {
      setFormMessage('로그인한 회원만 방명록을 작성할 수 있습니다.')
      return
    }

    if (!character) {
      setFormMessage('캐릭터를 선택해 주세요.')
      return
    }

    try {
      await createGuestBook({
        user,
        nickName: nickName.trim(),
        message: message.trim(),
        character,
      })
      setMessage('')
      setCharacter('')
      setFormMessage('방명록이 저장되었습니다.')
    } catch (error) {
      console.error('방명록 작성 실패:', error)
      // 수정: Firestore 규칙 미배포 등 실제 저장 실패 코드를 화면에 표시합니다.
      setFormMessage(`방명록 저장에 실패했습니다. (${error.code ?? '알 수 없는 오류'})`)
    }
  }

  return (
    <div className={styles.form}>
      <form onSubmit={submitForm} className={styles.cute}>
        <h2 className={styles.hello}>HELLO!</h2>

        <div className={styles.wrap}>
          <div className={styles.inputColumn}>
            <label className={styles.field}>
              NICK NAME
              <input
                type="text"
                value={nickName}
                onChange={(event) => setNickName(event.target.value)}
                placeholder="Nick123"
                maxLength={15}
                required
              />
            </label>

            <label className={styles.field}>
              MESSAGE
              {/* 수정: 선택한 캐릭터 이미지를 메시지 내용창 안에서 바로 미리 봅니다. */}
              <div className={styles.messageEditor}>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="write here"
                  maxLength={500}
                  required
                />
                {character && (
                  <div className={styles.messageCharacter}>
                    <CharacterAvatar character={character} />
                  </div>
                )}
              </div>
            </label>

            <button className={styles.save} type="submit">SAVE</button>
            {/* 수정: 방명록 안내도 팝업 없이 폼 내부에 표시합니다. */}
            {formMessage && <p className={styles.formMessage}>{formMessage}</p>}
          </div>

          <div className={styles.choiceColumn}>
            <section>
              <p className={styles.title}>MANY EMOJIS</p>
              <div className={styles.emojiList}>
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={styles.emo}
                    onClick={() => addEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className={styles.title}>CHARACTERS</p>
              <div className={styles.characterList}>
                {CHARACTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={item.label}
                    className={`${styles.characterButton} ${character === item.id ? styles.selected : ''}`}
                    onClick={() => setCharacter(item.id)}
                  >
                    <CharacterAvatar character={item.id} />
                  </button>
                ))}
              </div>
              
            </section>
          </div>

          {/* 수정: 검색과 작성 글을 요청 이미지처럼 오른쪽 열에 배치합니다. */}
          <GuestBookList posts={posts} loadError={loadError} />
        </div>
        {/* 어두운 것 */}
        <div className={styles.drop}></div>
      </form>
    </div>
  )
}

export default GuestBookForm
