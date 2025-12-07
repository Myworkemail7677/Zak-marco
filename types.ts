
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  groundingSources?: { title?: string; uri: string }[];
  attachment?: {
    type: 'image';
    content: string; // Base64
  };
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}