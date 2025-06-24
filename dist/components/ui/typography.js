"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypographyH1 = TypographyH1;
exports.TypographyH2 = TypographyH2;
exports.TypographySmall = TypographySmall;
const utils_1 = require("@/lib/utils");
function TypographyH1({ children, className, }) {
    return (<h1 className={(0, utils_1.cn)("scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance", className)}>
      {children}
    </h1>);
}
function TypographyH2({ children, className, }) {
    return (<h2 className={(0, utils_1.cn)("scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance", className)}>
      {children}
    </h2>);
}
function TypographySmall({ children, className, }) {
    return (<h6 className={(0, utils_1.cn)("scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance", className)}>
      {children}
    </h6>);
}
