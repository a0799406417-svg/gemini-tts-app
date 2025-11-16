
import React, { useState, useEffect, useCallback } from 'react';
import { Buffer } from 'buffer';
window.Buffer = Buffer;
import { MagicWandIcon, PlayIcon, PauseIcon, StopIcon } from './components/icons';
import { Loader } from './components/Loader';

const App: React.FC = () => {
  const [originalText, setOriginalText] = useState<string>('שלום! ברוכים הבאים לאפליקציית המרת טקסט לדיבור. כתבו כאן את הטקסט שתרצו לשמוע.');
  const [tone, setTone] = useState<string>('ידידותי וברור');
  const [rewrittenText, setRewrittenText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    // Cleanup audio element on component unmount
    return () => {
      if (audio) {
        audio.pause();
        setAudio(null);
      }
    };
  }, [audio]);

  const handleGenerateAndSpeak = useCallback(async () => {
    if (!originalText.trim() || !tone.trim()) {
      setError('נא למלא את כל השדות: טקסט לדיבור ואווירת הקראה.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setRewrittenText('');
    if (audio) {
      audio.pause();
    }

    try {
      const response = await fetch('https://gemini-tts-app-self.vercel.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalText, tone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process request on server.');
      }

      const { rewrittenText, audioContent } = await response.json();
      setRewrittenText(rewrittenText);

      // Play the audio
      const audioBlob = new Blob([Buffer.from(audioContent, 'base64')], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const newAudio = new Audio(audioUrl);
      
      newAudio.onplay = () => setIsPlaying(true);
      newAudio.onpause = () => setIsPlaying(false);
      newAudio.onended = () => setIsPlaying(false);
      
      setAudio(newAudio);
      newAudio.play();

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'אירעה שגיאה לא צפויה.';
      setError(`שגיאה ביצירת הטקסט: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [originalText, tone, audio]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 font-sans">
      <main className="w-full max-w-3xl mx-auto bg-slate-800/50 rounded-2xl shadow-2xl shadow-cyan-500/10 backdrop-blur-sm border border-slate-700">
        <div className="p-6 sm:p-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
              Gemini TTS
            </h1>
            <p className="text-slate-400 mt-2 text-lg">המרת טקסט לדיבור בעזרת בינה מלאכותית</p>
          </header>

          <div className="space-y-6">
            {/* Text Input Area */}
            <div>
              <label htmlFor="original-text" className="block text-lg font-semibold mb-2 text-slate-300">
                הטקסט להמרה
              </label>
              <textarea
                id="original-text"
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="הקלד או הדבק את הטקסט שלך כאן..."
                className="w-full h-40 p-4 bg-slate-900/70 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-300 resize-none scrollbar-hide"
                aria-label="טקסט להמרה"
              />
            </div>

            {/* Controls: Tone and Voice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tone" className="block text-lg font-semibold mb-2 text-slate-300">
                  אווירת הקראה
                </label>
                <input
                  id="tone"
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="למשל: דרמטי, קריינות חדשות, שמח"
                  className="w-full p-3 bg-slate-900/70 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-300"
                  aria-label="אווירת הקראה"
                />
              </div>
                          </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                onClick={handleGenerateAndSpeak}
                disabled={isLoading || !originalText.trim()}
                className="w-full flex items-center justify-center gap-3 text-xl font-bold p-4 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg hover:from-cyan-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                aria-label="המר ודבר"
              >
                {isLoading ? (
                  <>
                    <Loader />
                    <span>מעבד...</span>
                  </>
                ) : (
                  <>
                    <MagicWandIcon />
                    <span>המר ודבר</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg text-center" role="alert">
                {error}
              </div>
            )}

            {/* Result and Speech Controls */}
            {(rewrittenText || isPlaying) && (
              <div className="space-y-4 pt-4 border-t-2 border-slate-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-300">תוצאה ופקדי שמע</h3>
                  {audio && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => isPlaying ? audio.pause() : audio.play()} className="p-2 rounded-full bg-slate-700 hover:bg-cyan-500/50 transition-colors" aria-label={isPlaying ? 'השהה' : 'נגן'}>
                        {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                      </button>
                      <button onClick={() => { audio.pause(); audio.currentTime = 0; }} className="p-2 rounded-full bg-slate-700 hover:bg-red-500/50 transition-colors" aria-label="עצור">
                        <StopIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="p-4 bg-slate-900/70 rounded-lg text-slate-300 h-32 overflow-y-auto scrollbar-hide">
                  {rewrittenText}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="text-center mt-8 text-slate-500 text-sm">
        <p>מופעל על ידי Gemini ו-Google Cloud TTS</p>
      </footer>
    </div>
  );
};

export default App;
