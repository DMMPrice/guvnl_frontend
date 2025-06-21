// File: src/pages/ChatbotSheet.jsx

import React from "react";
import {
    Sheet,
    SheetTrigger,
    SheetOverlay,
    SheetContent,
} from "@/components/ui/sheet";
import {Bot} from "lucide-react";

export function ChatbotSheet({triggerOpen, hasNewMessage, children}) {
    const {open, setOpen} = triggerOpen;

    return (
        <Sheet open={open} onOpenChange={setOpen}>

            {/*
        1) Only render the bot‐bubble trigger when CLOSED
        (so you never see a second “×” in the bubble)
      */}
            {!open && (
                <SheetTrigger asChild>
                    <button
                        className="
              fixed bottom-4 right-4 z-50
              p-3 rounded-full
              bg-blue-600 hover:bg-blue-700
              text-white shadow-lg
              flex items-center justify-center
            "
                    >
                        <Bot size={24}/>
                        {hasNewMessage && (
                            <span
                                className="
                  absolute top-0.5 right-0.5
                  w-2 h-2 bg-red-600 rounded-full
                  animate-ping
                "
                            />
                        )}
                    </button>
                </SheetTrigger>
            )}

            {/* 2) Transparent overlay so page isn’t greyed out */}
            <SheetOverlay className="fixed inset-0 bg-transparent"/>

            {/* 3) Slide-in panel */}
            <SheetContent
                side="right"
                className="
          fixed top-[10vh] right-4
          h-[70vh] w-[400px]
          z-50
          p-0 flex flex-col overflow-hidden
          bg-white shadow-2xl rounded-lg
          border-0
        "
            >
                {children}
            </SheetContent>
        </Sheet>
    );
}