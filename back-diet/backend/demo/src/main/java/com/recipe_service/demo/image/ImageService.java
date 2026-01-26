package com.recipe_service.demo.image;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.http.Method;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
public class ImageService {

    private static final Logger logger = LoggerFactory.getLogger(ImageService.class);

    @Autowired
    private MinioClient minioClient;

    @Value("${r2.bucketName}")
    private String bucketName;

    public String uploadImage(MultipartFile file, String fileName) throws Exception {
        logger.info("🚀 Uploading to MinIO/R2: {}", fileName);
        
        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            logger.info("✅ File uploaded to MinIO/R2");
            return getImageUrl(fileName);
        } catch (Exception e) {
            logger.error("❌ Error uploading file: {}", e.getMessage());
            throw e;
        }
    }

    public String getImageUrl(String fileName) throws Exception {
        logger.info("Getting presigned URL for: {}", fileName);
        
        try {
            String url = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(fileName)
                            .build()
            );

            logger.info("✅ Presigned URL: {}", url);
            return url;
        } catch (Exception e) {
            logger.error("❌ Error getting presigned URL: {}", e.getMessage());
            throw e;
        }
    }
}
