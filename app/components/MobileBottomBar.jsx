"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { User, Gift, ShoppingBag, BadgePercent } from "lucide-react";

const MobileBottomBar = () => {
  const router = useRouter();

  return (
    <>
      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white shadow-md border-t border-gray-200 md:hidden">
        <div className="flex justify-around items-center py-2">
          <button
            onClick={() =>
              router.push("https://marketplace.yuukke.com/shop/products")
            }
            className="flex flex-col items-center text-sm text-[#A00300]"
          >
            <ShoppingBag className="w-6 h-6 mb-1" strokeWidth={2} />
            Products
          </button>
          <button
            onClick={() => router.push("https://gift.yuukke.com/")}
            className="flex flex-col items-center text-sm text-[#A00300]"
          >
            <Gift className="w-6 h-6 mb-1" strokeWidth={2} />
            Gifts
          </button>
          <button
            onClick={() =>
              router.push("https://marketplace.yuukke.com/shop/deal")
            }
            className="flex flex-col items-center text-sm text-[#A00300]"
          >
            <BadgePercent className="w-6 h-6 mb-1" strokeWidth={2} />
            Offers
          </button>

          <button
            onClick={() =>
              router.push("https://marketplace.yuukke.com/shop/login")
            }
            className="flex flex-col items-center text-sm text-[#A00300]"
          >
            <User className="w-6 h-6 mb-1" strokeWidth={2} />
            Login
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileBottomBar;
