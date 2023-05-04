import React from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function LoginOverlay() {
  return (
    <div className="absolute inset-0">
      <div className="bg-black absolute left-0 right-0 bottom-0 top-0 opacity-80 z-10"></div>
      <div className="absolute h-screen inset-0 flex items-center justify-center flex-col z-20">
        <div className="relative flex items-center justify-center">
          <Image
            src="/login_bg.png"
            alt="login_bg"
            width="0"
            height="0"
            sizes="100vw"
            priority={true}
            className="h-auto min-w-[300px] lg:w-[300px]"
          />
          <Image
            src="/login_title_text.png"
            alt="login_title"
            width="0"
            height="0"
            sizes="100vw"
            priority={true}
            className="h-auto min-w-[224px] lg:w-[224px] absolute"
          />
        </div>
        <div className="bg-white w-[300px] lg:w-[300px] flex flex-col gap-2 items-center justify-center p-5 rounded-b-lg">
          <p className="text-center text-gray-700">
            Kamu perlu masuk untuk melanjutkan
          </p>

          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 px-10 py-2 font-medium text-slate-500 rounded-md shadow-md hover:bg-slate-100 "
          >
            <Image
              src="/google-logo.svg"
              alt="google_logo"
              width="0"
              height="0"
              sizes="100vw"
              className="h-auto w-[20px]"
            />
            <span>Log in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
