package com.codecool.tttbackend.controller.dto.notification.meta;

import com.codecool.tttbackend.controller.dto.response.UserInfoDTO;

public record ChatMeta(UserInfoDTO fromUserInfo, String message) {
}
