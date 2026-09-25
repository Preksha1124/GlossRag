# Sign2Talk: A Hybrid 3D-CNN-LSTM and Retrieval-Augmented Generation Framework for Contextual Post-Processing and Syntactic Alignment in Continuous Sign Language Translation

A hybrid 3D-CNN-LSTM vision classifier coupled with a Retrieval-Augmented Generation (RAG) correction layer that turns broken, gloss-order sign-language output into grammatically natural spoken sentences.

**Sign2Talk** turns recognized sign-language glosses into natural spoken sentences through a dedicated retrieval-augmented correction stage.
**Why "Sign2Talk":** the name states the actual technical contribution — a *gloss* classifier feeding a *RAG* correction stage — rather than a generic "sign + talk" label. A name search turned up no existing sign-language product, paper, or repo using it, unlike names built around "sign" + "talk"/"translate," which are heavily used already (see Related Work below).

## Related work this project positions against

- CNN-only ASL alphabet/gesture recognizers (IEEE/IJERT "SignTalk" papers, Hand Talk, HandsTalk, Sign Language AI) — recognition without a dedicated grammar-correction stage.
- LLM-wrapper translators (e.g. "SignTalk 2.5") that lean on a general multimodal model's own fluency rather than a purpose-built, evaluable correction module.
- Text-based RAG-for-glossing work (RAG applied to low-resource *text* gloss correction, e.g. Uspanteko/Arapaho glossing, Bangla gloss augmentation) — RAG for grammar correction exists, but applied to text input, not to the output of a real-time video classifier.

Sign2Talk's contribution is the combination: a video-native Conv3D+BiLSTM classifier whose raw gloss output is corrected by a dedicated vector-search RAG layer, evaluated as one pipeline.

## Architecture & Data Flow

```
 ┌────────────┐      30-frame windows      ┌──────────────────────┐
 │  Camera    │  ───────────────────────►  │  FastAPI Server       │
 │ (Web/Mobile)│                            │  Conv3D → TimeDist.   │
 └────────────┘                            │  → BiLSTM classifier  │
       ▲                                    └──────────┬───────────┘
       │                                                │ raw gloss tokens
       │            spoken sentence                     ▼
       │        ┌──────────────────────┐   ┌──────────────────────┐
       └────────┤  Web/Mobile renders  │◄──┤  RAG Engine           │
                │  raw + corrected +   │   │  embed → cosine sim   │
                │  Text-to-Speech      │   │  → nearest gloss chain│
                └──────────────────────┘   └──────────────────────┘
```

1. The client (web or mobile) captures a continuous stream of camera frames.
2. Frames are batched into 30-frame windows and sent to `POST /api/process-sign`.
3. A Conv3D + TimeDistributed + Bidirectional LSTM model classifies the window into raw gloss tokens (e.g. `"YESTERDAY HOSPITAL GO"`).
4. The RAG engine embeds those tokens, runs a cosine-similarity search against a small vector store of known gloss chains, and returns a grammatically correct spoken sentence (e.g. `"I went to the hospital yesterday."`).
5. Both clients display the raw tokens and corrected sentence side by side, and can speak the corrected sentence aloud.

## Phase status

- **Phase 1 (this delivery):** Web dashboard (React + Vite + Tailwind) and mobile app (React Native + TypeScript) are complete, with a live camera pipeline and mock translation data standing in for the backend.
- **Phase 2 (next):** FastAPI server with the Conv3D/BiLSTM model and `/api/process-sign` endpoint.
- **Phase 3 (final):** In-memory RAG vector store (ChromaDB/FAISS) + terminal test suite.

## Running the web client

```bash
cd web-client
npm install
npm run dev
```

Opens at `http://localhost:5173`. Requires a browser with camera + microphone permission prompts enabled (Chrome, Edge, or Firefox recommended for WebRTC + Web Speech API support).

## Running the mobile client

```bash
cd mobile-client
npm install
npx react-native run-ios      # or: npx react-native run-android
```

Requires a configured React Native environment (Xcode for iOS, Android Studio for Android) and `react-native-vision-camera`'s native setup steps (see its docs for `Info.plist` / `AndroidManifest.xml` camera permission entries).

## Design notes

Both clients share one visual language (ink `#1B1F3B`, amber `#F2A93B` for raw signal, mint `#3FB8A6` for corrected output, coral `#E85D4C` for the live indicator) so the product reads as one system across platforms. Raw gloss tokens are rendered in monospace to visually mark them as unprocessed machine output, distinct from the natural-language corrected sentence.
