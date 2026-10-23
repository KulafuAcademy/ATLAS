import { PageHeader } from "@/components/common/PageHeader";
import { HardwareTest } from "@/components/hardware/HardwareTest";

export default function TestHardwarePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        compact
        eyebrow={{ en: "Hardware check", ja: "機器チェック" }}
        title={{
          en: "Check your speakers and microphone.",
          ja: "スピーカーとマイクを確認しよう。",
        }}
        description={{
          en: "Play a sample sound, then record a few seconds of your voice and listen back before you start practicing.",
          ja: "サンプル音を再生し、数秒間声を録音して聞き返してから練習を始めましょう。",
        }}
      />
      <HardwareTest />
    </div>
  );
}
