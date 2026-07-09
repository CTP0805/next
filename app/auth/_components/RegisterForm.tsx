export default function RegisterForm() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    console.log("前端準備送給後端的註冊資料：", data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-center ">建立帳號</h2>

      <div>
        <label className="mb-2 block text-sm">姓名</label>
        <input name="name" className="h-12 w-full rounded-lg border border-white/70 bg-transparent px-4 outline-none" />
      </div>

      <div>
        <label className="mb-2 block text-sm">電子信箱</label>
        <input name="email" type="email" className="h-12 w-full rounded-lg border border-white/70 bg-transparent px-4 outline-none" />
      </div>

      <div>
        <label className="mb-2 block text-sm">密碼</label>
        <input name="password" type="password" className="h-12 w-full rounded-lg border border-white/70 bg-transparent px-4 outline-none" />
      </div>

      <div>
        <label className="mb-2 block text-sm">確認密碼</label>
        <input name="confirmPassword" type="password" className="h-12 w-full rounded-lg border border-white/70 bg-transparent px-4 outline-none" />
      </div>

      <button type="submit" className="h-14 w-full rounded-full bg-lime-200/60 text-2xl font-bold text-white">
        註冊
      </button>

      <p className="text-center text-sm">已有帳號？立即登入</p>
    </form>
  );
}