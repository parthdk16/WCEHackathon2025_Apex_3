import { FC, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { auth } from '../Database/FirebaseConfig';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, signInWithPopup, GoogleAuthProvider, updateProfile, onAuthStateChanged } from 'firebase/auth';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export const SignUpForm: FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(""); 
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailExistsError, setEmailExistsError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isOTPBoxVisible, setIsOTPBoxVisible] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [userCode, setUserCode] = useState<string | null>(null);
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard'); // Redirect when a user is signed in
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(""); setPasswordError(""); setEmailExistsError(""); setOtpError("");

    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        setEmailExistsError("This email is already registered. Please log in.");
        return;
      }

      if (!passwordRegex.test(password)) {
        setPasswordError("Password must include at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character.");
        return;
      }

      setIsOTPBoxVisible(true);
      await axios.post('http://localhost:5000/api/send-otp', { email });
      console.log("OTP sent to email");
      startResendTimer();

    } catch (error: any) {
      console.error("Error during sign-up: ", error.message);
      setEmailError("Error during sign-up. Please try again.");
    }
  };

  const handleVerifyOTP = async () => {
    if (userCode?.length !== 6) {
      setOtpError('Please enter a 6-digit OTP.');
      return;
    }
    try {
      // Ensure userCode is a string when sent to the backend
      const userCodeAsInt = parseInt(userCode, 10);
      await axios.post('http://localhost:5000/api/verify-otp', { email, userCode: userCodeAsInt });
      console.log('OTP verified successfully!');
  
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      console.log("User created successfully in Firebase");
  
    } catch (error) {
      if (error.response && error.response.data) {
        setOtpError('Invalid OTP. Please try again.');
      } else {
        setOtpError('An error occurred during OTP verification. Please try again.');
      }
    }
  };
  
  const handleResendOtp = async () => {
    if (resendTimer === 0) {
      try {
        await axios.post('http://localhost:5000/api/send-otp', { email });
        console.log("OTP resent successfully");
        setResendTimer(60);
        startResendTimer();
      } catch (error) {
        console.error("Error resending OTP: ", error);
        setOtpError("Failed to resend OTP. Please try again.");
      }
    }
  };

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setResendTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google Sign-In successful:", result.user);
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error during Google Sign-In:", error.message);
    }
  };

  return (
    <div className="mx-auto max-w-lg sm:max-w-md lg:max-w-sm mt-20 px-4 sm:px-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-5">Create an account</h1>
      </div>
      <form onSubmit={handleSignUp} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="first-name">Name</Label>
          <Input
            id="first-name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="jhon@youremail.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          {emailError && <p className="text-red-500 text-xs">{emailError}</p>}
          {emailExistsError && <p className="text-red-500 text-xs">{emailExistsError}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={isPasswordVisible ? "text" : "password"}
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              type="button"
              className="absolute right-3 top-2"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {passwordError && <p className="text-red-500 text-xs">{passwordError}</p>}
        </div>

        {isOTPBoxVisible && (
          <div className="grid gap-2 ">
            <Label htmlFor="otp" className="m-auto">Enter OTP</Label>
              <div className="space-y-2 m-auto">
                <InputOTP
                  maxLength={6}
                  value={userCode || ""}
                  onChange={(value) => setUserCode(value)}
                >
                  <InputOTPGroup >
                    <InputOTPSlot index={0} className="w-10 h-10 text-lg p-2 border-2 border-gray-300 rounded-md"/>
                    <InputOTPSlot index={1} className="w-10 h-10 text-lg p-2 border-2 border-gray-300 rounded-md"/>
                    <InputOTPSlot index={2} className="w-10 h-10 text-lg p-2 border-2 border-gray-300 rounded-md"/>
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} className="w-10 h-10 text-lg p-2 border-2 border-gray-300 rounded-md"/>
                    <InputOTPSlot index={4} className="w-10 h-10 text-lg p-2 border-2 border-gray-300 rounded-md"/>
                    <InputOTPSlot index={5} className="w-10 h-10 text-lg p-2 border-2 border-gray-300 rounded-md"/>
                  </InputOTPGroup>
                </InputOTP>
              </div>
            {otpError && <p className="text-red-500 text-xs">{otpError}</p>}
            <div className="flex justify-between mt-2">
              <Button type="button" onClick={handleResendOtp} disabled={resendTimer > 0}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
              </Button>
              <Button type="button" onClick={handleVerifyOTP}>
                Verify OTP
              </Button>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full">Sign Up</Button>

        <div>
          <Button onClick={handleGoogleSignIn} variant="outline" className="w-full ">
              <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4 ">
                <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"></path>
              </svg>
              Continue with Google
            </Button>
            <div className="mt-2">
               <p className="text-xs text-gray-500 text-center">
              By clicking continue, you agree to our{' '}
              <a href="#" className="text-gray-500 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-gray-500 underline">
                Privacy Policy
              </a>.
            </p>
            </div>
            <div className="mt-4 text-center text-sm m-auto text-gray-500">
          Already have an account?{" "}
          <br />
          <a onClick={() => navigate('/login')} className="underline cursor-pointer text-black">
            Sign in here!
          </a>
        </div>
        </div>
      </form>
    </div>
  );
};
