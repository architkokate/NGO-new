import BrandPanel from '../components/BrandPanel';
import LoginForm   from '../components/LoginForm';

export default function LoginPage({ onLogin }) {
  return (
    <div className="login-page">
      <BrandPanel
        variant="login"
        subtext="Sign in to continue to your account and access all your personalized tools, insights, and workflows — right where you left off."
      />
      <LoginForm onLogin={onLogin} />
    </div>
  );
}
