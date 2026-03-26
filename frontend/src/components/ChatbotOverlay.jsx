import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Mic, Square, Globe, Volume2, VolumeX } from 'lucide-react';
import axios from 'axios';

const ChatbotOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! I'm AgriBot. Ask me about crop prices, advisory, or recommendations." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState('en-IN');
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  const languages = [
    { code: 'en-IN', label: 'English', ttsLang: 'en-IN' },
    { code: 'hi-IN', label: 'Hindi (हिंदी)', ttsLang: 'hi-IN' },
    { code: 'mr-IN', label: 'Marathi (मराठी)', ttsLang: 'mr-IN' }
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 🔊 Speak text using Web Speech Synthesis API
  const speakText = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Try to find a voice matching the selected language
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang === language) || 
                          voices.find(v => v.lang.startsWith(language.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // 💬 Handle Text Chat
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:5001/chat', { message: userMessage });
      const reply = res.data.reply || "Sorry, I couldn't understand that.";
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
      // Speak the reply
      speakText(reply);
    } catch (err) {
      const errorMsg = "Error connecting to server. Is the backend running?";
      setMessages(prev => [...prev, { role: 'bot', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 🎤 Start Listening using Web Speech Recognition API
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please use Chrome or Edge.");
      return;
    }

    // Cancel any ongoing speech so it doesn't interfere
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);

      // Show what the user said
      setMessages(prev => [...prev, { role: 'user', text: `🎤 ${transcript}` }]);
      setIsLoading(true);

      // Send transcript to chat API
      try {
        const res = await axios.post('http://localhost:5001/chat', { message: transcript });
        const reply = res.data.reply || "Sorry, I couldn't understand that.";
        setMessages(prev => [...prev, { role: 'bot', text: reply }]);
        // Speak the reply
        speakText(reply);
      } catch (err) {
        const errorMsg = "Error connecting to server. Is the backend running?";
        setMessages(prev => [...prev, { role: 'bot', text: errorMsg }]);
      } finally {
        setIsLoading(false);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert("Microphone access denied. Please allow microphone permissions.");
      } else if (event.error === 'no-speech') {
        setMessages(prev => [...prev, { role: 'bot', text: "No speech detected. Please try again." }]);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // ⏹️ Stop Listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-agri-main text-white rounded-full shadow-lg hover:bg-agri-dark transition-all transform hover:scale-110 z-50 ${isOpen ? 'hidden' : 'block'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-100 transform transition-all h-[520px]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-agri-main to-agri-dark text-white p-4 flex justify-between items-center shadow-md relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm">
                🤖
              </div>
              <div className="flex flex-col">
                 <span className="font-bold tracking-wide leading-tight">AgriBot AI</span>
                 <span className="text-[10px] text-green-100 opacity-90 tracking-wider uppercase font-semibold">Voice & Chat Assistant</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Voice Toggle */}
              <button 
                onClick={() => { setVoiceEnabled(!voiceEnabled); if (isSpeaking) stopSpeaking(); }}
                className="text-white hover:text-green-200 transition-colors p-1.5 bg-white/10 rounded-full"
                title={voiceEnabled ? 'Mute voice replies' : 'Enable voice replies'}
              >
                {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button onClick={() => { setIsOpen(false); stopSpeaking(); }} className="text-white hover:text-green-200 transition-colors p-1.5 bg-white/10 rounded-full">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Language Selector Bar */}
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex items-center justify-between shadow-inner">
             <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <Globe size={14} className="text-agri-main" /> Speak In
             </div>
             <select 
               value={language} 
               onChange={(e) => setLanguage(e.target.value)}
               className="bg-white border text-sm font-medium border-gray-200 text-gray-700 rounded-lg focus:ring-agri-main focus:border-agri-main block p-1.5 shadow-sm outline-none"
             >
               {languages.map(lang => (
                 <option key={lang.code} value={lang.code}>{lang.label}</option>
               ))}
             </select>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-agri-main text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-bl-sm px-4 py-3 text-sm shadow-sm flex items-center gap-2 border border-gray-100">
                  <div className="w-2 h-2 bg-agri-main rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-agri-main rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  <div className="w-2 h-2 bg-agri-main rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Speaking Indicator */}
          {isSpeaking && (
             <div className="bg-blue-50 py-2 flex items-center justify-center gap-2 text-blue-600 font-bold text-xs border-t border-blue-100">
                <Volume2 size={14} className="animate-pulse" /> Speaking...
                <button onClick={stopSpeaking} className="ml-2 text-blue-400 hover:text-blue-600 underline text-[10px]">Stop</button>
             </div>
          )}

          {/* Listening Indicator */}
          {isListening && (
             <div className="bg-red-50 py-2 flex items-center justify-center gap-2 text-red-600 font-bold text-xs animate-pulse border-t border-red-100">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div> Listening...
             </div>
          )}

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex items-end gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={isListening}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-agri-main/50 text-sm disabled:opacity-50 transition-all font-medium text-gray-700"
            />
            {/* Mic Button */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading && !isListening}
              className={`p-3 rounded-2xl transition-all shadow-sm ${
                isListening 
                ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse ring-4 ring-red-100' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-agri-main'
              } disabled:opacity-50`}
            >
              {isListening ? <Square size={20} className="fill-current" /> : <Mic size={20} />}
            </button>

            {/* Send Text Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading || isListening}
              className="p-3 bg-agri-main text-white rounded-2xl hover:bg-agri-dark transition-all disabled:opacity-50 disabled:hover:scale-100 hover:scale-105 shadow-md shadow-agri-main/30"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotOverlay;
