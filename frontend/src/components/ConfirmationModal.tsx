import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-950 rounded-xl p-6 w-full max-w-md shadow-xl ring-1 ring-zinc-800 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-100 transition p-1 hover:bg-zinc-800 rounded-full"
                >
                    <X size={18} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    {isDanger && <div className="p-2 bg-red-500/10 rounded-full"><AlertTriangle className="text-red-500" size={20} /></div>}
                    <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
                </div>

                <p className="text-zinc-400 mb-8 leading-relaxed text-sm">
                    {message}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-md transition text-sm font-medium"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 rounded-md font-semibold text-sm transition shadow-sm ${isDanger
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-zinc-100 hover:bg-white text-zinc-950'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
