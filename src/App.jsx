import { useEffect, useState } from "react";
import "regenerator-runtime";
import "./App.css";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { BsFillMicFill } from "react-icons/bs";
import { ScaleLoader } from "react-spinners";

//for Speech
let speech = new SpeechSynthesisUtterance();

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello Sir!",
      sender: "ChatGPT",
    },
  ]);
  const [loarding, setLoarding] = useState(false);
  const [assistant, setAssistant] = useState(null);

  const { listening, transcript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  // to get Chat GPT responses
  const getResponse = async (messages) => {
    let apiMessages = messages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    //system
    const systemMessage = {
      role: "system",
      content:
        "Keep the reply very short to a paragraph and speak respectfully.",
    };
    //api body define
    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + import.meta.env.VITE_GPT_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((res) => {
        setLoarding(false);
        return res.json();
      })
      .then((data) => {
        setAssistant(data.choices[0].message.content);
        speech.text = data.choices[0].message.content;
        window.speechSynthesis.speak(speech);
        setMessages([
          ...messages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
          },
        ]);
      });
  };
  const startListening = async () => {
    SpeechRecognition.startListening({ language: "en-IN" });
    setAssistant(null);
  };

  useEffect(() => {
    if (!listening && transcript) {
      setLoarding(true);
      const newMessage = {
        message: transcript,
        direction: "outgoing",
        sender: "user",
      };
      const newMessages = [...messages, newMessage];
      setMessages(newMessages);
      getResponse(newMessages);
    }
  }, [transcript, listening]);

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <>
      <div>
        <h3
          style={{
            position: "absolute",
            top: "10px",
            left: "40px",
            textAlign: "center",
          }}
        >
          AI Voice Assistant using ChatGPT
        </h3>
        {!loarding && (
          <>
            <button onClick={startListening}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <BsFillMicFill style={{ fontSize: "30px" }} />
                {listening ? "Listening..." : "Listen"}
              </div>
            </button>
            {transcript && <p>You: {transcript}</p>}
            {assistant && <p>Assistant: {assistant}</p>}
          </>
        )}
      </div>

      <ScaleLoader
        color={"#646cff"}
        loading={loarding}
        size={80}
        speedMultiplier={1}
      />
      <h4
        style={{
          position: "absolute",
          bottom: "30px",
          right: "50px",
          fontWeight: "400",
        }}
      >
        Developed by{" "}
        <a href="https://www.rishabh.com.np/" target="_blank">
          Rishabh
        </a>
      </h4>
    </>
  );
}

export default App;
