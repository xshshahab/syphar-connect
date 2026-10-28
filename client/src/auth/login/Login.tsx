import AuthLayout from "../AuthLayout";
import { LoginForm } from "./form/LoginForm";

export default function Login() {
  return (
    <AuthLayout variant="login">
      <LoginForm />
    </AuthLayout>
  );
}
