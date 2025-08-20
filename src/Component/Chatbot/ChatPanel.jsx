import React from "react";

export function ChatPanel({chatMessages}) {
    return (
        <div className="max-h-48 overflow-auto mb-2">
            {chatMessages.map((m, i) => (
                <div key={i} className={`${m.sender === "user" ? "text-right" : "text-left"} mb-1`}>
          <span
              className={`inline-block px-3 py-1 rounded text-base ${
                  m.sender === "user" ? "bg-blue-100" : "bg-blue-200"
              }`}
          >
            {m.text}
          </span>
                </div>
            ))}
        </div>
    );
}
