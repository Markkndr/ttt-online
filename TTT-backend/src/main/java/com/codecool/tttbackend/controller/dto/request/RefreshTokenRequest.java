package com.codecool.tttbackend.controller.dto.request;

public class RefreshTokenRequest {

    private String refreshToken;

    public void setRefreshToken(String refreshToken){
        this.refreshToken = refreshToken;
    }

    public String getRefreshToken(){
        return refreshToken;
    }
}
