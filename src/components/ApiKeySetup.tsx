import { useState } from 'react';
import { validateApiKey } from '../lib/gemini';

interface ApiKeySetupProps {
    onApiKeySet: (key: string) => void;
}

export function ApiKeySetup({ onApiKeySet }: ApiKeySetupProps) {
    const [apiKey, setApiKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKey.trim()) return;

        setIsValidating(true);
        setError(null);

        const isValid = await validateApiKey(apiKey.trim());

        if (isValid) {
            onApiKeySet(apiKey.trim());
        } else {
            setError('Invalid API key. Please check and try again.');
        }

        setIsValidating(false);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
                        Text Like a Local
                    </h1>
                    <p className="mt-3 text-sm text-neutral-500">
                        Generate natural chat replies using AI
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="apiKey"
                            className="block text-sm font-medium text-neutral-700"
                        >
                            Gemini API Key
                        </label>
                        <input
                            id="apiKey"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your API key"
                            className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                            disabled={isValidating}
                        />
                        <p className="mt-2 text-xs text-neutral-500">
                            Get your key from{' '}
                            <a
                                href="https://aistudio.google.com/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-700 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-500"
                            >
                                Google AI Studio
                            </a>
                        </p>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={!apiKey.trim() || isValidating}
                        className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
                    >
                        {isValidating ? 'Validating...' : 'Continue'}
                    </button>
                </form>

                <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-2">
                        <svg
                            className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-amber-900">
                                Security Notice
                            </p>
                            <p className="mt-1 text-xs text-amber-800">
                                Your API key is stored locally in your browser
                                and never sent to any server except Google AI.
                                Use caution on shared computers and avoid
                                browser extensions you don't trust.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
