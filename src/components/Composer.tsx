import { useRef, useState } from "react";

type SpeechResultEvent = Event & {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const CHIPS = [
  { label: "Data ခဏခဏကုန်တယ်", value: "ဒီလ data ခဏခဏကုန်နေလို့ ဘာ package သုံးသင့်လဲ?" },
  { label: "ဖုန်းမိနစ် မလုံဘူး", value: "ဖုန်းခေါ် မိနစ် မလုံဘူး၊ ဘာလုပ်သင့်လဲ?" },
  { label: "SIM ပျောက်သွားတယ်", value: "SIM ကတ် ပျောက်သွားတယ်၊ ဘာလုပ်ရမလဲ?" },
  { label: "ငွေဖြတ်တာ စစ်ချင်တယ်", value: "ငွေဖြတ်ထားတာ မရှင်းလို့ ဘေလ်စစ်ချင်တယ်" },
];

type Props = {
  message: string;
  customerName: string;
  onMessageChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
};

export function Composer({
  message,
  customerName,
  onMessageChange,
  onSubmit,
  disabled,
}: Props) {
  const [listening, setListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const Recognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceStatus(
        "ဒီ browser မှာ အသံဖြင့်မေးခြင်း မရသေးပါ။ စာရိုက်ပြီး ဆက်မေးနိုင်ပါတယ်။",
      );
      return;
    }

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = "my-MM";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index]?.[0]?.transcript ?? "";
      }
      if (transcript.trim()) onMessageChange(transcript.trim());
    };
    recognition.onerror = () => {
      setVoiceStatus(
        "အသံကို မသိနိုင်သေးပါ။ ထပ်ပြောပါ သို့မဟုတ် စာရိုက်ပြီး မေးနိုင်ပါတယ်။",
      );
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      setVoiceStatus("အသံကို စာအဖြစ် ပြောင်းပေးထားပါတယ်။ စစ်ပြီး ပို့နိုင်ပါပြီ။");
    };

    try {
      setVoiceStatus("မြန်မာလို ပြောပါ…");
      setListening(true);
      recognition.start();
    } catch {
      setListening(false);
      setVoiceStatus("မိုက်ခရိုဖုန်း မဖွင့်နိုင်ပါ။ စာရိုက်ပြီး ဆက်မေးနိုင်ပါတယ်။");
    }
  };

  return (
    <section className="panel composer-panel" aria-labelledby="question-heading">
      <div className="section-heading">
        <div>
          <p className="step-label">ASK ATOM</p>
          <h2 id="question-heading">ဘာသိချင်လဲ၊ {customerName}?</h2>
        </div>
        <span className="ai-badge"><i /> AI + rules</span>
      </div>
      <div className="chips" aria-label="မေးခွန်း နမူနာများ">
        {CHIPS.map((chip) => (
          <button
            key={chip.value}
            type="button"
            className="chip"
            onClick={() => onMessageChange(chip.value)}
          >
            {chip.label}
          </button>
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <label htmlFor="customer-question">မြန်မာလို လွတ်လပ်စွာ မေးနိုင်ပါတယ်</label>
        <div className="composer-field">
          <textarea
            id="customer-question"
            value={message}
            onChange={(event) => onMessageChange(event.target.value)}
            rows={3}
            lang="my"
            maxLength={500}
            placeholder="ဥပမာ — ဒီလ data ဘာလို့ မြန်မြန်ကုန်တာလဲ?"
          />
          <button
            className={listening ? "voice-button listening" : "voice-button"}
            type="button"
            onClick={toggleVoice}
            disabled={disabled}
            aria-pressed={listening}
          >
            <span aria-hidden="true">{listening ? "■" : "●"}</span>
            {listening ? "ရပ်မည်" : "အသံဖြင့် မေးမည်"}
          </button>
          <span className="char-count">{message.length}/500</span>
        </div>
        {voiceStatus ? (
          <p className="voice-status" role="status" aria-live="polite">
            {voiceStatus}
          </p>
        ) : null}
        <button
          className="primary"
          type="submit"
          disabled={disabled || message.trim().length === 0}
        >
          <span>သင့်အတွက် အကြံရယူမည်</span>
          <span aria-hidden="true">→</span>
        </button>
      </form>
      <p className="privacy-note">ကိုယ်ရေးအချက်အလက် မထည့်ပါနှင့် · Demo မေးခွန်းများသာ</p>
    </section>
  );
}
