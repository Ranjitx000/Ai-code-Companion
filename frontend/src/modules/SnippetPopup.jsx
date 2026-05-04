// src/modules/SnippetPopup.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import Loader from '../shared/Loader';

const SnippetPopup = React.forwardRef(({ explanation, initialPosition, onClose, onExplain, isLoading }, ref) => {
    const [position, setPosition] = useState(null);
    const isDraggingRef = useRef(false);
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    // Sync position when initialPosition changes (new selection)
    useEffect(() => {
        if (initialPosition) {
            // Clamp to viewport so popup doesn't go offscreen
            const popupW = 420;
            const popupH = 380;
            const left = Math.min(initialPosition.left, window.innerWidth - popupW - 16);
            const top = Math.min(initialPosition.top, window.innerHeight - popupH - 16);
            setPosition({
                left: Math.max(8, left),
                top: Math.max(8, top),
            });
        } else {
            setPosition(null);
        }
    }, [initialPosition]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (position) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [position, onClose]);

    // Drag start — capture offset from popup corner
    const handleDragStart = useCallback((e) => {
        e.preventDefault();
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            dragOffsetRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
            isDraggingRef.current = true;
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        }
    }, [ref]);

    // Drag move + stop — use a single stable effect
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDraggingRef.current) return;
            const newLeft = e.clientX - dragOffsetRef.current.x;
            const newTop = e.clientY - dragOffsetRef.current.y;
            // Clamp to viewport
            setPosition({
                left: Math.max(0, Math.min(newLeft, window.innerWidth - 100)),
                top: Math.max(0, Math.min(newTop, window.innerHeight - 50)),
            });
        };

        const handleMouseUp = () => {
            if (isDraggingRef.current) {
                isDraggingRef.current = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    if (!position) return null;

    return (
        <div
            ref={ref}
            className="snippet-popup"
            style={{ top: position.top, left: position.left }}
        >
            {/* Drag Handle */}
            <div className="snippet-popup-header" onMouseDown={handleDragStart}>
                <div className="snippet-popup-drag-dots">
                    <span></span><span></span><span></span><span></span><span></span><span></span>
                </div>
                <h4 className="snippet-popup-title">✨ AI Snippet Explanation</h4>
                <button onClick={onClose} className="snippet-popup-close">&times;</button>
            </div>

            {/* Content */}
            <div className="snippet-popup-body">
                {isLoading ? (
                    <Loader message="Analyzing snippet..." />
                ) : explanation ? (
                    <div
                        className="ai-markdown-output snippet-explanation"
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(marked.parse(explanation)),
                        }}
                    />
                ) : (
                    <div className="snippet-popup-empty">
                        <p className="snippet-popup-prompt-text">
                            Explain the selected code snippet?
                        </p>
                        <button onClick={onExplain} className="snippet-popup-explain-btn">
                            ✨ Explain Snippet
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

export default SnippetPopup;