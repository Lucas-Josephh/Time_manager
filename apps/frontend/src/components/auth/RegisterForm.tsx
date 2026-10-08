'use client';

import Input from '@/components/ui/Input';
import Button from '../ui/Button';
import { LockOutlined, MailOutlined } from '@ant-design/icons';

export default function RegisterForm() {
  return (
    <form className="form-gap">
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
