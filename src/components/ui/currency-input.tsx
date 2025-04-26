"use client";

import { Input } from "@/components/ui/input";
import { forwardRef } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";

interface CurrencyInputProps extends Omit<NumericFormatProps, "customInput"> {
  label?: string;
  className?: string;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <NumericFormat
        customInput={Input}
        thousandSeparator="."
        decimalSeparator=","
        prefix="Rp"
        decimalScale={2}
        fixedDecimalScale
        allowNegative={false}
        className={className}
        getInputRef={ref}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
