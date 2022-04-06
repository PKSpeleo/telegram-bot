interface ContextWithIds {
  from: {
    id: number;
  };
  chat: {
    id: number;
  };
}

interface BotPropertiesWithAdminsAndChatsIds {
  ADMIN_ID: number[];
  SUPPORTED_CHAT_ID: number[];
}

export function extractRights(
  ctx: ContextWithIds,
  botProperties: BotPropertiesWithAdminsAndChatsIds
) {
  const isAdmin = Boolean(
    botProperties.ADMIN_ID?.length && botProperties.ADMIN_ID.includes(ctx.from.id)
  );
  const isSupportedChat = Boolean(
    botProperties.SUPPORTED_CHAT_ID?.length && botProperties.SUPPORTED_CHAT_ID.includes(ctx.chat.id)
  );
  return { isAdmin, isSupportedChat };
}
