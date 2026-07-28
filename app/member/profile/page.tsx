"use client";

import { useEffect, useState } from "react";
import { API_SERVER } from "@/config/api-path";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { HiChevronDown } from "react-icons/hi";
import { useAuth } from "@/contexts/auth-context";

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  gender: string;
  birthday: string;
};

const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, {
        message: "密碼至少需要 8 個字",
      })
      .regex(/[A-Za-z]/, {
        message: "密碼必須包含英文",
      })
      .regex(/\d/, {
        message: "密碼必須包含數字",
      }),
    confirmPassword: z.string().min(1, {
      message: "請再次輸入密碼",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "兩次輸入的密碼不一致",
    path: ["confirmPassword"],
  });

export default function ProfileFormTabs() {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Part1. 基本資料
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [email, setEmail] = useState("");

  const today = new Date().toISOString().split("T")[0]; // 取得今天日期 生日不能是未來日期
  const [date, setDate] = useState<Date | undefined>();

  // 保存「剛從後端取得時」的原始資料，用來判斷使用者有沒有修改
  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(
    null,
  );

  // Part2. 修改密碼
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { logout } = useAuth();

  const router = useRouter();

  // step1-1. 先取得使用者資料
  useEffect(() => {
    const getUserProfile = async () => {
      const response = await fetch(`${API_SERVER}/api/member/profile`, {
        method: "GET",
        credentials: "include",
      });

      // step3. 解析回應
      const result = await response.json();
      console.log(result);

      const profileData: ProfileData = {
        name: result.data.name ?? "",
        email: result.data.email ?? "",
        phone: result.data.phone ?? "",
        gender: result.data.gender ?? "",
        birthday: result.data.birthday ?? "",
      };

      // 填入畫面上的 input
      setName(profileData.name);
      setEmail(profileData.email);
      setPhone(profileData.phone);
      setGender(profileData.gender);
      setBirthday(profileData.birthday);

      // 存到 state 裡，作為「尚未修改」的基準
      setOriginalProfile(profileData);
    };
    getUserProfile();
  }, []);

  // step1-2. 按鈕開關
  // originalProfile 還沒拿到時，先不能儲存。
  // 五個欄位只要其中一個跟原始資料不同，就代表使用者修改過資料。

  const isProfileChanged =
    originalProfile !== null &&
    (name !== originalProfile.name ||
      email !== originalProfile.email ||
      phone !== originalProfile.phone ||
      gender !== originalProfile.gender ||
      birthday !== originalProfile.birthday);

  // step1-3. 前端格式驗證

  // step1-4. fetch [基本資料] 修改到後端

  const handleProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_SERVER}/api/member/profile`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          gender,
          birthday,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message);
        return;
      }

      const profileData: ProfileData = {
        name: result.data.name ?? "",
        email: result.data.email ?? "",
        phone: result.data.phone ?? "",
        gender: result.data.gender ?? "",
        birthday: result.data.birthday ?? "",
      };

      // 填入畫面上的 input
      setName(profileData.name);
      setEmail(profileData.email);
      setPhone(profileData.phone);
      setGender(profileData.gender);
      setBirthday(profileData.birthday);

      // 存到 state 裡，作為「尚未修改」的基準
      setOriginalProfile(profileData);

      toast.success(result.message);
      window.location.reload();
    } catch (error) {
      console.warn(error);
      toast.error("系統發生錯誤，請稍後再試(後端有問題)");
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();

    // step2-1. 前端格式驗證
    const zodResult = changePasswordSchema.safeParse({
      newPassword,
      confirmPassword,
    });

    if (!zodResult.success) {
      if (zodResult.error?.issues?.length) {
        toast.error(zodResult.error.issues[0].message);
        return;
      }
    }

    // step2-2. fetch [修改密碼] 修改到後端
    try {
      const response = await fetch(`${API_SERVER}/api/auth/change-password`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      await logout(false);
      //window.location.reload();

      router.replace("/auth/login");
    } catch (error) {
      console.warn(error);
      toast.error("系統發生錯誤，請稍後再試(後端有問題)");
    }
  };

  return (
    <section className="min-h-screen">
      <div className="min-h-[740px] w-full">
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
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="profile-label">
                  電子信箱{" "}
                  <span className="text-black-500 text-[14px]">
                    (欲修改請洽客服人員)
                  </span>
                </label>
                <input
                  id="email"
                  type="email"
                  className="profile-input cursor-not-allowed bg-gray-100"
                  value={email}
                  disabled
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

              {/* <div className="relative">
                <label htmlFor="gender" className="profile-label">
                  性別
                </label>
                <select
                  name="gender"
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="profile-input h-[45px] w-full appearance-none rounded-[12px] bg-transparent px-5 text-lg text-[16px] transition outline-none placeholder:text-white/40 focus:border-white focus:ring-2 focus:ring-sky-200/30"
                >
                  <option value="">請選擇...</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                  <option value="其他">非二元性別</option>
                </select>
                <HiChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute top-3/4 right-3 size-5 -translate-y-1/2 text-[#737B81]"
                />
              </div> */}

              <div className="relative">
                <label htmlFor="gender" className="profile-label">
                  性別
                </label>
                <select
                  name="gender"
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="select select-bordered h-[45px] min-h-10 rounded-[12px] border border-[#E1E5E7] bg-white pr-10 pl-4 text-[16px]  text-[#454B50] outline-none "
                >
                  <option value="">請選擇...</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                  <option value="其他">非二元性別</option>
                </select>
                
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
                  max={today}
                  onChange={(e) => setBirthday(e.target.value)}
                />
              </div>

              
            </div>
            
          )}

          {activeTab === "password" && (
            <div className="w-full max-w-[352px] space-y-9">
              <div className="relative">
                <label htmlFor="oldPassword" className="profile-label">
                  輸入舊密碼 <span className="text-red-500">*</span>
                </label>
                <input
                  id="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  className="profile-input"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  aria-label="顯示或隱藏密碼"
                  className="absolute top-3/4 right-4 -translate-y-1/2 text-zinc-400 hover:cursor-pointer hover:text-[#68BBC3]"
                >
                  {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <label htmlFor="newPassword" className="profile-label">
                  新密碼 <span className="text-red-500">*</span>
                  <span className="text-black-900 text-[14px]">
                    （ 請輸入8位以上包含英文、數字 ）
                  </span>
                </label>
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  className="profile-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label="顯示或隱藏密碼"
                  className="absolute top-3/4 right-4 -translate-y-1/2 text-zinc-400 hover:cursor-pointer hover:text-[#68BBC3]"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <label htmlFor="confirmPassword" className="profile-label">
                  再次輸入新密碼 <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="profile-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="顯示或隱藏密碼"
                  className="absolute top-3/4 right-4 -translate-y-1/2 text-zinc-400 hover:cursor-pointer hover:text-[#68BBC3]"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="mt-16 border-t border-[#d9d9d9]" />

          {activeTab === "profile" && (
            <div className="mt-11 flex justify-end">
              <button
                type="button"
                className="button-main-2"
                disabled={!isProfileChanged}
                onClick={handleProfile}
              >
                儲存
              </button>
            </div>
          )}

          {activeTab === "password" && (
            <div className="mt-11 flex justify-end">
              <button
                type="button"
                onClick={handlePassword}
                className="button-main-2"
              >
                儲存
              </button>
            </div>
          )}
        </form>
    
      </div>
    </section>
  );
}
