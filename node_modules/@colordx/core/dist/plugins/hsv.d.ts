import { f as HsvColor, q as Plugin } from '../colordx-CQAwj4SM.js';

declare module '@colordx/core' {
    interface Colordx {
        toHsv(precision?: number): HsvColor;
        toHsvString(precision?: number): string;
    }
}
declare const hsv: Plugin;

export { hsv as default };
