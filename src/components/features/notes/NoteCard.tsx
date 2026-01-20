'use client';

import { Note } from '@/types';
import clsx from 'clsx';
import { Mic, Image as ImageIcon, AlignLeft } from 'lucide-react';
import { vibrate } from '@/utils/haptics';

interface NoteCardProps {
    note: Note;
    onTap?: () => void;
}

export const NoteCard = ({ note, onTap }: NoteCardProps) => {
    return (
        <div
            onClick={() => {
                vibrate('light');
                if (onTap) onTap();
            }}
            className="w-full bg-[#1A1A1A] rounded-2xl p-4 mb-3 border border-white/5 overflow-hidden break-inside-avoid active:scale-[0.98]  cursor-pointer"
        >
            {/* Header / Title */}
            {note.title && (
                <h3 className="text-white text-[15px] font-medium mb-2 leading-tight">
                    {note.title}
                </h3>
            )}

            {/* Image Attachments */}
            {note.images && note.images.length > 0 && (
                <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-neutral-800 relative">
                    <img src={note.images[0]} alt="Note attachment" className="w-full h-full object-cover" />
                    {note.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white font-medium">
                            +{note.images.length - 1}
                        </div>
                    )}
                </div>
            )}

            {/* Content Preview (Legacy Image or Text) */}
            {!note.images?.length && note.type === 'image' && note.content.startsWith('http') ? (
                <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-neutral-800">
                    <img src={note.content} alt={note.title || 'Note image'} className="w-full h-full object-cover" />
                </div>
            ) : (
                <p className={clsx(
                    "text-gray-400 text-[13px] leading-relaxed line-clamp-4",
                    !note.title && "text-white/90 text-[14px]"
                )}>
                    {note.content}
                </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                {/* Type Icon */}
                <div className="flex items-center text-neutral-500">
                    {note.type === 'voice' && <Mic className="w-3.5 h-3.5" />}
                    {note.type === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
                    {note.type === 'text' && <AlignLeft className="w-3.5 h-3.5" />}
                </div>

                {/* Tags */}
                {note.tags.length > 0 && (
                    <div className="flex space-x-1">
                        {note.tags.slice(0, 1).map(tag => (
                            <span key={tag} className="text-[10px] text-neutral-500 font-medium bg-neutral-800/50 px-2 py-0.5 rounded-full">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};