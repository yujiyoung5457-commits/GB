import { create } from 'zustand'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase'

// 수정: Firebase 로그인 사용자를 전역에서 사용할 수 있도록 Zustand로 관리합니다.
const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  unsubscribe: null,

  // 수정: 프로필 변경 직후에도 최신 사용자 정보를 즉시 전역 상태에 반영합니다.
  setUser: (user) => set({ user }),

  initializeAuth: () => {
    if (get().unsubscribe) return get().unsubscribe

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, loading: false })
    })

    set({ unsubscribe })
    return unsubscribe
  },

  // 수정: Firebase 로그아웃 결과가 인증 감지기를 통해 전역 상태에 반영됩니다.
  logout: async () => {
    await signOut(auth)
  },
}))

export default useAuthStore
