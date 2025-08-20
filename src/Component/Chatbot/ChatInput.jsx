import React from "react";
import {Send, Mic} from "lucide-react";
import {useSpeechRecognition} from "@/hooks/useSpeechRecognition.js";

export function ChatInput({message, setMessage, onSend}) {
    const {start} = useSpeechRecognition({onResult: setMessage});

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="flex items-center gap-2">
      <textarea
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow border rounded p-2 text-base resize-none"
          placeholder="Type a message..."
      />
            <button onClick={start} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800"
                    aria-label="Voice input">
                <Mic size={20}/>
            </button>
            <button
                onClick={onSend}
                disabled={!message.trim()}
                className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                aria-label="Send"
            >
                <Send size={20}/>
            </button>
        </div>
    );
}
