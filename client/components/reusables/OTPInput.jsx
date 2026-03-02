'use client';
import { useRef } from 'react';

const OtpInput = ({
  value = ["", "", "", "", "", ""],
  onChange,
  length = 6,
  inputClassName = "",
}) => {
  const otpRefs = useRef([]);

  const handleChange = (index, val) => {
    if (val.length > 1) {
      // Handle paste
      const pasted = val.replace(/\D/g, '').slice(0, length).split('');
      const newOtp = [...value];
      for (let i = 0; i < pasted.length; i++) {
        newOtp[index + i] = pasted[i];
      }
      onChange(newOtp);

      // Focus next empty input
      const nextEmpty = newOtp.findIndex(d => d === '');
      if (nextEmpty !== -1) {
        otpRefs.current[nextEmpty]?.focus();
      } else {
        otpRefs.current[length - 1]?.focus();
      }
    } else {
      // Single digit input
      if (!isNaN(val) && val.length <= 1) {
        const newOtp = [...value];
        newOtp[index] = val;
        onChange(newOtp);

        if (val && index < length - 1) {
          otpRefs.current[index + 1]?.focus();
        }
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (index, e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    if (pasted) {
      handleChange(index, pasted);
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {value.map((digit, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength="1"
          className={`w-12 h-12 text-center border rounded-md text-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary ${inputClassName}`}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          ref={(el) => (otpRefs.current[index] = el)}
        />
      ))}
    </div>
  );
};

export default OtpInput;
