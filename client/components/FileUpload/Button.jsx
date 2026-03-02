export const Button= ({ text, variant, icon, onClick }) => {
  const baseStyles = "flex gap-3 justify-center items-center px-5 py-3 text-xl font-semibold leading-none";
  const variantStyles = {
    primary: "w-full bg-violet-500 text-white rounded-3xl border-white border-solid shadow-sm border-[1.125px]",
    secondary: "w-full bg-white text-stone-900 rounded-3xl border-solid border-[1.125px] border-zinc-400",
    outline: "w-full text-violet-500 rounded-lg border border-violet-500 border-solid"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]}`}
      type="button"
    >
      {icon && (
        <img src={icon} alt="" className="object-contain shrink-0 self-stretch my-auto aspect-[1.04] w-[23px]" />
      )}
      {text}
    </button>
  );
};