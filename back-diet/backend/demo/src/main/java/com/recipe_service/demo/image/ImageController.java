package com.recipe_service.demo.image;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = {
    "https://front-end-production-0ec7.up.railway.app",
    "https://backend-production-44d4.up.railway.app",
    "http://localhost:4200",
    "http://localhost:39876",
    "http://localhost:3000",
    "http://localhost:8081",
    "file://"
}, 
methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS},
allowCredentials = "true")
public class ImageController {

    private static final Logger logger = LoggerFactory.getLogger(ImageController.class);

    @Autowired
    private ImageService imageService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("fileName") String fileName) {

        logger.info("===== UPLOAD REQUEST STARTED =====");
        logger.info("File name: {}", fileName);
        logger.info("Original filename: {}", file.getOriginalFilename());
        logger.info("File size: {} bytes ({} MB)", file.getSize(), file.getSize() / (1024 * 1024.0));
        logger.info("Content type: {}", file.getContentType());

        try {
            if (file.isEmpty()) {
                logger.warn("❌ File is empty!");
                return ResponseEntity.badRequest()
                        .body(new ImageResponse(false, fileName, null, "File is empty"));
            }

            logger.info("✅ File received, uploading to MinIO/R2...");

            String url = imageService.uploadImage(file, fileName);

            logger.info("✅ Upload successful: {}", url);
            return ResponseEntity.ok(
                    new ImageResponse(true, fileName, url, "Upload successful")
            );

        } catch (Exception e) {
            logger.error("❌ Error during upload: ", e);
            return ResponseEntity.internalServerError()
                    .body(new ImageResponse(false, fileName, null, "Upload failed: " + e.getMessage()));
        }
    }

    @GetMapping("/url/{fileName}")
    public ResponseEntity<?> getImageUrl(@PathVariable String fileName) {
        try {
            logger.info("Getting URL for: {}", fileName);
            String url = imageService.getImageUrl(fileName);
            return ResponseEntity.ok(
                    new ImageResponse(true, fileName, url, "URL retrieved")
            );
        } catch (Exception e) {
            logger.error("Error getting URL: ", e);
            return ResponseEntity.badRequest()
                    .body(new ImageResponse(false, fileName, null, "Error: " + e.getMessage()));
        }
    }
}
