import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader, Upload } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { setLoading } from "@/redux/slice/authSlice";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<string>("student");
  const [fileName, setFileName] = useState<string>("");

  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((store: RootState) => store.auth);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      dispatch(setLoading(true));
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("phoneNumber", phoneNumber);
      formData.append("password", password);
      formData.append("role", role);

      const fileInput = document.getElementById(
        "profileImage"
      ) as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append("file", fileInput.files[0]);
      }

      const res = await axios.post(`${USER_API_ENDPOINT}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        navigate("/auth/login");
        toast.success(res.data.message);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "An unexpected error occurred"
        );
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error("Signup Form Error:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create a new account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Fill in your details to sign up
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="grid gap-3">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            id="fullName"
            type="text"
            placeholder="Syphar"
            required
          />
        </div>

        {/* Email */}
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="xshshahab@example.com"
            required
          />
        </div>

        {/* Password */}
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* Phone Number */}
        <div className="grid gap-3">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            id="phone"
            type="tel"
            placeholder="+91 9876543210"
            required
          />
        </div>

        {/* Role + Profile Image side by side */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Role */}
          <div className="grid gap-3">
            <Label>Role</Label>
            <RadioGroup
              value={role}
              onValueChange={setRole}
              className="flex gap-4 mt-1"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student">Student</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="recruiter" id="recruiter" />
                <Label htmlFor="recruiter">Recruiter</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Profile Image Upload */}
          <div className="grid gap-3">
            <Label htmlFor="profileImage">Profile Image</Label>
            <label
              htmlFor="profileImage"
              className="flex items-center gap-2 px-2 border border-gray-300 rounded-md cursor-pointer transition-colors"
            >
              <Upload className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 text-sm truncate">
                {fileName || "Choose a file"}
              </span>
              <Input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="md:col-span-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="h-5 w-5 animate-spin" />
                <span>Registering...</span>
              </div>
            ) : (
              <span>Signup</span>
            )}
          </Button>
        </div>
      </div>

      {/* Login link */}
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link to="/auth/login" className="underline underline-offset-4">
          Login
        </Link>
      </div>
    </form>
  );
}
