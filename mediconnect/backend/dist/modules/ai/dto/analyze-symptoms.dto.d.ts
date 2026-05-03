export declare enum ChatRole {
    USER = "user",
    ASSISTANT = "assistant"
}
export declare class ChatMessageDto {
    role: ChatRole;
    content: string;
}
export declare class AnalyzeSymptomsDto {
    messages: ChatMessageDto[];
}
