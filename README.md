# 魂の生き写し — LLM Soul Maker

> 自己深層心理のデジタル錬成システム

LLM にあなた自身の人格を宿すためのシステムプロンプト（`soul.md`）を、直感的な UI で生成する Web アプリケーションです。  
心理学理論に基づく 4 つの人格マトリックスを操作し、Gemini API による AI 錬成で高品質なペルソナ定義を出力します。

## 主な機能

- **人格マトリックス（4 軸）** — 2D 座標をドラッグして人格パラメータを設定
  - 行動の源泉（シュワルツの価値観理論）
  - 判断と情報処理（ユング心理学的機能）
  - 対話スタイル（ビッグファイブ性格特性）
  - 仕事の進め方（ワークスタイル類型）
- **会話スタイル設定** — トーン（ため口 / 普通 / 敬語）、会話量、絵文字使用の ON/OFF
- **AI 錬成** — Gemini API を使い、パラメータから高精度な `soul.md` を自動生成
- **日英対応** — 出力言語を日本語 / English で切り替え可能
- **リアルタイムプレビュー** — パラメータ変更に連動して Markdown をライブ更新

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | Next.js 14 (App Router, Edge Runtime) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| AI | Google Gemini API (`@google/genai`) |
| UI | Framer Motion, Lucide React |

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` を作成し、Gemini API キーを設定します。

```bash
GEMINI_API_KEY=your_api_key_here
```

> **Note:** API キーは [Google AI Studio](https://aistudio.google.com/apikey) から取得できます。

### 3. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) にアクセスして利用できます。

## プロジェクト構成

```
src/
├── app/
│   ├── page.tsx          # メインページ（UI 全体）
│   ├── actions.ts        # Server Action（Gemini API 呼び出し）
│   └── layout.tsx        # レイアウト
├── components/ui/        # 再利用可能な UI コンポーネント
├── config/
│   ├── persona-config.json  # マトリックス定義・テンプレート
│   └── types.ts             # 型定義
├── lib/
│   ├── engine.ts         # PersonaEngine（ドラフト生成エンジン）
│   └── utils.ts          # ユーティリティ
└── types/
    └── index.ts          # 共通型定義
```

## 使い方

1. **会話スタイルを選ぶ** — トーン・会話量・絵文字を設定
2. **マトリックスを調整** — 4 つの 2D マトリックス上でポイントをドラッグ
3. **ドラフトを確認** — 右パネルにリアルタイムで Markdown が表示される
4. **「魂の錬成」ボタンを押す** — Gemini が最終的な `soul.md` を生成
5. **出力をコピーして使用** — 生成された Markdown を LLM のシステムプロンプトとして利用

## ライセンス

MIT
