
import { Config, MatrixConfig, MatrixCoordinates, Locale } from '@/config/types';
import configData from '@/config/persona-config.json';

// Simple types for Engine internal use if needed, otherwise rely on shared types
export class PersonaEngine {
    private config: Config;

    constructor() {
        this.config = configData as unknown as Config;
    }

    generate(tone: string, coordinates: MatrixCoordinates, locale: Locale = 'ja'): string {
        const { systemTemplate, matrices } = this.config;

        // 1. Archetype Determination for each Matrix
        const archetypeDescriptions: string[] = [];
        const policyDescriptions: string[] = [];

        matrices.forEach((matrix: MatrixConfig) => {
            const coords = coordinates[matrix.id] || { x: 50, y: 50 };
            const { x, y } = coords;
            const { quadrants, xAxis, yAxis } = matrix;

            let quadrantLabel = "";
            let description = "";

            // Logic:
            // Left: x < 50, Right: x >= 50
            // Top: y > 50, Bottom: y <= 50

            if (x < 50) {
                if (y > 50) {
                    // Top Left
                    quadrantLabel = locale === 'en' ? quadrants.topLeft.labelEn : quadrants.topLeft.label;
                    description = locale === 'en' ? quadrants.topLeft.descriptionEn : quadrants.topLeft.description;
                } else {
                    // Bottom Left
                    quadrantLabel = locale === 'en' ? quadrants.bottomLeft.labelEn : quadrants.bottomLeft.label;
                    description = locale === 'en' ? quadrants.bottomLeft.descriptionEn : quadrants.bottomLeft.description;
                }
            } else {
                if (y > 50) {
                    // Top Right
                    quadrantLabel = locale === 'en' ? quadrants.topRight.labelEn : quadrants.topRight.label;
                    description = locale === 'en' ? quadrants.topRight.descriptionEn : quadrants.topRight.description;
                } else {
                    // Bottom Right
                    quadrantLabel = locale === 'en' ? quadrants.bottomRight.labelEn : quadrants.bottomRight.label;
                    description = locale === 'en' ? quadrants.bottomRight.descriptionEn : quadrants.bottomRight.description;
                }
            }

            archetypeDescriptions.push(`- **${locale === 'en' ? matrix.labelEn : matrix.label}:** ${quadrantLabel}`);
            if (description) {
                policyDescriptions.push(`- **${locale === 'en' ? matrix.labelEn : matrix.label} Policy:** ${description}`);
            }
        });

        // 2. Template Substitution
        const template = locale === 'en' ? systemTemplate.en : systemTemplate.ja;

        let output = template
            .replace('{{archetypes}}', '\n' + archetypeDescriptions.join('\n'))
            .replace('{{tone}}', tone ? tone : (locale === 'en' ? "Default Helper" : "標準アシスタント"))
            .replace('{{policies}}', '\n' + policyDescriptions.join('\n'));

        return output;
    }

    getConfig(): Config {
        return this.config;
    }
}
