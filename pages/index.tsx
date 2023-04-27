import Image from "next/image";
import Head from "next/head";
import TextareaAutosize from "react-textarea-autosize";
import { useState, useEffect, useRef } from "react";
import { ChatGPTMessage } from "../interfaces/interfaces";
import { aiSuggestions } from "../statics/statics";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoginOverlay from "@/components/LoginOverlay";
import { useSession, signOut } from "next-auth/react";

/**
 * 
  // TODO : 
  ** Find a way to set autoscroll to stop temporarily when user is not at the bottom of the chatbox
  ** Autoscroll broken on smaller device
  ** Fine tuning GPT Model
 */

export default function Home() {
  const { data: session, status } = useSession();
  const [userInput, setUserInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatGPTMessage[]>([]);
  const [firstContact, setFirstContact] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  let dummyScroll = useRef<null | HTMLDivElement>(null);

  const getUserInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  const setSuggestion = (v: string) => {
    setUserInput((prev) => prev + " " + v);
  };

  const submitInput = async () => {
    setIsLoading(true);
    setFirstContact(true);
    setUserInput("");
    const payload: ChatGPTMessage[] =
      chatHistory.length > 1
        ? [...chatHistory, { role: "user", content: userInput }]
        : [
            {
              role: "system",
              content:
                "You are a casual female helpful assistant named Saras, you have expertise in cryptocurrency and WEB 3 space, you can only respond in Indonesian, Additionally you will make small talk",
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
      setFirstContact(false);

      if (!response.ok) {
        throw new Error(response.statusText);
      }

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

  const onTextAreaSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey) {
      return;
    }

    if (e.key === "Enter") {
      submitInput();
      return;
    }
  };

  useEffect(() => {
    if (autoScroll) {
      if (dummyScroll.current) {
        dummyScroll.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }
    }
  }, [chatHistory, autoScroll]);

  return (
    <>
      {status === "loading" ? (
        <div className="w-screen h-screen flex items-center justify-center">
          <Image
            src="/gpt-avatar.svg"
            alt="logo"
            width="0"
            height="0"
            sizes="100vw"
            priority={true}
            className="h-auto w-[27px]"
          />
        </div>
      ) : (
        <main
          className={`relative flex h-screen w-full flex-col justify-between ${
            status !== "authenticated" && "overflow-hidden"
          }`}
        >
          {status !== "authenticated" && <LoginOverlay />}
          <Head>
            <title>Coinfolks AI</title>
            <meta property="og:title" content="Coinfolks AI" key="title" />
            <link rel="icon" href="/gpt-avatar.ico" />
          </Head>
          {/* for development :) */}
          {/* <button onClick={() => signOut()}>Sign out</button> */}
          <Navbar />
          <div className="md:m-5 flex items-center justify-center">
            <div className="flex h-screen w-screen md:h-[670px] md:w-[900px] flex-col items-center justify-between md:rounded-xl border-2 border-[#D1D5DB] md:p-5 pb-5">
              {/* Suggestions & Chat Box Header */}
              <div className="border-b border-[#D1D5DB] hidden md:block ">
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
              <div className="margin-auto my-2 flex h-full w-full flex-col items-start gap-6 overflow-y-auto p-4">
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
                {firstContact && (
                  <div className="relative flex w-full items-center justify-start gap-4 bg-[#f7f7f8] p-6 shadow-[0_0_10px_rgba(0,0,0,0.10)]">
                    <Image
                      src="/gpt-avatar.svg"
                      alt="logo"
                      width="0"
                      height="0"
                      sizes="100vw"
                      priority={true}
                      className="h-auto w-[27px] "
                    />
                    <div className="flex items-center justify-center space-x-1 ">
                      <div className="w-1 h-1 rounded-full animate-pulse bg-slate-400"></div>
                      <div className="w-1 h-1 rounded-full animate-pulse bg-slate-400"></div>
                      <div className="w-1 h-1 rounded-full animate-pulse bg-slate-400"></div>
                    </div>
                  </div>
                )}
                <div ref={dummyScroll}></div>
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
                  onKeyDown={onTextAreaSubmit}
                  disabled={isLoading}
                />
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-1 absolute right-3 rounded-md p-1">
                    <div className="w-1 h-1 rounded-full animate-pulse bg-slate-400"></div>
                    <div className="w-1 h-1 rounded-full animate-pulse bg-slate-400"></div>
                    <div className="w-1 h-1 rounded-full animate-pulse bg-slate-400"></div>
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          </div>
          <Footer />
        </main>
      )}
    </>
  );
}
