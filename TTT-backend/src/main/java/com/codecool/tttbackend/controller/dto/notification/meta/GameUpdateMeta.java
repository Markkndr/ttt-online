package com.codecool.tttbackend.controller.dto.notification.meta;

import com.codecool.tttbackend.controller.dto.notification.GameUpdateType;
import com.codecool.tttbackend.controller.dto.response.GameInfoDTO;
import com.codecool.tttbackend.controller.dto.response.UserInfoDTO;

public record GameUpdateMeta(GameUpdateType gameUpdateType, GameInfoDTO gameInfo, UserInfoDTO fromUserInfo) implements NotificationMeta {
}
