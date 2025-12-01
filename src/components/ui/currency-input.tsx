"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number;
  onChange?: (value: number) => void;
  prefix?: string;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, prefix = "Rp ", ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");

    // Format number with thousand separators
    const formatNumber = (num: number): string => {
      if (isNaN(num) || num === 0) return "";
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Parse formatted string to number
    const parseNumber = (str: string): number => {
      const cleaned = str.replace(/[^\d]/g, "");
      return cleaned === "" ? 0 : parseInt(cleaned, 10);
    };

    // Update display value when prop value changes
    React.useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(formatNumber(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Remove all non-digit characters
      const numericValue = parseNumber(inputValue);
      
      // Update display with formatted value
      const formatted = formatNumber(numericValue);
      setDisplayValue(formatted);
      
      // Call onChange with numeric value
      if (onChange) {
        onChange(numericValue);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Select all on focus for easier editing
      e.target.select();
      props.onFocus?.(e);
    };

    return (
      <div className="relative">
        {prefix && displayValue && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            {prefix}
          </span>
        )}
        <Input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          className={cn(prefix && displayValue ? "pl-12" : "", className)}
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
