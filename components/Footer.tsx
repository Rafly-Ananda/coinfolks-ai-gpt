import React from "react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="hidden md:flex items-center justify-center border-t border-black">
      <div className="relative flex w-full lg:w-4/5 flex-row items-center justify-end lg:justify-center p-6">
        <Image
          src="/logo_white.png"
          alt="logo"
          width="0"
          height="0"
          sizes="100vw"
          priority={true}
          className="h-auto w-[124px]"
        />

        <div className="absolute flex w-full items-center justify-between pl-10 lg:pl-0">
          <p className="text-sm font-semibold">
            © 2023 CoinFolks - PT Rekan Artha Teknologi.
          </p>
          <div></div>
        </div>
      </div>
    </footer>
  );
}
