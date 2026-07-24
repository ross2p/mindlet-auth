"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@ross2p/shared";

const COOLDOWN_SECONDS = 60;

interface ResendCountdownButtonProps {
  onResend: () => void;
  isPending?: boolean;
  /** Start with an active cooldown (e.g. code was just sent on page load). */
  startWithCooldown?: boolean;
}

/**
 * "Resend code" button with a 60-second cooldown.
 * While cooling down, shows a countdown instead of the label.
 */
export const ResendCountdownButton = ({
  onResend,
  isPending = false,
  startWithCooldown = true,
}: ResendCountdownButtonProps) => {
  const [seconds, setSeconds] = useState(startWithCooldown ? COOLDOWN_SECONDS : 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = () => {
    setSeconds(COOLDOWN_SECONDS);
  };

  useEffect(() => {
    if (seconds <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [seconds > 0]);

  const handleClick = () => {
    onResend();
    startCooldown();
  };

  const isCooling = seconds > 0;

  return (
    <Button
      htmlType="button"
      type="text"
      size="small"
      block
      disabled={isCooling || isPending}
      onClick={handleClick}
      className="text-muted-foreground transition-colors hover:text-primary"
    >
      {isCooling ? (
        <span className="flex items-center gap-1.5 tabular-nums">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 animate-spin"
            style={{ animationDuration: "2s" }}
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Resend in {seconds}s
        </span>
      ) : (
        "Didn't receive a code? Resend"
      )}
    </Button>
  );
};
