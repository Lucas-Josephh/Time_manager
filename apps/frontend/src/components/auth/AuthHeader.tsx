import Image from 'next/image';

type AuthHeaderProps = {
  title: string;
  subtitle: string;
};

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <header className="auth-header">
      <Image src="/tempoo_icon.png" alt="Tempoo logo" width={74} height={74} />
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}
