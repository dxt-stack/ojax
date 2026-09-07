import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get, post } from "../lib/api";
import type { Conversation, Message } from "../lib/types";
import { Icon } from "../lib/icons";
import { timeAgo } from "../lib/format";
import { Empty, PageLoader, useToast } from "../context/ToastContext";
import { Avatar } from "../components/Layout";
import { useAuth } from "../context/AuthContext";

interface ConvDetail {
  conversation: { id: string; listingId?: string | null; listingTitle?: string | null; coverUrl?: string | null };
  messages: Message[];
}

export default function Messages() {
  const { conversationId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [detail, setDetail] = useState<ConvDetail | null>(null);
  const [load, setLoad] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);

  const refreshList = useCallback(() => {
    get<{ conversations: Conversation[] }>("/api/messages/conversations")
      .then((d) => setConvs(d.conversations))
      .catch(() => {});
  }, []);

  const openConv = useCallback((id: string) => {
    get<ConvDetail>(`/api/messages/conversations/${id}`)
      .then((d) => {
        setDetail(d);
        refreshList();
      })
      .catch(() => toast("Couldn't open conversation", "err"));
  }, [refreshList, toast]);

  useEffect(() => {
    refreshList();
    if (conversationId) openConv(conversationId);
    setLoad(false);
  }, [conversationId, openConv, refreshList]);

  // light polling — demo-friendly "realtime"
  useEffect(() => {
    if (conversationId) {
      const t = window.setInterval(() => openConv(conversationId), 6000);
      return () => window.clearInterval(t);
    }
  }, [conversationId, openConv]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.messages.length]);

  const send = async () => {
    const body = text.trim();
    if (!body || !conversationId || sending) return;
    setSending(true);
    setText("");
    try {
      await post(`/api/messages/conversations/${conversationId}/messages`, { body });
      openConv(conversationId);
      refreshList();
    } catch (e: any) {
      toast(e.message || "Couldn't send", "err");
    } finally {
      setSending(false);
    }
  };

  if (load) return <PageLoader />;

  return (
    <div className="container" style={{ maxWidth: 1080 }}>
      <div className="sec-head"><h2>Messages 💬</h2></div>
      <div className="chat-shell">
        <div className="conv-list">
          {convs.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--ink-3)", fontSize: 13.5 }}>
              No conversations yet.
              <div style={{ marginTop: 8 }}>Tap "Message seller" on any item to start one.</div>
            </div>
          ) : (
            convs.map((c) => (
              <button key={c.conversationId} className={`conv ${conversationId === c.conversationId ? "on" : ""}`}
                onClick={() => nav(`/messages/${c.conversationId}`)} style={{ width: "100%", textAlign: "left", border: 0, background: "transparent" }}>
                <Avatar name={c.peer.fullName} url={c.peer.avatarUrl} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="nm">
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.peer.fullName}</span>
                    {c.lastMessage && <span style={{ fontWeight: 400, fontSize: 11, color: "var(--ink-3)" }}>{timeAgo(c.lastMessage.createdAt)}</span>}
                  </div>
                  <div className="tt" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.listingTitle ? <>📦 {c.listingTitle} — </> : null}
                    {c.lastMessage ? (c.lastMessage.senderId === user?.id ? `You: ${c.lastMessage.body}` : c.lastMessage.body) : "Say hi 👋"}
                  </div>
                </div>
                {c.unread > 0 && <span className="dot" style={{ background: "var(--brand)" }} title={`${c.unread} unread`} />}
              </button>
            ))
          )}
        </div>

        <div className="chat-main">
          {!detail ? (
            <Empty icon="chat" title="Pick a conversation" text="Conversations with buyers and sellers live here." />
          ) : (
            <>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", display: "flex", gap: 10, alignItems: "center" }}>
                <b style={{ flex: 1 }}>
                  {detail.conversation.listingTitle ? `Re: ${detail.conversation.listingTitle}` : "Conversation"}
                </b>
                {detail.conversation.listingId && (
                  <a href={`/item/${detail.conversation.listingId}`} className="btn btn-outline btn-sm">View item</a>
                )}
              </div>
              <div className="chat-msgs">
                {detail.messages.length === 0 && (
                  <div style={{ textAlign: "center", color: "var(--ink-3)", fontSize: 13.5, padding: 30 }}>
                    Say hi 👋 — start the conversation
                  </div>
                )}
                {detail.messages.map((m) => {
                  const mine = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`bubble ${mine ? "me" : "them"}`}>
                      {m.body}
                      <div style={{ fontSize: 10, opacity: 0.65, marginTop: 3 }}>
                        {new Date(m.created_at || m.createdAt || "").toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                        {mine && m.read_at ? " · ✓✓ read" : ""}
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
              <form className="chat-composer" onSubmit={(e) => { e.preventDefault(); send(); }}>
                <input
                  className="input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message… (buyers & sellers chat here so trades stay safe)"
                />
                <button className="btn btn-primary" type="submit" disabled={sending || !text.trim()}>
                  <Icon name="send" size={16} /> Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
