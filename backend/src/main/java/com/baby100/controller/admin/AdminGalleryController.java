package com.baby100.controller.admin;

import com.baby100.common.Result;
import com.baby100.model.Gallery;
import com.baby100.model.SystemConfig;
import com.baby100.service.GalleryService;
import com.baby100.service.ConfigService;
import com.baby100.service.SftpService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/gallery")
public class AdminGalleryController {

    @Autowired
    private GalleryService galleryService;

    @Autowired
    private SftpService sftpService;

    @Autowired
    private ConfigService configService;

    // 从配置文件读取上传路径和域名
    @Value("${app.upload.dir:./uploads/}")
    private String uploadDir;

    @Value("${app.upload.domain:/uploads/}")
    private String uploadDomain;

    @GetMapping("/list")
    public Result<IPage<Gallery>> list(@RequestParam(defaultValue = "1") Integer page,
                                       @RequestParam(defaultValue = "20") Integer size,
                                       @RequestParam(required = false) Integer zone) {
        Page<Gallery> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Gallery> wrapper = new LambdaQueryWrapper<Gallery>()
                .orderByDesc(Gallery::getSort)
                .orderByDesc(Gallery::getCreateTime);
        if (zone != null) {
            wrapper.eq(Gallery::getZone, zone);
        }
        return Result.success(galleryService.page(pageParam, wrapper));
    }

    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file,
                                 @RequestParam(value = "zone", required = false, defaultValue = "1") Integer zone) {
        if (file.isEmpty()) return Result.error(1001, "文件为空");

        String fileName = file.getOriginalFilename();
        String suffix = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
        String newName = UUID.randomUUID().toString() + suffix;

        // 判断是否是视频
        boolean isVideo = suffix.endsWith(".mp4") || suffix.endsWith(".mov") || suffix.endsWith(".avi") || suffix.endsWith(".webm");
        String subDir = isVideo ? "videos/" : "images/";
        String category = isVideo ? "video" : "photo";

        try {
            // 构建完整的上传路径
            String fullUploadPath = uploadDir + subDir;
            String remoteFilePath = fullUploadPath; // SFTP远程路径

            // 读取原始文件字节，便于重复使用
            byte[] fileBytes = file.getBytes();

            // 计算文件哈希用于去重
            String fileHash = calculateMd5(fileBytes);

            // 如果已存在相同哈希的图片，直接返回已存在的记录，避免重复上传
            Gallery exist = galleryService.getOne(new LambdaQueryWrapper<Gallery>()
                    .eq(Gallery::getFileHash, fileHash)
                    .last("LIMIT 1"));
            if (exist != null) {
                // 已存在相同图片，直接返回已有的原图地址
                return Result.success(exist.getImageUrl());
            }

            // 为缩略图准备目录
            String thumbSubDir = isVideo ? subDir : subDir + "thumbs/";
            String fullThumbUploadPath = uploadDir + thumbSubDir;
            String remoteThumbPath = fullThumbUploadPath;

            // 如果启用了SFTP，通过SFTP上传到远程服务器
            if (sftpService.isEnabled()) {
                try {
                    // 原图
                    try (InputStream originalIn = new ByteArrayInputStream(fileBytes)) {
                        sftpService.uploadFile(originalIn, remoteFilePath, newName);
                    }

                    // 缩略图（仅图片）
                    String thumbName = newName;
                    if (!isVideo) {
                        thumbName = buildThumbName(newName);
                        byte[] thumbBytes = createThumbnailBytes(fileBytes, 800, 800);
                        try (InputStream thumbIn = new ByteArrayInputStream(thumbBytes)) {
                            sftpService.uploadFile(thumbIn, remoteThumbPath, thumbName);
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    return Result.error(500, "SFTP上传失败: " + e.getMessage());
                }
            } else {
                // 本地文件系统上传（如果Java应用部署在服务器上）
                Path uploadPath = Paths.get(fullUploadPath);

                // 确保目录存在
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                // 保存原图
                File dest = new File(fullUploadPath + newName);
                file.transferTo(dest);

                // 缩略图（仅图片）
                if (!isVideo) {
                    Path thumbPath = Paths.get(fullThumbUploadPath);
                    if (!Files.exists(thumbPath)) {
                        Files.createDirectories(thumbPath);
                    }
                    String thumbName = buildThumbName(newName);
                    byte[] thumbBytes = createThumbnailBytes(fileBytes, 800, 800);
                    File thumbFile = new File(fullThumbUploadPath + thumbName);
                    try (OutputStream os = new FileOutputStream(thumbFile)) {
                        os.write(thumbBytes);
                    }
                }
            }

            // 构建访问URL
            String url;
            String thumbUrl;
            if (uploadDomain.startsWith("http")) {
                // 完整域名
                url = uploadDomain + subDir + newName;
                if (isVideo) {
                    thumbUrl = url;
                } else {
                    String thumbName = buildThumbName(newName);
                    thumbUrl = uploadDomain + thumbSubDir + thumbName;
                }
            } else {
                // 相对路径，需要确保以/开头
                String domain = uploadDomain.endsWith("/") ? uploadDomain : uploadDomain + "/";
                url = domain + subDir + newName;
                if (isVideo) {
                    thumbUrl = url;
                } else {
                    String thumbName = buildThumbName(newName);
                    thumbUrl = domain + thumbSubDir + thumbName;
                }
            }

            // 保存到数据库
            Gallery gallery = new Gallery();
            gallery.setImageUrl(url);
            gallery.setThumbUrl(thumbUrl);
            gallery.setFileHash(fileHash);
            gallery.setCategory(category);
            gallery.setZone(zone);
            gallery.setCreateTime(LocalDateTime.now());
            gallery.setSort(0);
            galleryService.save(gallery);

            return Result.success(url);
        } catch (IOException e) {
            e.printStackTrace();
            return Result.error(500, "上传失败: " + e.getMessage());
        }
    }

    /**
     * 构建缩略图文件名
     */
    private String buildThumbName(String originalName) {
        int dot = originalName.lastIndexOf('.');
        String base = (dot > 0) ? originalName.substring(0, dot) : originalName;
        return base + "_thumb.jpg";
    }

    /**
     * 根据原始图片字节生成缩略图字节（JPEG）
     */
    private byte[] createThumbnailBytes(byte[] originalBytes, int maxWidth, int maxHeight) throws IOException {
        try (ByteArrayInputStream bais = new ByteArrayInputStream(originalBytes)) {
            BufferedImage src = ImageIO.read(bais);
            if (src == null) {
                throw new IOException("无法读取图片数据");
            }

            int width = src.getWidth();
            int height = src.getHeight();

            double ratio = Math.min((double) maxWidth / width, (double) maxHeight / height);
            ratio = Math.min(ratio, 1.0); // 不放大

            int targetWidth = (int) Math.round(width * ratio);
            int targetHeight = (int) Math.round(height * ratio);

            BufferedImage dst = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
            Graphics2D g2 = dst.createGraphics();
            g2.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g2.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2.drawImage(src.getScaledInstance(targetWidth, targetHeight, Image.SCALE_SMOOTH), 0, 0, null);
            g2.dispose();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(dst, "jpg", baos);
            return baos.toByteArray();
        }
    }

    /**
     * 使用 MD5 计算文件哈希
     */
    private String calculateMd5(byte[] data) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(data);
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 algorithm not available", e);
        }
    }

    /**
     * 从 imageUrl 中提取 /uploads/ 之后的相对路径
     * 例如：https://domain/uploads/images/a.jpg -> images/a.jpg
     */
    private String extractRelativePath(String imageUrl) {
        try {
            String path = imageUrl;
            if (imageUrl.startsWith("http")) {
                java.net.URL url = new java.net.URL(imageUrl);
                path = url.getPath();
            }
            int idx = path.indexOf("/uploads/");
            if (idx >= 0) {
                return path.substring(idx + "/uploads/".length());
            }
            // 如果没有 /uploads/，返回 null
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    @PostMapping("/delete")
    public Result<Boolean> delete(@RequestBody Gallery gallery) {
        // TODO: 最好也删除物理文件
        return Result.success(galleryService.removeById(gallery.getId()));
    }

    @PostMapping("/update")
    public Result<Boolean> update(@RequestBody Gallery gallery) {
        if (gallery.getId() == null) {
            return Result.error(2001, "ID不能为空");
        }
        Gallery exist = galleryService.getById(gallery.getId());
        if (exist == null) {
            return Result.error(2001, "图片不存在");
        }
        if (gallery.getZone() != null) {
            exist.setZone(gallery.getZone());
        }
        galleryService.updateById(exist);
        return Result.success(true);
    }

    @PostMapping("/batch-move")
    public Result<Boolean> batchMove(@RequestBody java.util.Map<String, Object> params) {
        @SuppressWarnings("unchecked")
        java.util.List<Integer> ids = (java.util.List<Integer>) params.get("ids");
        Integer zone = (Integer) params.get("zone");
        
        if (ids == null || ids.isEmpty()) {
            return Result.error(2001, "ID列表不能为空");
        }
        if (zone == null || (zone != 1 && zone != 2)) {
            return Result.error(2001, "区域参数无效");
        }
        
        int updated = 0;
        for (Integer id : ids) {
            Gallery gallery = galleryService.getById(id);
            if (gallery != null) {
                gallery.setZone(zone);
                galleryService.updateById(gallery);
                updated++;
            }
        }
        
        return Result.success(true);
    }

    @PostMapping("/batch-delete")
    public Result<Boolean> batchDelete(@RequestBody java.util.Map<String, Object> params) {
        @SuppressWarnings("unchecked")
        java.util.List<Integer> ids = (java.util.List<Integer>) params.get("ids");
        
        if (ids == null || ids.isEmpty()) {
            return Result.error(2001, "ID列表不能为空");
        }
        
        int deleted = 0;
        for (Integer id : ids) {
            if (galleryService.removeById(id)) {
                deleted++;
            }
        }
        
        return Result.success(true);
    }

    /**
     * 置顶/取消置顶
     * @param id 图片ID
     * @param pinned true 表示置顶，false 表示取消置顶
     */
    @PostMapping("/pin")
    public Result<Boolean> pin(@RequestParam Integer id, @RequestParam Boolean pinned) {
        Gallery gallery = galleryService.getById(id);
        if (gallery == null) {
            return Result.error(2001, "图片不存在");
        }

        if (Boolean.TRUE.equals(pinned)) {
            // 找到当前最大的 sort，并在其基础上 +1
            LambdaQueryWrapper<Gallery> wrapper = new LambdaQueryWrapper<>();
            wrapper.orderByDesc(Gallery::getSort).last("LIMIT 1");
            Gallery top = galleryService.getOne(wrapper);
            int nextSort = (top != null && top.getSort() != null ? top.getSort() : 0) + 1;
            gallery.setSort(nextSort);
        } else {
            // 取消置顶
            gallery.setSort(0);
        }

        galleryService.updateById(gallery);
        return Result.success(true);
    }

    /**
     * 设置首页封面图片（宝宝照片）
     */
    @PostMapping("/home-cover")
    public Result<Boolean> setHomeCover(@RequestParam Integer id) {
        Gallery gallery = galleryService.getById(id);
        if (gallery == null) {
            return Result.error(2001, "图片不存在");
        }

        // 使用 ConfigService 保存封面缩略图和原图地址
        upsertConfig("home_cover_thumb", gallery.getThumbUrl() != null ? gallery.getThumbUrl() : gallery.getImageUrl());
        upsertConfig("home_cover_image", gallery.getImageUrl());

        return Result.success(true);
    }

    private void upsertConfig(String key, String value) {
        if (value == null) value = "";
        SystemConfig exist = configService.getOne(new LambdaQueryWrapper<SystemConfig>()
                .eq(SystemConfig::getConfigKey, key));
        if (exist != null) {
            exist.setConfigValue(value);
            configService.updateById(exist);
        } else {
            SystemConfig cfg = new SystemConfig();
            cfg.setConfigKey(key);
            cfg.setConfigValue(value);
            configService.save(cfg);
        }
    }

    /**
     * 一次性脚本：为旧数据补齐缩略图和文件哈希，并删除重复图片
     * 注意：建议只在管理端手动调用一次，执行前请做好数据库和文件备份
     */
    @PostMapping("/migrate-legacy")
    public Result<String> migrateLegacy() {
        int updated = 0;
        int deleted = 0;
        int failed = 0;

        // 用于记录已出现的 hash，避免重复
        java.util.Map<String, Integer> hashOwner = new java.util.HashMap<>();

        for (Gallery g : galleryService.list()) {
            try {
                // 已有 hash 的认为是新数据，跳过
                if (g.getFileHash() != null && !g.getFileHash().isEmpty()) {
                    continue;
                }

                boolean isVideo = "video".equalsIgnoreCase(g.getCategory());
                String imageUrl = g.getImageUrl();
                if (imageUrl == null || imageUrl.isEmpty()) {
                    continue;
                }

                // 从 imageUrl 中提取 /uploads/ 之后的相对路径
                String relativePath = extractRelativePath(imageUrl);
                if (relativePath == null) {
                    continue;
                }

                String fullPath = uploadDir + relativePath;
                File file = new File(fullPath);
                if (!file.exists() || !file.isFile()) {
                    continue;
                }

                byte[] fileBytes = Files.readAllBytes(file.toPath());
                String fileHash = calculateMd5(fileBytes);

                if (hashOwner.containsKey(fileHash)) {
                    // 已存在相同 hash 的记录，删除当前记录
                    galleryService.removeById(g.getId());
                    deleted++;
                    continue;
                }

                hashOwner.put(fileHash, g.getId());
                g.setFileHash(fileHash);

                // 如果是图片且还没有缩略图，则生成缩略图
                if (!isVideo && (g.getThumbUrl() == null || g.getThumbUrl().isEmpty())) {
                    String subDir = "images/";
                    String thumbSubDir = subDir + "thumbs/";

                    // 依据 relativePath 计算缩略图相对路径和文件名
                    int lastSlash = relativePath.lastIndexOf('/');
                    String fileName = lastSlash >= 0 ? relativePath.substring(lastSlash + 1) : relativePath;
                    String thumbName = buildThumbName(fileName);

                    String fullThumbUploadPath = uploadDir + thumbSubDir;
                    Path thumbPath = Paths.get(fullThumbUploadPath);
                    if (!Files.exists(thumbPath)) {
                        Files.createDirectories(thumbPath);
                    }

                    byte[] thumbBytes = createThumbnailBytes(fileBytes, 800, 800);
                    File thumbFile = new File(fullThumbUploadPath + thumbName);
                    try (OutputStream os = new FileOutputStream(thumbFile)) {
                        os.write(thumbBytes);
                    }

                    // 生成缩略图 URL（与上传逻辑保持一致）
                    String thumbUrl;
                    if (uploadDomain.startsWith("http")) {
                        thumbUrl = uploadDomain + thumbSubDir + thumbName;
                    } else {
                        String domain = uploadDomain.endsWith("/") ? uploadDomain : uploadDomain + "/";
                        thumbUrl = domain + thumbSubDir + thumbName;
                    }
                    g.setThumbUrl(thumbUrl);
                } else if (isVideo && (g.getThumbUrl() == null || g.getThumbUrl().isEmpty())) {
                    // 视频直接使用原图 URL 作为缩略图
                    g.setThumbUrl(g.getImageUrl());
                }

                galleryService.updateById(g);
                updated++;
            } catch (Exception e) {
                failed++;
                e.printStackTrace();
            }
        }

        String summary = String.format("migrate done: updated=%d, deleted=%d, failed=%d", updated, deleted, failed);
        return Result.success(summary);
    }
}

