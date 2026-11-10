import { cx } from "./cx";
import { FieldError } from "./FieldError";

export type RadioOption = { readonly value: string; readonly label: string };

type RadioGroupProps = {
  readonly name: string;
  readonly legend: string;
  readonly options: readonly RadioOption[];
  /** The initially selected value. */
  readonly value?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly className?: string;
};

/** Native radios in a fieldset with a legend. Arrow keys move between options. */
export function RadioGroup({
  name,
  legend,
  options,
  value,
  required = false,
  disabled = false,
  error,
  className,
}: RadioGroupProps) {
  const errorId = error ? `${name}-error` : undefined;
  return (
    <fieldset
      aria-describedby={errorId}
      disabled={disabled}
      className={cx("flex flex-col gap-2", className)}
    >
      <legend className="mb-2 text-small font-medium text-text">{legend}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={cx(
            "flex min-h-11 items-center gap-3 text-body",
            disabled ? "cursor-not-allowed text-text-muted" : "cursor-pointer text-text",
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            defaultChecked={value === option.value}
            required={required}
            className="size-5 shrink-0 accent-accent"
          />
          {option.label}
        </label>
      ))}
      {error && errorId ? <FieldError id={errorId}>{error}</FieldError> : null}
    </fieldset>
  );
}
