import { defineConfig } from 'vite'

// 项目仓库部署（非 <user>.github.io 根仓库），base 必须与仓库名一致。
// 若未来迁回根域仓库，将 base 改为 '/' 即可。
export default defineConfig({
  base: '/PersonalHomepage/',
  build: {
    target: 'es2020',
    cssCodeSplit: false,
  },
})
