import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import conciergeService, { MessageRole, ConciergeMessage } from '../services/conciergeService';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const Concierge: React.FC<{ isGuestMode?: boolean }> = ({ isGuestMode = false }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isGuestMode) {
      initializeSession();
    } else {
      // Guest mode - show welcome message
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: 'ATLAS Secure Channel Active. Create an account to chat with our concierge team.',
          timestamp: new Date(),
        }
      ]);
      setIsInitializing(false);
    }
  }, [isGuestMode]);

  const initializeSession = async () => {
    try {
      setIsInitializing(true);
      // Try to get latest session
      const latestSessionId = await conciergeService.getLatestSession();
      
      if (latestSessionId) {
        setSessionId(latestSessionId);
        // Load messages from existing session
        const sessionMessages = await conciergeService.getSessionMessages(latestSessionId);
        const formattedMessages: Message[] = sessionMessages.map(msg => ({
          id: msg.id,
          role: msg.role === MessageRole.User ? 'user' : 'model',
          text: msg.text,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedMessages);
      } else {
        // No existing session - show welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'model',
            text: 'ATLAS Secure Channel Active. Identity Verified.',
            timestamp: new Date(),
          }
        ]);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      setMessages([
        {
          id: 'error',
          role: 'model',
          text: 'Connection error. Please try again.',
          timestamp: new Date(),
        }
      ]);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Prevent sending in guest mode
    if (isGuestMode) {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        text: input,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      
      // Show guest mode message
      setTimeout(() => {
        const guestMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: 'ATLAS Concierge services require an authenticated account. Please sign in or create an account to chat with our concierge team.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, guestMsg]);
      }, 500);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message immediately to UI
    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      text: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // If no session, start a new one
      if (!sessionId) {
        const newSessionId = await conciergeService.startSession(userMessage);
        setSessionId(newSessionId);
        
        // Load all messages from the new session (includes AI response)
        const sessionMessages = await conciergeService.getSessionMessages(newSessionId);
        const formattedMessages: Message[] = sessionMessages.map(msg => ({
          id: msg.id,
          role: msg.role === MessageRole.User ? 'user' : 'model',
          text: msg.text,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedMessages);
      } else {
        // Send message to existing session
        await conciergeService.sendMessage(sessionId, MessageRole.User, userMessage);
        
        // Reload messages to get the AI response
        const sessionMessages = await conciergeService.getSessionMessages(sessionId);
        const formattedMessages: Message[] = sessionMessages.map(msg => ({
          id: msg.id,
          role: msg.role === MessageRole.User ? 'user' : 'model',
          text: msg.text,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      // Remove the temporary user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMsg.id));
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isInitializing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.statusIndicator}>
              <View style={styles.statusPulse} />
              <View style={styles.statusDot} />
            </View>
            <View>
              <Text style={styles.headerTitle}>ATLAS CONCIERGE</Text>
              <Text style={styles.headerSubtitle}>E2E ENCRYPTED • CHANNEL 01</Text>
            </View>
          </View>
          <Icon name="lock" size={12} color="#525252" />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#737373" />
          <Text style={styles.loadingContainerText}>Initializing secure channel...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.statusIndicator}>
            <View style={styles.statusPulse} />
            <View style={styles.statusDot} />
          </View>
          <View>
            <Text style={styles.headerTitle}>ATLAS CONCIERGE</Text>
            <Text style={styles.headerSubtitle}>E2E ENCRYPTED • CHANNEL 01</Text>
          </View>
        </View>
        <Icon name="lock" size={12} color="#525252" />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={scrollToBottom}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageWrapper,
              msg.role === 'user' ? styles.messageWrapperUser : styles.messageWrapperModel
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleModel
              ]}
            >
              {msg.role === 'model' && (
                <View style={styles.modelHeader}>
                  <Icon name="terminal" size={12} color="#525252" />
                  <Text style={styles.modelLabel}>SYSTEM OUTPUT</Text>
                </View>
              )}
              <Text style={[
                styles.messageText,
                msg.role === 'user' ? styles.messageTextUser : styles.messageTextModel
              ]}>
                {msg.text}
              </Text>
            </View>
            <Text style={styles.messageTime}>
              {msg.role === 'user' ? 'CMD' : 'RES'} • {formatTime(msg.timestamp)}
            </Text>
          </View>
        ))}

        {isLoading && (
          <View style={styles.loadingWrapper}>
            <Text style={styles.loadingText}>Decrypting...</Text>
            <View style={styles.loadingDots}>
              <View style={styles.loadingDot} />
              <View style={[styles.loadingDot, styles.loadingDotDelay1]} />
              <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Enter command..."
            placeholderTextColor="#404040"
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!isLoading}
            multiline={false}
          />
          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={isLoading}
          >
            <Icon name="send" size={12} color={isLoading ? '#262626' : '#737373'} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingContainerText: {
    color: '#525252',
    fontSize: 13,
    fontFamily: 'Courier New',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#171717',
    backgroundColor: 'rgba(10,10,10,0.95)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  statusPulse: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    opacity: 0.5,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 9,
    color: '#fff',
    letterSpacing: 2,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 8,
    color: '#525252',
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 24,
    gap: 32,
    paddingBottom: 24,
  },
  messageWrapper: {
    gap: 8,
  },
  messageWrapperUser: {
    alignItems: 'flex-end',
  },
  messageWrapperModel: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '90%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  messageBubbleUser: {
    backgroundColor: 'rgba(23,23,23,0.5)',
    borderColor: '#262626',
  },
  messageBubbleModel: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    paddingLeft: 0,
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modelLabel: {
    fontSize: 8,
    color: '#525252',
    letterSpacing: 2,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 12,
    lineHeight: 20,
    letterSpacing: 0.8,
  },
  messageTextUser: {
    color: '#fff',
  },
  messageTextModel: {
    color: '#a3a3a3',
  },
  messageTime: {
    fontSize: 8,
    color: '#404040',
    letterSpacing: 1.5,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  loadingWrapper: {
    alignItems: 'flex-start',
    gap: 8,
  },
  loadingText: {
    fontSize: 8,
    color: '#525252',
    letterSpacing: 2,
    fontWeight: '600',
    paddingLeft: 4,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 4,
    paddingLeft: 4,
  },
  loadingDot: {
    width: 4,
    height: 4,
    backgroundColor: '#525252',
  },
  loadingDotDelay1: {
    opacity: 0.6,
  },
  loadingDotDelay2: {
    opacity: 0.3,
  },
  inputContainer: {
    paddingHorizontal: 24,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#171717',
    paddingVertical: 16,
    paddingBottom: 90,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23,23,23,0.3)',
    borderWidth: 1,
    borderColor: '#262626',
    paddingLeft: 16,
    paddingRight: 4,
    gap: 16,
  },
  input: {
    flex: 1,
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Courier New',
    paddingVertical: 12,
  },
  sendButton: {
    padding: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#262626',
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
});

export default Concierge;
