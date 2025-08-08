import React, { useEffect, useRef, useState, useCallback } from "react";
import PdfPreview from "../components/PdfPreview";
import { useNavigate } from "react-router-dom";

// --- Helper Functions ---
// Di dalam file ChatPage.jsx

const isMathQuestion = (question) => {
  const q = question.trim().toLowerCase();

  // Jika pertanyaan sangat panjang atau mengandung baris baru, 
  // anggap itu soal cerita, bukan kalkulasi sederhana.
  if (q.length > 100 || q.includes('\n')) {
      return false;
  }

  // Hanya untuk ekspresi matematika murni (contoh: "5 * (10+2)")
  const pureMathPattern = /^[\d\s\+\-\*\/\^\(\)\.e]+$/;
  if (pureMathPattern.test(q)) return true;

  // Hanya untuk pertanyaan kalkulasi singkat (contoh: "hitung 15*2")
  const mathStartKeywords = ['hitung', 'berapakah', 'berapa hasil dari', 'tentukan nilai dari'];
  if (mathStartKeywords.some(keyword => q.startsWith(keyword)) && q.length < 50) {
      return true;
  }

  return false;
};

const isGreeting = (question) => {
  const q = question.trim().toLowerCase();
  const greetings = ['hi', 'hai', 'halo', 'hello', 'selamat pagi', 'selamat siang', 'selamat malam'];
  return greetings.includes(q);
};

const isQuizRequest = (question) => {
    const q = question.toLowerCase();
    const keywords = ['buatkan soal', 'generate soal', 'bikin kuis', 'buatkan pertanyaan'];
    return keywords.some(keyword => q.includes(keyword));
};

const isFollowUpQuizRequest = (question) => {
    const q = question.toLowerCase();
    const keywords = ['soal tambahan', 'beri lagi', 'soal lain', 'tambah lagi soalnya', 'generate lagi', 'buatkan lagi'];
    return keywords.some(keyword => q.includes(keyword));
};

const useTypewriter = (text, speed = 10) => {
  const [displayText, setDisplayText] = useState('');
  useEffect(() => {
    setDisplayText('');
    if (text) {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(prev => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, speed);
      return () => clearInterval(typingInterval);
    }
  }, [text, speed]);
  return displayText;
};

// --- Komponen UI ---
const Message = React.memo(({ message, onSourceClick }) => {
  const isUser = message.sender === 'user';
  const typedText = isUser || message.isHistory ? message.text : useTypewriter(message.text);
  
  return (
    <div className={`p-3 rounded-lg max-w-2xl whitespace-pre-wrap shadow-md ${isUser ? "bg-green-800 text-white self-end ml-auto" : "bg-white text-gray-800 self-start mr-auto"}`}>
      <div dangerouslySetInnerHTML={{ __html: typedText.replace(/\n/g, '<br />') }} />
      {!isUser && message.sources && message.sources.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h4 className="text-sm font-bold mb-2 text-gray-700">Sumber:</h4>
          <div className="space-y-2">
            {message.sources.map((source, index) => (
              <div key={index} className="text-xs p-2 rounded-md transition-all">
                <div className="flex justify-between items-center font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="truncate" title={source.path}>📄 {source.path.split('/').pop()}</span>
                  </div>
                  {/* <span className="font-mono bg-black text-white px-2 py-0.5 rounded-full flex-shrink-0" title="Skor relevansi">{Math.round(source.score * 100)}%</span> */}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-gray-600 self-center">Halaman:</span>
                  {source.relevant_pages && source.relevant_pages.map(page => (
                    <button 
                      key={page} 
                      onClick={() => onSourceClick(source, page)} 
                      className="text-blue-600 hover:underline bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded transition-colors"
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

const WelcomeMessage = () => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
    <div className="max-w-md">
      <h2 className="text-3xl font-bold text-green-800">Selamat Datang di Studiva.AI</h2>
      <p className="mt-2 text-gray-600">Halo! Saya Studiva, asisten AI Anda yang siap membantu menjawab pertanyaan seputar materi pelajaran.</p>
      <div className="mt-8 text-left w-full">
        <h3 className="text-md font-semibold text-gray-700 mb-3">Anda bisa mencoba bertanya:</h3>
        <ul className="space-y-2">
          <li className="bg-white p-3 rounded-lg shadow-sm text-sm text-gray-700">"Jelaskan rukun dan syarat pernikahan."</li>
          <li className="bg-white p-3 rounded-lg shadow-sm text-sm text-gray-700">"Buatkan saya soal tentang bola voli"</li>
          <li className="bg-white p-3 rounded-lg shadow-sm text-sm text-gray-700">"Berapa hasil dari 150 * 4?"</li>
        </ul>
      </div>
    </div>
  </div>
);

// --- Komponen Utama ChatPage ---
const ChatPage = ({ username, onLogout }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [lastQuizTopic, setLastQuizTopic] = useState(null);
  
  const [pdfData, setPdfData] = useState(null);
  const [previewInfo, setPreviewInfo] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  
  const bottomRef = useRef(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const fetchSessions = useCallback(async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
        onLogout();
        navigate("/login");
        return;
    }
    try {
      const response = await fetch(`https://studiva.site/api/sessions/${userId}`);
      if (!response.ok) throw new Error("Gagal mengambil sesi.");
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  }, [navigate, onLogout]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentSessionId) {
        setMessages([]);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`https://studiva.site/api/chat/${currentSessionId}`);
        if (!response.ok) throw new Error("Gagal memuat pesan.");
        const data = await response.json();
        const formattedMessages = data.messages.map(msg => ({ ...msg, isHistory: true }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [currentSessionId]);

  const handleSourceClick = useCallback(async (source, page) => {
    if (!source || !source.path) return;
    
    setPdfLoading(true);
    setPreviewInfo({ 
        path: source.path, 
        relevantPages: source.relevant_pages, 
        initialPage: page,
        snippets: source.snippets
    });

    try {
      const response = await fetch(`https://studiva.site/api/pdf/${source.path}`);
      if (!response.ok) throw new Error('Gagal mengambil file PDF.');
      const blob = await response.blob();
      setPdfData(blob);
    } catch (error) {
      console.error("Error fetching PDF:", error);
      setPreviewInfo(null);
    } finally {
      setPdfLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    
    const currentInput = input;
    const userId = localStorage.getItem("user_id");
    if (!userId) {
        onLogout();
        navigate("/login");
        return;
    }

    const userMessage = { id: Date.now(), sender: "user", text: currentInput };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
        if (isGreeting(currentInput)) {
            const botMessage = { id: Date.now() + 1, sender: "bot", text: "Hai, saya Studiva.AI. Ada yang bisa saya bantu?", sources: [] };
            setMessages(prev => [...prev, botMessage]);
            return;
        }

        if (isMathQuestion(currentInput)) {
            const response = await fetch("https://studiva.site/api/calculate", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ problem: currentInput }),
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ detail: "Gagal menghitung." }));
                throw new Error(errData.detail);
            }
            const data = await response.json();
            const resultText = `Hasil dari "${data.problem}" adalah: **${data.result}**.\n(Ekspresi: \`${data.expression}\`)`;
            const botMessage = { id: Date.now() + 1, sender: "bot", text: resultText, sources: [] };
            setMessages(prev => [...prev, botMessage]);
            return;
        }

        let quizTopic = null;
        let quizRequestDetail = currentInput;
        if (isQuizRequest(currentInput)) {
            quizTopic = currentInput.split('tentang ')[1] || currentInput;
        } else if (isFollowUpQuizRequest(currentInput) && lastQuizTopic) {
            quizTopic = lastQuizTopic;
            quizRequestDetail = `Beri saya beberapa soal tambahan tentang ${lastQuizTopic} yang berbeda dari sebelumnya.`;
        }
          if (quizTopic) {
            setLastQuizTopic(quizTopic);
            const response = await fetch("https://studiva.site/api/generate-quiz", {
                method: "POST", headers: { "Content-Type": "application/json" },
                // PERBAIKAN: Tambahkan user_id ke dalam body
                body: JSON.stringify({ 
                    topic: quizTopic, 
                    request_detail: quizRequestDetail, 
                    user_id: userId 
                }),
            });
            if (!response.ok) throw new Error("Gagal membuat kuis.");
            const data = await response.json();
            const botMessage = { id: Date.now() + 1, sender: "bot", text: data.quiz, sources: [] };
            setMessages(prev => [...prev, botMessage]);
            return;
        }

        const endpoint = currentSessionId ? `https://studiva.site/api/chat/${currentSessionId}` : 'https://studiva.site/api/chat/new';
        const body = { user_id: userId, question: currentInput };
        const response = await fetch(endpoint, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error("Terjadi kesalahan pada server chat.");
        
        const data = await response.json();
        const botMessage = { id: Date.now() + 1, sender: "bot", text: data.answer, sources: data.sources || [] };
        
        if (!currentSessionId && data.session_id) {
            const newSession = { id: data.session_id, name: data.session_name };
            setSessions(prev => [newSession, ...prev]);
            setCurrentSessionId(data.session_id);
        }
        setMessages(prev => [...prev, botMessage]);

    } catch (error) {
        const errorMessage = { id: Date.now() + 1, sender: "bot", text: `Terjadi kesalahan: ${error.message}` };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setLoading(false);
    }
  }, [input, loading, currentSessionId, lastQuizTopic, navigate, onLogout]);

  const handleDeleteSession = async (sessionIdToDelete, e) => {
    e.stopPropagation();
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    try {
      const response = await fetch(`https://studiva.site/api/chat/${sessionIdToDelete}?user_id=${userId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Gagal menghapus sesi di server.");
      
      setSessions(prevSessions => prevSessions.filter(s => s.id !== sessionIdToDelete));
      if (currentSessionId === sessionIdToDelete) {
        setCurrentSessionId(null);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Gagal menghapus riwayat chat. Silakan coba lagi.");
    }
  };

  const handleNewChat = useCallback(() => { 
    setCurrentSessionId(null); 
    setLastQuizTopic(null);
  }, []);

  const handleSessionSelect = useCallback((sessionId) => { 
    if (sessionId !== currentSessionId) {
      setCurrentSessionId(sessionId); 
      setLastQuizTopic(null);
    }
  }, [currentSessionId]);
  
  const closePreview = () => { setPreviewInfo(null); setPdfData(null); };
  const toggleSidebar = useCallback(() => { setSidebarOpen(prev => !prev); }, []);

  return (
    <div className="relative flex h-screen bg-orange-50 font-poppins">
      <div className={`bg-orange-100 border-r border-orange-200 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64 p-4' : 'w-0'}`}>
        <div className="overflow-hidden flex flex-col h-full">
          <button onClick={handleNewChat} className="w-full p-2 mb-2 text-center bg-green-800 text-white rounded-lg font-semibold hover:bg-green-900 transition-colors whitespace-nowrap">+ Chat Baru</button>
          <h2 className="text-lg font-bold my-2 text-gray-700 whitespace-nowrap">Riwayat Chat</h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            {sessions.map((s) => (
              <div key={s.id} className="group relative" onClick={() => handleSessionSelect(s.id)}>
                <div className={`w-full p-2 rounded-lg transition-colors text-sm truncate cursor-pointer ${s.id === currentSessionId ? "bg-green-800 text-white font-semibold" : "text-gray-600 hover:bg-orange-200"}`}>
                  {s.name}
                </div>
                <button
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Hapus Sesi"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <button onClick={toggleSidebar} className="absolute top-1/2 -translate-y-1/2 bg-green-800 text-white rounded-full p-1 shadow-lg hover:bg-green-700 focus:outline-none z-20 transition-all duration-300 -translate-x-1/2" style={{ left: isSidebarOpen ? '16rem' : '0' }}>
        {isSidebarOpen ? ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg> )}
      </button>

      <div className="flex flex-col flex-1">
        <header className="bg-green-800 border-b border-green-700 flex items-center justify-between p-4 shadow-sm">
          <h1 className="text-xl font-bold text-white">STUDIVA.AI</h1>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-300">Hi, {username || 'Siswa'}</span>
            <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors">Logout</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-orange-50">
          {messages.length === 0 && !loading ? (
            <WelcomeMessage />
          ) : (
            messages.map((msg, index) => (<Message key={msg.id || index} message={msg} onSourceClick={handleSourceClick} />))
          )}
          {loading && (
            <div className="self-start mr-auto"><div className="p-3 rounded-lg bg-white shadow-md"><div className="flex items-center justify-center space-x-1"><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div></div></div></div>
          )}
          <div ref={bottomRef}></div>
        </main>
        
        <footer className="p-4 bg-orange-100 border-t border-orange-200 flex items-center gap-3">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder={loading ? "Menunggu respons..." : "Tanyakan sesuatu..."} disabled={loading} className="flex-1 p-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50" />
          <button onClick={sendMessage} disabled={loading || !input.trim()} className="bg-green-800 hover:bg-green-700 text-white p-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Kirim</button>
        </footer>
      </div>
      
      {previewInfo && (
        <PdfPreview
            fileData={pdfLoading ? null : pdfData}
            relevantPages={previewInfo.relevantPages}
            initialPage={previewInfo.initialPage}
            fileName={previewInfo.path.split('/').pop()}
            onClose={closePreview}
            snippets={previewInfo.snippets}
        />
      )}
    </div>
  );
};

export default ChatPage;