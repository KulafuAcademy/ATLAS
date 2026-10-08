export const mobileHardwareCopy = {
  en: {
    hardwareTest: "Hardware test",
    title: "Check your audio",
    description:
      "Make sure your phone's speaker and microphone are working before starting training.",

    speakerSection: "1 · Speaker",
    speakerTitle: "Test your speaker",
    speakerDescription:
      "Turn up your phone's volume, then press the button to play a short melody.",
    androidVolumeTip:
      "Tip: use the buttons on the side of your phone to raise the media volume too.",
    iosSoundTip:
      "Use the volume buttons on the side of your iPhone. No sound? Make sure silent mode is off (the switch on the side).",
    descriptionIpad:
      "Make sure your iPad's speaker and microphone are working before starting training.",
    speakerDescriptionIpad:
      "Turn up your iPad's volume, then press the button to play a short melody.",
    ipadSoundTip:
      "Use the volume buttons on the edge of your iPad. No sound? If your iPad has a side switch, make sure it is not set to mute, and check the volume slider in Control Center.",
    volume: "Volume",
    testAudio: "Play test sound",
    playing: "Playing...",
    playingSound: "Playing sound...",
    audioSuccess:
      "Did you hear the sound? If not, raise the volume with the buttons on the side of your phone.",
    audioTestError: "Unable to play the test sound.",

    microphoneSection: "2 · Microphone",
    microphoneTitle: "Test your microphone",
    microphoneDescription:
      "Press the button and speak for 3 seconds. We will play your voice back so you can check it.",
    microphoneDescriptionAdjustable:
      "Press the button and speak for 3 seconds. We will play your voice back so you can check it. You can adjust the input level while it runs.",
    inputLevel: "Input level",
    liveLevel: "Live level",
    checkMicrophone: "Check microphone",
    recording: "Recording...",
    playingBack: "Playing back...",
    playRecordingAgain: "Play recording again",

    recordingMessage: "Recording... speak into your microphone.",
    microphoneWorking: "Microphone is working. Playing back your recording...",
    microphoneLow:
      "Microphone could not detect enough sound. Speak louder or hold the phone closer, then try again. Playing back what was recorded...",
    playbackMessage:
      "Did you hear your voice? If not, raise the volume and try again.",
    playbackError: "Unable to play back the recording.",
    tapToPlay: 'Tap "Play recording again" to hear it.',
    microphoneStartError:
      "The microphone could not be started. Please try again.",
    microphoneUnavailable:
      "This browser can't use the microphone. Open this page in an up-to-date Safari or Chrome.",
    microphoneDeniedIos:
      'Microphone access was denied. In Safari, tap the "aA" icon in the address bar, choose Website Settings, and set Microphone to Allow.',
    microphoneDeniedAndroid:
      "Microphone access was denied. Tap the lock icon in the address bar, open Permissions, and allow Microphone.",
    inAppBrowserWarning: (browser: string) =>
      `You seem to be using an in-app browser. If the microphone does not work, open this page in ${browser}.`,
  },

  ja: {
    hardwareTest: "ハードウェアテスト",
    title: "オーディオを確認",
    description:
      "トレーニングを始める前に、スマートフォンのスピーカーとマイクが正常に動作することを確認してください。",

    speakerSection: "1 · スピーカー",
    speakerTitle: "スピーカーをテスト",
    speakerDescription:
      "スマートフォンの音量を上げて、ボタンを押すと短いメロディーが流れます。",
    androidVolumeTip:
      "ヒント：スマートフォンの側面のボタンでメディア音量も上げてください。",
    iosSoundTip:
      "iPhoneの側面の音量ボタンで音量を調整してください。音が出ない場合は、サイレントモード（側面のスイッチ）がオフになっているか確認してください。",
    descriptionIpad:
      "トレーニングを始める前に、iPadのスピーカーとマイクが正常に動作することを確認してください。",
    speakerDescriptionIpad:
      "iPadの音量を上げて、ボタンを押すと短いメロディーが流れます。",
    ipadSoundTip:
      "iPadの音量ボタンで音量を調整してください。音が出ない場合は、iPadに側面スイッチがある場合はミュートになっていないか確認し、コントロールセンターの音量スライダも確認してください。",
    volume: "音量",
    testAudio: "テスト音を再生",
    playing: "再生中...",
    playingSound: "テスト音を再生中...",
    audioSuccess:
      "音は聞こえましたか？聞こえない場合は、スマートフォンの側面のボタンで音量を上げてください。",
    audioTestError: "テスト音を再生できませんでした。",

    microphoneSection: "2 · マイク",
    microphoneTitle: "マイクをテスト",
    microphoneDescription:
      "ボタンを押して3秒間話してください。録音した声を再生して確認します。",
    microphoneDescriptionAdjustable:
      "ボタンを押して3秒間話してください。録音した声を再生して確認します。テスト中に入力レベルを調整できます。",
    inputLevel: "入力レベル",
    liveLevel: "現在のレベル",
    checkMicrophone: "マイクを確認",
    recording: "録音中...",
    playingBack: "再生中...",
    playRecordingAgain: "録音をもう一度再生",

    recordingMessage: "録音中... マイクに向かって話してください。",
    microphoneWorking:
      "マイクは正常に動作しています。録音した音声を再生します...",
    microphoneLow:
      "マイクで十分な音量を検出できませんでした。もう少し大きな声で話すか、スマートフォンを口に近づけてもう一度試してください。録音した音声を再生します...",
    playbackMessage:
      "自分の声は聞こえましたか？聞こえない場合は、音量を上げてもう一度試してください。",
    playbackError: "録音を再生できませんでした。",
    tapToPlay: "録音を聞くには「録音をもう一度再生」をタップしてください。",
    microphoneStartError:
      "マイクを開始できませんでした。もう一度お試しください。",
    microphoneUnavailable:
      "このブラウザではマイクを使用できません。最新のSafariまたはChromeでこのページを開いてください。",
    microphoneDeniedIos:
      "マイクへのアクセスが拒否されました。Safariのアドレスバーの「ぁあ」アイコンをタップし、「Webサイトの設定」でマイクを「許可」にしてください。",
    microphoneDeniedAndroid:
      "マイクへのアクセスが拒否されました。アドレスバーの鍵アイコンをタップし、「権限」でマイクを許可してください。",
    inAppBrowserWarning: (browser: string) =>
      `アプリ内ブラウザをお使いの可能性があります。マイクが使えない場合は、${browser}でこのページを開いてください。`,
  },
};

export type MobileHardwareCopy = typeof mobileHardwareCopy.en;
