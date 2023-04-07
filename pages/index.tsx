import Image from "next/image";
import Head from "next/head";
import TextareaAutosize from "react-textarea-autosize";
import { useState } from "react";
import { ChatGPTMessage } from "../interfaces/interfaces";
import { aiSuggestions } from "../statics/statics";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  const [userInput, setUserInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatGPTMessage[]>([]);

  const getUserInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  const setSuggestion = (v: string) => {
    setUserInput((prev) => prev + " " + v);
  };

  const submitInput = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsLoading(true);
    setUserInput("");
    const payload: ChatGPTMessage[] =
      chatHistory.length > 1
        ? [...chatHistory, { role: "user", content: userInput }]
        : [
            {
              role: "system",
              content:
                "You are a helpful assistant. Additionally you will make small talk",
            },
            { role: "user", content: userInput },
          ];

    setChatHistory([...payload]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation: payload,
        }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      // This data is a ReadableStream
      const data = response.body;
      if (!data) {
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let chatGPTStreamResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        chatGPTStreamResponse += chunkValue;
        setChatHistory((prev) => {
          return [
            ...payload,
            { role: "assistant", content: chatGPTStreamResponse },
          ];
        });
      }
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
    }

    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen w-full flex-col justify-between">
      <Head>
        <title>Coinfolks AI</title>
        <meta property="og:title" content="Coinfolks AI" key="title" />
        <link rel="icon" href="/gpt-avatar.ico" />
      </Head>
      <Navbar />
      <div className="m-5 flex items-center justify-center">
        <div className="flex h-[670px] w-[900px] flex-col items-center justify-between rounded-xl border-2 border-[#D1D5DB] p-5">
          {/* Suggestions & Chat Box Header */}
          <div className="border-b border-[#D1D5DB]">
            <h1 className="text-2xl font-semibold">Tanya Kepada AI</h1>
            <div className="m-2 flex flex-wrap gap-2">
              {aiSuggestions.map((e: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSuggestion(e)}
                  className="rounded-2xl bg-[#fdcf00] px-10 py-1 text-xs font-semibold"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Box Result */}
          <div className="margin-auto my-2 flex h-full w-full flex-col items-start gap-6 overflow-y-scroll p-4">
            {chatHistory.map((e, i: number) => {
              if (e.role === "user")
                return (
                  <div
                    className="flex items-center justify-center gap-4 px-6"
                    key={i}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#a1a1a1] p-2 text-xs font-medium">
                      Y
                    </div>
                    <p>{e.content}</p>
                  </div>
                );

              if (e.role === "assistant")
                return (
                  <div
                    className="flex w-full items-center justify-start gap-4 bg-[#f7f7f8] p-6 shadow-[0_0_10px_rgba(0,0,0,0.10)]"
                    key={i}
                  >
                    <Image
                      src="/gpt-avatar.svg"
                      alt="logo"
                      width="0"
                      height="0"
                      sizes="100vw"
                      priority={true}
                      className="h-auto w-[27px] "
                    />
                    <p>{e.content}</p>
                  </div>
                );
            })}
          </div>

          {/* Chat Box Input */}
          <div className="relative flex w-11/12 items-center justify-center ">
            <TextareaAutosize
              minRows={1}
              maxRows={4}
              className="w-full resize-none rounded-md py-3 pl-3 pr-10 shadow-[0_0_10px_rgba(0,0,0,0.10)] outline-none"
              placeholder="Send a message..."
              value={userInput}
              onChange={getUserInput}
              style={{ resize: "none" }}
            />
            <button
              disabled={isLoading}
              onClick={submitInput}
              type="submit"
              className="absolute right-3 rounded-md p-1 text-gray-500 hover:bg-slate-300"
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 20 20"
                className="h-4 w-4 rotate-90"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
