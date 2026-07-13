"use client";

import { useState } from "react";
import MemberLevelRightPanel from "./level";
import MemberLevelDetailDrawer from "./levelcontent";

export default function MemberLevelPage() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  return (
    <div className="flex gap-8 p-8">
      <MemberLevelRightPanel onOpenDetail={() => setIsDetailOpen(true)} />

      <MemberLevelDetailDrawer
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}
