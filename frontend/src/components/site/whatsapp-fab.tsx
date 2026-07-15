import { whatsappLink } from "@/lib/catalog";

export function WhatsappFab() {
  return (
    <a
      href={whatsappLink("Hi Wallistan — I have a question about a custom sign.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-20 right-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-105 lg:bottom-5 lg:right-5 lg:h-14 lg:w-14"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current">
        <path d="M20 3.5A11.5 11.5 0 0 0 2.6 18l-1.1 4a.5.5 0 0 0 .6.6l4-1.1A11.5 11.5 0 1 0 20 3.5Zm-8 20.4a9.9 9.9 0 0 1-5-1.3l-.4-.2-2.9.8.8-2.9-.2-.4A9.9 9.9 0 1 1 12 22Zm5.5-7c-.3-.1-1.7-.9-2-1s-.5-.1-.7.2-.8 1-1 1.2-.4.2-.7.1a8 8 0 0 1-2.3-1.4 8.7 8.7 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.5.2-.3a.4.4 0 0 0 0-.4l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.3c0 1.3 1 2.7 1.1 2.8s2 3 4.8 4.2a5.5 5.5 0 0 0 2 .5 3 3 0 0 0 2-.9 2.4 2.4 0 0 0 .5-1.6c0-.2-.1-.3-.4-.4Z" />
      </svg>
    </a>
  );
}
