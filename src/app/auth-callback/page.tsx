"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

const Page = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useKindeBrowserClient();
  const searchParams = new URLSearchParams(window.location.search);
  const origin = searchParams.get("origin");

  const { data, error } = trpc.authCallback.useQuery(undefined, {
    onSuccess: ({ success }) => {
      if (success) {
        router.push(origin ? `/${origin}` : "/dashboard");
      }
    },
  });

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/api/auth/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (error?.data?.code === "UNAUTHORIZED") {
    router.push("/api/auth/login");
  }

  if (isLoading) {
    return (
      <div className="w-full mt-24 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
          <h3 className="font-semibold text-xl">Checking your account...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        {data?.success && (
          <>
            <h3 className="font-semibold text-xl">Account Verified!</h3>
            <p>You will be automatically redirected</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
