import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // 반드시 ./App.jsx 인지 확인!
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)