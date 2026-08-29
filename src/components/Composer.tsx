const CHIPS = [
  "ဒီလ data ခဏခဏကုန်နေလို့ ဘာ package သုံးသင့်လဲ?",
  "ဖုန်းခေါ် မိနစ် မလုံဘူး",
  "SIM ပျောက်သွားတယ်",
];

type Props = {
  message: string;
  onMessageChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
};

export function Composer({
  message,
  onMessageChange,
  onSubmit,
  disabled,
}: Props) {
  return (
    <section className="panel">
      <h2>ဘာလိုချင်လဲ ပြောပါ</h2>
      <div className="chips">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            className="chip"
            onClick={() => onMessageChange(chip)}
          >
            {chip}
          </button>
        ))}
      </div>
      <textarea
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        rows={3}
        lang="my"
      />
      <button
        className="primary"
        type="button"
        disabled={disabled || message.trim().length === 0}
        onClick={onSubmit}
      >
        ကိုယ်ပိုင် အကြံ ရယူမည်
      </button>
    </section>
  );
}
