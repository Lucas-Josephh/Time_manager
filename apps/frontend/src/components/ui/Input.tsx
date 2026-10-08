import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type InputProps = ComponentPropsWithoutRef<'input'> & {
  label: string;
  icon?: ReactNode;
};

export default function Input({
  label,
  icon,
  className,
  ...props
}: InputProps) {
  return (
    <div className="input-field">
      <label>{label}</label>
      <div className="input-wrapper">
        {icon && (
          <span className="input-icon">
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
    </div>
  );
}
