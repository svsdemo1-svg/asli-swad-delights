import { MessageCircle } from "lucide-react";

const PHONE = "919035066446";

export function WhatsAppFab() {
  return (
    <a
      href={`https://wa.me/${PHONE}?text=${encodeURIComponent("Hi! I'd like to know more about Healthy Delights products.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed right-4 bottom-24 z-30 grid size-12 place-items-center rounded-full bg-brand-green text-white shadow-xl ring-4 ring-brand-green/20 transition-transform hover:scale-105 md:bottom-6"
    >
      <MessageCircle className="size-5" />
    </a>
  );
}
