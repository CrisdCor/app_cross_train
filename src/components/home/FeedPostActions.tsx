"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, ArrowUpRight } from "lucide-react";

interface FeedPostActionsProps {
  href: string;
}

/**
 * Íconos de una publicación del feed: reacción (me gusta — por ahora solo
 * un toggle visual, más adelante tendrá reacciones propias de CrossFit),
 * comentar (visible, sin funcionalidad todavía) y abrir la publicación
 * completa.
 */
export function FeedPostActions({ href }: FeedPostActionsProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="flex items-center justify-end gap-4 pt-4">
      <button
        type="button"
        onClick={() => setLiked((prev) => !prev)}
        aria-label="Me gusta"
        aria-pressed={liked}
      >
        <Heart
          size={20}
          strokeWidth={1.5}
          className={liked ? "fill-black text-black" : "text-text-primary"}
        />
      </button>
      <button type="button" aria-label="Comentar" className="cursor-default opacity-50" disabled>
        <MessageCircle size={20} strokeWidth={1.5} className="text-text-primary" />
      </button>
      <Link href={href} aria-label="Ir a la publicación">
        <ArrowUpRight size={20} strokeWidth={1.5} className="text-text-primary" />
      </Link>
    </div>
  );
}
