/** @format */
"use client";

import React, { useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import Link from "next/link";

import Web3Provider from "@/components/Web3Provider";
import WalletConnector from "@/components/WalletConnector";

export default function Navbar() {
  // State to manage the navbar's visibility
  const [nav, setNav] = useState(false);

  // Toggle function to handle the navbar's display
  const handleNav = () => {
    setNav(!nav);
  };

  // Array containing navigation items
  const navItems = [
    { id: 1, text: "Home", redirect: "/" },
    { id: 2, text: "Roadmap", redirect: "/roadmap" },
    { id: 3, text: "Community", redirect: "/community" },
    { id: 4, text: "Play", redirect: "/play" },
  ];
  return (
    <Web3Provider>
      <nav className="bg-[#639b56] fixed justify-end items-center max-w-[100vw] text-white md:justify-center z-30 left-0 right-0">
        {/* Desktop Navigation */}
        <div className="hidden md:flex min-w-w-screen gap-24 justify-between items-center px-4">
          <ul className="hidden md:flex gap-24 justify-between items-center">
            {navItems.map((item) => (
              <li
                key={item.id}
                className="p-4 rounded-xl m-2 cursor-pointer duration-300 hover:text-[#96b669]"
              >
                <Link href={item.redirect}>{item.text}</Link>
              </li>
            ))}
          </ul>
          <WalletConnector />
        </div>

        {/* Mobile Navigation Icon */}
        <div
          onClick={handleNav}
          className="flex md:hidden m-2 p-4 justify-end min-w-screen"
        >
          {nav ? <AiOutlineClose size={25} /> : <AiOutlineMenu size={25} />}
        </div>

        {/* Mobile Navigation Menu */}
        <ul
          className={
            nav
              ? "fixed md:hidden left-0 top-0 w-[60%] h-full bg-white ease-in-out duration-500"
              : "ease-in-out w-[60%] duration-500 fixed top-0 bottom-0 left-[-100%]"
          }
        >
          {/* Mobile Logo */}
          <h1 className="w-full text-3xl font-bold text-dark my-8 mx-4">
            Menu
          </h1>

          {/* Mobile Navigation Items */}
          {navItems.map((item) => (
            <li
              key={item.id}
              className="px-4 text-dark hover:bg-[#96b669] duration-300 hover:text-white cursor-pointer flex"
            >
              <Link className="w-[100%] h-[100%] py-4" href={item.redirect}>
                {item.text}
              </Link>
            </li>
          ))}
          <WalletConnector />
        </ul>
      </nav>
    </Web3Provider>
  );
}
