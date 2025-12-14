import { useState } from 'react';

interface ReplyDisplayProps {
    reply: string;
    translation?: string;
    onNewImage: () => void;
}

export function ReplyDisplay({
    reply,
    translation,
    onNewImage,
}: ReplyDisplayProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(reply);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = reply;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                        Reply
                    </span>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition hover:bg-neutral-100"
                    >
                        {copied ? (
                            <>
                                <svg
                                    className="h-3.5 w-3.5 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span className="text-green-600">Copied</span>
                            </>
                        ) : (
                            <>
                                <svg
                                    className="h-3.5 w-3.5 text-neutral-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                </svg>
                                <span className="text-neutral-600">Copy</span>
                            </>
                        )}
                    </button>
                </div>
                <p className="whitespace-pre-wrap text-base leading-relaxed text-neutral-900">
                    {reply}
                </p>
                {translation && (
                    <div className="mt-5 border-t border-neutral-100 pt-4">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                            Translation
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
                            {translation}
                        </p>
                    </div>
                )}
            </div>

            <button
                onClick={onNewImage}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
                Upload Another Screenshot
            </button>
        </div>
    );
}
