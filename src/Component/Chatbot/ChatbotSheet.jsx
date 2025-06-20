import React from 'react';
import {Sheet, SheetTrigger} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';
import {Bot} from 'lucide-react';

export function ChatbotSheet({triggerOpen, hasNewMessage, children}) {
    return (
        <Sheet open={triggerOpen.open} onOpenChange={triggerOpen.setOpen}>
            <SheetTrigger asChild>
                <Button className="relative rounded-full h-16 w-16 bg-blue-600 hover:bg-blue-700">
                    <Bot className="w-7 h-7 text-white"/>
                    {hasNewMessage && (
                        <span className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full animate-ping"/>
                    )}
                </Button>
            </SheetTrigger>
            {children}
        </Sheet>
    );
}