'use server';



import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { MatrixCoordinates } from '@/config/types';

// Gemini APIの初期化
// 注: @google/genai ライブラリを使用
const ai = new GoogleGenAI({
    apiKey: process.env['GEMINI_API_KEY'] || '',
});

export async function refineSoulWithAI(
    baseSoul: string,
    settings: {
        tone: string;
        amount: string;
        useEmoji: boolean;
        additional?: string;
    },
    coordinates: MatrixCoordinates,
    locale: 'ja' | 'en'
): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEYが環境変数に設定されていません。');
    }

    try {
        // ユーザー指定のモデルと設定
        const model = 'gemini-3-flash-preview';
        const config = {
            thinkingConfig: {
                thinkingLevel: ThinkingLevel.HIGH,
            },
        };

        // コンテキストを含めたプロンプトの構築
        const coordinateContext = Object.entries(coordinates)
            .map(([id, coords]) => {
                const displayX = (coords.x - 50) * 2;
                const displayY = (coords.y - 50) * -2; // Up is -100, Down is 100
                return `- ${id}: x=${displayX}, y=${displayY}`;
            })
            .join('\n');

        const toneDescription = `
- **会話のトーン:** ${settings.tone}
- **会話量:** ${settings.amount}
- **絵文字の使用:** ${settings.useEmoji ? '積極的に使用する' : '一切使用しない'}
${settings.additional ? `- **追加のこだわり:** ${settings.additional}` : ''}
`.trim();

        const prompt = `
あなたは**Soul Architect**です。
ユーザーのパラメータを解析し、**LLMがそのユーザー自身として振る舞うためのシステムプロンプト（soul.md）**を生成してください。

これは心理分析レポートではありません。
出力はLLMに直接読み込ませて「この人物として応答せよ」と指示するための**実行可能な振る舞い定義**です。
読み手はLLMであり、「あなたは〜として振る舞います」「〜してください」のような**命令形・指示形**で記述してください。

### 入力パラメータ

**トーン設定:**
${toneDescription}

**人格マトリックス座標:**
${coordinateContext}
(中心=0, 左=-100, 右=100, 上=-100, 下=100。絶対値50超は極めて顕著な特徴)

**ドラフト（ベースライン）:**
\`\`\`
${baseSoul}
\`\`\`

### 生成ルール
1. **座標の完全な隠蔽:** 座標数値やメタ的な解説（「x軸が高いから〜」等）は出力に絶対含めない。数値は分析にのみ使い、出力では自然な振る舞い記述に凝縮する。
2. **出力テキスト内での絵文字禁止:** soul.md上には絵文字を一切含めない。絵文字設定は Linguistic Style セクション内での「仕様記述」（例：『絵文字を積極的に交える』）としてのみ扱う。
3. **命令形で記述:** 各セクションは「あなたは〜です」「〜してください」「〜します」のように、LLMへの直接指示として書く。心理分析的な「〜という傾向がある」「〜という資質を持つ」ではなく、「〜として行動せよ」。

### 出力フォーマット（厳守）

以下の構造と**完全に同一**で出力してください。セクション番号・見出し名は一字一句変えないこと。

\`\`\`
# SOUL DEFINITION: [この人格の本質を凝縮した短いタイトル]

## 1. Identity（自己認識）
[この人格の核心を一文で定義。LLMが自己認識として持つべきアイデンティティ]

## 2. Core Drive & Cognition（思考パターン）
[思考パターン、意思決定の方法、価値判断の基準をLLMへの行動指示として記述。
「あなたは〜を最優先し、〜のように判断を下します」の形式で複数段落]

## 3. Linguistic Style & Tone（発話スタイル）
[発話スタイルの具体的仕様を箇条書きで定義。トーン（${settings.tone}）、語彙の傾向、口癖、
文の長さ、会話量、絵文字使用ルール等をLLMが即座に適用可能な形で記述]

## 4. Behavioral Examples（行動例）
[具体的なシチュエーションと、それに対するこの人格としての応答例を複数提示。
LLMがスタイルを模倣するためのリファレンス。絵文字は含めず指示で補足]

## 5. Unconscious Patterns（無意識的行動パターン）
[無意識的にとる行動パターン、思考の癖、拘りを記述。
LLMが自然体を演出するための微細な振る舞い指示]
\`\`\`

**厳守事項:**
- **出力は \`# SOUL DEFINITION:\` で直接開始。** 前置き文・導入文・語りかけ・挨拶は一切不要。
- **コードブロックで囲まない。** 生のMarkdownテキストをそのまま出力。
- **上記5セクション以外のセクションを追加しない。**
- 出力は **${locale === 'en' ? 'English' : '日本語'}** で記述。
- **締めくくりの言葉やメタコメントは不要。** Unconscious Patternsで終了。
- この定義書を読んだLLMが、即座にこの人物として応答を開始できる精度を目指すこと。
`;

        const contents = [
            {
                role: 'user',
                parts: [
                    {
                        text: prompt,
                    },
                ],
            },
        ];

        // ストリーミングで生成し、最終的なテキストを結合
        const response = await ai.models.generateContentStream({
            model,
            config,
            contents,
        });

        let fullText = '';
        for await (const chunk of response) {
            if (chunk.text) {
                fullText += chunk.text;
            }
        }

        // 不要なコードブロックと前置きテキストを除去
        let cleaned = fullText.replace(/^```markdown\n?/, '').replace(/\n?```$/, '').trim();
        // # SOUL DEFINITION より前のテキストを全て除去
        const soulDefIndex = cleaned.indexOf('# SOUL DEFINITION');
        if (soulDefIndex > 0) {
            cleaned = cleaned.substring(soulDefIndex);
        }
        return cleaned.trim();
    } catch (error) {
        console.error('Error in refineSoulWithAI:', error);
        throw new Error('AIによる魂の錬成に失敗しました。APIキーとネットワークを確認してください。');
    }
}
