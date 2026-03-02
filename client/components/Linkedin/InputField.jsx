export const InputField= ({ value, readonly = false, className }) => {
    return (
      <div className="w-full">
        <label htmlFor="linkedinUrl" className="sr-only">LinkedIn Profile URL</label>
        <input
          type="text"
          id="linkedinUrl"
          value={value}
          readOnly={readonly}
          className={`px-4 py-3 w-full text-lg bg-white rounded-lg border border-solid border-zinc-400 text-neutral-400 max-md:px-3.5 max-md:py-2.5 max-md:text-base max-sm:px-3 max-sm:py-2 max-sm:text-sm ${className}`}
        />
      </div>
    );
  };