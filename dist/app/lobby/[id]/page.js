"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Lobby_1 = __importDefault(require("./Lobby"));
const page = () => {
    return <Lobby_1.default />;
};
exports.default = page;
