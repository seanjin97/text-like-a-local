import './App.css';
import { useState, useCallback } from 'react';
import { useApiKey } from './hooks/useApiKey';
import {
    generateReply,
    type ConversationEntry as ApiConversationEntry,
} from './lib/gemini';
import { ApiKeySetup } from './components/ApiKeySetup';
import { ImageUpload, type ImageData } from './components/ImageUpload';
import { ReplyDisplay } from './components/ReplyDisplay';

type ConversationEntry = {
    image: ImageData;
    reply: string;
    translation?: string;
    timestamp: number;
};

type AppState =
    | { status: 'idle' }
    | { status: 'processing' }
    | { status: 'success'; reply: string; translation?: string }
    | { status: 'error'; message: string };

function App() {
    const { apiKey, setApiKey, clearApiKey, hasApiKey } = useApiKey();
    const [state, setState] = useState<AppState>({ status: 'idle' });
    const [currentImage, setCurrentImage] = useState<ImageData | null>(null);
    const [goal, setGoal] = useState('');
    const [conversationHistory, setConversationHistory] = useState<
        ConversationEntry[]
    >([]);

    const handleImageSelect = useCallback((image: ImageData) => {
        setCurrentImage(image);
        setState({ status: 'idle' });
    }, []);

    const handleGenerate = useCallback(
        async (image: ImageData) => {
            if (!apiKey) return;

            setState({ status: 'processing' });

            // Convert conversation history to API format
            const apiHistory: ApiConversationEntry[] = conversationHistory.map(
                (entry) => ({
                    imageBase64: entry.image.base64,
                    mimeType: entry.image.mimeType,
                    reply: entry.reply,
                })
            );

            const result = await generateReply(
                apiKey,
                image.base64,
                image.mimeType,
                goal || undefined,
                apiHistory
            );

            if (result.success) {
                // Add to conversation history
                setConversationHistory((prev) => [
                    ...prev,
                    {
                        image,
                        reply: result.reply,
                        translation: result.translation,
                        timestamp: Date.now(),
                    },
                ]);
                setState({
                    status: 'success',
                    reply: result.reply,
                    translation: result.translation,
                });
                setCurrentImage(null);
            } else {
                setState({ status: 'error', message: result.error });
            }
        },
        [apiKey, goal, conversationHistory]
    );

    const handleReset = useCallback(() => {
        setState({ status: 'idle' });
        setCurrentImage(null);
    }, []);

    const handleClearConversation = useCallback(() => {
        setConversationHistory([]);
        setGoal('');
        setState({ status: 'idle' });
        setCurrentImage(null);
    }, []);

    if (!hasApiKey) {
        return <ApiKeySetup onApiKeySet={setApiKey} />;
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                <header className="mb-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
                            Text Like a Local
                        </h1>
                        <div className="flex items-center gap-3">
                            {conversationHistory.length > 0 && (
                                <button
                                    onClick={handleClearConversation}
                                    className="text-sm text-neutral-500 hover:text-neutral-700"
                                >
                                    New
                                </button>
                            )}
                            <button
                                onClick={clearApiKey}
                                className="text-sm text-neutral-500 hover:text-neutral-700"
                            >
                                Settings
                            </button>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="goal-input"
                            className="mb-2 block text-sm font-medium text-neutral-700"
                        >
                            Conversation Goal (Optional)
                        </label>
                        <input
                            id="goal-input"
                            type="text"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="e.g., Schedule a meeting, decline politely..."
                            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                        />
                    </div>
                </header>

                <main className="space-y-6">
                    {conversationHistory.length > 0 && (
                        <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                            <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                History ({conversationHistory.length}{' '}
                                {conversationHistory.length === 1
                                    ? 'message'
                                    : 'messages'}
                                )
                            </h2>
                            <div className="space-y-4">
                                {conversationHistory.map((entry, index) => (
                                    <div
                                        key={entry.timestamp}
                                        className="space-y-2 border-l-2 border-neutral-300 pl-4"
                                    >
                                        <p className="text-xs text-neutral-400">
                                            #{index + 1}
                                        </p>
                                        <p className="text-sm text-neutral-700">
                                            {entry.reply}
                                        </p>
                                        {entry.translation && (
                                            <p className="text-xs text-neutral-500">
                                                → {entry.translation}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {state.status === 'success' ? (
                        <ReplyDisplay
                            reply={state.reply}
                            translation={state.translation}
                            onNewImage={handleReset}
                        />
                    ) : (
                        <>
                            <ImageUpload
                                onImageSelect={handleImageSelect}
                                onGenerate={handleGenerate}
                                isProcessing={state.status === 'processing'}
                                selectedImage={currentImage}
                            />

                            {state.status === 'processing' && (
                                <div className="flex items-center justify-center gap-2 py-8 text-neutral-500">
                                    <svg
                                        className="h-5 w-5 animate-spin"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    <span className="text-sm">
                                        Generating reply...
                                    </span>
                                </div>
                            )}

                            {state.status === 'error' && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                    <p className="text-sm text-red-800">
                                        {state.message}
                                    </p>
                                    <button
                                        onClick={handleReset}
                                        className="mt-2 text-sm font-medium text-red-700 hover:text-red-900"
                                    >
                                        Try again
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;
