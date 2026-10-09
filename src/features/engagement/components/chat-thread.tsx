import { useState, useRef, useEffect } from "react";
import { SendHorizontal, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ChatMsg } from "@/lib/data";

import { useAuth } from "@/features/auth";
import { AttendanceService } from "@/features/attendance/attendance-service";

export function ChatThread({
  initial,
  chips,
  placeholder = "Write a message…",
  themLabel,
  themInitials,
  autoReply,
}: {
  initial: ChatMsg[];
  chips?: string[];
  placeholder?: string;
  themLabel: string;
  themInitials: string;
  autoReply?: string;
}) {
  const { profile, role } = useAuth();
  const [msgs, setMsgs] = useState<ChatMsg[]>(initial);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [msgs, isTyping]);

  const getSmartAnswer = (input: string): string => {
    return AttendanceService.queryLiveAiAssistant(input, profile, role);
  };

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const userMsg: ChatMsg = { id: msgs.length + 1, from: "me", text: t, time };
    setMsgs((prev) => [...prev, userMsg]);
    setDraft("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const replyText = getSmartAnswer(t);
      const botMsg: ChatMsg = {
        id: Date.now(),
        from: "them",
        text: replyText,
        time: `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`,
      };
      setMsgs((prev) => [...prev, botMsg]);
    }, 900);
  };

  return (
    <div className="flex h-[580px] flex-col rounded-2xl bg-card border border-border overflow-hidden">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
        <AnimatePresence initial={false}>
          {msgs.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={cn("flex gap-3", m.from === "me" ? "justify-end" : "justify-start")}
            >
              {m.from === "them" ? (
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent text-[11px] font-bold text-accent-foreground shadow-xs">
                  {themInitials}
                </span>
              ) : null}
              <div className="max-w-[82%] sm:max-w-[70%]">
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs transition-all whitespace-pre-line",
                    m.from === "me"
                      ? "bg-accent text-accent-foreground rounded-tr-xs font-medium"
                      : "bg-surface border border-border text-foreground rounded-tl-xs",
                  )}
                >
                  {m.text}
                </div>
                <p
                  className={cn(
                    "mt-1 text-[10px] tabular text-muted-foreground px-1",
                    m.from === "me" ? "text-right" : "text-left",
                  )}
                >
                  {m.from === "me" ? "You" : themLabel} · {m.time}
                </p>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent text-[11px] font-bold text-accent-foreground">
                {themInitials}
              </span>
              <div className="rounded-2xl rounded-tl-xs border border-border bg-surface px-4 py-3 shadow-xs">
                <div className="flex gap-1.5 items-center">
                  <span className="h-2 w-2 rounded-full bg-accent/60 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-accent/60 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-accent/60 animate-bounce" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {chips?.length ? (
        <div className="flex flex-wrap gap-1.5 border-t border-border/60 bg-muted/20 px-4 py-3">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-accent mr-1">
            <Sparkles className="h-3 w-3" /> Prompts:
          </span>
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => send(c)}
              className="rounded-xl border border-border/80 bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-accent hover:bg-accent/10 hover:text-accent shadow-2xs"
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className="flex items-center gap-2 border-t border-border bg-card p-3 sm:p-4"
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="h-11 rounded-xl border-border bg-surface text-sm px-4 focus-visible:ring-1 focus-visible:ring-accent"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!draft.trim()}
          className="h-11 w-11 shrink-0 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs transition-all disabled:opacity-40"
          aria-label="Send message"
        >
          <SendHorizontal className="h-5 w-5" strokeWidth={1.8} />
        </Button>
      </form>
    </div>
  );
}
