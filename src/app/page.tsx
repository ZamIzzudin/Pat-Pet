/** @format */

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { PawPrint, BadgeDollarSign, Users } from "lucide-react";

export default function Home() {
  const router = useRouter();
  return (
    <main
      style={{
        backgroundImage: "url('./Jumbotron.png')",
        backgroundSize: "contain",
        backgroundRepeat: "repeat",
      }}
      className="bg-white text-[#639b56] flex min-h-screen flex-col items-center justify-center max-w-[100vw] overflow-hidden"
    >
      <div className="w-full min-h-[100dvh] flex items-center justify-center flex-col">
        <div className="bg-white rounded-full p-4 flex">
          <Image src="/LogoPlain.png" alt="logo" width="200" height="200" />
        </div>
        <div>
          <span className="text-[80px] font-bold text-[#96b669]">PAT</span>
          <span className="text-[80px] font-bold text-white">PET</span>
        </div>
        <button className="bg-[#639b56] text-white px-4 py-2 text-[25px]">
          PLAY NOW
        </button>
      </div>
      <div className="w-full min-h-[50dvh] flex items-center justify-center bg-white flex-col gap-10 py-10">
        <h1 className="text-[60px]">Why You'll Love PAT PET</h1>
        <div className="w-full flex text-[#96b669] justify-evenly">
          <div className="w-[30%] flex items-center justify-center flex-col bg-[#96b66930] p-8 gap-5">
            <div className="bg-[#639b56] p-3 rounded-full text-white">
              <PawPrint size={30} />
            </div>
            <h1 className="text-[30px] text-[#639b56]">Emotional bonds</h1>
            <p className="text-center">
              Your virtual pet grows and evolves as you succesfully complete
              your goals. Their happiness is tied to your success!
            </p>
          </div>
          <div className="w-[30%] flex items-center justify-center flex-col bg-[#96b66930] p-8 gap-5 ">
            <div className="bg-[#639b56] p-3 rounded-full text-white">
              <BadgeDollarSign size={30} />
            </div>
            <h1 className="text-[30px] text-[#639b56]">Real Stakes</h1>
            <p className="text-center">
              Put money where your goals are. Staking crypto provides real
              financial motivation to see your goals through to the end.
            </p>
          </div>
          <div className="w-[30%] flex items-center justify-center flex-col bg-[#96b66930] p-8 gap-5">
            <div className="bg-[#639b56] p-3 rounded-full text-white">
              <Users size={30} />
            </div>
            <h1 className="text-[30px] text-[#639b56]">Community Support</h1>
            <p className="text-center">
              Get your progress validated by the community. Share your wins and
              get encouragement from fellow goal-archievers.
            </p>
          </div>
        </div>
      </div>
      <div className="w-full text-white min-h-[40dvh] flex items-center justify-center flex-col">
        <h1 className="text-[60px] font-bold">
          "KEEP YOUR PET, KEEP YOUR GOALS"
        </h1>
      </div>
      <div className="bg-white min-h-[50dvh] flex items-center w-full gap-10 px-10">
        <div className="flex flex-col p-5 gap-5 items-center">
          <span className="bg-[#639b56] text-white w-[50px] aspect-square rounded-full text-center flex justify-center items-center">
            1
          </span>
          <span className="text-[20px] font-semibold text-center">
            Set a goal
          </span>
          <span className="text-center text-[#96b669] text-[14px] px-5">
            Choose category like fitness, learning, or business and define what
            you want to achieve.
          </span>
        </div>
        <div className="flex flex-col p-5 gap-5 items-center">
          <span className="bg-[#639b56] text-white w-[50px] aspect-square rounded-full text-center flex justify-center items-center">
            2
          </span>
          <span className="text-[20px] font-semibold text-center">
            Stake & get pet
          </span>
          <span className="text-center text-[#96b669] text-[14px] px-5">
            Place a crypto on your goal. this determines the rarity of pet egg
            you receive.
          </span>
        </div>
        <div className="flex flex-col p-5 gap-5 items-center">
          <span className="bg-[#639b56] text-white w-[50px] aspect-square rounded-full text-center flex justify-center items-center">
            3
          </span>
          <span className="text-[20px] font-semibold text-center">
            Evolve together
          </span>
          <span className="text-center text-[#96b669] text-[14px] px-5">
            Submit proof of your progress, get validated, and watch your pet
            evolve with every milestone.
          </span>
        </div>
      </div>
      <div className="w-full flex items-center justify-center min-h-[80dvh]">
        <div className="w-[50dvw]">
          <div className="relative min-h-[100px]">
            <Image
              className="absolute top-[-80%] right-[20%] rotate-[-5deg]"
              src="/bat-1.png"
              alt="logo"
              width="200"
              height="200"
            />
            <Image
              className="absolute top-[-70%] right-[40%] rotate-6"
              src="/bat-2.png"
              alt="logo"
              width="200"
              height="200"
            />
            <Image
              className="absolute top-[-70%] right-[60%] rotate-[-20deg]"
              src="/bat-3.png"
              alt="logo"
              width="200"
              height="200"
            />
          </div>
          <div>
            <h1 className="text-[60px] leading-[60px] text-center font-[500] text-white">
              Show Your Collection,
              <br />
              <span className="text-[#639b56]">Show Your Achivement</span>
            </h1>
          </div>
        </div>
      </div>
      <div className="w-full text-white min-h-[20dvh] flex items-center justify-between bg-[#639b56] px-10">
        <div className="p-3 flex flex-col items-center justify-between">
          <Image src="/logomini.png" alt="mini logo" width="100" height="100" />
        </div>
        <div className="flex-grow items-center flex justify-evenly">
          <h1 className="cursor-pointer">Our Roadmap</h1>
          <h1 className="cursor-pointer">Being A Part of Community</h1>
          <h1 className="cursor-pointer">Contact Us</h1>
        </div>
        <div className="items-center flex justify-center gap-3">
          <button
            className="bg-white text-[#639b56] px-4 py-3 text-[20px]"
            onClick={() => router.push("/play")}
          >
            PLAY NOW
          </button>
        </div>
      </div>
    </main>
  );
}
