
// Use explicit paths for relative imports if needed.

export type Locale = "en" | "ja";

export interface Axis {
    id: string; // Identifier for the axis (e.g., "axis_change")
    labelMin: string; // Display label for 0 (Japanese)
    labelMax: string; // Display label for 100 (Japanese)
    labelMinEn: string; // Display label for 0 (English)
    labelMaxEn: string; // Display label for 100 (English)
}

export interface Quadrant {
    label: string; // Japanese label
    labelEn: string; // English label
    description?: string;
    descriptionEn?: string;
}

export interface MatrixConfig {
    id: string; // e.g., "matrix_core"
    label: string; // Japanese title
    labelEn: string; // English title
    source?: string; // Japanese source
    sourceEn?: string; // English source
    xAxis: Axis;
    yAxis: Axis;
    quadrants: {
        topLeft: Quadrant;     // X < 50, Y > 50
        topRight: Quadrant;    // X >= 50, Y > 50
        bottomLeft: Quadrant;  // X < 50, Y <= 50
        bottomRight: Quadrant; // X >= 50, Y <= 50
    };
}

export interface Config {
    systemTemplate: {
        ja: string;
        en: string;
    };
    matrices: MatrixConfig[];
}

export type MatrixCoordinates = {
    [matrixId: string]: { x: number; y: number };
};
