import { useState, useRef, useCallback, useEffect } from 'react';

export interface ImageData {
    base64: string;
    mimeType: string;
    preview: string;
}

interface ImageUploadProps {
    onImageSelect: (image: ImageData) => void;
    onGenerate?: (image: ImageData) => void;
    isProcessing: boolean;
    selectedImage: ImageData | null;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export function ImageUpload({
    onImageSelect,
    onGenerate,
    isProcessing,
    selectedImage,
}: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback(
        (file: File) => {
            setError(null);

            if (!ACCEPTED_TYPES.includes(file.type)) {
                setError('Please upload a PNG, JPG, or WebP image');
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                setPreview(result);
                onImageSelect({
                    base64,
                    mimeType: file.type,
                    preview: result,
                });
            };
            reader.onerror = () => {
                setError('Failed to read file');
            };
            reader.readAsDataURL(file);
        },
        [onImageSelect]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            const file = e.dataTransfer.files[0];
            if (file) {
                processFile(file);
            }
        },
        [processFile]
    );

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                processFile(file);
            }
        },
        [processFile]
    );

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const clearPreview = () => {
        setPreview(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePaste = useCallback(
        (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of Array.from(items)) {
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                        processFile(file);
                    }
                    break;
                }
            }
        },
        [processFile]
    );

    useEffect(() => {
        if (!preview && !isProcessing) {
            document.addEventListener('paste', handlePaste);
            return () => {
                document.removeEventListener('paste', handlePaste);
            };
        }
    }, [preview, isProcessing, handlePaste]);

    const handleGenerate = () => {
        if (selectedImage && onGenerate) {
            onGenerate(selectedImage);
        }
    };

    return (
        <div className="space-y-4">
            {preview ? (
                <div className="space-y-4">
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Chat screenshot preview"
                            className="max-h-96 w-full rounded-xl border border-neutral-200 object-contain shadow-sm"
                        />
                        {!isProcessing && (
                            <button
                                onClick={clearPreview}
                                className="absolute right-3 top-3 rounded-full bg-white p-1.5 shadow-md transition hover:bg-neutral-50"
                                aria-label="Remove image"
                            >
                                <svg
                                    className="h-4 w-4 text-neutral-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>

                    {!isProcessing && (
                        <button
                            onClick={handleGenerate}
                            className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                        >
                            Generate Reply
                        </button>
                    )}
                </div>
            ) : (
                <div
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition ${
                        isDragging
                            ? 'border-neutral-400 bg-neutral-50'
                            : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                >
                    <svg
                        className="mx-auto h-10 w-10 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <p className="mt-3 text-sm font-medium text-neutral-700">
                        Drop, paste, or click to upload
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                        PNG, JPG, or WebP
                    </p>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                onChange={handleFileSelect}
                className="hidden"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
