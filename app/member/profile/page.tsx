"use client";

import { useState } from "react";

export default function ProfileFormTabs() {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [email, setEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // step1. 前端驗證格式

  // step2. fetch

  // step3. 解析回應

  return (
    <section className="min-h-screen">
      <div className="min-h-[740px] w-full ">
        <div className="border-b border-[#d9d9d9]">
          <div className="flex gap-8">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`px-3 pb-3 text-[18px] ${
                activeTab === "profile"
                  ? "border-b border-[#7fc4cf] text-[#6fb8c4]"
                  : "text-[#d4d4d4]"
              }`}
            >
              基本資料
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("password")}
              className={`px-3 pb-3 text-[18px] ${
                activeTab === "password"
                  ? "border-b border-[#7fc4cf] text-[#6fb8c4]"
                  : "text-[#d4d4d4]"
              }`}
            >
              修改密碼
            </button>
          </div>
        </div>

        <form className="mt-9">
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 gap-x-12 gap-y-9 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="profile-label">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  className="profile-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email" className="profile-label">
                  電子信箱 <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className="profile-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="phone" className="profile-label">
                  手機
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="profile-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="gender" className="profile-label">
                  性別
                </label>
                <input
                  id="gender"
                  type="text"
                  className="profile-input"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="birthday" className="profile-label">
                  生日
                </label>
                <input
                  id="birthday"
                  type="date"
                  className="profile-input"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === "password" && (
            <div className="w-full max-w-[352px] space-y-9">
              <div>
                <label htmlFor="oldPassword" className="profile-label">
                  輸入舊密碼 <span className="text-red-500">*</span>
                </label>
                <input
                  id="oldPassword"
                  type="password"
                  className="profile-input"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="profile-label">
                  新密碼 <span className="text-red-500">*</span>
                </label>
                <input
                  id="newPassword"
                  type="password"
                  className="profile-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="profile-label">
                  再次輸入新密碼 <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="profile-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="mt-16 border-t border-[#d9d9d9]" />

          <div className="mt-11 flex justify-end">
            <button
              type="submit"
              className="rounded-[10px] bg-[#76bdc8] px-7 py-3 text-[20px] text-white hover:bg-[#66adba]"
            >
              儲存
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
