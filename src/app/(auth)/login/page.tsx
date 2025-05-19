// src/app/(auth)/login/page.tsx
"use client";

import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      router.push("/tasks"); // Redirect on successful login
    } catch (error: any) {
      // Firebase errors often have a 'code' property like 'auth/user-not-found'
      // Or you can throw the error to be caught by AuthForm
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error("Invalid email or password.");
      }
      throw new Error(error.message || "Login failed. Please try again.");
    }
  };

  return (
    <>
      <AuthForm
        schema={loginSchema}
        onSubmit={handleLogin}
        buttonText="Login"
        fields={[
          { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
          { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
        ]}
        formTitle="Welcome Back!"
      />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Button variant="link" asChild className="p-0 h-auto font-medium text-primary hover:underline">
          <Link href="/signup">Sign up</Link>
        </Button>
      </p>
    </>
  );
}
