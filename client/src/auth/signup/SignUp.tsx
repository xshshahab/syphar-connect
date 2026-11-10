import AuthLayout from "../AuthLayout";
import { SignupForm } from "./form/SignupForm";

export default function SignUp() {
  return (
    <AuthLayout variant="signup" formWidth="max-w-xl">
      <SignupForm />
    </AuthLayout>
  );
}
