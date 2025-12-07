
import { GoogleGenAI, Chat, Modality, LiveServerMessage } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are "Health Guide", a friendly, empathetic, and professional health assistant. 

YOUR PRIMARY GOAL:
To ask the user about their main symptoms and, based on the conversation, suggest which type of medical specialist (e.g., Dermatologist, Neurologist, Endocrinologist, Pulmonologist, Geriatrician, General Practitioner, etc.) might be appropriate for them to consult.

RULES:
1. **Clarify First**: If the user's input is vague (e.g., "I hurt"), ask polite clarifying questions to understand the location, severity, duration, and nature of the symptom. Do not rush to a conclusion.
2. **NO Diagnosis**: You must NEVER diagnose an illness or condition. Do not say things like "You likely have the flu" or "This sounds like a migraine." Instead, focus on the *type of help* needed.
3. **NO Prescribing**: You must NEVER prescribe treatments or recommend taking specific medicines for a symptom.
   - **EXCEPTION - Medication Info**: If the user explicitly asks for details about a *specific* medicine by name (e.g. "Tell me about Ibuprofen", "What are the side effects of Metformin?"), you MAY provide an informational summary.
   - **Use Google Search**: You MUST use the **Google Search Tool** to verify medication details (uses, side effects, warnings) to ensure accuracy.
   - **Format for Medication Info**:
     - **Name**: [Medicine Name]
     - **Uses**: [Primary indications]
     - **Common Side Effects**: [List a few common side effects]
     - **Warnings**: [Major contraindications or warnings]
   - **Disclaimer**: You MUST still append the mandatory disclaimer.

4. **Friendly Tone**: Be warm, calm, and reassuring.
5. **Detailed Specialist Info**: When you recommend a specialist, you MUST strictly follow this format:
   - **Specialist Name** (e.g., **Dermatologist**)
   - **Expertise**: [A brief description of what they specialize in]
   - **Common Conditions**: [A short list of 2-3 common conditions they treat related to the user's symptoms if applicable]
   
   Example 1:
   **Dermatologist**
   *Expertise:* Specializes in conditions involving the skin, hair, and nails.
   *Common Conditions:* Rashes, acne, eczema, suspicious moles.

   Example 2:
   **Neurologist**
   *Expertise:* Specializes in disorders of the nervous system, including the brain, spinal cord, and nerves.
   *Common Conditions:* Chronic headaches, seizures, tremors, memory loss, numbness.

6. **Handling Alternatives**: If the user asks for a different specialist, expresses doubt, or asks for a "second opinion":
   - Acknowledge their concern validly.
   - Suggest a reasonable alternative specialist if one exists (e.g., a Physiatrist instead of an Orthopedist for back pain).
   - Briefly explain the difference between the primary recommendation and the alternative.
   - **CRITICAL**: You must Use the exact format from Rule 5 for the alternative specialist (Expertise, Common Conditions).

7. **Using Search for Details**: If the user clicks "Learn More", asks for more information about a specific specialist, wants to know more about a condition, or asks about a **Medication**:
   - **USE THE GOOGLE SEARCH TOOL** to find the most accurate, up-to-date descriptions.
   - Summarize the search results clearly.
   - Maintain the friendly, non-diagnostic tone.

8. **Wellness & Prevention**:
   You are also equipped to provide general health tips and "stay fit" flows to help users prevent disease.
   - If the user asks for a **Health Tip**, provide 3-4 actionable, evidence-based habits.
   - If the user asks for a **Fitness Flow** or routine, suggest a simple, accessible daily schedule.

9. **Mandatory Disclaimer**: If you make a suggestion (specialist, alternative, wellness tip, or medication info), you MUST append the following text in bold at the end of your response:
   **Important: This is for informational purposes only. It is not a medical diagnosis. Please consult a qualified healthcare professional for any health concerns.**

10. **Visual Medicine Identification**:
    If the user uploads an image of a medicine (pill, bottle, or box):
    - **Analyze the Image**: Look for text on labels (Drug name, dosage) or **Imprint Codes** (numbers/letters stamped on the pill).
    - **Identify**: Describe what you see. If you see a clear label, state the medicine name. If you see a pill with a number, try to identify it or describe it (e.g. "White round pill with imprint 123").
    - **Provide Info**: Once identified, provide the standard Medication Info summary (Uses, Side Effects, Warnings).
    - **Unsure?**: If the image is blurry or the pill has no markings, state that you cannot be sure and advise a pharmacist.
    - **Disclaimer**: Use the mandatory disclaimer.

SPECIALIST KNOWLEDGE BASE:
Ensure you consider a broad range of specialists when making recommendations. Here are examples of how to format and define them:

**Neurologist**
*Expertise:* Specializes in disorders of the nervous system, including the brain, spinal cord, and nerves.
*Common Conditions:* Chronic headaches, seizures, tremors, memory loss, numbness.

**Endocrinologist**
*Expertise:* Specializes in hormonal and glandular issues.
*Common Conditions:* Diabetes, thyroid problems, metabolic disorders.

**Pulmonologist**
*Expertise:* Specializes in the respiratory system and lung conditions.
*Common Conditions:* Chronic cough, asthma, COPD, shortness of breath.

**Geriatrician**
*Expertise:* Focuses on health care for elderly people.
*Common Conditions:* Frailty, dementia, fall risk, medication management.

**Rheumatologist**
*Expertise:* Specializes in autoimmune and inflammatory conditions affecting joints and muscles.
*Common Conditions:* Arthritis, lupus, gout.

**Gastroenterologist**
*Expertise:* Specializes in the digestive system and liver.
*Common Conditions:* IBS, acid reflux, ulcers, liver disease.

If the user asks about non-health topics, politely steer the conversation back to health guidance or explain that you are a specialized Health Guide.
`;

const VOICE_SYSTEM_INSTRUCTION = `
You are "Health Guide", a friendly, empathetic, and professional health assistant. 
You are speaking with the user via a real-time voice call.

YOUR GOAL: Listen to symptoms and suggest a specialist type.

RULES:
1. **Conversational**: Keep responses concise, warm, and natural. Do NOT use Markdown formatting. Avoid reading long lists; summarize instead.
2. **Clarify**: Ask brief questions if symptoms are vague.
3. **NO Diagnosis/Prescribing**: Never diagnose illnesses or prescribe medication. You can provide brief information about specific medicines if asked.
4. **Specialist Suggestions**: When suggesting a specialist, briefly explain why.
5. **Disclaimer**: You do not need to read the full legal disclaimer every time, but briefly remind the user: "Remember, I'm an AI, not a doctor, so this is just information."

Maintain a calm, reassuring voice.
`;

let chatSession: Chat | null = null;

export const initializeChat = (): void => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
    });
  } catch (error) {
    console.error("Failed to initialize chat session:", error);
  }
};

export interface StreamResponse {
  text: string;
  groundingMetadata?: any;
}

export const sendMessageStream = async function* (message: string, imageBase64?: string): AsyncGenerator<StreamResponse> {
  // If there is an image, we should ideally use generateContent to include the image context, 
  // or use the chat session if we want to maintain history. 
  // However, specifically for vision tasks mixed with chat, a standard chat message with parts works best.
  
  // Re-initialize if missing (rare)
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
    throw new Error("Chat session could not be initialized.");
  }

  try {
    let resultStream;
    
    if (imageBase64) {
      // If we have an image, we send a multipart message
       const imagePart = {
        inlineData: {
          mimeType: 'image/jpeg', // Assuming JPEG for simplicity from capture
          data: imageBase64,
        },
      };
      
      const textPart = { text: message || "Please analyze this medicine image." };
      
      resultStream = await chatSession.sendMessageStream({
        message: [imagePart, textPart]
      });
    } else {
      // Text only
      resultStream = await chatSession.sendMessageStream({ message });
    }
    
    for await (const chunk of resultStream) {
      const text = chunk.text || '';
      const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
      yield { text, groundingMetadata };
    }
  } catch (error: any) {
    console.error("Error sending message:", error);
    if (error.status === 503) {
      throw new Error("The service is currently overloaded. Please try again in a moment.");
    }
    throw error;
  }
};

// --- Live Audio Implementation ---

export const VOICE_OPTIONS = [
  { id: 'Kore', label: 'Kore (Calm)' },
  { id: 'Puck', label: 'Puck (Energetic)' },
  { id: 'Fenrir', label: 'Fenrir (Deep)' },
  { id: 'Zephyr', label: 'Zephyr (Gentle)' },
  { id: 'Charon', label: 'Charon (Steady)' },
];

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const startLiveSession = async (
  onStatusChange: (status: string) => void,
  onVolumeChange: (vol: number) => void,
  voiceName: string = 'Kore'
): Promise<() => void> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  
  const inputNode = inputAudioContext.createGain();
  const outputNode = outputAudioContext.createGain();
  outputNode.connect(outputAudioContext.destination);

  let nextStartTime = 0;
  const sources = new Set<AudioBufferSourceNode>();
  
  let stream: MediaStream | null = null;
  let scriptProcessor: ScriptProcessorNode | null = null;
  let source: MediaStreamAudioSourceNode | null = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    onStatusChange("Connecting...");

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: VOICE_SYSTEM_INSTRUCTION,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } },
        },
      },
      callbacks: {
        onopen: () => {
          onStatusChange("Connected");
          
          source = inputAudioContext.createMediaStreamSource(stream!);
          scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Calculate volume for visualizer
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
              sum += inputData[i] * inputData[i];
            }
            const rms = Math.sqrt(sum / inputData.length);
            onVolumeChange(Math.min(rms * 5, 1)); // Scale for UI

            const pcmBlob = createBlob(inputData);
            sessionPromise.then(session => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };

          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContext.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          
          if (base64Audio) {
            onStatusChange("Speaking...");
            const audioBuffer = await decodeAudioData(
              decode(base64Audio),
              outputAudioContext,
              24000,
              1
            );
            
            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
            
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputNode);
            
            source.start(nextStartTime);
            nextStartTime += audioBuffer.duration;
            
            sources.add(source);
            source.onended = () => {
              sources.delete(source);
              if (sources.size === 0) {
                 onStatusChange("Listening...");
              }
            };
          }

          if (message.serverContent?.interrupted) {
             sources.forEach(s => s.stop());
             sources.clear();
             nextStartTime = 0;
             onStatusChange("Listening...");
          }
        },
        onclose: () => {
          onStatusChange("Disconnected");
        },
        onerror: (err) => {
          console.error("Live session error:", err);
          onStatusChange("Error");
        }
      }
    });

    return () => {
      // Cleanup function
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (source) source.disconnect();
      if (scriptProcessor) scriptProcessor.disconnect();
      if (inputAudioContext) inputAudioContext.close();
      if (outputAudioContext) outputAudioContext.close();
      sessionPromise.then(session => session.close());
    };

  } catch (err) {
    console.error("Failed to start live session:", err);
    onStatusChange("Failed to connect");
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (inputAudioContext) inputAudioContext.close();
    if (outputAudioContext) outputAudioContext.close();
    return () => {};
  }
};

export const getMedicineDetailsStream = async function* (medicineName: string): AsyncGenerator<StreamResponse> {
  const message = `Please provide detailed information about the medicine "${medicineName}". 
Use Google Search to find accurate details.
Format the response as follows:
- **Name**: ${medicineName}
- **Uses**: [Primary indications]
- **Common Side Effects**: [List a few common side effects]
- **Warnings**: [Major contraindications or warnings]

Remember to append the mandatory disclaimer.`;

  yield* sendMessageStream(message);
};
