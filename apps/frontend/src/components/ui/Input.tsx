import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import InputError from './InputError';

type InputProps = ComponentPropsWithoutRef<'input'> & {
  label: string;
  icon?: ReactNode;
  error?: string;
};

export default function Input({
  label,
  icon,
  error,
  className,
  ...props
}: InputProps) {
  return (
    <div className="input-field">
      <label htmlFor={props.id}>
        {label}
        {props.required && (
          <span className="input-required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      <div className="input-wrapper">
        {icon && (
          <span className="input-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          {...props}
          className={['input', icon && 'input--with-icon', className]
            .filter(Boolean)
            .join(' ')}
        />
      </div>
      <InputError
        message={error}
        id={props.id ? `${props.id}-error` : undefined}
      />
    </div>
  );
}
