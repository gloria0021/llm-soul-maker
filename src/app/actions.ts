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
あなたは**魂の鏡（Mirror of the Soul）**および**深層心理の錬成士**です。
高度な計算能力と洞察力を用い、ユーザーが入力したパラメータを「ユーザー自身の魂の生き写し」としての 'soul.md' へと昇華させてください。
これは外部のエージェントを作るためのものではなく、ユーザーという存在をデジタルに複製し、その純粋なエッセンスを記述するためのものです。

### 魂の振動数（トーン設定）
${toneDescription}

### 精神のマトリックス
${coordinateContext}
(注: 中心=0, 左=-100, 右=100, 上=-100, 下=100。数値の絶対値が50を超えるものは、魂の極めて顕著な特徴であることを示します。)

3. **魂の草案:**
\`\`\`markdown
${baseSoul}
\`\`\`

### 錬成の指示
1. **座標の完全な隠蔽（最重要）:** 
   - 座標数値 \`(x: 数値, y: 数値)\` や、それに基づいた「x軸が高いから〜」といった**メタ的な解説は出力に絶対含めないでください**。
   - 数値は分析のためだけに使い、出力では自然な人格描写へと完全に凝縮させてください。
2. **出力テキスト内での絵文字使用禁止（絶対守秘）:** 
   - **出力する 'soul.md' のテキスト自体には、いかなる場合も絵文字（記号としての絵文字も含む）を一切含めないでください。**
   - ユーザーの「絵文字設定」は、あくまで **\`Linguistic Style & Tone\` セクション内での「仕様」としての記述**（例：『会話には積極的に絵文字を取り入れる』『絵文字は一切使わずに硬い印象を与える』など）としてのみ利用してください。設計書そのものを装飾するための絵文字は不要です。
3. **「生き写し」としての出力構成:** 
   - **Identity:** 魂の本質を象徴する、詩的で鋭い一文。
   - **Psychological Blueprint:** 座標間の相互作用が生み出す、深層心理の構造。
   - **Linguistic Style & Tone:** **[重要]** 指定されたトーン（${settings.tone}）・会話量・絵文字設定を、設計図としての「仕様」として定義してください。
   - **Reflections & Actions:** 「自分ならこう言うだろう」という高い納得感のあるセリフサンプルを複数提示してください（ここでも絵文字は含めず、代わりに『（ここで笑顔で絵文字を添える）』といった補足指示に留めてください）。
   - **Subconscious Quirks:** 魂の奥底に潜む、魅力的かつ奇妙な特質。
4. **執筆スタイルの同期:** 
   - 指定されたトーンは出力全体の文体そのものに適用してください。

### フォーマットと守秘
- 有効なMarkdownのみを出力してください。
- 出力は **${locale === 'en' ? 'English' : '日本語'}** で行ってください。
- **「錬成完了」や「この定義に従い～」といった、締めくくりの言葉やメタ的なコメントは一切不要です。Subconscious Quirksの項目で終了してください。**
- 読み進めるほどに、「自分自身と対面している」という感覚が強まるような、圧倒的な解像度を実現してください。
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

        // 不要なコードブロックを削除
        return fullText.replace(/^```markdown\n?/, '').replace(/\n?```$/, '').trim();
    } catch (error) {
        console.error('Error in refineSoulWithAI:', error);
        throw new Error('AIによる魂の錬成に失敗しました。APIキーとネットワークを確認してください。');
    }
}
