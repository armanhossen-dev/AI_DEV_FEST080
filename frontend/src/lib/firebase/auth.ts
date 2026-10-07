import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
  getIdToken,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { UserRole } from "@/types";

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return credential.user;
}

export async function registerWithEmail(
  email: string,
  pass: string,
  fullName: string,
  role: UserRole = "investigator"
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(credential.user, {
    displayName: fullName,
  });
  return credential.user;
}

export async function loginWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function getUserBearerToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return await getIdToken(user);
}
