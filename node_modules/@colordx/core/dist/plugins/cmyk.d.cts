import { a as CmykColor, q as Plugin } from '../colordx-CQAwj4SM.cjs';

declare module '@colordx/core' {
    interface Colordx {
        toCmyk(precision?: number): CmykColor;
        toCmykString(precision?: number): string;
    }
}
declare const cmyk: Plugin;

export { cmyk as default };
