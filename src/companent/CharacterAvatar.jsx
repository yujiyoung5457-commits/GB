import React from 'react'
import CHARACTERS from './characterData'
import './CharacterAvatar.scss'

const CharacterAvatar = ({ character }) => {
  const selectedCharacter = CHARACTERS.find((item) => item.id === character)

  if (!selectedCharacter) return null

  return (
    <img
      className="character-avatar"
      src={selectedCharacter.src}
      alt={selectedCharacter.label}
    />
  )
}

export default CharacterAvatar
