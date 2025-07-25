import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ここにあなたのフォークしたリポジトリ名を正確に入力してください
// GitHubリポジトリの名前が 'fundaInfoQuiz' であれば、このままでOKです。
const repoName = 'fundaInfoQuiz';

export default defineConfig(({ command }) => { // command 引数を追加
  return {
    plugins: [react()],
    // 'build' コマンドの場合のみ base オプションを適用
    // ローカル開発 ('dev') の場合は '/' になるため、今まで通りローカルで動作します
    base: command === 'build' ? `/${repoName}/` : '/',
  };
});