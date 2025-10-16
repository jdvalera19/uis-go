import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  id: string;
  text: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  image?: string;
  audio?: string;
  isTyping?: boolean;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  currentSession: string | null;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  isTyping: false,
  error: null,
  currentSession: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    updateMessage: (state, action: PayloadAction<{ id: string; updates: Partial<Message> }>) => {
      const message = state.messages.find(msg => msg.id === action.payload.id);
      if (message) {
        Object.assign(message, action.payload.updates);
      }
    },
    deleteMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(msg => msg.id !== action.payload);
    },
    setCurrentSession: (state, action: PayloadAction<string | null>) => {
      state.currentSession = action.payload;
    },
  },
});

export const {
  addMessage,
  setMessages,
  setLoading,
  setTyping,
  setError,
  clearMessages,
  updateMessage,
  deleteMessage,
  setCurrentSession,
} = chatSlice.actions;

export default chatSlice.reducer;

