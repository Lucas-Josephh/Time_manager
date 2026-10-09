'use client';

import Input from '@/components/ui/Input';
import Button from '../ui/Button';
import {
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';

export default function RegisterForm() {
  return (
    <form className="form-gap">
      <div className="name-fields">
        <Input
          name="firstName"
          label="First Name"
          type="text"
          placeholder="John"
          icon={<UserOutlined />}
          required
        ></Input>
        <Input
          name="lastName"
          label="Last Name"
          type="text"
          placeholder="Doe"
          icon={<UserOutlined />}
          required
        ></Input>
      </div>
      <Input
        name="phone"
        label="Phone"
        type="text"
        placeholder="e.g. 06 12 34 56 78"
        icon={<PhoneOutlined />}
        required
      ></Input>
      <Input
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon={<MailOutlined />}
        required
      ></Input>
      <Input
        name="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        icon={<LockOutlined />}
        required
      ></Input>
      <Input
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        icon={<LockOutlined />}
        required
      ></Input>
      <Button type="submit" className="full-width">
        Create account
      </Button>
    </form>
  );
}
