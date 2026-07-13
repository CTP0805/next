export default function LocationSection() {
  return (
    <section
      id="location"
      className="scroll-mt-36 border-b border-[#ECEFF0] pt-12"
    >
      <h4>集合地點</h4>
      <p className="p-text-14 mt-4 leading-7 text-[#687076]">
        巴黎地鐵 1 號線 Saint-Paul 站 1 號出口。嚮導會拿著 meet locals
        水綠色帆布袋等候。
      </p>

      <div className="relative mt-5 mb-10 h-[320px] overflow-hidden rounded-lg border border-[#DDE3E5] bg-[#F0F1EB]">
        <div className="absolute inset-0 [background-image:linear-gradient(28deg,transparent_46%,white_47%,white_51%,transparent_52%),linear-gradient(-35deg,transparent_45%,#DCE6EA_46%,#DCE6EA_52%,transparent_53%),linear-gradient(90deg,transparent_47%,white_48%,white_52%,transparent_53%)] [background-size:150px_120px,210px_170px,110px_100px] opacity-80" />
        <div className="absolute bottom-0 left-0 h-20 w-full bg-[#C7E5ED]" />
        <div className="absolute top-[47%] left-[52%] -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="mx-auto block size-5 rounded-full border-4 border-white bg-[#EF5963] shadow-md" />
          <span className="mt-2 block rounded bg-[#EF5963] px-3 py-1.5 text-[12px] font-extrabold text-white shadow">
            MEETING POINT
          </span>
        </div>
        <span className="absolute top-[61%] left-[43%] rounded bg-white/90 px-2 py-1 text-[14px] font-extrabold text-[#555D62]">
          Saint-Paul
        </span>
      </div>
    </section>
  );
}
