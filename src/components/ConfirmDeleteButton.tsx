"use client";

export default function ConfirmDeleteButton({
  action,
  fields,
  message,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
  message: string;
  label: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className="inline-flex"
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        type="submit"
        title={label}
        aria-label={label}
        className="ml-1 rounded-full px-1.5 text-sm leading-none text-neutral-400 hover:bg-red-100 hover:text-red-700"
      >
        ×
      </button>
    </form>
  );
}
