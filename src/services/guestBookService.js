import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

const guestBooksRef = collection(db, 'guestbooks')

// 수정: 방명록을 최신 작성 순서로 실시간 조회합니다.
export const subscribeGuestBooks = (onData, onError) => {
  const guestBooksQuery = query(guestBooksRef, orderBy('createdAt', 'desc'))

  return onSnapshot(guestBooksQuery, (snapshot) => {
    onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
  }, onError)
}

// 수정: 로그인한 작성자의 UID를 문서에 저장합니다.
export const createGuestBook = ({ user, nickName, message, character }) => {
  return addDoc(guestBooksRef, {
    authorId: user.uid,
    authorEmail: user.email,
    nickName,
    message,
    character,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

// 수정: 수정 가능한 필드만 전달하여 작성자 정보가 바뀌지 않게 합니다.
export const updateGuestBook = (id, { message, character }) => {
  return updateDoc(doc(db, 'guestbooks', id), {
    message,
    character,
    updatedAt: serverTimestamp(),
  })
}

// 수정: 방명록 문서를 삭제합니다. 최종 권한 검사는 Firestore 보안 규칙이 담당합니다.
export const deleteGuestBook = (id) => deleteDoc(doc(db, 'guestbooks', id))
