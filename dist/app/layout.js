"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
const font_1 = require("geist/font"); // Correct import
require("./globals.css");
exports.metadata = {
    title: "Werewolf Game",
    description: "A multiplayer Werewolf game",
};
function RootLayout({ children, }) {
    return (<html lang="en" className={`${font_1.GeistSans.variable} ${font_1.GeistMono.variable}`}>
      <body className="min-h-screen bg-[#0a0a1a] text-white">{children}</body>
    </html>);
}
