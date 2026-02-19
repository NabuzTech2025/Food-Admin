import LoginForm from "@/components/Forms/LoginForm";
import WaveBackground from "@/components/WaveBackground";

function Login() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <WaveBackground />

      <LoginForm />
    </div>
  );
}

export default Login;
