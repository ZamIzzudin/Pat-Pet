/** @format */

import Image from "next/image";

import RoadMap from "./roadmap.png";

export default function Market() {
  return (
    <main
      style={{
        backgroundImage: "url('./Jumbotron.png')",
        backgroundSize: "contain",
        backgroundRepeat: "repeat",
      }}
      className="flex min-h-screen flex-col items-center justify-center max-w-[100vw] overflow-hidden text-[#639b56]"
    >
      <div className="bg-white min-h-[80dvh] max-w-[80dvw] text-center p-5 mt-[20dvh] mb-[10dvh] flex items-center justify-center flex">
        <h1 className="text-[60px]">Our Roadmap</h1>
        <Image src={RoadMap} alt="our roadmap" className="w-[70%]" />
      </div>
    </main>
  );
}
