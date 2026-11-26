"use client";

import { useEffect, useRef, useState } from "react";

export default function PayButton({ label, title, text, close }: { label: string; title: string; text: string; close: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-gold !min-h-0 !px-5 !py-2 text-sm">{label}</button>
      <dialog ref={ref} onClose={() => setOpen(false)} className="m-auto max-w-md rounded-2xl p-0 backdrop:bg-forest-950/70">
        <div className="p-7">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <ul className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
            {["JazzCash", "Easypaisa", "Visa / Mastercard", "1Bill"].map((m) => <li key={m} className="ltr rounded-full bg-cream px-3 py-1 text-forest-900">{m}</li>)}
          </ul>
          <p className="mt-4 text-muted">{text}</p>
          <button type="button" onClick={() => setOpen(false)} className="btn btn-primary mt-6 w-full">{close}</button>
        </div>
      </dialog>
    </>
  );
}
