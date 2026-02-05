
import React, { useState } from 'react';
import { AppMode, AnalysisResult } from './types.ts';
import { analyzeAudio } from './services/gemini.ts';
import AnalyzerView from './components/AnalyzerView.tsx';
import GeneratorView from './components/GeneratorView.tsx';
import CRMGeneratorView from './components/CRMGeneratorView.tsx';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('analyzer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedFile(file);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const resultStr = reader.result as string;
          const base64 = resultStr.split(',')[1];
          const analysis = await analyzeAudio(base64, file.type);
          setResult(analysis);
        } catch (err: any) {
          console.error("Analysis Error:", err);
          setError(err.message || 'Failed to analyze audio. The file might be too large or the API limit reached.');
        } finally {
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Failed to read the local file.");
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('An unexpected error occurred during upload.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfd]">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 w-11 h-11 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-200">
                <i className="fas fa-bolt-lightning text-white text-xl"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">ScribeAI</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-500 font-bold">Intelligence Suite</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
              {(['analyzer', 'audio-generator', 'crm-generator'] as AppMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    mode === m 
                      ? 'bg-white text-indigo-600 shadow-lg shadow-slate-200 translate-y-[-1px]' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                  }`}
                >
                  <i className={`fas fa-${m === 'analyzer' ? 'chart-line' : m === 'audio-generator' ? 'microchip' : 'database'} mr-2.5 opacity-70`}></i>
                  {m === 'analyzer' ? 'Analyzer' : m === 'audio-generator' ? 'Script Gen' : 'CRM Prep'}
                </button>
              ))}
            </nav>

            <div className="md:hidden">
                <select 
                    value={mode} 
                    onChange={(e) => setMode(e.target.value as AppMode)}
                    className="bg-slate-100 border border-slate-200 text-sm font-bold rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <option value="analyzer">Analyzer</option>
                    <option value="audio-generator">Script Gen</option>
                    <option value="crm-generator">CRM Prep</option>
                </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="animate-in">
          {mode === 'analyzer' && (
            <AnalyzerView 
              onUpload={handleFileUpload} 
              loading={loading} 
              result={result} 
              error={error} 
              selectedFile={selectedFile}
            />
          )}
          {mode === 'audio-generator' && <GeneratorView />}
          {mode === 'crm-generator' && <CRMGeneratorView />}
        </div>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <i className="fas fa-brain text-indigo-500"></i>
              <span>ScribeAI Platform</span>
            </div>
            <p className="text-slate-400 text-sm">Empowering workflows with Gemini 3 Pro & Whisper AI</p>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
          </div>
          <div className="text-slate-400 text-xs">
            &copy; {new Date().getFullYear()} ScribeAI. All systems operational.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
