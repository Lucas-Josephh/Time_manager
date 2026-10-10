import AuthHeader from '@/components/auth/AuthHeader';
import { ConfigProvider, Divider } from 'antd';
import RegisterForm from './RegisterForm';
import Link from 'next/link';
import Button from '../ui/Button';
import { FcGoogle } from 'react-icons/fc';

export default function RegisterView() {
  return (
    <ConfigProvider
      theme={{
        token: {
          lineWidth: 1.5,
          colorSplit: 'var(--color-border)',
        },
      }}
    >
      <main>
        <div className="screen screen--centered">
          <div className="auth-container">
            <AuthHeader
              title="Create employee account"
              subtitle="Enter the employee's details to create their account."
            ></AuthHeader>
            <div className="card">
              <RegisterForm />
              {/* <Divider>
              <span className="surtitre">Or</span>
            </Divider> */}
              {/* <Button variant="secondary" className="full-width">
              <FcGoogle size={16}/>
              Continue with Google
            </Button> */}
            </div>
            <p>
              <Link href="/login">Back to employees</Link>
            </p>
          </div>
        </div>
      </main>
    </ConfigProvider>
  );
}
