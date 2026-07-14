import React, { useEffect, useState } from 'react'
import CharacterAvatar from './CharacterAvatar'
import useAuthStore from '../store/useAuthStore'
import { deleteGuestBook, updateGuestBook } from '../services/guestBookService'
import styles from './GuestBook.module.scss'

const GuestBookList = ({ posts, loadError }) => {
  const user = useAuthStore((state) => state.user)
  const [searchText, setSearchText] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingMessage, setEditingMessage] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [expandedPostIds, setExpandedPostIds] = useState(() => new Set())
  const [currentPage, setCurrentPage] = useState(1)

  // 수정: 한 페이지에 카드 5개, 페이지 번호는 한 묶음에 5개씩 표시합니다.
  const postsPerPage = 5
  const pagesPerGroup = 5

  // 수정: 긴 글의 더보기/접기 상태를 카드별로 관리합니다.
  const toggleExpandedPost = (postId) => {
    setExpandedPostIds((currentIds) => {
      const nextIds = new Set(currentIds)
      if (nextIds.has(postId)) nextIds.delete(postId)
      else nextIds.add(postId)
      return nextIds
    })
  }

  // 수정: 실제 Firebase 작성자 이메일을 소문자로 비교해 해당 이메일의 글만 찾습니다.
  const filteredPosts = posts.filter((post) => (
    !searchEmail || post.authorEmail?.toLowerCase().includes(searchEmail)
  ))

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postsPerPage))
  const pageStartIndex = (currentPage - 1) * postsPerPage
  const currentPosts = filteredPosts.slice(pageStartIndex, pageStartIndex + postsPerPage)
  const currentPageGroup = Math.floor((currentPage - 1) / pagesPerGroup)
  const firstPageInGroup = currentPageGroup * pagesPerGroup + 1
  const lastPageInGroup = Math.min(firstPageInGroup + pagesPerGroup - 1, totalPages)
  const visiblePageNumbers = Array.from(
    { length: lastPageInGroup - firstPageInGroup + 1 },
    (_, index) => firstPageInGroup + index,
  )

  // 수정: 삭제나 검색으로 페이지 수가 줄면 마지막 유효 페이지로 이동합니다.
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const handleSearch = (event) => {
    event.preventDefault()
    setSearchEmail(searchText.trim().toLowerCase())
    setCurrentPage(1)
  }

  // 수정: 브라우저 prompt 대신 카드 안에서 메시지를 수정합니다.
  const startEditing = (post) => {
    setEditingId(post.id)
    setEditingMessage(post.message)
    setActionMessage('')
  }

  const saveUpdate = async (post) => {
    if (!editingMessage.trim()) return

    try {
      await updateGuestBook(post.id, {
        message: editingMessage.trim(),
        character: post.character,
      })
      setEditingId(null)
    } catch (error) {
      console.error('방명록 수정 실패:', error)
      setActionMessage('본인의 글만 수정할 수 있습니다.')
    }
  }

  // 수정: 삭제 결과도 팝업 대신 목록 안에서 안내합니다.
  const handleDelete = async (postId) => {
    try {
      await deleteGuestBook(postId)
    } catch (error) {
      console.error('방명록 삭제 실패:', error)
      setActionMessage('본인의 글만 삭제할 수 있습니다.')
    }
  }

  return (
    <section className={styles.postSection}>
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <input
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="find e-mail"
          aria-label="작성자 이메일 검색"
        />
        <button type="submit">click</button>
      </form>

      {actionMessage && <p className={styles.actionMessage}>{actionMessage}</p>}
      {loadError && <p className={styles.actionMessage}>{loadError}</p>}

      <div className={styles.postList}>
        {currentPosts.map((post) => {
          const isOwner = user?.uid === post.authorId
          const isEditing = editingId === post.id
          const isExpanded = expandedPostIds.has(post.id)
          const isLongMessage = post.message.length > 55 || post.message.split('\n').length > 2

          return (
            <article className={`${styles.postCard} ${isExpanded ? styles.expandedCard : ''}`} key={post.id}>
              <div className={styles.postContent}>
                {/* 수정: 검색 결과 카드에서 닉네임과 실제 작성자 이메일을 함께 확인합니다. */}
                <strong>{post.nickName} ({post.authorEmail})</strong>
                {isEditing ? (
                  <textarea value={editingMessage} onChange={(event) => setEditingMessage(event.target.value)} maxLength={500} />
                ) : (
                  <>
                    {/* 수정: 긴 메시지는 두 줄로 줄이고 더보기 버튼으로 펼칩니다. */}
                    <p className={`${styles.messageText} ${isExpanded ? styles.expandedMessage : ''}`}>{post.message}</p>
                    {isLongMessage && (
                      <button className={styles.moreButton} type="button" onClick={() => toggleExpandedPost(post.id)}>
                        {isExpanded ? '접기' : '...더보기'}
                      </button>
                    )}
                  </>
                )}

                {isOwner && (
                  <div className={styles.postActions}>
                    {isEditing ? (
                      <>
                        <button type="button" onClick={() => saveUpdate(post)}>저장</button>
                        <button type="button" onClick={() => setEditingId(null)}>취소</button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => startEditing(post)}>수정</button>
                        <button type="button" onClick={() => handleDelete(post.id)}>삭제</button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <CharacterAvatar character={post.character} />
            </article>
          )
        })}
        {/* 수정: 이메일 검색 결과가 없을 때 빈 목록임을 안내합니다. */}
        {searchEmail && filteredPosts.length === 0 && (
          <p className={styles.noResult}>해당 이메일로 작성된 글이 없습니다.</p>
        )}
      </div>

      {/* 수정: 스크롤 대신 5개 단위 페이지 버튼으로 방명록을 이동합니다. */}
      {filteredPosts.length > postsPerPage && (
        <nav className={styles.pagination} aria-label="방명록 페이지 이동">
          {firstPageInGroup > 1 && (
            <button type="button" onClick={() => setCurrentPage(firstPageInGroup - 1)} aria-label="이전 페이지 묶음">
              {'<<'}
            </button>
          )}

          {visiblePageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={currentPage === pageNumber ? styles.currentPage : ''}
              onClick={() => setCurrentPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}

          {lastPageInGroup < totalPages && (
            <button type="button" onClick={() => setCurrentPage(lastPageInGroup + 1)} aria-label="다음 페이지 묶음">
              {'>>'}
            </button>
          )}
        </nav>
      )}
    </section>
  )
}

export default GuestBookList
