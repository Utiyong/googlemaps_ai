import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';

export default function App() { 
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([
    { text: "Hello! I can help with directions and places. Try asking 'How do I get from ikeja to gombe?' or 'What restaurants are near ikoyi?'", isUser: false }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  // Replace with your backend URL (use your local IP if testing on physical device)
  // //note you might have to replace the link everysingle time you try to test
  const API_URL = "http://172.16.121.180:8000/chat";

  const handleButtonClick = async () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage = { text: inputMessage, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      // Send to backend
      const options = {
        method: "POST", // Set the method to POST
        headers: {
          "Content-Type": "application/json", // Specify JSON content type
          "Cache-Control": "max-age=60480",
        },
        body: JSON.stringify({ message: inputMessage }), // Add the request body
      };
  
      const response = await fetch(API_URL, options);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      // Add bot response
      const botMessage = { text: data.answer, isUser: false };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = { text: "Sorry, I couldn't process your request.", isUser: false };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setInputMessage("");
      setIsTyping(false);
    }
  };

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={[
              styles.messageBubble, 
              item.isUser ? styles.userBubble : styles.botBubble
            ]}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
          contentContainerStyle={styles.messagesList}
        />
        
        {isTyping && (
          <View style={[styles.messageBubble, styles.botBubble]}>
            <Text style={styles.messageText}>Typing...</Text>
          </View>
        )}
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask about directions or places..."
          value={inputMessage}
          onChangeText={setInputMessage}
          onSubmitEditing={handleButtonClick}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleButtonClick}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
      
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatContainer: {
    flex: 1,
    padding: 10,
  },
  messagesList: {
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 3,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 3,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});