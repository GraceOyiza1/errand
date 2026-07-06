"use client";

import React, { useState } from "react";

interface ImageUploaderProps {
    images: string[];
    onChange: (images: string[]) => void;
    label?: string;
    maxImages?: number;
}

export default function ImageUploader({
    images,
    onChange,
    label = "Add item images",
    maxImages = 3,
}: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const remaining = maxImages - images.length;

    const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const pickedFiles = Array.from(files).slice(0, remaining);
        const uploadedUrls: string[] = [];

        for (const file of pickedFiles) {
            try {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    uploadedUrls.push(data.url);
                }
            } catch (error) {
                console.error("Failed to upload image:", error);
            }
        }

        if (uploadedUrls.length > 0) {
            onChange([...images, ...uploadedUrls]);
        }

        setIsUploading(false);
        event.target.value = "";
    };

    const handleRemoveImage = (index: number) => {
        onChange(images.filter((_, idx) => idx !== index));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
                <label className="block text-sm font-semibold text-slate-700">
                    {label}
                </label>
                <span className="text-[11px] text-slate-500">
                    {images.length}/{maxImages}
                </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {images.map((src, index) => (
                    <div
                        key={src + index}
                        className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50"
                    >
                        <img
                            src={src}
                            alt={`Item image ${index + 1}`}
                            className="h-24 w-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-900/80 text-white text-[10px]"
                        >
                            ×
                        </button>
                    </div>
                ))}
                {remaining > 0 && (
                    <label className="group flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-2xl p-4 text-center text-slate-600 hover:border-emerald-500 hover:text-emerald-700 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFiles}
                            disabled={isUploading}
                            className="hidden"
                        />
                        <span className="text-2xl">{isUploading ? "⏳" : "+"}</span>
                        <span className="text-sm mt-2">
                            {isUploading ? "Uploading..." : "Upload image"}
                        </span>
                    </label>
                )}
            </div>
            <p className="text-[11px] text-slate-400">
                Upload up to {maxImages} photos to help the shopper identify the exact item.
            </p>
        </div>
    );
}
