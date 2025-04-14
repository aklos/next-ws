export interface Message {
    author: string;
    content: string;
}
export declare function useMessaging(url: () => string): readonly [Message[], (message: Message) => void];
//# sourceMappingURL=messaging.d.ts.map