// src/app/(auth)/signup/page.tsx
"use client";

import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import type { UserProfile } from "@/lib/types";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as z from "zod";

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path of error
});


export default function SignupPage() {
  const router = useRouter();

  const handleSignup = async (values: z.infer<typeof signupSchema>) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName, // Might be null initially
        photoURL: user.photoURL, // Might be null initially
        themePreference: 'system', // Default theme
      };
      await setDoc(doc(db, "users", user.uid), userProfile);
      
      // Create a default "General" category for the new user
      const generalCategory = {
        userId: user.uid,
        name: "General",
        color: "#808080", // Grey
        icon: "Archive", // A generic icon
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, `users/${user.uid}/categories`, 'general'), generalCategory);


      router.push("/tasks"); // Redirect on successful signup
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("This email address is already in use.");
      }
      throw new Error(error.message || "Signup failed. Please try again.");
    }
  };

  return (
    <>
      <AuthForm
        schema={signupSchema}
        onSubmit={handleSignup}
        buttonText="Create Account"
        fields={[
          { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
          { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
          { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "••••••••" },
        ]}
        formTitle="Create your Account"
      />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Button variant="link" asChild className="p-0 h-auto font-medium text-primary hover:underline">
          <Link href="/login">Log in</Link>
        </Button>
      </p>
    </>
  );
}
