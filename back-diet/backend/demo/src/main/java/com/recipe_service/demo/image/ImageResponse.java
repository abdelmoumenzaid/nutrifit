package com.recipe_service.demo.image;

public class ImageResponse {
    private boolean success;
    private String fileName;
    private String url;
    private String message;

    public ImageResponse(boolean success, String fileName, String url, String message) {
        this.success = success;
        this.fileName = fileName;
        this.url = url;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getFileName() {
        return fileName;
    }

    public String getUrl() {
        return url;
    }

    public String getMessage() {
        return message;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
