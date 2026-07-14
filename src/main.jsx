import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// 수정: 앱 스타일보다 먼저 공통 브라우저 리셋을 적용합니다.
import './styles/reset.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
       <App />
    </BrowserRouter>
  </StrictMode>,
)
