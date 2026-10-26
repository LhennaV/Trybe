"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DotsThree, Flag, User } from "@phosphor-icons/react";
import { reportHref } from "@/components/safety/reportHref";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Sheet from "@/components/ui/Sheet";
import SheetAction from "@/components/ui/SheetAction";

// "More" on a post: view the author, or report the post (SAFE-01).
export default function PostMoreMenu({ postId, authorHandle }: { postId: string; authorHandle: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton label="More options" onClick={() => setOpen(true)}>
        <DotsThree size={20} weight="bold" aria-hidden />
      </IconButton>
      <Sheet open={open} onClose={() => setOpen(false)} label="Post options">
        <div className="flex flex-col gap-1.5">
          <SheetAction
            icon={<User size={20} weight="bold" />}
            title={`View @${authorHandle}'s profile`}
            onClick={() => router.push(`/users/${authorHandle}`)}
          />
          <hr className="h-[1.5px] border-0 bg-line" />
          <SheetAction
            danger
            icon={<Flag size={20} weight="bold" />}
            title="Report this post"
            description="Fake, stolen, or unsafe items, or anything that breaks the rules."
            onClick={() => router.push(reportHref("post", authorHandle, `/posts/${postId}`))}
          />
          <Button variant="ghost" fullWidth className="mt-1.5" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </Sheet>
    </>
  );
}
