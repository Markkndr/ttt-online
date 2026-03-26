package com.codecool.tttbackend.controller.dto.notification.meta;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "metaType")
@JsonSubTypes({
    @JsonSubTypes.Type(value = GameUpdateMeta.class, name = "GAME_UPDATE"),
    @JsonSubTypes.Type(value = FriendRequestMeta.class, name = "FRIEND_REQUEST"),
    @JsonSubTypes.Type(value = ChatMeta.class, name = "CHAT")
})
public interface NotificationMeta {}