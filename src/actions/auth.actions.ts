"use server";

import { prisma } from "@/db/prisma";
import bcrypt from "bcryptjs";
import { signAuthToken, setAuthCookie, removeAuthCookie } from "@/lib/auth";

type ResponseResult = {
    success: boolean;
    message: string;
}

// Register new user
export async function registerUser(prevState: ResponseResult, formData: FormData): Promise<ResponseResult> {
   try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return {
            success: false,
            message: "All fields are required"
        }
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
        return {
            success: true,
            message: "User already exists"
        }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    });

    // Sign and set auth token
    const token = await signAuthToken({ userId: user.id });

    await setAuthCookie(token);

    return {
        success: true,
        message: "User successfully registered"
    }
   } catch (error) {
        console.log(error as Error);
        return {
            success: false,
            message: "Something went wrong, please try again"
        }
   }
}

// Log user out and remove auth cookie
export async function logoutUser(): Promise<{
    success: boolean;
    message: string
}> {
    try {
        await removeAuthCookie();

        return {
            success: true,
            message: 'Logout Successful'
        }
    } catch (error) {
        console.log(error as Error)

        return {
            success: false,
            message: 'Logout failed. Please try again.'
        }
    }
}

// Log user in
export async function loginUser(prevState: ResponseResult, formData: FormData):Promise<ResponseResult> {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            return {
                success: false,
                message: 'Email and password are required'
            }
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || !user.password) {
            return {
                success: false,
                message: 'Invalid email or password'
            }
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return {
                success: false,
                message: 'Invalid email or password'
            }
        }

        const token = await signAuthToken({ userId: user.id });
        await setAuthCookie(token);

        return {
            success: true,
            message: "Login successful"
        }
    } catch (error) {
        console.log(error as Error)

        return {
            success: false,
            message: "Error during login"
        }
    }
}