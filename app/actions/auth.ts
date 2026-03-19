"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import nodemailer from "nodemailer";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "Email already in use." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === "admin" ? "admin" : "worker",
      },
    });

    // We do not set the session mock here anymore, so they have to login (and get OTP if worker)
    return { success: true, role: user.role };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to connect to database." };
  }
}

async function sendOTP(email: string, otp: string) {
  console.log(`\n\n=== OTP for ${email} is ${otp} ===\n\n`);
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    const info = await transporter.sendMail({
      from: '"Policy App OTP" <no-reply@policyapp.com>',
      to: email,
      subject: "Your OTP for Login",
      text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
    });

    console.log("Message sent to Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (e) {
    console.error("Error sending OTP email", e);
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!email || !password) {
    return { error: "All fields are required." };
  }

  try {
     const user = await prisma.user.findUnique({ where: { email } });
     if (!user) {
       return { error: "Invalid email or password." };
     }

     const valid = await bcrypt.compare(password, user.password);
     if (!valid) {
       return { error: "Invalid email or password." };
     }
     
     if (user.role !== role) {
       return { error: `This account is not mapped to the ${role} role. Please select the correct role.` };
     }

     // if (user.role === "worker") {
     //    // Generate a 6-digit OTP
     //    const otp = Math.floor(100000 + Math.random() * 900000).toString();
     //    // OTP valid for 10 minutes
     //    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
     //    
     //    await prisma.user.update({
     //      where: { id: user.id },
     //      data: { otp, otpExpiry },
     //    });
     //
     //    // Send OTP
     //    await sendOTP(user.email, otp);
     //
     //    return { requiresOTP: true, email: user.email, role: user.role };
     // }

    const cookieStore = await cookies();
    cookieStore.set("session", JSON.stringify({ id: user.id, role: user.role }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return { success: true, role: user.role };
  } catch (error) {
     console.error("Login error:", error);
     return { error: "Failed to connect to database." };
  }
}

export async function verifyOTP(formData: FormData) {
//   const email = formData.get("email") as string;
//   const otp = formData.get("otp") as string;
//   const role = formData.get("role") as string;
// 
//   if (!email || !otp) {
//     return { error: "Email and OTP are required." };
//   }
// 
//   try {
//     const user = await prisma.user.findUnique({ where: { email } });
//     
//     if (!user || user.role !== role) {
//       return { error: "Invalid request." };
//     }
// 
//     if (!user.otp || !user.otpExpiry || new Date() > user.otpExpiry) {
//       return { error: "OTP has expired or is invalid. Please login again." };
//     }
// 
//     if (user.otp !== otp) {
//       return { error: "Incorrect OTP." };
//     }
// 
//     // Clear the OTP fields
//     await prisma.user.update({
//       where: { id: user.id },
//       data: { otp: null, otpExpiry: null },
//     });
// 
//     const cookieStore = await cookies();
//     cookieStore.set("session", JSON.stringify({ id: user.id, role: user.role }), {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       maxAge: 60 * 60 * 24 * 7, // 1 week
//       path: "/",
//     });
// 
//     return { success: true, role: user.role };
//   } catch (error) {
//     console.error("OTP Verification error:", error);
//     return { error: "Failed to connect to database." };
//   }
  return { error: "OTP disabled" };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;
  
  try {
    const session = JSON.parse(sessionCookie.value);
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, name: true, role: true, email: true }
    });
    return user;
  } catch (error) {
    return null;
  }
}
