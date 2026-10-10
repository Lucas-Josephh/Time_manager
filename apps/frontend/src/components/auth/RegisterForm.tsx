'use client';

import Input from '@/components/ui/Input';
import Button from '../ui/Button';
import {
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
import InputError from '../ui/InputError';
import { notification } from 'antd';

const PASSWORD_LENGTH = 4;

export default function RegisterForm() {
  type NotificationType = 'success' | 'info' | 'warning' | 'error';
  type FormErrors = Partial<Record<keyof typeof formData | 'names', string>>;

  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const nextErrors: FormErrors = {};

    if (!formData.lastName.trim() && !formData.firstName.trim()) {
      nextErrors.names = 'Please enter a first name and a last name.';
      isValid = false;
    } else if (!formData.firstName.trim()) {
      nextErrors.firstName = 'Please enter a first name.';
      isValid = false;
    } else if (!formData.lastName.trim()) {
      nextErrors.lastName = 'Please enter a last name.';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = 'Please enter a phone number.';
      isValid = false;
    }

    const email = formData.email.trim();

    if (!email) {
      nextErrors.email = 'Please enter an email.';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Invalid email.';
      isValid = false;
    }

    if (!formData.password) {
      nextErrors.password = 'Please enter a password.';
      isValid = false;
    } else if (formData.password.length < PASSWORD_LENGTH) {
      nextErrors.password = `The password must be at least ${PASSWORD_LENGTH} characters long.`;
      isValid = false;
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm the password.';
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = 'The passwords are not the same.';
      isValid = false;
    }

    setErrors(nextErrors);
    return isValid;
  };

  const [api, contextHolder] = notification.useNotification();

  const openNotificationWithIcon = (type: NotificationType) => {
    api[type]({
      title: 'Notification Title',
      description:
        'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
    });
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      openNotificationWithIcon('error');
      return;
    }

    // Send formData to your registration API here.
  };

  return (
    <form className="form-gap" onSubmit={handleSubmit} noValidate>
      {contextHolder}
      <div className="name-group">
        <div className="name-fields">
          <Input
            id="firstName"
            name="firstName"
            label="First Name"
            type="text"
            placeholder="John"
            icon={<UserOutlined />}
            required
            value={formData.firstName}
            error={errors.firstName}
            onChange={(event) =>
              updateField('firstName', event.currentTarget.value)
            }
            aria-invalid={Boolean(errors.firstName || errors.names)}
            aria-describedby={
              errors.names
                ? 'names-error'
                : errors.firstName
                  ? 'firstName-error'
                  : undefined
            }
          ></Input>
          <Input
            id="lastName"
            name="lastName"
            label="Last Name"
            type="text"
            placeholder="Doe"
            icon={<UserOutlined />}
            required
            value={formData.lastName}
            error={errors.lastName}
            onChange={(event) =>
              updateField('lastName', event.currentTarget.value)
            }
            aria-invalid={Boolean(errors.lastName || errors.names)}
            aria-describedby={
              errors.names
                ? 'names-error'
                : errors.lastName
                  ? 'lastName-error'
                  : undefined
            }
          ></Input>
        </div>
        <InputError message={errors.names} id="names-error" />
      </div>
      <Input
        id="phone"
        name="phone"
        label="Phone"
        type="text"
        placeholder="e.g. 06 12 34 56 78"
        icon={<PhoneOutlined />}
        required
        value={formData.phone}
        error={errors.phone}
        onChange={(event) => updateField('phone', event.currentTarget.value)}
        aria-invalid={Boolean(errors.phone)}
        aria-describedby={errors.phone ? 'phone-error' : undefined}
      ></Input>
      <Input
        id="email"
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon={<MailOutlined />}
        required
        value={formData.email}
        error={errors.email}
        onChange={(event) => updateField('email', event.currentTarget.value)}
        aria-invalid={Boolean(errors.email)}
        aria-describedby={errors.email ? 'email-error' : undefined}
      ></Input>
      <Input
        id="password"
        name="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        icon={<LockOutlined />}
        required
        value={formData.password}
        error={errors.password}
        onChange={(event) => updateField('password', event.currentTarget.value)}
        aria-invalid={Boolean(errors.password)}
        aria-describedby={errors.password ? 'password-error' : undefined}
      ></Input>
      <Input
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        icon={<LockOutlined />}
        required
        value={formData.confirmPassword}
        error={errors.confirmPassword}
        aria-invalid={Boolean(errors.confirmPassword)}
        aria-describedby={
          errors.confirmPassword ? 'confirmPassword-error' : undefined
        }
        onChange={(event) =>
          updateField('confirmPassword', event.currentTarget.value)
        }
      ></Input>
      <Button type="submit" className="full-width">
        Create account
      </Button>
    </form>
  );
}
