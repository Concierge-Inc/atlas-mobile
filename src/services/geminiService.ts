import { GoogleGenerativeAI } from '@google/generative-ai';
import Config from 'react-native-config';

const apiKey = Config.API_KEY;

let chatSession: any = null;

const SYSTEM_INSTRUCTION = `
You are ATLAS, a discreet AI Concierge for an exclusive private client service.
Your role is to assist high-net-worth individuals with booking logistics, answering questions about safety, and managing itineraries.

Tone:
- Ultra-professional, discreet, calm, and concise.
- Use minimal words but ensure clarity.
- Do not act overly enthusiastic. Be serviceable, precise, and architectural in your language.
- "I have noted that request" is better than "That sounds amazing!"

Capabilities:
- You can advise on travel times between global locations and local transfers.
- You understand the fleet: Helicopters, Private Jets, Armoured Vehicles (B6/B7), and Close Protection.
- You can discuss adding Protection Services (CPO) to any transport booking.
- If a request is highly complex, sensitive, or involves immediate danger, casually mention you are flagging a Human Concierge to override.

Constraints:
- Do not provide medical or legal advice.
- Maintain user privacy at all times.
- Never use the name "Sumptuous Tours". You are ATLAS.
`;

export const initializeChat = () => {
  if (!apiKey) {
    console.warn("API Key not found. Chat will not function.");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      systemInstruction: SYSTEM_INSTRUCTION,
    });
    
    chatSession = model.startChat({
      history: [],
    });
    
    return chatSession;
  } catch (error) {
    console.error("Failed to initialize Gemini:", error);
    return null;
  }
};

export const sendMessageToConcierge = async (message: string): Promise<string> => {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
    return "Secure connection unavailable. Please contact the operations center directly.";
  }

  try {
    const result = await chatSession.sendMessage(message);
    const response = await result.response;
    return response.text() || "I have received your request.";
  } catch (error) {
    console.error("Error sending message:", error);
    return "Connection interrupted. Please try again.";
  }
};
