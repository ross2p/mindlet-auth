"use client";

import {
  useRef,
  useState,
  useCallback,
  type ClipboardEvent,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { cn } from "@ross2p/shared";

const DIGITS = 6;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

/**
 * Six-box OTP input with auto-advance, backspace-to-previous, and paste support.
 * `value` / `onChange` work with a plain 6-char string.
 */
export const OtpInput = ({
  value,
  onChange,
  disabled = false,
  error = false,
}: OtpInputProps) => {
  const refs = useRef<Array<HTMLInputElement | null>>(Array(DIGITS).fill(null));
  const [animating, setAnimating] = useState<number | null>(null);

  const digits = Array.from({ length: DIGITS }, (_, i) => value[i] ?? "");

  const triggerPop = (index: number) => {
    setAnimating(index);
    setTimeout(() => setAnimating(null), 250);
  };

  const focus = (index: number) => refs.current[index]?.focus();

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, index: number) => {
      const raw = e.target.value.replace(/\D/g, "");
      if (!raw) return;
      const char = raw[raw.length - 1];
      const next = digits.slice();
      next[index] = char;
      onChange(next.join(""));
      triggerPop(index);
      if (index < DIGITS - 1) focus(index + 1);
    },
    [digits, onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        if (digits[index]) {
          const next = digits.slice();
          next[index] = "";
          onChange(next.join(""));
        } else if (index > 0) {
          const next = digits.slice();
          next[index - 1] = "";
          onChange(next.join(""));
          focus(index - 1);
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        focus(index - 1);
      } else if (e.key === "ArrowRight" && index < DIGITS - 1) {
        focus(index + 1);
      }
    },
    [digits, onChange]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
      if (!pasted) return;
      const chars = pasted.slice(0, DIGITS).split("");
      const next = Array(DIGITS).fill("");
      chars.forEach((c, i) => (next[i] = c));
      onChange(next.join(""));
      const lastFilled = Math.min(chars.length, DIGITS - 1);
      focus(lastFilled);
    },
    [onChange]
  );

  return (
    <div
      className={cn(
        "flex gap-3 justify-center",
        error && "animate-shake"
      )}
      role="group"
      aria-label="One-time password"
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-14 w-11 rounded-xl border-2 bg-background text-center text-xl font-mono font-semibold",
            "transition-all duration-200 outline-none caret-transparent",
            "hover:border-foreground/40",
            "focus:border-primary focus:shadow-[0_0_0_4px_rgba(99,102,241,0.15)] focus:scale-[1.06]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            digit && !error
              ? "border-primary/60 bg-primary/5 text-primary"
              : "border-border text-foreground",
            error && "border-destructive bg-destructive/5 text-destructive",
            animating === i && "animate-otp-pop"
          )}
        />
      ))}
    </div>
  );
};
