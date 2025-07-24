"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { User, Gift, ShoppingBag, BadgePercent, Tag } from "lucide-react";
import Link from "next/link";

const MobileBottomBar = () => {
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white shadow-[0_-1px_6px_rgba(0,0,0,0.05)] border-t border-gray-200 md:hidden">
      <div className="flex justify-around items-center py-3">
        <Link
          href="/products"
          className="flex flex-col items-center text-xs text-[#A00300] gap-1"
        >
          <ShoppingBag className="w-5 h-5" strokeWidth={2} />
          <span className="text-black">Products</span>
        </Link>

        <button
          onClick={() => router.push("https://gift.yuukke.com/")}
          className="flex flex-col items-center text-xs text-[#A00300] gap-1"
        >
          <Gift className="w-5 h-5" strokeWidth={2} />
          <span className="text-black">Gifts</span>
        </button>

        <button
          onClick={() =>
            router.push("https://marketplace.yuukke.com/shop/deal")
          }
          className="flex flex-col items-center text-xs text-[#A00300] gap-1"
        >
          <Tag className="w-5 h-5" strokeWidth={2} />
          <span className="text-black">Offers</span>
        </button>

        <button
          onClick={() =>
            router.push("https://marketplace.yuukke.com/shop/login")
          }
          className="flex flex-col items-center text-xs text-[#A00300] gap-1"
        >
          <User className="w-5 h-5" strokeWidth={2} />
          <span className="text-black">Login</span>
        </button>
      </div>
    </div>
  );
};

export default MobileBottomBar;
