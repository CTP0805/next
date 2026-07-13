"use client";

import { useState } from "react";
import MemberLevelRightPanel from "./level";
import MemberLevelDetailDrawer from "./levelcontent";

export default function MemberLevelPage() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  return (
    <div className="w-full min-w-0 max-w-full">
      <MemberLevelRightPanel onOpenDetail={() => setIsDetailOpen(true)} />

      <MemberLevelDetailDrawer
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}
