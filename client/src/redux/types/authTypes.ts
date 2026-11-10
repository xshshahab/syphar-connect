export interface UserProfile {
  profilePhoto: string;
  bio?: string;
  skills?: string[];
  resume?: string;
  resumeOriginalName?: string;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profile: UserProfile;
  role: "student" | "recruiter";
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error?: string;
  allUsers: User[];
}
