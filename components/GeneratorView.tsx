import React, { useState } from 'react';

const GeneratorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'python' | 'readme' | 'requirements'>('python');

  const pythonCode = `
import os
import sys
import whisper
import argparse
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# ==========================================================================
# ScribeAI: Whisper + LangChain + Gemini Pro Local Automator
# ==========================================================================
# Requirement: GOOGLE_API_KEY must be in environment variables.
# ==========================================================================

def run_pipeline(audio_path):
    if not os.path.exists(audio_path):
        print(f"Error: File '{audio_path}' not found.")
        return

    # 1. Local Transcription with OpenAI Whisper
    print(f"[*] Initializing Whisper 'base' model...")
    model = whisper.load_model("base")
    
    print(f"[*] Transcribing audio: {audio_path} (this may take a minute)...")
    result = model.transcribe(audio_path)
    text = result['text']
    
    if not text.strip():
        print("[!] Transcription resulted in empty text. Check your audio file.")
        return

    print(f"[*] Transcription complete. Word count: {len(text.split())}")

    # 2. Summarization with LangChain & Google Gemini Pro
    print("[*] Connecting to Google Gemini Pro via LangChain...")
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-3-pro-preview",
            temperature=0.3,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )

        template = """
        You are an expert secretary and analyst. Based on the following audio transcription, provide:
        
        a) EXECUTIVE SUMMARY: A high-level overview of the discussion.
        b) ACTION ITEMS: A bulleted list of tasks, including assignees if clearly mentioned.
        c) SENTIMENT ANALYSIS: A brief analysis of the speaker(s) tone and mood.

        TRANSCRIPTION:
        {transcription}

        Format the output in clean Markdown.
        """

        prompt = PromptTemplate(template=template, input_variables=["transcription"])
        chain = LLMChain(llm=llm, prompt=prompt)

        print("[*] Generating intelligence report...")
        report = chain.run(text)

        # 3. Save to Markdown
        output_filename = f"{os.path.splitext(audio_path)[0]}_summary.md"
        with open(output_filename, 'w', encoding='utf-8') as f:
            f.write(report)
            f.write("\\n\\n--- \\n## Full Transcription Appendix\\n" + text)

        print(f"[+] Success! Analysis saved to: {output_filename}")

    except Exception as e:
        print(f"[!] Error during Gemini analysis: {e}")
        print("Tip: Ensure your GOOGLE_API_KEY is correctly set.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ScribeAI Local Transcription Utility")
    parser.add_argument("file", help="Path to the audio file")
    args = parser.parse_args()
    
    run_pipeline(args.file)
`.trim();

  const readme = `
# ScribeAI Desktop Automator

This utility combines the best of local AI (Whisper) and cloud intelligence (Gemini Pro) to provide zero-cost transcription and state-of-the-art analysis.

## Prerequisites
1. **Python 3.9+**
2. **FFmpeg**: Required by Whisper for audio processing.
   - Mac: \`brew install ffmpeg\`
   - Windows: \`choco install ffmpeg\` or download from ffmpeg.org

## Installation
1. Clone your project or save these files in a folder.
2. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

## API Configuration
You need a Google API Key. Get one for free at [Google AI Studio](https://aistudio.google.com/).

Set it in your terminal environment:
- **Unix/Mac**: \`export GOOGLE_API_KEY='your_key_here'\`
- **Windows**: \`set GOOGLE_API_KEY=your_key_here\`

## Usage
\`\`\`bash
python scribe_analyze.py my_audio_file.mp3
\`\`\`
`.trim();

  const requirements = `
openai-whisper
langchain
langchain-google-genai
google-generativeai
argparse
setuptools
`.trim();

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Audio Automation <span className="text-indigo-600">Script</span></h1>
          <p className="text-slate-500">Whisper (Local) + Gemini Pro (Cloud) via LangChain</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-lg">
          {(['python', 'readme', 'requirements'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'python' ? 'Python Script' : tab === 'readme' ? 'README' : 'Requirements'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden relative group">
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={() => handleCopy(activeTab === 'python' ? pythonCode : activeTab === 'readme' ? readme : requirements)}
            className="bg-slate-800/80 backdrop-blur-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 transition-all flex items-center gap-2"
          >
            <i className="fas fa-copy"></i> Copy
          </button>
        </div>
        <pre className="p-8 text-sm font-mono text-slate-300 overflow-x-auto h-[550px] scrollbar-thin scrollbar-thumb-slate-700">
          {activeTab === 'python' ? pythonCode : activeTab === 'readme' ? readme : requirements}
        </pre>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-4 items-center text-indigo-800">
        <i className="fas fa-lightbulb text-2xl text-indigo-400"></i>
        <p className="text-sm">
          <strong>Tip:</strong> The script uses the <strong>Gemini 3 Pro</strong> model for higher quality reasoning in action item detection and sentiment analysis.
        </p>
      </div>
    </div>
  );
};

export default GeneratorView;