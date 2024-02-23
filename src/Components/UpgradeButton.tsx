"use client";
import { ArrowRight, ArrowRightCircle } from "lucide-react";
import { Button } from "./ui/button";
import { trpc } from "@/app/_trpc/client";

const UpgradeButton = () => {
  const { mutate: createStripeSession } = trpc.createStripeSession.useMutation({
    onSuccess: ({ url }) => {
      window.location.href = url ?? "/dashboard/billing";
    },
  });

  return (
    <Button
      onClick={() => createStripeSession()}
      className="w-full  group active:scale-95 transition-transform duration-100"
    >
      Upgrade Now{" "}
      <ArrowRightCircle className="group-hover:translate-x-1 transition ease-in-out duration-300 ml-1.5 h-5 w-5" />
    </Button>
  );
};

export default UpgradeButton;
