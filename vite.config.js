import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 1. API 요청용 (데이터 주고받기)
      '/api': {
        target: 'http://13.125.245.75:8080',
        changeOrigin: true,
        // ⚠️ 주의: 백엔드 코드에 /api가 있으면 아래 rewrite 줄을 지우세요!
        // 백엔드에 /api가 없으면 이 줄이 꼭 있어야 합니다.
        // rewrite: (path) => path.replace(/^\/api/, ''), 
        secure: false,
      },
      // 2. 이미지 파일 요청용 (이게 없으면 엑박 뜸)
      // 백엔드에서 이미지를 /uploads 폴더에서 준다고 가정
      '/uploads': {
        target: 'http://13.125.245.75:8080',
        changeOrigin: true,
        secure: false,
      },
      // 혹은 /images 경로라면 아래 주석 해제
      /*
      '/images': {
        target: 'http://13.125.245.75:8080',
        changeOrigin: true,
        secure: false,
      }
      */
    },
  },
})