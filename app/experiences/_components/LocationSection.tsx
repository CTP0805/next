type LocationSectionProps = {
  meetingPoint: string;
  longitude: number | null;
  latitude: number | null;
};

export default function LocationSection({
  meetingPoint,
  longitude,
  latitude,
}: LocationSectionProps) {
  const hasCoordinates =
    typeof longitude === "number" &&
    typeof latitude === "number" &&
    !Number.isNaN(longitude) &&
    !Number.isNaN(latitude);

  return (
    <section
      id="location"
      className="scroll-mt-20 border-b border-[#ECEFF0] pt-14"
    >
      <h4>集合地點</h4>

      <p className="p-text-14 mt-4 leading-7 text-[#687076]">{meetingPoint}</p>

      <div className="relative mt-5 mb-10 h-[320px] overflow-hidden rounded-lg border border-[#DDE3E5] bg-[#F0F1EB]">
        {hasCoordinates ? (
          <>
            <iframe
              title="集合地點 Google Map"
              src={`https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8 rounded-full bg-[#222] px-4 py-2 text-sm font-extrabold text-white shadow-[0_4px_14px_rgba(0,0,0,0.22)]">
              集合地點
            </div>
          </>
        ) : (
          <div className="grid h-full place-items-center text-sm text-[#687076]">
            尚未提供地圖座標
          </div>
        )}
      </div>
    </section>
  );
}
