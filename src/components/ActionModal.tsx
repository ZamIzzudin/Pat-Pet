/** @format */

"use client";

import { useState } from "react";
import Image from "next/image";

import { EventBus, GAME_EVENTS } from "@/lib/eventBus";
import { useWeb3 } from "./Web3Provider";

export default function ModalEvent({
  show,
  setShow,
}: {
  show: boolean;
  setShow: any;
}) {
  const { pets } = useWeb3();
  const [activeTab, setActiveTab] = useState("PAT_LIST");
  const [eventBus] = useState(() => EventBus.getInstance());

  return (
    <div
      className={`top-0 left-0 right-0 bottom-0 items-center justify-center bg-[#00000070] ${
        show ? "flex absolute z-[1000]" : " hidden"
      }`}
      onClick={(e) => {
        setShow();
        eventBus.emit(GAME_EVENTS.MODAL_HIDE);
      }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="bg-[#c49a6c] text-white w-[60dvw] h-[70dvh] flex items-center justify-center relative border-[10px] border-[#6b4b5b]"
      >
        <button
          className="absolute top-0 right-0 w-[50px] aspect-square text-[24px] cursor-pointer z-100"
          onClick={() => {
            setShow();
            eventBus.emit(GAME_EVENTS.MODAL_HIDE);
          }}
        >
          x
        </button>
        <div className="flex w-full h-full">
          <aside className="w-[20%] p-3 border-r-[5px] border-[#6b4b5b]">
            <ul className="flex flex-col gap-3">
              <li
                className={`${
                  activeTab === "PAT_LIST" ? "bg-[#6b4b5b]" : "bg-[#92848b]"
                } p-3 cursor-pointer duration-300`}
                onClick={() => setActiveTab("PAT_LIST")}
              >
                PAT LIST
              </li>
              <li
                className={`${
                  activeTab === "VERIFICATION" ? "bg-[#6b4b5b]" : "bg-[#92848b]"
                } p-3 cursor-pointer duration-300`}
                onClick={() => setActiveTab("VERIFICATION")}
              >
                VERIFICATION
              </li>
            </ul>
          </aside>
          <div className="flex-grow flex items-center justify-center">
            <Renderer
              tab={activeTab}
              handler={(tab: string) => setActiveTab(tab)}
              data={pets}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Renderer({
  tab,
  handler,
  data,
}: {
  tab: string;
  handler: (tab: string) => void;
  data: any[];
}) {
  if (tab === "PAT_LIST") {
    return (
      <div className="flex p-3 w-full h-full relative flex-col items-center justify-start gap-3">
        <h1 className="text-[24px]">PAT LIST</h1>
        <div className="flex gap-3 w-full cursor-pointer">
          {data.map((pet: any) => (
            <div className="bg-[#6b4b5b] p-3">
              <Image
                src={pet.stage === "egg" ? pet.egg_url : pet.adult_url}
                alt={pet.name}
                width={100}
                height={100}
              />
              <div className="flex gap-1">
                <span>{pet.name}</span>
                <span className="text-[#eeff82]">({pet.stage})</span>
              </div>
            </div>
          ))}
        </div>

        {/* <pre>{JSON.stringify(data, undefined, 2)}</pre> */}
        <button
          className="absolute bottom-5 right-5 bg-[#6b4b5b] px-5 py-2"
          onClick={() => handler("MINT")}
        >
          MINT
        </button>
      </div>
    );
  }
  if (tab === "VERIFICATION") {
    return (
      <div>
        <h1>VERIFICATION</h1>
      </div>
    );
  }
  if (tab === "MINT") {
    return (
      <div>
        <h1>MINT PAT</h1>
      </div>
    );
  }
}
