"use client";

import { useEffect, useState } from "react";
import { EventBus, GAME_EVENTS } from "@/lib/eventBus";
import { useWeb3 } from "./Web3Provider";
import { PatListTab } from "./ActionTabs/PatListTab";
import { ValidationTab } from "./ActionTabs/ValidationTab";
import { MintTab } from "./ActionTabs/MintTab";
import { MyMilestonesTab } from "./ActionTabs/MyMilestoneTab";

export default function ActionModal({
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
        className="bg-[#c49a6c] text-white w-[80dvw] h-[80dvh] flex items-center justify-center relative border-[10px] border-[#6b4b5b]"
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
          <TabSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex-grow flex items-center justify-center">
            <TabRenderer
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

// Sidebar Component
function TabSidebar({ 
  activeTab, 
  setActiveTab 
}: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void; 
}) {
  const tabs = [
    { id: "PAT_LIST", label: "PAT LIST", icon: "🐾" },
    { id: "MY_MILESTONES", label: "MY MILESTONES", icon: "🎯" },
    { id: "VERIFICATION", label: "VALIDATION", icon: "✅" },
    { id: "MINT", label: "MINT NEW", icon: "✨" },
  ];

  return (
    <aside className="w-[20%] p-3 border-r-[5px] border-[#6b4b5b]">
      <ul className="flex flex-col gap-3">
        {tabs.map((tab) => (
          <li
            key={tab.id}
            className={`${
              activeTab === tab.id ? "bg-[#6b4b5b]" : "bg-[#92848b]"
            } p-3 cursor-pointer duration-300 hover:bg-[#6b4b5b] rounded transition-all`}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{tab.icon}</span>
              <span className="text-sm font-medium">{tab.label}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// Main Tab Renderer
function TabRenderer({
  tab,
  handler,
  data,
}: {
  tab: string;
  handler: (tab: string) => void;
  data: any[];
}) {
  switch (tab) {
    case "PAT_LIST":
      return <PatListTab handler={handler} />;
    case "MY_MILESTONES":
      return <MyMilestonesTab handler={handler} />;
    case "VERIFICATION":
      return <ValidationTab handler={handler} />;
    case "MINT":
      return <MintTab handler={handler} />;
    default:
      return <PatListTab handler={handler} />;
  }
}