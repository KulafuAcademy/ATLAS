import { hardwareCopy } from "./DesktopHardwareTest";

/**
 * Mac text = your existing desktop text + a few Mac / Safari extras.
 * Requires `export const hardwareCopy` in DesktopHardwareTest.tsx.
 */
export const macHardwareCopy = {
  en: {
    ...hardwareCopy.en,

    outputFixedNote:
      "This browser can't choose the speaker. Sound plays through your Mac's current output. To change it, open System Settings › Sound.",
    tapToPlay: 'Click "Play recording again" to hear it.',
    microphoneUnavailable:
      "This browser can't use the microphone. Use an up-to-date Safari, Chrome or Edge on an HTTPS page.",
    microphoneDeniedSafari:
      "Microphone access was denied. In the Safari menu, open Settings › Websites › Microphone and set this site to Allow.",
    microphoneDeniedOther:
      "Microphone access was denied. Click the lock icon in the address bar and allow Microphone. If it still fails, open System Settings › Privacy & Security › Microphone and turn on your browser.",
  },

  ja: {
    ...hardwareCopy.ja,

    outputFixedNote:
      "このブラウザでは出力先を選択できません。Macの現在の出力先から再生されます。変更するには「システム設定」›「サウンド」を開いてください。",
    tapToPlay: "録音を聞くには「録音をもう一度再生」をクリックしてください。",
    microphoneUnavailable:
      "このブラウザではマイクを使用できません。HTTPSのページで、最新のSafari、Chrome、Edgeをお使いください。",
    microphoneDeniedSafari:
      "マイクへのアクセスが拒否されました。Safariのメニューで「設定」›「Webサイト」›「マイク」を開き、このサイトを「許可」にしてください。",
    microphoneDeniedOther:
      "マイクへのアクセスが拒否されました。アドレスバーの鍵アイコンをクリックしてマイクを許可してください。それでも使えない場合は、「システム設定」›「プライバシーとセキュリティ」›「マイク」でブラウザをオンにしてください。",
  },
};

export type MacHardwareCopy = typeof macHardwareCopy.en;
