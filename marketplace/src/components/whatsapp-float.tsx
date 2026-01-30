export default function WhatsAppFloat() {
  return (
    <a
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg"
      href="https://wa.me/917666247666"
      aria-label="Chat on WhatsApp"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 2a8 8 0 016.2 13.1l-.4.5.8 2.9-3-.8-.5.3A8 8 0 114 12a8 8 0 018-8zm-3.3 4.9c-.2 0-.5 0-.7.3-.2.2-.8.8-.8 1.9s.9 2.2 1 2.4c.2.2 1.8 2.8 4.3 3.8 2.1.8 2.5.6 2.9.5.4-.1 1.3-.5 1.5-1 .2-.5.2-1 .1-1.1-.1-.1-.4-.2-.8-.4-.4-.2-1.3-.6-1.5-.7-.2-.1-.4-.2-.6.2-.2.3-.7.7-.9.9-.2.2-.3.2-.6 0-.3-.2-1.2-.4-2.3-1.4-.8-.7-1.3-1.6-1.5-1.8-.2-.3 0-.4.2-.6.2-.2.3-.4.5-.6.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6-.1-.2-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5z" />
      </svg>
    </a>
  );
}
