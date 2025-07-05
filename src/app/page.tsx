/** @format */

import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-white text-[#639b56] flex min-h-screen flex-col items-center justify-center max-w-[100vw] overflow-hidden">
      <div
        className="w-full min-h-[100dvh] flex items-center justify-center flex-col"
        style={{
          backgroundImage: "url('./Jumbotron.png')",
          backgroundSize: "contain",
        }}
      >
        {/* <div className="bg-[white] rounded-full">
          <Image src="/Logo.png" alt="logo" width="300" height="300" />
        </div>
        <h1 className="text-[60px] text-center">
          Keep Your Goals,
          <br /> Keep Your Pets
        </h1> */}
      </div>
      <div></div>
      <h1>Home</h1>
    </main>
  );
}
