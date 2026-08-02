type ExperienceNote = {
  title: string;
  content: string;
};

type NotesSectionProps = {
  notes: ExperienceNote[];
};

export default function NotesSection({ notes }: NotesSectionProps) {
  return (
    <section
      id="notes"
      className="scroll-mt-20 border-t border-b border-[#DDE3E5] pt-14 pb-8"
    >
      <h4>注意事項</h4>

      <div className="mt-7 grid grid-cols-2 gap-x-16 gap-y-12 max-sm:grid-cols-1">
        {notes.map((note) => (
          <div
            key={note.title}
            className="grid grid-cols-[28px_minmax(0,1fr)] gap-5"
          >
            <span className="mt-1 grid size-5 place-items-center rounded-full border-2 border-[#68BBC3]">
              <span className="size-3 rounded-full bg-[#68BBC3]" />
            </span>

            <div>
              <p className="text-[16px] font-extrabold text-[#292E33]">
                {note.title}
              </p>
              <p className="mt-4 text-[14px] leading-7 text-[#747C81]">
                {note.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
