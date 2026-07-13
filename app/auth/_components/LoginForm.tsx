export default function LoginForm() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // 阻止表單重新整理頁面
    event.preventDefault();

    // 用 FormData 取得使用者輸入的資料
    const formData = new FormData(event.currentTarget);

    // 整理成準備送給後端的格式
    const data = {
      account: formData.get("account"),
      password: formData.get("password"),
    };

    // 之後這裡會改成 fetch("/api/login")
    console.log("前端準備送給後端的登入資料：", data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-center text-3xl font-bold">立即登入</h1>

      <div>
        <label className="mb-2 block text-sm">帳號</label>
        <input
          name="account"
          type="text"
          className="h-12 w-full rounded-lg border border-white/70 bg-transparent px-4 outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm">密碼</label>
        <input
          name="password"
          type="password"
          className="h-12 w-full rounded-lg border border-white/70 bg-transparent px-4 outline-none"
        />
      </div>

      <button
        type="submit"
        className="h-14 w-full rounded-full bg-lime-200/60 text-2xl font-bold text-white"
      >
        登入
      </button>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-white/70" />
        <span>or</span>
        <div className="h-px flex-1 bg-white/70" />
      </div>

      <button
        type="button"
        className="h-14 w-full rounded-lg border border-white/70 text-xl font-bold"
      >
        使用 Google 登入
      </button>

      <p className="text-center text-sm">還沒有帳號？立即註冊</p>
    </form>
  );
}